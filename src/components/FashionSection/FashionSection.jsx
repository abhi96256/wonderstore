import React, { useState, useEffect } from "react";
import "./FashionSection.css";
import fashion1 from "../../assets/1.webp";
import fashion3 from "../../assets/3.webp";
import fashion4 from "../../assets/4.webp";
import fashion5 from "../../assets/5.webp";
import fashion10 from "../../assets/10.webp";
import fashion11 from "../../assets/11.webp";
import fashion12 from "../../assets/12.webp";
import fashion13 from "../../assets/13.webp";
import { FaEye, FaTimes } from "react-icons/fa";

const fashionData = [
  {
    id: 3,
    image: fashion3,
    category: "Summer Collection",
    title: "Casual Elegance",
  },
  { id: 4, image: fashion4, category: "Street Style", title: "Urban Chic" },
  {
    id: 1,
    image: fashion1,
    category: "Evening Wear",
    title: "Classic Glamour",
  },
  {
    id: 5,
    image: fashion5,
    category: "Seasonal Trends",
    title: "Modern Essentials",
  },
  {
    id: 13,
    image: fashion13,
    category: "Designer Picks",
    title: "Luxury Edit",
  },
  {
    id: 10,
    image: fashion10,
    category: "Accessories",
    title: "Statement Pieces",
  },
  { id: 11, image: fashion11, category: "Casual Wear", title: "Daily Comfort" },
  { id: 12, image: fashion12, category: "Athleisure", title: "Sport Luxe" },
];

const QuickViewModal = ({ item, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fashion-quick-view-modal" onClick={onClose}>
      <div className="quick-view-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="quick-view-image">
          <img src={item.image} alt={item.title} />
        </div>
        <div className="quick-view-details">
          <h2>{item.title}</h2>
          <p className="category">{item.category}</p>
          <div className="quick-view-description">
            <p>
              Experience the perfect blend of style and comfort with our
              carefully curated fashion collection. Each piece is selected to
              help you express your unique personality while staying on trend.
            </p>
          </div>
          <button className="view-collection-btn">View Collection</button>
        </div>
      </div>
    </div>
  );
};

const FashionSection = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleQuickView = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);
  };

  const handleCloseQuickView = () => {
    setSelectedItem(null);
  };

  const renderFashionCard = (item, className) => (
    <div className={`fashion-card ${className}`} key={item.id}>
      <img
        src={item.image}
        alt={item.title}
        className={`fashion-image fashion-image-${item.id}`}
      />
      <div className="fashion-card-overlay">
        <div className="fashion-card-content">
          <h3>{item.title}</h3>
          <p>{item.category}</p>
          <button
            className="quick-view-btn"
            onClick={(e) => handleQuickView(item, e)}
          >
            <FaEye /> Quick View
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="fashion-section">
      <h2 className="fashion-heading">Fashion</h2>
      <div className="fashion-main-container">
        <div className="fashion-top-row">
          {renderFashionCard(fashionData[0], "fashion-card-3")}
          {renderFashionCard(fashionData[1], "fashion-card-4")}
          {renderFashionCard(fashionData[2], "fashion-card-1")}
        </div>
        <div className="fashion-bottom-row">
          {renderFashionCard(fashionData[3], "fashion-card-5")}
        </div>
        <div className="fashion-additional-row">
          <div className="fashion-additional-right">
            {renderFashionCard(fashionData[4], "fashion-card-13")}
            {renderFashionCard(fashionData[5], "fashion-card-10")}
          </div>
          <div className="fashion-additional-bottom">
            {renderFashionCard(fashionData[6], "fashion-card-11")}
            {renderFashionCard(fashionData[7], "fashion-card-12")}
          </div>
        </div>
      </div>

      {selectedItem && (
        <QuickViewModal item={selectedItem} onClose={handleCloseQuickView} />
      )}
    </section>
  );
};

export default FashionSection;
