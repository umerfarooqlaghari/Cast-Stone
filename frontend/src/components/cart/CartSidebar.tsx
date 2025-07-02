'use client';

import { useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore, formatPrice } from '../../store/cartStore';
import styles from './CartSidebar.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function CartSidebar() {
  const { 
    items, 
    isOpen, 
    subtotal, 
    tax, 
    shipping, 
    total, 
    toggleCart, 
    updateQuantity, 
    removeItem,
    calculateTotals 
  } = useCartStore();

  // Calculate totals when component mounts or items change
  useEffect(() => {
    calculateTotals();
  }, [items, calculateTotals]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={toggleCart} />
      
      {/* Sidebar */}
      <div className={styles.sidebar}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <ShoppingBag className={styles.headerIcon} />
            <h2 className={styles.title}>Shopping Cart</h2>
            <span className={styles.itemCount}>({items.length} items)</span>
          </div>
          <button 
            className={styles.closeButton}
            onClick={toggleCart}
            aria-label="Close cart"
          >
            <X />
          </button>
        </div>

        {/* Cart Content */}
        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingBag className={styles.emptyIcon} />
              <h3>Your cart is empty</h3>
              <p>Add some beautiful cast stone pieces to get started!</p>
              <Link href="/products" className={styles.shopButton} onClick={toggleCart}>
                Shop Now
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className={styles.items}>
                {items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemImage}>
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.name}
                          width={80}
                          height={80}
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
                      <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                      
                      <div className={styles.quantityControls}>
                        <button
                          className={styles.quantityButton}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus />
                        </button>
                        <span className={styles.quantity}>{item.quantity}</span>
                        <button
                          className={styles.quantityButton}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus />
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.itemActions}>
                      <p className={styles.itemTotal}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        className={styles.removeButton}
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax:</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                {subtotal > 0 && subtotal < 500 && (
                  <p className={styles.freeShippingNote}>
                    Add {formatPrice(500 - subtotal)} more for free shipping!
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <div className={styles.actions}>
                <Link 
                  href="/checkout" 
                  className={styles.checkoutButton}
                  onClick={toggleCart}
                >
                  Proceed to Checkout
                </Link>
                <Link 
                  href="/cart" 
                  className={styles.viewCartButton}
                  onClick={toggleCart}
                >
                  View Full Cart
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
