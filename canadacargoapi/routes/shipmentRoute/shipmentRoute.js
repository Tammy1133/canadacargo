const multer = require("multer");
const {
  getShipmentInfoByPhone,
} = require("../../controllers/generalControllers/authenticationController");
const {
  createShipment,
  getPendingWeighments,
  updateItems,
  processPayment,
  getPendingPayment,
  processCompletedPayment,
  getRecentShippingCost,
  completePayment,
  getCompletedPayments,
  getShipmentItems,
  getShipmentInfoByTransId,
  updateShipment,
  getBarcodeShipmentItems,
  updateItemStatusToOutOfOffice,

  getOutOfOffice,
  updateItemTrackingAndStatus,
  updateMultipleItemsTrackingAndStatus,
  getItemsInTransit,
  updateItemStatusToArrived,
  getItemsArrived,
  updateItemStatusToDelivered,
  sendArrivalNotification,
  getDashboardData,
  getMonthlyRevenue,
  getShipmentTypeCounts,
  getMonthlyShipments,
  sendArrivalNotifications,
  createArrivalResponse,
  checkTransactionExists,
  createPaymentResponse,
  checkPaymentTransactionExists,
  getArrivalResponsesByDate,
  getPaymentResponsesByDate,
  verifyPayment,
  getMostRecentCounter,
  sendTrackingNotification,
  getAllShipmentItems,
  getShipmentInfoForEdit,
  deleteShipment,
} = require("../../controllers/shipmentControllers/generalShipment");
const { authenticateUser } = require("../../middlewares/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = require("express").Router();

router.post("/createShipment", authenticateUser, createShipment);
router.post("/getPendingWeighments", authenticateUser, getPendingWeighments);
router.post("/updateItems", authenticateUser, updateItems);
router.post("/processPayment", authenticateUser, processPayment);
router.post("/getPendingPayment", authenticateUser, getPendingPayment);
router.post(
  "/processCompletedPayment",
  authenticateUser,
  processCompletedPayment
);
// router.post("/completePayment", authenticateUser, completePayment);
router.post(
  "/completePayment",
  authenticateUser,
  upload.single("invoice_pdf"),
  completePayment
);

router.get("/getMostRecentCounter", authenticateUser, getMostRecentCounter);
router.get("/getRecentShippingCost", authenticateUser, getRecentShippingCost);
router.post("/getCompletedPayments", authenticateUser, getCompletedPayments);
router.get("/getShipmentItems", authenticateUser, getShipmentItems);
router.get("/getAllShipmentItems", authenticateUser, getAllShipmentItems);
router.get(
  "/getBarcodeShipmentItems",
  authenticateUser,
  getBarcodeShipmentItems
);

router.post(
  "/getShipmentInfoByTransId",
  authenticateUser,
  getShipmentInfoByTransId
);
router.post(
  "/getShipmentInfoForEdit",
  authenticateUser,
  getShipmentInfoForEdit
);
router.post("/updateShipment", authenticateUser, updateShipment);
router.post(
  "/updateItemStatusToOutOfOffice",
  authenticateUser,
  updateItemStatusToOutOfOffice
);
router.post(
  "/updateItemTrackingAndStatus",
  authenticateUser,
  updateItemTrackingAndStatus
);
router.post(
  "/updateMultipleItemsTrackingAndStatus",
  authenticateUser,
  updateMultipleItemsTrackingAndStatus
);
router.post(
  "/updateItemStatusToArrived",
  authenticateUser,
  updateItemStatusToArrived
);
router.post(
  "/updateItemStatusToDelivered",
  authenticateUser,
  updateItemStatusToDelivered
);
router.post(
  "/sendArrivalNotification",
  authenticateUser,
  sendArrivalNotification
);
router.get("/getOutOfOffice", authenticateUser, getOutOfOffice);
router.get("/getItemsInTransit", authenticateUser, getItemsInTransit);
router.get("/getItemsArrived", authenticateUser, getItemsArrived);
router.get("/getDashboardData", authenticateUser, getDashboardData);
router.post("/getMonthlyRevenue", authenticateUser, getMonthlyRevenue);
router.post("/getShipmentTypeCounts", authenticateUser, getShipmentTypeCounts);
router.post("/getMonthlyShipments", authenticateUser, getMonthlyShipments);
router.post(
  "/sendArrivalNotifications",
  authenticateUser,
  sendArrivalNotifications
);
router.post(
  "/getShipmentInfoByPhone",
  authenticateUser,
  getShipmentInfoByPhone
);

router.post("/createArrivalResponse", authenticateUser, createArrivalResponse);
router.post("/checkTransactionExists", checkTransactionExists);

router.post("/createPaymentResponse", authenticateUser, createPaymentResponse);
router.post("/checkPaymentTransactionExists", checkPaymentTransactionExists);
router.post("/getArrivalResponsesByDate", getArrivalResponsesByDate);
router.post("/getPaymentResponsesByDate", getPaymentResponsesByDate);
router.post("/verifyPayment", verifyPayment);

router.post("/sendTrackingNotification", sendTrackingNotification);
router.delete("/deleteShipment/:trans_id", deleteShipment);

module.exports = router;
