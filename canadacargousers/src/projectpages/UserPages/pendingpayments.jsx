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

function PendingPayments() {
  // Updated dummy array to include weighments for each shipment

  const [trans, setTrans] = useState([]); // Initialize state with dummy data directly

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // State to hold the selected transaction ID
  const [searchText, setSearchText] = useState(""); // State for search text

  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);

  const viewShipmentInfo = (items) => {
    setShipmentModalShowing(true);

    setDisplayingShipperInfo(items);
  };

  const applySearch = (searchText) => {
    const filteredTrans = s.filter((t) =>
      Object.values(t).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchText.toLowerCase())
      )
    ); // Filter transactions based on search text across all keys
    setTrans(filteredTrans); // Update state with filtered transactions
  };

  // Function to handle the process click event
  const handleProcessClick = (shipment, pickup_fee) => {
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
      title: "Confirm",
      html: `Are you sure the payment has been made?<br> ${itemsList} <br> ${itemsPriceList}`, // Use html instead of text
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        processPayment(
          shipment?.trans_id,
          calculations?.totalSum,
          shipment.items,
          shipment?.payment_mode,
          calculations?.totalWeight,
          calculations?.shippingRate,
          calculations?.itemFee,
          0,
          0,
          0
        );
      }
    });
  };

  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [displayingShipperInfo, setDisplayingShipperInfo] = useState({});
  const [pieceTypes, setPieceTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentRate, setCurrentRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendloading, setsendloading] = useState(false);

  const getPendingPayments = async (date) => {
    try {
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getPendingPayment`,
        { date },
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
      console.error(
        "Error fetching piecetypes:",
        error.response?.data || error.message
      );
    }
  };

  const processPayment = async (
    trans_id,
    amount,
    items,
    payment_mode,
    weight,
    shipping_rate,
    carton,
    custom_fee,
    doorstep_fee,
    pickup_fee
  ) => {
    try {
      setsendloading(true);

      // console.log({
      //   trans_id,
      //   amount,
      //   items,
      //   payment_mode,
      //   weight,
      //   shipping_rate,
      //   carton,
      //   custom_fee,
      //   doorstep_fee,
      //   pickup_fee,
      // });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/completePayment`,
        {
          trans_id,
          amount,
          items,
          payment_mode,
          weight,
          shipping_rate,
          carton,
          custom_fee,
          doorstep_fee,
          pickup_fee,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire("Completed!", "Payment Completed", "success");

      if (selectedDate) {
        getPendingPayments(selectedDate);
      } else {
        const date = new Date();
        getPendingPayments(date);
      }
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
    if (selectedDate) {
      getPendingPayments(selectedDate);
    } else {
      const date = new Date();
      getPendingPayments(date);
    }
  }, [selectedDate]);

  useEffect(() => {
    getRecentShippingCost();
    getPieceTypes();
  }, []);

  function calculateShipping(items, currentRate, pieceTypes, pickup_price) {
    // console.log(pickup_price);

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

      const totalSum =
        shippingRate + itemFee + (pickup_price ? Number(pickup_price) : 0);

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
        <TitleCard
          title={`Pending Payments (${trans.length})`}
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
            <div className="flex flex-col">
              <label
                htmlFor="startDate"
                className="text-sm font-semibold text-gray-700"
              >
                Select Date
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
          </div>
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="!font-bold !text-center">Date</th>
                  <th className="!font-bold !text-center">Shipper Name</th>
                  <th className="!font-bold !text-center">Phone Number</th>
                  <th className="!font-bold !text-center min-w-[170px]">
                    Address
                  </th>
                  <th className="!font-bold !text-center">Email</th>
                  <th className="!font-bold !text-center">Number of cartons</th>
                  <th className="!font-bold !text-center">Amount</th>
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
                      <td className="truncate">{l.shipper_phone}</td>
                      <td className="truncate" style={{ maxWidth: "150px" }}>
                        {l.shipper_address}
                      </td>
                      <td className="truncate">{l.shipper_email}</td>
                      <td className="truncate">
                        {l.items === "[]" ? 0 : l?.items?.length}
                      </td>
                      <td className="truncate">
                        ₦
                        {Number(
                          calculateShipping(
                            l.items,
                            currentRate,
                            pieceTypes,
                            l.pickup_price
                          )?.totalSum
                        )?.toLocaleString()}
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
                            className="btn btn-sm btn-accent text-white bg-green-600"
                            onClick={() => {
                              setDisplayingShipperInfo(l);
                              handleProcessClick(
                                trans.find((t) => t.trans_id === l.trans_id),
                                l.pickup_price
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
          <div className="fixed inset-0 bg-gray-500  bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        )}
      </>
    )
  );
}

export default PendingPayments;
