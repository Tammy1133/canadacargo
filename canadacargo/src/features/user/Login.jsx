import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LandingIntro from "./LandingIntro";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import TemplatePointers from "./components/TemplatePointers";

function Login() {
  const INITIAL_LOGIN_OBJ = {
    password: "",
    emailId: "",
  };

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);

  const submitForm = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (loginObj.emailId.trim() === "")
      return setErrorMessage("Email Id is required! (use any value)");
    if (loginObj.password.trim() === "")
      return setErrorMessage("Password is required! (use any value)");
    else {
      setLoading(true);
      // Call API to check user credentials and save token in localstorage
      localStorage.setItem("token", "DumyTokenHere");
      setLoading(false);
      window.location.href = "/app/dashboard";
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage("");
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  return (
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
                      alt="Dashwind Admin Template"
                      className="w-[290px] inline-block -ml-5 -mt-[60px]"
                    ></img>

                    <img
                      src="/images/loginhero.png"
                      alt="Dashwind Admin Template"
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
            <form onSubmit={(e) => submitForm(e)}>
              <div className="mb-4">
                <InputText
                  type="emailId"
                  defaultValue={loginObj.emailId}
                  updateType="emailId"
                  containerStyle="mt-4"
                  labelTitle="Email Id"
                  updateFormValue={updateFormValue}
                  placeholder="Enter your email id"
                />

                <InputText
                  defaultValue={loginObj.password}
                  type="password"
                  updateType="password"
                  containerStyle="mt-4"
                  labelTitle="Password"
                  updateFormValue={updateFormValue}
                  placeholder="Enter your password"
                />
              </div>

              <div className="text-right text-primary">
                <span
                  onClick={() => {
                    navigate("/forgot-password");
                  }}
                  className="text-sm  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200"
                >
                  Forgot Password?
                </span>
              </div>

              <ErrorText styleClass="mt-3">{errorMessage}</ErrorText>
              <button
                type="submit"
                className={
                  "btn mt-2 w-full btn-primary" + (loading ? " loading" : "")
                }
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
