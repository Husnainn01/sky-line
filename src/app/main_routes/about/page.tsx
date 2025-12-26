'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function AboutPage() {

  const stats = [
    { number: '15+', label: 'Years Experience' },
    { number: '1000+', label: 'Cars Exported' },
    { number: '50+', label: 'Countries Served' },
    { number: '98%', label: 'Client Satisfaction' },
  ];

  const foundingStory = {
    title: 'Our Founding Story',
    content: [
      'Sky Line TRD was founded in 2008 by Takeshi Yamamoto, a passionate car enthusiast with a vision to bring authentic Japanese vehicles to enthusiasts around the world.',
      'What began as a small operation in Tokyo with just three employees has grown into one of Japan\'s most trusted vehicle export businesses, serving customers in over 50 countries.',
      'Our founder\'s commitment to quality, transparency, and customer satisfaction remains at the heart of everything we do today.',
    ],
    image: '/images/logo/footer.png',
  };

  const coreValues = [
    {
      icon: '🌟',
      title: 'Quality Assurance',
      text: 'Since our founding, every vehicle undergoes rigorous inspection to ensure the highest quality standards.',
    },
    {
      icon: '🤝',
      title: 'Customer Trust',
      text: 'Our 15-year history is built on transparency, integrity, and exceptional service.',
    },
    {
      icon: '🌏',
      title: 'Global Perspective',
      text: 'From our humble beginnings to today, we\'ve maintained our mission of connecting enthusiasts worldwide with authentic Japanese vehicles.',
    },
  ];

  const timeline = [
    {
      year: '2008',
      title: 'Company Founded',
      text: 'Sky Line TRD was established in Tokyo, Japan by Takeshi Yamamoto with a small team of three employees and a handful of trusted suppliers.',
    },
    {
      year: '2010',
      title: 'First Milestone',
      text: 'Reached our first 100 vehicles exported and expanded our network to include premium dealerships across Japan.',
    },
    {
      year: '2012',
      title: 'International Expansion',
      text: 'Opened our first international office in Singapore to better serve customers in Southeast Asia and Oceania.',
    },
    {
      year: '2014',
      title: 'Quality Certification',
      text: 'Implemented our comprehensive 100-point inspection process and received ISO 9001 certification for quality management.',
    },
    {
      year: '2015',
      title: 'Digital Transformation',
      text: 'Launched our online platform for global vehicle sourcing, making it easier for customers worldwide to find their dream cars.',
    },
    {
      year: '2017',
      title: 'Logistics Network',
      text: 'Established partnerships with premier shipping companies to ensure safe and timely delivery to all continents.',
    },
    {
      year: '2018',
      title: 'Market Leadership',
      text: 'Became one of Japan\'s leading vehicle exporters with over 500 cars exported annually.',
    },
    {
      year: '2020',
      title: 'Pandemic Resilience',
      text: 'Successfully navigated global supply chain challenges while maintaining our commitment to customer satisfaction.',
    },
    {
      year: '2022',
      title: 'Sustainability Initiative',
      text: 'Launched our eco-friendly shipping program and carbon offset initiative for environmentally conscious customers.',
    },
    {
      year: '2023',
      title: 'Innovation & Growth',
      text: 'Introduced new technologies including our virtual inspection service and expanded our global presence with representatives in 15 countries.',
    },
    {
      year: '2024',
      title: 'Looking Forward',
      text: 'Continuing our tradition of excellence while embracing new opportunities in the evolving automotive market.',
    },
  ];
  
  const milestones = [
    { year: '2008', achievement: 'Founded in Tokyo' },
    { year: '2010', achievement: '100th vehicle exported' },
    { year: '2015', achievement: 'Online platform launch' },
    { year: '2018', achievement: '500+ annual exports' },
    { year: '2023', achievement: 'Global presence in 15 countries' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Image
          src="/images/hero-car.jpg"
          alt="Sky Line TRD Showroom"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our History</h1>
          <p className={styles.heroSubtitle}>
            The story of Sky Line TRD - delivering premium Japanese vehicles worldwide since 2008
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Company Overview */}
        <section className={styles.section}>
          <div className={styles.foundingStory}>
            <div className={styles.foundingContent}>
              <h2 className={styles.sectionTitle}>{foundingStory.title}</h2>
              {foundingStory.content.map((paragraph, index) => (
                <p key={index} className={styles.foundingText}>{paragraph}</p>
              ))}
            </div>
            <div className={styles.foundingImage}>
              <Image 
                src="/images/logo/footer.png" 
                alt="Sky Line TRD Founder" 
                width={400} 
                height={300} 
                style={{ objectFit: 'cover', borderRadius: '8px' }} 
              />
            </div>
          </div>
        </section>

        {/* Key Milestones */}
        <section className={styles.milestoneSection}>
          <h2 className={styles.sectionTitle}>Key Milestones</h2>
          <div className={styles.milestoneGrid}>
            {milestones.map((milestone) => (
              <div key={milestone.year} className={styles.milestoneCard}>
                <div className={styles.milestoneYear}>{milestone.year}</div>
                <div className={styles.milestoneText}>{milestone.achievement}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Values */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Core Values Through History</h2>
          <div className={styles.missionGrid}>
            {coreValues.map((value) => (
              <div key={value.title} className={styles.missionCard}>
                <div className={styles.missionIcon}>{value.icon}</div>
                <h3 className={styles.missionTitle}>{value.title}</h3>
                <p className={styles.missionText}>{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Timeline */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Journey Through The Years</h2>
          <div className={styles.timeline}>
            {timeline.map((item) => (
              <div key={item.year} className={styles.timelineItem}>
                <div className={styles.timelineContent}>
                  <span className={styles.timelineYear}>{item.year}</span>
                  <h3 className={styles.timelineTitle}>{item.title}</h3>
                  <p className={styles.timelineText}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <h2>Experience Our Legacy of Excellence</h2>
          <p>Join thousands of satisfied customers who have trusted Sky Line TRD for their Japanese vehicle imports.</p>
          <div className={styles.ctaButtons}>
            <Link href="/inventory" className={styles.primaryButton}>
              Browse Our Inventory
            </Link>
            <Link href="/contact" className={styles.secondaryButton}>
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
