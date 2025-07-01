'use client';

import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import styles from './CartIcon.module.css';

interface CartIconProps {
  className?: string;
  onClick?: () => void;
}

export default function CartIcon({ className, onClick }: CartIconProps) {
  const { items, toggleCart } = useCartStore();
  
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toggleCart();
    }
  };

  return (
    <button 
      className={`${styles.cartIcon} ${className || ''}`}
      onClick={handleClick}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <div className={styles.iconWrapper}>
        <ShoppingBag className={styles.icon} />
        {itemCount > 0 && (
          <span className={styles.badge} aria-label={`${itemCount} items in cart`}>
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
    </button>
  );
}
