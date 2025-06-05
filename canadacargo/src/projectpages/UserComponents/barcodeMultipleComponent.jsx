import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

const QRCodeMultipleComponent = ({ barcodeValues, displayingShipperInfo }) => {
  const [qrImages, setQrImages] = useState([]);
  const [isQRCodesReady, setIsQRCodesReady] = useState(true);

  const generateQRCodes = () => {
    const newQrImages = [];
    barcodeValues.forEach(async (value) => {
      const canvas = document.createElement("canvas");

      await QRCode.toCanvas(canvas, value?.item_trans_id, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const ctx = canvas.getContext("2d");
      const logo = new Image();
      logo.src = "/images/canadalogo.png";

      logo.onload = () => {
        const logoSize = 40;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        ctx.drawImage(logo, x, y, logoSize, logoSize);

        newQrImages.push({
          code: canvas.toDataURL(),
          value: value?.item_trans_id,
          box_number: value?.box_number,
        });

        if (newQrImages.length === barcodeValues.length) {
          setQrImages(newQrImages);
          setIsQRCodesReady(true);
        }
      };
    });
  };

  useEffect(() => {
    if (barcodeValues && barcodeValues.length > 0) {
      setIsQRCodesReady(false);
      generateQRCodes();
    }
  }, [barcodeValues]);

  function getNextFridayDate(dateString) {
    const date = new Date(dateString);

    // Get the day of the week (0 = Sunday, 5 = Friday)
    const dayOfWeek = date.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7; // Days to add to get to Friday

    // If today is Friday, daysUntilFriday will be 0
    if (daysUntilFriday !== 0) {
      date.setDate(date.getDate() + daysUntilFriday);
    }

    const day = date.getDate();
    const month = date
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();

    // Format ordinal (1ST, 2ND, 3RD, etc.)
    const getOrdinal = (n) => {
      if (n >= 11 && n <= 13) return `${n}TH`;
      switch (n % 10) {
        case 1:
          return `${n}ST`;
        case 2:
          return `${n}ND`;
        case 3:
          return `${n}RD`;
        default:
          return `${n}TH`;
      }
    };

    return `${getOrdinal(day)} ${month}`;
  }

  const handlePrint = () => {
    if (isQRCodesReady) {
      const printWindow = window.open("", "_blank");

      let printContent = `
        <html>
          <head>
            <title>Print QR Codes</title>
            <style>
            * {
              box-sizing: border-box;
              padding:0;
              margin:0;
            }

            h1{
            font-size:50px;
            }

            body {
              font-family: sans-serif;
              text-align: center;
              margin: 0;
              padding: 0;
              background: white;
              -webkit-print-color-adjust: exact; /* Chrome/Safari */
              print-color-adjust: exact;         /* Modern browsers */
            }

            .cont {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 10px 0;
            }

            .wrapper {
              border: 4px solid #333;
              width: 100%;
              max-width: 500px;
              background-color: #fff;
            }

            .line {
              border-top: 2px solid #333;
              height: 0;
              width: 100%;
              margin:10px 0;
            }
            .line2 {
              border-top: 2px solid #333;
              height: 0;
              width: 100%;
              margin: 0;
            }

            .subline {
              border-top: 2px solid #333;
              height: 0;
              width: 100%;
              margin: 10px 0;
            }

            .breaker {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .right img {
              width: 100px;
            }

            .left {
              width: 70%;
            }

            .left h5 {
              color: blue;
            }

            .qr-value {
              font-weight: bold;
              font-size:18px
            }

            img {
              width: 100px;
              height: auto;
              margin-top:10px;
            }
              p{
              font-size:20px;
              }

              .box{
              font-size:140px;
              }

              .page-break {
  page-break-after: always;
}
          </style>


          </head>
          <body>
      `;

      qrImages.forEach((qr) => {
        printContent += `

            <div class="cont page-break">
        <div class="wrapper">
            <div class="flex">
                <img src="/images/canadalogo.png" alt="no">
            </div>

              <div class="line"></div>


           <h1 class= 'box'>${qr.box_number ?? ""}</h1>


            <div class="line2"></div>

          <div class="breaker">
            <div class="left">
              <p>
                  <p class="qr-value">${qr.value}</p>
              </p>
                <div class="subline"></div>
                <p>
                    [${getNextFridayDate(displayingShipperInfo?.created_date)}]
                    </p>
            </div>
            <div class="right">
                 <img src="${qr.code}" alt="QR Code" />
            </div>
          </div>
            </div>
    </div>
        `;
      });

      printContent += `</body></html>`;
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
        className="btn btn-sm text-white bg-indigo-600 hover:bg-indigo-800"
        disabled={!isQRCodesReady}
      >
        Print QR Codes
      </button>
    </div>
  );
};

export default QRCodeMultipleComponent;
