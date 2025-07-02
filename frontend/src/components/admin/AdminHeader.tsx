'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
  const pathname = usePathname();
  const { state, dispatch, logout } = useAdmin();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Get page title from pathname
  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    switch (lastSegment) {
      case 'dashboard':
        return 'Dashboard';
      case 'products':
        return 'Products Management';
      case 'orders':
        return 'Orders Management';
      case 'users':
        return 'Users Management';
      case 'analytics':
        return 'Analytics';
      case 'admin-users':
        return 'Admin Users';
      case 'settings':
        return 'Settings';
      default:
        return 'Admin Dashboard';
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button 
          className={styles.menuButton}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu />
        </button>
        
        <div className={styles.pageInfo}>
          <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
          <p className={styles.breadcrumb}>
            Admin / {getPageTitle()}
          </p>
        </div>
      </div>

      <div className={styles.center}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.right}>
        {/* Notifications */}
        <div className={styles.notificationContainer} ref={notificationsRef}>
          <button
            className={styles.notificationButton}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell />
            {state.notifications.length > 0 && (
              <span className={styles.notificationBadge}>
                {state.notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notificationHeader}>
                <h3>Notifications</h3>
                <span className={styles.notificationCount}>
                  {state.notifications.length}
                </span>
              </div>
              
              <div className={styles.notificationList}>
                {state.notifications.length === 0 ? (
                  <div className={styles.noNotifications}>
                    No new notifications
                  </div>
                ) : (
                  state.notifications.map((notification) => (
                    <div key={notification.id} className={styles.notificationItem}>
                      <div className={`${styles.notificationDot} ${styles[notification.type]}`} />
                      <div className={styles.notificationContent}>
                        <h4>{notification.title}</h4>
                        {notification.message && <p>{notification.message}</p>}
                        <span className={styles.notificationTime}>
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className={styles.profileContainer} ref={profileMenuRef}>
          <button
            className={styles.profileButton}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Profile menu"
          >
            <div className={styles.profileAvatar}>
              {state.admin?.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{state.admin?.name}</span>
              <span className={styles.profileRole}>{state.admin?.role}</span>
            </div>
            <ChevronDown className={styles.profileChevron} />
          </button>

          {showProfileMenu && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileDropdownHeader}>
                <div className={styles.profileDropdownAvatar}>
                  {state.admin?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={styles.profileDropdownName}>{state.admin?.name}</p>
                  <p className={styles.profileDropdownEmail}>{state.admin?.email}</p>
                </div>
              </div>
              
              <div className={styles.profileDropdownMenu}>
                <button className={styles.profileMenuItem}>
                  <User />
                  Profile
                </button>
                <button className={styles.profileMenuItem}>
                  <Settings />
                  Settings
                </button>
                <hr className={styles.profileMenuDivider} />
                <button 
                  className={styles.profileMenuItem}
                  onClick={handleLogout}
                >
                  <LogOut />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
