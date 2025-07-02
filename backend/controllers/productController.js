const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Collection = require('../models/Collection');
const { InventoryItem } = require('../models/Inventory');
const mongoose = require('mongoose');

// Get all products with advanced filtering and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      tags,
      status,
      priceMin,
      priceMax,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      collectionId,
      collectionPath,
      includeDescendants = false
    } = req.query;

    // Build filter object
    let filter = {};

    // Status filter (for admin, show all; for public, only active)
    if (req.admin) {
      if (status) filter.status = status;
    } else {
      filter.status = 'active';
      filter.publishedAt = { $lte: new Date() };
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      filter['priceRange.min'] = {};
      if (priceMin !== undefined) filter['priceRange.min'].$gte = parseFloat(priceMin);
      if (priceMax !== undefined) filter['priceRange.max'] = { $lte: parseFloat(priceMax) };
    }

    // Stock filter
    if (inStock === 'true') {
      filter.totalInventory = { $gt: 0 };
    } else if (inStock === 'false') {
      filter.totalInventory = { $lte: 0 };
    }

    // Collection filter with hierarchy support
    if (collectionId) {
      if (includeDescendants === 'true') {
        // Include products from child collections
        const collection = await Collection.findById(collectionId);
        if (collection) {
          const descendants = await collection.getDescendants();
          const allCollectionIds = [collectionId, ...descendants.map(d => d._id)];
          filter.collections = { $in: allCollectionIds };
        } else {
          filter.collections = collectionId;
        }
      } else {
        filter.collections = collectionId;
      }
    }

    // Collection path filter (alternative to collectionId)
    if (collectionPath) {
      const collection = await Collection.findByPath(collectionPath);
      if (collection) {
        if (includeDescendants === 'true') {
          const descendants = await collection.getDescendants();
          const allCollectionIds = [collection._id, ...descendants.map(d => d._id)];
          filter.collections = { $in: allCollectionIds };
        } else {
          filter.collections = collection._id;
        }
      }
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'priceRange.min', 'salesCount', 'viewCount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(filter)
      .populate('collections', 'title handle level path parent')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
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
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      vendor,
      productType,
      category,
      tags,
      status,
      variants,
      options,
      seo,
      collections,
      metafields,
      weight,
      requiresShipping,
      taxable,
      taxCode
    } = req.body;

    // Validate required fields
    if (!title || !productType || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, product type, and category are required'
      });
    }

    // Create product data
    const productData = {
      title: title.trim(),
      description,
      vendor: vendor || 'Cast Stone',
      productType,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      status: status || 'draft',
      weight,
      requiresShipping: requiresShipping !== false,
      taxable: taxable !== false,
      taxCode
    };

    // Handle SEO data
    if (seo) {
      productData.seo = {
        title: seo.title,
        description: seo.description,
        keywords: Array.isArray(seo.keywords) ? seo.keywords : (seo.keywords ? seo.keywords.split(',').map(k => k.trim()) : [])
      };
    }

    // Handle metafields
    if (metafields && Array.isArray(metafields)) {
      productData.metafields = metafields;
    }

    // Create the product
    const product = new Product(productData);

    // Handle variants
    if (variants && Array.isArray(variants)) {
      product.variants = variants.map(variant => ({
        title: variant.title || product.title,
        sku: variant.sku,
        barcode: variant.barcode,
        price: parseFloat(variant.price),
        compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
        weight: variant.weight,
        dimensions: variant.dimensions,
        options: variant.options || [],
        inventoryQuantity: parseInt(variant.inventoryQuantity) || 0,
        inventoryPolicy: variant.inventoryPolicy || 'deny',
        requiresShipping: variant.requiresShipping !== false,
        taxable: variant.taxable !== false,
        position: variant.position || 1
      }));
    } else {
      // Create default variant if none provided
      product.variants = [{
        title: product.title,
        price: 0,
        inventoryQuantity: 0,
        position: 1
      }];
    }

    // Handle options for variant generation
    if (options && Array.isArray(options)) {
      product.options = options.map(option => ({
        name: option.name,
        position: option.position || 1,
        values: Array.isArray(option.values) ? option.values : []
      }));
    }

    // Save the product
    await product.save();

    // Handle collections
    if (collections && Array.isArray(collections)) {
      for (const collectionId of collections) {
        try {
          const collection = await Collection.findById(collectionId);
          if (collection && collection.collectionType === 'manual') {
            await collection.addProduct(product._id);
          }
        } catch (collectionError) {
          console.warn(`Failed to add product to collection ${collectionId}:`, collectionError.message);
        }
      }
    }

    // Populate the response
    const populatedProduct = await Product.findById(product._id)
      .populate('collections', 'title handle');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });

  } catch (error) {
    console.error('Create product error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this handle already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Get single product by ID or handle
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    // Check if id is a valid ObjectId or treat as handle
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
        .populate('collections', 'title handle');
    } else {
      product = await Product.findByHandle(id)
        .populate('collections', 'title handle');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count if not admin request
    if (!req.admin) {
      await product.incrementView();
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle tags conversion
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    // Handle variants update
    if (updateData.variants && Array.isArray(updateData.variants)) {
      updateData.variants = updateData.variants.map(variant => ({
        ...variant,
        price: parseFloat(variant.price),
        compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
        inventoryQuantity: parseInt(variant.inventoryQuantity) || 0
      }));
    }

    // Handle collections update
    if (updateData.collections && Array.isArray(updateData.collections)) {
      // Remove product from old collections
      const oldCollections = await Collection.find({ products: product._id });
      for (const collection of oldCollections) {
        if (collection.collectionType === 'manual') {
          await collection.removeProduct(product._id);
        }
      }

      // Add to new collections
      for (const collectionId of updateData.collections) {
        try {
          const collection = await Collection.findById(collectionId);
          if (collection && collection.collectionType === 'manual') {
            await collection.addProduct(product._id);
          }
        } catch (collectionError) {
          console.warn(`Failed to add product to collection ${collectionId}:`, collectionError.message);
        }
      }
    }

    // Update the product
    Object.assign(product, updateData);
    await product.save();

    // Return updated product
    const updatedProduct = await Product.findById(product._id)
      .populate('collections', 'title handle');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Remove from collections
    const collections = await Collection.find({ products: product._id });
    for (const collection of collections) {
      if (collection.collectionType === 'manual') {
        await collection.removeProduct(product._id);
      }
    }

    // Delete associated inventory items
    await InventoryItem.deleteMany({ productId: product._id });

    // Delete the product
    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Bulk delete products
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No product IDs provided'
      });
    }

    const deletedProducts = [];
    const errors = [];

    for (const id of ids) {
      try {
        const product = await Product.findById(id);
        if (product) {
          // Remove from collections
          const collections = await Collection.find({ products: product._id });
          for (const collection of collections) {
            if (collection.collectionType === 'manual') {
              await collection.removeProduct(product._id);
            }
          }

          // Delete associated inventory items
          await InventoryItem.deleteMany({ productId: product._id });

          // Delete the product
          await Product.findByIdAndDelete(id);
          deletedProducts.push(id);
        }
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `${deletedProducts.length} products deleted successfully`,
      data: {
        deletedProducts,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Bulk delete products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting products',
      error: error.message
    });
  }
};

