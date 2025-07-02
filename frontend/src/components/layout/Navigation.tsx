'use client';

import { useState, useEffect } from 'react';
import styles from './Navigation.module.css';
import { CartIcon, CartSidebar } from '../index';

interface NavigationProps {
  className?: string;
}

interface Collection {
  _id: string;
  title: string;
  handle: string;
  level: number;
  children: Collection[];
}

export default function Navigation({ className }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({
    company: false,
    products: false,
    discover: false
  });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  // Fetch collections for mega menu
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/collections?hierarchy=true');
        if (response.ok) {
          const data = await response.json();
          setCollections(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };

    fetchCollections();
  }, []);

  return (
    <nav className={`${styles.navigation} ${className || ''}`}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <h1>Cast Stone</h1>
          <span>Interiors & Decorations</span>
        </div>

        {/* Desktop Menu */}
        <div className={styles.navMenuWrapper}>
          <ul className={styles.navMenu}>
            <li className={styles.dropdown}>
              <a href="#" className={styles.dropdownToggle}>Company</a>
              <ul className={styles.dropdownMenu}>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/about">Our Story</a></li>
                <li><a href="/retail-locator">Retail Locator</a></li>
                <li><a href="/wholesale-signup">Wholesale Sign-up</a></li>
              </ul>
            </li>
            <li
              className={`${styles.dropdown} ${styles.megaDropdown}`}
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
            >
              <a href="#" className={styles.dropdownToggle}>Products</a>
              {showMegaMenu && (
                <div className={styles.megaMenu}>
                  <div className={styles.megaMenuContent}>
                    <div className={styles.megaMenuSection}>
                      <h3>Main Collections</h3>
                      <div className={styles.collectionsGrid}>
                        {collections.filter(c => c.level === 0).map((collection) => (
                          <div key={collection._id} className={styles.collectionGroup}>
                            <a
                              href={`/collections/${collection.handle}`}
                              className={styles.collectionTitle}
                            >
                              {collection.title}
                            </a>
                            {collection.children && collection.children.length > 0 && (
                              <ul className={styles.subCollectionsList}>
                                {collection.children.map((subCollection) => (
                                  <li key={subCollection._id}>
                                    <a href={`/collections/${subCollection.handle}`}>
                                      {subCollection.title}
                                    </a>
                                    {subCollection.children && subCollection.children.length > 0 && (
                                      <ul className={styles.subSubCollectionsList}>
                                        {subCollection.children.map((subSubCollection) => (
                                          <li key={subSubCollection._id}>
                                            <a href={`/collections/${subSubCollection.handle}`}>
                                              {subSubCollection.title}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={styles.megaMenuSection}>
                      <h3>Quick Links</h3>
                      <ul className={styles.quickLinks}>
                        <li><a href="/products">All Products</a></li>
                        <li><a href="/collections">Browse Collections</a></li>
                        <li><a href="/catalog">Product Catalog</a></li>
                        <li><a href="/finishes">Available Finishes</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>
            <li><a href="/projects">Completed Projects</a></li>
            <li className={styles.dropdown}>
              <a href="#" className={styles.dropdownToggle}>Discover</a>
              <ul className={styles.dropdownMenu}>
                <li><a href="/catalog">Catalog</a></li>
                <li><a href="/finishes">Finishes</a></li>
                <li><a href="/videos">Videos</a></li>
                <li><a href="/technical">Technical Info</a></li>
                <li><a href="/faqs">FAQs</a></li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Cart Icon */}
        <div className={styles.cartWrapper}>
          <CartIcon />
        </div>

        {/* Mobile Menu Toggle */}
        <div
          className={`${styles.mobileMenuToggle} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className={styles.hamburgerLine}></div>
          <div className={styles.hamburgerLine}></div>
          <div className={styles.hamburgerLine}></div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.active : ''}`}>
        <div className={styles.mobileMenuLogo}>
          <h1>Cast Stone</h1>
          <span>Interiors & Decorations</span>
        </div>
        <ul className={styles.mobileNavMenu}>
          <li>
            <div
              className={`${styles.mobileDropdownToggle} ${mobileDropdowns.company ? styles.active : ''}`}
              onClick={() => setMobileDropdowns(prev => ({...prev, company: !prev.company}))}
            >
              <span>Company</span>
            </div>
            <ul className={`${styles.mobileDropdownMenu} ${mobileDropdowns.company ? styles.active : ''}`}>
              <li><a href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</a></li>
              <li><a href="/about" onClick={() => setMobileMenuOpen(false)}>Our Story</a></li>
              <li><a href="/retail-locator" onClick={() => setMobileMenuOpen(false)}>Retail Locator</a></li>
              <li><a href="/wholesale-signup" onClick={() => setMobileMenuOpen(false)}>Wholesale Sign-up</a></li>
            </ul>
          </li>
          <li>
            <div
              className={`${styles.mobileDropdownToggle} ${mobileDropdowns.products ? styles.active : ''}`}
              onClick={() => setMobileDropdowns(prev => ({...prev, products: !prev.products}))}
            >
              <span>Products</span>
            </div>
            <ul className={`${styles.mobileDropdownMenu} ${mobileDropdowns.products ? styles.active : ''}`}>
              <li><a href="/collections/architectural" onClick={() => setMobileMenuOpen(false)}>Architectural</a></li>
              <li><a href="/collections/designer" onClick={() => setMobileMenuOpen(false)}>Designer</a></li>
              <li><a href="/collections/limited-edition" onClick={() => setMobileMenuOpen(false)}>Limited Edition</a></li>
              <li><a href="/collections/cast-stone-sealers" onClick={() => setMobileMenuOpen(false)}>Cast Stone Sealers</a></li>
              <li><a href="/products" onClick={() => setMobileMenuOpen(false)}>All Products</a></li>
            </ul>
          </li>
          <li>
            <a href="/collections" onClick={() => setMobileMenuOpen(false)}>Collections</a>
          </li>
          <li>
            <a href="/projects" onClick={() => setMobileMenuOpen(false)}>Completed Projects</a>
          </li>
          <li>
            <div
              className={`${styles.mobileDropdownToggle} ${mobileDropdowns.discover ? styles.active : ''}`}
              onClick={() => setMobileDropdowns(prev => ({...prev, discover: !prev.discover}))}
            >
              <span>Discover</span>
            </div>
            <ul className={`${styles.mobileDropdownMenu} ${mobileDropdowns.discover ? styles.active : ''}`}>
              <li><a href="/catalog" onClick={() => setMobileMenuOpen(false)}>Catalog</a></li>
              <li><a href="/finishes" onClick={() => setMobileMenuOpen(false)}>Finishes</a></li>
              <li><a href="/videos" onClick={() => setMobileMenuOpen(false)}>Videos</a></li>
              <li><a href="/technical" onClick={() => setMobileMenuOpen(false)}>Technical Info</a></li>
              <li><a href="/faqs" onClick={() => setMobileMenuOpen(false)}>FAQs</a></li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />
    </nav>
  );
}
