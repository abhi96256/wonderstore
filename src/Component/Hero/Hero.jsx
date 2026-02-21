import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Hero.css";
import OptimizedImage from "../OptimizedImage";


function Hero() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);

  const slides = [
    {
      title: "FLY HIGH",
      subtitle: "PREMIUM LIGHTERS",
      description: "Experience the spark of innovation with our premium lighter collection. Sleek design, reliable flame.",
      images: ["/image.png", "/ligher video.mp4"],
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
      title: "PURE ROLL",
      subtitle: "PREMIUM PAPERS",
      description: "Enhance your ritual with our premium pre-rolled cones. Perfectly crafted for a smooth, slow, and consistent burn every time.",
      images: ["/paper.mp4", "/roll.jpeg"],
      tag: "LATEST COLLECTION",
      type: "paperroll",
      pricing: [
        { label: "Master Box", price: "₹4,500", detail: "12 Boxes" },
        { label: "Per Box", price: "₹400", detail: "63 Cones" },
        { label: "Bulk Inquiry", price: "Best Price", detail: "Wholesale" }
      ],
      ctaLabel: "EXPLORE PAPERS",
      ctaLink: "/all-products?category=FlyHigh"
    }
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
    setMediaIndex(0); // Reset media index on slide change
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setMediaIndex(0); // Reset media index on slide change
  };

  useEffect(() => {
    const currentMedia = slides[activeSlide]?.images;
    if (currentMedia && currentMedia.length > 1) {
      const timer = setInterval(() => {
        setMediaIndex((prev) => (prev + 1) % currentMedia.length);
      }, 6000); // Change media every 6 seconds
      return () => clearInterval(timer);
    }
  }, [activeSlide, slides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 15000); // Change main slide every 15 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleShopNow = () => {
    const currentSlide = slides[activeSlide];
    navigate(currentSlide.ctaLink || "/all-products");
  };
  const handleExplore = () => navigate("/new-arrivals");

  return (
    <section className={`hero-modern ${slides[activeSlide]?.type === 'flyhigh' ? 'flyhigh-hero' : ''} ${slides[activeSlide]?.type === 'paperroll' ? 'paperroll-hero' : ''}`}>
      {/* Decorative background elements */}
      <div className="modern-bg-text">
        {slides[activeSlide]?.type === 'flyhigh' ? 'FLYHIGH' : slides[activeSlide]?.type === 'paperroll' ? 'ROLLS' : 'UNIQUE'}
      </div>

      {/* Background Effects */}
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
          {/* Title Area - Positioned first on mobile */}
          <div className="hero-title-area">
            <div className="tag-line-wrapper">
              <span className="line"></span>
              <span className="tag-text">{slides[activeSlide]?.tag}</span>
            </div>

            <h1 className="hero-reveal-title">
              <span className="title-top">{slides[activeSlide]?.title}</span>
              <span className="title-bottom">{slides[activeSlide]?.subtitle}</span>
            </h1>
          </div>

          {/* Image Side - Positioned after title on mobile */}
          <div className="hero-image-side">
            <div className="main-image-frame">
              {/* Decorative Splash Background */}
              <div className="decorative-splash"></div>

              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`slide-image ${activeSlide === index ? 'active' : ''}`}
                >
                  {slide.images ? (
                    slide.images.map((media, mIdx) => {
                      const isVideo = media.toLowerCase().endsWith('.mp4') || media.toLowerCase().endsWith('.webm');
                      return isVideo ? (
                        <video
                          key={mIdx}
                          src={media}
                          className={`sub-slide-img ${mediaIndex === mIdx ? 'visible' : ''}`}
                          autoPlay
                          muted
                          loop
                          playsInline
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      ) : (
                        <img
                          key={mIdx}
                          src={media}
                          alt={`${slide.title} ${mIdx}`}
                          className={`sub-slide-img ${mediaIndex === mIdx ? 'visible' : ''}`}
                        />
                      );
                    })
                  ) : (
                    <img src={slide.image} alt={slide.title} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Details Side - Positioned last on mobile */}
          <div className="hero-details-side">
            <div className="hero-actions-modern">
              <button className={`btn-modern-primary ${slides[activeSlide]?.type === 'flyhigh' ? 'btn-flyhigh' : ''} ${slides[activeSlide]?.type === 'paperroll' ? 'btn-paperroll' : ''}`} onClick={handleShopNow}>
                {slides[activeSlide]?.ctaLabel || "SHOP NOW"}
                <div className="btn-fill"></div>
              </button>
              <button className="btn-modern-text" onClick={handleExplore}>
                EXPLORE COLLECTION →
              </button>
            </div>

            {slides[activeSlide]?.pricing ? (
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

            <div className="hero-scroll-indicator">
              <div className="scroll-line"></div>
              <span>SCROLL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      {slides.length > 1 && (
        <div className="slide-nav-dots">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`dot ${activeSlide === i ? 'active' : ''}`}
              onClick={() => {
                setActiveSlide(i);
                setMediaIndex(0);
              }}
            ></div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Hero;