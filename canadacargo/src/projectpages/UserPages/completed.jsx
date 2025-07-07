import moment from "moment";
import { useEffect, useRef, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { useReactToPrint } from "react-to-print";

import SearchBar from "../../components/Input/SearchBar";
import Swal from "sweetalert2";
import BarcodeComponent from "../UserComponents/barcodeComponent";
import BarcodeMultipleComponent from "../UserComponents/barcodeMultipleComponent";
import {
  Bars3Icon,
  EyeIcon,
  InformationCircleIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

function Completed() {
  const s = [
    {
      id: 1,
      shipperName: "John Doe",
      phoneNumber: "123-456-7890",
      address: "123 Main St, Paris",
      email: "john@example.com",
      trackingId: "33535353535353",

      numberOfItems: 1,
      shipmentInfo: { weight: "10kg", status: "Pending" },
      weighments: [
        {
          name: "Box 1",
          weight: 50,
          transaction_id: "373777782828822",
          item_transaction_id: "373777782828822_4743bb333yb33",
        },
      ],
    },
    {
      id: 2,
      shipperName: "Jane Smith",
      phoneNumber: "987-654-3210",
      address: "456 Elm St, London",
      email: "jane@example.com",
      trackingId: "33535353535353",
      numberOfItems: 1,
      shipmentInfo: { weight: "5kg", status: "Completed" },
      weighments: [
        {
          name: "Box 1",
          weight: 50,
          transaction_id: "373777782828822",
          item_transaction_id: "373777782828822_4743bb333yb33",
        },
      ],
    },
    // ... add more dummy data as needed
  ];

  const [trans, setTrans] = useState(s); // Initialize state with dummy data directly

  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);

  const viewShipmentInfo = (id) => {
    setShipmentModalShowing(true);
  };

  useEffect(() => {
    const updatedTrans = trans.map((t) => {
      const newNumberOfItems = t.weighments.length;
      if (t.numberOfItems !== newNumberOfItems) {
        return { ...t, numberOfItems: newNumberOfItems };
      }
      return t;
    });

    if (JSON.stringify(trans) !== JSON.stringify(updatedTrans)) {
      setTrans(updatedTrans);
    }
  }, [trans]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // State to hold the selected transaction ID
  const [searchText, setSearchText] = useState(""); // State for search text

  const viewBarcodeInfo = (id) => {
    setSelectedId(id); // Save the selected ID
    setIsModalOpen(true); // Open modal when button is clicked
  };

  const addItem = () => {
    const newTrans = trans.map((t) => {
      if (t.id === selectedId) {
        return { ...t, weighments: [...t.weighments, { name: "", weight: 0 }] }; // Add a new item to the selected transaction's weighments
      }
      return t;
    });

    console.log(newTrans);

    setTrans(newTrans);
  };

  const barcodeRef = useRef(null); // Reference to the BarcodeComponent

  const handlePrint = () => {
    if (barcodeRef.current) {
      barcodeRef.current.print(); // Call the print method on the BarcodeComponent ref
    }
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

  return (
    <>
      <TitleCard
        title="Completed"
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
              type="date"
              id="endDate"
              className="mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex flex-col">
            <label
              htmlFor="sortBy"
              className="text-sm font-semibold text-gray-700"
            >
              Sort By (Date)
            </label>
            <select
              id="sortBy"
              className="mt-1 border rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="date">Asc</option>
              <option value="name">Dsc</option>
            </select>
          </div>
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
                <th className="!font-bold !text-center">Tracking ID</th>
                <th className="!font-bold !text-center">No of cartons</th>

                <th className="!font-bold !text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {trans.map((l, k) => {
                return (
                  <tr key={k}>
                    <td className="truncate">{l.shipperName}</td>
                    <td className="truncate">{l.phoneNumber}</td>
                    <td className="truncate">{l.address}</td>
                    <td className="truncate">{l.trackingId}</td>
                    <td className="truncate">{l.numberOfItems}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          className="btn btn-sm btn-primary bg-blue-600"
                          onClick={() => viewShipmentInfo(l.id)}
                        >
                          <InformationCircleIcon className="text-white text-2xl h-6 w-6"></InformationCircleIcon>
                        </button>

                        <button
                          className="btn btn-sm btn-secondary bg-gray-600"
                          onClick={() => viewBarcodeInfo(l.id)}
                        >
                          <EyeIcon className="text-white text-2xl h-6 w-6"></EyeIcon>
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
                List Of Items for{" "}
                {trans.find((t) => t.id === selectedId)?.shipperName}
              </h2>

              {trans
                .find((t) => t.id === selectedId)
                ?.weighments.map((item, index) => (
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
                              const newWeighments = [...t.weighments];
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
                  </div>
                ))}
              <div
                className={`flex space-x-2 mt-4 ${
                  trans.find((t) => t.id === selectedId)?.weighments.length ===
                  0
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
                  onClick={() => console.log("Close modal")}
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
                      <span className="font-semibold">Name:</span> John Doe
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> +123456789
                    </p>
                    <p>
                      <span className="font-semibold">Address:</span> 123
                      Street, City, Country
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      john.doe@example.com
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
                      <span className="font-semibold">Name:</span> Jane Smith
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> +987654321
                    </p>
                    <p>
                      <span className="font-semibold">Address:</span> 456
                      Avenue, City, Country
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      jane.smith@example.com
                    </p>
                  </div>
                </div>

                {/* Assignment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Assignment
                  </h3>
                  <div className="mt-2 text-gray-600 space-y-2">
                    <p>
                      <span className="font-semibold">Client:</span> Client Name
                    </p>
                    <p>
                      <span className="font-semibold">Agent:</span> Agent Name
                    </p>
                    <p>
                      <span className="font-semibold">Employee:</span> Employee
                      Name
                    </p>
                    <p>
                      <span className="font-semibold">Driver:</span> Driver Name
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
                      Express
                    </p>
                    <p>
                      <span className="font-semibold">Box Number:</span> 12345
                    </p>
                    <p>
                      <span className="font-semibold">Courier:</span> FedEx
                    </p>
                    <p>
                      <span className="font-semibold">Payment Mode:</span>{" "}
                      Prepaid
                    </p>
                    <p>
                      <span className="font-semibold">Origin:</span> New York
                    </p>
                    <p>
                      <span className="font-semibold">Destination:</span> Los
                      Angeles
                    </p>
                    <p>
                      <span className="font-semibold">Pickup Date:</span>{" "}
                      2024-12-01
                    </p>
                    <p>
                      <span className="font-semibold">Expected Delivery:</span>{" "}
                      2024-12-05
                    </p>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Additional Comments
                  </h3>
                  <p className="mt-2 text-gray-600">
                    This is a sample comment about the shipment. Everything is
                    on schedule.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                  onClick={() => {
                    setShipmentModalShowing(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Completed;
