import React from 'react'
import './InstaFeed.css'
import OptimizedImage from '../OptimizedImage'

const InstaFeed = () => {
  return (
    <section className="insta-feed-container">
      <h2 className="insta-feed-title">OUR INSTAGRAM FEED</h2>

      <div className="insta-feed-gallery">
        <div className="gallery-image image1">
          <OptimizedImage src="./tilt_image1.webp" alt="Yellow cushion with leaf pattern" />
        </div>
        <div className="gallery-image image2">
          <OptimizedImage src="./tilt_image2.webp" alt="Orange cushion with fern pattern" />
        </div>
        <div className="gallery-image image3">
          <OptimizedImage src="./tilt_image3.webp" alt="Shopping bags and packaging" />
        </div>
        <div className="gallery-image image4">
          <OptimizedImage src="./tilt_image4.webp" alt="Folded fabrics and crafts" />
        </div>
        <div className="gallery-image image5">
          <OptimizedImage src="./tilt_image5.webp" alt="Blue cushion with floral design" />
        </div>
      </div>
    </section>
  )
}

export default InstaFeed 