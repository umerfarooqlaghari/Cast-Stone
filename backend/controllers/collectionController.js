const Collection = require('../models/Collection');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get all collections with filtering and pagination
exports.getAllCollections = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      collectionType,
      published,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    let filter = {};

    // Published filter (for admin, show all; for public, only published)
    if (req.admin) {
      if (published !== undefined) filter.published = published === 'true';
    } else {
      filter.published = true;
      filter.publishedAt = { $lte: new Date() };
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Collection type filter
    if (collectionType) {
      filter.collectionType = collectionType;
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'viewCount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const collections = await Collection.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Collection.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        collections,
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
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collections',
      error: error.message
    });
  }
};

// Get single collection by ID or handle
exports.getCollection = async (req, res) => {
  try {
    const { id } = req.params;
    let collection;

    // Check if id is a valid ObjectId or treat as handle
    if (mongoose.Types.ObjectId.isValid(id)) {
      collection = await Collection.findById(id);
    } else {
      collection = await Collection.findByHandle(id);
    }

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Increment view count if not admin request
    if (!req.admin) {
      await collection.incrementView();
    }

    res.json({
      success: true,
      data: collection
    });

  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection',
      error: error.message
    });
  }
};

// Create a new collection
exports.createCollection = async (req, res) => {
  try {
    const {
      title,
      description,
      collectionType,
      rules,
      disjunctive,
      products,
      sortOrder,
      seo,
      image,
      templateSuffix,
      metafields
    } = req.body;

    // Validate required fields
    if (!title || !collectionType) {
      return res.status(400).json({
        success: false,
        message: 'Title and collection type are required'
      });
    }

    // Validate collection type
    if (!['manual', 'smart'].includes(collectionType)) {
      return res.status(400).json({
        success: false,
        message: 'Collection type must be either "manual" or "smart"'
      });
    }

    // Create collection data
    const collectionData = {
      title: title.trim(),
      description,
      collectionType,
      sortOrder: sortOrder || 'manual',
      templateSuffix,
      published: false // Start as unpublished
    };

    // Handle smart collection rules
    if (collectionType === 'smart') {
      if (!rules || !Array.isArray(rules) || rules.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Smart collections require at least one rule'
        });
      }
      collectionData.rules = rules;
      collectionData.disjunctive = disjunctive || false;
    }

    // Handle manual collection products
    if (collectionType === 'manual' && products && Array.isArray(products)) {
      // Validate that all product IDs exist
      const validProducts = await Product.find({ _id: { $in: products } });
      if (validProducts.length !== products.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more product IDs are invalid'
        });
      }
      collectionData.products = products;
    }

    // Handle SEO data
    if (seo) {
      collectionData.seo = {
        title: seo.title,
        description: seo.description,
        keywords: Array.isArray(seo.keywords) ? seo.keywords : (seo.keywords ? seo.keywords.split(',').map(k => k.trim()) : [])
      };
    }

    // Handle image
    if (image) {
      collectionData.image = image;
    }

    // Handle metafields
    if (metafields && Array.isArray(metafields)) {
      collectionData.metafields = metafields;
    }

    // Create the collection
    const collection = new Collection(collectionData);
    await collection.save();

    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: collection
    });

  } catch (error) {
    console.error('Create collection error:', error);
    
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
        message: 'Collection with this handle already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating collection',
      error: error.message
    });
  }
};

// Update collection
exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find the collection
    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Handle collection type change
    if (updateData.collectionType && updateData.collectionType !== collection.collectionType) {
      if (updateData.collectionType === 'smart') {
        // Changing to smart collection - require rules
        if (!updateData.rules || !Array.isArray(updateData.rules) || updateData.rules.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Smart collections require at least one rule'
          });
        }
        // Clear manual products
        updateData.products = [];
      } else if (updateData.collectionType === 'manual') {
        // Changing to manual collection - clear rules
        updateData.rules = [];
        updateData.disjunctive = false;
      }
    }

    // Handle manual collection products update
    if (collection.collectionType === 'manual' && updateData.products && Array.isArray(updateData.products)) {
      // Validate that all product IDs exist
      const validProducts = await Product.find({ _id: { $in: updateData.products } });
      if (validProducts.length !== updateData.products.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more product IDs are invalid'
        });
      }
    }

    // Update the collection
    Object.assign(collection, updateData);
    await collection.save();

    res.json({
      success: true,
      message: 'Collection updated successfully',
      data: collection
    });

  } catch (error) {
    console.error('Update collection error:', error);
    
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
      message: 'Error updating collection',
      error: error.message
    });
  }
};

