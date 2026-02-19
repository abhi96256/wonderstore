import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import './HomeCategories.css';
import OptimizedImage from '../OptimizedImage';
import { FaArrowRight } from 'react-icons/fa';

const HomeCategories = () => {
    const navigate = useNavigate();
    const [categoryData, setCategoryData] = useState({
        "FlyHigh": [],
        "Unique Speaker": [],
        "Lamps": [],
        "Humidifier": []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                const categories = ["FlyHigh", "Unique Speaker", "Lamps", "Humidifier"];
                const newData = {};

                for (const cat of categories) {
                    const q = query(
                        collection(db, 'products'),
                        where('category', '==', cat),
                        limit(4)
                    );
                    const querySnapshot = await getDocs(q);
                    const products = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        let firstImage = '';
                        if (data.image) {
                            const imagesArr = data.image.split(',').map(img => img.trim()).filter(Boolean);
                            if (imagesArr.length > 0) {
                                firstImage = imagesArr[0].startsWith('http') ? imagesArr[0] : (imagesArr[0].startsWith('/') ? imagesArr[0] : `/${imagesArr[0]}`);
                            }
                        }
                        products.push({ id: doc.id, ...data, firstImage });
                    });
                    newData[cat] = products;
                }
                setCategoryData(newData);
            } catch (err) {
                console.error("Error fetching category products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, []);

    const handleViewAll = (category) => {
        navigate(`/all-products?category=${encodeURIComponent(category)}`);
    };

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    if (loading) {
        return <div className="loading-container">Loading Collections...</div>;
    }

    return (
        <section className="home-categories">
            {Object.keys(categoryData).map((category, index) => (
                <div key={category} className={`category-section ${index % 2 === 1 ? 'reverse' : ''}`}>
                    <div className="category-info">
                        <div className="category-label">EXCLUSIVE COLLECTION</div>
                        <h2 className="category-title">{category}</h2>
                        <p className="category-description">
                            Experience the perfect blend of innovation and elegance with our curated {category.toLowerCase()} collection.
                            Designed to elevate your lifestyle and bring a touch of wonder to your space.
                        </p>
                        <button className="category-cta" onClick={() => handleViewAll(category)}>
                            Explore All <FaArrowRight />
                        </button>



                    </div>

                    <div className="category-grid">
                        {categoryData[category].length > 0 ? (
                            categoryData[category].map((product) => (
                                <div
                                    key={product.id}
                                    className="home-product-card"
                                    onClick={() => handleProductClick(product.id)}
                                >
                                    <div className="home-product-image">
                                        <OptimizedImage src={product.firstImage} alt={product.product_name} />
                                        <div className="home-product-overlay">
                                            <span>Quick View</span>
                                        </div>
                                    </div>
                                    <div className="home-product-details">
                                        <h3 className="home-product-name">{product.product_name}</h3>
                                        <p className="home-product-price">₹{Number(product.mrp).toLocaleString()}</p>

                                        {/* Inline Wholesale Pricing for FlyHigh category */}
                                        {category === "FlyHigh" && (
                                            <div className={`inline-wholesale-grid ${product.product_name.toLowerCase().includes('lighter') ? 'lighters' : 'papers'}`}>
                                                {product.product_name.toLowerCase().includes('lighter') ? (
                                                    <>
                                                        <div className="grid-item">
                                                            <span>Master Box</span>
                                                            <b>₹7,000</b>
                                                            <small>1000 Pcs</small>
                                                        </div>
                                                        <div className="grid-item">
                                                            <span>Per Box</span>
                                                            <b>₹700</b>
                                                            <small>100 Pcs</small>
                                                        </div>
                                                        <div className="grid-item highlight">
                                                            <span>Per Piece</span>
                                                            <b>₹7</b>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="grid-item">
                                                            <span>Master Box</span>
                                                            <b>₹4,500</b>
                                                            <small>12 Boxes</small>
                                                        </div>
                                                        <div className="grid-item">
                                                            <span>Per Box</span>
                                                            <b>₹400</b>
                                                            <small>63 Cones</small>
                                                        </div>
                                                        <div className="grid-item highlight">
                                                            <span>Best Deal</span>
                                                            <b>Bulk</b>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-products-placeholder">
                                <p>New items arriving soon in {category}!</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <div className="wholesale-global-action">
                <button className="bulk-inquiry-btn" onClick={() => window.open('https://wa.me/91XXXXXXXXXX', '_blank')}>
                    <span className="btn-icon">⚡</span>
                    Connect for Bulk Wholesale Inquiry
                </button>
            </div>
        </section>
    );
};

export default HomeCategories;
