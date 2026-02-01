import React from "react";
import { Link } from "react-router-dom";
import "./Explore.css";

const Explore = () => {
  const categories = [
    {
      id: 1,
      name: "Trending Now",
      image: "/images/trending.webp",
      description: "Discover what's hot right now",
    },
    {
      id: 2,
      name: "Best Sellers",
      image: "/images/bestsellers.webp",
      description: "Our most popular items",
    },
    {
      id: 3,
      name: "Special Offers",
      image: "/images/offers.webp",
      description: "Limited time deals",
    },
    {
      id: 4,
      name: "Featured Collections",
      image: "/images/collections.webp",
      description: "Curated collections for you",
    },
  ];

  return (
    <div className="explore-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Explore</h2>
        </div>

        <div className="explore-grid">
          {categories.map((category) => (
            <Link
              to={`/explore/${category.id}`}
              key={category.id}
              className="explore-card"
            >
              <div className="explore-card-image">
                <img src={category.image} alt={category.name} />
              </div>
              <div className="explore-card-content">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
