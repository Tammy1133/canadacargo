import moment from "moment";
import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import SearchBar from "../../components/Input/SearchBar";
import Swal from "sweetalert2";
import {
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  CogIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { getUserDetails } from "../../projectcomponents/auth";
import { useNavigate } from "react-router-dom";
import {
  getBoxNumbersFromItems,
  IsCanada,
} from "../../utils/globalConstantUtil";

function OutOfOffice() {
  const [trans, setTrans] = useState([]);

  console.log(trans);

  const navigate = useNavigate();

  useEffect(() => {
    const updatedTrans = trans.map((t) => ({
      ...t,
      numberOfItems: t.weighments?.length || 0,
    }));

    setTrans((prevTrans) =>
      JSON.stringify(prevTrans) !== JSON.stringify(updatedTrans)
        ? updatedTrans
        : prevTrans
    );
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // State to hold the selected transaction ID
  const [searchText, setSearchText] = useState(""); // State for search text

  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);

  const viewShipmentInfo = (items) => {
    setShipmentModalShowing(true);

    setDisplayingShipperInfo(items);
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
      return;
    }

    // Filter transactions based on the search text
    const filteredTrans = originalTrans.filter((t) =>
      Object.values(t?.shipment_info).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(trimmedSearchText.toLowerCase())
      )
    );

    setTrans(filteredTrans);
  };

  const handleProcessClick = (shipment) => {
    let calculations = calculateShipping(
      shipment?.items,
      currentRate,
      pieceTypes
    );
    const itemsList = `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top:10px">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Weight (kg)</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${shipment.items
          .map(
            (item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.name?.toUpperCase()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              item.weight
            }</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item?.type?.toUpperCase()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item?.status?.toUpperCase()}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
    const itemsPriceList = `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top:10px">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Weight (KG)</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Shipping Rate</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Pice Price</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${shipment.items
          ?.slice(0, 1)
          .map(
            (item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${Number(
              calculations?.totalWeight
            )?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(calculations?.shippingRate)?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(calculations?.itemFee)?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(calculations?.totalSum)?.toLocaleString()}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
    Swal.fire({
      title: "Details",
      html: `Below are the details and breakdown<br> ${itemsList}`, // Use html instead of text
      icon: "warning",
      showCancelButton: false,
      showConfirmButton: false,
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        processPayment(
          shipment?.trans_id,
          calculations?.totalSum,
          shipment.items
        );
      }
    });
  };

  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [displayingShipperInfo, setDisplayingShipperInfo] = useState({});
  const [pieceTypes, setPieceTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [currentRate, setCurrentRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendloading, setsendloading] = useState(false);

  const [allOrigins, setAllOrigins] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const getAllOrigins = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getAllOrigins`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAllOrigins(response.data.origins || []);
    } catch (error) {
      console.error(
        "Error fetching origins:",
        error.response?.data || error.message
      );
      setAllOrigins([]);
    }
  };

  const getAllDestinations = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getAllDestinations`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setAllDestinations(response.data.destinations || []);
    } catch (error) {
      console.error(
        "Error fetching destinations:",
        error.response?.data || error.message
      );
      setAllDestinations([]);
    }
  };

  useEffect(() => {
    setsendloading(true);
    const fetchData = async () => {
      await Promise.all([getAllOrigins(), getAllDestinations()]);
    };
    fetchData();
    setsendloading(false);
  }, []);

  const getPendingPayments = async (date) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getCompletedPayments`,
        { date },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);

      setTrans(response.data.data);
    } catch (error) {
      setTrans([]);
      console.error(
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };

  const getCompletedPayments = async () => {
    try {
      setsendloading(true);

      const currentDate = new Date().toISOString().split("T")[0];
      const formattedStartDate = selectedDate || currentDate;
      const formattedEndDate = selectedEndDate || currentDate;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getOutOfOffice`,
        {
          params: {
            startdate: formattedStartDate,
            enddate: formattedEndDate,
            origin: selectedOrigin,
            destination: selectedDestination,
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

  const processPayment = async (trans_id, amount, items) => {
    try {
      setsendloading(true);

      console.log({ trans_id, amount, items });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/completePayment`,
        { trans_id, amount, items },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire("Completed!", "Payment Completed", "success");
      getPendingPayments();
      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      // Handle errors
      console.error(
        "Error updating items:",
        error.response?.data || error.message
      );

      // Show error alert if there's an issue
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update items.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  useEffect(() => {
    if (selectedOrigin) {
      getCompletedPayments();
    }
  }, [selectedOrigin, selectedDestination, selectedDate, selectedEndDate]);

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

  return (
    userToken && (
      <>
        <div className=" mx-auto p-6 bg-white shadow-md rounded-xl ">
          <h2 className="text-lg font-semibold mb-4">Select Locations</h2>

          <div className="flex space-x-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origin
              </label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Origin --</option>
                {allOrigins.map((origin, index) => (
                  <option key={index} value={origin.name}>
                    {origin.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Destination --</option>
                {allDestinations.map((destination, index) => (
                  <option key={index} value={destination.name}>
                    {destination.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center  bg-white shadow-md rounded-lg px-6  pb-2 -mt-4 mb-5 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col">
            <label
              htmlFor="startDate"
              className="text-sm font-semibold text-gray-700"
            >
              Select Start Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
              }}
              id="date"
              className="mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="startDate"
              className="text-sm font-semibold text-gray-700"
            >
              Select End Date
            </label>
            <input
              type="date"
              value={selectedEndDate}
              onChange={(e) => {
                setSelectedEndDate(e.target.value);
              }}
              id="date"
              className="mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <TitleCard
          title={`Out Of Office (${trans.length})`}
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
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="!font-bold !text-center">Date</th>
                  <th className="!font-bold !text-center">Boxes</th>
                  <th className="!font-bold !text-center">No of cartons</th>
                  <th className="!font-bold !text-center">Shipper Name</th>
                  <th className="!font-bold !text-center">Phone Number</th>
                  <th className="!font-bold !text-center min-w-[170px]">
                    Address
                  </th>
                  <th className="!font-bold !text-center">Status</th>
                  <th className="!font-bold !text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trans.map((l, k) => {
                  return (
                    <tr key={k}>
                      <td className="truncate">
                        {new Date(l?.created_at)?.toLocaleDateString() || "-"}
                      </td>
                      <td className="">{getBoxNumbersFromItems(l?.items)}</td>
                      <td className="truncate">
                        {l.items === "[]" ? 0 : l?.items?.length}
                      </td>
                      <td className="truncate">
                        {l.shipment_info?.shipper_name}
                      </td>
                      <td className="truncate">
                        {l.shipment_info?.shipper_phone}
                      </td>
                      <td className="truncate" style={{ maxWidth: "150px" }}>
                        {l.shipment_info?.shipper_address}
                      </td>
                      <td className="truncate">
                        {Object.entries(
                          l.items.reduce((acc, item) => {
                            acc[item.status] = (acc[item.status] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([status, count], index) => (
                          <span key={index}>
                            {count} {status}
                            {index < l.items.length - 1 && ", "}
                          </span>
                        ))}
                      </td>
                      <td>
                        <div className="flex mx-auto">
                          <button
                            className="btn btn-sm btn-primary bg-blue-600 ml-1"
                            onClick={() => viewShipmentInfo(l?.shipment_info)}
                          >
                            <InformationCircleIcon className="text-white text-2xl h-6 w-6"></InformationCircleIcon>
                          </button>
                          <button
                            className="btn btn-sm btn-accent text-white bg-green-600 ml-1"
                            onClick={() => {
                              console.log(
                                trans.find((t) => t.trans_id === l.trans_id)
                              );

                              handleProcessClick(
                                trans.find((t) => t.trans_id === l.trans_id)
                              );
                            }} // Call the function with the selected shipment
                          >
                            <ArrowsRightLeftIcon className="text-white text-2xl h-6 w-6"></ArrowsRightLeftIcon>
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

                <div className="mt-6 space-y-6">
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

export default OutOfOffice;
