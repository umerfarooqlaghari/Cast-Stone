'use client';

import { useState } from 'react';
import styles from './Navigation.module.css';
import { CartIcon, CartSidebar } from '../index';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({
    company: false,
    products: false,
    discover: false
  });

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
            <li className={styles.dropdown}>
              <a href="#" className={styles.dropdownToggle}>Products</a>
              <ul className={styles.dropdownMenu}>
                <li><a href="/products/architectural">Architectural Products</a></li>
                <li><a href="/products/designer">Designer Products</a></li>
                <li><a href="/products/limited-edition">Limited Edition Designs</a></li>
                <li><a href="/products/sealers">Cast Stone Sealers</a></li>
              </ul>
            </li>
            <li><a href="/collections">Collections</a></li>
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
              <li><a href="/products/architectural" onClick={() => setMobileMenuOpen(false)}>Architectural Products</a></li>
              <li><a href="/products/designer" onClick={() => setMobileMenuOpen(false)}>Designer Products</a></li>
              <li><a href="/products/limited-edition" onClick={() => setMobileMenuOpen(false)}>Limited Edition Designs</a></li>
              <li><a href="/products/sealers" onClick={() => setMobileMenuOpen(false)}>Cast Stone Sealers</a></li>
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