// Publish product
exports.publishProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.publish();

    res.json({
      success: true,
      message: 'Product published successfully',
      data: product
    });

  } catch (error) {
    console.error('Publish product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing product',
      error: error.message
    });
  }
};

// Unpublish product
exports.unpublishProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.unpublish();

    res.json({
      success: true,
      message: 'Product unpublished successfully',
      data: product
    });

  } catch (error) {
    console.error('Unpublish product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unpublishing product',
      error: error.message
    });
  }
};

// Archive product
exports.archiveProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.archive();

    res.json({
      success: true,
      message: 'Product archived successfully',
      data: product
    });

  } catch (error) {
    console.error('Archive product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving product',
      error: error.message
    });
  }
};

// Bulk update products
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, updates } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No product IDs provided'
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    const updatedProducts = [];
    const errors = [];

    for (const id of ids) {
      try {
        const product = await Product.findById(id);
        if (product) {
          Object.assign(product, updates);
          await product.save();
          updatedProducts.push(id);
        }
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `${updatedProducts.length} products updated successfully`,
      data: {
        updatedProducts,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating products',
      error: error.message
    });
  }
};

// Get product variants
exports.getProductVariants = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product.variants
    });

  } catch (error) {
    console.error('Get product variants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product variants',
      error: error.message
    });
  }
};

// Add product variant
exports.addProductVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const variantData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate variant data
    if (!variantData.title || !variantData.price) {
      return res.status(400).json({
        success: false,
        message: 'Variant title and price are required'
      });
    }

    const variant = {
      title: variantData.title,
      sku: variantData.sku,
      barcode: variantData.barcode,
      price: parseFloat(variantData.price),
      compareAtPrice: variantData.compareAtPrice ? parseFloat(variantData.compareAtPrice) : undefined,
      weight: variantData.weight,
      dimensions: variantData.dimensions,
      options: variantData.options || [],
      inventoryQuantity: parseInt(variantData.inventoryQuantity) || 0,
      inventoryPolicy: variantData.inventoryPolicy || 'deny',
      requiresShipping: variantData.requiresShipping !== false,
      taxable: variantData.taxable !== false,
      position: variantData.position || product.variants.length + 1
    };

    await product.addVariant(variant);

    res.status(201).json({
      success: true,
      message: 'Variant added successfully',
      data: product.variants[product.variants.length - 1]
    });

  } catch (error) {
    console.error('Add product variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product variant',
      error: error.message
    });
  }
};

