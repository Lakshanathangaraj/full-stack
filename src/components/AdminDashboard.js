import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("menu");
  const [foodItems, setFoodItems] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: 0
  });
  const navigate = useNavigate();

  // Fetch food items
  const fetchFoodItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/food-items");
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  // Fetch stock items
  const fetchStockItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stock");
      const data = await response.json();
      setStockItems(data);
    } catch (error) {
      console.error("Error fetching stock items:", error);
    }
  };

  useEffect(() => {
    fetchFoodItems();
    fetchStockItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/food-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchFoodItems();
        fetchStockItems();
        setFormData({ name: "", description: "", price: "", category: "", image: "", stock: 0 });
        setShowAddForm(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddForm(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/food-items/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchFoodItems();
        fetchStockItems();
        setFormData({ name: "", description: "", price: "", category: "", image: "", stock: 0 });
        setShowAddForm(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/food-items/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchFoodItems();
          fetchStockItems();
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Food Stall Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <nav className="admin-nav">
        <button 
          className={activeTab === "menu" ? "active" : ""} 
          onClick={() => setActiveTab("menu")}
        >
          Menu Management
        </button>
        <button 
          className={activeTab === "stock" ? "active" : ""} 
          onClick={() => setActiveTab("stock")}
        >
          Stock Management
        </button>
      </nav>

      {activeTab === "menu" && (
        <div className="menu-management">
          <div className="menu-header">
            <h2>Menu Items</h2>
            <button 
              className="add-btn" 
              onClick={() => {
                setShowAddForm(true);
                setEditingItem(null);
                setFormData({ name: "", description: "", price: "", category: "", image: "", stock: 0 });
              }}
            >
              Add New Item
            </button>
          </div>

          {showAddForm && (
            <div className="add-form-overlay">
              <div className="add-form">
                <h3>{editingItem ? "Edit Item" : "Add New Item"}</h3>
                <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="fast-food">Fast Food</option>
                    <option value="dessert">Dessert</option>
                    <option value="snacks">Snacks</option>
                    <option value="soups">Soups</option>
                    <option value="salads">Salads</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                  <div className="form-buttons">
                    <button type="submit">{editingItem ? "Update" : "Add"}</button>
                    <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="menu-grid">
            {foodItems.map((item) => (
              <div key={item._id} className="menu-item">
                <img src={item.image || "/placeholder-food.svg"} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <p className="price">${item.price}</p>
                  <p className="category">{item.category.replace('-', ' ').toUpperCase()}</p>
                  <p className="stock">Stock: {item.stock}</p>
                  <div className="item-actions">
                    <button onClick={() => handleEditItem(item)}>Edit</button>
                    <button onClick={() => handleDeleteItem(item._id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "stock" && (
        <div className="stock-management">
          <h2>Stock Management</h2>
          <div className="stock-grid">
            {stockItems.map((item) => (
              <div key={item._id} className="stock-item">
                <img src={item.image || "/placeholder-food.svg"} alt={item.name} />
                <div className="stock-details">
                  <h3>{item.name}</h3>
                  <p className="stock-quantity">Stock: {item.stock}</p>
                  <p className="category">{item.category.replace('-', ' ').toUpperCase()}</p>
                  <div className="stock-actions">
                    <button 
                      onClick={async () => {
                        const newStock = prompt("Enter new stock quantity:", item.stock);
                        if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
                          try {
                            const response = await fetch(`http://localhost:5000/api/stock/${item._id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ stock: parseInt(newStock) }),
                            });

                            if (response.ok) {
                              fetchStockItems();
                              fetchFoodItems();
                              alert("Stock updated successfully!");
                            } else {
                              alert("Failed to update stock");
                            }
                          } catch (error) {
                            console.error("Error updating stock:", error);
                            alert("Error updating stock");
                          }
                        }
                      }}
                    >
                      Update Stock
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
