import React, { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const res = await fetch(`http://localhost:5000/api/orders?email=${encodeURIComponent(email || "")}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order._id} style={{ background: '#fff', borderRadius: 12, padding: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ margin: 0 }}>Order #{order._id.slice(-6)}</h3>
                <strong style={{ color: '#e91e63' }}>${order.total}</strong>
              </div>
              <div style={{ color: '#666', marginTop: 4 }}>
                {new Date(order.createdAt).toLocaleString()} • {String(order.paymentMethod || '').toUpperCase()}
              </div>
              <div style={{ marginTop: 8 }}>
                {order.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{it.name} × {it.quantity}</span>
                    <span>${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


