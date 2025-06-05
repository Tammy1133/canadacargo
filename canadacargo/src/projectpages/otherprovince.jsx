import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { PhoneIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

export const OtherProvince = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipmentInfo, setShipmentInfo] = useState({});
  const [shipmentItems, setShipmentItems] = useState([]);
  const params = useParams();
  useEffect(() => {
    setTrackingNumber(params?.id);
  }, []);

  const handleSubmit = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      setLoading(true);
      if (!email) {
        throw new Error("Email is required");
      }
      if (!trackingNumber) {
        throw new Error("Tracking Number is required");
      }
      const response = await axios.post(`${API_URL}/authenticateUserSide`, {
        email,
        trans_id: trackingNumber,
      });

      setShipmentInfo(response.data.shipmentInfo);
      setShipmentItems(response.data.shipmentItems);

      setLoggedIn(true);

      setLoading(false);
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
  return (
    <div className="provincebg">
      <div className="w-screen bg-blue-50 py-2 px-7 flex justify-between items-center drop-shadow-xl">
        <img src="/images/canadalogo.png" alt="" className="w-[130px]" />
        <button className="bg-blue-600 px-3 !py-1 text-sm rounded-lg text-white hover:scale-[106%] transition-all">
          Back to website
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
                handleSubmit();
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
                  value={trackingNumber}
                  disabled
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
