/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Download,
  RefreshCw,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import styles from './page.module.css';

interface DashboardData {
  summary: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
    userGrowth: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    totalPrice: number;
    financialStatus: string;
    fulfillmentStatus: string;
    createdAt: string;
    customer: {
      firstName: string;
      lastName: string;
    };
  }>;
  topProducts: Array<{
    productId: string;
    title: string;
    handle: string;
    totalSales: number;
    totalRevenue: number;
  }>;
  inventoryAlerts: {
    lowStockCount: number;
    outOfStockCount: number;
  };
}

interface DateRange {
  period: string;
  dateFrom: string;
  dateTo: string;
}

export default function AnalyticsPage() {
  const { apiCall } = useAdmin();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange>({
    period: '30',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      if (dateRange.period !== 'custom') {
        queryParams.append('period', dateRange.period);
      } else {
        if (dateRange.dateFrom) queryParams.append('dateFrom', dateRange.dateFrom);
        if (dateRange.dateTo) queryParams.append('dateTo', dateRange.dateTo);
      }

      const response = await apiCall(`/admin/analytics/dashboard?${queryParams}`);
      
      if (response.success) {
        setDashboardData(response.data as DashboardData);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Fetch dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handlePeriodChange = (period: string) => {
    setDateRange(prev => ({ ...prev, period }));
  };

  const handleCustomDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value, period: 'custom' }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp size={16} className={styles.growthPositive} />;
    if (growth < 0) return <TrendingDown size={16} className={styles.growthNegative} />;
    return null;
  };

  const getGrowthClass = (growth: number) => {
    if (growth > 0) return styles.growthPositive;
    if (growth < 0) return styles.growthNegative;
    return styles.growthNeutral;
  };

  const handleExportReport = async () => {
    try {
      if (!dashboardData) return;

      // Create comprehensive analytics report
      const reportData = [
        ['Cast Stone Analytics Report'],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [`Period: ${dateRange.period === 'custom' ? `${dateRange.dateFrom} to ${dateRange.dateTo}` : `Last ${dateRange.period} days`}`],
        [''],
        ['SUMMARY METRICS'],
        ['Metric', 'Value', 'Growth'],
        ['Total Revenue', formatCurrency(dashboardData.summary.totalRevenue), `${dashboardData.summary.revenueGrowth.toFixed(1)}%`],
        ['Total Orders', formatNumber(dashboardData.summary.totalOrders), `${dashboardData.summary.orderGrowth.toFixed(1)}%`],
        ['Total Customers', formatNumber(dashboardData.summary.totalUsers), `${dashboardData.summary.userGrowth.toFixed(1)}%`],
        ['Total Products', formatNumber(dashboardData.summary.totalProducts), ''],
        ['Average Order Value', formatCurrency(dashboardData.summary.averageOrderValue), ''],
        [''],
        ['TOP PRODUCTS'],
        ['Rank', 'Product', 'Sales', 'Revenue'],
        ...dashboardData.topProducts.map((product, index) => [
          (index + 1).toString(),
          product.title,
          product.totalSales.toString(),
          formatCurrency(product.totalRevenue)
        ]),
        [''],
        ['RECENT ORDERS'],
        ['Order Number', 'Customer', 'Amount', 'Date'],
        ...dashboardData.recentOrders.map(order => [
          order.orderNumber,
          `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
          formatCurrency(order.totalPrice),
          formatDate(order.createdAt)
        ]),
        [''],
        ['INVENTORY ALERTS'],
        ['Alert Type', 'Count'],
        ['Low Stock Items', dashboardData.inventoryAlerts.lowStockCount.toString()],
        ['Out of Stock Items', dashboardData.inventoryAlerts.outOfStockCount.toString()]
      ];

      const csvContent = reportData.map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertTriangle size={24} />
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Analytics Dashboard</h1>
          <p className={styles.subtitle}>
            Monitor your business performance and key metrics
          </p>
        </div>
        <div className={styles.headerRight}>
          <button 
            onClick={refreshData} 
            className={`${styles.refreshButton} ${refreshing ? styles.refreshing : ''}`}
            disabled={refreshing}
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button className={styles.exportButton} onClick={handleExportReport}>
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className={styles.dateRangeSelector}>
        <div className={styles.periodButtons}>
          {[
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
            { value: 'custom', label: 'Custom' }
          ].map(period => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value)}
              className={`${styles.periodButton} ${dateRange.period === period.value ? styles.active : ''}`}
            >
              {period.label}
            </button>
          ))}
        </div>
        
        {dateRange.period === 'custom' && (
          <div className={styles.customDateInputs}>
            <input
              type="date"
              value={dateRange.dateFrom}
              onChange={(e) => handleCustomDateChange('dateFrom', e.target.value)}
              className={styles.dateInput}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.dateTo}
              onChange={(e) => handleCustomDateChange('dateTo', e.target.value)}
              className={styles.dateInput}
            />
          </div>
        )}
      </div>

      {dashboardData && (
        <>
          {/* Key Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>
                  <DollarSign size={24} />
                </div>
                <div className={styles.metricGrowth}>
                  {getGrowthIcon(dashboardData.summary.revenueGrowth)}
                  <span className={getGrowthClass(dashboardData.summary.revenueGrowth)}>
                    {Math.abs(dashboardData.summary.revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className={styles.metricValue}>
                {formatCurrency(dashboardData.summary.totalRevenue)}
              </div>
              <div className={styles.metricLabel}>Total Revenue</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>
                  <ShoppingBag size={24} />
                </div>
                <div className={styles.metricGrowth}>
                  {getGrowthIcon(dashboardData.summary.orderGrowth)}
                  <span className={getGrowthClass(dashboardData.summary.orderGrowth)}>
                    {Math.abs(dashboardData.summary.orderGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className={styles.metricValue}>
                {formatNumber(dashboardData.summary.totalOrders)}
              </div>
              <div className={styles.metricLabel}>Total Orders</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>
                  <Users size={24} />
                </div>
                <div className={styles.metricGrowth}>
                  {getGrowthIcon(dashboardData.summary.userGrowth)}
                  <span className={getGrowthClass(dashboardData.summary.userGrowth)}>
                    {Math.abs(dashboardData.summary.userGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className={styles.metricValue}>
                {formatNumber(dashboardData.summary.totalUsers)}
              </div>
              <div className={styles.metricLabel}>Total Customers</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>
                  <Package size={24} />
                </div>
              </div>
              <div className={styles.metricValue}>
                {formatNumber(dashboardData.summary.totalProducts)}
              </div>
              <div className={styles.metricLabel}>Total Products</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>
                  <DollarSign size={24} />
                </div>
              </div>
              <div className={styles.metricValue}>
                {formatCurrency(dashboardData.summary.averageOrderValue)}
              </div>
              <div className={styles.metricLabel}>Average Order Value</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={styles.metricIcon}>
                  <AlertTriangle size={24} />
                </div>
              </div>
              <div className={styles.metricValue}>
                {dashboardData.inventoryAlerts.lowStockCount + dashboardData.inventoryAlerts.outOfStockCount}
              </div>
              <div className={styles.metricLabel}>Inventory Alerts</div>
            </div>
          </div>

          {/* Content Grid */}
          <div className={styles.contentGrid}>
            {/* Recent Orders */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Recent Orders</h3>
                <button className={styles.viewAllButton}>
                  <Eye size={16} />
                  View All
                </button>
              </div>
              <div className={styles.cardContent}>
                {dashboardData.recentOrders.length > 0 ? (
                  <div className={styles.ordersList}>
                    {dashboardData.recentOrders.map((order) => (
                      <div key={order._id} className={styles.orderItem}>
                        <div className={styles.orderInfo}>
                          <span className={styles.orderNumber}>#{order.orderNumber}</span>
                          <span className={styles.orderCustomer}>
                            {order.customer?.firstName} {order.customer?.lastName}
                          </span>
                        </div>
                        <div className={styles.orderMeta}>
                          <span className={styles.orderAmount}>
                            {formatCurrency(order.totalPrice)}
                          </span>
                          <span className={styles.orderDate}>
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <ShoppingBag size={32} />
                    <p>No recent orders</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Top Products</h3>
                <button className={styles.viewAllButton}>
                  <Eye size={16} />
                  View All
                </button>
              </div>
              <div className={styles.cardContent}>
                {dashboardData.topProducts.length > 0 ? (
                  <div className={styles.productsList}>
                    {dashboardData.topProducts.map((product, index) => (
                      <div key={product.productId} className={styles.productItem}>
                        <div className={styles.productRank}>#{index + 1}</div>
                        <div className={styles.productInfo}>
                          <span className={styles.productTitle}>{product.title}</span>
                          <span className={styles.productSales}>
                            {product.totalSales} sold
                          </span>
                        </div>
                        <div className={styles.productRevenue}>
                          {formatCurrency(product.totalRevenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <Package size={32} />
                    <p>No product data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Inventory Alerts</h3>
                <button className={styles.viewAllButton}>
                  <Eye size={16} />
                  View All
                </button>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.alertsGrid}>
                  <div className={styles.alertItem}>
                    <div className={styles.alertIcon}>
                      <AlertTriangle size={20} />
                    </div>
                    <div className={styles.alertInfo}>
                      <span className={styles.alertCount}>
                        {dashboardData.inventoryAlerts.lowStockCount}
                      </span>
                      <span className={styles.alertLabel}>Low Stock Items</span>
                    </div>
                  </div>
                  <div className={styles.alertItem}>
                    <div className={`${styles.alertIcon} ${styles.critical}`}>
                      <AlertTriangle size={20} />
                    </div>
                    <div className={styles.alertInfo}>
                      <span className={styles.alertCount}>
                        {dashboardData.inventoryAlerts.outOfStockCount}
                      </span>
                      <span className={styles.alertLabel}>Out of Stock</span>
                    </div>
                  </div>
                </div>
                {(dashboardData.inventoryAlerts.lowStockCount > 0 || dashboardData.inventoryAlerts.outOfStockCount > 0) && (
                  <div className={styles.alertAction}>
                    <button className={styles.alertActionButton}>
                      View Inventory Issues
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
