'use client';

import { useState, useEffect } from 'react';
import styles from './TestimonialsSection.module.css';

interface Testimonial {
  id: number;
  name: string;
  company: string;
  text: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  className?: string;
}

export default function TestimonialsSection({ testimonials, className }: TestimonialsSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(testimonialInterval);
  }, [testimonials.length]);

  return (
    <section className={`${styles.testimonialsSection} ${className || ''}`}>
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
  );
}
