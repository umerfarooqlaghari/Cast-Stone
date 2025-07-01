const Order = require('../models/Order');
const Cart = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendOrderConfirmationEmail, sendPaymentConfirmationEmail } = require('../service/sendMail');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user;
    const { amount, currency = 'usd' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: userId.toString()
      }
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// Create order after successful payment
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user;
    const { 
      paymentIntentId, 
      shippingAddress,
      paymentMethod 
    } = req.body;
    
    if (!paymentIntentId || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and shipping address are required'
      });
    }
    
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Create order
    const order = new Order({
      userId,
      items: cart.items,
      shippingAddress,
      paymentInfo: {
        paymentIntentId,
        paymentMethod: paymentMethod || 'card',
        paymentStatus: 'succeeded',
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        transactionId: paymentIntent.id
      },
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
      status: 'confirmed'
    });
    
    await order.save();
    
    // Clear the cart
    cart.items = [];
    await cart.save();
    
    // Send confirmation emails
    try {
      await sendOrderConfirmationEmail(shippingAddress.email, order);
      await sendPaymentConfirmationEmail(shippingAddress.email, order);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the order creation if email fails
    }
    
    res.json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const { page = 1, limit = 10 } = req.query;
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-paymentInfo.paymentIntentId'); // Don't expose sensitive payment data
    
    const total = await Order.countDocuments({ userId });
    
    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get specific order
exports.getOrder = async (req, res) => {
  try {
    const userId = req.user;
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ 
      orderNumber, 
      userId 
    }).select('-paymentInfo.paymentIntentId');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status, trackingNumber, notes } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;
    
    const order = await Order.findOneAndUpdate(
      { orderNumber },
      updateData,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Handle payment failure
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { paymentIntentId, error } = req.body;
    
    console.error('Payment failed:', {
      paymentIntentId,
      error
    });
    
    // Log the failure for admin review
    // You could also create a failed payment record here
    
    res.json({
      success: true,
      message: 'Payment failure recorded'
    });
  } catch (error) {
    console.error('Handle payment failure error:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling payment failure',
      error: error.message
    });
  }
};
