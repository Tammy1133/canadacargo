import moment from "moment";
import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import SearchBar from "../../components/Input/SearchBar";
import Swal from "sweetalert2";
import {
  ArrowsRightLeftIcon,
  InformationCircleIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { getUserDetails } from "../../projectcomponents/auth";
import axios from "axios";

function PendingWeighments() {
  const [trans, setTrans] = useState([]);

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
  const [selectedId, setSelectedId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const viewWeighmentInfo = (data) => {
    setIsModalOpen(true);

    setDisplayingShipperInfo(data);
  };
  const addItem = () => {
    const newItem = { name: "", weight: 0, type: pieceTypes[0]?.name }; // Define a new item structure

    // Safely parse the existing items or initialize an empty array
    let currentItems = [];
    try {
      currentItems = Array.isArray(displayingShipperInfo.items)
        ? displayingShipperInfo.items
        : JSON.parse(displayingShipperInfo.items || "[]");
    } catch (error) {
      console.error("Invalid JSON in items:", error);
      currentItems = [];
    }

    // Add only the new item to the current items
    const updatedItems = [...currentItems, newItem];

    // Update the displaying shipper info state
    setDisplayingShipperInfo({
      ...displayingShipperInfo,
      items: updatedItems,
    });
  };

  const removeItem = (itemName) => {
    // Filter out the item with the specified name
    const updatedItems = displayingShipperInfo.items.filter(
      (currentItem) => currentItem.name !== itemName
    );

    // Update the displaying shipper info state
    setDisplayingShipperInfo({
      ...displayingShipperInfo,
      items: updatedItems,
    });
  };

  const generateRandomWeight = () => {
    return Math.floor(Math.random() * 100) + 1; // Generate random weight between 1 and 100kg
  };

  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);

  const viewShipmentInfo = (data) => {
    setShipmentModalShowing(true);
    setDisplayingShipperInfo(data);
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

  const handleProcessClick = async (shipment) => {
    // Check if there are weighments and each weighment has a name and weight

    if (
      shipment.items.length > 0 &&
      shipment.items.every((item) => item.name && item.weight)
    ) {
      // Create a table of items
      const itemsList = `
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top:10px">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            ${shipment.items
              .map(
                (item) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.weight}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      `; // Create a table of items

      Swal.fire({
        title: "Confirm",
        html: `Do you want to push the following items for payment?<br>${itemsList}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: loading ? "Processing..." : "Yes, proceed!", // Initial button text based on loading state
        cancelButtonText: "No, cancel!",
        didOpen: () => {
          const confirmButton = Swal.getConfirmButton();

          // Disable the button when loading is true
          confirmButton.disabled = loading;
        },
      }).then((result) => {
        if (result.isConfirmed) {
          processPayment(shipment); // Call your payment processing function
        }
      });
    } else {
      // Show an error if there are no valid items
      Swal.fire(
        "Error!",
        "Please ensure there is at least one item with a name and weight.",
        "error"
      );
    }
  };

  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [displayingShipperInfo, setDisplayingShipperInfo] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendloading, setsendloading] = useState(false);

  const [pieceTypes, setPieceTypes] = useState([]);

  const getPendingWeighments = async (date) => {
    try {
      setsendloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getPendingWeighments`,
        { date },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log(response.data);

      setTrans(response.data.data);
      setsendloading(false);
    } catch (error) {
      setTrans([]);

      setsendloading(false);
      console.error(
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };

  const updateItems = async (trans_id, items) => {
    try {
      // Validate the items before sending the request
      for (let item of items) {
        // Check if the item has a name and a valid weight
        if (!item.name || item.name.trim() === "") {
          throw new Error("All items must have a valid name.");
        }

        const weight = parseFloat(item.weight);

        // Check if the weight is a valid number and not 0 or '0'
        if (isNaN(weight) || weight <= 0) {
          throw new Error("All items must have a valid weight greater than 0.");
        }
      }

      setLoading(true);

      // Sending a POST request to update items
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateItems`,
        { trans_id, items },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Check if response is successful, then update state
      if (response.status === 200) {
        // Update the transaction items in the state
        const updatedTrans = trans.map((eachitem) => {
          if (eachitem.trans_id === trans_id) {
            return { ...eachitem, items: items, type: pieceTypes[0]?.name }; // Update items for matching trans_id
          }
          return eachitem;
        });

        // Set the updated transactions in state
        setTrans(updatedTrans);

        // Show SweetAlert if the items were updated
        Swal.fire({
          title: "Success!",
          text: "Items have been updated successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }

      setIsModalOpen(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
  const processPayment = async (shipment) => {
    try {
      setsendloading(true);
      // throw new Error("");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/processPayment`,
        { trans_id: shipment?.trans_id },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire("Completed!", "You can proceed to process payment", "success");

      if (selectedDate) {
        getPendingWeighments(selectedDate);
      } else {
        const date = new Date();
        getPendingWeighments(date);
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
      getPendingWeighments(selectedDate);
    } else {
      const date = new Date();
      getPendingWeighments(date);
    }
  }, [selectedDate]);

  // console.log(displayingShipperInfo);

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

      // setTrans(response.data.data);
    } catch (error) {
      setTrans([]);
      console.error(
        "Error fetching piecetypes:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    getPieceTypes();
  }, []);

  return (
    userToken && (
      <>
        <TitleCard
          title={`Pending Weighments (${trans.length})`}
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
                            onClick={() => viewWeighmentInfo(l)}
                          >
                            <ScaleIcon className="text-white text-2xl h-6 w-6"></ScaleIcon>
                          </button>
                          <button
                            className="btn btn-sm btn-accent text-white bg-green-600"
                            onClick={() => {
                              setDisplayingShipperInfo(l);
                              handleProcessClick(l);
                            }}
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
        {isModalOpen && ( // Modal rendering
          <div
            className="fixed inset-0  bg-black bg-opacity-50 overflow-y-auto"
            onClick={() => {
              setIsModalOpen(false);
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
                  Add Items for {displayingShipperInfo?.shipper_name}
                </h2>
                {(displayingShipperInfo?.items
                  ? Array.isArray(displayingShipperInfo.items)
                    ? displayingShipperInfo.items
                    : JSON.parse(displayingShipperInfo.items || "[]")
                  : []
                ).map((item, index) => (
                  <div key={index} className="mb-4">
                    <label className="block mb-1">
                      Item {index + 1} Name:
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          // Create a copy of the current weighments and update the name
                          const updatedWeighments = [
                            ...displayingShipperInfo.items,
                          ];
                          updatedWeighments[index].name = e.target.value;

                          // Update displayingShipperInfo state
                          setDisplayingShipperInfo({
                            ...displayingShipperInfo,
                            weighments: updatedWeighments,
                          });
                        }}
                        className="border rounded p-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </label>

                    <label className="block mb-1">
                      Type:
                      <select
                        name=""
                        id=""
                        value={item.type}
                        className="border rounded p-1 !z-[99999999] w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onChange={(e) => {
                          const updatedItems = displayingShipperInfo.items.map(
                            (currentItem, itemindex) => {
                              if (itemindex === index) {
                                return {
                                  ...currentItem,
                                  type: e.target.value,
                                };
                              }
                              return currentItem;
                            }
                          );

                          setDisplayingShipperInfo({
                            ...displayingShipperInfo,
                            items: updatedItems,
                          });
                        }}
                      >
                        {pieceTypes.map((eachitem) => {
                          return (
                            <option key={eachitem.name} value={eachitem.name}>
                              {eachitem.name}
                            </option>
                          );
                        })}
                      </select>
                    </label>

                    <label className="block mb-1 mt-1">
                      Weight:
                      <input
                        type="number"
                        value={item.weight}
                        readOnly
                        className="border rounded p-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </label>

                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => {
                          // Generate a random weight
                          const randomWeight = generateRandomWeight();

                          // Create a copy of the current weighments and update the weight
                          const updatedWeighments = [
                            ...displayingShipperInfo.items,
                          ];
                          updatedWeighments[index].weight = randomWeight; // Set random weight

                          // Update displayingShipperInfo state
                          setDisplayingShipperInfo({
                            ...displayingShipperInfo,
                            items: updatedWeighments,
                          });
                        }}
                        className="btn btn-sm btn-primary"
                      >
                        Weigh
                      </button>

                      <button
                        onClick={() => removeItem(item.name)}
                        className="btn btn-sm btn-danger"
                      >
                        Remove Item
                      </button>
                    </div>
                  </div>
                ))}
                <div
                  className={`flex space-x-2 mt-4 ${
                    trans.find((t) => t.id === selectedId)?.weighments
                      .length === 0
                      ? "justify-center"
                      : "justify-end"
                  }`}
                >
                  <button
                    onClick={addItem}
                    className=" btn btn-sm text-white btn-success"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() =>
                      updateItems(
                        displayingShipperInfo?.trans_id,
                        displayingShipperInfo?.items
                      )
                    }
                    disabled={loading}
                    className=" btn-secondary  btn btn-sm"
                  >
                    {loading ? "Loading.." : "Save"}
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

export default PendingWeighments;
