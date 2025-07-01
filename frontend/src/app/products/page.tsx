'use client';

import { useState } from 'react';
import Image from "next/image";
import { Navigation, Footer, AddToCartButton } from '../../components';
import styles from "./page.module.css";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'fireplaces', name: 'Fireplaces' },
    { id: 'garden', name: 'Garden Features' },
    { id: 'architectural', name: 'Architectural' },
    { id: 'decorative', name: 'Decorative' }
  ];

  const products = [
    {
      id: "1",
      name: "Classic Fireplace Mantel",
      category: "fireplaces",
      price: 2500,
      image: "/images/fireplace-collection.jpg",
      description: "Handcrafted traditional mantel with intricate detailing"
    },
    {
      id: "2",
      name: "Modern Fireplace Surround",
      category: "fireplaces",
      price: 3200,
      image: "/images/fireplace-collection.jpg",
      description: "Contemporary design with clean lines and elegant finish"
    },
    {
      id: "3",
      name: "Garden Fountain",
      category: "garden",
      price: 1800,
      image: "/images/garden-collection.jpg",
      description: "Three-tier fountain perfect for outdoor spaces"
    },
    {
      id: "4",
      name: "Decorative Planters",
      category: "garden",
      price: 450,
      image: "/images/garden-collection.jpg",
      description: "Set of elegant planters for garden landscaping"
    },
    {
      id: "5",
      name: "Classical Columns",
      category: "architectural",
      price: 1200,
      image: "/images/architectural-collection.jpg",
      description: "Corinthian style columns for grand entrances"
    },
    {
      id: "6",
      name: "Decorative Balustrade",
      category: "architectural",
      price: 800,
      image: "/images/architectural-collection.jpg",
      description: "Ornate balustrade for staircases and terraces"
    },
    {
      id: "7",
      name: "Wall Medallions",
      category: "decorative",
      price: 350,
      image: "/images/architectural-collection.jpg",
      description: "Decorative wall medallions for interior accent"
    },
    {
      id: "8",
      name: "Ornamental Corbels",
      category: "decorative",
      price: 280,
      image: "/images/architectural-collection.jpg",
      description: "Supporting brackets with decorative styling"
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className={styles.container}>
      <Navigation />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Products</h1>
          <p className={styles.heroSubtitle}>
            Discover our complete collection of handcrafted cast stone elements, 
            from elegant fireplaces to stunning garden features.
          </p>
        </div>
      </section>

      {/* Product Categories */}
      <section className={styles.productsSection}>
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

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className={styles.productImage}
                />
                <div className={styles.productOverlay}>
                  <button className={styles.viewBtn}>View Details</button>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      category: product.category,
                      description: product.description
                    }}
                    variant="primary"
                    size="medium"
                  />
                </div>
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>${product.price.toLocaleString()}</span>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      category: product.category,
                      description: product.description
                    }}
                    variant="outline"
                    size="small"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Need Custom Design?</h2>
          <p>Our master craftsmen can create bespoke cast stone pieces tailored to your specific requirements.</p>
          <button className={styles.ctaBtn}>Request Custom Quote</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
