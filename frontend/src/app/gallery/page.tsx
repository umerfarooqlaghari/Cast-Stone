'use client';

import { useState } from 'react';
import Image from "next/image";
import { Navigation, Footer } from '../../components';
import styles from "./page.module.css";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
}

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'residential', name: 'Residential' },
    { id: 'commercial', name: 'Commercial' },
    { id: 'garden', name: 'Garden & Outdoor' },
    { id: 'restoration', name: 'Restoration' }
  ];

  const galleryItems = [
    {
      id: 1,
      title: "Luxury Living Room Fireplace",
      category: "residential",
      image: "/images/fireplace-collection.jpg",
      description: "Custom cast stone fireplace with intricate carved details"
    },
    {
      id: 2,
      title: "Grand Hotel Entrance",
      category: "commercial",
      image: "/images/architectural-collection.jpg",
      description: "Majestic columns and architectural elements for hotel lobby"
    },
    {
      id: 3,
      title: "Private Garden Fountain",
      category: "garden",
      image: "/images/garden-collection.jpg",
      description: "Three-tier fountain centerpiece for estate garden"
    },
    {
      id: 4,
      title: "Historic Building Restoration",
      category: "restoration",
      image: "/images/architectural-collection.jpg",
      description: "Faithful reproduction of original cast stone elements"
    },
    {
      id: 5,
      title: "Modern Fireplace Design",
      category: "residential",
      image: "/images/fireplace-collection.jpg",
      description: "Contemporary cast stone fireplace with clean lines"
    },
    {
      id: 6,
      title: "Corporate Headquarters",
      category: "commercial",
      image: "/images/architectural-collection.jpg",
      description: "Impressive facade elements for corporate building"
    },
    {
      id: 7,
      title: "Estate Garden Features",
      category: "garden",
      image: "/images/garden-collection.jpg",
      description: "Complete garden transformation with cast stone elements"
    },
    {
      id: 8,
      title: "Victorian Home Restoration",
      category: "restoration",
      image: "/images/architectural-collection.jpg",
      description: "Period-accurate cast stone details for historic home"
    },
    {
      id: 9,
      title: "Luxury Master Suite",
      category: "residential",
      image: "/images/fireplace-collection.jpg",
      description: "Elegant bedroom fireplace with custom surround"
    }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div className={styles.container}>
      <Navigation />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Project Gallery</h1>
          <p className={styles.heroSubtitle}>
            Explore our portfolio of stunning cast stone installations, 
            from intimate residential fireplaces to grand commercial projects.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className={styles.gallerySection}>
        <div className={styles.categoryFilter}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryBtn} ${
                selectedCategory === category.id ? styles.active : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className={styles.galleryGrid}>
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className={styles.galleryItem}
              onClick={() => setSelectedImage(item)}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={300}
                  className={styles.galleryImage}
                />
                <div className={styles.imageOverlay}>
                  <h3 className={styles.imageTitle}>{item.title}</h3>
                  <p className={styles.imageDescription}>{item.description}</p>
                  <button className={styles.viewBtn}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal for enlarged image */}
      {selectedImage && (
        <div className={styles.modal} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeBtn}
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <Image
              src={selectedImage.image}
              alt={selectedImage.title}
              width={800}
              height={600}
              className={styles.modalImage}
            />
            <div className={styles.modalInfo}>
              <h2>{selectedImage.title}</h2>
              <p>{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Start Your Project?</h2>
          <p>Let our master craftsmen bring your vision to life with custom cast stone creations.</p>
          <button className={styles.ctaBtn}>Get Started Today</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
