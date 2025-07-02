'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Package, ArrowLeft, Grid, List } from 'lucide-react';
import { Navigation, Footer, AddToCartButton } from '../../../components';
import { collectionsApi } from '../../../services/api';
import styles from './page.module.css';

interface Collection {
  _id: string;
  title: string;
  handle: string;
  description: string;
  level: number;
  path: string;
  parent?: {
    _id: string;
    title: string;
    handle: string;
  };
  children: Collection[];
}

interface Product {
  _id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
  featuredImage?: {
    url: string;
    altText?: string;
  };
  images: Array<{
    url: string;
    altText?: string;
  }>;
}

interface Breadcrumb {
  _id: string;
  title: string;
  handle: string;
  level: number;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const handle = params.handle as string;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [includeDescendants, setIncludeDescendants] = useState(false);

  const fetchCollection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await collectionsApi.getCollection(handle);
      setCollection(response.collection);
      
      // Fetch breadcrumbs
      const breadcrumbsResponse = await collectionsApi.getCollectionBreadcrumbs(response.collection._id);
      setBreadcrumbs(breadcrumbsResponse.breadcrumbs || []);
      
    } catch (error) {
      console.error('Failed to fetch collection:', error);
      setError('Collection not found.');
    } finally {
      setIsLoading(false);
    }
  }, [handle]);

  const fetchProducts = useCallback(async () => {
    if (!collection) return;

    try {
      setIsLoadingProducts(true);

      // Use the collections API to get products
      const response = await fetch(`/api/collections/${collection._id}/products?includeDescendants=${includeDescendants}&limit=50`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [collection, includeDescendants]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  useEffect(() => {
    if (collection) {
      fetchProducts();
    }
  }, [fetchProducts]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading collection...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error || 'Collection not found'}</p>
          <Link href="/collections" className={styles.backButton}>
            <ArrowLeft size={16} />
            Back to Collections
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navigation />
      
      {/* Breadcrumbs */}
      <section className={styles.breadcrumbsSection}>
        <div className={styles.breadcrumbsContainer}>
          <nav className={styles.breadcrumbs}>
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <ChevronRight size={16} className={styles.breadcrumbSeparator} />
            <Link href="/collections" className={styles.breadcrumbLink}>Collections</Link>
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={breadcrumb._id} className={styles.breadcrumbItem}>
                <ChevronRight size={16} className={styles.breadcrumbSeparator} />
                {index === breadcrumbs.length - 1 ? (
                  <span className={styles.breadcrumbCurrent}>{breadcrumb.title}</span>
                ) : (
                  <Link href={`/collections/${breadcrumb.handle}`} className={styles.breadcrumbLink}>
                    {breadcrumb.title}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </section>

      {/* Collection Header */}
      <section className={styles.collectionHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <h1 className={styles.collectionTitle}>{collection.title}</h1>
            <p className={styles.collectionDescription}>{collection.description}</p>
            <div className={styles.collectionMeta}>
              <span className={styles.levelBadge}>Level {collection.level}</span>
              <span className={styles.pathInfo}>{collection.path}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sub Collections */}
      {collection.children && collection.children.length > 0 && (
        <section className={styles.subCollectionsSection}>
          <div className={styles.subCollectionsContainer}>
            <h2 className={styles.subCollectionsTitle}>Subcategories</h2>
            <div className={styles.subCollectionsGrid}>
              {collection.children.map((child) => (
                <Link
                  key={child._id}
                  href={`/collections/${child.handle}`}
                  className={styles.subCollectionCard}
                >
                  <div className={styles.subCollectionIcon}>
                    <Package size={24} />
                  </div>
                  <div className={styles.subCollectionContent}>
                    <h3 className={styles.subCollectionTitle}>{child.title}</h3>
                    <p className={styles.subCollectionLevel}>Level {child.level}</p>
                  </div>
                  <ChevronRight size={20} className={styles.subCollectionArrow} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className={styles.productsSection}>
        <div className={styles.productsContainer}>
          <div className={styles.productsHeader}>
            <h2 className={styles.productsTitle}>Products</h2>
            <div className={styles.productsControls}>
              {collection.children && collection.children.length > 0 && (
                <label className={styles.includeDescendantsLabel}>
                  <input
                    type="checkbox"
                    checked={includeDescendants}
                    onChange={(e) => setIncludeDescendants(e.target.checked)}
                  />
                  <span>Include subcategories</span>
                </label>
              )}
              <div className={styles.viewModeToggle}>
                <button
                  className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </button>
                <button
                  className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className={styles.productsLoading}>
              <div className={styles.spinner}></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyProducts}>
              <Package size={48} />
              <h3>No Products Found</h3>
              <p>This collection doesn't have any products yet.</p>
            </div>
          ) : (
            <div className={`${styles.productsGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
              {products.map((product) => (
                <div key={product._id} className={styles.productCard}>
                  <Link href={`/products/${product.handle}`} className={styles.productLink}>
                    <div className={styles.productImage}>
                      <Image
                        src={product.featuredImage?.url || product.images?.[0]?.url || '/images/placeholder.jpg'}
                        alt={product.featuredImage?.altText || product.title}
                        width={300}
                        height={300}
                        className={styles.productImg}
                      />
                    </div>
                    <div className={styles.productContent}>
                      <h3 className={styles.productTitle}>{product.title}</h3>
                      <p className={styles.productDescription}>{product.description}</p>
                      <div className={styles.productPrice}>
                        {product.priceRange.min === product.priceRange.max ? (
                          formatPrice(product.priceRange.min)
                        ) : (
                          `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className={styles.productActions}>
                    <AddToCartButton
                      productId={product._id}
                      productName={product.title}
                      price={product.priceRange.min}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
