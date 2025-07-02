const mongoose = require('mongoose');

// Enhanced order item schema with variant support
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  variantTitle: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  quantityFulfilled: {
    type: Number,
    default: 0,
    min: 0
  },
  quantityRefunded: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    url: String,
    altText: String
  },
  weight: {
    value: Number,
    unit: String
  },
  requiresShipping: {
    type: Boolean,
    default: true
  },
  taxable: {
    type: Boolean,
    default: true
  },
  taxLines: [{
    title: String,
    rate: Number,
    price: Number
  }],
  properties: [{
    name: String,
    value: String
  }],
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled', 'restocked'],
    default: 'unfulfilled'
  },
  fulfillmentService: {
    type: String,
    default: 'manual'
  }
});

// Enhanced address schema
const addressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address1: {
    type: String,
    required: true,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'United States'
  },
  zip: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  countryCode: {
    type: String,
    default: 'US'
  },
  provinceCode: {
    type: String
  }
});

// Discount schema
const discountSchema = new mongoose.Schema({
  code: String,
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  title: String,
  description: String
});

// Shipping line schema
const shippingLineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  code: String,
  source: String,
  carrier: String,
  requestedFulfillmentServiceId: String,
  deliveryCategory: String,
  taxLines: [{
    title: String,
    rate: Number,
    price: Number
  }]
});

// Tax line schema
const taxLineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

// Enhanced payment schema
const paymentDetailsSchema = new mongoose.Schema({
  paymentIntentId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'authorized', 'partially_paid', 'paid', 'partially_refunded', 'refunded', 'voided'],
    default: 'pending'
  },
  gateway: {
    type: String,
    default: 'stripe'
  },
  transactionId: String,
  authorizationId: String,
  currency: {
    type: String,
    default: 'USD'
  },
  exchangeRate: Number,
  creditCardBin: String,
  creditCardCompany: String,
  creditCardNumber: String, // Last 4 digits only
  avsResultCode: String,
  cvvResultCode: String,
  processingMethod: String
});

