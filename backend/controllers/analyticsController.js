const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/userModel');
const { InventoryItem } = require('../models/Inventory');
const mongoose = require('mongoose');

// Get dashboard overview analytics
exports.getDashboardOverview = async (req, res) => {
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

    // Get total counts
    const totalProducts = await Product.countDocuments({ status: 'active' });
    const totalOrders = await Order.countDocuments(dateFilter);
    const totalUsers = await User.countDocuments(dateFilter);

    // Get revenue data
    const revenueData = await Order.aggregate([
      { $match: { ...dateFilter, financialStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, averageOrderValue: 0, orderCount: 0 };

    // Get previous period for comparison
    const prevStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const prevDateFilter = {
      createdAt: {
        $gte: prevStartDate,
        $lt: startDate
      }
    };

    const prevRevenueData = await Order.aggregate([
      { $match: { ...prevDateFilter, financialStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const prevRevenue = prevRevenueData[0] || { totalRevenue: 0, orderCount: 0 };
    const prevUserCount = await User.countDocuments(prevDateFilter);

    // Calculate growth percentages
    const revenueGrowth = prevRevenue.totalRevenue > 0 
      ? ((revenue.totalRevenue - prevRevenue.totalRevenue) / prevRevenue.totalRevenue * 100).toFixed(1)
      : revenue.totalRevenue > 0 ? 100 : 0;

    const orderGrowth = prevRevenue.orderCount > 0
      ? ((revenue.orderCount - prevRevenue.orderCount) / prevRevenue.orderCount * 100).toFixed(1)
      : revenue.orderCount > 0 ? 100 : 0;

    const userGrowth = prevUserCount > 0
      ? ((totalUsers - prevUserCount) / prevUserCount * 100).toFixed(1)
      : totalUsers > 0 ? 100 : 0;

    // Get recent orders
    const recentOrders = await Order.find(dateFilter)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalPrice financialStatus fulfillmentStatus createdAt customer')
      .lean();

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$lineItems' },
      {
        $group: {
          _id: '$lineItems.productId',
          totalSales: { $sum: '$lineItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$lineItems.price', '$lineItems.quantity'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
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
          totalSales: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Get inventory alerts
    const lowStockCount = await InventoryItem.countDocuments({ lowStockAlert: true });
    const outOfStockCount = await InventoryItem.countDocuments({ outOfStockAlert: true });

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue: revenue.totalRevenue,
          averageOrderValue: revenue.averageOrderValue,
          revenueGrowth: parseFloat(revenueGrowth),
          orderGrowth: parseFloat(orderGrowth),
          userGrowth: parseFloat(userGrowth)
        },
        recentOrders,
        topProducts,
        inventoryAlerts: {
          lowStockCount,
          outOfStockCount
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      groupBy = 'day' // day, week, month, year
    } = req.query;

    // Calculate date range (default to last 30 days)
    const endDate = dateTo ? new Date(dateTo) : new Date();
    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      financialStatus: 'paid'
    };

    // Define grouping format based on period
    let groupByFormat;
    switch (groupBy) {
      case 'week':
        groupByFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        groupByFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'year':
        groupByFormat = {
          year: { $year: '$createdAt' }
        };
        break;
      default: // day
        groupByFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    // Get revenue over time
    const revenueOverTime = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupByFormat,
          revenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Get revenue by product category
    const revenueByCategory = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$lineItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'lineItems.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$lineItems.price', '$lineItems.quantity'] } },
          quantity: { $sum: '$lineItems.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Get payment method breakdown
    const paymentMethodBreakdown = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentDetails.paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Calculate totals
    const totals = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalPrice' },
          totalTax: { $sum: '$totalTax' },
          totalShipping: { $sum: '$totalShipping' },
          totalDiscounts: { $sum: '$totalDiscounts' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totals: totals[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          totalTax: 0,
          totalShipping: 0,
          totalDiscounts: 0
        },
        revenueOverTime,
        revenueByCategory,
        paymentMethodBreakdown
      }
    });

  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
      error: error.message
    });
  }
};

// Get product analytics
exports.getProductAnalytics = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      limit = 20
    } = req.query;

    // Calculate date range (default to last 30 days)
    const endDate = dateTo ? new Date(dateTo) : new Date();
    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Get product performance
    const productPerformance = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$lineItems' },
      {
        $group: {
          _id: '$lineItems.productId',
          totalQuantitySold: { $sum: '$lineItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$lineItems.price', '$lineItems.quantity'] } },
          orderCount: { $sum: 1 },
          averagePrice: { $avg: '$lineItems.price' }
        }
      },
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
          category: '$product.category',
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1,
          averagePrice: 1,
          conversionRate: {
            $cond: {
              if: { $gt: ['$product.viewCount', 0] },
              then: { $multiply: [{ $divide: ['$orderCount', '$product.viewCount'] }, 100] },
              else: 0
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Get category performance
    const categoryPerformance = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$lineItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'lineItems.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalQuantitySold: { $sum: '$lineItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$lineItems.price', '$lineItems.quantity'] } },
          uniqueProducts: { $addToSet: '$lineItems.productId' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          totalQuantitySold: 1,
          totalRevenue: 1,
          uniqueProductCount: { $size: '$uniqueProducts' },
          orderCount: 1,
          averageOrderValue: { $divide: ['$totalRevenue', '$orderCount'] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Get inventory status
    const inventoryStatus = await InventoryItem.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalItems: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          lowStockItems: {
            $sum: { $cond: [{ $eq: ['$lowStockAlert', true] }, 1, 0] }
          },
          outOfStockItems: {
            $sum: { $cond: [{ $eq: ['$outOfStockAlert', true] }, 1, 0] }
          },
          totalQuantity: { $sum: '$onHand' }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        productPerformance,
        categoryPerformance,
        inventoryStatus
      }
    });

  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product analytics',
      error: error.message
    });
  }
};

