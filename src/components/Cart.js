import React from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateCartQuantity, removeFromCart } = useShop();

  const subtotal = cartItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const handleProceed = () => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      try {
        const el = document.querySelector('.account-btn');
        if (el) {
          el.classList.add('blink-highlight');
          setTimeout(() => el.classList.remove('blink-highlight'), 2000);
        }
      } catch {}
      navigate('/login');
      return;
    }
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
        <button className="order-btn" onClick={() => navigate("/user")}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Cart</h2>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {cartItems.map((item) => (
          <div key={item.itemId} style={{ background: "#fff", borderRadius: 12, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img src={item.image || "/placeholder-food.svg"} alt={item.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: "#e91e63", fontWeight: 700 }}>${item.price}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button className="category-btn" onClick={() => updateCartQuantity(item.itemId, Math.max(1, item.quantity - 1))}>-</button>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateCartQuantity(item.itemId, Math.max(1, parseInt(e.target.value || 1, 10)))}
                style={{ width: 64, textAlign: "center", padding: "0.25rem 0.5rem", borderRadius: 8, border: "2px solid #f8bbd9" }}
              />
              <button className="category-btn" onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}>+</button>
              <button className="order-btn" onClick={() => removeFromCart(item.itemId)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", background: "#fff", borderRadius: 12, padding: "1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span>Tax (5%)</span>
          <strong>${tax.toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: 8 }}>
          <span>Total</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
        <button className="order-btn" style={{ marginTop: 16, width: "100%" }} onClick={handleProceed}>Proceed to Checkout</button>
      </div>
    </div>
  );
}


