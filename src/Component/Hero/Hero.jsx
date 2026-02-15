import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Hero.css";
import OptimizedImage from "../OptimizedImage";


function Hero() {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [holiImageIndex, setHoliImageIndex] = useState(0);
  const [flyHighIndex, setFlyHighIndex] = useState(0);

  const slides = [
    {
      title: "FLY HIGH",
      subtitle: "PREMIUM LIGHTERS",
      description: "Experience the spark of innovation with our premium lighter collection. Sleek design, reliable flame.",
      images: ["/image.png"],
      tag: "BRAND NEW ARRIVAL",
      type: "flyhigh",
      pricing: [
        { label: "Master Box", price: "₹7000", detail: "1000 Pcs" },
        { label: "Per Box", price: "₹700", detail: "100 Pcs" },
        { label: "Per Piece", price: "₹7", detail: "Single Unit" }
      ],
      ctaLabel: "VIEW BULK DEALS",
      ctaLink: "/all-products?category=FlyHigh"
    },
    {
      title: "CELEBRATE",
      subtitle: "FESTIVAL OF COLORS",
      description: "Discover our exclusive range of ultra-unique pichkaris. You won't find these one-of-a-kind designs anywhere else!",
      images: [
        "/holi/IMG_2024.JPG.jpeg",
        "/holi/IMG_2017.JPG.jpeg",
        "/holi/IMG_2024.JPG.jpeg",
      ],
      tag: "HOLI SPECIAL 2026",
      type: "holi",
      ctaLabel: "EXPLORE HOLI SPECIAL",
      ctaLink: "/all-products?category=Holi Special"
    }
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides[activeSlide]?.type === 'holi') {
      const imgTimer = setInterval(() => {
        setHoliImageIndex((prev) => (prev + 1) % slides[activeSlide].images.length);
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(imgTimer);
    } else if (slides[activeSlide]?.type === 'flyhigh') {
      const fhTimer = setInterval(() => {
        setFlyHighIndex((prev) => (prev + 1) % slides[activeSlide].images.length);
      }, 3000);
      return () => clearInterval(fhTimer);
    }
  }, [activeSlide, slides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 8000); // Increased time to allow reading
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleShopNow = () => {
    const currentSlide = slides[activeSlide];
    navigate(currentSlide.ctaLink || "/all-products");
  };
  const handleExplore = () => navigate("/new-arrivals");

  const [hasSplashed, setHasSplashed] = useState(false);

  useEffect(() => {
    if (slides[activeSlide]?.type === 'holi') {
      setHasSplashed(false);
      const splashTimer = setTimeout(() => setHasSplashed(true), 100);
      return () => clearTimeout(splashTimer);
    }
  }, [activeSlide]);

  return (
    <section className={`hero-modern ${slides[activeSlide]?.type === 'holi' ? 'holi-hero' : ''} ${slides[activeSlide]?.type === 'flyhigh' ? 'flyhigh-hero' : ''}`}>
      {/* Decorative background elements */}
      <div className="modern-bg-text">
        {slides[activeSlide]?.type === 'holi' ? 'HOLI' : slides[activeSlide]?.type === 'flyhigh' ? 'FLYHIGH' : 'UNIQUE'}
      </div>

      {slides[activeSlide]?.type === 'holi' && (
        <div className={`holi-festival-container ${hasSplashed ? 'festival-active' : ''}`}>
          {/* Initial Powder Fly Effect - Starts First */}
          <div className="powder-fly powder-1"></div>
          <div className="powder-fly powder-2"></div>
          <div className="powder-fly powder-3"></div>

          {/* 3 Realistic Balloons - Appear after powder */}
          <div className="holi-balloon balloon-1">
            <div className="balloon-shine"></div>
            <div className="balloon-knot"></div>
            <div className="balloon-string"></div>
          </div>
          <div className="holi-balloon balloon-2">
            <div className="balloon-shine"></div>
            <div className="balloon-knot"></div>
            <div className="balloon-string"></div>
          </div>
          <div className="holi-balloon balloon-3">
            <div className="balloon-shine"></div>
            <div className="balloon-knot"></div>
            <div className="balloon-string"></div>
          </div>

          {/* Liquid Splatters that stay after popping */}
          <div className="persisting-splat splat-1"></div>
          <div className="persisting-splat splat-2"></div>
          <div className="persisting-splat splat-3"></div>
          <div className="persisting-splat splat-4"></div>

          {/* Splatter Blobs */}
          <div className="liquid-blob blob-1"></div>
          <div className="liquid-blob blob-2"></div>

          {/* Long Drips */}
          <div className="liquid-drip drip-1"></div>
          <div className="liquid-drip drip-2"></div>
        </div>
      )}

      {/* FlyHigh Background Effect */}
      {slides[activeSlide]?.type === 'flyhigh' && (
        <div className="flyhigh-bg-effect">
          <div className="spark-particle spark-1"></div>
          <div className="spark-particle spark-2"></div>
          <div className="glow-orb"></div>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button className="slider-nav-btn prev-btn" onClick={prevSlide} aria-label="Previous Slide">
            <FaChevronLeft />
          </button>
          <button className="slider-nav-btn next-btn" onClick={nextSlide} aria-label="Next Slide">
            <FaChevronRight />
          </button>
        </>
      )}

      <div className="hero-modern-container">
        <div className="hero-content-wrapper">
          {/* Text Content Side */}
          <div className="hero-text-side">
            <div className="tag-line-wrapper">
              <span className="line"></span>
              <span className="tag-text">{slides[activeSlide]?.tag}</span>
            </div>

            <h1 className="hero-reveal-title">
              <span className="title-top">{slides[activeSlide]?.title}</span>
              <span className="title-bottom">{slides[activeSlide]?.subtitle}</span>
            </h1>

            {slides[activeSlide]?.type === 'flyhigh' && slides[activeSlide]?.pricing ? (
              <div className="flyhigh-pricing-grid">
                {slides[activeSlide].pricing.map((item, index) => (
                  <div key={index} className="fh-price-card">
                    <span className="fh-label">{item.label}</span>
                    <span className="fh-price">{item.price}</span>
                    <span className="fh-detail">{item.detail}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hero-description-text">
                {slides[activeSlide]?.description}
              </p>
            )}

            <div className="hero-actions-modern">
              <button className={`btn-modern-primary ${slides[activeSlide]?.type === 'holi' ? 'btn-holi' : ''} ${slides[activeSlide]?.type === 'flyhigh' ? 'btn-flyhigh' : ''}`} onClick={handleShopNow}>
                {slides[activeSlide]?.ctaLabel || "SHOP NOW"}
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

          {/* Image Side - Ultra Premium Design */}
          <div className="hero-image-side">
            <div className="main-image-frame">
              {/* Decorative Splash Background with Parallax effect potentially */}
              <div className="decorative-splash"></div>

              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`slide-image ${activeSlide === index ? 'active' : ''}`}
                >
                  {slide.type === 'holi' ? (
                    slide.images.map((img, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={img}
                        alt={`${slide.title} ${imgIdx}`}
                        className={`sub-slide-img ${holiImageIndex === imgIdx ? 'visible' : ''}`}
                      />
                    ))
                  ) : slide.type === 'flyhigh' ? (
                    slide.images.map((img, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={img}
                        alt={`${slide.title} ${imgIdx}`}
                        className={`sub-slide-img ${flyHighIndex === imgIdx ? 'visible' : ''}`}
                      />
                    ))
                  ) : (
                    <img src={slide.image} alt={slide.title} />
                  )}
                </div>
              ))}


              {/* Floating DNA Badge - Unique Element - Only for Holi */}
              {slides[activeSlide]?.type === 'holi' && (
                <>
                  <div className="unique-dna-badge">
                    <div className="dna-item">
                      <span className="dot pulse-red"></span>
                      <div className="dna-text">
                        <span className="label">Crafted with</span>
                        <span className="value">Pure Passion</span>
                      </div>
                    </div>
                    <div className="dna-divider"></div>
                    <div className="dna-item">
                      <span className="dot orange rotate-soft"></span>
                      <div className="dna-text">
                        <span className="label">Edition</span>
                        <span className="value">Holi 特别</span>
                      </div>
                    </div>
                  </div>

                  <div className="hero-price-tag bubble-3d">
                    <span className="suffix">Pichkari from</span>
                    <span className="amount">₹99</span>
                    <span className="suffix">Shop Fast!</span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Slide Navigation Dots - Only show if multiple slides */}
      {slides.length > 1 && (
        <div className="slide-nav-dots">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`dot ${activeSlide === i ? 'active' : ''}`}
              onClick={() => setActiveSlide(i)}
            ></div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Hero;