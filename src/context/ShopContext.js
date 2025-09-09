import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ShopContext = createContext(null);

const STORAGE_KEYS = {
  cart: "foodstall_cart",
  wishlist: "foodstall_wishlist"
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function ShopProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => readStorage(STORAGE_KEYS.cart, []));
  const [wishlistItems, setWishlistItems] = useState(() => readStorage(STORAGE_KEYS.wishlist, []));
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => writeStorage(STORAGE_KEYS.cart, cartItems), [cartItems]);
  useEffect(() => writeStorage(STORAGE_KEYS.wishlist, wishlistItems), [wishlistItems]);

  const addToCart = (item, quantity = 1) => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      // not logged in: blink header auth buttons and show modal
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
        // Also blink the cart button
        const cartBtn = document.querySelector('[title="Cart"]');
        if (cartBtn) {
          cartBtn.classList.add('blink-highlight');
          setTimeout(() => cartBtn.classList.remove('blink-highlight'), 3000);
        }
      } catch {}
      // Show auth modal instead of redirecting
      setShowAuthModal(true);
      return;
    }
    setCartItems(prev => {
      const exists = prev.find(p => p.itemId === item._id || p.itemId === item.itemId);
      if (exists) {
        return prev.map(p => p.itemId === (item._id || item.itemId) ? { ...p, quantity: p.quantity + quantity } : p);
      }
      return [
        ...prev,
        {
          itemId: item._id || item.itemId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity
        }
      ];
    });
  };

  const updateCartQuantity = (itemId, quantity) => {
    setCartItems(prev => prev.map(p => p.itemId === itemId ? { ...p, quantity } : p));
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(p => p.itemId !== itemId));
  };

  const clearCart = () => setCartItems([]);

  const addToWishlist = (item) => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
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
        // Also blink the wishlist button
        const wishlistBtn = document.querySelector('[title="Wishlist"]');
        if (wishlistBtn) {
          wishlistBtn.classList.add('blink-highlight');
          setTimeout(() => wishlistBtn.classList.remove('blink-highlight'), 3000);
        }
      } catch {}
      // Show auth modal instead of redirecting
      setShowAuthModal(true);
      return;
    }
    setWishlistItems(prev => prev.some(p => p.itemId === (item._id || item.itemId)) ? prev : [
      ...prev,
      {
        itemId: item._id || item.itemId,
        name: item.name,
        price: item.price,
        image: item.image
      }
    ]);
  };

  const removeFromWishlist = (itemId) => {
    setWishlistItems(prev => prev.filter(p => p.itemId !== itemId));
  };

  const value = useMemo(() => ({
    cartItems,
    wishlistItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    showAuthModal,
    setShowAuthModal
  }), [cartItems, wishlistItems, showAuthModal]);

  return (
    <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}


