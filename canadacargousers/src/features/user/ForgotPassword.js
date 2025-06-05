import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import LandingIntro from "./LandingIntro";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";

function ForgotPassword() {
  const INITIAL_USER_OBJ = {
    emailId: "",
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);

  const submitForm = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (userObj.emailId.trim() === "")
      return setErrorMessage("Email Id is required! (use any value)");
    else {
      setLoading(true);
      // Call API to send password reset link
      setLoading(false);
      setLinkSent(true);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage("");
    setUserObj({ ...userObj, [updateType]: value });
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
            <h2 className="text-2xl font-semibold  text-center">
              Forgot Password
            </h2>

            {linkSent && (
              <>
                <div className="text-center mt-2">
                  <CheckCircleIcon className="inline-block w-32 text-success" />
                </div>
                <p className="my-4 text-xl font-bold text-center">Link Sent</p>
                <p className="mt-4 mb-8 font-semibold text-center">
                  Check your email to reset password
                </p>
                <div className="text-center mt-4">
                  <Link to="/login">
                    <button className="btn btn-block btn-primary ">
                      Login
                    </button>
                  </Link>
                </div>
              </>
            )}

            {!linkSent && (
              <>
                <p className="my-2 font-semibold text-center">
                  We will send password reset link on your email Id
                </p>
                <form onSubmit={(e) => submitForm(e)}>
                  <div className="mb-4">
                    <InputText
                      type="emailId"
                      defaultValue={userObj.emailId}
                      updateType="emailId"
                      containerStyle="mt-4"
                      labelTitle="Email Id"
                      updateFormValue={updateFormValue}
                    />
                  </div>

                  <ErrorText styleClass="mt-2">{errorMessage}</ErrorText>
                  <button
                    type="submit"
                    className={
                      "btn mt-2 w-full btn-primary" +
                      (loading ? " loading" : "")
                    }
                  >
                    Send Reset Link
                  </button>

                  <div className="text-center mt-4">
                    Go back to login page
                    <Link to="/login">
                      <button className="  inline-block ml-3 hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                        Login
                      </button>
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
