import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { PhoneIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

export const ConfirmPayment = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [boxNumber, setBoxNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [aptUnitNo, setAptUnitNo] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipmentInfo, setShipmentInfo] = useState({});
  const [shipmentItems, setShipmentItems] = useState([]);
  const [userToken, setUserToken] = useState("");
  const params = useParams();
  const [selectedProvince, setSelectedProvince] = useState("actions");
  const [transId, setTransactionId] = useState("");
  const [errorMessage, setErrorMessage] = useState("actions");
  const [activeTab, setActiveTab] = useState("actions");
  const [isLoading, setIsLoading] = useState("");
  const [idLoading, setIDLoading] = useState("");
  const provincesAndTerritories = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    // "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Northwest Territories",
    "Nunavut",
    "Yukon",
  ];

  useEffect(() => {
    setTransactionId(params?.id);
    checkTransactionExists();
  }, [params?.id]);

  const handleSubmit = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      setLoading(true);

      if (!transId) {
        throw new Error("Tracking Number is required");
      }
      if (!email) {
        throw new Error("Email is required");
      }
      const response = await axios.post(`${API_URL}/authenticateUserSide`, {
        email,
        trans_id: transId,
      });

      // console.log(response);

      setUserToken(response?.data?.userToken);

      // throw new Error("");

      setShipmentInfo(response.data.shipmentInfo);
      setShipmentItems(response.data.shipmentItems);

      setLoggedIn(true);

      setLoading(false);

      checkTransactionExists();
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.response ? error.response.data.message : error?.message,
      });
    }
  };

  const handleFormSubmit = async (e) => {
    try {
      e.preventDefault();

      //   console.log(!referenceNumber || !phoneNo);

      if (!referenceNumber || !phoneNo) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "All Details are required",
        });
        return;
      }

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to proceed with saving payment information?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, proceed",
        cancelButtonText: "No, cancel",
      });

      if (!result.isConfirmed) {
        return;
      }

      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/createPaymentResponse`,
        {
          transId,
          referenceNumber,
          phone: phoneNo,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      window.location.reload();

      setLoggedIn(false);

      Swal.fire({
        icon: "success",
        title: "Successful!",
        text: "Payment info saved successfully.",
      });

      setIsLoading(false);
      window.scrollTo(0, 0);
    } catch (error) {
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Error saving Payment info ",
        text: error.response?.data?.message || error.message,
      });

      console.error(
        "Error creating arrival response:",
        error.response?.data || error.message
      );
    }
  };

  const checkTransactionExists = async () => {
    try {
      setIDLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/checkPaymentTransactionExists`,
        {
          trans_id: transId,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);

      if (response.data?.exists) {
        if (response.data?.exists[1] !== 1) {
          setErrorMessage("Delivery information has been sent. ");
        }
      } else {
        setErrorMessage("");
      }

      setIDLoading(false);
    } catch (error) {
      console.log(
        "Error creating arrival response:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="provincebg overflow-x-hidden">
      <div className="w-screen bg-blue-50 py-2 px-7 flex justify-between items-center drop-shadow-xl">
        <img src="/images/canadalogo.png" alt="" className="w-[130px]" />
        <button className="bg-blue-600 px-3 !py-1 text-sm rounded-lg text-white hover:scale-[106%] transition-all">
          <a
            href="https://canadacargo.net/"
            className="text-white no-underline"
            target="_blank"
          >
            Go to website
          </a>
        </button>
      </div>
      {!loggedIn && (
        <div className="flex items-center justify-center min-h-[80vh] ">
          <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              Login to Proceed
            </h2>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              <div>
                <label
                  htmlFor="tracking"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tracking Number
                </label>
                <input
                  type="text"
                  id="tracking"
                  value={transId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                  }}
                  placeholder="Enter your tracking number"
                  className="w-full mt-1 px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Receiver/Sender Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="Enter your email"
                  className="w-full mt-1 px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                Proceed
              </button>
            </form>
          </div>
        </div>
      )}

      {loggedIn && !idLoading && (
        <div className="flex justify-center w-screen pt-[30px] pb-[100px] px-6">
          <div
            className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-auto max-h-[60vh]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-700">
                  Shipment Details
                </h2>
                <button
                  className="text-white hover:text-white bg-slate-950 px-2 py-1 rounded-lg shadow-xl hover:scale-[105%] transition-all"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Log out
                </button>
              </div>

              {/* Tab Navigation */}

              <div className="mt-4 flex space-x-4 border-b pb-3">
                <button
                  className={`${
                    activeTab === "actions" ? "text-blue-600" : "text-gray-600"
                  } hover:text-blue-600`}
                  onClick={() => setActiveTab("actions")}
                >
                  Actions
                </button>
                <button
                  className={`${
                    activeTab === "shipmentDetails"
                      ? "text-blue-600"
                      : "text-gray-600"
                  } hover:text-blue-600`}
                  onClick={() => setActiveTab("shipmentDetails")}
                >
                  Shipment Details
                </button>
                <button
                  className={`${
                    activeTab === "items" ? "text-blue-600" : "text-gray-600"
                  } hover:text-blue-600`}
                  onClick={() => setActiveTab("items")}
                >
                  Items
                </button>
              </div>

              {activeTab === "actions" &&
                (!errorMessage ? (
                  <div className="mt-6">
                    <h5>Enter payment details</h5>

                    <div className="">
                      <label className="block font-medium my-3">
                        Transaction Reference number
                      </label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 !bg-white !text-black"
                      />
                    </div>

                    <div>
                      <label className="block my-3 font-medium">
                        Phone no:
                      </label>
                      <input
                        type="text"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 !bg-white !text-black"
                      />
                    </div>
                    <button
                      type="button"
                      // disabled={isLoading}
                      className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                      onClick={(e) => {
                        handleFormSubmit(e);
                      }}
                    >
                      {isLoading ? "Loading.." : "Proceed"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="mt-5">Payment details have been sent.</h3>
                  </div>
                ))}

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === "shipmentDetails" && (
                  <div className="mt-6 space-y-6">
                    {/* Shipper Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        Shipper Information
                      </h3>
                      <div className="mt-2 text-gray-600 space-y-2">
                        <p>
                          <span className="font-semibold">Name:</span>{" "}
                          {shipmentInfo?.shipper_name || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          {shipmentInfo?.shipper_phone || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Address:</span>{" "}
                          {shipmentInfo?.shipper_address || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Email:</span>{" "}
                          {shipmentInfo?.shipper_email || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Receiver Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        Receiver Information
                      </h3>
                      <div className="mt-2 text-gray-600 space-y-2">
                        <p>
                          <span className="font-semibold">Name:</span>{" "}
                          {shipmentInfo?.receiver_name || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          {shipmentInfo?.receiver_phone || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Address:</span>{" "}
                          {shipmentInfo?.receiver_address || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold">Email:</span>{" "}
                          {shipmentInfo?.receiver_email || "N/A"}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700">
                      Other Information
                    </h3>
                    <div className="mt-2 text-gray-600 space-y-2">
                      <p>
                        <span className="font-semibold">Shipment Type:</span>{" "}
                        {shipmentInfo?.shipment_type || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Courier:</span>{" "}
                        {shipmentInfo?.courier || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Payment Mode:</span>{" "}
                        {shipmentInfo?.payment_mode || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Origin:</span>{" "}
                        {shipmentInfo?.origin || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Destination:</span>{" "}
                        {shipmentInfo?.destination || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Pickup Date:</span>{" "}
                        {shipmentInfo?.pickup_date || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Expected Delivery:
                        </span>{" "}
                        {shipmentInfo?.expected_date_delivery || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg mt-4 font-semibold text-gray-700">
                        Description
                      </h3>
                      <p className="mt-2 text-gray-600">
                        {shipmentInfo?.comments || "No Description provided."}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg mt-4 font-semibold text-gray-700">
                        Province
                      </h3>
                      <p className="mt-2 text-gray-600">
                        {shipmentInfo?.province || "No Province provided."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "items" && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Items
                    </h3>
                    <div className="overflow-x-auto shadow-md rounded-lg">
                      <table className="min-w-full table-auto">
                        <thead>
                          <tr className="bg-gray-100 text-left">
                            <th className="py-2 px-4 border-b text-sm font-semibold text-gray-600">
                              Item Name
                            </th>
                            <th className="py-2 px-4 border-b text-sm font-semibold text-gray-600">
                              Piece Type
                            </th>
                            <th className="py-2 px-4 border-b text-sm font-semibold text-gray-600">
                              Weight
                            </th>
                            <th className="py-2 px-4 border-b text-sm font-semibold text-gray-600">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {shipmentItems.map((eachItem, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="py-3 px-4 border-b text-sm text-gray-700">
                                {eachItem?.name}
                              </td>
                              <td className="py-3 px-4 border-b text-sm text-gray-700">
                                {eachItem?.type}
                              </td>
                              <td className="py-3 px-4 border-b text-sm text-gray-700">
                                {eachItem?.weight} Kg
                              </td>
                              <td className="py-3 px-4 border-b text-sm text-gray-700">
                                {eachItem?.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {idLoading && (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="w-12 h-12 border-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="bg-black w-screen fixed bottom-0 py-3 flex gap-x-8 justify-center !text-white ">
        <div className="text-sm !text-white flex  justify-center items-center ">
          <PhoneIcon className="h-3 w-3 mr-2"></PhoneIcon> +1 647 916 9511
        </div>
        <div className="text-sm !text-white flex justify-center items-center ">
          <EnvelopeIcon className="h-4 w-4 mr-2"></EnvelopeIcon> Email:
          canadacargobackup@gmail.com
        </div>
        <div className="text-sm !text-white "></div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
