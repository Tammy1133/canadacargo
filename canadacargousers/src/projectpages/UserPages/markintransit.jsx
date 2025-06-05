import moment from "moment";
import { useEffect, useRef, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import SearchBar from "../../components/Input/SearchBar";
import Swal from "sweetalert2";

import {
  CheckBadgeIcon,
  EyeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserDetails } from "../../projectcomponents/auth";

function MarkInTransit() {
  const s = [];

  const [trans, setTrans] = useState([]); // Initialize state with dummy data directly

  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);
  const [allprocessModalShowing, setallprocessModalShowing] = useState(false);
  const [processModalShowing, setprocessModalShowing] = useState(false);

  const [trackingNumbers, setTrackingNumbers] = useState({}); // State to hold tracking numbers

  const handleTrackingNumberChange = (itemId, value) => {
    setTrackingNumbers((prev) => ({
      ...prev,
      [itemId]: value, // Update the tracking number for the specific item
    }));
  };

  const handleProceedClick = (itemId) => {
    const trackingNumber = trackingNumbers[itemId]; // Get the tracking number for the item
    if (trackingNumber) {
      alert(`Tracking number for item ${itemId}: ${trackingNumber}`);
    } else {
      alert("Please enter a tracking number for this item.");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // State to hold the selected transaction ID
  const [searchText, setSearchText] = useState(""); // State for search text

  const viewShipmentInfo = (id) => {
    setShipmentModalShowing(true);
  };
  const viewBarcodeInfo = (id) => {
    setSelectedId(id); // Save the selected ID
    setIsModalOpen(true); // Open modal when button is clicked
  };

  const [trackingNumber, setTrackingNumber] = useState("");

  const processInfo = (id) => {
    setSelectedId(id); // Save the selected ID
    setprocessModalShowing(true); // Open modal when button is clicked
  };

  const processAllInfo = () => {
    // setSelectedId(id);
    setallprocessModalShowing(true);
    true; // Open modal when button is clicked
  };

  // const addItem = () => {
  //   const newTrans = trans.map((t) => {
  //     if (t.id === selectedId) {
  //       return { ...t, weighments: [...t.weighments, { name: "", weight: 0 }] }; // Add a new item to the selected transaction's weighments
  //     }
  //     return t;
  //   });

  //   console.log(newTrans);

  //   setTrans(newTrans);
  // };

  const barcodeRef = useRef(null);

  const handlePrint = () => {
    if (barcodeRef.current) {
      barcodeRef.current.print();
    }
  };

  const applySearch = (searchText) => {
    const filteredTrans = s.filter((t) =>
      Object.values(t).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchText.toLowerCase())
      )
    );
    setTrans(filteredTrans);
  };

  // Function to handle the process click event

  const navigate = useNavigate();

  // useEffect(() => {
  //   const updatedTrans = trans.map((t) => ({
  //     ...t,
  //     numberOfItems: t.weighments?.length || 0,
  //   }));

  //   setTrans((prevTrans) =>
  //     JSON.stringify(prevTrans) !== JSON.stringify(updatedTrans)
  //       ? updatedTrans
  //       : prevTrans
  //   );
  // }, []);

  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [displayingShipperInfo, setDisplayingShipperInfo] = useState({});
  const [pieceTypes, setPieceTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [currentRate, setCurrentRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendloading, setsendloading] = useState(false);

  const getOutOfOffice = async () => {
    try {
      setsendloading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getOutOfOffice`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const enrichedData = response.data.data.map(
        ({ items, shipment_info, ...rest }) => ({
          ...rest,
          shipment_info,
          items: items.map((item) => ({ ...shipment_info, ...item })),
        })
      );

      setTrans(enrichedData);

      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      setTrans([]);
      console.error(
        "Error fetching completed payments:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    getOutOfOffice();
  }, [selectedDate, selectedEndDate]);

  function calculateShipping(items, currentRate, pieceTypes) {
    if (items && items.length > 0) {
      const totalWeight = items.reduce(
        (sum, item) => sum + Number(item.weight),
        0
      );

      const shippingRate = totalWeight * Number(currentRate);

      const itemFee = items.reduce((sum, item) => {
        const pieceType = pieceTypes.find(
          (type) => type?.name?.toUpperCase() === item?.type?.toUpperCase()
        );
        return sum + (pieceType ? Number(pieceType.price) : 0);
      }, 0);

      const totalSum = shippingRate + itemFee;

      return {
        totalWeight,
        shippingRate,
        itemFee,
        totalSum,
      };
    }

    return {
      totalWeight: 0,
      shippingRate: 0,
      itemFee: 0,
      totalSum: 0,
    };
  }
  const updateItemTrackingAndStatus = async (
    item_trans_id,
    tracking_number,
    status,
    senderEmail,
    receiverEmail
  ) => {
    try {
      setsendloading(true);
      if (!tracking_number || tracking_number.trim() === "") {
        Swal.fire({
          title: "Error!",
          text: "Tracking number is required.",
          icon: "error",
          confirmButtonText: "Okay",
        });

        throw new Error("Tracking number is required.");
      }

      // Confirm before proceeding with the update
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to update this item's tracking number and status?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, update!",
        cancelButtonText: "Cancel",
      });

      // If the user clicked "Cancel", stop the process
      if (!confirmResult.isConfirmed) {
        console.log("User canceled the update");
        setsendloading(false);

        return; // Exit function without updating
      }

      // Make the API request to update tracking and status
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateItemTrackingAndStatus`,
        { item_trans_id, tracking_number, status, senderEmail, receiverEmail },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Display success Swal
      Swal.fire({
        title: "Success!",
        text: "Item tracking number and status updated successfully.",
        icon: "success",
        confirmButtonText: "Great",
      });

      setprocessModalShowing(false);
      getOutOfOffice();

      setTrackingNumber("");
      setsendloading(false);
      return response.data;
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error updating single item:",
        error.response?.data || error.message
      );

      // Show error alert if there's an issue
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          error?.response?.data ||
          error?.message,
        icon: "error",
        confirmButtonText: "Try Again",
      });

      throw error; // Re-throw error for higher-level handling
    }
  };

  const updateMultipleItemsTrackingAndStatus = async (items) => {
    try {
      setsendloading(true);
      if (!trackingNumber) {
        // Show error alert for missing tracking number
        Swal.fire({
          title: "Error!",
          text: "Tracking number is required.",
          icon: "error",
          confirmButtonText: "OK",
        });

        // Log the trackingNumber and throw error
        throw new Error("Tracking number is required");
      }

      // Confirm before proceeding
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to proceed with updating the items?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, update!",
        cancelButtonText: "Cancel",
      });

      // If the user clicked "Cancel", stop the process
      if (!confirmResult.isConfirmed) {
        console.log("User cancelled the update");
        return; // Do nothing and exit the function
      }

      // Format the items to include tracking_number and status
      const formattedItems = items?.map((eachItem) => {
        return {
          item_trans_id: eachItem.item_trans_id,
          tracking_number: trackingNumber,
          status: "In Transit",
          senderEmail: eachItem?.shipper_email,
          receiverEmail: eachItem?.receiver_email,
        };
      });

      // console.log(formattedItems);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateMultipleItemsTrackingAndStatus`,
        { items: formattedItems }, // Send formattedItems instead of raw items
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        title: "Success!",
        text: "items have been updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setprocessModalShowing(false);
      getOutOfOffice();
      setallprocessModalShowing(false);

      setTrackingNumber("");

      setsendloading(false);

      return response.data;
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error updating multiple items:",
        error.response?.data || error.message
      );

      // Log full error to inspect what went wrong
      console.log("Error details:", error);

      // Show error alert with more details
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to update items.",
        icon: "error",
        confirmButtonText: "Try Again",
      });

      throw error; // Re-throw error for higher-level handling
    }
  };

  return (
    userToken && (
      <>
        <TitleCard
          title="Mark In Transit"
          topMargin="mt-2"
          TopSideButtons={
            <div className={"inline-block "}>
              <div className="flex space-x-2">
                {trans.length > 0 && (
                  <button
                    className="btn btn-sm btn-secondary bg-green-600"
                    onClick={() => {
                      processAllInfo();
                    }}
                  >
                    Process All
                    <CheckBadgeIcon className="text-white text-2xl h-6 w-6"></CheckBadgeIcon>
                  </button>
                )}
                <div className="input-group   relative  flex-wrap items-stretch w-full ">
                  <input
                    type="search"
                    value={searchText}
                    placeholder={"Search"}
                    onChange={(e) => {
                      setSearchText(e.target.value); // Update search text state
                      applySearch(e.target.value); // Apply search on change
                    }}
                    className="input input-sm input-bordered  w-full max-w-xs"
                  />
                </div>
              </div>
            </div>
          }
        >
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="!font-bold !text-center">Shipper Name</th>
                  <th className="!font-bold !text-center">Phone Number</th>
                  <th className="!font-bold !text-center min-w-[170px]">
                    Address
                  </th>
                  <th className="!font-bold !text-center">Number of cartons</th>
                  <th className="!font-bold !text-center">Status</th>

                  <th className="!font-bold !text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {trans.map((l, k) => {
                  return (
                    <tr key={k}>
                      <td className="truncate">
                        {l.shipment_info?.shipper_name}
                      </td>
                      <td className="truncate">
                        {l.shipment_info?.shipper_phone}
                      </td>
                      <td className="truncate max-w-[200px]">
                        {l.shipment_info?.receiver_address}
                      </td>
                      <td className="truncate">{l?.items?.length}</td>
                      <td className="truncate">
                        {Object.entries(
                          l?.items?.reduce((acc, item) => {
                            acc[item.status] = (acc[item.status] || 0) + 1;
                            return acc;
                          }, {}) || []
                        ).map(([status, count], index) => (
                          <span key={index}>
                            {count} {status}
                            {index < l.items.length - 1 && ", "}
                          </span>
                        ))}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            className="btn btn-sm btn-primary bg-blue-600"
                            onClick={() => {
                              viewShipmentInfo(l.item_trans_id);
                              setDisplayingShipperInfo(l.shipment_info);
                            }}
                          >
                            <InformationCircleIcon className="text-white text-2xl h-6 w-6"></InformationCircleIcon>
                          </button>

                          <button
                            className="btn btn-sm btn-secondary bg-gray-600"
                            onClick={() => {
                              // console.log(l);

                              viewBarcodeInfo(l.trans_id);
                              setDisplayingShipperInfo(l.shipment_info);
                            }}
                          >
                            <EyeIcon className="text-white text-2xl h-6 w-6"></EyeIcon>
                          </button>
                          <button
                            className="btn btn-sm btn-secondary bg-green-600"
                            onClick={() => {
                              processInfo(l.trans_id);
                              setDisplayingShipperInfo(l.shipment_info);
                            }}
                          >
                            <CheckBadgeIcon className="text-white text-2xl h-6 w-6"></CheckBadgeIcon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TitleCard>

        {isModalOpen && ( // Modal rendering
          <div
            className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="flex justify-center items-center h-screen mt-[40px]">
              <div
                className="modal-content bg-white rounded-lg p-6 shadow-lg max-h-[80vh] overflow-y-auto w-fit !min-w-[500px] md:ml-[100px]"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-bold mb-4 text-center">
                  List of Items for {displayingShipperInfo?.shipper_name}
                </h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left border-b text-gray-600 font-semibold">
                          Item Name
                        </th>
                        <th className="px-4 py-2 text-left border-b text-gray-600 font-semibold">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trans
                        .find((t) => t.trans_id === selectedId)
                        ?.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-100">
                            <td className="px-4 py-2 border-b">{item.name}</td>
                            <td className="px-4 py-2 border-b">
                              {item.weight}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex space-x-2 mt-4 justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary btn btn-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {processModalShowing && (
          <div
            className="fixed inset-0  bg-black bg-opacity-50 overflow-y-auto"
            onClick={() => {
              setprocessModalShowing(false);
            }}
          >
            <div className="flex justify-center h-screen items-center mt-[40px]">
              <div
                className="modal-content bg-white md:ml-[200px] rounded-lg p-6 shadow-lg max-h-[80vh] overflow-y-auto"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <h2 className="text-lg font-bold mb-4">
                  Enter Tracking number for{" "}
                  {displayingShipperInfo?.shipper_name}
                </h2>

                <label className="block mb-6">
                  Enter Tracking number for all:
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => {
                      setTrackingNumber(e.target.value);
                    }}
                    className="border-2 rounded p-1 mt-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const foundItem = trans.find(
                        (item) => item.trans_id === selectedId
                      );

                      if (foundItem) {
                        // Map through the items array and get the unique item_trans_id values
                        const uniqueItemTransIds = [
                          ...new Set(
                            foundItem.items
                              .filter(
                                (item) =>
                                  item.item_trans_id &&
                                  item.status === "Out Of Office"
                              )
                              .map((item) => item)
                          ),
                        ];

                        // console.log(uniqueItemTransIds);

                        updateMultipleItemsTrackingAndStatus(
                          uniqueItemTransIds
                        );
                      } else {
                        console.log("Item not found");
                      }
                    }}
                    className=" btn-green-900  btn btn-sm mt-2"
                  >
                    Proceed
                  </button>
                </label>

                {trans
                  .find((t) => t.trans_id === selectedId)
                  ?.items.filter((item) => item.status === "Out Of Office")
                  .map((item, index) => (
                    <div key={index} className="mb-4">
                      <label className="block mb-1">
                        Item {index + 1} Name:
                        <input
                          type="text"
                          value={item.name}
                          disabled
                          className="border rounded p-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </label>
                      <label className="block mb-1">
                        Weight:
                        <input
                          type="number"
                          disabled
                          value={item.weight}
                          readOnly
                          className="border rounded p-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </label>

                      <label className="block mb-6 mt-5">
                        Enter Tracking number for {item.name}:
                        <input
                          type="text"
                          value={trackingNumbers[item.item_trans_id] || ""} // Get the tracking number from state
                          onChange={(e) =>
                            handleTrackingNumberChange(
                              item.item_trans_id,
                              e.target.value
                            )
                          }
                          className="border-2 rounded p-1 mt-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            updateItemTrackingAndStatus(
                              item.item_trans_id,
                              trackingNumbers[item.item_trans_id],
                              "In Transit",
                              displayingShipperInfo?.shipper_email,
                              displayingShipperInfo?.receiver_email
                            );
                          }}
                          className="btn-green-900 btn btn-sm mt-2"
                        >
                          Proceed
                        </button>
                      </label>
                    </div>
                  ))}

                <div
                  className={`flex space-x-2 mt-4 ${
                    trans.find((t) => t.id === selectedId)?.items.length === 0
                      ? "justify-center"
                      : "justify-end"
                  }`}
                >
                  <button
                    onClick={() => setprocessModalShowing(false)}
                    className=" btn-secondary  btn btn-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {allprocessModalShowing && (
          <div
            className="fixed inset-0  bg-black bg-opacity-50 overflow-y-auto"
            onClick={() => {
              setallprocessModalShowing(false);
            }}
          >
            <div className="flex justify-center h-screen items-center mt-[40px]">
              <div
                className="modal-content bg-white md:ml-[200px] rounded-lg p-6 shadow-lg max-h-[80vh] overflow-y-auto"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <h2 className="text-lg font-bold mb-4">
                  Enter Tracking number for all
                </h2>

                <label className="block mb-1">
                  Tracking number:
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => {
                      setTrackingNumber(e.target.value);
                    }}
                    className="border-2 rounded p-1 mt-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </label>
                <div className={`flex space-x-2 mt-4 justify-end`}>
                  <button
                    onClick={() => {
                      const uniqueItemTransIds = new Set();

                      trans.forEach((transItem) => {
                        transItem.items.forEach((item) => {
                          if (
                            item.status === "Out Of Office" &&
                            item.item_trans_id
                          ) {
                            uniqueItemTransIds.add(item);
                          }
                        });
                      });

                      const uniqueItemTransIdsArray =
                        Array.from(uniqueItemTransIds);

                      updateMultipleItemsTrackingAndStatus(
                        uniqueItemTransIdsArray
                      );
                    }}
                    className=" btn-green-900  btn btn-sm"
                  >
                    Proceed
                  </button>
                  <button
                    onClick={() => setallprocessModalShowing(false)}
                    className=" btn-secondary  btn btn-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {shipmentModalShowing && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShipmentModalShowing(false);
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
                    onClick={() => setShipmentModalShowing(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="mt-6 space-y-6">
                  {/* Shipper Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Shipper Information
                    </h3>
                    <div className="mt-2 text-gray-600 space-y-2">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {displayingShipperInfo?.shipper_name || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {displayingShipperInfo?.shipper_phone || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {displayingShipperInfo?.shipper_address || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {displayingShipperInfo?.shipper_email || "N/A"}
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
                        {displayingShipperInfo?.receiver_name || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {displayingShipperInfo?.receiver_phone || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {displayingShipperInfo?.receiver_address || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {displayingShipperInfo?.receiver_email || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Shipment Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Shipment Details
                    </h3>
                    <div className="mt-2 text-gray-600 space-y-2">
                      <p>
                        <span className="font-semibold">Shipment Type:</span>{" "}
                        {displayingShipperInfo?.shipment_type || "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">Courier:</span>{" "}
                        {displayingShipperInfo?.courier || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Payment Mode:</span>{" "}
                        {displayingShipperInfo?.payment_mode || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Origin:</span>{" "}
                        {displayingShipperInfo?.origin || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Destination:</span>{" "}
                        {displayingShipperInfo?.destination || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Pickup Date:</span>{" "}
                        {displayingShipperInfo?.pickup_date || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Expected Delivery:
                        </span>{" "}
                        {displayingShipperInfo?.expected_date_delivery || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Comments */}
                  {/* <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Description
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {displayingShipperInfo?.comments ||
                        "No Description provided."}
                    </p>
                  </div> */}
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end">
                  <button
                    className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    onClick={() => setShipmentModalShowing(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {sendloading && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        )}
      </>
    )
  );
}

export default MarkInTransit;
