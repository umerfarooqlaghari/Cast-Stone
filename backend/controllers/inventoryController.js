const { InventoryItem, InventoryMovement, InventoryTransfer, Location } = require('../models/Inventory');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get all inventory items with filtering and pagination
exports.getAllInventoryItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      locationId,
      productId,
      lowStock,
      outOfStock,
      sortBy = 'lastMovementDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    let filter = {};

    // Location filter
    if (locationId) {
      filter.locationId = locationId;
    }

    // Product filter
    if (productId) {
      filter.productId = productId;
    }

    // Stock level filters
    if (lowStock === 'true') {
      filter.lowStockAlert = true;
    }

    if (outOfStock === 'true') {
      filter.outOfStockAlert = true;
    }

    // Search filter (by SKU or product name)
    if (search) {
      const products = await Product.find({
        $text: { $search: search }
      }).select('_id');
      
      const productIds = products.map(p => p._id);
      
      filter.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { productId: { $in: productIds } }
      ];
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['lastMovementDate', 'available', 'onHand', 'sku', 'lowStockThreshold'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'lastMovementDate';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const inventoryItems = await InventoryItem.find(filter)
      .populate('productId', 'title handle')
      .populate('locationId', 'name type')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await InventoryItem.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        inventoryItems,
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
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory items',
      error: error.message
    });
  }
};

// Get single inventory item
exports.getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const inventoryItem = await InventoryItem.findById(id)
      .populate('productId', 'title handle variants')
      .populate('locationId', 'name type address');

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: inventoryItem
    });

  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory item',
      error: error.message
    });
  }
};

// Create inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const {
      productId,
      variantId,
      locationId,
      sku,
      available,
      onHand,
      lowStockThreshold,
      outOfStockThreshold,
      unitCost
    } = req.body;

    // Validate required fields
    if (!productId || !variantId || !locationId || !sku) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, variant ID, location ID, and SKU are required'
      });
    }

    // Check if product and location exist
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Check if inventory item already exists for this product/variant/location
    const existingItem = await InventoryItem.findOne({
      productId,
      variantId,
      locationId
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Inventory item already exists for this product variant at this location'
      });
    }

    // Create inventory item
    const inventoryItem = new InventoryItem({
      productId,
      variantId,
      locationId,
      sku,
      available: parseInt(available) || 0,
      onHand: parseInt(onHand) || parseInt(available) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 10,
      outOfStockThreshold: parseInt(outOfStockThreshold) || 0,
      unitCost: parseFloat(unitCost) || 0
    });

    await inventoryItem.save();

    // Populate the response
    const populatedItem = await InventoryItem.findById(inventoryItem._id)
      .populate('productId', 'title handle')
      .populate('locationId', 'name type');

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: populatedItem
    });

  } catch (error) {
    console.error('Create inventory item error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Inventory item already exists for this product variant at this location'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating inventory item',
      error: error.message
    });
  }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const inventoryItem = await InventoryItem.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Convert numeric fields
    if (updateData.available !== undefined) updateData.available = parseInt(updateData.available);
    if (updateData.onHand !== undefined) updateData.onHand = parseInt(updateData.onHand);
    if (updateData.committed !== undefined) updateData.committed = parseInt(updateData.committed);
    if (updateData.reserved !== undefined) updateData.reserved = parseInt(updateData.reserved);
    if (updateData.lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(updateData.lowStockThreshold);
    if (updateData.outOfStockThreshold !== undefined) updateData.outOfStockThreshold = parseInt(updateData.outOfStockThreshold);
    if (updateData.unitCost !== undefined) updateData.unitCost = parseFloat(updateData.unitCost);

    // Update the inventory item
    Object.assign(inventoryItem, updateData);
    await inventoryItem.save();

    // Populate the response
    const populatedItem = await InventoryItem.findById(inventoryItem._id)
      .populate('productId', 'title handle')
      .populate('locationId', 'name type');

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: populatedItem
    });

  } catch (error) {
    console.error('Update inventory item error:', error);
    
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
      message: 'Error updating inventory item',
      error: error.message
    });
  }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const inventoryItem = await InventoryItem.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Delete associated movements
    await InventoryMovement.deleteMany({ inventoryItemId: id });

    // Delete the inventory item
    await InventoryItem.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });

  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory item',
      error: error.message
    });
  }
};

