import React from "react";
import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import Swal from "sweetalert2";
import { getUserDetails } from "../../projectcomponents/auth";
import axios from "axios";
import { Scanner } from "@yudiel/react-qr-scanner";

function ScanningBarcode() {
  const s = [
    {
      id: 1,
      shipperName: "John Doe",
      phoneNumber: "123-456-7890",
      address: "123 Main St, Paris",
      email: "john@example.com",
      numberOfItems: 1,
      shipmentInfo: { weight: "10kg", status: "Pending" },
      weighments: [
        {
          name: "Box 1",
          weight: 50,
          transaction_id: "373777782828822",
          item_transaction_id: "373777782828822_4743bb333yb33",
        },
      ],
    },
  ];

  const [shouldScan, setShouldScan] = useState(true);

  const [shipments, setShipments] = useState([]);
  const [sendloading, setsendloading] = useState(false);
  const [showingShipmentModal, setShowingShipmentModal] = useState(false);

  const [scanPayload, setScanPayload] = useState({ data: "", ts: 0 });

  const [showingIndex, setShowingIndex] = React.useState(0);
  const [displayingShipmentInfo, setDisplayingShipmentInfo] = React.useState(
    {}
  );

  const [activeTab, setActiveTab] = useState("actions");
  const [displayingShipmentInfoAllItems, setDisplayingShipmentInfoAllItems] =
    React.useState({});
  const [manualBarcode, setManualBarcode] = useState("");

  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);

  const getShipmentInfoByTransId = async (trans_id) => {
    try {
      if (!trans_id) {
        Swal.fire({
          icon: "error",
          title: "Missing Transaction ID",
          text: "Please enter a valid Transaction ID.",
        });
        return;
      }
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getShipmentInfoByTransId`,
        { item_trans_id: trans_id },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setDisplayingShipmentInfo({
        ...response.data.data?.searchedItem,
        ...response.data.data?.shipmentInfo,
        status: response.data.data?.searchedItem?.status?.toUpperCase(),
      });
      setDisplayingShipmentInfoAllItems(response.data.data?.allItems);
      setShowingShipmentModal(true);

      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Shipment Info Retrieved",
          text: "Shipment details have been successfully retrieved.",
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "No Data Found",
          text: "No shipment information found for the provided Transaction ID.",
        });
      }

      setActiveTab("actions");
    } catch (error) {
      console.error(
        "Error fetching destination:",
        error.response?.data || error.message
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "An error occurred while fetching shipment info.",
      });
    } finally {
      setsendloading(false);
    }
  };

  useEffect(() => {
    // alert("JKe");
    if (scanPayload.data) {
      getShipmentInfoByTransId(scanPayload.data);
    }
  }, [scanPayload]);

  const updateItemStatusToOutOfOffice = async (
    item_trans_id,
    trans_id,
    senderEmail,
    receiverEmail
  ) => {
    try {
      if (!item_trans_id) {
        Swal.fire({
          icon: "error",
          title: "Missing Item Transaction ID",
          text: "Please enter a valid Item Transaction ID.",
        });
        return;
      }
      setsendloading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateItemStatusToOutOfOffice`,
        { item_trans_id, trans_id, senderEmail, receiverEmail },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Assuming a successful response
      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Item Status Updated",
          text: `Item with transaction ID ${item_trans_id} has been marked as 'Out Of Office'.`,
        });

        setShowingShipmentModal(false);
        setActiveTab("actions");
      } else {
        Swal.fire({
          icon: "warning",
          title: "No Data Found",
          text: "The item status could not be updated. Please try again.",
        });
      }
    } catch (error) {
      console.error(
        "Error updating item status:",
        error.response?.data || error.message
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "An error occurred while updating the item status.",
      });
    } finally {
      setsendloading(false);
    }
  };
  const updateItemStatusToArrived = async (
    item_trans_id,
    trans_id,
    senderEmail,
    receiverEmail
  ) => {
    try {
      if (!item_trans_id) {
        Swal.fire({
          icon: "error",
          title: "Missing Item Transaction ID",
          text: "Please enter a valid Item Transaction ID.",
        });
        return;
      }

      setsendloading(true);

      // Call the API to update the item status to 'Out Of Office'
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateItemStatusToArrived`,
        { item_trans_id, trans_id, senderEmail, receiverEmail },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Assuming a successful response
      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Item Status Updated",
          text: `Item with transaction ID ${item_trans_id} has been marked as 'Arrived'.`,
        });

        setShowingShipmentModal(false);
        setActiveTab("actions");
      } else {
        Swal.fire({
          icon: "warning",
          title: "No Data Found",
          text: "The item status could not be updated. Please try again.",
        });
      }
    } catch (error) {
      console.error(
        "Error updating item status:",
        error.response?.data || error.message
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "An error occurred while updating the item status.",
      });
    } finally {
      setsendloading(false);
    }
  };
  const updateItemStatusToDelivered = async (
    item_trans_id,
    trans_id,
    senderEmail,
    receiverEmail
  ) => {
    try {
      if (!item_trans_id) {
        Swal.fire({
          icon: "error",
          title: "Missing Item Transaction ID",
          text: "Please enter a valid Item Transaction ID.",
        });
        return;
      }

      setsendloading(true);

      // Call the API to update the item status to 'Out Of Office'
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateItemStatusToDelivered`,
        { item_trans_id, trans_id, senderEmail, receiverEmail },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Assuming a successful response
      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Item Status Updated",
          text: `Item with transaction ID ${item_trans_id} has been marked as 'Delivered'.`,
        });
        setShowingShipmentModal(false);
        setActiveTab("actions");
      } else {
        Swal.fire({
          icon: "warning",
          title: "No Data Found",
          text: "The item status could not be updated. Please try again.",
        });
      }
    } catch (error) {
      console.error(
        "Error updating item status:",
        error.response?.data || error.message
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "An error occurred while updating the item status.",
      });
    } finally {
      setsendloading(false);
    }
  };

  return (
    userToken && (
      <>
        <TitleCard
          title="Proceed to scan Barcode"
          topMargin="mt-2"
          TopSideButtons={<div className={"inline-block "}></div>}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Barcode Scanner */}
            <div className="flex flex-col  items-center h-screen w-full">
              <div className="w-full max-w-md mx-auto my-4">
                <label
                  htmlFor="transId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Qr ID
                </label>

                <input
                  type="text"
                  id="transId"
                  value={manualBarcode}
                  onChange={(e) => {
                    setManualBarcode(e.target.value);
                  }}
                  placeholder="Enter Barcode ID"
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
                />
                <button
                  onClick={() => {
                    getShipmentInfoByTransId(manualBarcode);
                  }}
                  className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150"
                >
                  Submit
                </button>
              </div>

              <div className="flex-grow flex items-center justify-center">
                <Scanner
                  key={shouldScan ? "active" : "paused"}
                  onScan={(result) => {
                    if (result) {
                      setScanPayload({
                        data: result[0]?.rawValue,
                        ts: Date.now(),
                      });
                      setShouldScan(false); // Temporarily stop scanning
                      setTimeout(() => setShouldScan(true), 1000); // Re-enable after 1 sec
                    }
                  }}
                />
              </div>

              <p className=" text-gray-700 text-sm text-center">
                {scanPayload?.data}
              </p>
            </div>

            {/* Shipment Information */}

            {showingShipmentModal && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => {
                  {
                    setShowingShipmentModal(false);
                    setActiveTab("actions");
                  }
                }}
              >
                <div
                  className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-auto max-h-[90vh]"
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
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setShowingShipmentModal(false);
                          setActiveTab("actions");
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Tab Navigation */}

                    <div className="mt-4 flex space-x-4 border-b pb-3">
                      <button
                        className={`${
                          activeTab === "actions"
                            ? "text-blue-600"
                            : "text-gray-600"
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
                          activeTab === "items"
                            ? "text-blue-600"
                            : "text-gray-600"
                        } hover:text-blue-600`}
                        onClick={() => setActiveTab("items")}
                      >
                        Items
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                      {activeTab === "actions" && (
                        <div>
                          {displayingShipmentInfo?.status?.toUpperCase() ===
                            "PROCESSED" && (
                            <>
                              <h3 className="text-xl mb-2 font-semibold text-gray-700">
                                Action
                              </h3>
                              <h4>
                                Do you want to change the status of the item to
                                (
                                {displayingShipmentInfo?.status?.toUpperCase() ===
                                  "PROCESSED" && (
                                  <span className="text-red-800 font-semibold">
                                    Out Of Office
                                  </span>
                                )}
                                )
                              </h4>

                              <div className="mt-4">
                                <button
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                  onClick={() => {
                                    updateItemStatusToOutOfOffice(
                                      displayingShipmentInfo?.item_trans_id,
                                      displayingShipmentInfo?.trans_id,
                                      displayingShipmentInfo?.shipper_email,
                                      displayingShipmentInfo?.receiver_email
                                    );
                                  }}
                                >
                                  Proceed
                                </button>
                              </div>
                            </>
                          )}

                          {displayingShipmentInfo?.status?.toUpperCase() ===
                            "IN TRANSIT" && (
                            <>
                              <h3 className="text-xl mb-2 font-semibold text-gray-700">
                                Action
                              </h3>
                              <h4>
                                Do you want to change the status of the item to
                                (
                                {displayingShipmentInfo?.status ===
                                  "IN TRANSIT" && (
                                  <span className="text-red-800 font-semibold">
                                    Arrived
                                  </span>
                                )}
                                )
                              </h4>

                              <div className="mt-4">
                                <button
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                  onClick={() => {
                                    updateItemStatusToArrived(
                                      displayingShipmentInfo?.item_trans_id,
                                      displayingShipmentInfo?.trans_id,
                                      displayingShipmentInfo?.shipper_email,
                                      displayingShipmentInfo?.receiver_email
                                    );
                                  }}
                                >
                                  Proceed
                                </button>
                              </div>
                            </>
                          )}
                          {displayingShipmentInfo?.status?.toUpperCase() ===
                            "ARRIVED" && (
                            <>
                              <h3 className="text-xl mb-2 font-semibold text-gray-700">
                                Action
                              </h3>
                              <h4>
                                Do you want to change the status of the item to
                                (
                                {displayingShipmentInfo?.status ===
                                  "ARRIVED" && (
                                  <span className="text-red-800 font-semibold">
                                    Delivered
                                  </span>
                                )}
                                )
                              </h4>

                              <div className="mt-4">
                                <button
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                  onClick={() => {
                                    updateItemStatusToDelivered(
                                      displayingShipmentInfo?.item_trans_id,
                                      displayingShipmentInfo?.trans_id,
                                      displayingShipmentInfo?.shipper_email,
                                      displayingShipmentInfo?.receiver_email
                                    );
                                  }}
                                >
                                  Proceed
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {activeTab === "shipmentDetails" && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700">
                            Shipment Details
                          </h3>
                          <div className="mt-2 text-gray-600 space-y-2">
                            <p>
                              <span className="font-semibold">
                                Shipment Type:
                              </span>{" "}
                              {displayingShipmentInfo?.shipment_type || "N/A"}
                            </p>

                            <p>
                              <span className="font-semibold">Courier:</span>{" "}
                              {displayingShipmentInfo?.courier || "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Payment Mode:
                              </span>{" "}
                              {displayingShipmentInfo?.payment_mode || "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">Origin:</span>{" "}
                              {displayingShipmentInfo?.origin || "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Destination:
                              </span>{" "}
                              {displayingShipmentInfo?.destination || "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Pickup Date:
                              </span>{" "}
                              {displayingShipmentInfo?.pickup_date || "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Expected Delivery:
                              </span>{" "}
                              {displayingShipmentInfo?.expected_date_delivery ||
                                "N/A"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-lg mt-4 font-semibold text-gray-700">
                              Description
                            </h3>
                            <p className="mt-2 text-gray-600">
                              {displayingShipmentInfo?.comments ||
                                "No Description provided."}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-700">
                              Province
                            </h3>
                            <p className="mt-2 text-gray-600">
                              {displayingShipmentInfo?.province ||
                                "No Province provided."}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === "items" && (
                        <div>
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
                                    Box Number
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
                                {displayingShipmentInfoAllItems.map(
                                  (eachItem, index) => (
                                    <tr
                                      key={index}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="py-3 px-4 border-b text-sm text-gray-700">
                                        {eachItem?.name}
                                      </td>
                                      <td className="py-3 px-4 border-b text-sm text-gray-700">
                                        {eachItem?.box_number}
                                      </td>
                                      <td className="py-3 px-4 border-b text-sm text-gray-700">
                                        {eachItem?.weight} Kg
                                      </td>
                                      <td className="py-3 px-4 border-b text-sm text-gray-700">
                                        {eachItem?.status}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="mt-6 flex justify-end">
                      <button
                        className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                        onClick={() => setShowingShipmentModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TitleCard>

        {sendloading && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        )}
      </>
    )
  );
}

export default ScanningBarcode;
