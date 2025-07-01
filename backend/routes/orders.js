const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const {
  createPaymentIntent,
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  handlePaymentFailure
} = require('../controllers/orderController');

// All order routes require authentication
router.use(authenticate);

// Create payment intent
router.post('/payment-intent', createPaymentIntent);

// Create order after successful payment
router.post('/create', createOrder);

// Get user's orders
router.get('/', getUserOrders);

// Get specific order
router.get('/:orderNumber', getOrder);

// Handle payment failure
router.post('/payment-failure', handlePaymentFailure);

// Admin routes (you might want to add admin middleware here)
router.put('/:orderNumber/status', updateOrderStatus);

module.exports = router;
