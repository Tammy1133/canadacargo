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
  CurrencyDollarIcon,
  InformationCircleIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { getUserDetails } from "../../projectcomponents/auth";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  PDFViewer,
  Font,
  PDFDownloadLink,
} from "@react-pdf/renderer";

import BarcodeComponent from "../UserComponents/barcodeComponent";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import DynamicBarcodeToImage from "../UserComponents/barcodeGenerator";

function PaymentResponse() {
  const [trans, setTrans] = useState([]);
  const [originaltrans, setoriginaltrans] = useState([]);
  const [originalTrans, setOriginalTrans] = useState([]);

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

  useEffect(() => {
    if (originalTrans.length === 0 && trans.length > 0) {
      setOriginalTrans(trans);
    }
  }, [trans]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // State to hold the selected transaction ID
  const [searchText, setSearchText] = useState(""); // State for search text

  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);
  const [deliveryModalShowing, setDeliveryModalShowing] = useState(false);

  const viewShipmentInfo = (items) => {
    setShipmentModalShowing(true);

    setDisplayingShipperInfo(items);
  };

  const applySearch = (searchText) => {
    const trimmedSearchText = searchText.trim();

    if (trimmedSearchText === "") {
      setTrans(originalTrans);
      return;
    }

    const filteredTrans = originalTrans.filter((t) =>
      Object.values(t).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(trimmedSearchText.toLowerCase())
      )
    );

    setTrans(filteredTrans);
  };

  // Function to handle the process click event
  const handleProcessClick = (shipment, pickup_fee) => {
    let calculations = "";
    const itemsList = `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top:10px">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Weight (kg)</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
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
          <th style="border: 1px solid #ddd; padding: 8px;">Piece Price</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Pickup Fee</th>
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
            <td style="border: 1px solid #ddd; padding: 8px;">₦ ${Number(
              calculations?.shippingRate
            )?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">₦ ${Number(
              calculations?.itemFee
            )?.toLocaleString()}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₦ ${Number(
            pickup_fee
          )?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">₦ ${Number(
              calculations?.totalSum + Number(pickup_fee)
            )?.toLocaleString()}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
    Swal.fire({
      title: "Details",
      html: `Below are the details and breakdown of<br> ${itemsList} <br> ${itemsPriceList}`, // Use html instead of text
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

  const [status, setStatus] = useState(0);

  const [loading, setLoading] = useState(false);
  const [sendloading, setsendloading] = useState(false);

  const styles = StyleSheet.create({
    mytextt: {
      fontSize: "8px",
    },
    page: {
      padding: 20,
      fontFamily: "Helvetica",
      fontSize: 10,
    },
    logo: {
      width: "200px",
    },
    logo2: {
      maxWidth: "200px",
    },
    logo3: {
      maxWidth: "60px",
      marginTop: "20px",
    },
    invoice: {
      // fontWeight: "bold",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "2px",
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    bold: {
      // fontWeight: "bold",
    },

    myhead: {
      fontWeight: "bold",
      fontSize: "9px",
    },
    subtext: {
      fontWeight: "light",
      marginTop: "4px",
      marginBottom: "10px",
      fontSize: "8px",
      color: "#1e293b",
    },

    section: {
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    col: {
      flex: 1,
      paddingRight: 10,
    },
    table: {
      marginTop: 10,
      display: "table",
      width: "100%",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableCell: {
      flex: 1,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      borderLeftWidth: 0,
      borderTopWidth: 0,
      padding: 5,
      textAlign: "center",
    },
    totalRow: {
      backgroundColor: "#f2f2f2",
      fontWeight: "bold",
    },
    footer: {
      marginTop: 20,
      fontSize: 8,
      textAlign: "center",
    },
    highValue: {
      marginVertical: 5,
      textAlign: "center",
      fontSize: 14,
      // fontWeight: "bold",
      color: "red",
    },

    skyframe: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      margin: 10,
      padding: 10,
      // border: "1 solid #ddd",
      // backgroundColor: "#f9f9f9",
    },
    skyblock: {
      flex: 1,
      margin: 5,
      padding: 10,
      // backgroundColor: "#fff",
      // border: "1 solid #ccc",
      textAlign: "center",
    },
    textBold: {
      // fontWeight: "bold",
      fontSize: 12,
    },
    textRegular: {
      fontSize: 10,
    },
    empty: {
      marginTop: "10px",
    },
    empty2: {
      marginTop: "4px",
    },
  });

  const getPendingPayments = async (startDate, endDate) => {
    try {
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getCompletedPayments`,
        {
          startDate,
          endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response.data.data);
      setTrans(response.data.data);
      setoriginaltrans(response.data.data);
      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      setTrans([]);
      setoriginaltrans([]);
      console.error(
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };
  const uniqueByTransId = (arr) => {
    const seen = new Map();
    return arr.filter((item) => {
      if (!seen.has(item.transId)) {
        seen.set(item.transId, true);
        return true;
      }
      return false;
    });
  };
  const getArrivalResponsesByDate = async (startDate, endDate) => {
    try {
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getPaymentResponsesByDate`,
        {
          start_date: startDate,
          end_date: endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log(response.data.data);
      setTrans(uniqueByTransId(response.data.data));
      setoriginaltrans(uniqueByTransId(response.data.data));

      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      setTrans([]);
      setoriginaltrans([]);

      console.error(
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };
  const verifyPayment = async (startDate, endDate) => {
    try {
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/verifyPayment`,
        {
          transId: displayingShipperInfo?.shipment_trans_id,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Payment verified successfully!");
      setsendloading(false);
      setDisplayingShipperInfo({
        ...displayingShipperInfo,
        payment_status: "VERIFIED",
      });
      fetchResponseData();
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error verifying payment:",
        error.response?.data || error.message
      );
    }
  };
  const getRecentShippingCost = async (date) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getRecentShippingCost`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCurrentRate(response?.data?.data?.newrate || 0);

      // setTrans(response.data.data);
    } catch (error) {
      setTrans([]);
      setoriginaltrans([]);

      console.error(
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };
  const getPieceTypes = async (date) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getAllPieceTypes`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPieceTypes(response?.data?.pieceTypes);

      // setTrans(response.data.data);
    } catch (error) {
      setTrans([]);
      setoriginaltrans([]);

      console.error(
        "Error fetching piecetypes:",
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

  const fetchResponseData = () => {
    let startDate, endDate;

    if (selectedDate && !selectedEndDate) {
      // If only selectedDate is provided, fetch from 00:00:00 of selectedDate to NOW
      startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0); // Start of selected day

      endDate = new Date(); // Current date & time
    }

    if (selectedDate && selectedEndDate) {
      // If both start and end date exist, use them as given
      startDate = new Date(selectedDate);
      endDate = new Date(selectedEndDate);
    }

    if (!selectedDate) {
      // Default: Yesterday morning to current time
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0); // Set to 00:00:00.000

      endDate = new Date(); // Current time
    }

    getArrivalResponsesByDate(startDate, endDate);
  };

  useEffect(() => {
    fetchResponseData();
    setStatus("");
  }, [selectedDate, selectedEndDate]);

  useEffect(() => {
    if (status === "VERIFIED") {
      setTrans(
        originaltrans.filter((eachitem) => {
          return eachitem?.payment_status?.toUpperCase() === "VERIFIED";
        })
      );
    } else if (status === "NOT VERIFIED") {
      setTrans(
        originaltrans.filter((eachitem) => {
          return eachitem?.payment_status?.toUpperCase() === "NOT VERIFIED";
        })
      );
    } else {
      setTrans(originaltrans);
    }
  }, [status]);

  useEffect(() => {
    getRecentShippingCost();
    getPieceTypes();
  }, []);

  // function calculateShipping(items, currentRate, pieceTypes, pickup_price) {
  //   if (items && items.length > 0) {
  //     const totalWeight = items.reduce(
  //       (sum, item) => sum + Number(item.weight),
  //       0
  //     );

  //     const shippingRate = totalWeight * Number(currentRate);

  //     const itemFee = items.reduce((sum, item) => {
  //       const pieceType = pieceTypes.find(
  //         (type) => type?.name?.toUpperCase() === item?.type?.toUpperCase()
  //       );
  //       return sum + (pieceType ? Number(pieceType.price) : 0);
  //     }, 0);

  //     const totalSum =
  //       shippingRate + itemFee + (pickup_price ? Number(pickup_price) : 0);

  //     return {
  //       totalWeight,
  //       shippingRate,
  //       itemFee,
  //       totalSum,
  //     };
  //   }

  //   return {
  //     totalWeight: 0,
  //     shippingRate: 0,
  //     itemFee: 0,
  //     totalSum: 0,
  //   };
  // }

  return (
    userToken && (
      <>
        <TitleCard
          title={`Payment Notification (${trans.length})`}
          topMargin="mt-2"
          TopSideButtons={
            <div className={"inline-block "}>
              <div className="input-group  relative flex flex-wrap items-stretch w-full ">
                <input
                  type="search"
                  value={searchText}
                  placeholder={"Search"}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    applySearch(e.target.value);
                  }}
                  className="input input-sm input-bordered  w-full max-w-xs"
                />
              </div>
            </div>
          }
        >
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
            <div className="flex flex-col">
              <label
                htmlFor="startDate"
                className="text-sm font-semibold text-gray-700"
              >
                Status
              </label>
              <select
                className="mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                }}
              >
                <option value="">Display All</option>
                <option value="VERIFIED">Verified</option>
                <option value="NOT VERIFIED">Not Verified</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="!font-bold !text-center">Date</th>
                  <th className="!font-bold !text-center">Receiver name</th>
                  <th className="!font-bold !text-center">Phone Number</th>
                  <th className="!font-bold !text-center man-w-[120px]">
                    Reference No
                  </th>
                  <th className="!font-bold !text-center man-w-[120px]">
                    Status
                  </th>

                  <th className="!font-bold !text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trans.map((l, k) => {
                  return (
                    <tr key={k}>
                      <td className="truncate">
                        {new Date(l?.date)?.toLocaleDateString() || "-"}
                      </td>
                      <td className="truncate">{l.receiver_name}</td>
                      <td className="truncate">{l.phone}</td>
                      <td className="truncate" style={{ maxWidth: "150px" }}>
                        {l.referenceNumber}
                      </td>
                      <td className="truncate" style={{ maxWidth: "150px" }}>
                        {l.payment_status || "NOT VERIFIED"}
                      </td>
                      <td>
                        <div className="flex space-x-2 mx-auto justify-center">
                          <button
                            className="btn btn-sm btn-primary bg-blue-600"
                            onClick={() => {
                              console.log(l);
                              viewShipmentInfo(l);
                            }}
                          >
                            <InformationCircleIcon className="text-white text-2xl h-6 w-6"></InformationCircleIcon>
                          </button>

                          <button
                            className="btn btn-sm btn-accent text-white bg-green-600"
                            onClick={() => {
                              setDisplayingShipperInfo(l);
                              setDeliveryModalShowing(true);
                            }}
                          >
                            <CurrencyDollarIcon className="text-white text-2xl h-6 w-6"></CurrencyDollarIcon>
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

        {deliveryModalShowing && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setDeliveryModalShowing(false);
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
                    Delivery Details
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setDeliveryModalShowing(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="mt-6 space-y-6">
                  {/* Shipper Information */}
                  <div>
                    <div className="mt-2 text-gray-600 space-y-2">
                      <p>
                        <span className="font-semibold">Shipment Id:</span>{" "}
                        {displayingShipperInfo?.shipment_trans_id || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Receiver Name:</span>{" "}
                        {displayingShipperInfo?.receiver_name || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Reference Number:</span>{" "}
                        {displayingShipperInfo?.referenceNumber || "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">Phone Number:</span>{" "}
                        {displayingShipperInfo?.phone || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Date Submitted:</span>{" "}
                        {displayingShipperInfo?.date || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end">
                  {displayingShipperInfo?.payment_status?.toUpperCase() !==
                    "VERIFIED" && (
                    <button
                      className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 mr-3"
                      disabled={sendloading}
                      onClick={() => {
                        const isConfirmed = window.confirm(
                          "Are you sure you want to verify this payment?"
                        );
                        if (isConfirmed) {
                          verifyPayment();
                        }
                      }}
                    >
                      {!sendloading ? "Verify Payment" : "Loading..."}
                    </button>
                  )}

                  <button
                    className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    onClick={() => setDeliveryModalShowing(false)}
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
                    Shipment Information
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
                  {/* <button
                    className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    onClick={() => setShipmentModalShowing(false)}
                  >
                    Edit
                  </button> */}
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

export default PaymentResponse;
