'use client';

import { useState } from 'react';
import { Navigation, Footer } from '../../components';
import styles from "./page.module.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: ''
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
      <Navigation />

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
            <p>Fill out the form below and we&apos;ll get back to you within 24 hours.</p>

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
            <p>We&apos;re here to help bring your vision to life.</p>

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

      <Footer />
    </div>
  );
}
