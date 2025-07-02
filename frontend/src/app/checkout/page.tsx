'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, Footer, OrderSummary } from '../../components';
import { useCartStore } from '../../store/cartStore';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import styles from './page.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, calculateTotals } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateTotals();
    setIsLoading(false);
    
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, calculateTotals, router]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading checkout...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className={styles.container}>
      <Navigation />
      
      <main className={styles.main}>
        <div className={styles.checkoutContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Checkout</h1>
            <p className={styles.subtitle}>
              Complete your order for beautiful cast stone pieces
            </p>
          </div>

          <div className={styles.checkoutContent}>
            <div className={styles.formSection}>
              <CheckoutForm />
            </div>
            
            <div className={styles.summarySection}>
              <OrderSummary />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
