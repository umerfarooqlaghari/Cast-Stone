const User = require('../models/userModel');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Get all users with filtering and pagination (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    let filter = {};

    // Search filter (by name or email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter (if you have user status field)
    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'email', 'lastLogin'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('-password') // Exclude password field
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get user statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userStats = await Order.aggregate([
          { $match: { customerId: user._id } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$totalPrice' },
              averageOrderValue: { $avg: '$totalPrice' },
              lastOrderDate: { $max: '$createdAt' }
            }
          }
        ]);

        const stats = userStats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          lastOrderDate: null
        };

        return {
          ...user,
          orderStats: stats
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
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
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get single user with detailed information (Admin only)
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's order history
    const orders = await Order.find({ customerId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber totalPrice financialStatus fulfillmentStatus createdAt')
      .lean();

    // Get user statistics
    const userStats = await Order.aggregate([
      { $match: { customerId: mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          firstOrderDate: { $min: '$createdAt' },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    const stats = userStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      firstOrderDate: null,
      lastOrderDate: null
    };

    // Get user's favorite products (most ordered)
    const favoriteProducts = await Order.aggregate([
      { $match: { customerId: mongoose.Types.ObjectId(id) } },
      { $unwind: '$lineItems' },
      {
        $group: {
          _id: '$lineItems.productId',
          totalQuantity: { $sum: '$lineItems.quantity' },
          totalSpent: { $sum: { $multiply: ['$lineItems.price', '$lineItems.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
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
          title: '$product.title',
          handle: '$product.handle',
          totalQuantity: 1,
          totalSpent: 1,
          orderCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user,
        orderStats: stats,
        recentOrders: orders,
        favoriteProducts
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Update user information (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove sensitive fields that shouldn't be updated this way
    delete updateData.password;
    delete updateData._id;
    delete updateData.__v;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    Object.assign(user, updateData);
    await user.save();

    // Return user without password
    const updatedUser = await User.findById(id).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    
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
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has orders
    const orderCount = await Order.countDocuments({ customerId: id });
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${orderCount} orders. Consider deactivating instead.`
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Get user analytics (Admin only)
exports.getUserAnalytics = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      period = '30' // days
    } = req.query;

    // Calculate date range
    const endDate = dateTo ? new Date(dateTo) : new Date();
    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Get user registration trends
    const registrationTrends = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get user activity statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments(dateFilter);
    const activeUsers = await Order.distinct('customerId', dateFilter).then(ids => ids.length);

    // Get user segmentation by order count
    const userSegmentation = await Order.aggregate([
      {
        $group: {
          _id: '$customerId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      },
      {
        $bucket: {
          groupBy: '$orderCount',
          boundaries: [1, 2, 5, 10, 20, 50],
          default: '50+',
          output: {
            userCount: { $sum: 1 },
            averageSpent: { $avg: '$totalSpent' },
            totalRevenue: { $sum: '$totalSpent' }
          }
        }
      }
    ]);

    // Get top customers by spending
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalPrice' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          customerId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          orderCount: 1,
          averageOrderValue: 1,
          lastOrderDate: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          newUsers,
          activeUsers,
          userGrowthRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : 0
        },
        registrationTrends,
        userSegmentation,
        topCustomers
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
};
