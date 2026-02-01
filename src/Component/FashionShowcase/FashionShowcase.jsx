import React from "react";
import { useNavigate } from "react-router-dom";
import "./FashionShowcase.css";
import OptimizedImage from "../OptimizedImage";

const FashionShowcase = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/all-products');
  };

  return (
    <div className="fashion-section">
      <h1 className="sectiontitle">
        CRAFT AT YOUR FINGERTIPS
      </h1>
      <div className="fashion-showcase">
        <div className="showcase-main-section">
          <div className="main-content">
            <h1
              className="showcase-main-title"
            >
              100+
            </h1>
            <h2 className="main-subtitle">Handpicked Wonders
            </h2>
            <p className="main-description">
              Where style meets soul — curated to inspire every corner of your home. <span className="mobile-hidden">Explore pieces crafted to inspire and elevate everyday living.</span>
            </p>
          </div>
          <div className="shop-nowbtn" onClick={handleShopNow}>
            <span>Shop Now</span>
            <div className="arrow-icon" >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="showcase-side-container">
          <div className="showcase-side-item">
            <div>
              <OptimizedImage src="./side_image2.webp" alt="img" />
            </div>
            <div className="showcase-info-card">
              <div className="info-card-header">
                <img src="./image-icon.webp" alt="img" loading="lazy" />
                <span>
                  Small Details. Big Style.
                </span>
              </div>
              <div className="info-card-content">
                <p>
                  Little Wonders for Your Space.
                </p>
                <p>
                  Curated accents for a touch of wonder.
                  <svg
                    onClick={handleShopNow}
                    xmlns="http://www.w3.org/2000/svg"
                    width="60"
                    height="60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </p>
              </div>
            </div>
          </div>
          <div className="showcase-side-item">
            <div className="showcase-side-image-container">
              <OptimizedImage src="./side_image1.webp" alt="img" />
              <div className="showcase-side-image-overlay">
                <svg
                  onClick={handleShopNow}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="showcase-side-image-bottom">
                <div className="showcase-side-image-card">
                  <div className="showcase-side-image-badge">
                    WONDER COLLECTION
                  </div>
                  <h2 className="showcase-side-image-title">
                    Do the Wonder Talking.
                    <br />

                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionShowcase;
