'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { Navigation, Footer } from '../../components';
import { useCartStore, formatPrice } from '../../store/cartStore';
import styles from './page.module.css';

export default function CartPage() {
  const { 
    items, 
    subtotal, 
    tax, 
    shipping, 
    total, 
    updateQuantity, 
    removeItem, 
    clearCart,
    calculateTotals 
  } = useCartStore();

  useEffect(() => {
    calculateTotals();
  }, [items, calculateTotals]);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className={styles.container}>
      <Navigation />
      
      <main className={styles.main}>
        <div className={styles.cartContainer}>
          <div className={styles.header}>
            <Link href="/products" className={styles.backLink}>
              <ArrowLeft />
              Continue Shopping
            </Link>
            <h1 className={styles.title}>Shopping Cart</h1>
            <p className={styles.subtitle}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingBag className={styles.emptyIcon} />
              <h2>Your cart is empty</h2>
              <p>Add some beautiful cast stone pieces to get started!</p>
              <Link href="/products" className={styles.shopButton}>
                Shop Now
              </Link>
            </div>
          ) : (
            <div className={styles.cartContent}>
              <div className={styles.cartItems}>
                <div className={styles.itemsHeader}>
                  <span>Product</span>
                  <span>Quantity</span>
                  <span>Price</span>
                  <span>Total</span>
                  <span></span>
                </div>
                
                {items.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.productInfo}>
                      <div className={styles.productImage}>
                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            width={100}
                            height={100}
                            className={styles.image}
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <ShoppingBag />
                          </div>
                        )}
                      </div>
                      <div className={styles.productDetails}>
                        <h3 className={styles.productName}>{item.name}</h3>
                        {item.category && (
                          <p className={styles.productCategory}>{item.category}</p>
                        )}
                        <p className={styles.productDescription}>{item.description}</p>
                      </div>
                    </div>
                    
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
                    
                    <div className={styles.price}>
                      {formatPrice(item.price)}
                    </div>
                    
                    <div className={styles.total}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    
                    <button
                      className={styles.removeButton}
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))}
                
                <div className={styles.cartActions}>
                  <button 
                    className={styles.clearButton}
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className={styles.cartSummary}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>
                
                <div className={styles.summaryRow}>
                  <span>Subtotal ({itemCount} items):</span>
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
                
                {subtotal > 0 && subtotal < 500 && (
                  <div className={styles.freeShippingNote}>
                    Add {formatPrice(500 - subtotal)} more for free shipping!
                  </div>
                )}
                
                <div className={styles.summaryTotal}>
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                <Link href="/checkout" className={styles.checkoutButton}>
                  Proceed to Checkout
                </Link>
                
                <Link href="/products" className={styles.continueShoppingButton}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
