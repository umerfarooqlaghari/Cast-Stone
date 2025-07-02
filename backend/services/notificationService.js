const nodemailer = require('nodemailer');
const { InventoryItem } = require('../models/Inventory');
const Order = require('../models/Order');
const Admin = require('../models/Admin');

// Email transporter configuration
let transporter = null;

const initializeEmailTransporter = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('✅ Email transporter initialized');
  } else {
    console.warn('⚠️  Email configuration not found. Notifications will be logged only.');
  }
};

// Initialize transporter
initializeEmailTransporter();

// Notification types
const NOTIFICATION_TYPES = {
  INVENTORY_LOW_STOCK: 'inventory_low_stock',
  INVENTORY_OUT_OF_STOCK: 'inventory_out_of_stock',
  ORDER_CREATED: 'order_created',
  ORDER_PAID: 'order_paid',
  ORDER_FULFILLED: 'order_fulfilled',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_FAILED: 'payment_failed',
  SYSTEM_ERROR: 'system_error',
  ADMIN_ALERT: 'admin_alert'
};

// Email templates
const EMAIL_TEMPLATES = {
  [NOTIFICATION_TYPES.INVENTORY_LOW_STOCK]: {
    subject: '🔔 Low Stock Alert - Cast Stone',
    template: (data) => `
      <h2>Low Stock Alert</h2>
      <p>The following items are running low on stock:</p>
      <ul>
        ${data.items.map(item => `
          <li>
            <strong>${item.productTitle}</strong> (SKU: ${item.sku})<br>
            Current Stock: ${item.available}<br>
            Threshold: ${item.lowStockThreshold}<br>
            Location: ${item.locationName}
          </li>
        `).join('')}
      </ul>
      <p>Please restock these items to avoid stockouts.</p>
    `
  },

  [NOTIFICATION_TYPES.INVENTORY_OUT_OF_STOCK]: {
    subject: '🚨 Out of Stock Alert - Cast Stone',
    template: (data) => `
      <h2>Out of Stock Alert</h2>
      <p>The following items are out of stock:</p>
      <ul>
        ${data.items.map(item => `
          <li>
            <strong>${item.productTitle}</strong> (SKU: ${item.sku})<br>
            Current Stock: ${item.available}<br>
            Location: ${item.locationName}
          </li>
        `).join('')}
      </ul>
      <p><strong>Immediate action required!</strong> These items need to be restocked urgently.</p>
    `
  },

  [NOTIFICATION_TYPES.ORDER_CREATED]: {
    subject: '📦 New Order Received - Cast Stone',
    template: (data) => `
      <h2>New Order Received</h2>
      <p><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail}</p>
      <p><strong>Total:</strong> $${data.totalPrice.toFixed(2)}</p>
      <p><strong>Items:</strong> ${data.itemCount}</p>
      <p>Please process this order promptly.</p>
    `
  },

  [NOTIFICATION_TYPES.PAYMENT_FAILED]: {
    subject: '❌ Payment Failed - Cast Stone',
    template: (data) => `
      <h2>Payment Failed</h2>
      <p><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
      <p>Please follow up with the customer or retry the payment.</p>
    `
  },

  [NOTIFICATION_TYPES.SYSTEM_ERROR]: {
    subject: '🔥 System Error - Cast Stone',
    template: (data) => `
      <h2>System Error Detected</h2>
      <p><strong>Error Type:</strong> ${data.errorType}</p>
      <p><strong>Message:</strong> ${data.message}</p>
      <p><strong>Timestamp:</strong> ${data.timestamp}</p>
      <p><strong>Stack Trace:</strong></p>
      <pre>${data.stack}</pre>
      <p>Please investigate and resolve this issue immediately.</p>
    `
  }
};

// Core notification service
class NotificationService {
  constructor() {
    this.adminEmails = [];
    this.loadAdminEmails();
  }

  async loadAdminEmails() {
    try {
      const admins = await Admin.find({ isActive: true }).select('email');
      this.adminEmails = admins.map(admin => admin.email);
    } catch (error) {
      console.error('Failed to load admin emails:', error);
    }
  }

