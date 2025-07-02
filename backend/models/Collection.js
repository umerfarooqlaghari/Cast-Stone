const mongoose = require('mongoose');

// Collection rule schema for automatic collections
const ruleSchema = new mongoose.Schema({
  column: {
    type: String,
    required: true,
    enum: [
      'title',
      'type',
      'vendor',
      'price',
      'compare_at_price',
      'weight',
      'inventory_quantity',
      'variant_title',
      'tag',
      'created_at',
      'updated_at'
    ]
  },
  relation: {
    type: String,
    required: true,
    enum: [
      'equals',
      'not_equals',
      'greater_than',
      'less_than',
      'starts_with',
      'ends_with',
      'contains',
      'not_contains'
    ]
  },
  condition: {
    type: String,
    required: true
  }
});

// SEO schema for collections
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

// Collection image schema
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  altText: String,
  width: Number,
  height: Number,
  filename: String,
  size: Number // in bytes
});

const collectionSchema = new mongoose.Schema({
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

  // Hierarchical Structure
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  level: {
    type: Number,
    default: 0, // 0 = root collection, 1 = sub collection, 2 = sub sub collection
    min: 0,
    max: 2
  },
  path: {
    type: String,
    default: '' // Stores the full path like "architectural/fireplaces/modern"
  },

  // Collection Type
  collectionType: {
    type: String,
    enum: ['manual', 'smart'],
    default: 'manual'
  },
  
  // For smart collections - automatic rules
  rules: [ruleSchema],
  disjunctive: {
    type: Boolean,
    default: false // false = AND logic, true = OR logic
  },
  
  // For manual collections - explicit product list
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Sorting
  sortOrder: {
    type: String,
    enum: [
      'alpha-asc',
      'alpha-desc',
      'best-selling',
      'created',
      'created-desc',
      'manual',
      'price-asc',
      'price-desc'
    ],
    default: 'manual'
  },
  
  // Status and Visibility
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  
  // SEO
  seo: seoSchema,
  
  // Images
  image: imageSchema,
  
  // Template and Display
  templateSuffix: String,
  
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

// Indexes
collectionSchema.index({ handle: 1 });
collectionSchema.index({ published: 1 });
collectionSchema.index({ collectionType: 1 });
collectionSchema.index({ 'seo.slug': 1 });
collectionSchema.index({ createdAt: -1 });
collectionSchema.index({ publishedAt: -1 });
collectionSchema.index({ parent: 1 });
collectionSchema.index({ level: 1 });
collectionSchema.index({ path: 1 });
collectionSchema.index({ parent: 1, level: 1 });

// Text search index
collectionSchema.index({
  title: 'text',
  description: 'text'
});

// Virtual for URL
collectionSchema.virtual('url').get(function() {
  return `/collections/${this.handle}`;
});

// Pre-save middleware to generate handle from title and manage hierarchy
collectionSchema.pre('save', async function(next) {
  if (this.isModified('title') && !this.handle) {
    this.handle = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Generate SEO slug if not provided
  if (this.seo && !this.seo.slug && this.handle) {
    this.seo.slug = this.handle;
  }

  // Update path and level based on parent
  if (this.isModified('parent') || this.isNew) {
    if (this.parent) {
      const parent = await mongoose.model('Collection').findById(this.parent);
      if (parent) {
        this.level = parent.level + 1;
        this.path = parent.path ? `${parent.path}/${this.handle}` : this.handle;

        // Validate hierarchy depth (max 3 levels: 0, 1, 2)
        if (this.level > 2) {
          return next(new Error('Maximum collection hierarchy depth is 3 levels'));
        }
      }
    } else {
      this.level = 0;
      this.path = this.handle;
    }
  }

  next();
});

// Instance methods
collectionSchema.methods.addProduct = function(productId) {
  if (this.collectionType !== 'manual') {
    throw new Error('Can only add products to manual collections');
  }
  
  if (!this.products.includes(productId)) {
    this.products.push(productId);
  }
  return this.save();
};

collectionSchema.methods.removeProduct = function(productId) {
  if (this.collectionType !== 'manual') {
    throw new Error('Can only remove products from manual collections');
  }
  
  this.products = this.products.filter(id => !id.equals(productId));
  return this.save();
};

collectionSchema.methods.publish = function() {
  this.published = true;
  this.publishedAt = new Date();
  return this.save();
};

collectionSchema.methods.unpublish = function() {
  this.published = false;
  this.publishedAt = null;
  return this.save();
};

collectionSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// Hierarchy management methods
collectionSchema.methods.addChild = async function(childId) {
  if (!this.children.includes(childId)) {
    this.children.push(childId);
    await this.save();

    // Update the child's parent reference
    const child = await mongoose.model('Collection').findById(childId);
    if (child) {
      child.parent = this._id;
      await child.save();
    }
  }
  return this;
};

collectionSchema.methods.removeChild = async function(childId) {
  this.children = this.children.filter(id => !id.equals(childId));
  await this.save();

  // Remove parent reference from child
  const child = await mongoose.model('Collection').findById(childId);
  if (child) {
    child.parent = null;
    await child.save();
  }
  return this;
};

collectionSchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;

  while (current.parent) {
    const parent = await mongoose.model('Collection').findById(current.parent);
    if (parent) {
      ancestors.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }

  return ancestors;
};

collectionSchema.methods.getDescendants = async function() {
  const descendants = [];

  const getChildren = async (collection) => {
    const children = await mongoose.model('Collection').find({ parent: collection._id });
    for (const child of children) {
      descendants.push(child);
      await getChildren(child);
    }
  };

  await getChildren(this);
  return descendants;
};

collectionSchema.methods.getBreadcrumbs = async function() {
  const ancestors = await this.getAncestors();
  return [...ancestors, this];
};

// Get products for this collection
collectionSchema.methods.getProducts = async function(options = {}) {
  const { limit = 20, skip = 0, sort } = options;
  
  if (this.collectionType === 'manual') {
    // For manual collections, return the explicitly added products
    return await mongoose.model('Product')
      .find({ 
        _id: { $in: this.products },
        status: 'active'
      })
      .limit(limit)
      .skip(skip)
      .sort(this._getSortOrder(sort));
  } else {
    // For smart collections, apply the rules
    const filter = this._buildSmartCollectionFilter();
    return await mongoose.model('Product')
      .find(filter)
      .limit(limit)
      .skip(skip)
      .sort(this._getSortOrder(sort));
  }
};

// Build filter for smart collections
collectionSchema.methods._buildSmartCollectionFilter = function() {
  if (this.collectionType !== 'smart' || !this.rules.length) {
    return { status: 'active' };
  }
  
  const baseFilter = { status: 'active' };
  const ruleFilters = this.rules.map(rule => this._buildRuleFilter(rule));
  
  if (this.disjunctive) {
    // OR logic
    return {
      ...baseFilter,
      $or: ruleFilters
    };
  } else {
    // AND logic
    return {
      ...baseFilter,
      $and: ruleFilters
    };
  }
};

// Build individual rule filter
collectionSchema.methods._buildRuleFilter = function(rule) {
  const { column, relation, condition } = rule;
  let filter = {};
  
  // Map collection rule columns to product schema fields
  const columnMap = {
    'title': 'title',
    'type': 'productType',
    'vendor': 'vendor',
    'price': 'priceRange.min',
    'compare_at_price': 'variants.compareAtPrice',
    'weight': 'weight.value',
    'inventory_quantity': 'totalInventory',
    'variant_title': 'variants.title',
    'tag': 'tags',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt'
  };
  
  const field = columnMap[column] || column;
  
  switch (relation) {
    case 'equals':
      filter[field] = condition;
      break;
    case 'not_equals':
      filter[field] = { $ne: condition };
      break;
    case 'greater_than':
      filter[field] = { $gt: parseFloat(condition) || condition };
      break;
    case 'less_than':
      filter[field] = { $lt: parseFloat(condition) || condition };
      break;
    case 'starts_with':
      filter[field] = { $regex: `^${condition}`, $options: 'i' };
      break;
    case 'ends_with':
      filter[field] = { $regex: `${condition}$`, $options: 'i' };
      break;
    case 'contains':
      filter[field] = { $regex: condition, $options: 'i' };
      break;
    case 'not_contains':
      filter[field] = { $not: { $regex: condition, $options: 'i' } };
      break;
  }
  
  return filter;
};

// Get sort order
collectionSchema.methods._getSortOrder = function(customSort) {
  if (customSort) return customSort;
  
  switch (this.sortOrder) {
    case 'alpha-asc':
      return { title: 1 };
    case 'alpha-desc':
      return { title: -1 };
    case 'best-selling':
      return { salesCount: -1 };
    case 'created':
      return { createdAt: 1 };
    case 'created-desc':
      return { createdAt: -1 };
    case 'price-asc':
      return { 'priceRange.min': 1 };
    case 'price-desc':
      return { 'priceRange.min': -1 };
    case 'manual':
    default:
      return { _id: 1 };
  }
};

// Static methods
collectionSchema.statics.findByHandle = function(handle) {
  return this.findOne({ handle, published: true });
};

collectionSchema.statics.findPublished = function(filter = {}) {
  return this.find({ 
    ...filter, 
    published: true,
    publishedAt: { $lte: new Date() }
  });
};

// Static methods for hierarchy queries
collectionSchema.statics.getRootCollections = function() {
  return this.find({ parent: null, published: true }).sort({ title: 1 });
};

collectionSchema.statics.getCollectionsByLevel = function(level) {
  return this.find({ level, published: true }).sort({ title: 1 });
};

collectionSchema.statics.getCollectionHierarchy = async function() {
  // Get all published collections
  const allCollections = await this.find({ published: true }).sort({ level: 1, title: 1 });

  // Build hierarchy map
  const collectionMap = new Map();
  const rootCollections = [];

  // First pass: create map and identify roots
  allCollections.forEach(collection => {
    const collectionObj = collection.toObject();
    collectionObj.children = [];
    collectionMap.set(collection._id.toString(), collectionObj);

    if (!collection.parent) {
      rootCollections.push(collectionObj);
    }
  });

  // Second pass: build parent-child relationships
  allCollections.forEach(collection => {
    if (collection.parent) {
      const parent = collectionMap.get(collection.parent.toString());
      const child = collectionMap.get(collection._id.toString());
      if (parent && child) {
        parent.children.push(child);
      }
    }
  });

  return rootCollections;
};

collectionSchema.statics.findByPath = function(path) {
  return this.findOne({ path, published: true });
};

module.exports = mongoose.model('Collection', collectionSchema);
