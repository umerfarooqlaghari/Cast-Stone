'use client';

import Image from "next/image";
import styles from './FeaturedCollections.module.css';

interface FeaturedProduct {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  link: string;
}

interface FeaturedCollectionsProps {
  featuredProducts: FeaturedProduct[];
  className?: string;
}

export default function FeaturedCollections({ featuredProducts, className }: FeaturedCollectionsProps) {
  return (
    <section className={`${styles.featuredCollections} ${className || ''}`}>
      <div className={styles.featuredGrid}>
        {featuredProducts.map((product) => (
          <div key={product.id} className={styles.featuredCard}>
            <div className={styles.featuredImage}>
              <Image
                src={product.image}
                alt={product.title}
                fill
                className={styles.featuredImg}
              />
            </div>
            <div className={styles.featuredContent}>
              <h3 className={styles.featuredTitle}>{product.title}</h3>
              <p className={styles.featuredSubtitle}>{product.subtitle}</p>
              <button className={styles.featuredBtn}>{product.buttonText}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
