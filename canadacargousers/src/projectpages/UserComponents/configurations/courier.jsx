import React, { useEffect, useRef, useState } from "react";

import axios from "axios";

import { TaxHistoryTable } from "./tables/taxHistoryTable";
import { PieceTypesTable } from "./tables/PieceTypesTable";
import { DestinationTable } from "./tables/destinationTable";
import { OriginTable } from "./tables/origintable";
import { PaymentModesTable } from "./tables/paymentModesTable";
import { CourierTable } from "./tables/courierTable";
import Swal from "sweetalert2";
import { getUserDetails } from "../../../projectcomponents/auth";

export const Courier = () => {
  const [userExists, setUserExists] = useState("");
  const tokenRef = useRef(userExists);

  const [userDetails, setUserDetails] = useState("");
  const [courierName, setcourierName] = useState("");

  useEffect(() => {
    tokenRef.current = userExists.token;
  }, [userExists]);

  const [updatedTax, setUpdatedTax] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [userToken, setUserToken] = useState(() => getUserDetails().token);

  const addNewTaxUpdate = async () => {
    try {
      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/createCourier`,
        {
          name: courierName,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setcourierName("");

      // Call the function to fetch all tax updates after adding the new courier
      getAllTaxUpdates();

      // Show success message using SweetAlert2
      Swal.fire({
        icon: "success",
        title: "Courier Added Successfully!",
        text: "The new courier has been added to the system.",
      });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      // Show error message using SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error Adding Courier",
        text: error.response?.data?.message || error.message,
      });

      console.error(
        "Error adding courier:",
        error.response?.data || error.message
      );
    }
  };

  const deleteCourier = async (courierName) => {
    try {
      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/deleteCourier`,
        {
          name: courierName,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setcourierName("");

      getAllTaxUpdates();

      Swal.fire({
        icon: "success",
        title: "Courier Deleted Successfully!",
        text: "The selected courier has been removed from the system.",
      });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Error Deleting Courier",
        text: error.response?.data?.message || error.message,
      });

      console.error(
        "Error deleting courier:",
        error.response?.data || error.message
      );
    }
  };

  const [alltaxrates, setAllTaxRates] = useState([]);
  const [displayingTax, setDisplayingTax] = useState();

  useEffect(() => {
    if (alltaxrates?.length > 0) {
      const mostRecentItem = alltaxrates.reduce((latest, item) =>
        new Date(item.date) > new Date(latest.date) ? item : latest
      );

      setDisplayingTax(mostRecentItem?.newrate);
    }
  }, [alltaxrates]);
  const getAllTaxUpdates = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getAllCouriers`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAllTaxRates(response.data.couriers);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(
        "Error fetching tax updates:",
        error.response?.data || error.message
      );
      setAllTaxRates([]);
    }
  };

  useEffect(() => {
    getAllTaxUpdates();
  }, [userExists]);

  return (
    <div className="grid md:grid-cols-6 gap-4 items-start">
      <div className="p-6 min-w-[300px] md:min-w-[10px] md:col-span-2   bg-white shadow-md rounded-lg ">
        <h2 className="text-xl font-semibold mb-4">New Courier</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addNewTaxUpdate();
          }}
        >
          <div className="mb-4">
            <label className="block mb-2 text-gray-700 font-medium">
              Enter Courier Name
            </label>
            <input
              type="text"
              name="Tax"
              value={courierName}
              onChange={(e) => {
                setcourierName(e.target.value);
              }}
              className="w-full p-2 border rounded-lg outline-none focus:border-blue-500"
              min="0"
              step=""
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full p-2 text-white font-medium rounded-lg transition ${
              isLoading
                ? "bg-slate-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Proceed"}
          </button>
        </form>

        {statusMessage && (
          <p className="mt-4 text-green-600">{statusMessage}</p>
        )}
      </div>
      <div className=" col-span-4">
        <CourierTable
          alltaxrates={alltaxrates}
          deleteCourier={deleteCourier}
        ></CourierTable>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
