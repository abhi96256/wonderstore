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
        if (!src) {
            setError(true);
            return;
        }
        setIsLoaded(false);
        setError(false);

        const img = new Image();
        img.src = src;
        img.onload = () => setIsLoaded(true);
        img.onerror = () => setError(true);
    }, [src]);

    const displaySrc = error || !src ? 'https://placehold.co/600x600?text=Premium+Collection' : src;

    return (
        <div className={`optimized-image-container ${!isLoaded && !error ? 'skeleton-loader' : ''} ${containerClass}`}>
            <img
                src={displaySrc}
                alt={alt}
                className={`optimized-image ${className} ${isLoaded ? 'loaded' : ''} ${error ? 'error-fallback' : ''}`}
                loading="lazy"
                onLoad={() => {
                    if (!error) setIsLoaded(true);
                }}
            />
            {!isLoaded && !error && (
                <div className="placeholder-overlay"></div>
            )}
        </div>
    );
};

export default OptimizedImage;
