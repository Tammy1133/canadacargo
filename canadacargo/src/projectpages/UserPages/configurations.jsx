import React, { useState } from "react";
import { TaxConfig } from "../UserComponents/configurations/taxConfig";
import { ShippingCostPerKg } from "../UserComponents/configurations/shippingCostPerKg";
import { PieceTypes } from "../UserComponents/configurations/pieceTypes";
import { Destinations } from "../UserComponents/configurations/destinations";
import { Origin } from "../UserComponents/configurations/origin";
import { PaymentModes } from "../UserComponents/configurations/paymentModes";
import { CourierTable } from "../UserComponents/configurations/tables/courierTable";
import { Courier } from "../UserComponents/configurations/courier";
import { ShipmentType } from "../UserComponents/configurations/shipmentType";
import { ClearingFee } from "../UserComponents/configurations/clearingFee";
import { ClearingFeeTax } from "../UserComponents/configurations/clearingFeeTax";
import { LocationDelivery } from "../UserComponents/configurations/locationDelivery";
import { ProductType } from "../UserComponents/configurations/producttype";

export const Configurations = () => {
  const CONFIGURATION_TYPES = [
    "PRODUCT TYPE",
    "SHIPMENT TYPE",
    "COURIER",
    "PAYMENT MODES",
    "ORIGIN",
    "DESTINATION",
    "PIECE TYPES",
    "LOCATION DELIVERY",
    // "SHIPPING COST PER KG",
    // "TAX CONFIGURATION",
    "CLEARING FEE",
    "CLEARING FEE TAX",
  ];

  const [selectedType, setSelectedType] = useState("");

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Configurations</h1>
      <div className="mb-4">
        <label
          htmlFor="configurationType"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Configuration Type:
        </label>
        <select
          id="configurationType"
          value={selectedType}
          onChange={handleTypeChange}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="" disabled>
            -- Select a Configuration Type --
          </option>
          {CONFIGURATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      {selectedType && (
        <p className="text-sm text-gray-700">
          You have selected: <span className="font-medium">{selectedType}</span>
        </p>
      )}
      <div className="mt-5">
        {/* {selectedType === "TAX CONFIGURATION" && <TaxConfig></TaxConfig>} */}
        {/* {selectedType === "SHIPPING COST PER KG" && (
          <ShippingCostPerKg></ShippingCostPerKg>
        )} */}
        {selectedType === "PIECE TYPES" && <PieceTypes></PieceTypes>}
        {selectedType === "LOCATION DELIVERY" && (
          <LocationDelivery></LocationDelivery>
        )}
        {selectedType === "DESTINATION" && <Destinations></Destinations>}
        {selectedType === "ORIGIN" && <Origin></Origin>}
        {selectedType === "PAYMENT MODES" && <PaymentModes></PaymentModes>}
        {selectedType === "COURIER" && <Courier></Courier>}
        {selectedType === "SHIPMENT TYPE" && <ShipmentType></ShipmentType>}
        {selectedType === "PRODUCT TYPE" && <ProductType></ProductType>}
        {selectedType === "CLEARING FEE TAX" && (
          <ClearingFeeTax></ClearingFeeTax>
        )}
        {selectedType === "CLEARING FEE" && <ClearingFee></ClearingFee>}
      </div>
    </div>
  );
};
