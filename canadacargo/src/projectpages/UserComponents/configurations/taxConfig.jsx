import React, { useEffect, useRef, useState } from "react";

import axios from "axios";

import { TaxHistoryTable } from "./tables/taxHistoryTable";
import { getUserDetails } from "../../../projectcomponents/auth";
import Swal from "sweetalert2";
import { ShippingCostPerKgTable } from "./tables/shippingCostPerKgTable";
import { IsCanada } from "../../../utils/globalConstantUtil";

export const TaxConfig = () => {
  const [userExists, setUserExists] = useState("");
  const tokenRef = useRef(userExists);

  const [userDetails, setUserDetails] = useState("");
  const [shippingCost, setShippingCost] = useState(0);

  const [userToken, setUserToken] = useState(() => getUserDetails().token);

  const [courierName, setcourierName] = useState("");

  const addNewTaxUpdate = async () => {
    try {
      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateTaxConfiguration`,
        {
          newrate: courierName,
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
        title: " Updated Successfully!",
        text: "Tax has been added to the system.",
      });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Error Adding Shipping Cost",
        text: error.response?.data?.message || error.message,
      });

      console.error(
        "Error adding Shipping Cost:",
        error.response?.data || error.message
      );
    }
  };

  const getAllTaxUpdates = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getTaxConfiguration`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAllTaxRates(response.data.taxConfigurations);
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

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
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

  useEffect(() => {
    getAllTaxUpdates();
  }, [userExists]);

  useEffect(() => {
    setShippingCost(Number(alltaxrates[0]?.newrate)?.toLocaleString() || 0);
  }, [alltaxrates]);

  return (
    <div className="grid md:grid-cols-6 gap-4 items-start">
      <div className="p-6 min-w-[300px] md:min-w-[10px] md:col-span-2   bg-white shadow-md rounded-lg ">
        <h2 className="text-xl font-semibold mb-4">Update Shipping Cost</h2>

        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            Current Cost: {IsCanada ? "$" : "₦"} {shippingCost}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addNewTaxUpdate();
          }}
        >
          <div className="mb-4">
            <label className="block mb-2 text-gray-700 font-medium">
              Update Shipping Cost
            </label>
            <input
              type="number"
              name="Tax"
              value={courierName}
              onChange={(e) => {
                setcourierName(e.target.value);
              }}
              className="w-full p-2 border rounded-lg outline-none focus:border-blue-500"
              min="0"
              step="0.1"
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
        <ShippingCostPerKgTable
          alltaxrates={alltaxrates}
        ></ShippingCostPerKgTable>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