// Fulfillment schema
const fulfillmentSchema = new mongoose.Schema({
  fulfillmentId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'open', 'success', 'cancelled', 'error', 'failure'],
    default: 'pending'
  },
  trackingCompany: String,
  trackingNumber: String,
  trackingUrl: String,
  shipmentStatus: {
    type: String,
    enum: ['label_printed', 'label_purchased', 'attempted_delivery', 'ready_for_pickup', 'confirmed', 'in_transit', 'out_for_delivery', 'delivered', 'failure']
  },
  lineItems: [{
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  notifyCustomer: {
    type: Boolean,
    default: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  service: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Refund schema
const refundSchema = new mongoose.Schema({
  refundId: {
    type: String,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  reason: {
    type: String,
    enum: ['duplicate', 'fraudulent', 'requested_by_customer', 'other'],
    default: 'requested_by_customer'
  },
  note: String,
  restock: {
    type: Boolean,
    default: true
  },
  refundLineItems: [{
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    restockType: {
      type: String,
      enum: ['no_restock', 'cancel', 'return', 'legacy_restock'],
      default: 'return'
    }
  }],
  transactions: [{
    transactionId: String,
    amount: Number,
    gateway: String,
    status: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  processedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enhanced order schema
const orderSchema = new mongoose.Schema({
  // Basic Information
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },

  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customer: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    acceptsMarketing: {
      type: Boolean,
      default: false
    }
  },

  // Order Items
  lineItems: [orderItemSchema],

  // Addresses
  billingAddress: addressSchema,
  shippingAddress: addressSchema,

  // Financial Information
  currency: {
    type: String,
    default: 'USD'
  },
  presentmentCurrency: {
    type: String,
    default: 'USD'
  },
  subtotalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalTax: {
    type: Number,
    default: 0,
    min: 0
  },
  totalShipping: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDiscounts: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalWeight: {
    type: Number,
    default: 0
  },

  // Discounts and Shipping
  discountCodes: [discountSchema],
  shippingLines: [shippingLineSchema],
  taxLines: [taxLineSchema],

  // Status and Processing
  financialStatus: {
    type: String,
    enum: ['pending', 'authorized', 'partially_paid', 'paid', 'partially_refunded', 'refunded', 'voided'],
    default: 'pending'
  },
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled', 'restocked'],
    default: 'unfulfilled'
  },
  orderStatus: {
    type: String,
    enum: ['open', 'closed', 'cancelled'],
    default: 'open'
  },

  // Payment Information
  paymentDetails: paymentDetailsSchema,
  paymentGatewayNames: [String],

  // Fulfillment and Shipping
  fulfillments: [fulfillmentSchema],
  refunds: [refundSchema],

  // Inventory and Location
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  inventoryBehaviour: {
    type: String,
    enum: ['bypass', 'decrement_ignoring_policy', 'decrement_obeying_policy'],
    default: 'decrement_obeying_policy'
  },

  // Dates
  processedAt: Date,
  closedAt: Date,
  cancelledAt: Date,
  cancelReason: {
    type: String,
    enum: ['customer', 'fraud', 'inventory', 'declined', 'other']
  },

  // Notes and Tags
  note: String,
  noteAttributes: [{
    name: String,
    value: String
  }],
  tags: [String],

  // Source and Channel
  sourceIdentifier: String,
  sourceName: String,
  sourceUrl: String,
  referringSite: String,
  landingSite: String,

  // Risk Assessment
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ email: 1 });
orderSchema.index({ financialStatus: 1 });
orderSchema.index({ fulfillmentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ processedAt: -1 });
orderSchema.index({ tags: 1 });
orderSchema.index({ 'lineItems.productId': 1 });
orderSchema.index({ 'lineItems.variantId': 1 });
orderSchema.index({ 'lineItems.sku': 1 });

// Compound indexes
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ financialStatus: 1, fulfillmentStatus: 1 });

// Text search index
orderSchema.index({
  orderNumber: 'text',
  name: 'text',
  email: 'text',
  'customer.firstName': 'text',
  'customer.lastName': 'text',
  'lineItems.title': 'text'
});

// Virtual for order name
orderSchema.virtual('displayName').get(function() {
  return this.name || `${this.customer?.firstName || ''} ${this.customer?.lastName || ''}`.trim() || this.email;
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.lineItems.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for fulfillable items
orderSchema.virtual('fulfillableItems').get(function() {
  return this.lineItems.filter(item =>
    item.requiresShipping &&
    item.quantity > item.quantityFulfilled
  );
});

// Virtual for refundable amount
orderSchema.virtual('refundableAmount').get(function() {
  const totalRefunded = this.refunds.reduce((total, refund) => total + refund.amount, 0);
  return Math.max(0, this.totalPrice - totalRefunded);
});

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Generate order number if new
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `CS-${timestamp.slice(-8)}${random}`;
  }

  // Generate order name if not provided
  if (!this.name) {
    this.name = this.orderNumber;
  }

  // Update fulfillment status based on line items
  this.updateFulfillmentStatus();

  // Update financial status based on payments and refunds
  this.updateFinancialStatus();

  next();
});

// Instance methods
orderSchema.methods.updateFulfillmentStatus = function() {
  const totalQuantity = this.lineItems.reduce((total, item) => total + item.quantity, 0);
  const fulfilledQuantity = this.lineItems.reduce((total, item) => total + item.quantityFulfilled, 0);

  if (fulfilledQuantity === 0) {
    this.fulfillmentStatus = 'unfulfilled';
  } else if (fulfilledQuantity < totalQuantity) {
    this.fulfillmentStatus = 'partial';
  } else {
    this.fulfillmentStatus = 'fulfilled';
  }
};

orderSchema.methods.updateFinancialStatus = function() {
  const totalRefunded = this.refunds.reduce((total, refund) => total + refund.amount, 0);

  if (totalRefunded === 0) {
    // No refunds - check payment status
    if (this.paymentDetails?.paymentStatus === 'paid') {
      this.financialStatus = 'paid';
    } else if (this.paymentDetails?.paymentStatus === 'authorized') {
      this.financialStatus = 'authorized';
    } else {
      this.financialStatus = 'pending';
    }
  } else if (totalRefunded < this.totalPrice) {
    this.financialStatus = 'partially_refunded';
  } else {
    this.financialStatus = 'refunded';
  }
};

orderSchema.methods.addFulfillment = function(fulfillmentData) {
  // Generate fulfillment ID
  const fulfillmentId = `FUL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const fulfillment = {
    fulfillmentId,
    ...fulfillmentData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  this.fulfillments.push(fulfillment);

  // Update line item fulfillment quantities
  fulfillmentData.lineItems.forEach(fulfillItem => {
    const lineItem = this.lineItems.id(fulfillItem.orderItemId);
    if (lineItem) {
      lineItem.quantityFulfilled += fulfillItem.quantity;
      lineItem.fulfillmentStatus = lineItem.quantity === lineItem.quantityFulfilled ? 'fulfilled' : 'partial';
    }
  });

  this.updateFulfillmentStatus();
  return this.save();
};

orderSchema.methods.addRefund = function(refundData) {
  // Generate refund ID
  const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const refund = {
    refundId,
    ...refundData,
    createdAt: new Date()
  };

  this.refunds.push(refund);

  // Update line item refund quantities
  if (refundData.refundLineItems) {
    refundData.refundLineItems.forEach(refundItem => {
      const lineItem = this.lineItems.id(refundItem.orderItemId);
      if (lineItem) {
        lineItem.quantityRefunded += refundItem.quantity;
      }
    });
  }

  this.updateFinancialStatus();
  return this.save();
};

orderSchema.methods.cancel = function(reason = 'other') {
  this.orderStatus = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  return this.save();
};

orderSchema.methods.close = function() {
  this.orderStatus = 'closed';
  this.closedAt = new Date();
  return this.save();
};

orderSchema.methods.reopen = function() {
  this.orderStatus = 'open';
  this.closedAt = null;
  return this.save();
};

// Static methods
orderSchema.statics.findByOrderNumber = function(orderNumber) {
  return this.findOne({ orderNumber });
};

orderSchema.statics.findByCustomer = function(customerId, options = {}) {
  const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;
  return this.find({ customerId })
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

orderSchema.statics.findByStatus = function(status, options = {}) {
  const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;
  return this.find({ orderStatus: status })
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

orderSchema.statics.search = function(query, filters = {}, options = {}) {
  const {
    financialStatus,
    fulfillmentStatus,
    orderStatus,
    dateFrom,
    dateTo,
    tags
  } = filters;

  const {
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;

  let filter = {};

  if (query) {
    filter.$text = { $search: query };
  }

  if (financialStatus) filter.financialStatus = financialStatus;
  if (fulfillmentStatus) filter.fulfillmentStatus = fulfillmentStatus;
  if (orderStatus) filter.orderStatus = orderStatus;

  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }

  return this.find(filter)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('customerId', 'name email')
    .populate('lineItems.productId', 'title handle');
};

module.exports = mongoose.model('Order', orderSchema);
