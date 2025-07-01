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
        // Simulate API call - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalProducts: 156,
          totalOrders: 1247,
          totalUsers: 892,
          totalRevenue: 125430,
          recentOrders: [
            {
              id: '1',
              orderNumber: 'CS-001234',
              customer: 'John Smith',
              total: 2500,
              status: 'confirmed',
              date: '2024-01-15'
            },
            {
              id: '2',
              orderNumber: 'CS-001235',
              customer: 'Sarah Johnson',
              total: 1800,
              status: 'processing',
              date: '2024-01-15'
            },
            {
              id: '3',
              orderNumber: 'CS-001236',
              customer: 'Mike Davis',
              total: 3200,
              status: 'shipped',
              date: '2024-01-14'
            }
          ],
          topProducts: [
            {
              id: '1',
              name: 'Classic Fireplace Mantel',
              sales: 45,
              revenue: 112500
            },
            {
              id: '2',
              name: 'Garden Fountain',
              sales: 32,
              revenue: 57600
            },
            {
              id: '3',
              name: 'Decorative Columns',
              sales: 28,
              revenue: 33600
            }
          ]
        });
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
            Welcome back, {state.admin?.name}! Here's what's happening with your store.
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
