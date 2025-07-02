const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Product = require('../models/Product');

// Get all published collections with hierarchy support
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      level,
      parentId,
      hierarchy = false
    } = req.query;

    // Build filter object for public collections
    let filter = {
      published: true,
      publishedAt: { $lte: new Date() }
    };

    // Level filter for hierarchy
    if (level !== undefined) {
      filter.level = parseInt(level);
    }

    // Parent filter for hierarchy
    if (parentId) {
      filter.parent = parentId;
    } else if (parentId === 'null') {
      filter.parent = null;
    }

    // If hierarchy is requested, return hierarchical structure
    if (hierarchy === 'true') {
      const hierarchicalCollections = await Collection.getCollectionHierarchy();
      return res.json({
        success: true,
        data: {
          collections: hierarchicalCollections,
          hierarchy: true
        }
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with hierarchy population
    const collections = await Collection.find(filter)
      .sort({ title: 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('parent', 'title handle level')
      .populate('children', 'title handle level');

    // Get total count
    const total = await Collection.countDocuments(filter);

    res.json({
      success: true,
      data: {
        collections,
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
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collections',
      error: error.message
    });
  }
});

// Get single collection by ID or handle
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let collection;

    // Check if id is a valid ObjectId or treat as handle
    if (require('mongoose').Types.ObjectId.isValid(id)) {
      collection = await Collection.findById(id)
        .populate('parent', 'title handle level')
        .populate('children', 'title handle level');
    } else {
      collection = await Collection.findOne({ handle: id, published: true })
        .populate('parent', 'title handle level')
        .populate('children', 'title handle level');
    }

    if (!collection || !collection.published) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Increment view count
    await collection.incrementView();

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
});

// Get collection by path
router.get('/path/:path', async (req, res) => {
  try {
    const { path } = req.params;
    
    const collection = await Collection.findByPath(path);
    
    if (!collection || !collection.published) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Populate hierarchy information
    await collection.populate('parent', 'title handle level');
    await collection.populate('children', 'title handle level');

    res.json({
      success: true,
      data: collection
    });

  } catch (error) {
    console.error('Get collection by path error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection',
      error: error.message
    });
  }
});

// Get collection breadcrumbs
router.get('/:id/breadcrumbs', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id);
    
    if (!collection || !collection.published) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }
    
    const breadcrumbs = await collection.getBreadcrumbs();
    
    res.json({
      success: true,
      data: breadcrumbs
    });
  } catch (error) {
    console.error('Get collection breadcrumbs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection breadcrumbs',
      error: error.message
    });
  }
});

// Get products in a collection
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeDescendants = false
    } = req.query;

    let collection;
    
    // Check if id is a valid ObjectId or treat as handle
    if (require('mongoose').Types.ObjectId.isValid(id)) {
      collection = await Collection.findById(id);
    } else {
      collection = await Collection.findOne({ handle: id, published: true });
    }

    if (!collection || !collection.published) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

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
      // Include products from child collections
      const descendants = await collection.getDescendants();
      const allCollectionIds = [collection._id, ...descendants.map(d => d._id)];
      
      products = await Product.find({
        collections: { $in: allCollectionIds },
        status: 'active'
      })
        .sort(options.sort)
        .limit(options.limit)
        .skip(options.skip)
        .populate('collections', 'title handle level path');

      total = await Product.countDocuments({
        collections: { $in: allCollectionIds },
        status: 'active'
      });
    } else {
      // Get products only from this collection
      products = await collection.getProducts(options);
      
      if (collection.collectionType === 'manual') {
        total = await Product.countDocuments({
          _id: { $in: collection.products },
          status: 'active'
        });
      } else {
        const filter = collection._buildSmartCollectionFilter();
        total = await Product.countDocuments(filter);
      }
    }

    res.json({
      success: true,
      data: {
        products,
        collection: {
          _id: collection._id,
          title: collection.title,
          handle: collection.handle,
          level: collection.level,
          path: collection.path
        },
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
    console.error('Get collection products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection products',
      error: error.message
    });
  }
});

module.exports = router;
