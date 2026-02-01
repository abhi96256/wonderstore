import React, { useEffect, useState } from 'react';
import { db } from './firebase/config';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

const SeedData = () => {
    const [status, setStatus] = useState('Initializing seeding...');

    const uniqueProducts = [
        {
            product_name: "Nebula Glass Watch",
            category: "Luxury Tech",
            product_code: "NW-001",
            product_description: "A minimalist timepiece featuring a stunning space-themed nebula dial under premium scratch-resistant glass.",
            mrp: 12999,
            inventory: 15,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
            featured: true,
            views: 120,
            bought: 5
        },
        {
            product_name: "Artisanal Wooden Keyboard",
            category: "Tech Accessories",
            product_code: "WK-002",
            product_description: "Hand-crafted mechanical keyboard made from sustainably sourced walnut wood with premium tactile switches.",
            mrp: 18500,
            inventory: 8,
            image: "https://images.unsplash.com/photo-1587829741301-dc798b83aca1?w=800",
            featured: true,
            views: 85,
            bought: 2
        },
        {
            product_name: "Levitating Moon Lamp",
            category: "Home Decor",
            product_code: "LM-003",
            product_description: "A 3D printed lunar lamp that floats and rotates in mid-air above its elegant wooden base using magnetic levitation.",
            mrp: 7500,
            inventory: 20,
            image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800",
            featured: true,
            views: 250,
            bought: 12
        },
        {
            product_name: "Cyberpunk LED Goggles",
            category: "Luxury Tech",
            product_code: "CG-004",
            product_description: "High-tech eyewear with customizable LED patterns, perfect for futuristic fashion enthusiasts.",
            mrp: 4200,
            inventory: 30,
            image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=800",
            featured: false,
            views: 500,
            bought: 45
        },
        {
            product_name: "Bamboo Eco-Speaker",
            category: "Premium Audio",
            product_code: "BS-005",
            product_description: "Sustainable bamboo wood Bluetooth speaker with high-fidelity sound and a 12-hour battery life.",
            mrp: 5999,
            inventory: 12,
            image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
            featured: true,
            views: 140,
            bought: 8
        }
    ];

    useEffect(() => {
        const seed = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'products'));
                if (querySnapshot.size > 0) {
                    setStatus('Database already has products. Skipping seed to prevent duplicates.');
                    return;
                }

                setStatus('Uploading unique products...');
                for (const product of uniqueProducts) {
                    await addDoc(collection(db, 'products'), {
                        ...product,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }
                setStatus('Success! Your UniqueStore is now populated with products. You can close this page.');
            } catch (error) {
                console.error("Error seeding data:", error);
                setStatus('Error: ' + error.message);
            }
        };
        seed();
    }, []);

    return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>
            <h2>🌱 UniqueStore Seeder</h2>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>{status}</p>
            {status.includes('Success') && (
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Go to Homepage
                </button>
            )}
        </div>
    );
};

export default SeedData;
