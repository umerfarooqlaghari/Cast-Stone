/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Package, 
  // DollarSign,
  // Calendar,
  // User,
  MoreHorizontal,
  // CheckCircle,
  XCircle,
  // Clock,
  // Truck
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import styles from './page.module.css';

interface Order {
  _id: string;
  orderNumber: string;
  name: string;
  email: string;
  totalPrice: number;
  financialStatus: string;
  fulfillmentStatus: string;
  orderStatus: string;
  createdAt: string;
  lineItems: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  customer?: {
    firstName: string;
    lastName: string;
  };
}

interface OrderFilters {
  search: string;
  financialStatus: string;
  fulfillmentStatus: string;
  orderStatus: string;
  dateFrom: string;
  dateTo: string;
}

export default function OrdersPage() {
  const { apiCall } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    financialStatus: '',
    fulfillmentStatus: '',
    orderStatus: '',
    dateFrom: '',
    dateTo: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.financialStatus && { financialStatus: filters.financialStatus }),
        ...(filters.fulfillmentStatus && { fulfillmentStatus: filters.fulfillmentStatus }),
        ...(filters.orderStatus && { orderStatus: filters.orderStatus }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await apiCall(`/admin/orders?${queryParams}`);
      
      if (response.success) {
        setOrders(response.data.orders);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      financialStatus: '',
      fulfillmentStatus: '',
      orderStatus: '',
      dateFrom: '',
      dateTo: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status: string, type: 'financial' | 'fulfillment' | 'order') => {
    const statusConfig = {
      financial: {
        pending: { label: 'Pending', className: styles.statusPending },
        authorized: { label: 'Authorized', className: styles.statusAuthorized },
        paid: { label: 'Paid', className: styles.statusPaid },
        partially_paid: { label: 'Partially Paid', className: styles.statusPartiallyPaid },
        refunded: { label: 'Refunded', className: styles.statusRefunded },
        partially_refunded: { label: 'Partially Refunded', className: styles.statusPartiallyRefunded },
        voided: { label: 'Voided', className: styles.statusVoided }
      },
      fulfillment: {
        unfulfilled: { label: 'Unfulfilled', className: styles.statusUnfulfilled },
        partial: { label: 'Partial', className: styles.statusPartial },
        fulfilled: { label: 'Fulfilled', className: styles.statusFulfilled },
        restocked: { label: 'Restocked', className: styles.statusRestocked }
      },
      order: {
        open: { label: 'Open', className: styles.statusOpen },
        closed: { label: 'Closed', className: styles.statusClosed },
        cancelled: { label: 'Cancelled', className: styles.statusCancelled }
      }
    };

    const config = statusConfig[type][status as keyof typeof statusConfig[typeof type]] as { label: string; className: string } | undefined;
    return config ? (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.label}
      </span>
    ) : (
      <span className={`${styles.statusBadge} ${styles.statusDefault}`}>
        {status}
      </span>
    );
  };

  const viewOrderDetails = async (orderId: string) => {
    try {
      const response = await apiCall(`/admin/orders/${orderId}`);
      if (response.success) {
        setSelectedOrder(response.data);
        setShowOrderModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = async () => {
    try {
      // Create CSV content
      const csvContent = [
        ['Order Number', 'Customer', 'Date', 'Total', 'Financial Status', 'Fulfillment Status', 'Order Status'],
        ...orders.map(order => [
          order.orderNumber,
          `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
          formatDate(order.createdAt),
          order.totalPrice.toString(),
          order.financialStatus,
          order.fulfillmentStatus,
          order.orderStatus
        ])
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>
            Manage and track all customer orders
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.exportButton} onClick={handleExport}>
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search orders by number, customer name, or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <button 
          className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterRow}>
            <select
              value={filters.financialStatus}
              onChange={(e) => handleFilterChange('financialStatus', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="authorized">Authorized</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Partially Refunded</option>
              <option value="voided">Voided</option>
            </select>

            <select
              value={filters.fulfillmentStatus}
              onChange={(e) => handleFilterChange('fulfillmentStatus', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Fulfillment Status</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="partial">Partial</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="restocked">Restocked</option>
            </select>

            <select
              value={filters.orderStatus}
              onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Order Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className={styles.filterInput}
              placeholder="From Date"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className={styles.filterInput}
              placeholder="To Date"
            />

            <button onClick={clearFilters} className={styles.clearFilters}>
              Clear
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <XCircle size={20} />
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Payment Status</th>
              <th>Fulfillment</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className={styles.tableRow}>
                <td>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderNumber}>#{order.orderNumber}</span>
                    <span className={styles.itemCount}>
                      {order.lineItems.length} item{order.lineItems.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{order.name}</span>
                    <span className={styles.customerEmail}>{order.email}</span>
                  </div>
                </td>
                <td>
                  <span className={styles.date}>
                    {formatDate(order.createdAt)}
                  </span>
                </td>
                <td>
                  {getStatusBadge(order.financialStatus, 'financial')}
                </td>
                <td>
                  {getStatusBadge(order.fulfillmentStatus, 'fulfillment')}
                </td>
                <td>
                  <span className={styles.total}>
                    {formatCurrency(order.totalPrice)}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => viewOrderDetails(order._id)}
                      className={styles.actionButton}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button className={styles.actionButton} title="More Actions">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <Package size={48} />
            <h3>No orders found</h3>
            <p>No orders match your current filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          
          <span className={styles.paginationInfo}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Order #{selectedOrder.orderNumber}</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.orderDetails}>
                <div className={styles.orderSection}>
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.email}</p>
                </div>
                
                <div className={styles.orderSection}>
                  <h3>Order Status</h3>
                  <p><strong>Payment:</strong> {getStatusBadge(selectedOrder.financialStatus, 'financial')}</p>
                  <p><strong>Fulfillment:</strong> {getStatusBadge(selectedOrder.fulfillmentStatus, 'fulfillment')}</p>
                  <p><strong>Order:</strong> {getStatusBadge(selectedOrder.orderStatus, 'order')}</p>
                </div>

                <div className={styles.orderSection}>
                  <h3>Items</h3>
                  {selectedOrder.lineItems.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <span>{item.title}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.orderSection}>
                  <h3>Total: {formatCurrency(selectedOrder.totalPrice)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
