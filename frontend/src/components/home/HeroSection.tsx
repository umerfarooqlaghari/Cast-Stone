'use client';

import styles from './HeroSection.module.css';

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={`${styles.hero} ${className || ''}`}>
      <div className={styles.videoBackground}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.heroVideo}
        >
          <source src="/herosection.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className={styles.videoOverlay}></div>
      </div>

      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          <span className={styles.highlight}>Timeless Elegance in Cast Stone</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Discover our exquisite collection of handcrafted cast stone interiors,
          fireplaces, and decorative elements that transform spaces into works of art.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.primaryBtn}>Explore Collection</button>
          <button className={styles.secondaryBtn}>Watch Our Story</button>
        </div>
      </div>
    </section>
  );
}
