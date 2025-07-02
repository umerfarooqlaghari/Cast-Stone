'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import styles from './AdminSidebar.module.css';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  permission?: { resource: string; action: string };
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard'
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    href: '/admin/products',
    permission: { resource: 'products', action: 'read' }
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    href: '/admin/orders',
    permission: { resource: 'orders', action: 'read' }
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    href: '/admin/users',
    permission: { resource: 'users', action: 'read' }
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics',
    permission: { resource: 'analytics', action: 'read' }
  },
  {
    id: 'admins',
    label: 'Admin Users',
    icon: Shield,
    href: '/admin/admin-users',
    permission: { resource: 'admins', action: 'read' }
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/admin/settings'
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { state, dispatch, hasPermission, logout } = useAdmin();
  const { sidebarCollapsed } = state;

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission.resource, item.permission.action);
  });

  return (
    <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Shield className={styles.logoIcon} />
          {!sidebarCollapsed && (
            <div className={styles.logoText}>
              <h2 className={styles.logoTitle}>Cast Stone</h2>
              <p className={styles.logoSubtitle}>Admin</p>
            </div>
          )}
        </div>
        
        <button 
          className={styles.toggleButton}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <li key={item.id} className={styles.menuItem}>
                <Link 
                  href={item.href}
                  className={`${styles.menuLink} ${isActive ? styles.active : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={styles.menuIcon} />
                  {!sidebarCollapsed && (
                    <>
                      <span className={styles.menuLabel}>{item.label}</span>
                      {item.badge && (
                        <span className={styles.menuBadge}>{item.badge}</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        {state.admin && (
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {state.admin.name.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className={styles.adminDetails}>
                <p className={styles.adminName}>{state.admin.name}</p>
                <p className={styles.adminRole}>{state.admin.role}</p>
              </div>
            )}
          </div>
        )}
        
        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut className={styles.logoutIcon} />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
