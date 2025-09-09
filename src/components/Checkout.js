import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useShop();
  const [customer, setCustomer] = useState({
    fname: "",
    lname: "",
    email: localStorage.getItem("userEmail") || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
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
    if (cartItems.length === 0) return;
    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(it => ({ itemId: it.itemId, quantity: it.quantity })),
          customer: { ...customer, email: localStorage.getItem("userEmail") || customer.email },
          paymentMethod
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Failed to place order" }));
        alert(err.message || "Failed to place order");
        setSubmitting(false);
        return;
      }
      const order = await response.json();
      clearCart();
      alert(`Order placed! Total: $${order.total}`);
      navigate(`/user`);
    } catch (err) {
      console.error(err);
      alert("Network error while placing order");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Checkout</h2>
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr", maxWidth: 720 }}>
        <form onSubmit={placeOrder} style={{ background: "#fff", borderRadius: 12, padding: "1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          <h3>Customer Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <input name="fname" placeholder="First Name" value={customer.fname} onChange={handleChange} required />
            <input name="lname" placeholder="Last Name" value={customer.lname} onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" value={customer.email} onChange={handleChange} required />
            <input name="phone" placeholder="Phone" value={customer.phone} onChange={handleChange} required />
            <input name="addressLine1" placeholder="Address Line 1" value={customer.addressLine1} onChange={handleChange} required style={{ gridColumn: "1 / span 2" }} />
            <input name="addressLine2" placeholder="Address Line 2" value={customer.addressLine2} onChange={handleChange} style={{ gridColumn: "1 / span 2" }} />
            <input name="city" placeholder="City" value={customer.city} onChange={handleChange} required />
            <input name="state" placeholder="State" value={customer.state} onChange={handleChange} required />
            <input name="pincode" placeholder="Pincode" value={customer.pincode} onChange={handleChange} required />
          </div>

          <h3 style={{ marginTop: "1rem" }}>Payment Method</h3>
          <div style={{ display: "flex", gap: "1rem", marginTop: 8 }}>
            <label><input type="radio" name="pm" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} /> Online</label>
            <label><input type="radio" name="pm" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> Card</label>
            <label><input type="radio" name="pm" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /> Cash on Delivery</label>
          </div>

          <div style={{ marginTop: "1rem", background: "#fff", borderRadius: 12, padding: "0.5rem 0", maxWidth: 420 }}>
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
          </div>

          <button className="order-btn" type="submit" disabled={submitting} style={{ marginTop: 16 }}>
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}


