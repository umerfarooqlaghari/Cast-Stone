'use client';

import styles from './Footer.module.css';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={`${styles.footer} ${className || ''}`}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>Cast Stone</h3>
          <p>Creating timeless beauty with handcrafted cast stone elements for over 25 years.</p>
        </div>
        <div className={styles.footerSection}>
          <h4>Company</h4>
          <ul>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/about">Our Story</a></li>
            <li><a href="/retail-locator">Retail Locator</a></li>
            <li><a href="/wholesale-signup">Wholesale Sign-up</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4>Products</h4>
          <ul>
            <li><a href="/products/architectural">Architectural Products</a></li>
            <li><a href="/products/designer">Designer Products</a></li>
            <li><a href="/products/limited-edition">Limited Edition</a></li>
            <li><a href="/products/sealers">Cast Stone Sealers</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4>Discover</h4>
          <ul>
            <li><a href="/catalog">Catalog</a></li>
            <li><a href="/collections">Collections</a></li>
            <li><a href="/projects">Completed Projects</a></li>
            <li><a href="/videos">Videos</a></li>
            <li><a href="/faqs">FAQs</a></li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4>Contact Info</h4>
          <p>123 Artisan Way<br />Craftsman City, CC 12345</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: info@caststone.com</p>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; 2024 Cast Stone Interiors. All rights reserved.</p>
      </div>
    </footer>
  );
}
