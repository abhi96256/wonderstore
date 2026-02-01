import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import OptimizedImage from "../OptimizedImage";


function Hero() {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "CRAFTED",
      subtitle: "WITH PURPOSE",
      description: "Discover artisanal excellence in every detail. Curated for those who appreciate the unique.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80",
      tag: "PREMIUM COLLECTION"
    },
    {
      title: "UNIQUE",
      subtitle: "BY DESIGN",
      description: "Elevate your lifestyle with our exclusive range of handcrafted essentials.",
      image: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=1600&q=80",
      tag: "ARTISANAL PIECES"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleShopNow = () => navigate("/all-products");
  const handleExplore = () => navigate("/new-arrivals");

  return (
    <section className="hero-modern">
      {/* Decorative background elements */}
      <div className="modern-bg-text">UNIQUE</div>

      <div className="hero-modern-container">
        <div className="hero-content-wrapper">
          {/* Text Content Side */}
          <div className="hero-text-side">
            <div className="tag-line-wrapper">
              <span className="line"></span>
              <span className="tag-text">{slides[activeSlide].tag}</span>
            </div>

            <h1 className="hero-reveal-title">
              <span className="title-top">{slides[activeSlide].title}</span>
              <span className="title-bottom">{slides[activeSlide].subtitle}</span>
            </h1>

            <p className="hero-description-text">
              {slides[activeSlide].description}
            </p>

            <div className="hero-actions-modern">
              <button className="btn-modern-primary" onClick={handleShopNow}>
                SHOP NOW
                <div className="btn-fill"></div>
              </button>
              <button className="btn-modern-text" onClick={handleExplore}>
                EXPLORE COLLECTION →
              </button>
            </div>

            <div className="hero-scroll-indicator">
              <div className="scroll-line"></div>
              <span>SCROLL</span>
            </div>
          </div>

          {/* Image Side - Minimal Floating Frame */}
          <div className="hero-image-side">
            <div className="main-image-frame">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`slide-image ${activeSlide === index ? 'active' : ''}`}
                >
                  <img src={slide.image} alt={slide.title} />
                </div>
              ))}

              {/* Floating Decorative Card */}
              <div className="floating-info-card">
                <div className="card-dot"></div>
                <h4>Artisan Made</h4>
                <p>Limited Units Available</p>
              </div>
            </div>

            {/* Thumbnail Grid - Small Previews */}
            <div className="hero-thumbnail-previews">
              <div className="thumb-item" onClick={() => navigate('/product/1')}>
                <img src="./hero_image2.webp" alt="Thumb" />
              </div>
              <div className="thumb-item accent" onClick={() => navigate('/new-arrivals')}>
                <span>+12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="slide-nav-dots">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`dot ${activeSlide === i ? 'active' : ''}`}
            onClick={() => setActiveSlide(i)}
          ></div>
        ))}
      </div>
    </section>
  );
}

export default Hero;