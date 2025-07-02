'use client';

import { useEffect, useState } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar
} from 'lucide-react';
import { useAdmin } from '../../../contexts/AdminContext';
import styles from './page.module.css';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export default function AdminDashboard() {
  const { state, hasPermission } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch real dashboard data from analytics API
        const response = await fetch('http://localhost:5000/api/admin/analytics/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard API response:', data);

          if (data.success) {
            setStats({
              totalProducts: data.data.summary.totalProducts || 0,
              totalOrders: data.data.summary.totalOrders || 0,
              totalUsers: data.data.summary.totalUsers || 0,
              totalRevenue: data.data.summary.totalRevenue || 0,
              recentOrders: data.data.recentOrders || [],
              topProducts: data.data.topProducts || []
            });
          }
        } else {
          console.error('Failed to fetch dashboard data:', response.status);
          // Fallback to empty data
          setStats({
            totalProducts: 0,
            totalOrders: 0,
            totalUsers: 0,
            totalRevenue: 0,
            recentOrders: [],
            topProducts: []
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'green',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'purple',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'orange',
      change: '+22%',
      trend: 'up'
    }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <p className={styles.subtitle}>
            Welcome back, {state.admin?.name}! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton}>
            <Calendar />
            Last 30 days
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${styles.statCard} ${styles[card.color]}`}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                  <Icon />
                </div>
                <div className={styles.statTrend}>
                  {card.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                  <span>{card.change}</span>
                </div>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{card.value}</h3>
                <p className={styles.statTitle}>{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.contentGrid}>
        {/* Recent Orders */}
        {hasPermission('orders', 'read') && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Recent Orders</h2>
              <button className={styles.viewAllButton}>
                <Eye />
                View All
              </button>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <span>Order</span>
                  <span>Customer</span>
                  <span>Total</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>
                {stats?.recentOrders.map((order) => (
                  <div key={order.id} className={styles.tableRow}>
                    <span className={styles.orderNumber}>{order.orderNumber}</span>
                    <span>{order.customer}</span>
                    <span className={styles.orderTotal}>${order.total.toLocaleString()}</span>
                    <span className={`${styles.status} ${styles[order.status]}`}>
                      {order.status}
                    </span>
                    <span>{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Products */}
        {hasPermission('products', 'read') && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Top Products</h2>
              <button className={styles.viewAllButton}>
                <Eye />
                View All
              </button>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.productList}>
                {stats?.topProducts.map((product, index) => (
                  <div key={product.id} className={styles.productItem}>
                    <div className={styles.productRank}>#{index + 1}</div>
                    <div className={styles.productInfo}>
                      <h4 className={styles.productName}>{product.name}</h4>
                      <p className={styles.productStats}>
                        {product.sales} sales • ${product.revenue.toLocaleString()} revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
