const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Update item quantity in cart
router.put('/item/:productId', updateCartItem);

// Remove item from cart
router.delete('/item/:productId', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);

// Sync cart with frontend
router.post('/sync', syncCart);

module.exports = router;
