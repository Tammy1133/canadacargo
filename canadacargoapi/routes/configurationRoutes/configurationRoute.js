const {
  createCourier,
  deleteCourier,
  getAllCouriers,
  deleteShipmentType,
  getAllShipmentType,
  createShipmentType,
  createPaymentMode,
  deletePaymentMode,
  getAllPaymentModes,
  createOrigin,
  deleteOrigin,
  getAllOrigins,
  createDestination,
  deleteDestination,
  getAllDestinations,
  createPieceType,
  deletePieceType,
  getAllPieceTypes,
  getShipmentCost,
  updateShipmentCost,
  getTaxConfiguration,
  updateTaxConfiguration,
  getLocationDelivery,
  deleteLocationDelivery,
  createLocationDelivery,
  getClearingFeeConfiguration,
  updateClearingFeeConfiguration,
  getClearingTaxConfiguration,
  updateClearingTaxConfiguration,
  getProductType,
  createProductType,
  deleteProductType,
  createExtraFee,
  deleteExtraFee,
  getAllExtraFees,
} = require("../../controllers/configurationControllers/configurationControllers");
const { authenticateUser } = require("../../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/createCourier", authenticateUser, createCourier);
router.post("/deleteCourier", authenticateUser, deleteCourier);
router.get("/getAllCouriers", authenticateUser, getAllCouriers);

router.post("/createShipmentType", authenticateUser, createShipmentType);
router.post("/deleteShipmentType", authenticateUser, deleteShipmentType);
router.get("/getAllShipmentType", authenticateUser, getAllShipmentType);

router.post("/createPaymentType", authenticateUser, createPaymentMode);
router.post("/deletePaymentType", authenticateUser, deletePaymentMode);
router.get("/getAllPaymentType", authenticateUser, getAllPaymentModes);

router.post("/createOrigin", authenticateUser, createOrigin);
router.post("/deleteOrigin", authenticateUser, deleteOrigin);
router.get("/getAllOrigins", authenticateUser, getAllOrigins);

router.post("/createDestination", authenticateUser, createDestination);
router.post("/deleteDestination", authenticateUser, deleteDestination);
router.get("/getAllDestinations", authenticateUser, getAllDestinations);

router.post("/createPieceType", authenticateUser, createPieceType);
router.post("/createExtraFee", authenticateUser, createExtraFee);
router.post("/deleteExtraFee", authenticateUser, deleteExtraFee);
router.post("/deletePieceType", authenticateUser, deletePieceType);
router.get("/getAllPieceTypes", authenticateUser, getAllPieceTypes);
router.get("/getAllExtraFees", authenticateUser, getAllExtraFees);

router.post("/updateShipmentCost", authenticateUser, updateShipmentCost);
router.get("/getShipmentCost", authenticateUser, getShipmentCost);

router.post(
  "/updateTaxConfiguration",
  authenticateUser,
  updateTaxConfiguration
);
router.get("/getTaxConfiguration", authenticateUser, getTaxConfiguration);

router.get("/getLocationDelivery", authenticateUser, getLocationDelivery);
router.post(
  "/createLocationDelivery",
  authenticateUser,
  createLocationDelivery
);
router.post(
  "/deleteLocationDelivery",
  authenticateUser,
  deleteLocationDelivery
);
router.get("/getProductType", authenticateUser, getProductType);
router.post(
  "/createProductType",
  authenticateUser,
  createProductType
);
router.post(
  "/deleteProductType",
  authenticateUser,
  deleteProductType
);

router.get(
  "/getClearingFeeConfiguration",
  authenticateUser,
  getClearingFeeConfiguration
);
router.post(
  "/updateClearingFeeConfiguration",
  authenticateUser,
  updateClearingFeeConfiguration
);

router.get(
  "/getClearingTaxConfiguration",
  authenticateUser,
  getClearingTaxConfiguration
);
router.post(
  "/updateClearingTaxConfiguration",
  authenticateUser,
  updateClearingTaxConfiguration
);



module.exports = router;
