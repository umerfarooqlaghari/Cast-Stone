const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// Import controllers
const {
  login,
  logout,
  changePassword,
  getProfile,
  createAdmin,
  verifyToken
} = require('../controllers/adminAuthController');

const productController = require('../controllers/productController');
const collectionController = require('../controllers/collectionController');
const inventoryController = require('../controllers/inventoryController');
const orderController = require('../controllers/orderController');
const analyticsController = require('../controllers/analyticsController');
const userManagementController = require('../controllers/userManagementController');
const notificationController = require('../controllers/notificationController');
const adminManagementController = require('../controllers/adminManagementController');

// Public routes (no authentication required)
router.post('/login', adminAuth.logActivity('login'), login);
router.get('/verify-token', verifyToken);

// Protected routes (authentication required)
router.use(adminAuth.protect);
router.use(adminAuth.validateSession);

// Profile and authentication routes
router.get('/profile', adminAuth.logActivity('get_profile'), getProfile);
router.post('/logout', adminAuth.logActivity('logout'), logout);
router.post('/change-password', 
  adminAuth.logActivity('change_password'),
  changePassword
);

// Admin management routes (require admin permissions)
router.post('/create-admin',
  adminAuth.checkPasswordChange,
  adminAuth.checkPermission('admins', 'create'),
  adminAuth.rateLimit(5, 60 * 60 * 1000), // 5 attempts per hour
  adminAuth.logActivity('create_admin'),
  createAdmin
);

// ===== ADMIN MANAGEMENT ROUTES =====
router.get('/admins',
  adminAuth.checkPermission('admins', 'read'),
  adminAuth.logActivity('get_admins'),
  adminManagementController.getAllAdmins
);

router.get('/admins/roles-permissions',
  adminAuth.checkPermission('admins', 'read'),
  adminManagementController.getAdminRolesAndPermissions
);

router.get('/admins/:id',
  adminAuth.checkPermission('admins', 'read'),
  adminAuth.logActivity('get_admin'),
  adminManagementController.getAdmin
);

router.put('/admins/:id',
  adminAuth.checkPermission('admins', 'update'),
  adminAuth.logActivity('update_admin'),
  adminManagementController.updateAdmin
);

router.delete('/admins/:id',
  adminAuth.checkPermission('admins', 'delete'),
  adminAuth.logActivity('delete_admin'),
  adminManagementController.deleteAdmin
);

router.post('/admins/:id/reset-password',
  adminAuth.checkPermission('admins', 'update'),
  adminAuth.logActivity('reset_admin_password'),
  adminManagementController.resetAdminPassword
);

// ===== PRODUCT MANAGEMENT ROUTES =====
router.get('/products',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_products'),
  productController.getAllProducts
);

router.get('/products/categories',
  adminAuth.checkPermission('products', 'read'),
  productController.getCategories
);

router.get('/products/tags',
  adminAuth.checkPermission('products', 'read'),
  productController.getTags
);

router.get('/products/types',
  adminAuth.checkPermission('products', 'read'),
  productController.getProductTypes
);

router.get('/products/:id',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_product'),
  productController.getProduct
);

router.get('/products/collection/:path',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_products_by_collection_path'),
  productController.getProductsByCollectionPath
);

router.post('/products',
  adminAuth.checkPermission('products', 'create'),
  adminAuth.logActivity('create_product'),
  productController.createProduct
);

router.put('/products/:id',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('update_product'),
  productController.updateProduct
);

router.delete('/products/:id',
  adminAuth.checkPermission('products', 'delete'),
  adminAuth.logActivity('delete_product'),
  productController.deleteProduct
);

router.post('/products/bulk-delete',
  adminAuth.checkPermission('products', 'delete'),
  adminAuth.logActivity('bulk_delete_products'),
  productController.bulkDeleteProducts
);

router.post('/products/bulk-update',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('bulk_update_products'),
  productController.bulkUpdateProducts
);

router.post('/products/:id/publish',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('publish_product'),
  productController.publishProduct
);

router.post('/products/:id/unpublish',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('unpublish_product'),
  productController.unpublishProduct
);

router.post('/products/:id/archive',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('archive_product'),
  productController.archiveProduct
);

// Product variant routes
router.get('/products/:id/variants',
  adminAuth.checkPermission('products', 'read'),
  productController.getProductVariants
);

router.post('/products/:id/variants',
  adminAuth.checkPermission('products', 'create'),
  adminAuth.logActivity('add_product_variant'),
  productController.addProductVariant
);

router.put('/products/:id/variants/:variantId',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('update_product_variant'),
  productController.updateProductVariant
);

