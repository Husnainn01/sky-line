'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function AboutPage() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const scrollingRef = useRef(false);

  useEffect(() => {
    const sections = [
      'hero',
      'mission',
      'stats',
      'journey',
      'team'
    ];

    sectionsRef.current = sections.map(id => document.getElementById(id));

    const handleScroll = () => {
      if (!scrollingRef.current) {
        const currentScrollPos = window.scrollY;
        const windowHeight = window.innerHeight;
        
        sectionsRef.current.forEach((section, index) => {
          if (section) {
            const sectionTop = section.offsetTop;
            if (currentScrollPos >= sectionTop - windowHeight / 2) {
              setActiveSection(index);
            }
          }
        });
      }
    };

    const scrollToNextSection = () => {
      if (activeSection < sectionsRef.current.length - 1) {
        scrollingRef.current = true;
        const nextSection = sectionsRef.current[activeSection + 1];
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
          setActiveSection((prev: number) => prev + 1);
          setTimeout(() => {
            scrollingRef.current = false;
          }, 1000);
        }
      }
    };

    const timer = setInterval(scrollToNextSection, 5000);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeSection]);

  const stats = [
    { number: '15+', label: 'Years Experience' },
    { number: '1000+', label: 'Cars Exported' },
    { number: '50+', label: 'Countries Served' },
    { number: '98%', label: 'Client Satisfaction' },
  ];

  const missionPoints = [
    {
      icon: '🌟',
      title: 'Quality Assurance',
      text: 'Every vehicle undergoes rigorous inspection to ensure the highest quality standards.',
    },
    {
      icon: '🤝',
      title: 'Customer Trust',
      text: 'Building lasting relationships through transparency and exceptional service.',
    },
    {
      icon: '🌏',
      title: 'Global Reach',
      text: 'Connecting car enthusiasts worldwide with their dream Japanese vehicles.',
    },
  ];

  const teamMembers = [
    {
      name: 'Takeshi Yamamoto',
      role: 'Founder & CEO',
      image: '/team/ceo.jpg',
      social: {
        linkedin: '#',
        twitter: '#',
      },
    },
    {
      name: 'Sarah Johnson',
      role: 'Export Manager',
      image: '/team/export-manager.jpg',
      social: {
        linkedin: '#',
        twitter: '#',
      },
    },
    {
      name: 'Ken Suzuki',
      role: 'Head of Acquisitions',
      image: '/team/acquisitions.jpg',
      social: {
        linkedin: '#',
        twitter: '#',
      },
    },
    {
      name: 'Maria Garcia',
      role: 'Customer Relations',
      image: '/team/customer-relations.jpg',
      social: {
        linkedin: '#',
        twitter: '#',
      },
    },
  ];

  const timeline = [
    {
      year: '2008',
      title: 'Company Founded',
      text: 'Started as a small export business in Tokyo, Japan.',
    },
    {
      year: '2012',
      title: 'International Expansion',
      text: 'Expanded operations to serve customers in Asia and Oceania.',
    },
    {
      year: '2015',
      title: 'Digital Transformation',
      text: 'Launched our online platform for global vehicle sourcing.',
    },
    {
      year: '2018',
      title: 'Market Leadership',
      text: 'Became one of Japan\'s leading vehicle exporters.',
    },
    {
      year: '2023',
      title: 'Innovation & Growth',
      text: 'Introduced new technologies and expanded our global presence.',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.scrollProgress}>
        {['Hero', 'Mission', 'Stats', 'Journey', 'Team'].map((section, index) => (
          <div 
            key={section}
            className={`${styles.scrollDot} ${index === activeSection ? styles.scrollDotActive : ''}`}
            onClick={() => {
              scrollingRef.current = true;
              const targetSection = sectionsRef.current[index];
              if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(index);
                setTimeout(() => {
                  scrollingRef.current = false;
                }, 1000);
              }
            }}
          >
            <span className={styles.scrollDotLabel}>{section}</span>
          </div>
        ))}
      </div>
      <div id="hero" className={styles.hero}>
        <Image
          src="/images/hero-car.jpg"
          alt="JDM Global Showroom"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>About JDM Global</h1>
          <p className={styles.heroSubtitle}>
            Your trusted partner in Japanese vehicle exports, delivering premium cars worldwide since 2008.
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <div className={styles.missionGrid}>
            {missionPoints.map((point) => (
              <div key={point.title} className={styles.missionCard}>
                <div className={styles.missionIcon}>{point.icon}</div>
                <h3 className={styles.missionTitle}>{point.title}</h3>
                <p className={styles.missionText}>{point.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="stats" className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="journey" className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Journey</h2>
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

        <section id="team" className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Team</h2>
          <div className={styles.teamGrid}>
            {teamMembers.map((member) => (
              <div key={member.name} className={styles.teamCard}>
                <div className={styles.teamImage}>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.teamContent}>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamRole}>{member.role}</p>
                  <div className={styles.teamSocial}>
                    <a href={member.social.linkedin} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                    <a href={member.social.twitter} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
