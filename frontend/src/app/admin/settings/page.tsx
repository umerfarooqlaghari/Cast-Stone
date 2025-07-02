/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Bell, 
  Mail, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon,
  Key,
  Globe,
  Package,
  DollarSign
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import styles from './page.module.css';

interface NotificationSettings {
  emailNotifications: {
    enabled: boolean;
    lowStockAlerts: boolean;
    outOfStockAlerts: boolean;
    orderNotifications: boolean;
    paymentFailures: boolean;
    systemErrors: boolean;
  };
  thresholds: {
    lowStockThreshold: number;
    criticalStockThreshold: number;
  };
  schedules: {
    inventoryCheckInterval: number;
    dailyReportTime: string;
  };
}

interface SystemSettings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
}

export default function SettingsPage() {
  const { apiCall, hasPermission } = useAdmin();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
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
      inventoryCheckInterval: 60,
      dailyReportTime: '09:00'
    }
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'Cast Stone Admin',
    siteUrl: 'https://caststone.com',
    adminEmail: 'admin@caststone.com',
    currency: 'USD',
    timezone: 'America/New_York',
    maintenanceMode: false
  });

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const [notificationResponse] = await Promise.all([
        apiCall('/admin/notifications/settings')
      ]);

      if (notificationResponse.success) {
        setNotificationSettings(notificationResponse.data as NotificationSettings);
      }
    } catch (err) {
      setError('Failed to fetch settings');
      console.error('Fetch settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    if (!hasPermission('admins', 'update')) {
      setError('You do not have permission to update settings');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await apiCall('/admin/notifications/settings', {
        method: 'PUT',
        body: JSON.stringify(notificationSettings)
      });

      if (response.success) {
        setSuccess('Notification settings saved successfully');
      } else {
        setError(response.message || 'Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save settings');
      console.error('Save settings error:', err);
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (type: string) => {
    try {
      const response = await apiCall('/admin/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ type })
      });

      if (response.success) {
        setSuccess(`Test ${type} notification sent successfully`);
      } else {
        setError(response.message || 'Failed to send test notification');
      }
    } catch (err) {
      setError('Failed to send test notification');
      console.error('Test notification error:', err);
    }
  };

  const handleNotificationChange = (path: string, value: any) => {
    setNotificationSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSystemChange = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>
            Configure system settings and preferences
          </p>
        </div>
      </div>

      {(error || success) && (
        <div className={styles.alerts}>
          {error && (
            <div className={styles.error}>
              <AlertTriangle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className={styles.success}>
              <CheckCircle size={20} />
              {success}
            </div>
          )}
        </div>
      )}

      <div className={styles.settingsContainer}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'notifications' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Notification Settings</h2>
                <p>Configure email notifications and alert thresholds</p>
              </div>

              <div className={styles.settingsGrid}>
                {/* Email Notifications */}
                <div className={styles.settingCard}>
                  <div className={styles.cardHeader}>
                    <Mail size={24} />
                    <div>
                      <h3>Email Notifications</h3>
                      <p>Configure which events trigger email alerts</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.settingItem}>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications.enabled}
                          onChange={(e) => handleNotificationChange('emailNotifications.enabled', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                        Enable Email Notifications
                      </label>
                    </div>

                    {notificationSettings.emailNotifications.enabled && (
                      <>
                        <div className={styles.settingItem}>
                          <label className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications.lowStockAlerts}
                              onChange={(e) => handleNotificationChange('emailNotifications.lowStockAlerts', e.target.checked)}
                            />
                            Low Stock Alerts
                          </label>
                        </div>

                        <div className={styles.settingItem}>
                          <label className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications.outOfStockAlerts}
                              onChange={(e) => handleNotificationChange('emailNotifications.outOfStockAlerts', e.target.checked)}
                            />
                            Out of Stock Alerts
                          </label>
                        </div>

                        <div className={styles.settingItem}>
                          <label className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications.orderNotifications}
                              onChange={(e) => handleNotificationChange('emailNotifications.orderNotifications', e.target.checked)}
                            />
                            New Order Notifications
                          </label>
                        </div>

                        <div className={styles.settingItem}>
                          <label className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications.paymentFailures}
                              onChange={(e) => handleNotificationChange('emailNotifications.paymentFailures', e.target.checked)}
                            />
                            Payment Failure Alerts
                          </label>
                        </div>

                        <div className={styles.settingItem}>
                          <label className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications.systemErrors}
                              onChange={(e) => handleNotificationChange('emailNotifications.systemErrors', e.target.checked)}
                            />
                            System Error Alerts
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Inventory Thresholds */}
                <div className={styles.settingCard}>
                  <div className={styles.cardHeader}>
                    <Package size={24} />
                    <div>
                      <h3>Inventory Thresholds</h3>
                      <p>Set stock level alert thresholds</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.settingItem}>
                      <label htmlFor="lowStockThreshold">Low Stock Threshold</label>
                      <input
                        type="number"
                        id="lowStockThreshold"
                        value={notificationSettings.thresholds.lowStockThreshold}
                        onChange={(e) => handleNotificationChange('thresholds.lowStockThreshold', parseInt(e.target.value))}
                        className={styles.numberInput}
                        min="1"
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label htmlFor="criticalStockThreshold">Critical Stock Threshold</label>
                      <input
                        type="number"
                        id="criticalStockThreshold"
                        value={notificationSettings.thresholds.criticalStockThreshold}
                        onChange={(e) => handleNotificationChange('thresholds.criticalStockThreshold', parseInt(e.target.value))}
                        className={styles.numberInput}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedules */}
                <div className={styles.settingCard}>
                  <div className={styles.cardHeader}>
                    <Bell size={24} />
                    <div>
                      <h3>Alert Schedules</h3>
                      <p>Configure when alerts are checked and sent</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.settingItem}>
                      <label htmlFor="inventoryCheckInterval">Inventory Check Interval (minutes)</label>
                      <input
                        type="number"
                        id="inventoryCheckInterval"
                        value={notificationSettings.schedules.inventoryCheckInterval}
                        onChange={(e) => handleNotificationChange('schedules.inventoryCheckInterval', parseInt(e.target.value))}
                        className={styles.numberInput}
                        min="15"
                        step="15"
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label htmlFor="dailyReportTime">Daily Report Time</label>
                      <input
                        type="time"
                        id="dailyReportTime"
                        value={notificationSettings.schedules.dailyReportTime}
                        onChange={(e) => handleNotificationChange('schedules.dailyReportTime', e.target.value)}
                        className={styles.timeInput}
                      />
                    </div>
                  </div>
                </div>

                {/* Test Notifications */}
                <div className={styles.settingCard}>
                  <div className={styles.cardHeader}>
                    <Mail size={24} />
                    <div>
                      <h3>Test Notifications</h3>
                      <p>Send test notifications to verify configuration</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.testButtons}>
                      <button
                        onClick={() => testNotification('low_stock')}
                        className={styles.testButton}
                      >
                        Test Low Stock Alert
                      </button>
                      <button
                        onClick={() => testNotification('system_error')}
                        className={styles.testButton}
                      >
                        Test System Error Alert
                      </button>
                      <button
                        onClick={() => testNotification('admin_alert')}
                        className={styles.testButton}
                      >
                        Test Admin Alert
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.sectionActions}>
                <button
                  onClick={saveNotificationSettings}
                  disabled={saving || !hasPermission('admins', 'update')}
                  className={styles.saveButton}
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>System Settings</h2>
                <p>Configure basic system information and preferences</p>
              </div>

              <div className={styles.settingsGrid}>
                <div className={styles.settingCard}>
                  <div className={styles.cardHeader}>
                    <Globe size={24} />
                    <div>
                      <h3>Site Information</h3>
                      <p>Basic site configuration</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.settingItem}>
                      <label htmlFor="siteName">Site Name</label>
                      <input
                        type="text"
                        id="siteName"
                        value={systemSettings.siteName}
                        onChange={(e) => handleSystemChange('siteName', e.target.value)}
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label htmlFor="siteUrl">Site URL</label>
                      <input
                        type="url"
                        id="siteUrl"
                        value={systemSettings.siteUrl}
                        onChange={(e) => handleSystemChange('siteUrl', e.target.value)}
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.settingItem}>
                      <label htmlFor="adminEmail">Admin Email</label>
                      <input
                        type="email"
                        id="adminEmail"
                        value={systemSettings.adminEmail}
                        onChange={(e) => handleSystemChange('adminEmail', e.target.value)}
                        className={styles.textInput}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.settingCard}>
                  <div className={styles.cardHeader}>
                    <DollarSign size={24} />
                    <div>
                      <h3>Localization</h3>
                      <p>Currency and timezone settings</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.settingItem}>
                      <label htmlFor="currency">Currency</label>
                      <select
                        id="currency"
                        value={systemSettings.currency}
                        onChange={(e) => handleSystemChange('currency', e.target.value)}
                        className={styles.selectInput}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>

                    <div className={styles.settingItem}>
                      <label htmlFor="timezone">Timezone</label>
                      <select
                        id="timezone"
                        value={systemSettings.timezone}
                        onChange={(e) => handleSystemChange('timezone', e.target.value)}
                        className={styles.selectInput}
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.settingCard}>
                  <div className={styles.cardHeader}>
                    <Shield size={24} />
                    <div>
                      <h3>Maintenance Mode</h3>
                      <p>Temporarily disable public access</p>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.settingItem}>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={systemSettings.maintenanceMode}
                          onChange={(e) => handleSystemChange('maintenanceMode', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                        Enable Maintenance Mode
                      </label>
                      <p className={styles.settingDescription}>
                        When enabled, only admin users can access the site
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Security Settings</h2>
                <p>Configure security and authentication settings</p>
              </div>

              <div className={styles.comingSoon}>
                <Key size={48} />
                <h3>Security Settings</h3>
                <p>Advanced security configuration options will be available in a future update.</p>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Integrations</h2>
                <p>Configure third-party service integrations</p>
              </div>

              <div className={styles.comingSoon}>
                <Globe size={48} />
                <h3>Integrations</h3>
                <p>Payment gateways, shipping providers, and other integrations will be available in a future update.</p>
                <div className={styles.integrationsList}>
                  <div className={styles.integrationItem}>
                    <div className={styles.integrationIcon}>💳</div>
                    <div className={styles.integrationInfo}>
                      <h4>Stripe</h4>
                      <p>Payment processing</p>
                    </div>
                    <span className={styles.integrationStatus}>Configured</span>
                  </div>
                  <div className={styles.integrationItem}>
                    <div className={styles.integrationIcon}>📧</div>
                    <div className={styles.integrationInfo}>
                      <h4>Email Service</h4>
                      <p>Notification emails</p>
                    </div>
                    <span className={styles.integrationStatus}>Configured</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
