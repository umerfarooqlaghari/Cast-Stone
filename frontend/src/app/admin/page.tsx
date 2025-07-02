'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      // Redirect to dashboard if authenticated
      router.replace('/admin/dashboard');
    } else {
      // Redirect to login if not authenticated
      router.replace('/admin/login');
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #8b4513',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p>Redirecting...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
