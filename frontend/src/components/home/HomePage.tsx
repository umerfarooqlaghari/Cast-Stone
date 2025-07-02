'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Navigation,
  HeroSection,
  CollectionsGrid,
  CatalogSection,
  FeaturedCollections,
  TestimonialsSection,
  Footer
} from '../index';
import { collectionsApi } from '../../services/api';
import styles from './HomePage.module.css';

export default function HomePage() {


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

  return (
    <div className={styles.container}>
      <Navigation />
      <HeroSection />
      <CollectionsGrid />
      <CatalogSection />
      <FeaturedCollections featuredProducts={featuredProducts} />
      <TestimonialsSection testimonials={testimonials} />
      <Footer />
    </div>
  );
}
