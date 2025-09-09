import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import AuthModal from "./AuthModal";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { addToCart, addToWishlist, cartItems, wishlistItems, showAuthModal, setShowAuthModal } = useShop();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  // Debug: Log userRole changes
  useEffect(() => {
    console.log('Current userRole:', userRole);
  }, [userRole]);

  // Fetch food items
  const fetchFoodItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/food-items");
      const data = await response.json();
      setFoodItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  // Update userRole when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('userRole'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAccountMenu && !event.target.closest('.account-menu-wrap')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountMenu]);


  // Filter items based on category and search term
  useEffect(() => {
    let filtered = foodItems;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [foodItems, selectedCategory, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    setUserRole(null);
    navigate("/login");
  };

  // Function to handle protected navigation
  const handleProtectedNavigation = (path) => {
    if (!userRole) {
      // Blink the header auth buttons and show auth modal
      try {
        // Blink the header auth buttons
        const loginBtn = document.querySelector('.header-login-btn');
        const signupBtn = document.querySelector('.header-signup-btn');
        if (loginBtn) {
          loginBtn.classList.add('blink-highlight');
          setTimeout(() => loginBtn.classList.remove('blink-highlight'), 3000);
        }
        if (signupBtn) {
          signupBtn.classList.add('blink-highlight');
          setTimeout(() => signupBtn.classList.remove('blink-highlight'), 3000);
        }
        // Also blink the specific button
        const targetBtn = document.querySelector(`[title="${path.charAt(1).toUpperCase() + path.slice(2)}"]`);
        if (targetBtn) {
          targetBtn.classList.add('blink-highlight');
          setTimeout(() => targetBtn.classList.remove('blink-highlight'), 3000);
        }
      } catch {}
      setShowAuthModal(true);
      return;
    }
    navigate(path);
  };

  const categories = [
    { value: "all", label: "All Items" },
    { value: "veg", label: "Veg" },
    { value: "non-veg", label: "Non-Veg" },
    { value: "fast-food", label: "Fast Food" },
    { value: "dessert", label: "Desserts" },
    { value: "snacks", label: "Snacks" },
    { value: "soups", label: "Soups" },
    { value: "salads", label: "Salads" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" }
  ];

  return (
    <div className="user-dashboard">
      <header className="user-header">
        <h1>🍽️ Food Stall</h1>
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="icon-btn" onClick={() => handleProtectedNavigation("/wishlist")} title="Wishlist">♡</button>
          <button className="icon-btn" onClick={() => handleProtectedNavigation("/cart")} title="Cart">🛒</button>
          <button className="icon-btn" onClick={() => handleProtectedNavigation("/orders")} title="Orders">📦</button>
          
          {/* Login/Signup icon in header - only show for non-logged users */}
          {(!userRole || userRole === null) && (
            <button
              className="icon-btn"
              onClick={() => setShowAccountMenu(s => !s)}
              title="Login/Signup"
            >
              <span role="img" aria-label="login">🔑</span>
            </button>
          )}
          
          <div className="account-menu-wrap">
            <button className="account-btn" onClick={() => setShowAccountMenu(s => !s)}>
              {userRole && userRole !== null ? `Welcome! ▾` : 'Login/Signup ▾'}
            </button>
            {showAccountMenu && (
              <div className="account-menu">
                {!userRole || userRole === null ? (
                  <>
                    <div className="auth-menu-header">
                      <h3>🔐 Authentication Required</h3>
                      <p>Login or Sign Up to continue</p>
                    </div>
                    <hr />
                    <button className="menu-login-btn" onClick={() => {
                      setShowAccountMenu(false);
                      navigate('/login');
                    }}>
                      🔑 Login
                    </button>
                    <button className="menu-signup-btn" onClick={() => {
                      setShowAccountMenu(false);
                      navigate('/signup');
                    }}>
                      ✨ Sign Up
                    </button>
                    <hr />
                    <p className="auth-note">New users should sign up first</p>
                  </>
                ) : (
                  <>
                    <button onClick={() => {
                      setShowAccountMenu(false);
                      handleProtectedNavigation('/orders');
                    }}>📦 Orders</button>
                    <button onClick={() => {
                      setShowAccountMenu(false);
                      handleProtectedNavigation('/wishlist');
                    }}>♡ Wishlist</button>
                    <hr />
                    <button onClick={() => {
                      setShowAccountMenu(false);
                      handleLogout();
                    }}>🚪 Logout</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>


      <div className="search-filter-section">
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category.value}
              className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <main className="menu-section">
        
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No items found matching your criteria.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item._id} className="menu-card">
                <div className="card-image">
                  <img 
                    src={item.image || "/placeholder-food.svg"} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = "/placeholder-food.svg";
                    }}
                  />
                  <div className="stock-badge">
                    {item.stock > 0 ? "In Stock" : "Out of Stock"}
                  </div>
                  {(() => {
                    const isWishlisted = wishlistItems.some(w => w.itemId === item._id);
                    return (
                      <button
                        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                        onClick={() => addToWishlist(item)}
                        title="Add to wishlist"
                      >
                        ♥
                      </button>
                    );
                  })()}
                </div>
                
                <div className="card-content">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <span className="price">${item.price}</span>
                  </div>
                  
                  <p className="description">{item.description}</p>
                  
                  <div className="item-footer">
                    <button 
                      className={`order-btn ${item.stock === 0 ? 'disabled' : ''}`}
                      disabled={item.stock === 0}
                      onClick={() => addToCart(item, 1)}
                    >
                      {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      

      <footer className="user-footer">
        <p>Made with ❤️ for food lovers</p>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
