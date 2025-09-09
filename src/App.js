import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Wishlist from "./components/Wishlist";
import Orders from "./components/Orders";

function SignupWrapper() {
  const navigate = useNavigate();
  const handleSignupSuccess = () => navigate("/login");
  return <Signup onSignupSuccess={handleSignupSuccess} />;
}

function LoginWrapper() {
  const navigate = useNavigate();
  const handleLoginSuccess = (role) => {
    localStorage.setItem("userRole", role);
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/user");
    }
  };
  return <Login onLoginSuccess={handleLoginSuccess} />;
}

function ProtectedRoute({ children, requiredRole }) {
  const userRole = localStorage.getItem("userRole");
  
  if (!userRole) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === "admin" ? "/admin" : "/user"} />;
  }
  
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/user" />} />
      <Route path="/signup" element={<SignupWrapper />} />
      <Route path="/login" element={<LoginWrapper />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user" 
        element={<UserDashboard />} 
      />
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute requiredRole="user">
            <Cart />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute requiredRole="user">
            <Checkout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wishlist" 
        element={
          <ProtectedRoute requiredRole="user">
            <Wishlist />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute requiredRole="user">
            <Orders />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
