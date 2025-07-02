const { notificationService, NOTIFICATION_TYPES } = require('../services/notificationService');
const { InventoryItem } = require('../models/Inventory');
const Order = require('../models/Order');

// Get notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    // This would typically come from a settings model
    // For now, return default settings
    const settings = {
      emailNotifications: {
        enabled: true,
        lowStockAlerts: true,
        outOfStockAlerts: true,
        orderNotifications: true,
        paymentFailures: true,
        systemErrors: true
      },
      thresholds: {
        lowStockThreshold: 10,
        criticalStockThreshold: 5
      },
      schedules: {
        inventoryCheckInterval: 60, // minutes
        dailyReportTime: '09:00'
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification settings',
      error: error.message
    });
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const settings = req.body;

    // Here you would typically save to a settings model
    // For now, just return the updated settings
    console.log('Notification settings updated:', settings);

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
      error: error.message
    });
  }
};

// Get current alerts
exports.getCurrentAlerts = async (req, res) => {
  try {
    // Get inventory alerts
    const lowStockItems = await InventoryItem.find({ lowStockAlert: true })
      .populate('productId', 'title handle')
      .populate('locationId', 'name')
      .select('sku available lowStockThreshold')
      .lean();

    const outOfStockItems = await InventoryItem.find({ outOfStockAlert: true })
      .populate('productId', 'title handle')
      .populate('locationId', 'name')
      .select('sku available')
      .lean();

    // Get recent failed orders
    const failedOrders = await Order.find({
      financialStatus: 'pending',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
      .select('orderNumber totalPrice customer email createdAt')
      .limit(10)
      .lean();

    // Get orders needing fulfillment
    const pendingFulfillment = await Order.find({
      fulfillmentStatus: 'unfulfilled',
      financialStatus: 'paid'
    })
      .select('orderNumber totalPrice customer email createdAt')
      .limit(10)
      .lean();

    const alerts = {
      inventory: {
        lowStock: lowStockItems.map(item => ({
          id: item._id,
          productTitle: item.productId?.title || 'Unknown Product',
          sku: item.sku,
          available: item.available,
          threshold: item.lowStockThreshold,
          location: item.locationId?.name || 'Unknown Location',
          severity: 'warning'
        })),
        outOfStock: outOfStockItems.map(item => ({
          id: item._id,
          productTitle: item.productId?.title || 'Unknown Product',
          sku: item.sku,
          available: item.available,
          location: item.locationId?.name || 'Unknown Location',
          severity: 'critical'
        }))
      },
      orders: {
        failed: failedOrders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.firstName ? 
            `${order.customer.firstName} ${order.customer.lastName}` : 
            order.email,
          amount: order.totalPrice,
          createdAt: order.createdAt,
          severity: 'error'
        })),
        pendingFulfillment: pendingFulfillment.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.firstName ? 
            `${order.customer.firstName} ${order.customer.lastName}` : 
            order.email,
          amount: order.totalPrice,
          createdAt: order.createdAt,
          severity: 'info'
        }))
      }
    };

    // Calculate summary
    const summary = {
      total: lowStockItems.length + outOfStockItems.length + failedOrders.length + pendingFulfillment.length,
      critical: outOfStockItems.length,
      warning: lowStockItems.length,
      error: failedOrders.length,
      info: pendingFulfillment.length
    };

    res.json({
      success: true,
      data: {
        alerts,
        summary
      }
    });
  } catch (error) {
    console.error('Get current alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current alerts',
      error: error.message
    });
  }
};

// Manually trigger inventory check
exports.triggerInventoryCheck = async (req, res) => {
  try {
    const result = await notificationService.checkInventoryAlerts();

    res.json({
      success: true,
      message: 'Inventory check completed',
      data: result
    });
  } catch (error) {
    console.error('Trigger inventory check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering inventory check',
      error: error.message
    });
  }
};

// Send test notification
exports.sendTestNotification = async (req, res) => {
  try {
    const { type, recipients } = req.body;

    let result;
    switch (type) {
      case 'low_stock':
        result = await notificationService.sendNotification(
          NOTIFICATION_TYPES.INVENTORY_LOW_STOCK,
          {
            items: [{
              productTitle: 'Test Product',
              sku: 'TEST-SKU-001',
              available: 5,
              lowStockThreshold: 10,
              locationName: 'Main Warehouse'
            }]
          },
          recipients
        );
        break;

      case 'system_error':
        result = await notificationService.sendSystemError(
          'Test System Error',
          new Error('This is a test system error notification')
        );
        break;

      case 'admin_alert':
        result = await notificationService.sendAdminAlert(
          'Test Alert',
          'This is a test admin alert notification',
          recipients
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid notification type'
        });
    }

    res.json({
      success: true,
      message: 'Test notification sent',
      data: result
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test notification',
      error: error.message
    });
  }
};

// Get notification history (this would typically come from a database)
exports.getNotificationHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      dateFrom,
      dateTo
    } = req.query;

    // This is a mock implementation
    // In a real application, you would store notification history in a database
    const mockHistory = [
      {
        id: '1',
        type: 'inventory_low_stock',
        subject: 'Low Stock Alert',
        recipients: ['admin@caststone.com'],
        status: 'sent',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        data: { itemCount: 3 }
      },
      {
        id: '2',
        type: 'order_created',
        subject: 'New Order Received',
        recipients: ['admin@caststone.com'],
        status: 'sent',
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        data: { orderNumber: 'CS-12345' }
      }
    ];

    res.json({
      success: true,
      data: {
        notifications: mockHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockHistory.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification history',
      error: error.message
    });
  }
};

// Dismiss alert
exports.dismissAlert = async (req, res) => {
  try {
    const { alertId, type } = req.body;

    // Here you would typically update the alert status in the database
    // For now, just return success
    console.log(`Alert dismissed: ${alertId} (${type})`);

    res.json({
      success: true,
      message: 'Alert dismissed successfully'
    });
  } catch (error) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error dismissing alert',
      error: error.message
    });
  }
};
