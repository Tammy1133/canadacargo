import { Route, Routes } from "react-router-dom";
import { Suspense, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { useDispatch, useSelector } from "react-redux";
import { themeChange } from "theme-change";
import React, { useEffect, useState } from "react";
import BellIcon from "@heroicons/react/24/outline/BellIcon";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import TruckIcon from "@heroicons/react/24/outline/TruckIcon";
import UserCircleIcon from "@heroicons/react/24/outline/UserCircleIcon";
import UserPlusIcon from "@heroicons/react/24/outline/UserPlusIcon";
import Dashboard from "../Adminpages/dashboard";
import SidebarSubmenu from "../AdminComponents/sidebarsubmenu";
import Transactions from "../../features/transactions";
import { AddNewShipment } from "../UserPages/addNewShipment";
import PendingWeighments from "../UserPages/pendingWeighment";
import NewUser from "../Adminpages/Account/newuser";
import UserDashboard from "../UserPages/userdashboard";
import { NewUserEdit } from "../Adminpages/newuseredit";
import GenerateBarcode from "../UserPages/generatebarcode";
import ScanningBarcode from "../UserPages/scanningBarcode";
import {
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  ArrowTrendingUpIcon,
  CameraIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDoubleDownIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CogIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  UserGroupIcon,
  ArchiveBoxIcon,
  InboxArrowDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import PendingPayments from "../UserPages/pendingpayments";
import OutOfOffice from "../UserPages/outofoffice";
import InTransit from "../UserPages/intransit";
import Arrivals from "../UserPages/arrivals";
import Completed from "../UserPages/completed";
import MarkInTransit from "../UserPages/markintransit";
import { Configurations } from "../UserPages/configurations";
import CompletedPayments from "../UserPages/completedPayments";
import AllShipments from "../UserPages/allShipments";
import { EditShipment } from "../UserPages/editShipment";
import AllShipmentEdit from "../UserPages/addNewShipmentEdit";
import RevenueReport from "../Adminpages/revenue_report";
import ShipmentReport from "../Adminpages/shipment_report";

function Layout() {
  const mainContentRef = useRef(null);
  const iconClasses = `h-6 w-6`;
  const [pageName, setPageName] = useState("");
  function logoutUser() {
    localStorage.clear();
    window.location.href = "/";
    localStorage.removeItem("timeLoggedIn");
  }
  const location = useLocation();
  const routes = [
    {
      path: "/dashboard",
      icon: <Squares2X2Icon className={iconClasses} />,
      name: "Dashboard",
      component: Dashboard,
    },
    {
      path: "/userdashboard",
      icon: <UserCircleIcon className={iconClasses} />,
      name: "User Dashboard",
      component: UserDashboard,
    },

    {
      path: "/newuser",
      icon: <UserPlusIcon className={iconClasses} />,
      name: "New User",
      component: NewUser,
    },
    {
      path: "/newuseredit",
      icon: <UserGroupIcon className={iconClasses} />,
      name: "Manage User Accounts",
      component: NewUserEdit,
    },

    {
      path: "/allshipments",
      icon: <ClipboardDocumentCheckIcon className={iconClasses} />,
      name: "All Shipments",
      component: AllShipments,
    },
    {
      path: "/allshipmentedit",
      icon: <PencilSquareIcon className={iconClasses} />,
      name: "Edit Shipment",
      component: AllShipmentEdit,
    },

    {
      path: "/newshipment",
      icon: <TruckIcon className={iconClasses} />,
      name: "New Shipment",
      component: AddNewShipment,
    },
    {
      path: "/pendingweighments",
      icon: <UserGroupIcon className={iconClasses} />,
      name: "Pending Weighment",
      component: PendingWeighments,
    },
    {
      path: "/pendingpayments",
      icon: <CreditCardIcon className={iconClasses} />,
      name: "Pending Payments",
      component: PendingPayments,
    },
    {
      path: "/completedpayments",
      icon: <CheckIcon className={iconClasses} />,
      name: "Completed Payments",
      component: CompletedPayments,
    },
    {
      path: "/generatecode",
      icon: <DocumentTextIcon className={iconClasses} />,
      name: "Generate Barcode",
      component: GenerateBarcode,
    },
    {
      path: "/outofoffice",
      icon: <ArrowRightOnRectangleIcon className={iconClasses} />,
      name: "Out Of Office",
      component: OutOfOffice,
    },

    {
      path: "/markintransit",
      icon: <ArrowPathIcon className={iconClasses} />,
      name: "Mark In Transit",
      component: MarkInTransit,
    },

    {
      path: "/intransit",
      icon: <TruckIcon className={iconClasses} />,
      name: "In Transit",
      component: InTransit,
    },
    {
      path: "/arrivals",
      icon: <InboxArrowDownIcon className={iconClasses} />,
      name: "Arrivals",
      component: Arrivals,
    },

    // {
    //   path: "/completed",
    //   icon: <CheckCircleIcon className={iconClasses} />,
    //   name: "Completed",
    //   component: Completed,
    // },

    {
      path: "/scanning",
      icon: <CameraIcon className={iconClasses} />,
      name: "Scan Barcode",
      component: ScanningBarcode,
    },
    {
      path: "/Configurations",
      icon: <CogIcon className={iconClasses} />,
      name: "Configurations",
      component: Configurations,
    },
    {
      path: "/revenuereport",
      icon: <ArrowTrendingUpIcon className={iconClasses} />,
      name: "Revenue Report",
      component: RevenueReport,
    },
    {
      path: "/shipmentreport",
      icon: <ChartBarIcon className={iconClasses} />,
      name: "Shipment Report",
      component: ShipmentReport,
    },

    // End User Routes
  ];

  useEffect(() => {
    // Find the route that matches the current path
    const currentRoute = routes.find(
      (route) => `/app${route.path}` === location.pathname
    );

    // console.log(currentRoute);

    // Dispatch the name of the current route as the pageTitle
    if (currentRoute) {
      setPageName(currentRoute.name);
    } else {
      setPageName("");
    }
  }, [location, routes]);

  // Redux hooks
  const dispatch = useDispatch();
  const { noOfNotifications, pageTitle } = useSelector((state) => state.header);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme")
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  // Close function for sidebar
  const close = (e) => {
    document.getElementById("left-sidebar-drawer").click();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              <h1 className="text-2xl font-semibold ml-2">{pageName}</h1>
            </div>

            <div className="flex-none ">
              {/* Notification icon */}
              <div className="relative">
                {/* <button
                  className="btn btn-ghost ml-4 btn-circle"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="indicator">
                    <BellIcon className="h-6 w-6" />
                    {noOfNotifications > 0 ? (
                      <span className="indicator-item badge badge-secondary badge-sm">
                        {noOfNotifications}
                      </span>
                    ) : null}
                  </div>
                </button> */}
                {/* {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 min-w-[300px] bg-white shadow-lg rounded-md z-50"
                  >
                    <ul className="py-2">
                      <li className="px-4 py-2 hover:bg-gray-100">
                        Notification 1
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100">
                        Notification 2
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100">
                        Notification 3
                      </li>
                    </ul>
                  </div>
                )} */}
              </div>

              {/* Profile icon, opening menu on click */}
              <div
                tabIndex={0}
                className="dropdown !flex items-center dropdown-end ml-4 mr-7 cursor-pointer"
              >
                <label
                  tabIndex={0}
                  className="btn btn-ghost !flex btn-circle avatar items-center"
                >
                  <div className="w-10 rounded-full">
                    <img src="/images/profile.png" alt="profile" />
                  </div>
                </label>
                <span className="ml-2">John Doe</span>
                <svg
                  className="w-4 h-4 ml-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <ul
                  tabIndex={0}
                  className="menu menu-compact-0 mt-4 top-8 dropdown-content p-2  bg-base-100 rounded-box w-52 flex flex-col !shadow-2xl"
                >
                  <li className="flex justify-between">
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
          <ul className="menu  pt-2 pb-10 w-80 bg-base-100 min-h-full   text-base-content">
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
