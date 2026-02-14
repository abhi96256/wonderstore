import React, { useEffect, useState } from 'react';
import { db } from './firebase/config';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

const SeedData = () => {
    const [status, setStatus] = useState('Initializing seeding...');

    const uniqueProducts = [
        {
            product_name: "Nebula Glass Speaker",
            category: "Unique Speaker",
            product_code: "US-001",
            product_description: "A minimalist speaker featuring a stunning space-themed nebula design with premium sound.",
            mrp: 12999,
            inventory: 15,
            image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
            featured: true,
            views: 120,
            bought: 5
        },
        {
            product_name: "Artisanal Wooden Speaker",
            category: "Unique Speaker",
            product_code: "US-002",
            product_description: "Hand-crafted mechanical speaker made from sustainably sourced walnut wood.",
            mrp: 18500,
            inventory: 8,
            image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800",
            featured: true,
            views: 85,
            bought: 2
        },
        {
            product_name: "Levitating Moon Lamp",
            category: "Lamps",
            product_code: "LM-003",
            product_description: "A 3D printed lunar lamp that floats and rotates in mid-air above its elegant wooden base.",
            mrp: 7500,
            inventory: 20,
            image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800",
            featured: true,
            views: 250,
            bought: 12
        },
        {
            product_name: "Smart Mist Humidifier",
            category: "Humidifier",
            product_code: "HM-004",
            product_description: "High-tech humidifier with customizable mist levels, perfect for maintaining ideal humidity.",
            mrp: 4200,
            inventory: 30,
            image: "https://images.unsplash.com/photo-1585771724684-252702b644a4?w=800",
            featured: false,
            views: 500,
            bought: 45
        },
        {
            product_name: "Aroma Diffuser Humidifier",
            category: "Humidifier",
            product_code: "HM-005",
            product_description: "Sustainable bamboo wood humidifier with high-fidelity mist and a 12-hour duration.",
            mrp: 5999,
            inventory: 12,
            image: "https://images.unsplash.com/photo-1602928294221-441f7ac5acd3?w=800",
            featured: true,
            views: 140,
            bought: 8
        },
        {
            product_name: "Premium Herbal Gulal Pack",
            category: "Holi Special",
            product_code: "HS-001",
            product_description: "Set of 5 vibrant, skin-friendly herbal colors made from natural extracts.",
            mrp: 499,
            inventory: 100,
            image: "https://images.unsplash.com/photo-1590059393394-d652701469e3?w=800",
            featured: true,
            views: 350,
            bought: 45
        },
        {
            product_name: "Crystal Color Water Blaster",
            category: "Holi Special",
            product_code: "HS-002",
            product_description: "High-pressure, transparent water gun for the ultimate Holi battle.",
            mrp: 899,
            inventory: 50,
            image: "https://images.unsplash.com/photo-1518131348358-18eb9898083a?w=800",
            featured: true,
            views: 280,
            bought: 30
        },
        {
            product_name: "Eco-Friendly Holi Hamper",
            category: "Holi Special",
            product_code: "HS-003",
            product_description: "Complete Holi kit including herbal gulal, wet colors, and a protective hair oil.",
            mrp: 1499,
            inventory: 25,
            image: "https://images.unsplash.com/photo-1590059393394-d652701469e3?w=800",
            featured: true,
            views: 420,
            bought: 20
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
                setStatus('Success! Your Wonder Cart is now populated with products. You can close this page.');
            } catch (error) {
                console.error("Error seeding data:", error);
                setStatus('Error: ' + error.message);
            }
        };
        seed();
    }, []);

    return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>
            <h2>🌱 Wonder Cart Seeder</h2>
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
