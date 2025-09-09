import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

export default function Signup({ onSignupSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    password: "",
    cpassword: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState("");

  const fnamePattern = /^[A-Z][a-zA-Z]*$/;
  const emailPattern = /^[^ ]+@[^ ]+\.(com|edu)$/;
  const phonePattern = /^[69]\d{9}$/;
  const passPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,10}$/;

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "fname":
        if (!fnamePattern.test(value)) error = "Start with capital, only letters.";
        break;
      case "email":
        if (!emailPattern.test(value)) error = "Email must end with .com or .edu";
        break;
      case "phone":
        if (!phonePattern.test(value)) error = "Phone must start with 6 or 9 and be 10 digits.";
        break;
      case "password":
        if (!passPattern.test(value)) error = "6–10 chars with A-Z, a-z, special.";
        break;
      case "cpassword":
        if (value !== formData.password) error = "Passwords don't match.";
        break;
      default:
        if (!value) error = "This field is required.";
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSignup = async () => {
    Object.entries(formData).forEach(([key, val]) => validateField(key, val));

    const hasErrors = Object.values(formErrors).some((err) => err);
    const hasEmpty = Object.values(formData).some((val) => val.trim() === "");

    if (hasErrors || hasEmpty) {
      setMessage("❌ Please fill all fields correctly.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        fname: formData.fname,
        lname: formData.lname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "user" // Always register as user
      });
      setMessage("✅ Signup successful!! Please login to continue.");
      setTimeout(() => {
        onSignupSuccess();
        navigate("/login");
      }, 1500);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Signup failed."));
    }
  };

  return (
    <div className="signup-container">
      <h1 className="main-heading">FOOD STALL</h1>
      <h2>Signup</h2>

      <input
        name="fname"
        placeholder="First Name"
        value={formData.fname}
        onChange={handleChange}
      />
      {formErrors.fname && <span className="error">{formErrors.fname}</span>}

      <input
        name="lname"
        placeholder="Last Name"
        value={formData.lname}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      {formErrors.email && <span className="error">{formErrors.email}</span>}

      <input
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
      />
      {formErrors.phone && <span className="error">{formErrors.phone}</span>}

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      {formErrors.password && <span className="error">{formErrors.password}</span>}

      <input
        type="password"
        name="cpassword"
        placeholder="Confirm Password"
        value={formData.cpassword}
        onChange={handleChange}
      />
      {formErrors.cpassword && <span className="error">{formErrors.cpassword}</span>}

      <button onClick={handleSignup}>Sign Up</button>
      {message && <p className="message">{message}</p>}

      <p className="login-link">
        After signing up, you can{" "}
        <span onClick={() => navigate("/login")} style={{ color: "blue", cursor: "pointer" }}>
          Login here
        </span>
      </p>
    </div>
  );
}
