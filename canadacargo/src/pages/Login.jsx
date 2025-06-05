import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Login from "../features/user/Login.jsx";

function ExternalPage() {
  return (
    <div className="login-container">
      <Login />
    </div>
  );
}

export default ExternalPage;
  