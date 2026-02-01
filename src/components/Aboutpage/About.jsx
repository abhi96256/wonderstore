import React, { useState, useEffect } from 'react';
import './About.css';
import { sliderImages } from '../../assets/about/slider-images';

const About = () => {
  const [sliderIndex, setSliderIndex] = useState(0);

  // Auto-play for slider
  useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="about-page">
      {/* Banner Section with Slider */}
      <section className="about-banner-section">
        <div className="slider-wrapper">
          {sliderImages.map((slide, idx) => (
            <img
              key={slide.image}
              src={slide.image}
              alt={slide.alt}
              className={`slider-image${idx === sliderIndex ? ' active' : ''}`}
              loading={idx === 0 ? "eager" : "lazy"}
            />
          ))}
          <div className="slider-overlay"></div>
        </div>

        <div className="about-banner-content">
          <div className="title-container">
            <h1>
              {"ABOUT UNIQUESTORE".split('').map((letter, index) => (
                <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </h1>
            <p className="about-banner-description">
              Where Innovation Meets Art • Crafting Exclusivity Since 2024
            </p>
          </div>
        </div>

        <div className="slider-dots">
          {sliderImages.map((_, idx) => (
            <span
              key={idx}
              className={`slider-dot${idx === sliderIndex ? ' active' : ''}`}
              onClick={() => setSliderIndex(idx)}
            />
          ))}
        </div>
      </section>

      {/* Content Section */}
      <section className="about-content-section">
        <div className="content-container">
          <div className="about-description">
            <p>
              At UniqueStore, we believe that your lifestyle should be as unique as you are.
              Inspired by the pursuit of excellence and the beauty of rare craftsmanship,
              UniqueStore brings you a curated collection of luxury tech, artisanal crafts,
              and premium lifestyle essentials.
            </p>

            <p>
              Our collection includes avant-garde gadgets, hand-crafted decor pieces,
              and exclusive accessories — each piece a harmonious blend of innovation,
              quality, and aesthetic brilliance. Whether it's the sleek finish of premium metal,
              the warmth of hand-carved wood, or the precision of modern tech, our products
              are designed to elevate your everyday experience.
            </p>

            <p>
              We work with world-class designers and master artisans to create pieces that
              don't just exist, but inspire. Every item from UniqueStore is a statement of
              rarity and sophistication — crafted for those who settle for nothing but the exceptional.
            </p>

            <p className="tagline">
              UniqueStore — where innovation meets craft.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
