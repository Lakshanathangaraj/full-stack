import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { email, password } = loginData;

    if (!email || !password) {
      setMessage("❌ Both email and password are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Login successful!!");

        // role may come as data.role OR data.user.role depending on backend
        const role = data.role || data.user?.role;

        if (!role) {
          setMessage("❌ Role not found in response.");
          return;
        }

        try {
          // Persist essentials for later (e.g., fetching user orders by email)
          if (data.user?.email || email) {
            localStorage.setItem("userEmail", data.user?.email || email);
          }
        } catch {}

        onLoginSuccess(role);

        // Navigation will be handled by onLoginSuccess -> App routes ("/admin" or "/user")
      } else {
        setMessage(`❌ ${data.message || "Invalid credentials."}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Network error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={loginData.email}
        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={loginData.password}
        onChange={(e) =>
          setLoginData({ ...loginData, password: e.target.value })
        }
      />
      <button onClick={handleLogin}>Login</button>

      {message && <p className="message">{message}</p>}

      <p className="signup-link">
        Don't have an account?{" "}
        <span onClick={() => navigate("/signup")} style={{ color: "blue", cursor: "pointer" }}>
          Sign up here
        </span>
      </p>
    </div>
  );
}