  async sendEmail(to, subject, html) {
    if (!transporter) {
      console.log(`📧 Email notification (${subject}):`, { to, html });
      return { success: false, message: 'Email transporter not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully: ${subject}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Failed to send email: ${subject}`, error);
      return { success: false, error: error.message };
    }
  }

  async sendNotification(type, data, recipients = null) {
    try {
      const template = EMAIL_TEMPLATES[type];
      if (!template) {
        console.error(`Unknown notification type: ${type}`);
        return { success: false, message: 'Unknown notification type' };
      }

      const subject = template.subject;
      const html = template.template(data);
      const to = recipients || this.adminEmails;

      if (!to || to.length === 0) {
        console.warn('No recipients found for notification');
        return { success: false, message: 'No recipients found' };
      }

      return await this.sendEmail(to, subject, html);
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Inventory alerts
  async checkInventoryAlerts() {
    try {
      // Get low stock items
      const lowStockItems = await InventoryItem.find({ lowStockAlert: true })
        .populate('productId', 'title')
        .populate('locationId', 'name')
        .lean();

      if (lowStockItems.length > 0) {
        const items = lowStockItems.map(item => ({
          productTitle: item.productId?.title || 'Unknown Product',
          sku: item.sku,
          available: item.available,
          lowStockThreshold: item.lowStockThreshold,
          locationName: item.locationId?.name || 'Unknown Location'
        }));

        await this.sendNotification(NOTIFICATION_TYPES.INVENTORY_LOW_STOCK, { items });
      }

      // Get out of stock items
      const outOfStockItems = await InventoryItem.find({ outOfStockAlert: true })
        .populate('productId', 'title')
        .populate('locationId', 'name')
        .lean();

      if (outOfStockItems.length > 0) {
        const items = outOfStockItems.map(item => ({
          productTitle: item.productId?.title || 'Unknown Product',
          sku: item.sku,
          available: item.available,
          locationName: item.locationId?.name || 'Unknown Location'
        }));

        await this.sendNotification(NOTIFICATION_TYPES.INVENTORY_OUT_OF_STOCK, { items });
      }

      return {
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length
      };
    } catch (error) {
      console.error('Failed to check inventory alerts:', error);
      await this.sendSystemError('Inventory Alert Check Failed', error);
    }
  }

  // Order notifications
  async notifyOrderCreated(order) {
    try {
      const data = {
        orderNumber: order.orderNumber,
        customerName: order.name || `${order.customer?.firstName} ${order.customer?.lastName}`,
        customerEmail: order.email,
        totalPrice: order.totalPrice,
        itemCount: order.lineItems.length
      };

      return await this.sendNotification(NOTIFICATION_TYPES.ORDER_CREATED, data);
    } catch (error) {
      console.error('Failed to send order created notification:', error);
    }
  }

  async notifyPaymentFailed(order, reason) {
    try {
      const data = {
        orderNumber: order.orderNumber,
        customerName: order.name || `${order.customer?.firstName} ${order.customer?.lastName}`,
        amount: order.totalPrice,
        reason,
        paymentMethod: order.paymentDetails?.paymentMethod || 'Unknown'
      };

      return await this.sendNotification(NOTIFICATION_TYPES.PAYMENT_FAILED, data);
    } catch (error) {
      console.error('Failed to send payment failed notification:', error);
    }
  }

  // System error notifications
  async sendSystemError(errorType, error) {
    try {
      const data = {
        errorType,
        message: error.message,
        timestamp: new Date().toISOString(),
        stack: error.stack
      };

      return await this.sendNotification(NOTIFICATION_TYPES.SYSTEM_ERROR, data);
    } catch (notificationError) {
      console.error('Failed to send system error notification:', notificationError);
    }
  }

  // Admin alert
  async sendAdminAlert(subject, message, recipients = null) {
    try {
      const html = `
        <h2>Admin Alert</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `;

      const to = recipients || this.adminEmails;
      return await this.sendEmail(to, `🔔 Admin Alert: ${subject}`, html);
    } catch (error) {
      console.error('Failed to send admin alert:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Scheduled inventory check (run every hour)
const scheduleInventoryCheck = () => {
  setInterval(async () => {
    console.log('🔍 Running scheduled inventory check...');
    await notificationService.checkInventoryAlerts();
  }, 60 * 60 * 1000); // 1 hour
};

// Start scheduled checks
scheduleInventoryCheck();

module.exports = {
  notificationService,
  NOTIFICATION_TYPES
};
