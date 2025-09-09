import React from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, addToCart } = useShop();

  if (wishlistItems.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Wishlist</h2>
        <p>No items in wishlist.</p>
        <button className="order-btn" onClick={() => navigate("/user")}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Wishlist</h2>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {wishlistItems.map((item) => (
          <div key={item.itemId} style={{ background: "#fff", borderRadius: 12, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img src={item.image || "/placeholder-food.svg"} alt={item.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: "#e91e63", fontWeight: 700 }}>${item.price}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button className="category-btn" onClick={() => { addToCart(item, 1); navigate('/cart'); }}>Add to Cart</button>
              <button className="order-btn" onClick={() => removeFromWishlist(item.itemId)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


