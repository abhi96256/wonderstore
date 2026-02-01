import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config"; // Adjust path if needed

const WishlistManagement = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchWishlists = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "wishlist"));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishlist(items);
      setLoading(false);
    };
    fetchWishlists();
  }, []);

  // Filtered wishlist by search
  const filteredWishlist = wishlist.filter(item =>
    item.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    item.productName?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by userEmail
  const grouped = filteredWishlist.reduce((acc, item) => {
    if (!acc[item.userEmail]) acc[item.userEmail] = [];
    acc[item.userEmail].push(item);
    return acc;
  }, {});

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
      <h2 style={{ marginBottom: 24 }}>All Users' Wishlists</h2>
      <input
        type="text"
        placeholder="Search by user email or product name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: 350, padding: 10, marginBottom: 32, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
      />
      {Object.keys(grouped).length === 0 && <p>No wishlists found.</p>}
      {Object.entries(grouped).map(([email, items]) => (
        <div key={email} style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: 16 }}>
          <h3 style={{ color: "#333" }}>{email}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {items.map((item, idx) => (
              <div key={item.id} style={{ minWidth: 240, maxWidth: 260, background: "#fafafa", borderRadius: 6, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <img src={item.image ? '/' + item.image.split(',')[0].trim() : ''} alt={item.productName} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 4, marginBottom: 12 }} />
                <div style={{ fontWeight: 600, fontSize: 16 }}>{item.productName}</div>
                <div style={{ color: "#888", fontSize: 14 }}>{item.category}</div>
                <div style={{ color: "#222", fontWeight: 600, margin: "6px 0" }}>₹{item.price}</div>
                <div style={{ fontSize: 13, color: '#555' }}>Product ID: {item.productId}</div>
                <div style={{ fontSize: 13, color: '#555' }}>Added: {item.addedAt && item.addedAt.seconds ? new Date(item.addedAt.seconds * 1000).toLocaleString() : 'N/A'}</div>
                <div style={{ fontSize: 13, color: '#555' }}>Wishlist ID: {item.id}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistManagement; 