// Adjust inventory stock
exports.adjustInventoryStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason, notes } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    const inventoryItem = await InventoryItem.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Perform the adjustment
    await inventoryItem.adjustStock(
      parseInt(quantity),
      'adjustment',
      reason || 'Manual adjustment',
      req.admin._id,
      `ADJ-${Date.now()}`
    );

    // Get updated item
    const updatedItem = await InventoryItem.findById(id)
      .populate('productId', 'title handle')
      .populate('locationId', 'name type');

    res.json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Adjust inventory stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adjusting inventory',
      error: error.message
    });
  }
};

// Reserve inventory stock
exports.reserveInventoryStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, referenceId, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        message: 'Reference ID is required'
      });
    }

    const inventoryItem = await InventoryItem.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Reserve the stock
    await inventoryItem.reserveStock(
      parseInt(quantity),
      referenceId,
      req.admin._id
    );

    // Get updated item
    const updatedItem = await InventoryItem.findById(id)
      .populate('productId', 'title handle')
      .populate('locationId', 'name type');

    res.json({
      success: true,
      message: 'Inventory reserved successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Reserve inventory stock error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error reserving inventory',
      error: error.message
    });
  }
};

// Release inventory reservation
exports.releaseInventoryReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, referenceId } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        message: 'Reference ID is required'
      });
    }

    const inventoryItem = await InventoryItem.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Release the reservation
    await inventoryItem.releaseReservation(
      parseInt(quantity),
      referenceId,
      req.admin._id
    );

    // Get updated item
    const updatedItem = await InventoryItem.findById(id)
      .populate('productId', 'title handle')
      .populate('locationId', 'name type');

    res.json({
      success: true,
      message: 'Inventory reservation released successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Release inventory reservation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error releasing inventory reservation',
      error: error.message
    });
  }
};

// Get inventory movements
exports.getInventoryMovements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      inventoryItemId,
      productId,
      locationId,
      type,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    let filter = {};

    if (inventoryItemId) filter.inventoryItemId = inventoryItemId;
    if (productId) filter.productId = productId;
    if (locationId) filter.locationId = locationId;
    if (type) filter.type = type;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'type', 'quantity'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const movements = await InventoryMovement.find(filter)
      .populate('inventoryItemId', 'sku')
      .populate('productId', 'title handle')
      .populate('locationId', 'name type')
      .populate('userId', 'name email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await InventoryMovement.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        movements,
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
    console.error('Get inventory movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory movements',
      error: error.message
    });
  }
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      locationId,
      sortBy = 'available',
      sortOrder = 'asc'
    } = req.query;

    // Build filter for low stock items
    let filter = {
      $or: [
        { lowStockAlert: true },
        { outOfStockAlert: true }
      ]
    };

    if (locationId) {
      filter.locationId = locationId;
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['available', 'lowStockThreshold', 'lastMovementDate'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'available';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lowStockItems = await InventoryItem.find(filter)
      .populate('productId', 'title handle')
      .populate('locationId', 'name type')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await InventoryItem.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get summary statistics
    const lowStockCount = await InventoryItem.countDocuments({ lowStockAlert: true });
    const outOfStockCount = await InventoryItem.countDocuments({ outOfStockAlert: true });

    res.json({
      success: true,
      data: {
        lowStockItems,
        summary: {
          lowStockCount,
          outOfStockCount,
          totalAlerts: lowStockCount + outOfStockCount
        },
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
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock alerts',
      error: error.message
    });
  }
};

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const { isActive } = req.query;

    let filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const locations = await Location.find(filter)
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      data: locations
    });

  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
};

// Create location
exports.createLocation = async (req, res) => {
  try {
    const { name, address, type } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }

    const location = new Location({
      name: name.trim(),
      address,
      type: type || 'warehouse'
    });

    await location.save();

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location
    });

  } catch (error) {
    console.error('Create location error:', error);

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
      message: 'Error creating location',
      error: error.message
    });
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    Object.assign(location, updateData);
    await location.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: location
    });

  } catch (error) {
    console.error('Update location error:', error);

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
      message: 'Error updating location',
      error: error.message
    });
  }
};

