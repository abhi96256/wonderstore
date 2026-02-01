import React from "react";
import "./Homepage.css";
import Hero from "./Hero/Hero";
import FeaturedCollection from "./FeaturedCollection/FeaturedCollection";
import CollectionIntro from "./CollectionIntro/CollectionIntro";
import FashionShowcase from "./FashionShowcase/FashionShowcase";
import StyleEmpower from "./StyleEmpower/StyleEmpower";
import FashionGrid from "./FashionGrid/FashionGrid";
import InstaFeed from "./InstaFeed/InstaFeed";

function Homepage() {
  return (
    <div className="homepage">
      <Hero />
      <FeaturedCollection />
      <CollectionIntro />
      <FashionShowcase />
      <StyleEmpower />
      <FashionGrid />

      <InstaFeed />
    </div>
  );
}

export default Homepage;
