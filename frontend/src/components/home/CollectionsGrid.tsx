'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import Link from "next/link";
import { collectionsApi } from '../../services/api';
import styles from './CollectionsGrid.module.css';

interface Collection {
  _id: string;
  title: string;
  handle: string;
  description: string;
  level: number;
  children: Collection[];
  image?: {
    url?: string;
    altText?: string;
  };
}

interface CollectionsGridProps {
  className?: string;
}

export default function CollectionsGrid({ className }: CollectionsGridProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get only root collections for the homepage
      const response = await collectionsApi.getRootCollections();
      setCollections(response.collections || []);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      setError('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  if (isLoading) {
    return (
      <section className={`${styles.collectionsSection} ${className || ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading collections...</p>
        </div>
      </section>
    );
  }

  if (error || collections.length === 0) {
    return (
      <section className={`${styles.collectionsSection} ${className || ''}`}>
        <div className={styles.errorContainer}>
          <p>Unable to load collections at this time.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.collectionsSection} ${className || ''}`}>
      <div className={styles.collectionsGrid}>
        {collections.map((collection) => (
          <div key={collection._id} className={styles.collectionCard}>
            <div className={styles.collectionImage}>
              <Image
                src={collection.image?.url || '/images/placeholder-collection.jpg'}
                alt={collection.image?.altText || collection.title}
                fill
                className={styles.collectionImg}
              />
            </div>
            <div className={styles.collectionOverlay}>
              <div className={styles.collectionBrand}>{collection.title}</div>
              <div className={styles.collectionSubtitle}>
                {collection.children?.length > 0 ? `${collection.children.length} Categories` : 'Premium Collection'}
              </div>
              <div className={styles.collectionDescription}>
                {collection.description || 'Explore our premium cast stone collection'}
              </div>
              <div className={styles.collectionPrice}>Starting from $299</div>
              <div className={styles.collectionButtons}>
                <Link href={`/collections/${collection.handle}`} className={styles.buildBtn}>
                  EXPLORE
                </Link>
                <Link href={`/collections/${collection.handle}`} className={styles.allModelsBtn}>
                  VIEW ALL
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
