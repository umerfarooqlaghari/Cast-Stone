/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2,
  User,
  Mail,
  Calendar,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import styles from './page.module.css';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
  orderStats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: string;
  };
}

interface UserFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: string;
}

export default function UsersPage() {
  const { apiCall, hasPermission } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await apiCall(`/admin/users?${queryParams}`);
      
      if (response.success) {
        const data = response.data as {
          users: User[];
          pagination: { total: number; totalPages: number };
        };
        setUsers(data.users);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const viewUserDetails = async (userId: string) => {
    try {
      const response = await apiCall(`/admin/users/${userId}`);
      if (response.success) {
        setSelectedUser((response.data as { user: User }).user);
        setShowUserModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!hasPermission('users', 'delete')) {
      alert('You do not have permission to delete users');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        alert('User deleted successfully');
      } else {
        alert(response.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Failed to delete user');
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
      day: 'numeric'
    });
  };

  const getCustomerSegment = (totalSpent: number, totalOrders: number) => {
    if (totalSpent >= 1000) return { label: 'VIP', className: styles.segmentVip };
    if (totalSpent >= 500) return { label: 'Premium', className: styles.segmentPremium };
    if (totalOrders >= 5) return { label: 'Regular', className: styles.segmentRegular };
    if (totalOrders >= 1) return { label: 'Customer', className: styles.segmentCustomer };
    return { label: 'New', className: styles.segmentNew };
  };

  const handleExport = async () => {
    try {
      // Create CSV content
      const csvContent = [
        ['Name', 'Email', 'Registration Date', 'Total Orders', 'Total Spent', 'Average Order', 'Segment', 'Last Order'],
        ...users.map(user => {
          const segment = getCustomerSegment(user.orderStats.totalSpent, user.orderStats.totalOrders);
          return [
            user.name,
            user.email,
            formatDate(user.createdAt),
            user.orderStats.totalOrders.toString(),
            user.orderStats.totalSpent.toString(),
            user.orderStats.averageOrderValue?.toString() || '0',
            segment.label,
            user.orderStats.lastOrderDate ? formatDate(user.orderStats.lastOrderDate) : 'Never'
          ];
        })
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>
            Manage customer accounts and view analytics
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
            placeholder="Search users by name or email..."
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

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="createdAt">Registration Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="lastLogin">Last Login</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>

            <button onClick={clearFilters} className={styles.clearFilters}>
              Clear
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Registration</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Segment</th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const segment = getCustomerSegment(user.orderStats.totalSpent, user.orderStats.totalOrders);
              return (
                <tr key={user._id} className={styles.tableRow}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        <User size={20} />
                      </div>
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.date}>
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.orderStats}>
                      <span className={styles.orderCount}>{user.orderStats.totalOrders}</span>
                      <span className={styles.avgOrder}>
                        Avg: {formatCurrency(user.orderStats.averageOrderValue || 0)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.totalSpent}>
                      {formatCurrency(user.orderStats.totalSpent)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.segment} ${segment.className}`}>
                      {segment.label}
                    </span>
                  </td>
                  <td>
                    <span className={styles.date}>
                      {user.orderStats.lastOrderDate 
                        ? formatDate(user.orderStats.lastOrderDate)
                        : 'Never'
                      }
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => viewUserDetails(user._id)}
                        className={styles.actionButton}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {hasPermission('users', 'delete') && (
                        <button
                          onClick={() => deleteUser(user._id, user.name)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <User size={48} />
            <h3>No users found</h3>
            <p>No users match your current filters.</p>
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

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{selectedUser.name}</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.userDetailsGrid}>
                <div className={styles.userSection}>
                  <h3>Contact Information</h3>
                  <div className={styles.infoItem}>
                    <Mail size={16} />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <Calendar size={16} />
                    <span>Joined {formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>

                <div className={styles.userSection}>
                  <h3>Order Statistics</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <ShoppingBag size={20} />
                      <div>
                        <span className={styles.statValue}>{selectedUser.orderStats.totalOrders}</span>
                        <span className={styles.statLabel}>Total Orders</span>
                      </div>
                    </div>
                    <div className={styles.statItem}>
                      <DollarSign size={20} />
                      <div>
                        <span className={styles.statValue}>
                          {formatCurrency(selectedUser.orderStats.totalSpent)}
                        </span>
                        <span className={styles.statLabel}>Total Spent</span>
                      </div>
                    </div>
                    <div className={styles.statItem}>
                      <DollarSign size={20} />
                      <div>
                        <span className={styles.statValue}>
                          {formatCurrency(selectedUser.orderStats.averageOrderValue || 0)}
                        </span>
                        <span className={styles.statLabel}>Average Order</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
