'use client';

import Image from "next/image";
import styles from './CollectionsGrid.module.css';

interface Category {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  price: string;
  link: string;
}

interface CollectionsGridProps {
  categories: Category[];
  className?: string;
}

export default function CollectionsGrid({ categories, className }: CollectionsGridProps) {
  return (
    <section className={`${styles.collectionsSection} ${className || ''}`}>
      <div className={styles.collectionsGrid}>
        {categories.map((category) => (
          <div key={category.id} className={styles.collectionCard}>
            <div className={styles.collectionImage}>
              <Image
                src={category.image}
                alt={category.title}
                fill
                className={styles.collectionImg}
              />
            </div>
            <div className={styles.collectionOverlay}>
              <div className={styles.collectionBrand}>{category.title}</div>
              <div className={styles.collectionSubtitle}>{category.subtitle}</div>
              <div className={styles.collectionDescription}>
                {category.description}
              </div>
              <div className={styles.collectionPrice}>{category.price}</div>
              <div className={styles.collectionButtons}>
                <button className={styles.buildBtn}>BUILD YOURS</button>
                <button className={styles.allModelsBtn}>ALL MODELS</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
