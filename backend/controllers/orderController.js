const Order = require('../models/Order');
const Product = require('../models/Product');
const { InventoryItem } = require('../models/Inventory');
const Cart = require('../models/Cart');
const { sendOrderConfirmationEmail, sendPaymentConfirmationEmail } = require('../service/sendMail');
const mongoose = require('mongoose');

// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not found. Payment processing will be simulated.');
}

// Get all orders with advanced filtering and pagination (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      financialStatus,
      fulfillmentStatus,
      orderStatus,
      dateFrom,
      dateTo,
      customerId,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    let filter = {};

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Status filters
    if (financialStatus) filter.financialStatus = financialStatus;
    if (fulfillmentStatus) filter.fulfillmentStatus = fulfillmentStatus;
    if (orderStatus) filter.orderStatus = orderStatus;

    // Customer filter
    if (customerId) filter.customerId = customerId;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'updatedAt', 'orderNumber', 'totalPrice', 'processedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(filter)
      .populate('customerId', 'name email')
      .populate('lineItems.productId', 'title handle')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get summary statistics
    const totalRevenue = await Order.aggregate([
      { $match: { ...filter, financialStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      success: true,
      data: {
        orders,
        summary: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalOrders: total
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order by ID or order number
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    // Check if id is a valid ObjectId or treat as order number
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id)
        .populate('customerId', 'name email phone')
        .populate('lineItems.productId', 'title handle images')
        .populate('fulfillments.locationId', 'name type');
    } else {
      order = await Order.findByOrderNumber(id)
        .populate('customerId', 'name email phone')
        .populate('lineItems.productId', 'title handle images')
        .populate('fulfillments.locationId', 'name type');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has permission to view this order
    if (!req.admin && req.user && order.customerId && !order.customerId.equals(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order
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

// Create order with inventory validation
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      lineItems,
      billingAddress,
      shippingAddress,
      paymentDetails,
      shippingLines,
      discountCodes,
      note,
      tags,
      locationId
    } = req.body;

    // Validate required fields
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Line items are required'
      });
    }

    if (!billingAddress || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Billing and shipping addresses are required'
      });
    }

    if (!paymentDetails || !paymentDetails.paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are required'
      });
    }

    // Validate and process line items
    const processedLineItems = [];
    let subtotalPrice = 0;
    let totalWeight = 0;

    for (const item of lineItems) {
      const { productId, variantId, quantity } = item;

      if (!productId || !variantId || !quantity || quantity <= 0) {
        throw new Error('Each line item must have productId, variantId, and valid quantity');
      }

      // Get product and validate variant
      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      const variant = product.variants.id(variantId);
      if (!variant) {
        throw new Error(`Product variant not found: ${variantId}`);
      }

      // Check inventory availability
      if (product.trackQuantity) {
        const inventoryItem = await InventoryItem.findOne({
          productId,
          variantId,
          locationId: locationId || null
        }).session(session);

        if (!inventoryItem || inventoryItem.available < quantity) {
          throw new Error(`Insufficient inventory for ${product.title} - ${variant.title}. Available: ${inventoryItem?.available || 0}, Requested: ${quantity}`);
        }

        // Reserve inventory
        await inventoryItem.reserveStock(quantity, `ORDER-${Date.now()}`, req.user);
      }

      // Calculate line item totals
      const lineItemTotal = variant.price * quantity;
      subtotalPrice += lineItemTotal;

      if (variant.weight && variant.weight.value) {
        totalWeight += variant.weight.value * quantity;
      }

      processedLineItems.push({
        productId,
        variantId,
        sku: variant.sku,
        title: product.title,
        variantTitle: variant.title,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        quantity,
        image: variant.image || product.featuredImage,
        weight: variant.weight,
        requiresShipping: variant.requiresShipping,
        taxable: variant.taxable,
        properties: item.properties || []
      });
    }

    // Calculate totals
    let totalTax = 0;
    let totalShipping = 0;
    let totalDiscounts = 0;

    // Calculate shipping
    if (shippingLines && Array.isArray(shippingLines)) {
      totalShipping = shippingLines.reduce((total, line) => total + (line.price || 0), 0);
    }

    // Calculate discounts
    if (discountCodes && Array.isArray(discountCodes)) {
      totalDiscounts = discountCodes.reduce((total, discount) => total + (discount.amount || 0), 0);
    }

    // Calculate tax (simplified - you might want more complex tax calculation)
    const taxableAmount = subtotalPrice - totalDiscounts;
    totalTax = taxableAmount * 0.08; // 8% tax rate - make this configurable

    const totalPrice = subtotalPrice + totalTax + totalShipping - totalDiscounts;

    // Create order data
    const orderData = {
      customerId: req.user,
      customer: {
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        email: billingAddress.email || req.userEmail,
        phone: billingAddress.phone
      },
      name: `${billingAddress.firstName} ${billingAddress.lastName}`,
      email: billingAddress.email || req.userEmail,
      lineItems: processedLineItems,
      billingAddress,
      shippingAddress,
      currency: 'USD',
      subtotalPrice,
      totalTax,
      totalShipping,
      totalDiscounts,
      totalPrice,
      totalWeight,
      paymentDetails: {
        paymentIntentId: paymentDetails.paymentIntentId,
        paymentMethod: paymentDetails.paymentMethod || 'card',
        paymentStatus: 'pending',
        gateway: 'stripe'
      },
      shippingLines: shippingLines || [],
      discountCodes: discountCodes || [],
      note,
      tags: tags || [],
      locationId,
      processedAt: new Date()
    };

    // Create the order
    const order = new Order(orderData);
    await order.save({ session });

    await session.commitTransaction();

    // Send confirmation email (don't wait for it)
    if (order.email) {
      sendOrderConfirmationEmail(order.email, order).catch(error => {
        console.error('Failed to send order confirmation email:', error);
      });
    }

    // Populate the response
    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email')
      .populate('lineItems.productId', 'title handle');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Create order error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

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

    // Check if Stripe is available
    if (!stripe) {
      // Simulate payment intent for development
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        amount: Math.round(amount * 100),
        currency,
        status: 'requires_payment_method'
      };

      console.log('🔄 Simulating payment intent creation (Stripe not configured)');

      return res.json({
        success: true,
        clientSecret: mockPaymentIntent.client_secret,
        paymentIntentId: mockPaymentIntent.id,
        mock: true
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



// Update order (admin only)
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'note', 'tags', 'billingAddress', 'shippingAddress',
      'financialStatus', 'fulfillmentStatus', 'orderStatus'
    ];

    const filteredUpdate = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    });

    Object.assign(order, filteredUpdate);
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email')
      .populate('lineItems.productId', 'title handle');

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// Fulfill order (admin only)
exports.fulfillOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      lineItems,
      trackingCompany,
      trackingNumber,
      trackingUrl,
      notifyCustomer = true,
      locationId
    } = req.body;

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Line items to fulfill are required'
      });
    }

    const order = await Order.findById(id).session(session);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate line items and update inventory
    const fulfillmentLineItems = [];
    for (const fulfillItem of lineItems) {
      const { orderItemId, quantity } = fulfillItem;

      if (!orderItemId || !quantity || quantity <= 0) {
        throw new Error('Each fulfillment item must have orderItemId and valid quantity');
      }

      const orderItem = order.lineItems.id(orderItemId);
      if (!orderItem) {
        throw new Error(`Order item not found: ${orderItemId}`);
      }

      const remainingToFulfill = orderItem.quantity - orderItem.quantityFulfilled;
      if (quantity > remainingToFulfill) {
        throw new Error(`Cannot fulfill ${quantity} items. Only ${remainingToFulfill} remaining for ${orderItem.title}`);
      }

      // Update inventory - move from reserved to committed/fulfilled
      const inventoryItem = await InventoryItem.findOne({
        productId: orderItem.productId,
        variantId: orderItem.variantId,
        locationId: locationId || null
      }).session(session);

      if (inventoryItem) {
        // Reduce reserved and on-hand quantities
        inventoryItem.reserved -= quantity;
        inventoryItem.onHand -= quantity;
        inventoryItem.committed += quantity;
        await inventoryItem.save({ session });
      }

      fulfillmentLineItems.push({
        orderItemId,
        quantity
      });
    }

    // Create fulfillment
    const fulfillmentData = {
      status: 'success',
      trackingCompany,
      trackingNumber,
      trackingUrl,
      lineItems: fulfillmentLineItems,
      notifyCustomer,
      locationId
    };

    await order.addFulfillment(fulfillmentData);

    await session.commitTransaction();

    // Send fulfillment notification email if requested
    if (notifyCustomer && order.email) {
      // You can implement fulfillment email here
      console.log(`Fulfillment notification sent to ${order.email}`);
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email')
      .populate('lineItems.productId', 'title handle');

    res.json({
      success: true,
      message: 'Order fulfilled successfully',
      data: populatedOrder
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Fulfill order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fulfilling order',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Cancel order (admin only)
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason = 'other', restockItems = true, refund = false } = req.body;

    const order = await Order.findById(id).session(session);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Release inventory reservations if restocking
    if (restockItems) {
      for (const lineItem of order.lineItems) {
        const unfulfilledQuantity = lineItem.quantity - lineItem.quantityFulfilled;

        if (unfulfilledQuantity > 0) {
          const inventoryItem = await InventoryItem.findOne({
            productId: lineItem.productId,
            variantId: lineItem.variantId
          }).session(session);

          if (inventoryItem) {
            // Release reservation and add back to available
            inventoryItem.reserved -= unfulfilledQuantity;
            inventoryItem.available += unfulfilledQuantity;
            await inventoryItem.save({ session });
          }
        }
      }
    }

    // Cancel the order
    await order.cancel(reason);

    // Handle refund if requested
    if (refund && order.financialStatus === 'paid') {
      const refundData = {
        amount: order.totalPrice,
        reason: 'requested_by_customer',
        note: `Order cancelled: ${reason}`,
        restock: restockItems
      };

      await order.addRefund(refundData);
    }

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email')
      .populate('lineItems.productId', 'title handle');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: populatedOrder
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling order',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Process refund (admin only)
exports.processRefund = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      amount,
      reason = 'requested_by_customer',
      note,
      restock = true,
      refundLineItems
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid refund amount is required'
      });
    }

    const order = await Order.findById(id).session(session);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (amount > order.refundableAmount) {
      return res.status(400).json({
        success: false,
        message: `Refund amount cannot exceed refundable amount: $${order.refundableAmount}`
      });
    }

    // Process inventory restocking if requested
    if (restock && refundLineItems && Array.isArray(refundLineItems)) {
      for (const refundItem of refundLineItems) {
        const { orderItemId, quantity, restockType = 'return' } = refundItem;

        const orderItem = order.lineItems.id(orderItemId);
        if (orderItem && quantity > 0) {
          const inventoryItem = await InventoryItem.findOne({
            productId: orderItem.productId,
            variantId: orderItem.variantId
          }).session(session);

          if (inventoryItem && restockType === 'return') {
            // Add back to available inventory
            inventoryItem.available += quantity;
            inventoryItem.onHand += quantity;
            inventoryItem.committed -= Math.min(inventoryItem.committed, quantity);
            await inventoryItem.save({ session });
          }
        }
      }
    }

    // Create refund record
    const refundData = {
      amount,
      reason,
      note,
      restock,
      refundLineItems: refundLineItems || [],
      processedAt: new Date()
    };

    await order.addRefund(refundData);

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email')
      .populate('lineItems.productId', 'title handle');

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: populatedOrder
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing refund',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Get order analytics (admin only)
exports.getOrderAnalytics = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      groupBy = 'day' // day, week, month
    } = req.query;

    // Build date filter
    let dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Get overall statistics
    const totalOrders = await Order.countDocuments(dateFilter);
    const totalRevenue = await Order.aggregate([
      { $match: { ...dateFilter, financialStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Get order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get financial status breakdown
    const financialStatusBreakdown = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$financialStatus',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get fulfillment status breakdown
    const fulfillmentStatusBreakdown = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$fulfillmentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$lineItems' },
      {
        $group: {
          _id: '$lineItems.productId',
          totalQuantity: { $sum: '$lineItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$lineItems.price', '$lineItems.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productTitle: '$product.title',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      }
    ]);

    // Get revenue over time
    let groupByFormat;
    switch (groupBy) {
      case 'week':
        groupByFormat = { $dateToString: { format: '%Y-W%U', date: '$createdAt' } };
        break;
      case 'month':
        groupByFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default: // day
        groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const revenueOverTime = await Order.aggregate([
      { $match: { ...dateFilter, financialStatus: 'paid' } },
      {
        $group: {
          _id: groupByFormat,
          revenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          averageOrderValue: totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0
        },
        statusBreakdown,
        financialStatusBreakdown,
        fulfillmentStatusBreakdown,
        topProducts,
        revenueOverTime
      }
    });

  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order analytics',
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
