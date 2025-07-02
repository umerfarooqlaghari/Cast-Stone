'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import styles from './page.module.css';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: {
    [key: string]: string[];
  };
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: string;
  createdAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

interface CreateAdminForm {
  name: string;
  email: string;
  role: string;
  permissions: {
    [key: string]: string[];
  };
}

export default function AdminUsersPage() {
  const { apiCall, hasPermission, currentAdmin } = useAdmin();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAdminForm>({
    name: '',
    email: '',
    role: 'admin',
    permissions: {
      products: ['read'],
      orders: ['read'],
      users: ['read'],
      analytics: ['read'],
      admins: []
    }
  });
  const [createLoading, setCreateLoading] = useState(false);

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
    { value: 'admin', label: 'Admin', description: 'Standard admin access' },
    { value: 'manager', label: 'Manager', description: 'Limited management access' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
  ];

  const permissionCategories = [
    { key: 'products', label: 'Products & Inventory' },
    { key: 'orders', label: 'Orders & Fulfillment' },
    { key: 'users', label: 'Customer Management' },
    { key: 'analytics', label: 'Analytics & Reports' },
    { key: 'admins', label: 'Admin Management' }
  ];

  const permissionActions = ['read', 'create', 'update', 'delete'];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall('/admin/admins');
      
      if (response.success) {
        setAdmins(response.data);
      } else {
        setError(response.message || 'Failed to fetch admin users');
      }
    } catch (err) {
      setError('Failed to fetch admin users');
      console.error('Fetch admins error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('admins', 'create')) {
      alert('You do not have permission to create admin users');
      return;
    }

    try {
      setCreateLoading(true);
      
      const response = await apiCall('/admin/create-admin', {
        method: 'POST',
        body: JSON.stringify(createForm)
      });

      if (response.success) {
        alert(`Admin created successfully! Temporary password: ${response.data.temporaryPassword}`);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          role: 'admin',
          permissions: {
            products: ['read'],
            orders: ['read'],
            users: ['read'],
            analytics: ['read'],
            admins: []
          }
        });
        fetchAdmins();
      } else {
        alert(response.message || 'Failed to create admin user');
      }
    } catch (err) {
      console.error('Create admin error:', err);
      alert('Failed to create admin user');
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    if (!hasPermission('admins', 'update')) {
      alert('You do not have permission to modify admin users');
      return;
    }

    if (adminId === currentAdmin?._id) {
      alert('You cannot deactivate your own account');
      return;
    }

    try {
      const response = await apiCall(`/admin/admins/${adminId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.success) {
        setAdmins(prev => prev.map(admin => 
          admin._id === adminId 
            ? { ...admin, isActive: !currentStatus }
            : admin
        ));
      } else {
        alert(response.message || 'Failed to update admin status');
      }
    } catch (err) {
      console.error('Toggle admin status error:', err);
      alert('Failed to update admin status');
    }
  };

  const deleteAdmin = async (adminId: string, adminName: string) => {
    if (!hasPermission('admins', 'delete')) {
      alert('You do not have permission to delete admin users');
      return;
    }

    if (adminId === currentAdmin?._id) {
      alert('You cannot delete your own account');
      return;
    }

    if (!confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiCall(`/admin/admins/${adminId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setAdmins(prev => prev.filter(admin => admin._id !== adminId));
        alert('Admin deleted successfully');
      } else {
        alert(response.message || 'Failed to delete admin');
      }
    } catch (err) {
      console.error('Delete admin error:', err);
      alert('Failed to delete admin');
    }
  };

  const handlePermissionChange = (category: string, action: string, checked: boolean) => {
    setCreateForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: checked 
          ? [...prev.permissions[category], action]
          : prev.permissions[category].filter(a => a !== action)
      }
    }));
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

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: { label: 'Super Admin', className: styles.roleSuperAdmin },
      admin: { label: 'Admin', className: styles.roleAdmin },
      manager: { label: 'Manager', className: styles.roleManager },
      viewer: { label: 'Viewer', className: styles.roleViewer }
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    return config ? (
      <span className={`${styles.roleBadge} ${config.className}`}>
        {config.label}
      </span>
    ) : (
      <span className={`${styles.roleBadge} ${styles.roleDefault}`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading admin users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Admin Users</h1>
          <p className={styles.subtitle}>
            Manage administrator accounts and permissions
          </p>
        </div>
        <div className={styles.headerRight}>
          {hasPermission('admins', 'create') && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className={styles.createButton}
            >
              <Plus size={20} />
              Create Admin
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Admins Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Admin</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id} className={styles.tableRow}>
                <td>
                  <div className={styles.adminInfo}>
                    <div className={styles.adminAvatar}>
                      <User size={20} />
                    </div>
                    <div className={styles.adminDetails}>
                      <span className={styles.adminName}>
                        {admin.name}
                        {admin._id === currentAdmin?._id && (
                          <span className={styles.youBadge}>(You)</span>
                        )}
                      </span>
                      <span className={styles.adminEmail}>{admin.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {getRoleBadge(admin.role)}
                </td>
                <td>
                  <div className={styles.statusContainer}>
                    <span className={`${styles.statusBadge} ${admin.isActive ? styles.statusActive : styles.statusInactive}`}>
                      {admin.isActive ? (
                        <>
                          <CheckCircle size={14} />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          Inactive
                        </>
                      )}
                    </span>
                    {admin.mustChangePassword && (
                      <span className={styles.passwordWarning}>
                        <Key size={14} />
                        Must change password
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={styles.date}>
                    {admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}
                  </span>
                </td>
                <td>
                  <div className={styles.createdInfo}>
                    <span className={styles.date}>{formatDate(admin.createdAt)}</span>
                    {admin.createdBy && (
                      <span className={styles.createdBy}>
                        by {admin.createdBy.name}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.actions}>
                    {hasPermission('admins', 'update') && admin._id !== currentAdmin?._id && (
                      <button
                        onClick={() => toggleAdminStatus(admin._id, admin.isActive)}
                        className={`${styles.actionButton} ${admin.isActive ? styles.deactivateButton : styles.activateButton}`}
                        title={admin.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {admin.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                    )}
                    {hasPermission('admins', 'delete') && admin._id !== currentAdmin?._id && (
                      <button
                        onClick={() => deleteAdmin(admin._id, admin.name)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Delete Admin"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {admins.length === 0 && (
          <div className={styles.emptyState}>
            <Shield size={48} />
            <h3>No admin users found</h3>
            <p>Create your first admin user to get started.</p>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Create New Admin</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                  className={styles.formSelect}
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Permissions</label>
                <div className={styles.permissionsGrid}>
                  {permissionCategories.map(category => (
                    <div key={category.key} className={styles.permissionCategory}>
                      <h4>{category.label}</h4>
                      <div className={styles.permissionActions}>
                        {permissionActions.map(action => (
                          <label key={action} className={styles.permissionCheckbox}>
                            <input
                              type="checkbox"
                              checked={createForm.permissions[category.key]?.includes(action) || false}
                              onChange={(e) => handlePermissionChange(category.key, action, e.target.checked)}
                            />
                            <span>{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className={styles.submitButton}
                >
                  {createLoading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
