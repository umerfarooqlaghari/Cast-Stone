'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({
    company: false,
    products: false,
    discover: false
  });

  const categories = [
    {
      id: 1,
      title: "911",
      subtitle: "Architectural",
      description: "The iconic, rear-engine sports car with exceptional performance.",
      image: "/images/architectural-collection.jpg",
      price: "From $1,200",
      link: "/products/architectural"
    },
    {
      id: 2,
      title: "718",
      subtitle: "Designer",
      description: "The mid-engine sports car for two made for pure driving pleasure.",
      image: "/images/fireplace-collection.jpg",
      price: "From $2,500",
      link: "/products/designer"
    },
    {
      id: 3,
      title: "Taycan",
      subtitle: "Limited Edition",
      description: "The soul, electrified. Pure Porsche performance with zero emissions.",
      image: "/images/garden-collection.jpg",
      price: "From $3,800",
      link: "/products/limited-edition"
    },
    {
      id: 4,
      title: "Panamera",
      subtitle: "Sealer Program",
      description: "The luxury sports sedan that combines comfort with performance.",
      image: "/images/hero-cast-stone.jpg",
      price: "From $150",
      link: "/products/sealers"
    }
  ];

  const featuredProducts = [
    {
      id: 1,
      title: "DESIGNER'S PICKS",
      subtitle: "A peek inside our designer's shopping cart.",
      image: "/images/fireplace-collection.jpg",
      buttonText: "SHOP NOW",
      link: "/collections/designer-picks"
    },
    {
      id: 2,
      title: "THE CAST STONE SHOP",
      subtitle: "The best of the best, from fireplaces and fountains to architectural elements.",
      image: "/images/garden-collection.jpg",
      buttonText: "SHOP NOW",
      link: "/collections/cast-stone"
    },
    {
      id: 3,
      title: "ARCHITECTURAL ELEMENTS",
      subtitle: "Clean, luxurious, results-driven architectural cast stone pieces.",
      image: "/images/architectural-collection.jpg",
      buttonText: "SHOP NOW",
      link: "/collections/architectural"
    },
    {
      id: 4,
      title: "PREMIUM COLLECTION",
      subtitle: "Classics, reimagined for the modern home.",
      image: "/images/hero-cast-stone.jpg",
      buttonText: "SHOP NOW",
      link: "/collections/premium"
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

      {/* Collections Grid */}
      <section className={styles.collectionsSection}>
        <div className={styles.collectionsGrid}>
          {categories.map((category) => (
            <div key={category.id} className={styles.collectionCard}>
              <div className={styles.collectionImage}>
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className={styles.collectionImg}
                />
              </div>
              <div className={styles.collectionOverlay}>
                <div className={styles.collectionBrand}>{category.title}</div>
                <div className={styles.collectionSubtitle}>{category.subtitle}</div>
                <div className={styles.collectionDescription}>
                  {category.description}
                </div>
                <div className={styles.collectionPrice}>{category.price}</div>
                <div className={styles.collectionButtons}>
                  <button className={styles.buildBtn}>BUILD YOURS</button>
                  <button className={styles.allModelsBtn}>ALL MODELS</button>
                </div>
              </div>
            </div>
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

      {/* Featured Collections */}
      <section className={styles.featuredCollections}>
        <div className={styles.featuredGrid}>
          {featuredProducts.map((product) => (
            <div key={product.id} className={styles.featuredCard}>
              <div className={styles.featuredImage}>
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className={styles.featuredImg}
                />
              </div>
              <div className={styles.featuredContent}>
                <h3 className={styles.featuredTitle}>{product.title}</h3>
                <p className={styles.featuredSubtitle}>{product.subtitle}</p>
                <button className={styles.featuredBtn}>{product.buttonText}</button>
              </div>
            </div>
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
