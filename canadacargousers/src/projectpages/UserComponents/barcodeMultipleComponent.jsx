// import React, { useState, useEffect } from "react";
// import JsBarcode from "jsbarcode";

// const BarcodeMultipleComponent = ({ barcodeValues }) => {
//   const [barcodeImages, setBarcodeImages] = useState([]);
//   const [isBarcodesReady, setIsBarcodesReady] = useState(true);

//   // Generate barcode images for each barcode value
//   const generateBarcodes = () => {
//     const newBarcodeImages = [];
//     barcodeValues.forEach((value) => {
//       const canvas = document.createElement("canvas");
//       JsBarcode(canvas, value, {
//         format: "CODE128",
//         displayValue: false,
//         width: 2,
//         height: 70,
//         margin: 5,
//       });

//       // Handle logo loading and drawing
//       const logoSrc = "/images/canadalogo.png"; // Ensure this path is correct
//       const logo = new Image();
//       logo.src = logoSrc;
//       logo.onload = () => {
//         const ctx = canvas.getContext("2d");
//         const canvasWidth = canvas.width;
//         const logoWidth = 50;
//         const logoHeight = 25;
//         const logoX = (canvasWidth - logoWidth) / 2;
//         const logoY = 10; // Position logo slightly below barcode
//         ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

//         // Convert canvas to image URL and store it in the newBarcodeImages array
//         newBarcodeImages.push({ code: canvas.toDataURL(), logo });

//         // When all barcodes are ready, update the state
//         if (newBarcodeImages.length === barcodeValues.length) {
//           setBarcodeImages(newBarcodeImages);
//           setIsBarcodesReady(true);
//         }
//       };
//     });
//   };

//   // Generate barcodes for all values
//   useEffect(() => {
//     if (barcodeValues && barcodeValues.length > 0) {
//       setIsBarcodesReady(true); // Disable printing until all barcodes are ready
//       generateBarcodes(); // Generate barcode for each value
//     }
//   }, [barcodeValues]); // Run whenever barcodeValues changes

//   // Handle print functionality for all barcodes
//   const handlePrint = () => {
//     if (isBarcodesReady) {
//       const printWindow = window.open("", "_blank");

//       const logoImage = new Image();
//       logoImage.src = "/images/canadalogo.png";
//       logoImage.onload = () => console.log("Logo image loaded successfully");
//       logoImage.onerror = (error) =>
//         console.error("Logo image failed to load:", error);

//       const imagesLoaded = new Promise((resolve, reject) => {
//         let imagesToLoad = barcodeImages.length + 1; // Include the logo in the count
//         let imagesLoadedCount = 0;

//         const checkImageLoaded = () => {
//           imagesLoadedCount++;
//           if (imagesLoadedCount === imagesToLoad) {
//             resolve();
//           }
//         };

//         // Ensure barcode images and logo are loaded
//         barcodeImages.forEach((barcodeImageUrl) => {
//           const barcodeImage = new Image();
//           barcodeImage.src = barcodeImageUrl.code;
//           barcodeImage.onload = checkImageLoaded;
//           barcodeImage.onerror = () => reject("Failed to load barcode image.");
//         });

//         logoImage.onload = checkImageLoaded; // Ensure logo is also checked
//         logoImage.onerror = () => reject("Failed to load logo image.");
//       });

//       imagesLoaded
//         .then(() => {
//           let printContent = "";
//           barcodeImages.forEach((barcodeImageUrl) => {
//             printContent += `
//               <html>
//                 <head>
//                   <title>Print Barcodes</title>
//                   <style>
//                     @media print {
//                       body {
//                         text-align: center;
//                       }
//                       .barcode-wrapper {
//                         page-break-before: always;
//                         text-align: center;
//                         margin: 20px 0;
//                         display: flex;
//                         flex-direction: column;
//                         justify-content: center;
//                         align-items: center;
//                       }
//                       img {
//                         max-width: 100%;
//                         height: auto;
//                         margin-bottom: 20px;
//                       }
//                     }
//                   </style>
//                 </head>
//                 <body>
//                   <div class="barcode-wrapper">
//                     <img src="${logoImage.src}" alt="Generated Logo" />
//                     <img src="${barcodeImageUrl.code}" alt="Generated Barcode" />
//                   </div>
//                 </body>
//               </html>
//             `;
//           });

