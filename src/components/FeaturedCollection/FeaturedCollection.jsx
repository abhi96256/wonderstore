import React from "react";
import "./FeaturedCollection.css";
import img1 from "../../assets/featured.webp";
import img2 from "../../assets/featured1.webp";
import "../../Component/Hero/Hero.css";

const FeaturedCollection = () => {
  return (
    <section className="featured-section">
      <h2 className="featured-heading">Featured Collection</h2>
      <div className="featured-grid">
        <div className="featured-card">
          <img
            src={img1}
            alt="Image 1"
            className="featured-img"
            style={{ cursor: "pointer" }}
          />
          <img
            src={img2}
            alt="Image 2"
            className="featured-img"
          />
        </div>
      </div>
      <div className="genie-overlay" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:9999,background:'rgba(255,255,255,0.9)'}}>
        <div className="magic-orb-loader">
          <div className="magic-orb"></div>
          <div className="magic-orb-sparkle"></div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
