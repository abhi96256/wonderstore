import React from "react";
import "./InstagramSection.css";
import fashion1 from "../../assets/69.webp"; // ✅ fixed name

const InstagramSection = () => {
  const images = [fashion1]; // ✅ using the correct variable

  return (
    <section className="instagram-section">
      <h2 className="instagram-heading">Follow Us on Instagram</h2>
      <div className="instagram-grid">
        {images.map((img, index) => (
          <div className="instagram-img-box" key={index}>
            <img src={img} alt={`Instagram ${index + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default InstagramSection;