// Update product variant
exports.updateProductVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    // Update variant fields
    Object.assign(variant, updateData);

    // Convert numeric fields
    if (updateData.price) variant.price = parseFloat(updateData.price);
    if (updateData.compareAtPrice) variant.compareAtPrice = parseFloat(updateData.compareAtPrice);
    if (updateData.inventoryQuantity) variant.inventoryQuantity = parseInt(updateData.inventoryQuantity);

    await product.save();

    res.json({
      success: true,
      message: 'Variant updated successfully',
      data: variant
    });

  } catch (error) {
    console.error('Update product variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product variant',
      error: error.message
    });
  }
};

// Delete product variant
exports.deleteProductVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.variants.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last variant. Product must have at least one variant.'
      });
    }

    await product.removeVariant(variantId);

    res.json({
      success: true,
      message: 'Variant deleted successfully'
    });

  } catch (error) {
    console.error('Delete product variant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product variant',
      error: error.message
    });
  }
};

// Get product categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { status: 'active' });

    res.json({
      success: true,
      data: categories.filter(cat => cat).sort()
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get product tags
exports.getTags = async (req, res) => {
  try {
    const tags = await Product.distinct('tags', { status: 'active' });

    res.json({
      success: true,
      data: tags.filter(tag => tag).sort()
    });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

// Get product types
exports.getProductTypes = async (req, res) => {
  try {
    const productTypes = await Product.distinct('productType', { status: 'active' });

    res.json({
      success: true,
      data: productTypes.filter(type => type).sort()
    });

  } catch (error) {
    console.error('Get product types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product types',
      error: error.message
    });
  }
};

// Get products by collection path (hierarchical)
exports.getProductsByCollectionPath = async (req, res) => {
  try {
    const { path } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeDescendants = false
    } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: {}
    };

    const validSortFields = ['createdAt', 'updatedAt', 'title', 'priceRange.min'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    options.sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    let products;
    let total;

    if (includeDescendants === 'true') {
      // Use the static method to get products from collection and its descendants
      products = await Product.findByCollectionPath(path, options);

      // Get total count
      const Collection = require('../models/Collection');
      const collection = await Collection.findByPath(path);
      if (collection) {
        const descendants = await collection.getDescendants();
        const allCollectionIds = [collection._id, ...descendants.map(d => d._id)];
        total = await Product.countDocuments({
          collections: { $in: allCollectionIds },
          status: 'active'
        });
      } else {
        total = 0;
      }
    } else {
      // Get products only from the specific collection
      const Collection = require('../models/Collection');
      const collection = await Collection.findByPath(path);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
      }

      products = await Product.find({
        collections: collection._id,
        status: 'active'
      })
        .sort(options.sort)
        .limit(options.limit)
        .skip(options.skip)
        .populate('collections', 'title handle level path parent');

      total = await Product.countDocuments({
        collections: collection._id,
        status: 'active'
      });
    }

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products by collection path error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by collection path',
      error: error.message
    });
  }
};

// Search products (public endpoint)
exports.searchProducts = async (req, res) => {
  try {
    const {
      q: query,
      category,
      tags,
      priceMin,
      priceMax,
      inStock,
      limit = 20,
      page = 1,
      sortBy = 'relevance'
    } = req.query;

    const options = {
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      inStock: inStock === 'true',
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: sortBy === 'price_asc' ? { 'priceRange.min': 1 } :
            sortBy === 'price_desc' ? { 'priceRange.min': -1 } :
            sortBy === 'newest' ? { createdAt: -1 } :
            sortBy === 'oldest' ? { createdAt: 1 } :
            sortBy === 'name_asc' ? { title: 1 } :
            sortBy === 'name_desc' ? { title: -1 } :
            { score: { $meta: 'textScore' }, createdAt: -1 }
    };

    const products = await Product.search(query, options);
    const total = await Product.countDocuments({
      status: 'active',
      publishedAt: { $lte: new Date() },
      ...(query && { $text: { $search: query } }),
      ...(category && { category }),
      ...(options.tags && { tags: { $in: options.tags } }),
      ...(options.priceMin !== undefined && { 'priceRange.min': { $gte: options.priceMin } }),
      ...(options.priceMax !== undefined && { 'priceRange.max': { $lte: options.priceMax } }),
      ...(options.inStock && { totalInventory: { $gt: 0 } })
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

// Update product inventory
exports.updateProductInventory = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.updateInventory(variantId, parseInt(quantity));

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        productId: id,
        variantId,
        newQuantity: parseInt(quantity)
      }
    });

  } catch (error) {
    console.error('Update product inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message
    });
  }
};
