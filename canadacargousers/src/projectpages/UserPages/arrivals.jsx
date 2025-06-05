import { useEffect, useRef, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import Swal from "sweetalert2";
import {
  CheckBadgeIcon,
  EnvelopeIcon,
  EyeIcon,
  InboxArrowDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { getUserDetails } from "../../projectcomponents/auth";
import axios from "axios";

function Arrivals() {
  const s = [];

  const [trans, setTrans] = useState([]);
  const [disptrans, setDispTrans] = useState([]);

  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [tracking_numbers, setTracking_numbers] = useState([]);
  const [displayingTracking, setdisplayingTracking] = useState("");

  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [displayingShipperInfo, setDisplayingShipperInfo] = useState({});
  const [sendloading, setsendloading] = useState(false);
  const [chosenTrackingNumber, setChosenTrackingNumber] = useState("");

  const viewShipmentInfo = (id) => {
    setShipmentModalShowing(true);
  };
  const viewBarcodeInfo = (id) => {
    setSelectedId(id); // Save the selected ID
    setIsModalOpen(true); // Open modal when button is clicked
  };

  const getItemsArrived = async () => {
    try {
      setsendloading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getItemsArrived`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const trackingNumbers = response.data.data.flatMap((item) =>
        item.items.map((i) => i.tracking_number)
      );

      const uniqueTrackingNumbers = [...new Set(trackingNumbers)];

      console.log(
        response.data.data,
        uniqueTrackingNumbers.filter((eachItem) => {
          return eachItem !== "";
        })
      );

      setTracking_numbers(
        uniqueTrackingNumbers.filter((eachItem) => {
          return eachItem !== "";
        })
      );

      setDispTrans(response.data.data);
      setTrans(response.data.data);

      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      setDispTrans([]);
      setTrans([]);
      console.error(
        "Error fetching completed payments:",
        error.response?.data || error.message
      );
    }
  };
  const sendArrivalNotifications = async (notifications) => {
    try {
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/sendArrivalNotifications`,
        { notifications },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log(response);

      Swal.fire("Success!", "Mails has been sent successfully.", "success");

      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error fetching completed payments:",
        error.response?.data || error.message
      );
    }
  };
  const sendArrivalNotification = async (
    senderEmail,
    receiverEmail,
    trans_id
  ) => {
    try {
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/sendArrivalNotification`,
        { senderEmail, receiverEmail, trans_id },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire("Success!", "Mail has been sent successfully.", "success");

      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error fetching completed payments:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    getItemsArrived();
  }, []);

  const handleSendMail = (id, items) => {
    // console.log(items);

    let filteredItems = items?.filter((eachItem) => {
      return eachItem.status === "Arrived";
    });

    Swal.fire({
      title: "Are you sure?",
      text: `This will send an email for ${filteredItems.length} Arrived item(s)`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, send it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        sendArrivalNotifications([
          {
            senderEmail: displayingShipperInfo?.shipper_email,
            receiverEmail: displayingShipperInfo?.receiver_email,
            trans_id: displayingShipperInfo?.trans_id,
          },
        ]);
      }
    });
  };

  const [allprocessModalShowing, setallprocessModalShowing] = useState(false);

  const processAllInfo = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `This will send an email for all arrived items in the list?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, send it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        sendArrivalNotifications(
          disptrans.map((eachItem) => {
            return {
              senderEmail: eachItem?.shipment_info?.shipper_email,
              receiverEmail: eachItem?.shipment_info?.receiver_email,
              trans_id: eachItem?.trans_id,
            };
          })
        );
      }
    });
  };

  const handleSendMailForBatch = (batchId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will send emails for all items in the same arrival batch.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, send them!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Logic for sending mail for the batch
        // console.log("Mail sent for batch:", batchId); // Replace with your API call or logic

        Swal.fire(
          "Success!",
          "Emails for all items in the batch have been sent successfully.",
          "success"
        );
      }
    });
  };
  const applySearch = (searchText) => {
    const filteredTrans = s.filter((t) =>
      Object.values(t).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchText.toLowerCase())
      )
    ); // Filter transactions based on search text across all keys
    setDispTrans(filteredTrans); // Update state with filtered transactions
    setdisplayingTracking(filteredTrans);
  };

  useEffect(() => {
    if (!chosenTrackingNumber) {
      setDispTrans(trans);
    } else {
      setDispTrans(
        trans.filter((transaction) =>
          transaction.items.some(
            (item) => item.tracking_number === chosenTrackingNumber
          )
        )
      );
    }
  }, [chosenTrackingNumber]);

  return (
    userToken && (
      <>
        <TitleCard
          title="Pending Delivered items"
          topMargin="mt-2"
          TopSideButtons={
            <div className="flex flex-wrap gap-2">
              <select
                name=""
                id=""
                className="input input-sm input-bordered w-full "
                value={chosenTrackingNumber}
                onChange={(e) => {
                  setChosenTrackingNumber(e.target.value);
                }}
              >
                <option value="">All Tracking Numbers</option>

                {tracking_numbers?.map((eachitem) => {
                  return <option value={eachitem}>{eachitem}</option>;
                })}
              </select>
              <div className="input-group  relative flex flex-wrap items-stretch w-full ">
                <input
                  type="search"
                  value={searchText}
                  placeholder={"Search"}
                  onChange={(e) => {
                    setSearchText(e.target.value); // Update search text state
                    applySearch(e.target.value); // Apply search on change
                  }}
                  className="input input-sm input-bordered  w-full"
                />
              </div>
            </div>
          }
        >
          <div className="flex justify-end mb-3 z-[6000]">
            <button
              className="btn btn-sm btn-secondary bg-green-600"
              onClick={() => {
                processAllInfo();
              }}
            >
              Send Mail To All
              <CheckBadgeIcon className="text-white text-2xl h-6 w-6"></CheckBadgeIcon>
            </button>
          </div>
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
                {disptrans.map((l, k) => {
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
                              viewBarcodeInfo(l.item_trans_id);
                              setDisplayingShipperInfo(l.shipment_info);
                            }}
                          >
                            <EyeIcon className="text-white text-2xl h-6 w-6"></EyeIcon>
                          </button>
                          <button
                            className="btn btn-sm bg-blue-600 text-white flex items-center space-x-2 px-4  rounded shadow hover:bg-blue-700 focus:outline-none"
                            onClick={() => {
                              handleSendMail(l.id, l?.items);
                              setDisplayingShipperInfo(l.shipment_info);
                            }}
                          >
                            <EnvelopeIcon className="h-5 w-5" />
                          </button>

                          {/* Button: Send Mail for All Items in Batch */}
                          {/* <button
                          className="btn btn-sm bg-green-600 text-white flex items-center space-x-2 px-4 rounded shadow hover:bg-green-700 focus:outline-none"
                          onClick={() => handleSendMailForBatch(l.batchId)}
                        >
                          <InboxArrowDownIcon className="h-5 w-5" />
                        </button> */}
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
            className="fixed inset-0 z-[500000] bg-black bg-opacity-50  overflow-y-auto"
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
                      </tr>
                    </thead>
                    <tbody>
                      {trans
                        .find((t) => t.item_trans_id === selectedId)
                        ?.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-100">
                            <td className="px-4 py-2 border-b">{item.name}</td>
                            <td className="px-4 py-2 border-b">
                              {item.weight}
                            </td>
                            <td className="px-4 py-2 border-b">
                              {item.status}
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

export default Arrivals;
