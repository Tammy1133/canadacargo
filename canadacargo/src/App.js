import React, { lazy, useEffect, useState } from "react";
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
import { AppContext } from "./context/appcontext.js";
import { getUserDetails } from "./projectcomponents/auth.jsx";
import axios from "axios";
import { EditShipmentPage } from "./projectpages/UserPages/editshipmentPage.jsx";

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
    if (currentPath.includes("/app")) {
      const userDetails = localStorage.getItem("userdetails");

      if (!userDetails) {
        window.location.href = "/"; // Redirect to homepage
      }
    }
  }
  const [userToken, setUserToken] = useState(getUserDetails()?.token);
  const [userDetails, setUserDetails] = useState(getUserDetails()?.userDetails);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [userModules, setUserModules] = useState(false);

  const getActiveModules = async (email) => {
    try {
      // alert("Running");
      setModulesLoading(true);

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/getActiveModules?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUserModules(JSON.parse(response?.data?.modules[0]?.modules));

      setModulesLoading(false);
    } catch (error) {
      setModulesLoading(false);
      console.error(
        "Error fetching active modules:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    getActiveModules(userDetails?.email);
  }, [userDetails]);

  useEffect(() => {
    setInterval(() => {
      checkUserAccess();
      checkSessionTimeout();
    }, 2000);
  }, []);

  return (
    <>
      <AppContext.Provider
        value={{
          modulesLoading,
          userModules,
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<Login></Login>} />
            <Route path="/login" element={<Login />} />
            <Route path="/editshipment/:id" element={<EditShipmentPage />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otherprovince/:id" element={<OtherProvince />} />

            {/* Place new routes over this */}
            <Route path="/app/*" element={<Layout />} />
          </Routes>
        </Router>
      </AppContext.Provider>
    </>
  );
  s;
}

export default App;
