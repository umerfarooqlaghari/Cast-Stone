'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useCartStore, formatPrice } from '../../store/cartStore';
import styles from './OrderSummary.module.css';

export default function OrderSummary() {
  const { 
    items, 
    subtotal, 
    tax, 
    shipping, 
    total, 
    calculateTotals 
  } = useCartStore();

  useEffect(() => {
    calculateTotals();
  }, [items, calculateTotals]);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className={styles.orderSummary}>
      <div className={styles.header}>
        <h3 className={styles.title}>Order Summary</h3>
        <span className={styles.itemCount}>({itemCount} items)</span>
      </div>

      {/* Order Items */}
      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemImage}>
              {item.image ? (
                <Image 
                  src={item.image} 
                  alt={item.name}
                  width={60}
                  height={60}
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <ShoppingBag />
                </div>
              )}
            </div>
            
            <div className={styles.itemDetails}>
              <h4 className={styles.itemName}>{item.name}</h4>
              {item.category && (
                <p className={styles.itemCategory}>{item.category}</p>
              )}
              <div className={styles.itemPricing}>
                <span className={styles.itemPrice}>{formatPrice(item.price)}</span>
                <span className={styles.itemQuantity}>× {item.quantity}</span>
              </div>
            </div>
            
            <div className={styles.itemTotal}>
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className={styles.pricing}>
        <div className={styles.pricingRow}>
          <span>Subtotal:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className={styles.pricingRow}>
          <span>Tax:</span>
          <span>{formatPrice(tax)}</span>
        </div>
        
        <div className={styles.pricingRow}>
          <span>Shipping:</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        
        {subtotal > 0 && subtotal < 500 && (
          <div className={styles.freeShippingNote}>
            <p>Add {formatPrice(500 - subtotal)} more for free shipping!</p>
          </div>
        )}
        
        <div className={styles.totalRow}>
          <span>Total:</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Security Notice */}
      <div className={styles.securityNotice}>
        <div className={styles.securityIcon}>🔒</div>
        <div className={styles.securityText}>
          <p><strong>Secure Checkout</strong></p>
          <p>Your payment information is encrypted and secure.</p>
        </div>
      </div>

      {/* Policies */}
      <div className={styles.policies}>
        <p className={styles.policyText}>
          By placing your order, you agree to our{' '}
          <a href="/terms" className={styles.policyLink}>Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className={styles.policyLink}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
