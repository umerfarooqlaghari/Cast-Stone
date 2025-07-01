'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { AdminProvider } from '../../contexts/AdminContext';
import styles from './layout.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Public routes that don't require authentication
  const publicRoutes = ['/admin/login', '/admin/change-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      if (isPublicRoute) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        const response = await fetch('/api/admin/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, isPublicRoute]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Render public routes without admin layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Render admin dashboard layout for authenticated routes
  if (isAuthenticated) {
    return (
      <AdminProvider>
        <div className={styles.adminLayout}>
          <AdminSidebar />
          <div className={styles.mainContent}>
            <AdminHeader />
            <main className={styles.content}>
              {children}
            </main>
          </div>
        </div>
      </AdminProvider>
    );
  }

  return null;
}
