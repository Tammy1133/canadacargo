import moment from "moment";
import { useEffect, useRef, useState } from "react";
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
import Select from "react-select";

function PendingWeighments() {
  const [trans, setTrans] = useState([]);
  const [originalTrans, setOriginalTrans] = useState([]);

  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [data, setData] = useState("");
  const readerRef = useRef(null);
  const portRef = useRef(null);

  const connectToScale = async () => {
    try {
      setConnectionStatus("connecting");
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      setConnectionStatus("connected");
    } catch (err) {
      console.error("Serial connection error:", err);
      setConnectionStatus("error");
    }
  };

  const readFromScale = async () => {
    try {
      if (!readerRef.current) {
        console.warn("Not connected to scale.");
        return;
      }

      let latestLine = "";
      const startTime = Date.now();

      while (Date.now() - startTime < 1000) {
        const { value, done } = await readerRef.current.read();
        if (done || !value) break;

        const lines = value.split(/[\r\n]+/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (/^\d+\.\d+$/.test(trimmed)) {
            latestLine = trimmed;
          }
        }
      }

      if (latestLine) {
        const rawValue = parseFloat(latestLine);
        const decimal = rawValue - Math.floor(rawValue);
        const rounded =
          decimal > 0.2 ? Math.ceil(rawValue) : Math.floor(rawValue);

        return rounded;
      }
    } catch (err) {
      console.error("Read error:", err);
    }
  };

  const disconnect = async () => {
    setConnectionStatus("disconnecting");
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (err) {
      console.error("Disconnection error:", err);
    }
    setConnectionStatus("disconnected");
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

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
  const [selectedId, setSelectedId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [selectedFees, setSelectedFees] = useState([]);
  const [feeQuantities, setFeeQuantities] = useState({});
  function safeParseArray(value) {
    if (!value) return [];

    try {
      if (Array.isArray(value)) {
        return value;
      }

      const parsed = JSON.parse(value);

      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function safeParseObject(value) {
    if (!value) return {};

    console.log(typeof value);

    try {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return value;
      }

      const parsed = JSON.parse(value);

      return typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
        ? parsed
        : {};
    } catch (e) {
      return {};
    }
  }

  const viewWeighmentInfo = (data) => {
    setIsModalOpen(true);

    setSelectedFees(safeParseArray(data?.extra_fees));
    setFeeQuantities(safeParseObject(data?.feequantities));

    setDisplayingShipperInfo(data);
  };
  const addItem = () => {
    const newItem = {
      name: "",
      weight: 0,
      box_number: "",
      type: pieceTypes[0]?.name,
    };
    let currentItems = [];
    try {
      currentItems = Array.isArray(displayingShipperInfo.items)
        ? displayingShipperInfo.items
        : JSON.parse(displayingShipperInfo.items || "[]");
    } catch (error) {
      console.error("Invalid JSON in items:", error);
      currentItems = [];
    }
    const updatedItems = [...currentItems, newItem];
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

    // Update the transactions with the filtered results
    setTrans(filteredTrans);
  };

  const handleProcessClick = async (shipment) => {
    let shipmentfees = safeParseArray(shipment?.extra_fees);
    let shipmentfeequantities = safeParseObject(shipment?.feequantities);

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
      const extraFeeList = `
      <h4>Extra Fee </h4>
      ${
        shipment?.extra_fees
          ? `<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top:10px">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
                <th style="border: 1px solid #ddd; padding: 8px;">
                  Price
                </th>
                <th style="border: 1px solid #ddd; padding: 8px;">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody>
              
            ${safeParseArray(shipment?.extra_fees)
              .map(
                (item) =>
                  `<tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">
                    ${item?.value}
                  </td>
                  <td style="border: 1px solid #ddd; padding: 8px;">
                    ₦ ${Number(item?.price)?.toLocaleString()}
                  </td>
                  <td style="border: 1px solid #ddd; padding: 8px;">
                    ${shipmentfeequantities[item?.value] || 1}
                  </td>
                </tr>`
              )
              .join("")}
            </tbody>
          </table>
          <br>
          <h3> Total Extra Fee: ₦ ${shipmentfees
            .reduce((total, fee) => {
              const qty = shipmentfeequantities[fee.value] || 1;
              return total + qty * fee.price;
            }, 0)
            .toFixed(2)} </h3>`
          : `<h6>No Extra Fee Added </h6>`
      }
       
      `; // Create a table of items

      Swal.fire({
        title: "Confirm",
        html: `Have you confirmed all cartons have been weighed?<br>${itemsList} <br> ${extraFeeList}`,
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
  const [extraFees, setExtraFees] = useState([]);

  const feeOptions = extraFees.map((fee) => ({
    label: `${fee.name} (₦ ${fee.price})`,
    value: fee.name,
    price: parseFloat(fee.price),
    quantity: 1,
  }));

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

      setOriginalTrans(response.data.data);
      setTrans(response.data.data);
      setsendloading(false);

      getAllExtraFees();
    } catch (error) {
      setTrans([]);

      setsendloading(false);
      console.error(
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };

  const getAllExtraFees = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getAllExtraFees`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log(response.data.pieceTypes);

      setExtraFees(response.data.pieceTypes);
    } catch (error) {
      console.error(
        "Error fetching type:",
        error.response?.data || error.message
      );
    }
  };

  const updateItems = async (trans_id, items) => {
    try {
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
        if (!item?.box_number) {
          throw new Error("Box number is required");
        }
      }

      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateItems`,
        {
          trans_id,
          items,
          extra_fees: selectedFees,
          total_extra_fees: selectedFees
            .reduce((total, fee) => {
              const qty = feeQuantities[fee.value] || 1;
              return total + qty * fee.price;
            }, 0)
            .toFixed(2),
          feequantities: feeQuantities,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const updatedTrans = trans.map((eachitem) => {
          if (eachitem.trans_id === trans_id) {
            return {
              ...eachitem,
              items: items,
              type: pieceTypes[0]?.name,
              extra_fees: selectedFees,
              feequantities: feeQuantities,
            };
          }
          return eachitem;
        });
        setTrans(updatedTrans);
        setSelectedFees([]);
        setFeeQuantities({});

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
        <div className="flex items-center">
          <p>
            <span className="mr-3">Scale Status:</span>
            {connectionStatus?.toUpperCase() === "CONNECTED" ? (
              <span className="font-semibold text-lg text-green-700">
                Connected
              </span>
            ) : (
              <span className="font-semibold text-lg text-red-700">
                Disconnected
              </span>
            )}
          </p>
          <button
            onClick={connectToScale}
            className="bg-blue-500 text-white px-4 py-1 m-2 rounded"
          >
            Connect
          </button>

          {/* <button className="" onClick={disconnect}>
            Disconnect
          </button> */}
        </div>
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

            <div className="flex justify-between">
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
                  Add Cartons for {displayingShipperInfo?.shipper_name}
                </h2>
                {(displayingShipperInfo?.items
                  ? Array.isArray(displayingShipperInfo.items)
                    ? displayingShipperInfo.items
                    : JSON.parse(displayingShipperInfo.items || "[]")
                  : []
                ).map((item, index) => (
                  <div key={index} className="mb-4">
                    <label className="block mb-1">
                      Carton {index + 1} item list:
                      {/* Item Name Input */}
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updatedItems = [...displayingShipperInfo.items];
                          updatedItems[index].name = e.target.value;

                          setDisplayingShipperInfo({
                            ...displayingShipperInfo,
                            items: updatedItems,
                          });
                        }}
                        className="border rounded p-1 w-full mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <div className="my-2">Carton {index + 1} Box Number:</div>
                      <input
                        type="text"
                        value={item.box_number || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) {
                            const updatedItems = [
                              ...displayingShipperInfo.items,
                            ];
                            updatedItems[index].box_number = value;
                            setDisplayingShipperInfo({
                              ...displayingShipperInfo,
                              items: updatedItems,
                            });
                          }
                        }}
                        className="border rounded p-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Box number"
                        inputMode="numeric"
                        pattern="\d*"
                      />
                    </label>
                    <div className="mb-2 mt-3">
                      Carton {index + 1} Piece type:
                    </div>
                    <select
                      value={item.type || ""}
                      onChange={(e) => {
                        const updatedItems = [...displayingShipperInfo.items];
                        updatedItems[index].type = e.target.value;

                        setDisplayingShipperInfo({
                          ...displayingShipperInfo,
                          items: updatedItems,
                        });
                      }}
                      className="border rounded p-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select Piece Type</option>
                      {pieceTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>

                    <label className="block my-5">
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
                        onClick={async () => {
                          const scaleWeight = await readFromScale();

                          const updatedWeighments = [
                            ...displayingShipperInfo.items,
                          ];
                          updatedWeighments[index].weight = scaleWeight;

                          setDisplayingShipperInfo({
                            ...displayingShipperInfo,
                            items: updatedWeighments,
                          });
                        }}
                        disabled={!readerRef.current}
                        className="btn btn-sm btn-primary"
                      >
                        {!readerRef.current ? "Not Connected" : "Weigh"}
                      </button>
                      {/* <button
                        onClick={async () => {
                          const scaleWeight = generateRandomWeight();

                          const updatedWeighments = [
                            ...displayingShipperInfo.items,
                          ];
                          updatedWeighments[index].weight = scaleWeight;

                          setDisplayingShipperInfo({
                            ...displayingShipperInfo,
                            items: updatedWeighments,
                          });
                        }}
                        className="btn btn-sm btn-primary"
                      >
                        Weigh
                      </button> */}
                      <button
                        onClick={() => removeItem(item.name)}
                        className="btn btn-sm btn-danger"
                      >
                        Remove Item
                      </button>
                    </div>
                  </div>
                ))}

                {displayingShipperInfo.items?.length > 0 && (
                  <div className="my-6">
                    <h3 className="text-md font-semibold mb-2">
                      Select Extra Fees
                    </h3>
                    <Select
                      options={feeOptions}
                      isMulti
                      className="mb-4"
                      onChange={(selected) => {
                        setSelectedFees(selected || []);
                        // Reset quantity state for unselected fees
                        const updatedQuantities = {};
                        (selected || []).forEach((fee) => {
                          updatedQuantities[fee.value] =
                            feeQuantities[fee.value] || 1;
                        });
                        setFeeQuantities(updatedQuantities);
                      }}
                      value={selectedFees}
                    />

                    {selectedFees.map((fee) => (
                      <div
                        key={fee.value}
                        className="flex items-center justify-between border rounded p-2 mb-2"
                      >
                        <span>{fee.label}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() => {
                              setFeeQuantities((prev) => ({
                                ...prev,
                                [fee.value]: Math.max(
                                  1,
                                  (prev[fee.value] || 1) - 1
                                ),
                              }));
                            }}
                          >
                            -
                          </button>
                          <span className="w-8 text-center">
                            {feeQuantities[fee.value] || 1}
                          </span>
                          <button
                            type="button"
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() => {
                              setFeeQuantities((prev) => ({
                                ...prev,
                                [fee.value]: (prev[fee.value] || 1) + 1,
                              }));
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* <div className="mt-4 font-bold">
                      Total Fees: 
                      {selectedFees
                        .reduce((total, fee) => {
                          const qty = feeQuantities[fee.value] || 1;
                          return total + qty * fee.price;
                        }, 0)
                        .toFixed(2)}
                    </div> */}
                  </div>
                )}

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
                    Add Carton
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
