'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import { Navigation, Footer, AddToCartButton } from '../../components';
import { productsApi } from '../../services/api';
import styles from "./page.module.css";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'fireplaces', name: 'Fireplaces' },
    { id: 'garden', name: 'Garden Features' },
    { id: 'architectural', name: 'Architectural' },
    { id: 'decorative', name: 'Decorative' }
  ];

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      console.log('Fetching products...', { selectedCategory });
      setIsLoading(true);
      setError(null);

      const response = await productsApi.getProducts({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 50
      });

      console.log('Products API response:', response);

      if (response.products) {
        // Transform API data to match our interface
        const transformedProducts: Product[] = response.products.map((product: any) => ({
          id: product._id || product.id,
          name: product.title || product.name,
          category: product.category,
          price: product.priceRange?.min || product.price || 0,
          image: product.featuredImage?.url || product.images?.[0]?.url || product.image || '/images/placeholder.jpg',
          description: product.description || ''
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products; // Filtering is now done in the API call

  return (
    <div className={styles.container}>
      <Navigation />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Products</h1>
          <p className={styles.heroSubtitle}>
            Discover our complete collection of handcrafted cast stone elements, 
            from elegant fireplaces to stunning garden features.
          </p>
        </div>
      </section>

      {/* Product Categories */}
      <section className={styles.productsSection}>
        <div className={styles.categoryFilter}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryBtn} ${
                selectedCategory === category.id ? styles.active : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
              <button onClick={fetchProducts} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>No products found in this category.</p>
            </div>
          ) : (
            filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className={styles.productImage}
                />
                <div className={styles.productOverlay}>
                  <button className={styles.viewBtn}>View Details</button>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      category: product.category,
                      description: product.description
                    }}
                    variant="primary"
                    size="medium"
                  />
                </div>
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>${product.price.toLocaleString()}</span>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      category: product.category,
                      description: product.description
                    }}
                    variant="outline"
                    size="small"
                  />
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Need Custom Design?</h2>
          <p>Our master craftsmen can create bespoke cast stone pieces tailored to your specific requirements.</p>
          <button className={styles.ctaBtn}>Request Custom Quote</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
