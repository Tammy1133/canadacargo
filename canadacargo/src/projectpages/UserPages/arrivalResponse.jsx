import moment from "moment";
import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import SearchBar from "../../components/Input/SearchBar";
import Swal from "sweetalert2";
import {
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
  CogIcon,
  InformationCircleIcon,
  TruckIcon,
  ListBulletIcon,
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
import { IsCanada } from "../../utils/globalConstantUtil";

function ArrivalResponse() {
  const [trans, setTrans] = useState([]);
  const [originalTrans, setOriginalTrans] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  const [postageBill, setPostageBill] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [processchange, setProcessChange] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);
  const [deliveryModalShowing, setDeliveryModalShowing] = useState(false);
  const [itemsModalShowing, setItemsModalShowing] = useState(false);
  const [displayingShipperInfo, setDisplayingShipperInfo] = useState({});
  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [pieceTypes, setPieceTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [currentRate, setCurrentRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendloading, setsendloading] = useState(false);

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

  const viewShipmentInfo = (items) => {
    setShipmentModalShowing(true);
    setDisplayingShipperInfo(items);
  };

  const viewItemsList = (items) => {
    setItemsModalShowing(true);
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
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(calculations?.shippingRate)?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(calculations?.itemFee)?.toLocaleString()}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            IsCanada ? "$" : "₦"
          } ${Number(pickup_fee)?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(
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
      html: `Below are the details and breakdown of<br> ${itemsList} <br> ${itemsPriceList}`,
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

  const styles = StyleSheet.create({
    mytextt: { fontSize: "8px" },
    page: { padding: 20, fontFamily: "Helvetica", fontSize: 10 },
    logo: { width: "200px" },
    logo2: { maxWidth: "200px" },
    logo3: { maxWidth: "60px", marginTop: "20px" },
    invoice: {
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
    bold: {},
    myhead: { fontWeight: "bold", fontSize: "9px" },
    subtext: {
      fontWeight: "light",
      marginTop: "4px",
      marginBottom: "10px",
      fontSize: "8px",
      color: "#1e293b",
    },
    section: { marginBottom: 10 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    col: { flex: 1, paddingRight: 10 },
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
    tableRow: { flexDirection: "row" },
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
    totalRow: { backgroundColor: "#f2f2f2", fontWeight: "bold" },
    footer: { marginTop: 20, fontSize: 8, textAlign: "center" },
    highValue: {
      marginVertical: 5,
      textAlign: "center",
      fontSize: 14,
      color: "red",
    },
    skyframe: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      margin: 10,
      padding: 10,
    },
    skyblock: { flex: 1, margin: 5, padding: 10, textAlign: "center" },
    textBold: { fontSize: 12 },
    textRegular: { fontSize: 10 },
    empty: { marginTop: "10px" },
    empty2: { marginTop: "4px" },
  });

  const getPendingPayments = async (startDate, endDate) => {
    try {
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getCompletedPayments`,
        { startDate, endDate },
        {
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
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };

  const getArrivalResponsesByDate = async (startDate, endDate) => {
    try {
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getArrivalResponsesByDate`,
        { start_date: startDate, end_date: endDate },
        {
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
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };

  const getRecentShippingCost = async () => {
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
    } catch (error) {
      setTrans([]);
      console.error(
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };

  const getPieceTypes = async () => {
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
    } catch (error) {
      setTrans([]);
      console.error(
        "Error fetching piecetypes:",
        error.response?.data || error.message
      );
    }
  };

  const processPayment = async (trans_id, amount, items) => {
    try {
      setsendloading(true);
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
      console.error(
        "Error updating items:",
        error.response?.data || error.message
      );
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update items.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  const sendTrackingNotification = async (payload) => {
    // Basic validation
    if (
      !payload?.trans_id ||
      !payload?.tracking_number_delivery?.trim() ||
      !payload?.tracking_link?.trim() ||
      isNaN(parseFloat(postageBill))
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing or Invalid Fields",
        text: "Please fill in all required fields with valid values.",
      });
      return;
    }

    try {
      setsendloading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/sendTrackingNotification`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTrackingNumber("");
      setTrackingLink("");
      setPostageBill("");
      setsendloading(false);

      Swal.fire({
        icon: "success",
        title: "Notification Sent",
        text:
          response.data.message || "Tracking email has been sent successfully.",
      });

      setIsOpen(false);
      setProcessChange(!processchange);
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error sending tracking notification:",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to send tracking notification.",
      });
    }
  };

  useEffect(() => {
    let startDate, endDate;
    if (selectedDate) {
      startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0); // beginning of selectedDate

      if (selectedEndDate) {
        endDate = new Date(selectedEndDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = new Date(); // default to now
      }
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
    }

    getArrivalResponsesByDate(startDate, endDate);
  }, [selectedDate, selectedEndDate, processchange]);

  useEffect(() => {
    getRecentShippingCost();
    getPieceTypes();
  }, []);

  const handleSubmit = () => {
    const data = {
      tracking_number_delivery: trackingNumber,
      tracking_link: trackingLink,
      postagebill: postageBill,
      date: deliveryDate,
    };
    // console.log("Submitted:", data);
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setTrackingNumber("");
    setTrackingLink("");
    setPostageBill("");
    setDeliveryDate("");
  };

  return (
    userToken && (
      <div>
        <TitleCard
          title={`Arrival Response (${trans.length})`}
          topMargin="mt-2"
          TopSideButtons={
            <div className={"inline-block "}>
              <div className="input-group relative flex flex-wrap items-stretch w-full">
                <input
                  type="search"
                  value={searchText}
                  placeholder={"Search"}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    applySearch(e.target.value);
                  }}
                  className="input input-sm input-bordered w-full max-w-xs"
                />
              </div>
            </div>
          }
        >
          <div className="flex flex-col sm:flex-row items-center bg-white shadow-md rounded-lg px-6 pb-2 -mt-4 mb-5 space-y-4 sm:space-y-0 sm:space-x-4">
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
                onChange={(e) => setSelectedDate(e.target.value)}
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
                onChange={(e) => setSelectedEndDate(e.target.value)}
                id="date"
                className="mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="!font-bold !text-center">Date</th>
                  <th className="!font-bold !text-center">Full name</th>
                  <th className="!font-bold !text-center">Phone Number</th>
                  <th className="!font-bold !text-center man-w-[120px]">
                    Status
                  </th>
                  <th className="!font-bold !text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trans.map((l, k) => (
                  <tr key={k}>
                    <td className="truncate">
                      {new Date(l?.date)?.toLocaleDateString() || "-"}
                    </td>
                    <td className="truncate">{l.fullname}</td>
                    <td className="truncate">{l.phone}</td>
                    <td className="truncate" style={{ maxWidth: "150px" }}>
                      {l.arrival_status}
                    </td>
                    <td>
                      <div className="flex space-x-2 w-full !justify-center">
                        <button
                          className="btn btn-sm btn-primary bg-blue-600"
                          onClick={() => viewShipmentInfo(l)}
                        >
                          <InformationCircleIcon className="text-white text-2xl h-6 w-6" />
                        </button>
                        <button
                          className="btn btn-sm btn-accent text-white bg-green-600"
                          onClick={() => {
                            setDisplayingShipperInfo(l);
                            setDeliveryModalShowing(true);
                          }}
                        >
                          <TruckIcon className="text-white text-2xl h-6 w-6" />
                        </button>
                        <button
                          className="btn btn-sm btn-accent text-white bg-purple-600"
                          onClick={() => viewItemsList(l)}
                        >
                          <ListBulletIcon className="text-white text-2xl h-6 w-6" />
                        </button>
                        <button
                          onClick={(e) => {
                            if (l.arrival_status === "Processed") {
                              setTrackingLink(l?.tracking_link);
                              setTrackingNumber(l?.tracking_number_delivery);
                              setPostageBill(l?.postagebill);
                            }

                            setDisplayingShipperInfo(l);
                            e.stopPropagation();
                            setIsOpen(true);
                          }}
                          className="btn btn-sm btn-accent text-white bg-slate-700 hover:bg-slate-900"
                        >
                          <Cog6ToothIcon className="text-white text-2xl h-6 w-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TitleCard>

        {deliveryModalShowing && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setDeliveryModalShowing(false)}
          >
            <div
              className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
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
                <div className="mt-6 space-y-6">
                  <div>
                    <div className="mt-2 text-gray-600 space-y-2">
                      <p>
                        <span className="font-semibold">Shipment Id:</span>{" "}
                        {displayingShipperInfo?.trans_id || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {displayingShipperInfo?.shipper_phone || "N/A"}
                      </p>
                      {/* <p>
                        <span className="font-semibold">Box Number:</span>{" "}
                        {displayingShipperInfo?.boxnumber || "N/A"}
                      </p> */}
                      <p>
                        <span className="font-semibold">Full name:</span>{" "}
                        {displayingShipperInfo?.fullname || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {displayingShipperInfo?.address || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">City:</span>{" "}
                        {displayingShipperInfo?.city || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Apt Unit:</span>{" "}
                        {displayingShipperInfo?.aptunit || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Province:</span>{" "}
                        {displayingShipperInfo?.province || "N/A"}
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
                <div className="mt-6 flex justify-end">
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
            onClick={() => setShipmentModalShowing(false)}
          >
            <div
              className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Description
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {displayingShipperInfo?.comments ||
                        "No Description provided."}
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

        {itemsModalShowing && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setItemsModalShowing(false)}
          >
            <div
              className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-700">
                    Items List
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setItemsModalShowing(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Shipment Items
                  </h3>
                  {displayingShipperInfo?.items?.length > 0 ? (
                    <div className="overflow-x-auto mt-4">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th className="text-left">Name</th>
                            <th className="text-left">Weight (kg)</th>
                            <th className="text-left">Type</th>
                            <th className="text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayingShipperInfo.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.item_name?.toUpperCase() || "N/A"}</td>
                              <td>{item.weight || "N/A"}</td>
                              <td>{item.item_type?.toUpperCase() || "N/A"}</td>
                              <td>
                                {item.item_status?.toUpperCase() || "N/A"}
                              </td>{" "}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-600">
                      No items available for this shipment.
                    </p>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    onClick={() => setItemsModalShowing(false)}
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

        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={() => {
              setIsOpen(false);
              setTrackingNumber("");
              setTrackingLink("");
              setPostageBill("");
            }}
          >
            <div
              className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-md font-semibold mb-4">
                Delivery Details for{" "}
                {displayingShipperInfo?.shipper_name || "N/A"}
              </h2>
              <input
                type="text"
                placeholder="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full mb-3 p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Tracking Link"
                value={trackingLink}
                onChange={(e) => setTrackingLink(e.target.value)}
                className="w-full mb-3 p-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Postage Bill"
                value={postageBill}
                onChange={(e) =>
                  setPostageBill(e.target.value.replace(/\D/g, ""))
                }
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                className="w-full mb-3 p-2 border rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sendTrackingNotification({
                      trans_id: displayingShipperInfo?.trans_id,
                      tracking_number_delivery: trackingNumber,
                      tracking_link: trackingLink,
                      postagebill: Number(postageBill)?.toLocaleString(),
                    });
                  }}
                  disabled={sendloading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {!sendloading
                    ? displayingShipperInfo.arrival_status === "Processed"
                      ? "Send again"
                      : "Send"
                    : "Loading..."}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
}

export default ArrivalResponse;