// Create inventory transfer
exports.createInventoryTransfer = async (req, res) => {
  try {
    const {
      fromLocationId,
      toLocationId,
      items,
      notes
    } = req.body;

    // Validate required fields
    if (!fromLocationId || !toLocationId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'From location, to location, and items are required'
      });
    }

    if (fromLocationId === toLocationId) {
      return res.status(400).json({
        success: false,
        message: 'From and to locations cannot be the same'
      });
    }

    // Validate locations exist
    const fromLocation = await Location.findById(fromLocationId);
    const toLocation = await Location.findById(toLocationId);

    if (!fromLocation || !toLocation) {
      return res.status(404).json({
        success: false,
        message: 'One or both locations not found'
      });
    }

    // Validate items and check availability
    const validatedItems = [];
    for (const item of items) {
      const { productId, variantId, quantity, unitCost } = item;

      if (!productId || !variantId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have productId, variantId, and valid quantity'
        });
      }

      // Check if inventory item exists at from location
      const inventoryItem = await InventoryItem.findOne({
        productId,
        variantId,
        locationId: fromLocationId
      });

      if (!inventoryItem) {
        return res.status(400).json({
          success: false,
          message: `No inventory found for product variant at source location`
        });
      }

      if (inventoryItem.available < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock available for transfer. Available: ${inventoryItem.available}, Requested: ${quantity}`
        });
      }

      validatedItems.push({
        productId,
        variantId,
        sku: inventoryItem.sku,
        quantity: parseInt(quantity),
        unitCost: parseFloat(unitCost) || inventoryItem.unitCost || 0
      });
    }

    // Create the transfer
    const transfer = new InventoryTransfer({
      fromLocationId,
      toLocationId,
      items: validatedItems,
      notes,
      createdBy: req.admin._id
    });

    await transfer.save();

    // Populate the response
    const populatedTransfer = await InventoryTransfer.findById(transfer._id)
      .populate('fromLocationId', 'name type')
      .populate('toLocationId', 'name type')
      .populate('createdBy', 'name email')
      .populate('items.productId', 'title handle');

    res.status(201).json({
      success: true,
      message: 'Inventory transfer created successfully',
      data: populatedTransfer
    });

  } catch (error) {
    console.error('Create inventory transfer error:', error);

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
      message: 'Error creating inventory transfer',
      error: error.message
    });
  }
};

// Get all inventory transfers
exports.getAllInventoryTransfers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      fromLocationId,
      toLocationId,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    let filter = {};

    if (status) filter.status = status;
    if (fromLocationId) filter.fromLocationId = fromLocationId;
    if (toLocationId) filter.toLocationId = toLocationId;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'updatedAt', 'transferNumber', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transfers = await InventoryTransfer.find(filter)
      .populate('fromLocationId', 'name type')
      .populate('toLocationId', 'name type')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await InventoryTransfer.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        transfers,
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
    console.error('Get inventory transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory transfers',
      error: error.message
    });
  }
};

// Get inventory analytics
exports.getInventoryAnalytics = async (req, res) => {
  try {
    const { locationId, dateFrom, dateTo } = req.query;

    // Build base filter
    let filter = {};
    if (locationId) filter.locationId = locationId;

    // Get inventory summary
    const totalItems = await InventoryItem.countDocuments(filter);
    const lowStockItems = await InventoryItem.countDocuments({ ...filter, lowStockAlert: true });
    const outOfStockItems = await InventoryItem.countDocuments({ ...filter, outOfStockAlert: true });

    // Calculate total inventory value
    const inventoryValue = await InventoryItem.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$totalValue' },
          totalQuantity: { $sum: '$onHand' }
        }
      }
    ]);

    // Get movement statistics
    let movementFilter = {};
    if (locationId) movementFilter.locationId = locationId;
    if (dateFrom || dateTo) {
      movementFilter.createdAt = {};
      if (dateFrom) movementFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) movementFilter.createdAt.$lte = new Date(dateTo);
    }

    const movementStats = await InventoryMovement.aggregate([
      { $match: movementFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Get top products by movement
    const topMovedProducts = await InventoryMovement.aggregate([
      { $match: movementFilter },
      {
        $group: {
          _id: '$productId',
          totalMovements: { $sum: 1 },
          totalQuantity: { $sum: { $abs: '$quantity' } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productTitle: '$product.title',
          totalMovements: 1,
          totalQuantity: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          lowStockItems,
          outOfStockItems,
          totalValue: inventoryValue[0]?.totalValue || 0,
          totalQuantity: inventoryValue[0]?.totalQuantity || 0
        },
        movementStats,
        topMovedProducts
      }
    });

  } catch (error) {
    console.error('Get inventory analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory analytics',
      error: error.message
    });
  }
};
