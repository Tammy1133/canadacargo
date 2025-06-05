import { AES, enc } from "crypto-js";

export function getUserDetails() {
  const userDetails = localStorage.getItem("userdetails");

  // console.log(decryptString(userDetails));

  return decryptString(userDetails);
}

const decryptString = (encryptedString) => {
  try {
    const bytes = AES.decrypt(encryptedString, import.meta.env.VITE_SECRET_KEY);
    const jsonString = bytes.toString(enc.Utf8);
    if (!jsonString) throw new Error("Decryption result is empty");
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
