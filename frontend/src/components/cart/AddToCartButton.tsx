'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCartStore, CartItem } from '../../store/cartStore';
import styles from './AddToCartButton.module.css';

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function AddToCartButton({
  product,
  variant = 'primary',
  size = 'medium',
  className,
  disabled = false,
  showIcon = true,
  children
}: AddToCartButtonProps) {
  const { addItem, items } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isInCart = items.some(item => item.id === product.id);

  const handleAddToCart = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      addItem(product);
      setJustAdded(true);
      
      // Reset the "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (children) return children;
    if (isLoading) return 'Adding...';
    if (justAdded) return 'Added!';
    if (isInCart) return 'In Cart';
    return 'Add to Cart';
  };

  const getIcon = () => {
    if (!showIcon) return null;
    if (isLoading) return <Loader2 className={styles.spinner} />;
    if (justAdded) return <Check />;
    return <ShoppingCart />;
  };

  const buttonClasses = [
    styles.addToCartButton,
    styles[variant],
    styles[size],
    isLoading && styles.loading,
    justAdded && styles.success,
    isInCart && styles.inCart,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      aria-label={`Add ${product.name} to cart`}
    >
      {getIcon()}
      <span className={styles.text}>{getButtonText()}</span>
    </button>
  );
}
