import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { setPageTitle } from "../../features/common/headerSlice";
import { getUserDetails } from "../../projectcomponents/auth";
import axios from "axios";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";

export const EditShipment = () => {
  // State for shipper information
  const [shipperName, setShipperName] = useState("");
  const [trans_id, setTrans_id] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  // State for receiver information (add as needed)
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");

  // State for assignment dropdowns
  const [client, setClient] = useState("");
  const [agent, setAgent] = useState("");
  const [employee, setEmployee] = useState("");
  const [driver, setDriver] = useState("");

  // State for container details
  const [shipmentContainer, setShipmentContainer] = useState("");

  // State for shipment information
  const [shipmentType, setShipmentType] = useState("");
  const [boxNumber, setBoxNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [comments, setComments] = useState("");
  const [agentName, setAgentName] = useState("");

  // State for history information
  const [historyDate, setHistoryDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Current date
  const [historyTime, setHistoryTime] = useState(
    new Date().toLocaleTimeString()
  ); // Current time
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const dispatch = useDispatch();

  const [userToken, setUserToken] = useState(() => getUserDetails().token);
  const [shipmentTypes, setShipmentTypes] = useState([]);
  const [courierTypes, setcourierTypes] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getShipmentType = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getAllShipmentType`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response.data);

      setShipmentTypes(response.data.couriers);
    } catch (error) {
      console.error(
        "Error fetching tax updates:",
        error.response?.data || error.message
      );
      setShipmentTypes([]);
    }
  };

  const getAllCouriers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getAllCouriers`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setcourierTypes(response.data.couriers);
    } catch (error) {
      console.error(
        "Error fetching tax updates:",
        error.response?.data || error.message
      );
      setcourierTypes([]);
    }
  };

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

      setOrigins(response.data.origins);
    } catch (error) {
      console.error(
        "Error fetching tax updates:",
        error.response?.data || error.message
      );
    }
  };

  const getAllPaymentModes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getAllPaymentType`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response.data);
      setPaymentModes(response.data.paymentModes);
    } catch (error) {
      console.error(
        "Error fetching tax updates:",
        error.response?.data || error.message
      );
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

      setDestinations(response.data.destinations);
    } catch (error) {
      console.error(
        "Error fetching destination:",
        error.response?.data || error.message
      );
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateShipment`,
        {
          trans_id: trans_id,
          shipper_name: shipperName,
          shipper_phone: phoneNumber,
          shipper_address: address,
          shipper_email: email,
          receiver_name: receiverName,
          receiver_phone: receiverPhone,
          receiver_address: receiverAddress,
          receiver_email: receiverEmail,
          shipment_type: shipmentType,
          box_number: boxNumber,
          courier: courier,
          payment_mode: paymentMode,
          origin: origin,
          destination: destination,
          pickup_date: pickupDate,
          expected_date_delivery: expectedDeliveryDate,
          comments: comments,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Reset all input fields
      setShipperName("");
      setPhoneNumber("");
      setAddress("");
      setEmail("");
      setReceiverName("");
      setReceiverPhone("");
      setReceiverAddress("");
      setReceiverEmail("");
      setShipmentType("");
      setBoxNumber("");
      setCourier("");
      setPaymentMode("");
      setOrigin("");
      setDestination("");
      setPickupDate("");
      setExpectedDeliveryDate("");
      setComments("");

      // Show success message using SweetAlert2
      Swal.fire({
        icon: "success",
        title: " Updated Successfully!",
        text: `Shipment ID: ${response.data.shipment.trans_id} has been updated.`,
      });

      navigate("/app/allshipmentedit");

      setIsLoading(false);

      window.scrollTo(0, 0);
    } catch (error) {
      setIsLoading(false);

      // Show error message using SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error Creating Shipment",
        text: error.response?.data?.message || error.message,
      });

      console.error(
        "Error creating shipment:",
        error.response?.data || error.message
      );
    }
  };

  const params = useParams();

  const getShipmentInfoByTransId = async () => {
    try {
      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getShipmentInfoByTransId`,
        {
          item_trans_id: params?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log(response);

      const allData = response.data.data.shipmentInfo;
      if (allData) {
        setTrans_id(allData.trans_id || "");
        setShipperName(allData.shipper_name || "");
        setPhoneNumber(allData.shipper_phone || "");
        setAddress(allData.shipper_address || "");
        setEmail(allData.shipper_email || "");
        setReceiverName(allData.receiver_name || "");
        setReceiverPhone(allData.receiver_phone || "");
        setReceiverAddress(allData.receiver_address || "");
        setReceiverEmail(allData.receiver_email || "");
        setShipmentType(allData.shipment_type || "");
        setBoxNumber(allData.box_number || "");
        setCourier(allData.courier || "");
        setPaymentMode(allData.payment_mode || "");
        setOrigin(allData.origin || "");
        setDestination(allData.destination || "");
        setPickupDate(allData.pickup_date || "");
        setExpectedDeliveryDate(allData.expected_date_delivery || "");
        setComments(allData.comments || "");
      } else {
        console.warn("No shipment information found.");
      }

      setIsLoading(false);
      window.scrollTo(0, 0);
    } catch (error) {
      setIsLoading(false);

      console.error(
        "Error creating shipment:",
        error.response?.data || error.message
      );
    }
  };
  useEffect(() => {
    // console.log(params);

    if (params?.id) {
      getShipmentInfoByTransId();
    }
  }, [params]);

  const navigate = useNavigate();

  useEffect(() => {
    getShipmentType();
    getAllCouriers();
    getAllOrigins();
    getAllPaymentModes();
    getAllDestinations();
  }, []);

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-2xl font-semibold flex pb-3 items-center text-blue-900">
          <PencilIcon className="h-6 w-6 mr-2"></PencilIcon> Edit Shipment
        </h4>

        <button
          type="submit"
          onClick={() => {
            navigate("/app/allshipments");
          }}
          className=" bg-blue-500 text-white font-bold py-1 text-sm -mt-2 px-4 rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 px-2 pt-4 pb-2 bg-gray-100 rounded-lg shadow-md"
      >
        {/* Shipper Information */}
        <div className="bg-white py-2 pt-2 px-3 pb-[40px] rounded-lg shadow mb-4">
          <div className="bg-slate-50 font-bold py-1 px-1">
            Shipper Information
          </div>
          <hr />
          <label className="block font-normal mb-2 mt-5">Shipper Name</label>
          <input
            type="text"
            value={shipperName}
            onChange={(e) => setShipperName(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block font-normal mb-2 mt-5">Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block font-normal mb-2 mt-5">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block font-normal mb-2 mt-5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Receiver Information */}
        <div className="bg-white py-2 pt-2 px-3 pb-[40px] rounded-lg shadow mb-4">
          <div className="bg-slate-50 font-bold py-1 px-1">
            Receiver Information
          </div>
          <hr />
          <label className="block font-normal mb-2 mt-5">Receiver Name</label>
          <input
            type="text"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block font-normal mb-2 mt-5">Phone Number</label>
          <input
            type="text"
            value={receiverPhone}
            onChange={(e) => setReceiverPhone(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block font-normal mb-2 mt-5">Address</label>
          <input
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block font-normal mb-2 mt-5">Email</label>
          <input
            type="email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Assign Shipment To */}

        {/* Shipment Information */}
        <div className="bg-white py-2 pt-2 px-3 pb-[40px] rounded-lg shadow mb-4 col-span-2">
          <div className="bg-slate-50 font-bold py-1 px-1">
            Shipment Information
          </div>
          <hr />
          <label className="block font-normal mb-2 mt-5">
            Type of Shipment
          </label>
          <select
            value={shipmentType}
            onChange={(e) => setShipmentType(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            {shipmentTypes.map((eachShipment) => {
              return (
                <option value={eachShipment?.name}>{eachShipment?.name}</option>
              );
            })}
            {/* Add shipment type options here */}
          </select>

          <label className="block font-normal mb-2 mt-5">Box Number</label>
          <input
            type="text"
            value={boxNumber}
            onChange={(e) => setBoxNumber(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block font-normal mb-2 mt-5">Courier</label>
          <select
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            {courierTypes.map((eachShipment) => {
              return (
                <option value={eachShipment?.name}>{eachShipment?.name}</option>
              );
            })}
            {/* Add shipment type options here */}
          </select>

          <label className="block font-normal mb-2 mt-5">Payment Mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Payment Mode</option>
            {/* Add payment mode options here */}
            {paymentModes.map((eachShipment) => {
              return (
                <option value={eachShipment?.name}>{eachShipment?.name}</option>
              );
            })}
          </select>

          <label className="block font-normal mb-2 mt-5">Origin</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Origin</option>
            {/* Add origin options here */}

            {origins.map((eachShipment) => {
              return (
                <option value={eachShipment?.name}>{eachShipment?.name}</option>
              );
            })}
          </select>

          <label className="block font-normal mb-2 mt-5">Destination</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Destination</option>

            {destinations.map((eachShipment) => {
              return (
                <option value={eachShipment?.name}>{eachShipment?.name}</option>
              );
            })}
            {/* Add destination options here */}
          </select>

          <label className="block font-normal mb-2 mt-5">Pickup Date</label>
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block font-normal mb-2 mt-5">
            Expected Date of Delivery
          </label>
          <input
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block font-normal mb-2 mt-5">Description</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-3 -mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            {isLoading ? "Loading.." : "Update Shipment"}
          </button>
        </div>
      </form>
    </div>
  );
};
