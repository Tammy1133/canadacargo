import LeftSidebar from "./LeftSidebar";
import Header from "./Header";
import { Route, Routes } from "react-router-dom";
import routes from "../routes";
import { Suspense, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import SidebarSubmenu from "./SidebarSubmenu";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { useDispatch, useSelector } from "react-redux";
import { themeChange } from "theme-change";
import React, { useEffect, useState } from "react";
import BellIcon from "@heroicons/react/24/outline/BellIcon";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import { openRightDrawer } from "../features/common/rightDrawerSlice";
import { RIGHT_DRAWER_TYPES } from "../utils/globalConstantUtil";

function Layout() {
  // Reference for main content
  const mainContentRef = useRef(null);

  // Redux hooks
  const dispatch = useDispatch();
  const { noOfNotifications, pageTitle } = useSelector((state) => state.header);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme")
  );

  // Effect for theme initialization
  useEffect(() => {
    themeChange(false);
    if (currentTheme === null) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setCurrentTheme("dark");
      } else {
        setCurrentTheme("light");
      }
    }
    // 👆 false parameter is required for react project
  }, []);

  // Opening right sidebar for notification
  const openNotification = () => {
    dispatch(
      openRightDrawer({
        header: "Notifications",
        bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION,
      })
    );
  };

  // Logout function
  function logoutUser() {
    localStorage.clear();
    window.location.href = "/";
  }

  // Hook for current location
  const location = useLocation();

  // Close function for sidebar
  const close = (e) => {
    document.getElementById("left-sidebar-drawer").click();
  };

  return (
    <>
      {/* Main drawer structure */}
      <div className="drawer lg:drawer-open">
        <input
          id="left-sidebar-drawer"
          type="checkbox"
          className="drawer-toggle"
        />
        <div className="drawer-content flex flex-col ">
          {/* Navbar section */}
          <div className="navbar sticky top-0 bg-base-100  z-10 shadow-md ">
            {/* Menu toggle for mobile view or small screen */}
            <div className="flex-1">
              <label
                htmlFor="left-sidebar-drawer"
                className="btn btn-primary drawer-button lg:hidden"
              >
                <Bars3Icon className="h-5 inline-block w-5" />
              </label>
              <h1 className="text-2xl font-semibold ml-2">{pageTitle}</h1>
            </div>

            <div className="flex-none ">
              {/* Notification icon */}
              <button
                className="btn btn-ghost ml-4  btn-circle"
                onClick={() => openNotification()}
              >
                <div className="indicator">
                  <BellIcon className="h-6 w-6" />
                  {noOfNotifications > 0 ? (
                    <span className="indicator-item badge badge-secondary badge-sm">
                      {noOfNotifications}
                    </span>
                  ) : null}
                </div>
              </button>

              {/* Profile icon, opening menu on click */}
              <div className="dropdown dropdown-end ml-4 mr-7">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
                    <img src="/images/profile.png" alt="profile" />
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="menu menu-compact-0 dropdown-content  p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a>Acount</a>
                  </li>
                  <li>
                    <a onClick={logoutUser}>Logout</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* Main content area */}
          <main
            className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-slate-50"
            ref={mainContentRef}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {routes.map((route, key) => {
                  return (
                    <Route
                      key={key}
                      path={`${route.path}`}
                      element={<route.component />}
                    />
                  );
                })}
              </Routes>
            </Suspense>
            <div className="h-16"></div>
          </main>
        </div>

        <div className="drawer-side  z-30  ">
          <label
            htmlFor="left-sidebar-drawer"
            className="drawer-overlay"
          ></label>
          <ul className="menu  pt-2 w-80 bg-base-100 min-h-full   text-base-content">
            <button
              className="btn btn-ghost bg-base-300  btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden"
              onClick={() => close()}
            >
              <XMarkIcon className="h-5 inline-block w-5" />
            </button>

            <img
              className="mx-auto mt-2 mb-8 w-[150px]"
              src="/images/canadalogo.png"
              alt="Canada Cargo Logo"
            />
            {routes.map((route, k) => {
              return (
                <li className="" key={k}>
                  {route.submenu ? (
                    <SidebarSubmenu {...route} />
                  ) : (
                    <NavLink
                      end
                      to={`/app${route.path}`}
                      className={({ isActive }) =>
                        `${
                          isActive
                            ? "font-semibold  bg-base-200 "
                            : "font-normal"
                        }`
                      }
                    >
                      {route.icon} {route.name}
                      {location.pathname === route.path ? (
                        <span
                          className="absolute inset-y-0 left-0 w-1 rounded-tr-md rounded-br-md bg-primary "
                          aria-hidden="true"
                        ></span>
                      ) : null}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Sidebar section */}
      <div className="drawer-side z-30">
        <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
        <ul className="menu pt-2 w-80 bg-base-100 min-h-full text-base-content">
          <button
            className="btn btn-ghost bg-base-300 btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden"
            onClick={() => close()}
          >
            <XMarkIcon className="h-5 inline-block w-5" />
          </button>

          <img
            className="mx-auto mt-2 mb-8 w-[150px]"
            src="/images/canadalogo.png"
            alt="Canada Cargo Logo"
          />
          {routes.map((route, k) => {
            return (
              <li key={k}>
                {route.submenu ? (
                  <SidebarSubmenu {...route} />
                ) : (
                  <NavLink
                    end
                    to={route.path}
                    className={({ isActive }) =>
                      `${
                        isActive ? "font-semibold bg-base-200" : "font-normal"
                      }`
                    }
                  >
                    {route.icon} {route.name}
                    {location.pathname === route.path ? (
                      <span
                        className="absolute inset-y-0 left-0 w-1 rounded-tr-md rounded-br-md bg-primary"
                        aria-hidden="true"
                      ></span>
                    ) : null}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default Layout;