router.delete('/products/:id/variants/:variantId',
  adminAuth.checkPermission('products', 'delete'),
  adminAuth.logActivity('delete_product_variant'),
  productController.deleteProductVariant
);

router.put('/products/:id/variants/:variantId/inventory',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('update_product_inventory'),
  productController.updateProductInventory
);

// ===== COLLECTION MANAGEMENT ROUTES =====
router.get('/collections',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_collections'),
  collectionController.getAllCollections
);

router.get('/collections/:id',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_collection'),
  collectionController.getCollection
);

router.post('/collections',
  adminAuth.checkPermission('products', 'create'),
  adminAuth.logActivity('create_collection'),
  collectionController.createCollection
);

router.put('/collections/:id',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('update_collection'),
  collectionController.updateCollection
);

router.delete('/collections/:id',
  adminAuth.checkPermission('products', 'delete'),
  adminAuth.logActivity('delete_collection'),
  collectionController.deleteCollection
);

router.post('/collections/:id/publish',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('publish_collection'),
  collectionController.publishCollection
);

router.post('/collections/:id/unpublish',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('unpublish_collection'),
  collectionController.unpublishCollection
);

router.get('/collections/:id/products',
  adminAuth.checkPermission('products', 'read'),
  collectionController.getCollectionProducts
);

router.post('/collections/:id/products',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('add_product_to_collection'),
  collectionController.addProductToCollection
);

router.delete('/collections/:id/products/:productId',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('remove_product_from_collection'),
  collectionController.removeProductFromCollection
);

router.post('/collections/:id/products/bulk-add',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('bulk_add_products_to_collection'),
  collectionController.bulkAddProductsToCollection
);

router.post('/collections/test-rules',
  adminAuth.checkPermission('products', 'read'),
  collectionController.testSmartCollectionRules
);

// ===== COLLECTION HIERARCHY ROUTES =====
router.get('/collections/hierarchy',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_collection_hierarchy'),
  collectionController.getCollectionHierarchy
);

router.get('/collections/level/:level',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_collections_by_level'),
  collectionController.getCollectionsByLevel
);

router.get('/collections/:id/breadcrumbs',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_collection_breadcrumbs'),
  collectionController.getCollectionBreadcrumbs
);

router.put('/collections/:id/move',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('move_collection'),
  collectionController.moveCollection
);

// ===== INVENTORY MANAGEMENT ROUTES =====
router.get('/inventory',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_inventory'),
  inventoryController.getAllInventoryItems
);

router.get('/inventory/:id',
  adminAuth.checkPermission('products', 'read'),
  adminAuth.logActivity('get_inventory_item'),
  inventoryController.getInventoryItem
);

router.post('/inventory',
  adminAuth.checkPermission('products', 'create'),
  adminAuth.logActivity('create_inventory_item'),
  inventoryController.createInventoryItem
);

router.put('/inventory/:id',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('update_inventory_item'),
  inventoryController.updateInventoryItem
);

router.delete('/inventory/:id',
  adminAuth.checkPermission('products', 'delete'),
  adminAuth.logActivity('delete_inventory_item'),
  inventoryController.deleteInventoryItem
);

router.post('/inventory/:id/adjust',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('adjust_inventory'),
  inventoryController.adjustInventoryStock
);

router.post('/inventory/:id/reserve',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('reserve_inventory'),
  inventoryController.reserveInventoryStock
);

router.post('/inventory/:id/release',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('release_inventory'),
  inventoryController.releaseInventoryReservation
);

router.get('/inventory/movements',
  adminAuth.checkPermission('products', 'read'),
  inventoryController.getInventoryMovements
);

router.get('/inventory/alerts/low-stock',
  adminAuth.checkPermission('products', 'read'),
  inventoryController.getLowStockAlerts
);

router.get('/inventory/analytics',
  adminAuth.checkPermission('analytics', 'read'),
  inventoryController.getInventoryAnalytics
);

// Location management
router.get('/locations',
  adminAuth.checkPermission('products', 'read'),
  inventoryController.getAllLocations
);

router.post('/locations',
  adminAuth.checkPermission('products', 'create'),
  adminAuth.logActivity('create_location'),
  inventoryController.createLocation
);

router.put('/locations/:id',
  adminAuth.checkPermission('products', 'update'),
  adminAuth.logActivity('update_location'),
  inventoryController.updateLocation
);

// Inventory transfers
router.get('/inventory/transfers',
  adminAuth.checkPermission('products', 'read'),
  inventoryController.getAllInventoryTransfers
);

router.post('/inventory/transfers',
  adminAuth.checkPermission('products', 'create'),
  adminAuth.logActivity('create_inventory_transfer'),
  inventoryController.createInventoryTransfer
);

