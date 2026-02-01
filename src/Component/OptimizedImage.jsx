import React, { useState, useEffect } from 'react';
import './OptimizedImage.css';

/**
 * OptimizedImage Component
 * @param {string} src - The actual high-quality image URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - Additional CSS classes for the img tag
 * @param {string} containerClass - Additional CSS classes for the container
 */
const OptimizedImage = ({ src, alt, className = "", containerClass = "" }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => setIsLoaded(true);
        img.onerror = () => setError(true);
    }, [src]);

    return (
        <div className={`optimized-image-container ${!isLoaded ? 'skeleton-loader' : ''} ${containerClass}`}>
            <img
                src={src}
                alt={alt}
                className={`optimized-image ${className} ${isLoaded ? 'loaded' : ''}`}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
            />
            {/* Optional: Add a very tiny (base64 or low-res) placeholder here if you want Blur-up effect */}
            {!isLoaded && !error && (
                <div className="placeholder-overlay"></div>
            )}
        </div>
    );
};

export default OptimizedImage;
