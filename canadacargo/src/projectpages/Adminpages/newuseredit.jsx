import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
// import jszip from "jszip";
import axios from "axios";
// import { ToastContainer, toast, Bounce } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

import editIcon from "/images/pen.png";
import deleteIcon from "/images/delete.png";
import person from "/images/man.png";
import { getUserDetails } from "../../projectcomponents/auth";
import Swal from "sweetalert2";
// import { notify } from "../../components/reusables/toastService";
// import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
// import { getUserStatus } from "../../components/reusables/authentication";

export const NewUserEdit = () => {
  const [userData, setUserData] = useState([]);

  const [userDetails, setUserDetails] = useState(
    () => getUserDetails().userDetails
  );
  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);

  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const tableRef = useRef(null);
  const [userExists, setUserExists] = useState("");
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
      acc[module] = false;
      return acc;
    }, {})
  );

  const [sendloading, setsendloading] = useState(false);

  const [loading, setLoading] = useState(false);
  const userDataRef = useRef(userData);

  const tokenRef = useRef(userExists);
  useEffect(() => {
    tokenRef.current = userExists.token;
  }, [userExists]);
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [image, setImage] = useState("");

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setSelectedModules((prevModules) => ({
      ...prevModules,
      [name]: checked,
    }));
  };

  useEffect(() => {
    console.log(selectedModules);
  }, [selectedModules]);

  const getUsers = () => {
    setsendloading(true);
    const token = tokenRef.current;
    axios
      .get(`${import.meta.env.VITE_API_URL}/getallusers`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })
      .then((response) => {
        const data = response.data;

        // console.log(data);

        setUserData(data?.users);

        setsendloading(false);
      })
      .catch((error) => {
        setsendloading(false);
        console.error("Error fetching user data:", error);
      });
  };

  const updateUser = async () => {
    try {
      setLoading(true);

      const modulesToSend = Object.keys(selectedModules)
        .filter((key) => selectedModules[key])
        .map((key) => key);

      const uniqueModules = Array.from(
        new Set(modulesToSend.map((module) => module.toLowerCase()))
      ).map((uniqueModule) =>
        modulesToSend.find((module) => module.toLowerCase() === uniqueModule)
      );

      if (!uniqueModules.length) {
        throw new Error("You have to select at least one module");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/updateUser`,
        {
          email: selectedUser?.email,
          password: newPassword,
          firstname: selectedUser?.firstname,
          lastname: selectedUser?.lastname,
          selectedModules: uniqueModules,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      getUsers();

      setShowModal(false);

      setNewPassword("");

      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      console.error("Error updating user:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  const deleteUser = async (email) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete user ${email}. This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/deleteuser`,
          { email },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (response.status === 200) {
          await Swal.fire(
            "Deleted!",
            `User ${email} has been deleted.`,
            "success"
          );
          getUsers();
        } else {
          await Swal.fire(
            "Error",
            `Failed to delete user ${email}. Please try again.`,
            "error"
          );
        }
      }
    } catch (error) {
      await Swal.fire("Error", "An unexpected error occurred.", "error");
    }
  };

  useEffect(() => {
    getUsers();
  }, [userExists]);

  useEffect(() => {
    if (!tableRef.current) {
      tableRef.current = $("#example").DataTable({
        dom: "Bfrtip",
        buttons: [
          { extend: "copy" },
          "csv",
          "excel",
          { extend: "pdf", orientation: "landscape", pageSize: "LEGAL" },
          "print",
          "colvis",
        ],
        columnDefs: [
          {
            targets: -1,
            data: null,
            defaultContent: `
             <div class="flex items-center space-x-2 justify-center">
                <img src="${editIcon}" alt="Edit" class="w-4 h-4 cursor-pointer edit-btn" />
                <img src="${deleteIcon}" alt="Delete" class="w-4 h-4 cursor-pointer delete-btn" />
              </div>
            `,
          },
        ],
        drawCallback: function () {
          $(".dataTables_wrapper .dataTables_scrollBody").css(
            "border",
            "1px solid #ddd"
          );
        },
      });

      $("#example tbody").on("click", ".edit-btn", function () {
        const data = tableRef.current.row($(this).parents("tr")).data();
        const email = data[3];
        const user = userDataRef.current.find((u) => u.email === email);
        if (user) {
          setSelectedUser(user);
          const userModules = Array.isArray(user.modules) ? user.modules : [];

          const updatedModules = Object.keys(selectedModules).reduce(
            (acc, key) => {
              acc[key] = userModules.some(
                (module) =>
                  module.toLowerCase() === key.toLowerCase() || module === key
              );
              return acc;
            },
            {}
          );

          const removeDuplicates = (obj) => {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
              const lowerCaseKey = key.toLowerCase(); // Normalize keys for case-insensitive comparison
              if (!(lowerCaseKey in result)) {
                result[lowerCaseKey] = value;
              }
            }
            return result;
          };

          setSelectedModules(removeDuplicates(updatedModules));

          setShowModal(true);
        } else {
          console.error("User not found:", username);
        }
      });

      $("#example tbody").on("click", ".delete-btn", function () {
        const data = tableRef.current.row($(this).parents("tr")).data();

        const email = data[3];

        const user = userDataRef.current.find((u) => u.email === email);

        console.log(user);

        if (user) {
          deleteUser(user?.email);
        } else {
          console.error("User not found:", email);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (userData.length > 0) {
      if (tableRef.current) {
        const mappedData = userData.map((user, index) => [
          index + 1,
          user.firstname,
          user.lastname,
          user.email,
          `  <div class="text-[11px] font-medium justify-center flex">
        ${user?.modules
          .map((module) =>
            module
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          )
          .join(", ")}
      </div>`,
        ]);

        tableRef.current.clear();
        tableRef.current.rows.add(mappedData).draw();
      }
    }
  }, [userData]);

  const handleCloseModal = () => setShowModal(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setSelectedUser({ ...selectedUser, [name]: value });
  };

  return (
    userToken && (
      <>
        {/* <Breadcrumb pageName="Manage User Accounts" /> */}

        <div className="rounded-lg border border-slate-50 bg-white p-6 shadow-lg">
          {/* <ToastContainer /> */}
          <div className="overflow-x-auto">
            <table
              id="example"
              border={2}
              className="min-w-full mytable border border-slate-50 divide-y divide-slate-300 pt-5"
            >
              <thead className="bg-slate-50 border-b border-gray-300 ">
                <tr>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">
                    ID
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">
                    First Name
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">
                    Last Name
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-2  text-sm font-medium text-gray-500 min-w-[250px] text-center">
                    Modules
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300 ">
                {/* Data will be dynamically updated using DataTables API */}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div
              className="fixed top-0 inset-0 bg-[#0000006c] overflow-y-scroll  "
              onClick={(e) => {
                setShowModal(false);
              }}
            >
              <div
                className={` bg-gray-800 bg-opacity-70 flex items-center justify-center pt-[120px] pb-[60px]  ${
                  showModal ? "block" : "hidden"
                }`}
              >
                <div
                  className="bg-white p-6 rounded-lg shadow-lg !w-screen lg:ml-[150px] max-w-md "
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Edit User
                  </h2>
                  {selectedUser && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateUser({
                          ...selectedUser,
                          userpassword: newPassword,
                          selectedModules,
                        })
                          .then((result) => {
                            console.log("Update successful:", result);
                          })
                          .catch((error) => {
                            console.error("Update failed:", error.message);
                          });
                      }}
                    >
                      <div className="mb-4">
                        <label className="mb-3 block !text-black dark:text-white">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstname"
                          placeholder="First Name"
                          value={selectedUser.firstname}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 !text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="mb-3 block !text-black dark:text-white">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastname"
                          placeholder="Last Name"
                          value={selectedUser.lastname}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 !text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="mb-3 block !text-black dark:text-white">
                          Email
                        </label>
                        <input
                          type="text"
                          name="username"
                          placeholder="Email Address"
                          disabled
                          value={selectedUser.email}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 !text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="mb-3 block !text-black dark:text-white">
                          Password
                        </label>
                        <input
                          type="text"
                          name="userpassword"
                          placeholder="User Passoword"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                          }}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 !text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>

                      <div className="mb-4.5">
                        <label className="mb-2.5 block font-medium !text-black dark:text-white">
                          What does the user have access to?
                        </label>
                        <div className="flex flex-col gap-3">
                          <>
                            {[
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
                            ].map((module) => (
                              <label className="flex items-center" key={module}>
                                <input
                                  type="checkbox"
                                  name={module.toLowerCase()}
                                  checked={
                                    selectedModules[module.toLowerCase()]
                                  }
                                  onChange={handleCheckboxChange}
                                  className="mr-2"
                                />
                                {module}
                              </label>
                            ))}
                          </>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-5">
                        {loading ? (
                          <button
                            // type="submit"
                            className="inline-flex items-center rounded-lg bg-slate-500 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-primary-dark focus:outline-none"
                          >
                            Loading...
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-md hover:bg-primary-dark focus:outline-none"
                          >
                            Save
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="inline-flex items-center rounded-lg bg-slate-400 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-slate-500 focus:outline-none"
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {sendloading && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        )}
      </>
    )
  );
};