// ===== ORDER MANAGEMENT ROUTES =====
router.get('/orders',
  adminAuth.checkPermission('orders', 'read'),
  adminAuth.logActivity('get_orders'),
  orderController.getAllOrders
);

router.get('/orders/:id',
  adminAuth.checkPermission('orders', 'read'),
  adminAuth.logActivity('get_order'),
  orderController.getOrder
);

router.put('/orders/:id',
  adminAuth.checkPermission('orders', 'update'),
  adminAuth.logActivity('update_order'),
  orderController.updateOrder
);

router.post('/orders/:id/fulfill',
  adminAuth.checkPermission('orders', 'update'),
  adminAuth.logActivity('fulfill_order'),
  orderController.fulfillOrder
);

router.post('/orders/:id/cancel',
  adminAuth.checkPermission('orders', 'update'),
  adminAuth.logActivity('cancel_order'),
  orderController.cancelOrder
);

router.post('/orders/:id/refund',
  adminAuth.checkPermission('orders', 'update'),
  adminAuth.logActivity('process_refund'),
  orderController.processRefund
);

router.get('/orders/analytics',
  adminAuth.checkPermission('analytics', 'read'),
  orderController.getOrderAnalytics
);

// ===== ANALYTICS ROUTES =====
router.get('/analytics/dashboard',
  adminAuth.checkPermission('analytics', 'read'),
  adminAuth.logActivity('get_dashboard_analytics'),
  analyticsController.getDashboardOverview
);

router.get('/analytics/revenue',
  adminAuth.checkPermission('analytics', 'read'),
  adminAuth.logActivity('get_revenue_analytics'),
  analyticsController.getRevenueAnalytics
);

router.get('/analytics/products',
  adminAuth.checkPermission('analytics', 'read'),
  adminAuth.logActivity('get_product_analytics'),
  analyticsController.getProductAnalytics
);

router.get('/analytics/customers',
  adminAuth.checkPermission('analytics', 'read'),
  adminAuth.logActivity('get_customer_analytics'),
  analyticsController.getCustomerAnalytics
);

router.get('/analytics/inventory',
  adminAuth.checkPermission('analytics', 'read'),
  adminAuth.logActivity('get_inventory_analytics'),
  analyticsController.getInventoryAnalytics
);

router.get('/analytics/sales-trends',
  adminAuth.checkPermission('analytics', 'read'),
  adminAuth.logActivity('get_sales_trends'),
  analyticsController.getSalesTrends
);

// ===== USER MANAGEMENT ROUTES =====
router.get('/users',
  adminAuth.checkPermission('users', 'read'),
  adminAuth.logActivity('get_users'),
  userManagementController.getAllUsers
);

router.get('/users/:id',
  adminAuth.checkPermission('users', 'read'),
  adminAuth.logActivity('get_user'),
  userManagementController.getUser
);

router.put('/users/:id',
  adminAuth.checkPermission('users', 'update'),
  adminAuth.logActivity('update_user'),
  userManagementController.updateUser
);

router.delete('/users/:id',
  adminAuth.checkPermission('users', 'delete'),
  adminAuth.logActivity('delete_user'),
  userManagementController.deleteUser
);

router.get('/users/analytics',
  adminAuth.checkPermission('analytics', 'read'),
  userManagementController.getUserAnalytics
);

// ===== NOTIFICATION MANAGEMENT ROUTES =====
router.get('/notifications/settings',
  adminAuth.checkPermission('admins', 'read'),
  notificationController.getNotificationSettings
);

router.put('/notifications/settings',
  adminAuth.checkPermission('admins', 'update'),
  adminAuth.logActivity('update_notification_settings'),
  notificationController.updateNotificationSettings
);

router.get('/notifications/alerts',
  adminAuth.checkPermission('admins', 'read'),
  notificationController.getCurrentAlerts
);

router.post('/notifications/inventory-check',
  adminAuth.checkPermission('admins', 'update'),
  adminAuth.logActivity('trigger_inventory_check'),
  notificationController.triggerInventoryCheck
);

router.post('/notifications/test',
  adminAuth.checkPermission('admins', 'update'),
  adminAuth.logActivity('send_test_notification'),
  notificationController.sendTestNotification
);

router.get('/notifications/history',
  adminAuth.checkPermission('admins', 'read'),
  notificationController.getNotificationHistory
);

router.post('/notifications/dismiss',
  adminAuth.checkPermission('admins', 'update'),
  adminAuth.logActivity('dismiss_alert'),
  notificationController.dismissAlert
);

module.exports = router;
