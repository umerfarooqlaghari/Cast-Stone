const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  image: {
    type: String
  },
  category: {
    type: String
  },
  description: {
    type: String
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  const TAX_RATE = 0.08; // 8% tax rate
  const SHIPPING_RATE = 15.00; // Flat shipping rate
  const FREE_SHIPPING_THRESHOLD = 500; // Free shipping over $500

  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.tax = this.subtotal * TAX_RATE;
  this.shipping = this.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  this.total = this.subtotal + this.tax + this.shipping;
  
  // Round to 2 decimal places
  this.subtotal = Math.round(this.subtotal * 100) / 100;
  this.tax = Math.round(this.tax * 100) / 100;
  this.shipping = Math.round(this.shipping * 100) / 100;
  this.total = Math.round(this.total * 100) / 100;
  
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
