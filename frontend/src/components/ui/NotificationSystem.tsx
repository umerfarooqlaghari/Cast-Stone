'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from './NotificationSystem.module.css';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationItem = ({ 
  notification, 
  onRemove 
}: { 
  notification: Notification; 
  onRemove: (id: string) => void; 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!notification.persistent && notification.duration !== 0) {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className={styles.icon} />;
      case 'error':
        return <XCircle className={styles.icon} />;
      case 'warning':
        return <AlertCircle className={styles.icon} />;
      case 'info':
        return <Info className={styles.icon} />;
      default:
        return <Info className={styles.icon} />;
    }
  };

  return (
    <div 
      className={`
        ${styles.notification} 
        ${styles[notification.type]} 
        ${isVisible ? styles.visible : ''} 
        ${isRemoving ? styles.removing : ''}
      `}
    >
      <div className={styles.iconWrapper}>
        {getIcon()}
      </div>
      
      <div className={styles.content}>
        <h4 className={styles.title}>{notification.title}</h4>
        {notification.message && (
          <p className={styles.message}>{notification.message}</p>
        )}
      </div>
      
      <button 
        className={styles.closeButton}
        onClick={handleRemove}
        aria-label="Close notification"
      >
        <X />
      </button>
    </div>
  );
};

export default function NotificationSystem({ 
  notifications, 
  onRemove 
}: NotificationSystemProps) {
  return (
    <div className={styles.notificationContainer}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'success', title, message, ...options });
  };

  const showError = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'error', title, message, ...options });
  };

  const showWarning = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'warning', title, message, ...options });
  };

  const showInfo = (title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'info', title, message, ...options });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
