import moment from "moment";
import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import SearchBar from "../../components/Input/SearchBar";
import Swal from "sweetalert2";
import {
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  CogIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { getUserDetails } from "../../projectcomponents/auth";

import {
  pdf,
  Document as PDFDocument,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import {
  getBoxNumbersFromItems,
  IsCanada,
} from "../../utils/globalConstantUtil";

function PendingPayments() {
  // Updated dummy array to include weighments for each shipment

  const [trans, setTrans] = useState([]); // Initialize state with dummy data directly

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // State to hold the selected transaction ID
  const [searchText, setSearchText] = useState(""); // State for search text

  const [shipmentModalShowing, setShipmentModalShowing] = useState(false);

  const viewShipmentInfo = (items) => {
    setShipmentModalShowing(true);

    setDisplayingShipperInfo(items);
  };

  const [originalTrans, setOriginalTrans] = useState([]); // State to hold the original transactions

  useEffect(() => {
    // Store the original transactions only when they are first loaded
    if (originalTrans.length === 0 && trans.length > 0) {
      setOriginalTrans(trans);
    }
  }, [trans]);

  const applySearch = (searchText) => {
    // Trim the search text to handle cases with only spaces
    const trimmedSearchText = searchText.trim();

    // If the search text is empty, reset to original transactions
    if (trimmedSearchText === "") {
      setTrans(originalTrans);
      return; // Exit early to avoid further processing
    }

    // Filter transactions based on the search text
    const filteredTrans = originalTrans.filter((t) =>
      Object.values(t).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(trimmedSearchText.toLowerCase())
      )
    );

    // Update the transactions with the filtered results
    setTrans(filteredTrans);
  };

  const styles = StyleSheet.create({
    mytextt: {
      fontSize: "8px",
      textTransform: "capitalize",
      fontWeight: "bold",
    },
    page: {
      paddingHorizontal: 20,
      fontFamily: "Helvetica",
      fontSize: 10,
    },
    logo: {
      width: "200px",
    },
    logo2: {
      maxWidth: "200px",
    },
    logo3: {
      maxWidth: "60px",
      marginTop: "20px",
    },
    invoice: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "2px",
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      // marginBottom: 10,
    },
    bold: {
      // fontWeight: "bold",
    },

    myhead: {
      fontWeight: "bold",
      fontSize: "9px",
    },
    subtext: {
      fontWeight: "light",
      marginTop: "4px",
      marginBottom: "10px",
      fontSize: "8px",
      color: "#1e293b",
    },

    section: {
      marginBottom: 10,
    },
    section2: {
      marginBottom: 1,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    col: {
      flex: 1,
      paddingRight: 10,
    },
    table: {
      marginTop: 10,
      display: "table",
      width: "100%",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableCell: {
      flex: 1,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      borderLeftWidth: 0,
      borderTopWidth: 0,
      padding: 5,
      textAlign: "center",
    },
    totalRow: {
      backgroundColor: "#f2f2f2",
      fontWeight: "bold",
    },
    footer: {
      marginTop: 20,
      fontSize: 8,
      textAlign: "center",
    },
    highValue: {
      marginVertical: 5,
      textAlign: "center",
      fontSize: 14,
      // fontWeight: "bold",
      color: "red",
    },

    skyframe: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      // border: "1 solid #ddd",
      // backgroundColor: "#f9f9f9",
    },
    skyblock: {
      flex: 1,
      margin: 1,
      padding: 10,
      // backgroundColor: "#fff",
      // border: "1 solid #ccc",
      textAlign: "center",
    },
    textBold: {
      // fontWeight: "bold",
      fontSize: 12,
    },
    textRegular: {
      fontSize: 10,
    },
    empty: {
      marginTop: "10px",
    },
    empty2: {
      marginTop: "4px",
    },
    smalltext: {
      fontSize: "9px",
    },
  });

  // Function to handle the process click event
  const handleProcessClick = (shipment, pickup_fee) => {
    let calculations = calculateShipping(
      shipment?.items,
      Number(shipment?.product_type_price),
      pieceTypes
    );

    const itemsList = `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top:10px">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Weight (kg)</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
        </tr>
      </thead>
      <tbody>
        ${shipment.items
          .map(
            (item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.name?.toUpperCase()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              item.weight
            }</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item?.type?.toUpperCase()}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top:10px">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Product Type</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Price/KG</th>
        </tr>
      </thead>
      <tbody>
       <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              shipment.product_type
            }</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            }${Number(shipment.product_type_price)?.toLocaleString()}</td>
          </tr>
      </tbody>
    </table>
  `;
    const itemsPriceList = `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top:10px">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Weight (KG)</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Shipping Rate</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Piece Price</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Pickup Fee</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Extra Fee</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${shipment.items
          ?.slice(0, 1)
          .map(
            (item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${Number(
              calculations?.totalWeight
            )?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(calculations?.shippingRate)?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(calculations?.itemFee)?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(pickup_fee)?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(shipment?.total_extra_fees || 0)?.toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              IsCanada ? "$" : "₦"
            } ${Number(
              calculations?.totalSum +
                Number(pickup_fee) +
                (shipment?.total_extra_fees
                  ? Number(shipment?.total_extra_fees || 0)
                  : 0)
            )?.toLocaleString()}</td>
          </tr>`
          )
          .join("")}

      </tbody>
    </table>
  `;
    Swal.fire({
      title: "Confirm",
      html: `Are you sure the payment has been made?<br> ${itemsList} <br> ${itemsPriceList}`, // Use html instead of text
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        processPayment(
          shipment,
          shipment?.trans_id,
          calculations?.totalSum,
          shipment.items,
          shipment?.payment_mode,
          calculations?.totalWeight,
          calculations?.shippingRate,
          calculations?.itemFee,
          0,
          0,
          pickup_fee,
          calculations?.totalWeight,
          shipment?.total_extra_fees
        );
      }
    });
  };

  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [displayingShipperInfo, setDisplayingShipperInfo] = useState({});
  const [pieceTypes, setPieceTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentRate, setCurrentRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendloading, setsendloading] = useState(false);

  const [qrCodes, setQrCodes] = useState({});

  // console.log(qrCodes);

  useEffect(() => {
    async function generateQrCodes() {
      if (!trans) return;
      const codes = {};
      for (const item of trans) {
        try {
          const url = `http://tracking.canadacargo.net/trackshipment/${item.trans_id}`;
          codes[item.trans_id] = await QRCode.toDataURL(url);
        } catch (err) {
          console.error("QR code generation failed for:", item.trans_id, err);
          codes[item.trans_id] = null;
        }
      }
      setQrCodes(codes);
    }
    generateQrCodes();
  }, [trans]);

  const getPendingPayments = async (date) => {
    try {
      setsendloading(true);

      const mydate = new Date(date);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getPendingPayment`,
        { date: mydate.toISOString() },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTrans(response.data.data);

      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      setTrans([]);
      console.error(
        "Error fetching pending payment:",
        error.response?.data || error.message
      );
    }
  };
  const getRecentShippingCost = async (date) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getRecentShippingCost`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCurrentRate(response?.data?.data?.newrate || 0);

      // setTrans(response.data.data);
    } catch (error) {
      setTrans([]);
      console.error(
        "Error fetching shipping cost:",
        error.response?.data || error.message
      );
    }
  };
  const getPieceTypes = async (date) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getAllPieceTypes`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPieceTypes(response?.data?.pieceTypes);

      // setTrans(response.data.data);
    } catch (error) {
      setTrans([]);
      console.error(
        "Error fetching piecetypes:",
        error.response?.data || error.message
      );
    }
  };

  const processPayment = async (
    displayingShipperInfo,
    trans_id,
    amount,
    items,
    payment_mode,
    weight,
    shipping_rate,
    carton,
    custom_fee,
    doorstep_fee,
    pickup_fee,
    total_weight,
    total_extra_fees
  ) => {
    try {
      let extra_fees = Number(total_extra_fees) || 0;

      const getcounter = await axios.get(
        `${import.meta.env.VITE_API_URL}/getMostRecentCounter`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const currentCount = getcounter?.data?.counter;

      // console.log(displayingShipperInfo?.pickup_price);
      let l = displayingShipperInfo;
      const invoice_no = Math.floor(100000 + Math.random() * 900000).toString();
      const currentDate = new Date().toLocaleString();

      setsendloading(true);
      const doc = (
        <PDFDocument>
          <Page size="A4" style={styles.page}>
            {/* Header Section */}
            <View style={styles.header}>
              <Image
                style={styles.logo}
                src="/images/canadalogo.png" // Replace with your logo URL
              />

              <View style={styles.invoice}>
                {/* <Image
  style={styles.logo2}
  src="/images/canadalogo.png" // Replace with your logo URL
/> */}

                <br />
                {qrCodes[l.trans_id] && (
                  <Image
                    style={{
                      width: 70,
                      height: 70,
                      marginTop: 5,
                    }}
                    src={qrCodes[l.trans_id]}
                  />
                )}
              </View>
            </View>

            <View style={styles.skyframe}>
              {/* <View style={styles.skyblock}>
<Image
  style={styles.logo2}
  src="/images/paid.png" // Replace with your logo URL
/>
<Image
  style={styles.logo2}
  src="/images/highvalue.jpg" // Replace with your logo URL
/>
</View> */}
              <View style={styles.skyblock}>
                <View style={styles.section}>
                  <Text style={styles.myhead}>Payment Mode</Text>
                  <Text style={styles.subtext}>{l.payment_mode}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.myhead}>Invoice No..</Text>
                  <Text style={styles.subtext}>{invoice_no}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.myhead}>Shipment Type</Text>
                  <Text style={styles.subtext}>{l?.product_type}</Text>
                </View>
              </View>
              <View style={styles.skyblock}>
                <View style={styles.section}>
                  <Text style={styles.myhead}>Date</Text>
                  <Text style={styles.subtext}>{currentDate}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.myhead}>Waybill No..</Text>
                  <Text style={styles.subtext}>{l.trans_id}</Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.myhead}>Prepared by</Text>
                  <Text style={styles.subtext}>{l?.prepared_by}</Text>
                </View>
              </View>
              <View style={styles.skyblock}>
                <Image
                  style={styles.logo3}
                  src="/images/paid.png" // Replace with your logo URL
                />
              </View>
            </View>

            {/* Payment Information */}

            {/* Shipper and Receiver Information */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.bold}>SHIPPER INFORMATION</Text>
                <Text style={styles.empty}></Text>
                <Text style={styles.mytextt}>
                  Shipper Name: {l.shipper_name}
                </Text>
                <Text style={styles.empty2}></Text>

                <Text style={styles.mytextt}>
                  Shipper Address: {l.shipper_address}
                </Text>
                <Text style={styles.empty2}></Text>

                <Text style={styles.mytextt}>
                  Shipper Phone: {l.shipper_phone}
                </Text>
                <Text style={styles.empty2}></Text>

                <Text style={styles.mytextt}>
                  Shipper Email: {l.shipper_email}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.bold}>RECEIVER INFORMATION</Text>
                <Text style={styles.empty}></Text>
                <Text style={styles.mytextt}>
                  Receiver Name: {l.receiver_name}
                </Text>
                <Text style={styles.empty2}></Text>

                <Text style={styles.mytextt}>
                  Receiver Address: {l.receiver_address}
                </Text>
                <Text style={styles.empty2}></Text>

                <Text style={styles.mytextt}>
                  Receiver Phone: {l.receiver_phone}
                </Text>
                <Text style={styles.empty2}></Text>

                <Text style={styles.mytextt}>
                  Receiver Email: {l.receiver_email}
                </Text>
              </View>
            </View>

            <Text style={styles.empty}></Text>

            {/* Table Section */}
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.bold]}>Weight (Kg)</Text>
                <Text style={[styles.tableCell, styles.bold]}>
                  Shipping Rate
                </Text>
                <Text style={[styles.tableCell, styles.bold]}>Carton</Text>
                <Text style={[styles.tableCell, styles.bold]}>Extra Fees</Text>
                <Text style={[styles.tableCell, styles.bold]}>
                  Doorstep Fee
                </Text>
                <Text style={[styles.tableCell, styles.bold]}>Pickup Fee</Text>
                <Text style={[styles.tableCell, styles.bold]}>Total</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{total_weight} Kg</Text>
                <Text style={styles.tableCell}>
                  {l?.origin?.toUpperCase() === "CANADA" ? "$" : "N"}{" "}
                  {Number(shipping_rate)?.toLocaleString()}
                </Text>
                <Text style={styles.tableCell}>
                  {l?.origin?.toUpperCase() === "CANADA" ? "$" : "N"}{" "}
                  {Number(carton)?.toLocaleString()}
                </Text>
                <Text style={styles.tableCell}>
                  {l?.origin?.toUpperCase() === "CANADA" ? "$" : "N"}{" "}
                  {Number(extra_fees)?.toLocaleString()}
                </Text>
                <Text style={styles.tableCell}>
                  {l?.origin?.toUpperCase() === "CANADA" ? "$" : "N"}{" "}
                  {Number(doorstep_fee)?.toLocaleString()}
                </Text>
                <Text style={styles.tableCell}>
                  {l?.origin?.toUpperCase() === "CANADA" ? "$" : "N"}{" "}
                  {Number(pickup_fee)?.toLocaleString()}
                </Text>
                <Text style={styles.tableCell}>
                  {l?.origin?.toUpperCase() === "CANADA" ? "$" : "N"}
                  {(
                    Number(amount) +
                    Number(pickup_fee || 0) +
                    extra_fees
                  )?.toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={styles.empty}></Text>
            <Text style={styles.empty}></Text>

            <Text style={styles.empty}></Text>

            <Text style={styles.bold}>DESCRIPTION</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeader,
                    styles.smalltext,
                    { flex: 1 },
                  ]}
                >
                  Box Number
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeader,
                    styles.smalltext,
                    { flex: 2 },
                  ]}
                >
                  Details
                </Text>
              </View>

              {/* Table Rows */}
              {l.items?.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text
                    style={[styles.tableCell, styles.smalltext, { flex: 1 }]}
                  >
                    {item?.box_number}
                    {/* {item.box_number} */}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.smalltext, { flex: 2 }]}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.empty}></Text>
            <Text style={styles.empty}></Text>

            {/* Description Section */}
            <View style={styles.section}>
              <Text style={styles.bold}>Note:</Text>
              <Text style={styles.empty2}></Text>

              <Text>Outside province at your own cost!</Text>
            </View>
            <Text style={styles.empty}></Text>
            <Text style={styles.empty}></Text>
            <Text style={styles.empty}></Text>

            {/* Description Section */}
            <View style={styles.section}>
              <Text style={styles.bold}>TERMS AND CONDITION</Text>
              <Text style={styles.empty2}></Text>

              <Text>
                Shipping timelines are estimates and not guaranteed as exact
                arrival timelines is determined by airlines and carriers, Canada
                Cargo is not liable for any delays in shipping timelines as well
                as spoilt or rotten items due to delays in shipping timelines.
                All shipments are subject to customs check both in Nigeria and
                destination country, Canada Cargo is not liable for any removal
                of items deemed unfit to leave or enter into the destination
                country by customs.(IITA) neither are we liable for opened
                boxes. your shipment is In Transit Same is applicable to frozen
                shipments, we are not liable for any damage to leaves or any
                other fresh produce as a result of delay or defrost of your
                items during transit.
              </Text>
              <Text style={styles.empty2}></Text>

              <Text style={styles.bold}>
                NB: IF YOU WANT INSURANCE, REQUEST FOR THE RATES.
              </Text>
              <Text style={styles.empty}></Text>
              <Text style={styles.empty}></Text>
              <Text>
                Tel: +1 647 916 9511, +234 904 404 9709 |
                https://www.canadacargo.net | Email: info@canadacargo.net
              </Text>
            </View>
          </Page>
        </PDFDocument>
      );

      const pdfBlob = await pdf(doc).toBlob();

      const formData = new FormData();
      formData.append("trans_id", trans_id);
      formData.append("invoice_no", invoice_no);
      formData.append("items", JSON.stringify(items));
      formData.append("amount", amount);
      formData.append("payment_mode", payment_mode);
      formData.append("weight", weight);
      formData.append("shipping_rate", shipping_rate);
      formData.append("carton", carton);
      formData.append("custom_fee", custom_fee);
      formData.append("doorstep_fee", doorstep_fee);
      formData.append("pickup_fee", pickup_fee);
      formData.append("invoice_pdf", pdfBlob, `invoice_${trans_id}.pdf`);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/completePayment`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire("Completed!", "Payment Completed", "success");

      if (selectedDate) {
        getPendingPayments(selectedDate);
      } else {
        getPendingPayments(new Date());
      }

      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error updating items:",
        error.response?.data || error.message
      );
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update items.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  // const processPayment = async (
  //     trans_id,
  //     amount,
  //     items,
  //     payment_mode,
  //     weight,
  //     shipping_rate,
  //     carton,
  //     custom_fee,
  //     doorstep_fee,
  //     pickup_fee
  //   ) => {
  //     try {
  //       setsendloading(true);
  //       const response = await axios.post(
  //         `${import.meta.env.VITE_API_URL}/completePayment`,
  //         {
  //           trans_id,
  //           amount,
  //           items,
  //           payment_mode,
  //           weight,
  //           shipping_rate,
  //           carton,
  //           custom_fee,
  //           doorstep_fee,
  //           pickup_fee,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${userToken}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       Swal.fire("Completed!", "Payment Completed", "success");

  //       if (selectedDate) {
  //         getPendingPayments(selectedDate);
  //       } else {
  //         const date = new Date();
  //         getPendingPayments(date);
  //       }
  //       setsendloading(false);
  //     } catch (error) {
  //       setsendloading(false);
  //       // Handle errors
  //       console.error(
  //         "Error updating items:",
  //         error.response?.data || error.message
  //       );
  //       Swal.fire({
  //         title: "Error!",
  //         text: error.message || "Failed to update items.",
  //         icon: "error",
  //         confirmButtonText: "Try Again",
  //       });
  //     }

  //   };

  useEffect(() => {
    if (selectedDate) {
      getPendingPayments(selectedDate);
    } else {
      const date = new Date();
      getPendingPayments(date);
    }
  }, [selectedDate]);

  useEffect(() => {
    // getRecentShippingCost();
    getPieceTypes();
  }, []);

  function calculateShipping(
    items,
    currentRate,
    pieceTypes,
    pickup_price,
    extra_fees
  ) {
    // console.log(pickup_price);

    if (items && items.length > 0) {
      const totalWeight = items.reduce(
        (sum, item) => sum + Number(item.weight),
        0
      );

      const shippingRate = totalWeight * Number(currentRate);

      const itemFee = items.reduce((sum, item) => {
        const pieceType = pieceTypes.find(
          (type) => type?.name?.toUpperCase() === item?.type?.toUpperCase()
        );
        return sum + (pieceType ? Number(pieceType.price) : 0);
      }, 0);

      const totalSum =
        shippingRate +
        itemFee +
        (pickup_price ? Number(pickup_price) : 0) +
        (extra_fees ? Number(extra_fees) : 0);

      return {
        totalWeight,
        shippingRate,
        itemFee,
        totalSum,
      };
    }

    return {
      totalWeight: 0,
      shippingRate: 0,
      itemFee: 0,
      totalSum: 0,
    };
  }

  return (
    userToken && (
      <>
        <TitleCard
          title={`Pending Payments (${trans.length})`}
          topMargin="mt-2"
          TopSideButtons={
            <div className={"inline-block "}>
              <div className="input-group  relative flex flex-wrap items-stretch w-full ">
                <input
                  type="search"
                  value={searchText}
                  placeholder={"Search"}
                  onChange={(e) => {
                    setSearchText(e.target.value); // Update search text state
                    applySearch(e.target.value); // Apply search on change
                  }}
                  className="input input-sm input-bordered  w-full max-w-xs"
                />
              </div>
            </div>
          }
        >
          <div className="flex flex-col sm:flex-row items-center  bg-white shadow-md rounded-lg px-6  pb-2 -mt-4 mb-5 space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col">
              <label
                htmlFor="startDate"
                className="text-sm font-semibold text-gray-700"
              >
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                }}
                id="date"
                className="mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="!font-bold !text-center">Date</th>
                  <th className="!font-bold !text-center">Boxes</th>
                  <th className="!font-bold !text-center">No of cartons</th>
                  <th className="!font-bold !text-center">Shipper Name</th>
                  <th className="!font-bold !text-center">Phone Number</th>
                  <th className="!font-bold !text-center min-w-[170px]">
                    Address
                  </th>
                  <th className="!font-bold !text-center">Email</th>

                  <th className="!font-bold !text-center">Amount</th>
                  <th className="!font-bold !text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {trans.map((l, k) => {
                  return (
                    <tr key={k}>
                      <td className="truncate">
                        {new Date(l?.created_date)?.toLocaleDateString() || "-"}
                      </td>
                      <td className="">{getBoxNumbersFromItems(l?.items)}</td>
                      <td className="truncate">
                        {l.items === "[]" ? 0 : l?.items?.length}
                      </td>
                      <td className="truncate">{l.shipper_name}</td>
                      <td className="truncate">{l.shipper_phone}</td>
                      <td className="truncate" style={{ maxWidth: "150px" }}>
                        {l.shipper_address}
                      </td>
                      <td className="truncate">{l.shipper_email}</td>

                      <td className="truncate">
                        {IsCanada ? "$" : "₦"}
                        {Number(
                          calculateShipping(
                            l.items,
                            l.product_type_price,
                            pieceTypes,
                            l.pickup_price,
                            l.total_extra_fees
                          )?.totalSum
                        )?.toLocaleString()}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            className="btn btn-sm btn-primary bg-blue-600"
                            onClick={() => viewShipmentInfo(l)}
                          >
                            <InformationCircleIcon className="text-white text-2xl h-6 w-6"></InformationCircleIcon>
                          </button>

                          <button
                            className="btn btn-sm btn-accent text-white bg-green-600"
                            onClick={() => {
                              setDisplayingShipperInfo(
                                trans.find((t) => t.trans_id === l.trans_id)
                              );
                              handleProcessClick(
                                trans.find((t) => t.trans_id === l.trans_id),
                                l.pickup_price
                              );
                            }} // Call the function with the selected shipment
                          >
                            <ArrowsRightLeftIcon className="text-white text-2xl h-6 w-6"></ArrowsRightLeftIcon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TitleCard>

        {shipmentModalShowing && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShipmentModalShowing(false);
            }}
          >
            <div
              className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-auto max-h-[90vh]"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-700">
                    Shipment Details
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShipmentModalShowing(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="mt-6 space-y-6">
                  {/* Shipper Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Shipper Information
                    </h3>
                    <div className="mt-2 text-gray-600 space-y-2">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {displayingShipperInfo?.shipper_name || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {displayingShipperInfo?.shipper_phone || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {displayingShipperInfo?.shipper_address || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {displayingShipperInfo?.shipper_email || "N/A"}
                      </p>
                    </div>
                  </div>
                  {/* Receiver Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Receiver Information
                    </h3>
                    <div className="mt-2 text-gray-600 space-y-2">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {displayingShipperInfo?.receiver_name || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {displayingShipperInfo?.receiver_phone || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {displayingShipperInfo?.receiver_address || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {displayingShipperInfo?.receiver_email || "N/A"}
                      </p>
                    </div>
                  </div>
                  {/* Shipment Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Shipment Details
                    </h3>
                    <div className="mt-2 text-gray-600 space-y-2">
                      <p>
                        <span className="font-semibold">Product Type:</span>{" "}
                        {displayingShipperInfo?.product_type || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Price Per KG:</span>{" "}
                        {IsCanada ? "$" : "₦"}{" "}
                        {Number(
                          displayingShipperInfo?.product_type_price
                        )?.toLocaleString() || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Shipment Type:</span>{" "}
                        {displayingShipperInfo?.shipment_type || "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">Courier:</span>{" "}
                        {displayingShipperInfo?.courier || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Payment Mode:</span>{" "}
                        {displayingShipperInfo?.payment_mode || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Origin:</span>{" "}
                        {displayingShipperInfo?.origin || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Destination:</span>{" "}
                        {displayingShipperInfo?.destination || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Pickup Date:</span>{" "}
                        {displayingShipperInfo?.pickup_date || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Expected Delivery:
                        </span>{" "}
                        {displayingShipperInfo?.expected_date_delivery || "N/A"}
                      </p>
                    </div>
                  </div>
                  {/* Comments */}`{" "}
                  {/* <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Description
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {displayingShipperInfo?.comments ||
                        "No Description provided."}
                    </p>
                  </div>` */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Province
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {displayingShipperInfo?.province ||
                        "No Province provided."}
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end">
                  <button
                    className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    onClick={() => setShipmentModalShowing(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {sendloading && (
          <div className="fixed inset-0 bg-gray-500  bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        )}
      </>
    )
  );
}

export default PendingPayments;