// Delete collection
exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Delete the collection
    await Collection.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });

  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting collection',
      error: error.message
    });
  }
};

// Publish collection
exports.publishCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    await collection.publish();

    res.json({
      success: true,
      message: 'Collection published successfully',
      data: collection
    });

  } catch (error) {
    console.error('Publish collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing collection',
      error: error.message
    });
  }
};

// Unpublish collection
exports.unpublishCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    await collection.unpublish();

    res.json({
      success: true,
      message: 'Collection unpublished successfully',
      data: collection
    });

  } catch (error) {
    console.error('Unpublish collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unpublishing collection',
      error: error.message
    });
  }
};

// Get collection products
exports.getCollectionProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy,
      sortOrder = 'asc'
    } = req.query;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Get sort options
    let sort = null;
    if (sortBy) {
      sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Get products for this collection
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort
    };

    const products = await collection.getProducts(options);

    // Get total count
    let total;
    if (collection.collectionType === 'manual') {
      total = await Product.countDocuments({
        _id: { $in: collection.products },
        status: 'active'
      });
    } else {
      const filter = collection._buildSmartCollectionFilter();
      total = await Product.countDocuments(filter);
    }

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
    console.error('Get collection products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection products',
      error: error.message
    });
  }
};

// Add product to manual collection
exports.addProductToCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    if (collection.collectionType !== 'manual') {
      return res.status(400).json({
        success: false,
        message: 'Can only add products to manual collections'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await collection.addProduct(productId);

    res.json({
      success: true,
      message: 'Product added to collection successfully'
    });

  } catch (error) {
    console.error('Add product to collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product to collection',
      error: error.message
    });
  }
};

// Remove product from manual collection
exports.removeProductFromCollection = async (req, res) => {
  try {
    const { id, productId } = req.params;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    if (collection.collectionType !== 'manual') {
      return res.status(400).json({
        success: false,
        message: 'Can only remove products from manual collections'
      });
    }

    await collection.removeProduct(productId);

    res.json({
      success: true,
      message: 'Product removed from collection successfully'
    });

  } catch (error) {
    console.error('Remove product from collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing product from collection',
      error: error.message
    });
  }
};

// Bulk add products to manual collection
exports.bulkAddProductsToCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    if (collection.collectionType !== 'manual') {
      return res.status(400).json({
        success: false,
        message: 'Can only add products to manual collections'
      });
    }

    // Verify all products exist
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found'
      });
    }

    // Add products to collection
    const addedProducts = [];
    for (const productId of productIds) {
      try {
        await collection.addProduct(productId);
        addedProducts.push(productId);
      } catch (error) {
        console.warn(`Failed to add product ${productId} to collection:`, error.message);
      }
    }

    res.json({
      success: true,
      message: `${addedProducts.length} products added to collection successfully`,
      data: {
        collectionId: id,
        addedProducts,
        totalAdded: addedProducts.length
      }
    });

  } catch (error) {
    console.error('Bulk add products to collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding products to collection',
      error: error.message
    });
  }
};

// Test smart collection rules
exports.testSmartCollectionRules = async (req, res) => {
  try {
    const { rules, disjunctive } = req.body;

    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rules array is required'
      });
    }

    // Create a temporary collection to test the rules
    const tempCollection = new Collection({
      title: 'Test Collection',
      collectionType: 'smart',
      rules,
      disjunctive: disjunctive || false
    });

    // Get products that would match these rules
    const filter = tempCollection._buildSmartCollectionFilter();
    const products = await Product.find(filter)
      .limit(50) // Limit for testing
      .select('title handle priceRange.min category tags status')
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        matchingProducts: products,
        totalMatches: total,
        previewCount: Math.min(products.length, 50)
      }
    });

  } catch (error) {
    console.error('Test smart collection rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing collection rules',
      error: error.message
    });
  }
};
