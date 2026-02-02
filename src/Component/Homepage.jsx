import React from "react";
import "./Homepage.css";
import Hero from "./Hero/Hero";
import HomeCategories from "./HomeCategories/HomeCategories";

function Homepage() {
  return (
    <div className="homepage">
      <Hero />
      <HomeCategories />
    </div>
  );
}

export default Homepage;
