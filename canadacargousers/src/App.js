import React, { lazy, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { themeChange } from "theme-change";
import checkAuth from "./app/auth";
import initializeApp from "./app/init";
import Login from "./projectpages/Authentication/login.jsx";
import Layout from "./projectpages/Layout/layout.jsx";

import "./datatablecss/dataTable1.css";
import "./datatablecss/datatable2.css";
import "./datatablecss/datatable3.css";
import { EditShipment } from "./projectpages/UserPages/editShipment.jsx";
import Swal from "sweetalert2";
import { OtherProvince } from "./projectpages/otherprovince.jsx";
import { TrackShipment } from "./projectpages/trackshipment.jsx";
import { ConfirmPayment } from "./projectpages/confirmPayment";

// Importing pages
// const Layout = lazy(() => import("./containers/Layout"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Register = lazy(() => import("./pages/Register"));

// Initializing different libraries
initializeApp();

function App() {
  useEffect(() => {
    themeChange(false);
  }, []);

  function checkSessionTimeout() {
    const timeLoggedIn = localStorage.getItem("timeLoggedIn");

    if (!timeLoggedIn) {
      // console.error("No login time found in localStorage.");
      return;
    }

    // Parse the stored time and get the current time
    const loggedInTime = new Date(timeLoggedIn);
    const currentTime = new Date();

    // console.log(loggedInTime, currentTime);

    // Calculate the time difference in milliseconds
    const timeDifference = currentTime - loggedInTime;

    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > 7) {
      localStorage.removeItem("timeLoggedIn");
      localStorage.clear();

      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "warning",
        confirmButtonText: "Log In",
      }).then(() => {
        localStorage.removeItem("timeLoggedIn");
        localStorage.clear();
        window.location.href = "/";
      });
    }
  }

  function checkUserAccess() {
    // Get the current URL path
    const currentPath = window.location.pathname;

    // console.log(currentPath);

    // Check if the path contains '/app'
    if (currentPath.includes("/app")) {
      // Check if 'userdetails' exists in localStorage
      const userDetails = localStorage.getItem("userdetails");

      // If userDetails doesn't exist, redirect to the homepage
      if (!userDetails) {
        window.location.href = "/"; // Redirect to homepage
      }
    }
  }

  // useEffect(() => {
  //   setInterval(() => {
  //     checkUserAccess();
  //     checkSessionTimeout();
  //   }, 2000);
  // }, []);

  return (
    <>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Login></Login>} />
          <Route path="/login" element={<Login />} />
          <Route path="/editshipment/:id" element={<EditShipment />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} /> */}
          <Route path="/" element={<OtherProvince />} />
          <Route path="/otherprovince/:id" element={<OtherProvince />} />
          <Route path="/trackshipment/:id" element={<TrackShipment />} />
          <Route path="/confirmpayment/:id" element={<ConfirmPayment />} />

          {/* Place new routes over this */}
          {/* <Route path="/app/*" element={<Layout />} /> */}
        </Routes>
      </Router>
    </>
  );
  s;
}

export default App;
