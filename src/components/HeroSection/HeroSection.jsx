import React from "react";
import { Link } from "react-router-dom";
import "./HeroSection.css";
import heroImage from "../../assets/hero-image.webp";
import heroImage2 from "../../assets/hero-image2.webp";
import heroImage3 from "../../assets/hero-image3.webp";
import heroImage4 from "../../assets/hero-image4.webp";
import heroImage5 from "../../assets/Frame 1000002402.webp";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Main Content */}
        <div className="hero-content">
          {/* Text at the top */}
          <div className="hero-text">
            <h1>
              Dive Into A W
              <img src={heroImage5} alt="Fashion" className="image-frame-h1" />
              rld Of Endless Fashion Possibilities
            </h1>
            <p>
              Elevate Your Style With Our Fashion Finds. Discover Your Signature
              Style At UniqueStore.
            </p>
          </div>
          {/* Buttons in the center */}
          <div className="hero-actions">
            <Link to="/new-arrivals" className="hero-btn hero-btn-primary">
              Shop Now
            </Link>
            <Link to="/all-products" className="hero-btn hero-btn-secondary">
              Explore More Products
            </Link>
          </div>

          {/* Collage Container with hero-image4 as background and three images inside */}
          <div className="collage-container">
            <div className="collage-background">
              <img
                src={heroImage4}
                alt="Fashion collage background"
                className="collage-bg-image"
              />

              {/* Individual images positioned inside */}
              <div className="collage-images">
                <img
                  src={heroImage}
                  alt="Main fashion"
                  className="collage-main-image"
                />
                <img
                  src={heroImage2}
                  alt="Right fashion"
                  className="collage-right-image"
                />
                <img
                  src={heroImage3}
                  alt="Left fashion"
                  className="collage-left-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
