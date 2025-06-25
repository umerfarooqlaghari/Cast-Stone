'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const categories = [
    {
      id: 1,
      title: "Architectural Designs",
      description: "Professional architectural cast stone elements",
      image: "/images/architectural-collection.jpg"
    },
    {
      id: 2,
      title: "Designer Products",
      description: "Luxury designer cast stone pieces",
      image: "/images/fireplace-collection.jpg"
    },
    {
      id: 3,
      title: "Limited Edition Products",
      description: "Exclusive limited edition collections",
      image: "/images/garden-collection.jpg"
    },
    {
      id: 4,
      title: "Sealer Maintenance Program",
      description: "Professional maintenance and sealing services",
      image: "/images/hero-cast-stone.jpg "
    }
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Classic Fireplace Mantel",
      price: "$2,500",
      image: "/images/fireplace-collection.jpg",
      description: "Handcrafted traditional mantel"
    },
    {
      id: 2,
      name: "Garden Fountain",
      price: "$1,800",
      image: "/images/garden-collection.jpg",
      description: "Three-tier fountain"
    },
    {
      id: 3,
      name: "Classical Columns",
      price: "$1,200",
      image: "/images/architectural-collection.jpg",
      description: "Corinthian style columns"
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      company: "Johnson Architecture",
      text: "Cast Stone's architectural elements transformed our project. The quality and craftsmanship are unmatched.",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      company: "Elite Homes",
      text: "We've been using Cast Stone products for over 10 years. Their consistency and beauty never disappoint.",
      rating: 5
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      company: "Rodriguez Design Studio",
      text: "The limited edition pieces add such elegance to our high-end residential projects.",
      rating: 5
    }
  ];

  useEffect(() => {
    const categoryInterval = setInterval(() => {
      setCurrentCategory((prev) => (prev + 1) % categories.length);
    }, 4000);
    return () => clearInterval(categoryInterval);
  }, [categories.length]);

  useEffect(() => {
    const productInterval = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);
    return () => clearInterval(productInterval);
  }, [featuredProducts.length]);

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(testimonialInterval);
  }, [testimonials.length]);

  return (
    <div className={styles.container}>
      {/* Top Navigation Bar */}
      <nav className={styles.navigation}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <h1>Cast Stone</h1>
            <span>Interiors & Decorations</span>
          </div>
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
      </nav>

      {/* Hero Section with Moving Video Background */}
      <section className={styles.hero}>
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
            
            <span className={styles.highlight}> Timeless Elegance in Cast Stone</span>
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

      {/* Categories Carousel */}
      <section className={styles.categoriesSection}>
        <div className={styles.sectionHeader}>
          <h2>Our Collections</h2>
          <p>Explore our diverse range of cast stone products</p>
        </div>

        <div className={styles.categoriesCarousel}>
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`${styles.categorySlide} ${
                index === currentCategory ? styles.active : ''
              }`}
            >
              <div className={styles.categoryCard}>
                <div className={styles.categoryImage}>
                  <Image
                    src={category.image.trim()}
                    alt={category.title}
                    width={400}
                    height={300}
                    className={styles.categoryImg}
                  />
                </div>
                <div className={styles.categoryInfo}>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <button className={styles.categoryBtn}>Explore</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.categoryControls}>
          {categories.map((_, index) => (
            <button
              key={index}
              className={`${styles.categoryDot} ${
                index === currentCategory ? styles.activeDot : ''
              }`}
              onClick={() => setCurrentCategory(index)}
            />
          ))}
        </div>
      </section>

      {/* Online Catalog Section */}
      <section className={styles.catalogSection}>
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

      {/* Weekly Featured Products */}
      <section className={styles.featuredProducts}>
        <div className={styles.sectionHeader}>
          <h2>This Week's Featured Products</h2>
          <p>Handpicked selections showcasing our finest craftsmanship</p>
        </div>

        <div className={styles.productCarousel}>
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`${styles.productSlide} ${
                index === currentProduct ? styles.active : ''
              }`}
            >
              <div className={styles.productCard}>
                <div className={styles.productImageContainer}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={300}
                    className={styles.productImage}
                  />
                  <div className={styles.productOverlay}>
                    <button className={styles.quickViewBtn}>Quick View</button>
                  </div>
                </div>
                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className={styles.productFooter}>
                    <span className={styles.productPrice}>{product.price}</span>
                    <button className={styles.inquireBtn}>Inquire</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.productControls}>
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              className={`${styles.productDot} ${
                index === currentProduct ? styles.activeDot : ''
              }`}
              onClick={() => setCurrentProduct(index)}
            />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <h2>What Our Clients Say</h2>
          <p>Hear from professionals who trust Cast Stone for their projects</p>
        </div>

        <div className={styles.testimonialsCarousel}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`${styles.testimonialSlide} ${
                index === currentTestimonial ? styles.active : ''
              }`}
            >
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <div className={styles.stars}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className={styles.star}>★</span>
                    ))}
                  </div>
                  <p className={styles.testimonialText}>"{testimonial.text}"</p>
                  <div className={styles.testimonialAuthor}>
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.company}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.testimonialControls}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.testimonialDot} ${
                index === currentTestimonial ? styles.activeDot : ''
              }`}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
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
    </div>
  );
}
