import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getUserDetails } from "../../../projectcomponents/auth";
import Swal from "sweetalert2";

const NewUser = () => {
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [email, setEmail] = useState("");

  const [userData, setUserData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const tableRef = useRef(null);

  const [userDetails, setUserDetails] = useState(
    () => getUserDetails().userDetails
  );
  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModules, setSelectedModules] = useState(
    [
      "User Creation",
      "User Management",
      "View All Shipments",
      "Editing Shipments",
      "New Shipment",
      "Pending Weighment",
      "Pending Payments/ Complete Payments",
      "Generate QR",
      "View Out Of Office List",
      "Mark Shipment In Transit",
      "View All Shipments In Transit",
      "View Arrived Shipments",
      "Scan QR",
      "Configurations",
      "View Revenue Report",
      "View Shipment Report",
      "Arrival Response",
      "Payment Notification",
    ].reduce((acc, module) => {
      const key = module.toLowerCase();
      acc[key] = false;
      return acc;
    }, {})
  );

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setSelectedModules((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      if (!firstName) {
        throw new Error("First name is required");
      }
      if (!lastName) {
        throw new Error("Last name is required");
      }

      if (!email) {
        throw new Error("Email is required");
      }
      if (!password) {
        throw new Error("Password is required");
      }

      const modulesToSend = Object.keys(selectedModules)
        .filter((key) => selectedModules[key])
        .map((key) => key);

      if (!modulesToSend.length) {
        throw new Error("You have to select at least one module");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        {
          email,
          firstname: firstName,
          lastname: lastName,
          password: password,
          modules: modulesToSend,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You have been successfully registered.",
      });

      setFirstname("");
      setLastname("");
      setEmail("");
      setPassword("");
      setSelectedModules(
        [
          "User Creation",
          "User Management",
          "View All Shipments",
          "Editing Shipments",
          "New Shipment",
          "Pending Weighment",
          "Pending Payments/ Complete Payments",
          "Generate QR",
          "View Out Of Office List",
          "Mark Shipment In Transit",
          "View All Shipments In Transit",
          "View Arrived Shipments",
          "Scan QR",
          "Configurations",
          "View Revenue Report",
          "View Shipment Report",
          "Arrival Response",
          "Payment Notification",
        ].reduce((acc, module) => {
          const key = module.toLowerCase();
          acc[key] = false;
          acc[module] = false;
          return acc;
        }, {})
      );

      window.scrollTo(0, 0);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.response ? error.response.data.message : error?.message,
      });
    }
  };

  useEffect(() => {
    if (!userToken) {
      window.location.href = "/login";
    }
  }, [userToken]);
  return (
    userToken && (
      <>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Bio Data Form
                </h3>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-5">
                  <div className="mb-4 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        First name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstname(e.target.value)}
                        placeholder="Enter first name"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Last name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastname(e.target.value)}
                        placeholder="Enter last name"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Email
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Password
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-4.5">
                    {!loading ? (
                      <button
                        type="submit"
                        className="rounded bg-primary py-3 px-6 text-center text-sm font-medium text-white transition hover:bg-opacity-90"
                      >
                        Add User
                      </button>
                    ) : (
                      <button className="rounded bg-slate-500 py-3 px-6 text-center text-sm font-medium text-white transition hover:bg-opacity-90">
                        Loading...
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-9">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  User Modules
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div
                    id=""
                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                  >
                    <div className="mb-4">
                      <label className="mb-2.5 block font-medium text-black dark:text-white">
                        What does the user have access to?
                      </label>
                      <div className="flex flex-col gap-3">
                        <>
                          {/* <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={handleSelectAll}
                              className="mr-2"
                            />
                            Add All Modules
                          </label> */}
                          {[
                            "User Creation",
                            "User Management",
                            "View All Shipments",
                            "Editing Shipments",
                            "New Shipment",
                            "Pending Weighment",
                            "Pending Payments/ Completed Payments",
                            "Generate QR",
                            "View Out Of Office List",
                            "Mark Shipment In Transit",
                            "View All Shipments In Transit",
                            "View Arrived Shipments",
                            "Scan QR",
                            "Configurations",
                            "View Revenue Report",
                            "View Shipment Report",
                            "Arrival Response",
                            "Payment Notification",
                          ].map((module) => (
                            <label className="flex items-center" key={module}>
                              <input
                                type="checkbox"
                                name={module.toLowerCase()}
                                checked={selectedModules[module.toLowerCase()]}
                                onChange={handleCheckboxChange}
                                className="mr-2"
                              />
                              {module} {/* Display module name with spaces */}
                            </label>
                          ))}
                        </>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default NewUser;
