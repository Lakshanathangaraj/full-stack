import React from "react";
import { useNavigate } from "react-router-dom";
import "./AuthModal.css";

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  const handleSignup = () => {
    onClose();
    navigate("/signup");
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>🔐 Authentication Required</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="auth-modal-content">
          <p>Please login or sign up to continue with this action.</p>
          
          <div className="auth-modal-buttons">
            <button className="auth-btn login-btn" onClick={handleLogin}>
              Login
            </button>
            <button className="auth-btn signup-btn" onClick={handleSignup}>
              Sign Up
            </button>
          </div>
          
          <p className="auth-modal-note">
            New users should sign up first, then login to access all features.
          </p>
        </div>
      </div>
    </div>
  );
}

