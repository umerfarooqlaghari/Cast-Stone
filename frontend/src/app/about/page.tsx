import Image from "next/image";
import { Navigation, Footer } from '../../components';
import styles from "./page.module.css";

export default function About() {
  return (
    <div className={styles.container}>
      <Navigation />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>About Cast Stone</h1>
          <p className={styles.heroSubtitle}>
            For over 25 years, we have been crafting exceptional cast stone elements
            that transform ordinary spaces into extraordinary works of art.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.storySection}>
        <div className={styles.storyContainer}>
          <div className={styles.storyContent}>
            <h2>Our Story</h2>
            <p>
              Founded in 1999 by master craftsman Robert Stone, Cast Stone Interiors
              began as a small workshop dedicated to preserving the ancient art of
              cast stone craftsmanship. What started as a passion project has grown
              into one of the most respected names in architectural cast stone.
            </p>
            <p>
              Our commitment to excellence and attention to detail has earned us the
              trust of architects, designers, and homeowners who demand nothing but
              the finest quality for their projects.
            </p>
          </div>
          <div className={styles.storyImage}>
            <Image
              src="/images/hero-cast-stone.jpg"
              alt="Cast Stone Workshop"
              width={600}
              height={400}
              className={styles.storyImg}
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.sectionHeader}>
          <h2>Our Values</h2>
          <p>The principles that guide everything we do</p>
        </div>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>🎨</div>
            <h3>Craftsmanship</h3>
            <p>Every piece is meticulously handcrafted by skilled artisans who take pride in their work.</p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>⚡</div>
            <h3>Quality</h3>
            <p>We use only the finest materials and time-tested techniques to ensure lasting beauty.</p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>🤝</div>
            <h3>Service</h3>
            <p>From design consultation to installation, we provide exceptional service every step of the way.</p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>🌟</div>
            <h3>Innovation</h3>
            <p>While honoring traditional methods, we embrace new technologies to enhance our craft.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.sectionHeader}>
          <h2>Meet Our Team</h2>
          <p>The master craftsmen behind every creation</p>
        </div>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <Image
              src="/images/placeholder-video.jpg"
              alt="Robert Stone"
              width={300}
              height={300}
              className={styles.teamPhoto}
            />
            <h3>Robert Stone</h3>
            <p className={styles.teamRole}>Founder & Master Craftsman</p>
            <p>With over 30 years of experience, Robert leads our team with unmatched expertise in traditional cast stone techniques.</p>
          </div>
          <div className={styles.teamMember}>
            <Image
              src="/images/placeholder-video.jpg"
              alt="Maria Rodriguez"
              width={300}
              height={300}
              className={styles.teamPhoto}
            />
            <h3>Maria Rodriguez</h3>
            <p className={styles.teamRole}>Design Director</p>
            <p>Maria brings artistic vision and modern design sensibilities to every project, ensuring perfect harmony between form and function.</p>
          </div>
          <div className={styles.teamMember}>
            <Image
              src="/images/placeholder-video.jpg"
              alt="James Mitchell"
              width={300}
              height={300}
              className={styles.teamPhoto}
            />
            <h3>James Mitchell</h3>
            <p className={styles.teamRole}>Production Manager</p>
            <p>James oversees our workshop operations, ensuring every piece meets our exacting standards for quality and craftsmanship.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Create Something Beautiful?</h2>
          <p>Let us help you transform your space with our handcrafted cast stone elements.</p>
          <button className={styles.ctaBtn}>Start Your Project</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
