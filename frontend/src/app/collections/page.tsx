'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Package, FolderOpen, Folder } from 'lucide-react';
import { Navigation, Footer } from '../../components';
import { collectionsApi } from '../../services/api';
import styles from './page.module.css';

interface Collection {
  _id: string;
  title: string;
  handle: string;
  description: string;
  level: number;
  path: string;
  children: Collection[];
  image?: {
    url?: string;
    altText?: string;
  };
  productCount?: number;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await collectionsApi.getCollectionHierarchy();
      setCollections(response.collections || []);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      setError('Failed to load collections. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const renderCollectionCard = (collection: Collection) => (
    <div key={collection._id} className={styles.collectionCard}>
      <Link href={`/collections/${collection.handle}`} className={styles.collectionLink}>
        <div className={styles.collectionImage}>
          <Image
            src={collection.image?.url || '/images/placeholder-collection.jpg'}
            alt={collection.image?.altText || collection.title}
            width={400}
            height={300}
            className={styles.image}
          />
          <div className={styles.collectionOverlay}>
            <div className={styles.collectionIcon}>
              {collection.children?.length > 0 ? <FolderOpen size={24} /> : <Package size={24} />}
            </div>
          </div>
        </div>
        
        <div className={styles.collectionContent}>
          <h3 className={styles.collectionTitle}>{collection.title}</h3>
          <p className={styles.collectionDescription}>
            {collection.description || 'Explore our collection of premium cast stone products.'}
          </p>
          
          <div className={styles.collectionMeta}>
            <span className={styles.levelBadge}>Level {collection.level}</span>
            {collection.children?.length > 0 && (
              <span className={styles.childrenCount}>
                {collection.children.length} subcategories
              </span>
            )}
            {collection.productCount !== undefined && (
              <span className={styles.productCount}>
                {collection.productCount} products
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {collection.children && collection.children.length > 0 && (
        <div className={styles.subCollections}>
          <h4 className={styles.subCollectionsTitle}>Subcategories:</h4>
          <div className={styles.subCollectionsGrid}>
            {collection.children.map((child) => (
              <Link
                key={child._id}
                href={`/collections/${child.handle}`}
                className={styles.subCollectionLink}
              >
                <div className={styles.subCollectionCard}>
                  <div className={styles.subCollectionIcon}>
                    {child.children?.length > 0 ? <Folder size={16} /> : <Package size={16} />}
                  </div>
                  <div className={styles.subCollectionInfo}>
                    <span className={styles.subCollectionTitle}>{child.title}</span>
                    <span className={styles.subCollectionLevel}>Level {child.level}</span>
                  </div>
                  <ChevronRight size={16} className={styles.subCollectionArrow} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading collections...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchCollections} className={styles.retryButton}>
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navigation />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Collections</h1>
          <p className={styles.heroSubtitle}>
            Discover our comprehensive range of cast stone products, organized by category and style
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className={styles.collectionsSection}>
        <div className={styles.collectionsContainer}>
          {collections.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={64} />
              <h3>No Collections Found</h3>
              <p>We're currently updating our collections. Please check back soon.</p>
            </div>
          ) : (
            <div className={styles.collectionsGrid}>
              {collections.map(renderCollectionCard)}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