// Get customer analytics
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      limit = 20
    } = req.query;

    // Calculate date range (default to last 30 days)
    const endDate = dateTo ? new Date(dateTo) : new Date();
    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Get customer statistics
    const customerStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$customerId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' },
          email: { $first: '$email' },
          name: { $first: '$name' }
        }
      },
      {
        $project: {
          customerId: '$_id',
          email: 1,
          name: 1,
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: 1,
          firstOrder: 1,
          lastOrder: 1,
          customerLifetimeValue: '$totalSpent',
          daysSinceFirstOrder: {
            $divide: [
              { $subtract: [new Date(), '$firstOrder'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Get new vs returning customers
    const customerSegmentation = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$customerId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$orderCount', 1] },
              'new',
              'returning'
            ]
          },
          customerCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' },
          averageSpent: { $avg: '$totalSpent' }
        }
      }
    ]);

    // Get customer acquisition over time
    const customerAcquisition = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get geographic distribution (if available)
    const geographicDistribution = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$shippingAddress.country',
          orderCount: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          uniqueCustomers: { $addToSet: '$customerId' }
        }
      },
      {
        $project: {
          country: '$_id',
          orderCount: 1,
          revenue: 1,
          customerCount: { $size: '$uniqueCustomers' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        topCustomers: customerStats,
        customerSegmentation,
        customerAcquisition,
        geographicDistribution
      }
    });

  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer analytics',
      error: error.message
    });
  }
};

// Get inventory analytics
exports.getInventoryAnalytics = async (req, res) => {
  try {
    const { locationId } = req.query;

    let filter = {};
    if (locationId) {
      filter.locationId = locationId;
    }

    // Get inventory summary
    const inventorySummary = await InventoryItem.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          totalQuantity: { $sum: '$onHand' },
          lowStockItems: {
            $sum: { $cond: [{ $eq: ['$lowStockAlert', true] }, 1, 0] }
          },
          outOfStockItems: {
            $sum: { $cond: [{ $eq: ['$outOfStockAlert', true] }, 1, 0] }
          },
          averageValue: { $avg: '$totalValue' }
        }
      }
    ]);

    // Get inventory by category
    const inventoryByCategory = await InventoryItem.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalItems: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
          totalQuantity: { $sum: '$onHand' },
          lowStockItems: {
            $sum: { $cond: [{ $eq: ['$lowStockAlert', true] }, 1, 0] }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Get top value items
    const topValueItems = await InventoryItem.find(filter)
      .populate('productId', 'title handle category')
      .populate('locationId', 'name type')
      .sort({ totalValue: -1 })
      .limit(20)
      .select('sku totalValue onHand unitCost lowStockAlert outOfStockAlert')
      .lean();

    // Get items needing attention
    const itemsNeedingAttention = await InventoryItem.find({
      ...filter,
      $or: [
        { lowStockAlert: true },
        { outOfStockAlert: true }
      ]
    })
      .populate('productId', 'title handle category')
      .populate('locationId', 'name type')
      .sort({ available: 1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: {
        summary: inventorySummary[0] || {
          totalItems: 0,
          totalValue: 0,
          totalQuantity: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          averageValue: 0
        },
        inventoryByCategory,
        topValueItems,
        itemsNeedingAttention
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

// Get sales trends
exports.getSalesTrends = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      period = 'daily' // daily, weekly, monthly
    } = req.query;

    // Calculate date range (default to last 90 days for trends)
    const endDate = dateTo ? new Date(dateTo) : new Date();
    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Define grouping based on period
    let groupBy;
    switch (period) {
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // daily
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    // Get sales trends
    const salesTrends = await Order.aggregate([
      { $match: { ...dateFilter, financialStatus: 'paid' } },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalPrice' },
          uniqueCustomers: { $addToSet: '$customerId' }
        }
      },
      {
        $project: {
          period: '$_id',
          revenue: 1,
          orderCount: 1,
          averageOrderValue: 1,
          uniqueCustomers: { $size: '$uniqueCustomers' }
        }
      },
      { $sort: { 'period.year': 1, 'period.month': 1, 'period.day': 1, 'period.week': 1 } }
    ]);

    // Calculate growth rates
    const trendsWithGrowth = salesTrends.map((current, index) => {
      if (index === 0) {
        return { ...current, revenueGrowth: 0, orderGrowth: 0 };
      }

      const previous = salesTrends[index - 1];
      const revenueGrowth = previous.revenue > 0
        ? ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(1)
        : 0;
      const orderGrowth = previous.orderCount > 0
        ? ((current.orderCount - previous.orderCount) / previous.orderCount * 100).toFixed(1)
        : 0;

      return {
        ...current,
        revenueGrowth: parseFloat(revenueGrowth),
        orderGrowth: parseFloat(orderGrowth)
      };
    });

    res.json({
      success: true,
      data: {
        trends: trendsWithGrowth,
        period,
        dateRange: {
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    console.error('Get sales trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales trends',
      error: error.message
    });
  }
};
