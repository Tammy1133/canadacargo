import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import ErrorText from "../../components/Typography/ErrorText";
import axios from "axios";
import Swal from "sweetalert2";
import { AES, enc } from "crypto-js";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const encryptObject = (obj, secretKey) => {
    const jsonString = JSON.stringify(obj);
    return AES.encrypt(jsonString, secretKey).toString();
  };

  const handleSubmit = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      setLoading(true);
      if (!email) {
        throw new Error("Email is required");
      }
      if (!password) {
        throw new Error("Password is required");
      }
      // alert(`${API_URL}/login`);

      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const encryptedString = encryptObject(
        response.data,
        import.meta.env.VITE_SECRET_KEY
      );

      localStorage.setItem("userdetails", encryptedString);

      const userDetails = response.data.userDetails;

      const modules =
        typeof userDetails.modules === "string"
          ? JSON.parse(userDetails.modules)
          : userDetails.modules;

      const hasReportManagement = modules.some(
        (module) => module.toLowerCase() === "report management"
      );

      localStorage.setItem("timeLoggedIn", new Date());

      window.location.href = "/app/dashboard";

      // if (hasReportManagement) {
      //   navigate("/app/dashboard");
      // } else {
      //   navigate("/app/userdashboard");
      // }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.response ? error.response.data.message : error?.message,
      });
    }
  };

  return (
    <div className="login-container">
      <div className="min-h-screen bg-base-200 flex items-center">
        <div className="card mx-auto w-full max-w-5xl  shadow-xl">
          <div className="grid  md:grid-cols-2 grid-cols-1  bg-base-100 rounded-xl">
            <div className="">
              <div className="hero min-h-full rounded-l-xl bg-base-200">
                <div className="hero-content py-12">
                  <div className="max-w-md">
                    <div className="text-center mt-12">
                      <img
                        src="/images/canadalogo.png"
                        alt=""
                        className="w-[290px] inline-block -ml-5 -mt-[60px]"
                      ></img>

                      <img
                        src="/images/loginhero.png"
                        alt=""
                        className=" inline-block -mt-2"
                      ></img>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="py-24 px-10">
              <h2 className="text-2xl font-semibold mb-2 text-center ">
                Provide your credentials to login
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="mb-4">
                  <div className={`form-control w-full mt-4`}>
                    <label className="label">
                      <span className={"label-text text-base-content "}>
                        Email
                      </span>
                    </label>
                    <input
                      type={"text"}
                      value={email}
                      placeholder="Enter your username"
                      onChange={(e) => setEmail(e.target.value)}
                      className="input  input-bordered w-full "
                    />
                  </div>
                  <div className={`form-control w-full mt-4`}>
                    <label className="label">
                      <span className={"label-text text-base-content "}>
                        Password
                      </span>
                    </label>
                    <input
                      type={"password"}
                      value={password}
                      placeholder="Enter your password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="input  input-bordered w-full "
                    />
                  </div>
                </div>

                {/* <div className="text-right text-primary">
                  <span
                    onClick={() => {
                      navigate("/forgot-password");
                    }}
                    className="text-sm  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200"
                  >
                    Forgot Password?
                  </span>
                </div> */}

                <ErrorText styleClass="mt-3">{errorMessage}</ErrorText>
                <button
                  type="submit"
                  disabled={loading}
                  className={"btn mt-2 w-full btn-primary"}
                >
                  {loading ? "Loading" : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
