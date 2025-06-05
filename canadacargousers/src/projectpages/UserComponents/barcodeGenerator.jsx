import React, { useState, useRef, useEffect } from "react";
import Barcode from "react-barcode";

const DynamicBarcodeToImage = ({ value }) => {
  const [barcodeImage, setBarcodeImage] = useState("");
  const barcodeRef = useRef(null); // Create a ref to the Barcode component

  useEffect(() => {
    if (!value || !barcodeRef.current) return;

    // Function to generate image URL from the Barcode SVG
    const generateImageUrl = () => {
      const barcodeSvg = barcodeRef.current.querySelector("svg");

      if (barcodeSvg) {
        // Serialize the SVG to a string
        const svgString = new XMLSerializer().serializeToString(barcodeSvg);

        // Create an image element
        const img = new Image();
        img.src = "data:image/svg+xml;base64," + btoa(svgString);

        // Once the image is loaded, draw it on a canvas
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Get the image URL from the canvas
          const imageUrl = canvas.toDataURL("image/png");
          setBarcodeImage(imageUrl);
        };
      }
    };

    // Generate image URL each time the value changes
    generateImageUrl();
  }, [value]); // Re-run this effect every time the `value` prop changes

  return (
    <div ref={barcodeRef}>
      <Barcode value={value} />
      {barcodeImage && (
        <div>
          <p>Generated Barcode Image:</p>
          <img src={barcodeImage} alt="Generated Barcode" />
        </div>
      )}
    </div>
  );
};

export default DynamicBarcodeToImage;
