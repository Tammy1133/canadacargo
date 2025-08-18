import moment from "moment";
import { useEffect, useRef, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { useReactToPrint } from "react-to-print";

import SearchBar from "../../components/Input/SearchBar";
import Swal from "sweetalert2";
import {
  Bars3Icon,
  InformationCircleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { getUserDetails } from "../../projectcomponents/auth";
import axios from "axios";
import QRCodeMultipleComponent from "../UserComponents/barcodeMultipleComponent";
import QRCodeComponent from "../UserComponents/barcodeComponent";

function GenerateBarcode() {
  const s = [];

  const [trans, setTrans] = useState([]); // Initialize state with dummy data directly

  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);

  const viewShipmentInfo = (items) => {
    setShipmentModalShowing(true);

    setDisplayingShipperInfo(items);
  };

  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [displayingShipperInfo, setDisplayingShipperInfo] = useState({});

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [sendloading, setsendloading] = useState(false);

  const getCompletedPayments = async () => {
    try {
      setsendloading(true);

      const currentDate = new Date().toISOString().split("T")[0];
      const formattedStartDate = selectedDate || currentDate;
      const formattedEndDate = selectedEndDate || currentDate;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getShipmentItems`,
        {
          params: {
            start_date: formattedStartDate,
            end_date: formattedEndDate,
          },
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTrans(response.data.data);

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
    getCompletedPayments();
  }, [selectedDate, selectedEndDate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // State to hold the selected transaction ID
  const [searchText, setSearchText] = useState(""); // State for search text

  const viewBarcodeInfo = (id, shipment) => {
    setSelectedId(id); // Save the selected ID

    // console.log(shipment);

    setDisplayingShipperInfo(shipment);
    setIsModalOpen(true); // Open modal when button is clicked
  };

  const addItem = () => {
    const newTrans = trans.map((t) => {
      if (t.id === selectedId) {
        return { ...t, weighments: [...t.items, { name: "", weight: 0 }] }; // Add a new item to the selected transaction's weighments
      }
      return t;
    });

    // console.log(newTrans);

    setTrans(newTrans);
  };

  const barcodeRef = useRef(null); // Reference to the BarcodeComponent

  const handlePrint = () => {
    if (barcodeRef.current) {
      barcodeRef.current.print(); // Call the print method on the BarcodeComponent ref
    }
  };

  const [originalTrans, setOriginalTrans] = useState([]); // State to hold the original transactions

  useEffect(() => {
    // Store the original transactions only when they are first loaded
    if (originalTrans.length === 0 && trans.length > 0) {
      setOriginalTrans(trans);
    }
  }, [trans]);

  const applySearch = (searchText) => {
    // Trim the search text to handle cases with only spaces
    const trimmedSearchText = searchText.trim();

    // If the search text is empty, reset to original transactions
    if (trimmedSearchText === "") {
      setTrans(originalTrans);
      return; // Exit early to avoid further processing
    }

    // Filter transactions based on the search text
    const filteredTrans = originalTrans.filter((t) =>
      Object.values(t).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(trimmedSearchText.toLowerCase())
      )
    );

    // Update the transactions with the filtered results
    setTrans(filteredTrans);
  };

  // Function to handle the process click event

  return (
    userToken && (
      <>
        <TitleCard
          title="Generate Qr"
          topMargin="mt-2"
          TopSideButtons={
            <div className={"inline-block "}>
              <div className="input-group  relative flex flex-wrap items-stretch w-full ">
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
          }
        >
          <div className="flex flex-col sm:flex-row items-center  bg-white shadow-md rounded-lg px-6  pb-2 -mt-4 mb-5 space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Start Date */}
            <div className="flex flex-col">
              <label
                htmlFor="startDate"
                className="text-sm font-semibold text-gray-700"
              >
                Start Date
              </label>
              <input
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                }}
                type="date"
                id="startDate"
                className="mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <label
                htmlFor="endDate"
                className="text-sm font-semibold text-gray-700"
              >
                End Date
              </label>
              <input
                value={selectedEndDate}
                onChange={(e) => {
                  setSelectedEndDate(e.target.value);
                }}
                type="date"
                id="endDate"
                className="mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="!font-bold !text-center">Date</th>
                  <th className="!font-bold !text-center">Shipper Name</th>
                  <th className="!font-bold !text-center">Receiver Name</th>
                  <th className="!font-bold !text-center">Pickup Date</th>
                  <th className="!font-bold !text-center">EDD</th>
                  <th className="!font-bold !text-center">Phone Number</th>
                  <th className="!font-bold !text-center min-w-[170px]">
                    Address
                  </th>
                  <th className="!font-bold !text-center">Email</th>
                  <th className="!font-bold !text-center">No of cartons</th>
                  <th className="!font-bold !text-center">Status</th>
                  <th className="!font-bold !text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {trans.map((l, k) => {
                  return (
                    <tr key={k}>
                      <td className="truncate">
                        {new Date(l?.created_date)?.toLocaleDateString() || "-"}
                      </td>
                      <td className="truncate">{l.shipper_name}</td>
                      <td className="truncate">{l.receiver_name}</td>

                      <td className="truncate">{l.pickup_date}</td>
                      <td className="truncate">{l.expected_date_delivery}</td>

                      <td className="truncate">{l.shipper_phone}</td>
                      <td className="truncate" style={{ maxWidth: "150px" }}>
                        {l.shipper_address}
                      </td>
                      <td className="truncate">{l.shipper_email}</td>
                      <td className="truncate">{l.items?.length}</td>
                      <td className="truncate">
                        {" "}
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
                            onClick={() => viewShipmentInfo(l)}
                          >
                            <InformationCircleIcon className="text-white text-2xl h-6 w-6"></InformationCircleIcon>
                          </button>

                          <button
                            className="btn btn-sm btn-secondary bg-gray-600"
                            onClick={() => viewBarcodeInfo(l.trans_id, l)}
                          >
                            <Squares2X2Icon className="text-white text-2xl h-6 w-6"></Squares2X2Icon>
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
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[9999]  bg-black bg-opacity-50 overflow-y-auto"
            onClick={() => {
              setIsModalOpen(false);
            }}
          >
            <div className="flex justify-center h-screen items-center ">
              <div
                className="modal-content bg-white md:ml-[200px] rounded-lg p-6 shadow-lg max-h-[80vh] overflow-y-auto"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <h2 className="text-lg font-bold mb-4">
                  QR Generation for
                  {trans.find((t) => t.trans_id === selectedId)?.shipper_name}
                </h2>

                <QRCodeMultipleComponent
                  barcodeValues={displayingShipperInfo?.items?.map(
                    (eachitem) => {
                      return eachitem;
                    }
                  )}
                  displayingShipperInfo={displayingShipperInfo}
                ></QRCodeMultipleComponent>

                {displayingShipperInfo?.items.map((item, index) => (
                  <div key={index} className="mb-4">
                    <label className="block mb-1">
                      Item {index + 1} Name:
                      <input
                        type="text"
                        value={item.name}
                        disabled
                        onChange={(e) => {
                          const newTrans = trans.map((t) => {
                            if (t.id === selectedId) {
                              const newWeighments = [...t.items];
                              newWeighments[index].name = e.target.value;
                              return { ...t, weighments: newWeighments };
                            }
                            return t;
                          });
                          setTrans(newTrans);
                        }}
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
                    <div className="flex flex-col items-center space-y-4 mt-4">
                      {/* <button className="btn btn-primary" onClick={handlePrint}>
                        Generate and Print Barcode
                      </button> */}
                      <div>
                        <QRCodeComponent
                          barcodeValues={[
                            displayingShipperInfo?.items?.find((eachitem) => {
                              return (
                                eachitem?.item_trans_id === item?.item_trans_id
                              );
                            }),
                          ]}
                          displayingShipperInfo={displayingShipperInfo}
                        />
                      </div>
                    </div>
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
                    onClick={() => setIsModalOpen(false)}
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

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Province
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {displayingShipperInfo?.province ||
                        "No Province provided."}
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end">
                  {/* {["INITIATED", "PENDING PAYMENT", "PROCESSED"].includes(
                  displayingShipperInfo?.status?.toUpperCase()
                ) && (
                  <button
                    className="bg-green-400 px-4 py-2 rounded-md hover:bg-green-700 mr-3 hover:text-white"
                    onClick={() => {
                      navigate(
                        `/editshipment/${displayingShipperInfo?.trans_id}`
                      );
                    }}
                  >
                    Edit
                  </button>
                )} */}

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

export default GenerateBarcode;