//           // Write the generated content into the new window
//           printWindow.document.write(printContent);

//           printWindow.document.close(); // Ensure the document is fully loaded
//           setTimeout(() => {
//             printWindow.print(); // Trigger print dialog after a brief delay
//             printWindow.close();
//           }, 300);
//         })
//         .catch((error) => {
//           console.log(error); // Log error if images fail to load
//         });
//     } else {
//       // If barcodes are not ready, try printing again after a brief delay
//       setTimeout(handlePrint, 500);
//     }
//   };

//   return (
//     <div>
//       {/* Print button only enabled when all barcodes are ready */}
//       <button
//         onClick={handlePrint}
//         className="btn btn-sm text-white bg-slate-600 hover:bg-slate-900"
//         disabled={!isBarcodesReady}
//       >
//         Print Barcodes
//       </button>
//     </div>
//   );
// };

// export default BarcodeMultipleComponent;

import React, { useState, useEffect } from "react";
import JsBarcode from "jsbarcode";

const BarcodeMultipleComponent = ({ barcodeValues }) => {
  const [barcodeImages, setBarcodeImages] = useState([]);
  const [isBarcodesReady, setIsBarcodesReady] = useState(true);

  const generateBarcodes = () => {
    const newBarcodeImages = [];
    barcodeValues.forEach((value) => {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, value, {
        format: "CODE128",
        displayValue: false,
        width: 2,
        height: 70,
        margin: 5,
      });

      const logoSrc = "/images/canadalogo.png"; // Ensure this path is correct
      const logo = new Image();
      logo.src = logoSrc;
      logo.onload = () => {
        const ctx = canvas.getContext("2d");
        const canvasWidth = canvas.width;
        const logoWidth = 50;
        const logoHeight = 25;
        const logoX = (canvasWidth - logoWidth) / 2;
        const logoY = 10; // Position logo slightly below barcode
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

        // Draw the barcode value below the barcode
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(value, canvasWidth / 2, canvas.height - 10);

        newBarcodeImages.push({ code: canvas.toDataURL(), value });

        if (newBarcodeImages.length === barcodeValues.length) {
          setBarcodeImages(newBarcodeImages);
          setIsBarcodesReady(true);
        }
      };
    });
  };

  useEffect(() => {
    if (barcodeValues && barcodeValues.length > 0) {
      setIsBarcodesReady(false);
      generateBarcodes();
    }
  }, [barcodeValues]);

  const handlePrint = () => {
    if (isBarcodesReady) {
      const printWindow = window.open("", "_blank");

      let printContent = "";
      barcodeImages.forEach((barcodeImageUrl) => {
        printContent += `
          <html>
            <head>
              <title>Print Barcodes</title>
              <style>
                @media print {
                  body {
                    text-align: center;
                  }
                  .barcode-wrapper {
                    page-break-before: always;
                    text-align: center;
                    margin: 20px 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                  }
                  img {
                    max-width: 100%;
                    height: auto;
                    margin-bottom: 5px;
                  }
                  .barcode-value {
                    font-size: 14px;
                    margin-top: 5px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="barcode-wrapper">
                <img src="/images/canadalogo.png" alt="Logo" />
                <img src="${barcodeImageUrl.code}" alt="Barcode" />
                <p class="barcode-value">${barcodeImageUrl.value}</p>
              </div>
            </body>
          </html>
        `;
      });

      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    } else {
      setTimeout(handlePrint, 500);
    }
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        className="btn btn-sm text-white bg-slate-600 hover:bg-slate-900"
        disabled={!isBarcodesReady}
      >
        Print Barcodes
      </button>
      {/* <div className="barcode-list">
        {barcodeImages.map((barcode, index) => (
          <div key={index} className="barcode-wrapper">
            <img src={barcode.code} alt={`Barcode for ${barcode.value}`} />
            <p className="barcode-value">{barcode.value}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default BarcodeMultipleComponent;
