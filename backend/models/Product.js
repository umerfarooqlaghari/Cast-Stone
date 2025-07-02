const mongoose = require('mongoose');

// Product variant schema for different options (size, color, material, etc.)
const variantSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lb', 'oz', 'g'],
      default: 'kg'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in', 'm', 'ft'],
      default: 'cm'
    }
  },
  options: [{
    name: String, // e.g., "Color", "Size", "Material"
    value: String // e.g., "Red", "Large", "Marble"
  }],
  inventoryQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  inventoryPolicy: {
    type: String,
    enum: ['deny', 'continue'],
    default: 'deny' // deny = don't allow overselling, continue = allow overselling
  },
  fulfillmentService: {
    type: String,
    default: 'manual'
  },
  inventoryManagement: {
    type: String,
    enum: ['shopify', 'manual', 'third_party'],
    default: 'manual'
  },
  requiresShipping: {
    type: Boolean,
    default: true
  },
  taxable: {
    type: Boolean,
    default: true
  },
  image: {
    url: String,
    altText: String,
    position: Number
  },
  position: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
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

// Product image schema
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  altText: String,
  position: {
    type: Number,
    default: 1
  },
  width: Number,
  height: Number,
  filename: String,
  size: Number // in bytes
});

// SEO schema
const seoSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 70
  },
  description: {
    type: String,
    maxlength: 160
  },
  keywords: [String],
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
});

// Product option schema (for variant generation)
const optionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    default: 1
  },
  values: [{
    type: String,
    required: true
  }]
});

const productSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  handle: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 5000
  },
  vendor: {
    type: String,
    default: 'Cast Stone'
  },
  productType: {
    type: String,
    required: true
  },

  // Status and Visibility
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,

  // Pricing
  priceRange: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    }
  },

  // Collections and Categories
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  category: {
    type: String,
    required: true
  },
  tags: [String],

  // Variants and Options
  variants: [variantSchema],
  options: [optionSchema],

  // Images
  images: [imageSchema],
  featuredImage: {
    type: imageSchema,
    default: null
  },

  // SEO
  seo: seoSchema,

  // Inventory
  totalInventory: {
    type: Number,
    default: 0
  },
  trackQuantity: {
    type: Boolean,
    default: true
  },

  // Shipping
  requiresShipping: {
    type: Boolean,
    default: true
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lb', 'oz', 'g'],
      default: 'kg'
    }
  },

  // Tax
  taxable: {
    type: Boolean,
    default: true
  },
  taxCode: String,

  // Metadata
  metafields: [{
    namespace: String,
    key: String,
    value: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['string', 'integer', 'json_string', 'boolean', 'date'],
      default: 'string'
    }
  }],

  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  salesCount: {
    type: Number,
    default: 0
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
productSchema.index({ handle: 1 });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ productType: 1 });
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ 'seo.slug': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });
productSchema.index({ publishedAt: -1 });
productSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 });

// Text search index
productSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  'variants.title': 'text'
});

// Compound indexes
productSchema.index({ status: 1, publishedAt: -1 });
productSchema.index({ category: 1, status: 1 });

// Virtual for URL-friendly handle
productSchema.virtual('url').get(function() {
  return `/products/${this.handle}`;
});

// Virtual for availability
productSchema.virtual('available').get(function() {
  if (!this.trackQuantity) return true;
  return this.totalInventory > 0;
});

// Virtual for price display
productSchema.virtual('priceDisplay').get(function() {
  if (!this.priceRange || (!this.priceRange.min && !this.priceRange.max)) {
    return 'Price on request';
  }

  if (this.priceRange.min === this.priceRange.max) {
    return `$${this.priceRange.min.toFixed(2)}`;
  }

  return `$${this.priceRange.min.toFixed(2)} - $${this.priceRange.max.toFixed(2)}`;
});

// Pre-save middleware to generate handle from title
productSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.handle) {
    this.handle = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Update price range based on variants
  if (this.variants && this.variants.length > 0) {
    const prices = this.variants.map(v => v.price).filter(p => p > 0);
    if (prices.length > 0) {
      this.priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }
  }

  // Update total inventory
  if (this.trackQuantity && this.variants && this.variants.length > 0) {
    this.totalInventory = this.variants.reduce((total, variant) => {
      return total + (variant.inventoryQuantity || 0);
    }, 0);
  }

  // Generate SEO slug if not provided
  if (this.seo && !this.seo.slug && this.handle) {
    this.seo.slug = this.handle;
  }

  next();
});

