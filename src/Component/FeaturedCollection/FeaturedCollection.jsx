import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './FeaturedCollection.css';
import OptimizedImage from '../OptimizedImage';

const FeaturedCollection = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [enteringCardId, setEnteringCardId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastIndex = useRef(0);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const DEMO_PRODUCTS = [
          {
            id: 'demo-1',
            product_name: 'Levitating Air Bonsai',
            mrp: 4999,
            firstImage: '/levitating_plant.png',
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-2',
            product_name: 'Galaxy Moon Lamp',
            mrp: 2499,
            firstImage: '/moon_lamp.png',
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-3',
            product_name: 'Kinetic Art Sculpture',
            mrp: 3999,
            firstImage: '/kinetic_toy.png',
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-4',
            product_name: 'Premium Velvet Bedding',
            mrp: 12999,
            firstImage: '/levitating_plant.png',
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-5',
            product_name: 'Urban Explorer Backpack',
            mrp: 5499,
            firstImage: '/levitating_plant.png',
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-6',
            product_name: 'Artisan Silk Cushion',
            mrp: 1850,
            firstImage: '/levitating_plant.png',
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-7',
            product_name: 'Smart Gear Pro Watch',
            mrp: 8999,
            firstImage: '/levitating_plant.png',
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-8',
            product_name: 'Luxury Quilt Collection',
            mrp: 7500,
            firstImage: '/levitating_plant.png',
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-9',
            product_name: 'Modern Accent Decor',
            mrp: 3200,
            firstImage: '/levitating_plant.png',
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-10',
            product_name: 'Egyptian Cotton Sheets',
            mrp: 4200,
            firstImage: '/levitating_plant.png',
            created_at: new Date().toISOString()
          }
        ];

        let productsArr = [];
        try {
          const productsRef = collection(db, 'products');
          const q = query(productsRef, where('featured', '==', true));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            // Parse the image field for the first image
            let firstImage = null;
            if (data.image) {
              const imagesArr = data.image.split(',').map(img => img.trim()).filter(Boolean);
              if (imagesArr.length > 0) {
                firstImage = imagesArr[0].startsWith('http') ? imagesArr[0] : (imagesArr[0].startsWith('/') ? imagesArr[0] : `/${imagesArr[0]}`);
              }
            }
            // Strict filtering: Only add products that have a valid image and price
            if (firstImage && firstImage.length > 4 && Number(data.mrp) > 0) {
              productsArr.push({ ...data, firstImage });
            }
          });
        } catch (e) {
          console.warn("Firestore access problem", e);
        }

        // Combine: Curated 10 first, then DB items
        let finalProducts = [...DEMO_PRODUCTS];

        // Add DB products at the end
        productsArr.forEach(dbItem => {
          const isDuplicate = finalProducts.some(p =>
            p.product_name.toLowerCase() === dbItem.product_name.toLowerCase()
          );
          if (!isDuplicate) {
            finalProducts.push(dbItem);
          }
        });

        // Strictly show 10 as requested
        setProducts(finalProducts.slice(0, 10));
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Create an extended array for infinite scrolling illusion
  const extendedProducts = useMemo(() => {
    if (products.length === 0) return [];
    // Create copies of the products to add before and after the original array
    const before = products.slice(-3).map(p => ({ ...p, id: `before-${p.id}` }));
    const after = products.slice(0, 3).map(p => ({ ...p, id: `after-${p.id}` }));
    return [...before, ...products, ...after];
  }, [products]);

  const productsLength = products.length;

  // Advanced rotation handling for infinite loop effect
  const rotateCarousel = useCallback(() => {
    if (isTransitioning || productsLength === 0) return;

    setIsTransitioning(true);

    const nextIndex = (activeIndex + 1) % productsLength;

    // If we're moving from the last to the first item
    if (activeIndex === productsLength - 1 && nextIndex === 0) {
      setEnteringCardId(products[0].id);
    }

    setActiveIndex(nextIndex);
    lastIndex.current = activeIndex;

    // Reset transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      setEnteringCardId(null);
    }, 700);
  }, [activeIndex, isTransitioning, productsLength, products]);

  useEffect(() => {
    let interval;
    if (isAutoPlay && productsLength > 0) {
      interval = setInterval(rotateCarousel, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, rotateCarousel, productsLength]);

  const handleCardClick = (index) => {
    if (isTransitioning || productsLength === 0) return;

    setIsTransitioning(true);

    // Check if we're jumping across the loop point (between first and last items)
    if ((activeIndex === productsLength - 1 && index === 0) ||
      (activeIndex === 0 && index === productsLength - 1)) {
      setEnteringCardId(products[index].id);
    }

    setActiveIndex(index);
    lastIndex.current = activeIndex;
    setIsAutoPlay(false);

    // Reset transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
      setEnteringCardId(null);
    }, 700);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const getCardClass = (index) => {
    if (productsLength === 0) return 'card card-hidden';

    // Calculate the relative position considering the infinite loop
    let position = index - activeIndex;

    // Optimize for the loop transition
    if (Math.abs(position) > productsLength / 2) {
      position = position > 0
        ? position - productsLength
        : position + productsLength;
    }

    if (position === 0) return 'card card-active';
    if (Math.abs(position) > 3) return 'card card-hidden';

    // Add entering class for the card that's entering from the opposite side during loop transition
    const isEntering = enteringCardId === products[index].id;
    const baseClass = `card card-${position < 0 ? 'left' : 'right'}${Math.min(Math.abs(position), 3)}`;

    return isEntering ? `${baseClass} card-entering` : baseClass;
  };

  const getVisibleRange = () => {
    if (productsLength === 0) return [];

    // Return indices for visible cards (active card +/- 3 in each direction)
    const visibleRange = [];
    for (let i = -3; i <= 3; i++) {
      const wrappedIndex = ((activeIndex + i) % productsLength + productsLength) % productsLength;
      visibleRange.push(wrappedIndex);
    }

    // Special case: if we're at a loop point, make sure both ends are visible
    if (activeIndex <= 2) {
      visibleRange.push(productsLength - 1, productsLength - 2);
    } else if (activeIndex >= productsLength - 3) {
      visibleRange.push(0, 1);
    }

    return [...new Set(visibleRange)]; // Remove any duplicates
  };

  const visibleIndices = getVisibleRange();

  const handleIndicatorClick = (index) => {
    handleCardClick(index);
    navigate('/all-products');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="no-products">No featured products available</div>;
  }

  return (
    <section className="featured-collection">
      <div className="collection-header">
        <h2 className="collection-title">FEATURED COLLECTION</h2>
        <button className="carousel-control" onClick={toggleAutoPlay}>
          {isAutoPlay ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 9V15M14 9V15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 16.5L16 12L10 7.5V16.5Z" fill="#222" />
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      <div className="card-carousel">
        {products.map((product, index) => {
          // Only render cards that are visible or will become visible soon
          if (!visibleIndices.includes(index)) return null;

          return (
            <div
              key={product.id}
              className={getCardClass(index)}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="card-inner">
                <div className="card-image">
                  <OptimizedImage src={product.firstImage} alt={product.product_name} />
                  {new Date(product.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) &&
                    <span className="new-label">NEW</span>
                  }
                </div>
                {index === activeIndex && (
                  <div className="card-info">
                    <div className="price-badge">
                      <div className="price-info">
                        <span className="start-from">Start From</span>
                        <span className="price">₹{Number(product.mrp).toFixed(2)}</span>
                      </div>
                    </div>
                    <button className="shop-btn" onClick={(e) => {
                      e.stopPropagation();
                      toggleAutoPlay();
                    }}>
                      <svg className="shop-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {isAutoPlay ? (
                          <path d="M10 9V15M14 9V15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <path d="M10 16.5L16 12L10 7.5V16.5Z" fill="white" />
                        )}
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="carousel-indicators">
        {products.map((_, index) => (
          <span
            key={index}
            className={`indicator ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleIndicatorClick(index)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCollection; 