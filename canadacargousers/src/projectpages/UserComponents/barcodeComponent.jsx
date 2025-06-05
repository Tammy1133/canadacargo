import React, { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const BarcodeComponent = ({ barcodeValue }) => {
  const [barcodeImageUrl, setBarcodeImageUrl] = useState(null);
  const [isBarcodeReady, setIsBarcodeReady] = useState(false);

  const generateBarcode = (value) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, {
      format: "CODE128",
      displayValue: false, // Hide the default value rendering by JsBarcode
      width: 2,
      height: 70,
      margin: 5,
    });

    const ctx = canvas.getContext("2d");

    // Handle logo loading and drawing
    const logoSrc = "/images/canadalogo.png"; // Ensure this path is correct
    const logo = new Image();
    logo.src = logoSrc;
    logo.onload = () => {
      const canvasWidth = canvas.width;
      const logoWidth = 50;
      const logoHeight = 25;
      const logoX = (canvasWidth - logoWidth) / 2;
      const logoY = 10; // Position logo slightly below barcode
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

      // Draw the barcode value as text below the barcode
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";
      ctx.fillText(value, canvasWidth / 2, canvas.height - 10);

      // Convert canvas to image URL and store it in state
      setBarcodeImageUrl(canvas.toDataURL());
      setIsBarcodeReady(true); // Mark the barcode as ready
    };
  };

  useEffect(() => {
    if (barcodeValue) {
      setIsBarcodeReady(false); // Reset readiness before generating a new barcode
      generateBarcode(barcodeValue);
    }
  }, [barcodeValue]); // Run whenever barcodeValue changes

  const handlePrint = () => {
    if (isBarcodeReady) {
      const printWindow = window.open("", "_blank");

      const barcodeImage = new Image();
      const logoImage = new Image();

      barcodeImage.src = barcodeImageUrl;
      logoImage.src = "/images/canadalogo.png";

      const imagesLoaded = new Promise((resolve, reject) => {
        let loadedCount = 0;

        const onImageLoad = () => {
          loadedCount++;
          if (loadedCount === 2) resolve();
        };

        const onImageError = (img) => {
          reject(`Failed to load ${img}`);
        };

        barcodeImage.onload = onImageLoad;
        logoImage.onload = onImageLoad;

        barcodeImage.onerror = () => onImageError("barcode image");
        logoImage.onerror = () => onImageError("logo image");
      });

      imagesLoaded
        .then(() => {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Barcode</title>
                <style>
                  body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                    padding: 0;
                  }
                  img {
                    max-width: 100%;
                    height: auto;
                    margin: 10px 0;
                  }
                </style>
              </head>
              <body>
                <img src="${logoImage.src}" alt="Generated Logo" />
                <img src="${barcodeImage.src}" alt="Generated Barcode" />
                <p style="text-align: center; font-size: 16px;">${barcodeValue}</p>
              </body>
            </html>
          `);

          printWindow.document.close();

          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        })
        .catch((error) => {
          console.error("Error in printing process:", error);
        });
    } else {
      setTimeout(handlePrint, 500);
    }
  };

  return (
    <div>
      {barcodeImageUrl ? (
        <img src={barcodeImageUrl} alt="Generated Barcode" />
      ) : (
        <p>Loading barcode...</p>
      )}
      <button
        onClick={handlePrint}
        disabled={!isBarcodeReady}
        className="btn btn-sm text-white bg-slate-600 hover:bg-slate-900"
      >
        Print Barcode
      </button>
    </div>
  );
};

export default BarcodeComponent;