// Pre-save middleware for variants
variantSchema.pre('save', function(next) {
  // Generate SKU if not provided
  if (!this.sku && this.parent().handle) {
    const optionValues = this.options.map(opt => opt.value).join('-');
    this.sku = `${this.parent().handle}-${optionValues}`.toUpperCase();
  }
  next();
});

// Instance methods
productSchema.methods.updateInventory = function(variantId, quantity) {
  const variant = this.variants.id(variantId);
  if (variant) {
    variant.inventoryQuantity = quantity;
    this.totalInventory = this.variants.reduce((total, v) => {
      return total + (v.inventoryQuantity || 0);
    }, 0);
  }
  return this.save();
};

productSchema.methods.addVariant = function(variantData) {
  this.variants.push(variantData);
  return this.save();
};

productSchema.methods.removeVariant = function(variantId) {
  this.variants.id(variantId).remove();
  return this.save();
};

productSchema.methods.publish = function() {
  this.status = 'active';
  this.publishedAt = new Date();
  return this.save();
};

productSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.publishedAt = null;
  return this.save();
};

productSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

productSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

productSchema.methods.incrementSales = function(quantity = 1) {
  this.salesCount += quantity;
  return this.save();
};

// Static methods
productSchema.statics.findByHandle = function(handle) {
  return this.findOne({ handle, status: 'active' });
};

productSchema.statics.findPublished = function(filter = {}) {
  return this.find({
    ...filter,
    status: 'active',
    publishedAt: { $lte: new Date() }
  });
};

productSchema.statics.findByCategory = function(category) {
  return this.findPublished({ category });
};

productSchema.statics.findByTags = function(tags) {
  return this.findPublished({ tags: { $in: tags } });
};

productSchema.statics.search = function(query, options = {}) {
  const {
    category,
    tags,
    priceMin,
    priceMax,
    inStock,
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;

  let filter = {
    status: 'active',
    publishedAt: { $lte: new Date() }
  };

  if (query) {
    filter.$text = { $search: query };
  }

  if (category) {
    filter.category = category;
  }

  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    filter['priceRange.min'] = {};
    if (priceMin !== undefined) filter['priceRange.min'].$gte = priceMin;
    if (priceMax !== undefined) filter['priceRange.max'] = { $lte: priceMax };
  }

  if (inStock) {
    filter.totalInventory = { $gt: 0 };
  }

  return this.find(filter)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('collections');
};

// Instance methods for hierarchical collections
productSchema.methods.addToCollection = async function(collectionId) {
  if (!this.collections.includes(collectionId)) {
    this.collections.push(collectionId);
    await this.save();

    // Add product to collection if it's manual
    const Collection = mongoose.model('Collection');
    const collection = await Collection.findById(collectionId);
    if (collection && collection.collectionType === 'manual') {
      await collection.addProduct(this._id);
    }
  }
  return this;
};

productSchema.methods.removeFromCollection = async function(collectionId) {
  this.collections = this.collections.filter(id => !id.equals(collectionId));
  await this.save();

  // Remove product from collection
  const Collection = mongoose.model('Collection');
  const collection = await Collection.findById(collectionId);
  if (collection && collection.collectionType === 'manual') {
    await collection.removeProduct(this._id);
  }
  return this;
};

productSchema.methods.getCollectionHierarchy = async function() {
  const Collection = mongoose.model('Collection');
  const collections = await Collection.find({ _id: { $in: this.collections } })
    .populate('parent', 'title handle level')
    .populate('children', 'title handle level');

  const hierarchy = [];
  for (const collection of collections) {
    const breadcrumbs = await collection.getBreadcrumbs();
    hierarchy.push({
      collection,
      breadcrumbs,
      level: collection.level
    });
  }

  return hierarchy.sort((a, b) => a.level - b.level);
};

// Static method to find products by collection hierarchy
productSchema.statics.findByCollectionPath = async function(path, options = {}) {
  const Collection = mongoose.model('Collection');
  const collection = await Collection.findByPath(path);

  if (!collection) {
    return [];
  }

  // Get all descendant collections
  const descendants = await collection.getDescendants();
  const allCollectionIds = [collection._id, ...descendants.map(d => d._id)];

  const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;

  return this.find({
    collections: { $in: allCollectionIds },
    status: 'active'
  })
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('collections', 'title handle level path');
};

module.exports = mongoose.model('Product', productSchema);
