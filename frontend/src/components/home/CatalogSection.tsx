'use client';

import Image from "next/image";
import styles from './CatalogSection.module.css';

interface CatalogSectionProps {
  className?: string;
}

export default function CatalogSection({ className }: CatalogSectionProps) {
  return (
    <section className={`${styles.catalogSection} ${className || ''}`}>
      <div className={styles.catalogContainer}>
        <div className={styles.catalogContent}>
          <div className={styles.catalogText}>
            <h2>Explore Our Complete Catalog</h2>
            <p>
              Browse through our comprehensive collection of cast stone products.
              From architectural elements to decorative pieces, find everything you need
              to transform your space with timeless elegance.
            </p>
            <button className={styles.catalogBtn}>View Catalog</button>
          </div>
        </div>
        <div className={styles.catalogImage}>
          <Image
            src="/images/catalog-preview.jpg"
            alt="Cast Stone Catalog"
            width={600}
            height={400}
            className={styles.catalogImg}
          />
        </div>
      </div>
    </section>
  );
}
