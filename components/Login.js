// src/components/Login.js
import React from "react";
import { signInWithGoogle } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Login.css";  // Import the CSS file

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/documents"); // Redirect to Document List Page after login
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Access Documents</h2>
      <button className="login-button" onClick={handleLogin}>
        Login with Google
      </button>
    </div>
  );
};

export default Login;
