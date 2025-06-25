'use client';

import { useState } from 'react';
import styles from "./page.module.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({
    company: false,
    products: false,
    discover: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.navigation}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <h1>Cast Stone</h1>
            <span>Interiors & Decorations</span>
          </div>

          {/* Desktop Menu */}
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
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p className={styles.heroSubtitle}>
            Ready to transform your space? Get in touch with our team of experts
            to discuss your cast stone project.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <div className={styles.contactContainer}>
          {/* Contact Form */}
          <div className={styles.formContainer}>
            <h2>Start Your Project</h2>
            <p>Fill out the form below and we'll get back to you within 24 hours.</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={styles.input}
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.input}
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={styles.input}
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="projectType" className={styles.label}>
                    Project Type
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    className={styles.select}
                    value={formData.projectType}
                    onChange={handleChange}
                  >
                    <option value="">Select project type</option>
                    <option value="fireplace">Fireplace</option>
                    <option value="garden">Garden Features</option>
                    <option value="architectural">Architectural Elements</option>
                    <option value="restoration">Restoration</option>
                    <option value="custom">Custom Design</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  Project Details *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className={styles.textarea}
                  placeholder="Tell us about your project, timeline, and any specific requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className={styles.contactInfo}>
            <h2>Get In Touch</h2>
            <p>We're here to help bring your vision to life.</p>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>📍</div>
                <div>
                  <h3 className={styles.infoTitle}>Visit Our Workshop</h3>
                  <p className={styles.infoText}>
                    123 Artisan Way<br />
                    Craftsman City, CC 12345
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>📞</div>
                <div>
                  <h3 className={styles.infoTitle}>Call Us</h3>
                  <p className={styles.infoText}>(555) 123-4567</p>
                  <p className={styles.infoSubtext}>Mon-Fri 8AM-6PM</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>✉️</div>
                <div>
                  <h3 className={styles.infoTitle}>Email Us</h3>
                  <p className={styles.infoText}>info@caststone.com</p>
                  <p className={styles.infoSubtext}>We respond within 24 hours</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>🕒</div>
                <div>
                  <h3 className={styles.infoTitle}>Business Hours</h3>
                  <p className={styles.infoText}>
                    Monday - Friday: 8:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Cast Stone</h3>
            <p>Creating timeless beauty with handcrafted cast stone elements for over 25 years.</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/products">Products</a></li>
              <li><a href="/gallery">Gallery</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
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
    </div>
  );
}
