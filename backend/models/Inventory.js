const mongoose = require('mongoose');

// Location schema for inventory tracking
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  type: {
    type: String,
    enum: ['warehouse', 'store', 'supplier', 'fulfillment_center'],
    default: 'warehouse'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Inventory item schema for tracking stock at specific locations
const inventoryItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  
  // Stock levels
  available: {
    type: Number,
    default: 0,
    min: 0
  },
  committed: {
    type: Number,
    default: 0,
    min: 0
  },
  onHand: {
    type: Number,
    default: 0,
    min: 0
  },
  reserved: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Thresholds
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  outOfStockThreshold: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Cost tracking
  unitCost: {
    type: Number,
    min: 0
  },
  totalValue: {
    type: Number,
    min: 0
  },
  
  // Alerts
  lowStockAlert: {
    type: Boolean,
    default: false
  },
  outOfStockAlert: {
    type: Boolean,
    default: false
  },
  
  // Last updated
  lastCountDate: Date,
  lastMovementDate: Date,
  
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

// Inventory movement schema for audit trail
const inventoryMovementSchema = new mongoose.Schema({
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  
  // Movement details
  type: {
    type: String,
    enum: [
      'adjustment',
      'sale',
      'return',
      'transfer_in',
      'transfer_out',
      'restock',
      'damage',
      'theft',
      'count',
      'reservation',
      'release'
    ],
    required: true
  },
  
  quantity: {
    type: Number,
    required: true
  },
  
  // Before and after quantities
  quantityBefore: {
    available: Number,
    committed: Number,
    onHand: Number,
    reserved: Number
  },
  quantityAfter: {
    available: Number,
    committed: Number,
    onHand: Number,
    reserved: Number
  },
  
  // Reference information
  referenceType: {
    type: String,
    enum: ['order', 'transfer', 'adjustment', 'count', 'return', 'manual'],
    required: true
  },
  referenceId: String, // Order ID, Transfer ID, etc.
  
  // Cost information
  unitCost: Number,
  totalCost: Number,
  
  // Notes and reason
  reason: String,
  notes: String,
  
  // User who made the change
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Inventory transfer schema
const inventoryTransferSchema = new mongoose.Schema({
  transferNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  fromLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  toLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    sku: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitCost: Number
  }],
  
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Tracking
  trackingNumber: String,
  shippedAt: Date,
  receivedAt: Date,
  
  // Notes
  notes: String,
  
  // User who created the transfer
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
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

// Indexes for InventoryItem
inventoryItemSchema.index({ productId: 1, variantId: 1, locationId: 1 }, { unique: true });
inventoryItemSchema.index({ sku: 1, locationId: 1 });
inventoryItemSchema.index({ lowStockAlert: 1 });
inventoryItemSchema.index({ outOfStockAlert: 1 });
inventoryItemSchema.index({ available: 1 });
inventoryItemSchema.index({ lastMovementDate: -1 });

// Indexes for InventoryMovement
inventoryMovementSchema.index({ inventoryItemId: 1, createdAt: -1 });
inventoryMovementSchema.index({ productId: 1, createdAt: -1 });
inventoryMovementSchema.index({ type: 1, createdAt: -1 });
inventoryMovementSchema.index({ referenceType: 1, referenceId: 1 });
inventoryMovementSchema.index({ userId: 1, createdAt: -1 });

// Indexes for InventoryTransfer
inventoryTransferSchema.index({ transferNumber: 1 });
inventoryTransferSchema.index({ status: 1 });
inventoryTransferSchema.index({ fromLocationId: 1 });
inventoryTransferSchema.index({ toLocationId: 1 });
inventoryTransferSchema.index({ createdAt: -1 });

// Virtual for InventoryItem
inventoryItemSchema.virtual('isLowStock').get(function() {
  return this.available <= this.lowStockThreshold;
});

inventoryItemSchema.virtual('isOutOfStock').get(function() {
  return this.available <= this.outOfStockThreshold;
});

// Pre-save middleware for InventoryItem
inventoryItemSchema.pre('save', function(next) {
  // Update alerts
  this.lowStockAlert = this.isLowStock;
  this.outOfStockAlert = this.isOutOfStock;
  
  // Calculate total value
  if (this.unitCost) {
    this.totalValue = this.onHand * this.unitCost;
  }
  
  // Update last movement date if quantities changed
  if (this.isModified('available') || this.isModified('committed') || 
      this.isModified('onHand') || this.isModified('reserved')) {
    this.lastMovementDate = new Date();
  }
  
  next();
});

// Pre-save middleware for InventoryTransfer
inventoryTransferSchema.pre('save', function(next) {
  // Generate transfer number if not provided
  if (!this.transferNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.transferNumber = `TRF-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Instance methods for InventoryItem
inventoryItemSchema.methods.adjustStock = function(quantity, type, reason, userId, referenceId) {
  const movement = new InventoryMovement({
    inventoryItemId: this._id,
    productId: this.productId,
    variantId: this.variantId,
    locationId: this.locationId,
    type: type,
    quantity: quantity,
    quantityBefore: {
      available: this.available,
      committed: this.committed,
      onHand: this.onHand,
      reserved: this.reserved
    },
    referenceType: 'adjustment',
    referenceId: referenceId,
    reason: reason,
    userId: userId
  });
  
  // Update quantities
  this.available += quantity;
  this.onHand += quantity;
  
  movement.quantityAfter = {
    available: this.available,
    committed: this.committed,
    onHand: this.onHand,
    reserved: this.reserved
  };
  
  return Promise.all([this.save(), movement.save()]);
};

inventoryItemSchema.methods.reserveStock = function(quantity, referenceId, userId) {
  if (this.available < quantity) {
    throw new Error('Insufficient stock available for reservation');
  }
  
  const movement = new InventoryMovement({
    inventoryItemId: this._id,
    productId: this.productId,
    variantId: this.variantId,
    locationId: this.locationId,
    type: 'reservation',
    quantity: quantity,
    quantityBefore: {
      available: this.available,
      committed: this.committed,
      onHand: this.onHand,
      reserved: this.reserved
    },
    referenceType: 'order',
    referenceId: referenceId,
    userId: userId
  });
  
  this.available -= quantity;
  this.reserved += quantity;
  
  movement.quantityAfter = {
    available: this.available,
    committed: this.committed,
    onHand: this.onHand,
    reserved: this.reserved
  };
  
  return Promise.all([this.save(), movement.save()]);
};

inventoryItemSchema.methods.releaseReservation = function(quantity, referenceId, userId) {
  if (this.reserved < quantity) {
    throw new Error('Cannot release more than reserved quantity');
  }
  
  const movement = new InventoryMovement({
    inventoryItemId: this._id,
    productId: this.productId,
    variantId: this.variantId,
    locationId: this.locationId,
    type: 'release',
    quantity: quantity,
    quantityBefore: {
      available: this.available,
      committed: this.committed,
      onHand: this.onHand,
      reserved: this.reserved
    },
    referenceType: 'order',
    referenceId: referenceId,
    userId: userId
  });
  
  this.available += quantity;
  this.reserved -= quantity;
  
  movement.quantityAfter = {
    available: this.available,
    committed: this.committed,
    onHand: this.onHand,
    reserved: this.reserved
  };
  
  return Promise.all([this.save(), movement.save()]);
};

// Create models
const Location = mongoose.model('Location', locationSchema);
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);
const InventoryTransfer = mongoose.model('InventoryTransfer', inventoryTransferSchema);

module.exports = {
  Location,
  InventoryItem,
  InventoryMovement,
  InventoryTransfer
};
