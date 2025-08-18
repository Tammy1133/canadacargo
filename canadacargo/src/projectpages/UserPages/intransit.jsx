import moment from "moment";
import { useEffect, useRef, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";

import { EyeIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { getUserDetails } from "../../projectcomponents/auth";
import { getBoxNumbersFromItems } from "../../utils/globalConstantUtil";

function InTransit() {
  const [trans, setTrans] = useState([]);
  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [displayingShipperInfo, setDisplayingShipperInfo] = useState({});
  const [sendloading, setsendloading] = useState(false);
  const [originalTrans, setOriginalTrans] = useState([]);
  const [allOrigins, setAllOrigins] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedTrackingNumber, setSelectedTrackingNumber] = useState("");
  const [trackingNumbers, setTrackingNumbers] = useState([]);

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

  const viewShipmentInfo = (id) => {
    setShipmentModalShowing(true);
  };

  const viewBarcodeInfo = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  // Extract unique tracking numbers from originalTrans
  useEffect(() => {
    const uniqueTrackingNumbers = [
      ...new Set(
        originalTrans
          .flatMap((t) => t.items)
          .map((item) => item.tracking_number)
          .filter((tracking) => tracking) // Remove null/undefined
      ),
    ];
    setTrackingNumbers(uniqueTrackingNumbers);
  }, [originalTrans]);

  const applySearch = (searchText, trackingNumber) => {
    let filteredTrans = originalTrans;

    // Apply search text filter
    if (searchText.trim()) {
      filteredTrans = filteredTrans.filter((t) =>
        Object.values(t?.shipment_info).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchText.trim().toLowerCase())
        )
      );
    }

    // Apply tracking number filter
    if (trackingNumber) {
      filteredTrans = filteredTrans.filter((t) =>
        t.items.some((item) => item.tracking_number === trackingNumber)
      );
    }

    setTrans(filteredTrans);
  };

  const getOutOfOffice = async () => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const formattedStartDate = selectedDate || currentDate;
      const formattedEndDate = selectedEndDate || currentDate;
      setsendloading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getItemsInTransit`,
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
      setOriginalTrans(response.data.data); // Store original data
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
    if (selectedOrigin) {
      getOutOfOffice();
    }
  }, [selectedOrigin, selectedDestination, selectedDate, selectedEndDate]);

  return (
    userToken && (
      <>
        <div className="mx-auto p-6 bg-white shadow-md rounded-xl">
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
              htmlFor="endDate"
              className="text-sm font-semibold text-gray-700"
            >
              Select End Date
            </label>
            <input
              type="date"
              value={selectedEndDate}
              onChange={(e) => setSelectedEndDate(e.target.value)}
              id="endDate"
              className="mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <TitleCard
          title="Items in transit"
          topMargin="mt-2"
          TopSideButtons={
            <div className="flex items-center">
              <div className="flex flex-col mr-2">
                <select
                  value={selectedTrackingNumber}
                  onChange={(e) => {
                    setSelectedTrackingNumber(e.target.value);
                    applySearch(searchText, e.target.value);
                  }}
                  className="mt-1 border rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none text-base"
                >
                  <option value="">-- Select Tracking Number --</option>
                  {trackingNumbers.map((tracking, index) => (
                    <option key={index} value={tracking}>
                      {tracking}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group relative flex flex-wrap items-stretch w-full">
                <input
                  type="search"
                  value={searchText}
                  placeholder="Search"
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    applySearch(e.target.value, selectedTrackingNumber);
                  }}
                  className="input input-sm input-bordered w-full max-w-xs"
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
                  <th className="!font-bold !text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {trans.map((l, k) => (
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
                    <td className="truncate max-w-[200px]">
                      {l.shipment_info?.receiver_address}
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
                          <InformationCircleIcon className="text-white text-2xl h-6 w-6" />
                        </button>
                        <button
                          className="btn btn-sm btn-secondary bg-gray-600"
                          onClick={() => {
                            viewBarcodeInfo(l.trans_id);
                            setDisplayingShipperInfo(l.shipment_info);
                          }}
                        >
                          <EyeIcon className="text-white text-2xl h-6 w-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TitleCard>

        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="flex justify-center mx-auto items-center w-screen h-screen mt-[40px]">
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
                        <th className="px-4 py-2 text-left border-b text-gray-600 font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left border-b text-gray-600 font-semibold">
                          Tracking Number
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
                            <td className="px-4 py-2 border-b">
                              {item.status}
                            </td>
                            <td className="px-4 py-2 border-b">
                              {item.tracking_number || "N/A"}
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

export default InTransit;
