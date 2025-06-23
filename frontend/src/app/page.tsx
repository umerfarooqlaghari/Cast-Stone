'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(0);

  const videos = [
    {
      id: 1,
      title: "Luxury Cast Stone Fireplaces",
      description: "Transform your living space with our handcrafted cast stone fireplaces",
      videoUrl: "/videos/fireplace-demo.mp4", // Placeholder
      thumbnail: "/images/fireplace-thumb.jpg"
    },
    {
      id: 2,
      title: "Elegant Garden Features",
      description: "Create stunning outdoor spaces with our cast stone garden elements",
      videoUrl: "/videos/garden-demo.mp4", // Placeholder
      thumbnail: "/images/garden-thumb.jpg"
    },
    {
      id: 3,
      title: "Architectural Details",
      description: "Add sophistication with our custom cast stone architectural elements",
      videoUrl: "/videos/architecture-demo.mp4", // Placeholder
      thumbnail: "/images/architecture-thumb.jpg"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [videos.length]);

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.navigation}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <h1>Cast Stone</h1>
            <span>Interiors & Decorations</span>
          </div>
          <ul className={styles.navMenu}>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Timeless Elegance in
            <span className={styles.highlight}> Cast Stone</span>
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
        <div className={styles.heroImage}>
          <Image
            src="/images/hero-cast-stone.jpg"
            alt="Luxury Cast Stone Interior"
            width={800}
            height={600}
            priority
            className={styles.heroImg}
          />
        </div>
      </section>

      {/* Dynamic Video Carousel */}
      <section className={styles.videoSection}>
        <div className={styles.sectionHeader}>
          <h2>Experience Our Craftsmanship</h2>
          <p>Watch how we transform spaces with our premium cast stone creations</p>
        </div>

        <div className={styles.videoCarousel}>
          {videos.map((video, index) => (
            <div
              key={video.id}
              className={`${styles.videoSlide} ${
                index === currentVideo ? styles.active : ''
              } ${
                index % 2 === 0 ? styles.slideFromLeft : styles.slideFromRight
              }`}
            >
              <div className={styles.videoContainer}>
                <div className={styles.videoPlaceholder}>
                  <div className={styles.playButton}>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.9)" />
                      <polygon points="24,18 24,42 42,30" fill="#333" />
                    </svg>
                  </div>
                  <Image
                    src={video.thumbnail || "/images/placeholder-video.jpg"}
                    alt={video.title}
                    width={600}
                    height={400}
                    className={styles.videoThumbnail}
                  />
                </div>
                <div className={styles.videoInfo}>
                  <h3>{video.title}</h3>
                  <p>{video.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.videoControls}>
          {videos.map((_, index) => (
            <button
              key={index}
              className={`${styles.videoDot} ${
                index === currentVideo ? styles.activeDot : ''
              }`}
              onClick={() => setCurrentVideo(index)}
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featuredProducts}>
        <div className={styles.sectionHeader}>
          <h2>Featured Collections</h2>
          <p>Discover our most popular cast stone pieces</p>
        </div>

        <div className={styles.productGrid}>
          <div className={styles.productCard}>
            <Image
              src="/images/fireplace-collection.jpg"
              alt="Fireplace Collection"
              width={400}
              height={300}
              className={styles.productImage}
            />
            <div className={styles.productInfo}>
              <h3>Fireplace Collection</h3>
              <p>Handcrafted mantels and surrounds</p>
              <span className={styles.productPrice}>From $2,500</span>
            </div>
          </div>

          <div className={styles.productCard}>
            <Image
              src="/images/garden-collection.jpg"
              alt="Garden Collection"
              width={400}
              height={300}
              className={styles.productImage}
            />
            <div className={styles.productInfo}>
              <h3>Garden Features</h3>
              <p>Fountains, planters, and sculptures</p>
              <span className={styles.productPrice}>From $800</span>
            </div>
          </div>

          <div className={styles.productCard}>
            <Image
              src="/images/architectural-collection.jpg"
              alt="Architectural Collection"
              width={400}
              height={300}
              className={styles.productImage}
            />
            <div className={styles.productInfo}>
              <h3>Architectural Elements</h3>
              <p>Columns, balustrades, and moldings</p>
              <span className={styles.productPrice}>From $1,200</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h2>Stay Inspired</h2>
          <p>Get the latest design trends and exclusive offers delivered to your inbox</p>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email address"
              className={styles.emailInput}
            />
            <button className={styles.subscribeBtn}>Subscribe</button>
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
