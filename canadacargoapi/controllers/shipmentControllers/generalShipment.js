const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../models/index");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const multer = require("multer");
const moment = require('moment-timezone');


const upload = multer();

const transporter = nodemailer.createTransport({
  host: 'mail.canadacargo.net',        
  port: 465,                           
  secure: true,                      
  auth: {
    user: 'info@canadacargo.net',      
    pass: 'cargodeliveryinfo',         
  },
  tls: {
    rejectUnauthorized: false,      
  },
  debug: true,                        
});



const createShipment = async (req, res) => {
  const {
    shipper_name,
    shipper_phone,
    shipper_address,
    shipper_email,
    receiver_name,
    receiver_phone,
    receiver_address,
    receiver_email,
    shipment_type,
    box_number,
    courier,
    payment_mode,
    origin,
    destination,
    pickup_date,
    expected_date_delivery,
    comments,
    pickup_location,
    pickup_price,
    province,
    product_type,
    product_type_price,
    prepared_by
  } = req.body;

  // Validate required fields individually
  if (!shipper_name || shipper_name.trim() === "") {
    return res.status(400).json({ message: "Shipper name is required" });
  }
  if (!shipper_phone || shipper_phone.trim() === "") {
    return res.status(400).json({ message: "Shipper phone is required" });
  }
  if (!shipper_address || shipper_address.trim() === "") {
    return res.status(400).json({ message: "Shipper address is required" });
  }
  if (!shipper_email || shipper_email.trim() === "") {
    return res.status(400).json({ message: "Shipper email is required" });
  }
  if (!receiver_name || receiver_name.trim() === "") {
    return res.status(400).json({ message: "Receiver name is required" });
  }
  if (!receiver_phone || receiver_phone.trim() === "") {
    return res.status(400).json({ message: "Receiver phone is required" });
  }
  if (!receiver_address || receiver_address.trim() === "") {
    return res.status(400).json({ message: "Receiver address is required" });
  }
  if (!receiver_email || receiver_email.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }
  if (!shipment_type || shipment_type.trim() === "") {
    return res.status(400).json({ message: "Shipment type is required" });
  }
  if (!box_number || box_number.trim() === "") {
    return res.status(400).json({ message: "Box number is required" });
  }
  if (!courier || courier.trim() === "") {
    return res.status(400).json({ message: "Courier is required" });
  }
  if (!product_type || !product_type_price) {
    return res.status(400).json({ message: "Product type is required" });
  }
  if (!payment_mode || payment_mode.trim() === "") {
    return res.status(400).json({ message: "Payment mode is required" });
  }
  if (!origin || origin.trim() === "") {
    return res.status(400).json({ message: "Origin is required" });
  }
  if (!destination || destination.trim() === "") {
    return res.status(400).json({ message: "Destination is required" });
  }
  if (!pickup_date || pickup_date.trim() === "") {
    return res.status(400).json({ message: "Pickup date is required" });
  }
  if (!expected_date_delivery || expected_date_delivery.trim() === "") {
    return res
      .status(400)
      .json({ message: "Expected date of delivery is required" });
  }
  if (!comments || comments.trim() === "") {
    return res.status(400).json({ message: "Comments are required" });
  }
  if (!province || province.trim() === "") {
    return res.status(400).json({ message: "Provice is required" });
  }

  try {
    const generateRandomTransId = () => {
      const now = new Date();
    
      const pad = (n) => n.toString().padStart(2, '0');
    
      const timestamp = 
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds());
    
      const randomDigits = Math.floor(Math.random() * 90 + 10);
    
      return `CC${timestamp}${randomDigits}`;
    };
    

    const trans_id = generateRandomTransId();

    const moment_date = moment.tz('Africa/Lagos');

    const created_date = moment_date.format('YYYY-MM-DD HH:mm:ss')

    await sequelize.query(
      `INSERT INTO shipment_info 
            (shipper_name, shipper_phone, shipper_address, shipper_email, receiver_name, 
             receiver_phone, receiver_address, receiver_email, shipment_type, box_number, 
             courier, payment_mode, origin, destination, pickup_date, expected_date_delivery, 
             comments, trans_id, status, created_date, pickup_location, pickup_price, province,product_type,
    product_type_price, location, prepared_by) 
           VALUES 
            (:shipper_name, :shipper_phone, :shipper_address, :shipper_email, :receiver_name, 
             :receiver_phone, :receiver_address, :receiver_email, :shipment_type, :box_number, 
             :courier, :payment_mode, :origin, :destination, :pickup_date, :expected_date_delivery, 
             :comments, :trans_id, :status, :created_date, :pickup_location, :pickup_price, :province, :product_type,
    :product_type_price, :location, :prepared_by)`,
      {
        replacements: {
          shipper_name,
          shipper_phone,
          shipper_address,
          shipper_email,
          receiver_name,
          receiver_phone,
          receiver_address,
          receiver_email,
          shipment_type,
          box_number,
          courier,
          payment_mode,
          origin,
          destination,
          pickup_date,
          expected_date_delivery,
          comments,
          trans_id,
          status: "intitated",
          created_date,
          pickup_location,
          pickup_price,
          province,
          product_type,
          product_type_price, 
          location:req.user.location,
          prepared_by:`${req.user.lastname} ${req.user.firstname}`
        },
      }
    );

    // Insert into pending_weighment table
    await sequelize.query(
      `INSERT INTO pending_weighment (trans_id) VALUES (:trans_id)`,
      {
        replacements: {
          trans_id,
        },
      }
    );

    res.status(201).json({
      message: "Shipment created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create shipment",
      error: error.message,
    });
  }
};

const updateShipment = async (req, res) => {
  const {
    trans_id,
    shipper_name,
    shipper_phone,
    shipper_address,
    shipper_email,
    receiver_name,
    receiver_phone,
    receiver_address,
    receiver_email,
    shipment_type,
    box_number,
    courier,
    payment_mode,
    origin,
    destination,
    pickup_date,
    expected_date_delivery,
    comments,
    pickup_location,
    pickup_price,
    province,
    product_type,
    product_type_price,
  } = req.body;

  // Validate trans_id
  if (!trans_id || trans_id.trim() === "") {
    return res.status(400).json({ message: "Transaction ID (trans_id) is required" });
  }

  // Validate required fields (example for a few — add more if needed)
  if (!shipper_name || shipper_name.trim() === "") {
    return res.status(400).json({ message: "Shipper name is required" });
  }

  // Add other field validations here if needed...

  try {
    const updated_date = moment().tz('Africa/Lagos').format('YYYY-MM-DD HH:mm:ss');

    const [updateResult] = await sequelize.query(
      `UPDATE shipment_info SET
        shipper_name = :shipper_name,
        shipper_phone = :shipper_phone,
        shipper_address = :shipper_address,
        shipper_email = :shipper_email,
        receiver_name = :receiver_name,
        receiver_phone = :receiver_phone,
        receiver_address = :receiver_address,
        receiver_email = :receiver_email,
        shipment_type = :shipment_type,
        box_number = :box_number,
        courier = :courier,
        payment_mode = :payment_mode,
        origin = :origin,
        destination = :destination,
        pickup_date = :pickup_date,
        expected_date_delivery = :expected_date_delivery,
        comments = :comments,
        pickup_location = :pickup_location,
        pickup_price = :pickup_price,
        province = :province,
        product_type = :product_type,
        product_type_price = :product_type_price
      WHERE trans_id = :trans_id`,
      {
        replacements: {
          trans_id,
          shipper_name,
          shipper_phone,
          shipper_address,
          shipper_email,
          receiver_name,
          receiver_phone,
          receiver_address,
          receiver_email,
          shipment_type,
          box_number,
          courier,
          payment_mode,
          origin,
          destination,
          pickup_date,
          expected_date_delivery,
          comments,
          pickup_location,
          pickup_price,
          province,
          product_type,
          product_type_price,
        },
      }
    );

    // Check if any row was updated
    if (updateResult.affectedRows === 0) {
      // return res.status(404).json({ message: `No shipment found with trans_id: ${trans_id}` });
    }

    res.status(200).json({
      message: "Shipment updated successfully",
    });
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(500).json({
      message: "Failed to update shipment",
      error: error.message,
    });
  }
};


const getPendingWeighments = async (req, res) => {
  try {
    // Query to fetch pending weighments
    const pendingWeighmentsQuery = `
    SELECT 
      pw.trans_id,
      si.shipper_name,
      si.shipper_phone,
      si.shipper_address,
      si.shipper_email,
      si.receiver_name,
      si.receiver_phone,
      si.receiver_address,
      si.receiver_email,
      si.shipment_type,
      si.box_number,
      si.courier,
      si.payment_mode,
      si.origin,
      si.destination,
      si.pickup_date,
      si.expected_date_delivery,
      si.comments,
      si.province,
      si.created_date
    FROM 
      pending_weighment pw
    LEFT JOIN 
      shipment_info si
    ON 
      pw.trans_id = si.trans_id
    WHERE 
      si.location = :location
    ORDER BY 
      si.created_date DESC
  `;
  


    // Execute the query to fetch pending weighments and shipment info
    const pendingWeighments = await sequelize.query(pendingWeighmentsQuery, {
      replacements: { location: req.user.location },
      type: sequelize.QueryTypes.SELECT,
    });

    if (pendingWeighments.length === 0) {
      return res.status(404).json({
        message: "No pending weighments found.",
      });
    }

    // Fetch items for each pending weighment from shipment_items table
    const transIds = pendingWeighments.map((record) => record.trans_id);
    const itemsQuery = `
      SELECT 
        trans_id,
        name,
        type,
        weight,
        status,
        item_trans_id
      FROM 
        shipment_items
      WHERE 
        trans_id IN (:transIds)
    `;

    const shipmentItems = await sequelize.query(itemsQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { transIds },
    });

    // Map items to their corresponding transaction IDs
    const itemsMap = shipmentItems.reduce((acc, item) => {
      if (!acc[item.trans_id]) {
        acc[item.trans_id] = [];
      }
      acc[item.trans_id].push({
        name: item.name,
        type: item.type,
        weight: item.weight,
        status: item.status,
        item_trans_id: item.item_trans_id,
      });
      return acc;
    }, {});

    // Combine shipment info with items
    const results = pendingWeighments.map((record) => ({
      ...record,
      items: itemsMap[record.trans_id] || [],
    }));

    res.status(200).json({
      message: "Pending weighments retrieved successfully.",
      data: results,
    });
  } catch (error) {
    console.error("Error fetching pending weighments:", error);
    res.status(500).json({
      message: "Failed to retrieve pending weighments.",
      error: error.message,
    });
  }
};

const updateItems = async (req, res) => {
  const { trans_id, items } = req.body;

  // Validate required fields
  if (!trans_id || trans_id.trim() === "") {
    return res.status(400).json({ message: "Transaction ID is required" });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items must be a non-empty array" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Delete existing items for the given trans_id
      await sequelize.query(
        `DELETE FROM shipment_items WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Insert new items
      console.log(items);
      
      const insertPromises = items.map((item) => {
        const { name, type, weight, box_number } = item; // Ensure each item has these properties
        if (!name || !type || !weight || !box_number) {
          throw new Error("Each item must have a name, type, box number and weight");
        }

        const item_trans_id =
          trans_id +
          "_" +
          Math.random().toString(36).substr(2, 4).toUpperCase();

        return sequelize.query(
          `INSERT INTO shipment_items (trans_id, name, type, weight, status, item_trans_id, box_number) 
           VALUES (:trans_id, :name, :type, :weight, :status, :item_trans_id, :box_number)`,
          {
            replacements: {
              trans_id,
              name,
              type,
              weight,
              status: "Pending",
              item_trans_id,
              box_number
            },
            transaction,
          }
        );
      });

      await Promise.all(insertPromises);

      await transaction.commit();

      res.status(200).json({
        message: "Items updated successfully",
        trans_id,
        items: items.map((item) => ({
          ...item,
          status: "Pending",
          item_trans_id:
            trans_id +
            "_" +
            Math.random().toString(36).substr(2, 4).toUpperCase(),
        })),
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update items",
      error: error.message,
    });
  }
};

const processPayment = async (req, res) => {
  const { trans_id } = req.body;

  // Check if trans_id is provided
  if (!trans_id) {
    return res.status(400).json({
      message: "Transaction ID (trans_id) is required.",
    });
  }

  try {
    const transaction = await sequelize.transaction();

    try {
      await sequelize.query(
        `UPDATE shipment_info SET status = 'pending payment' WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      const [shipmentItems] = await sequelize.query(
        `SELECT trans_id, name, type, weight, status, item_trans_id FROM shipment_items WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      if (!shipmentItems || shipmentItems.length === 0) {
        throw new Error(
          "No items found in shipment_items for this transaction."
        );
      }

      await sequelize.query(
        `INSERT INTO pending_payment (trans_id) VALUES (:trans_id)`,
        {
          replacements: {
            trans_id,
          },
          transaction,
        }
      );

      await sequelize.query(
        `DELETE FROM pending_weighment WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      await transaction.commit();

      res.status(200).json({
        message:
          "Payment processing successful. Shipment status updated, transaction moved to pending_payment, and item removed from pending_weighment.",
        items: shipmentItems,
      });
    } catch (error) {
      await transaction.rollback();

      console.error("Error processing payment:", error);
      res.status(500).json({
        message: "Failed to process payment.",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error initiating payment process:", error);
    res.status(500).json({
      message: "An unexpected error occurred while processing the payment.",
      error: error.message,
    });
  }
};

const getPendingPayment = async (req, res) => {
  const { date } = req.body;

  // Validate that the date is provided and is a valid date
  if (!date || isNaN(new Date(date))) {
    return res.status(400).json({
      message: "Invalid date provided. Please provide a valid date.",
    });
  }

  try {
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Query to fetch pending payments and shipment info
    const pendingPaymentsQuery = `
    SELECT 
      pw.trans_id,
      si.shipper_name,
      si.shipper_phone,
      si.shipper_address,
      si.shipper_email,
      si.receiver_name,
      si.receiver_phone,
      si.receiver_address,
      si.receiver_email,
      si.shipment_type,
      si.box_number,
      si.courier,
      si.payment_mode,
      si.origin,
      si.destination,
      si.pickup_date,
      si.expected_date_delivery,
      si.comments,
      si.province,
      si.created_date,
      si.pickup_price,
      si.product_type_price,
      si.product_type,
      si.prepared_by
    FROM 
      pending_payment pw
    JOIN 
      shipment_info si
    ON 
      pw.trans_id = si.trans_id
    WHERE 
      DATE(si.created_date) = :formattedDate AND si.location = :location
  `;

    // Execute the query to fetch pending payments
    const pendingPayments = await sequelize.query(pendingPaymentsQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { formattedDate, location: req.user.location },
    });

    if (pendingPayments.length === 0) {
      return res.status(404).json({
        message: "No pending payments found for the given date.",
      });
    }

    // Fetch shipment items for all pending transactions
    const transIds = pendingPayments.map((record) => record.trans_id);
    const itemsQuery = `
      SELECT 
        trans_id,
        name,
        type,
        weight,
        status,
        item_trans_id, 
        box_number
      FROM 
        shipment_items
      WHERE 
        trans_id IN (:transIds)
    `;

    const shipmentItems = await sequelize.query(itemsQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { transIds },
    });

    // Map items to their corresponding transaction IDs
    const itemsMap = shipmentItems.reduce((acc, item) => {
      if (!acc[item.trans_id]) {
        acc[item.trans_id] = [];
      }
      acc[item.trans_id].push({
        name: item.name,
        box_number: item.box_number,
        type: item.type,
        weight: item.weight,
        status: item.status,
        item_trans_id: item.item_trans_id,
      });
      return acc;
    }, {});

    // Combine pending payments with items
    const processedResults = pendingPayments.map((record) => ({
      ...record,
      items: itemsMap[record.trans_id] || [],
    }));

    res.status(200).json({
      message: "Pending payments retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    res.status(500).json({
      message: "Failed to retrieve pending payments.",
      error: error.message,
    });
  }
};

const processCompletedPayment = async (req, res) => {
  const { trans_id } = req.body;

  // Check if trans_id is provided
  if (!trans_id) {
    return res.status(400).json({
      message: "Transaction ID (trans_id) is required.",
    });
  }

  try {
    // Start a transaction to ensure data consistency
    const transaction = await sequelize.transaction();

    try {
      // Step 1: Update the status in shipment_info table to "pending payment"
      await sequelize.query(
        `UPDATE shipment_info SET status = 'pending payment' WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Step 2: Get the items from pending_weighment table for the given trans_id
      const [pendingWeighment] = await sequelize.query(
        `SELECT items FROM pending_weighment WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // If no items are found in pending_weighment, return an error
      if (!pendingWeighment || !pendingWeighment[0]) {
        throw new Error(
          "No items found in pending weighment for this transaction."
        );
      }

      const items = pendingWeighment[0].items;

      // Step 3: Delete the entry in pending_weighment table
      await sequelize.query(
        `DELETE FROM pending_weighment WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Step 4: Add the items in pending_payment table
      await sequelize.query(
        `INSERT INTO pending_payment (trans_id, items) VALUES (:trans_id, :items)`,
        {
          replacements: {
            trans_id,
            items: JSON.stringify(items), // Ensure items are stringified
          },
          transaction,
        }
      );

      // Step 5: Update the status of all items in shipment_items table to "Processed"
      await sequelize.query(
        `UPDATE shipment_items SET status = 'Processed' WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      // Commit the transaction
      await transaction.commit();

      // Return success response
      res.status(200).json({
        message:
          "Payment processing successful. Shipment status updated, items moved to pending_payment, and shipment items status updated to Processed.",
      });
    } catch (error) {
      // If there was an error during the transaction, rollback
      await transaction.rollback();

      console.error("Error processing payment:", error);
      res.status(500).json({
        message: "Failed to process payment.",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error initiating payment process:", error);
    res.status(500).json({
      message: "An unexpected error occurred while processing the payment.",
      error: error.message,
    });
  }
};

const getRecentShippingCost = async (req, res) => {
  try {
    const [result] = await sequelize.query(
      `
      SELECT 
        oldrate, 
        newrate, 
        date 
      FROM 
        conf_shipment_cost 
      ORDER BY 
        date DESC 
      LIMIT 1
      `,
      {
        type: sequelize.QueryTypes.SELECT, // Ensures only the result set is returned
      }
    );

    // Check if a record was found
    if (!result) {
      return res.status(404).json({
        message: "No shipping cost records found.",
      });
    }

    // Return the most recent shipping cost
    res.status(200).json({
      message: "Most recent shipping cost retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching recent shipping cost:", error);
    res.status(500).json({
      message: "Failed to retrieve the most recent shipping cost.",
      error: error.message,
    });
  }
};
const getMostRecentCounter = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const [counterRecord] = await sequelize.query(
      `SELECT counter FROM daily_counters ORDER BY date DESC LIMIT 1`,
      {
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    await transaction.commit();

    console.log(counterRecord);
    

    const counter = counterRecord ? counterRecord.counter : 0;
    return res.status(200).json({ counter });
  } catch (error) {
    await transaction.rollback();
    console.error('Error fetching most recent counter:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const completePayment = async (req, res) => {
  const {
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
    invoice_no
  } = req.body;

  try {


    
    if (
      !trans_id ||
      !amount ||
      !items ||
      !payment_mode ||
      !weight ||
      !shipping_rate
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const parsedItems = JSON.parse(items);

    const [shipmentInfo] = await sequelize.query(
      `SELECT * FROM shipment_info WHERE trans_id = :trans_id`,
      { type: sequelize.QueryTypes.SELECT, replacements: { trans_id } }
    );

    if (!shipmentInfo) {
      return res.status(404).json({ message: "Shipment info not found." });
    }
    const transaction = await sequelize.transaction();   
    const logoPath = path.join(__dirname, "logo.png");
    const emailSubject = `Shipment processed successfully: ${trans_id}`;
    const emailBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="text-align: center;">
        <img src="cid:logo" alt="Canada Cargo" style="height: 50px; margin-bottom: 10px;" />
        <h2 style="color: #004085;">Shipment Processed Successfully</h2>
      </div>
      
      <p>Dear ${shipmentInfo.shipper_name},</p>
      
      <p>We are pleased to inform you that your shipment with transaction ID <strong>${trans_id}</strong> has been successfully processed.</p>
      
      <p><strong>Your invoice has been attached to this email.</strong></p>
  
      <h3 style="color: #004085;">Shipment Details</h3>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <tbody>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">Shipper Name</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.shipper_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6;">Shipper Phone</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.shipper_phone}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">Shipper Address</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.shipper_address}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6;">Shipper Email</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.shipper_email}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">Receiver Name</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.receiver_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6;">Receiver Phone</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.receiver_phone}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">Receiver Address</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.receiver_address}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6;">Receiver Email</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.receiver_email}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">Shipment Type</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.shipment_type}</td>
          </tr>
 
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">Courier</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.courier}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6;">Payment Mode</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.payment_mode}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">Origin</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.origin}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6;">Destination</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.destination}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #dee2e6;">Pickup Date</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.pickup_date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6;">Expected Delivery Date</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${shipmentInfo.expected_date_delivery}</td>
          </tr>
        </tbody>
      </table>
  
      <p style="margin-top: 20px;">Thank you for choosing <strong>Canada Cargo</strong>.</p>
      
      <p style="font-size: 13px; color: #6c757d;">This is an automated message. Please do not reply to this email.</p>
    </div>
  `;
    const emailAttachments = [
      { filename: "logo.png", path: logoPath, cid: "logo" },
      {
        filename: "invoice.pdf",
        content: req.file.buffer,
        contentType: "application/pdf",
      },
    ];

    await Promise.all([
      transporter.sendMail({
        from: '"Canada Cargo" <info@canadacargo.net>',
        to: shipmentInfo.shipper_email,
        subject: emailSubject,
        html: emailBody,
        attachments: emailAttachments,
      }),
      transporter.sendMail({
        from: '"Canada Cargo" <info@canadacargo.net>',
        to: shipmentInfo.receiver_email,
        subject: emailSubject,
        html: emailBody,
        attachments: emailAttachments,
      }),
    ]);

    try {
      await Promise.all([
        sequelize.query(
          `UPDATE shipment_info SET items = :items, status = 'Processed' WHERE trans_id = :trans_id`,
          {
            replacements: { items: JSON.stringify(parsedItems), trans_id },
            transaction,
          }
        ),
        sequelize.query(
          `UPDATE shipment_items SET status = 'Processed' WHERE trans_id = :trans_id`,
          { replacements: { trans_id }, transaction }
        ),
        sequelize.query(
          `DELETE FROM pending_payment WHERE trans_id = :trans_id`,
          { replacements: { trans_id }, transaction }
        ),
      ]);


      const currentDate = new Date().toISOString();
      await sequelize.query(
        `INSERT INTO completed_payments (
          trans_id, date, amount, payment_mode, invoice_no, weight, shipping_rate, carton, custom_fee, doorstep_fee, pickup_fee
        ) VALUES (
          :trans_id, :date, :amount, :payment_mode, :invoice_no, :weight, :shipping_rate, :carton, :custom_fee, :doorstep_fee, :pickup_fee
        )`,
        {
          replacements: {
            trans_id,
            date: currentDate,
            amount,
            payment_mode,
            invoice_no,
            weight,
            shipping_rate,
            carton: carton || 0,
            custom_fee: custom_fee || 0,
            doorstep_fee: doorstep_fee || 0,
            pickup_fee: pickup_fee || 0,
          },
          transaction,
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    res.status(200).json({ message: "Payment completed successfully." });
  } catch (error) {
    console.error("Error completing payment:", error);
    res
      .status(500)
      .json({ message: "Failed to complete payment.", error: error.message });
  }
};



const getCompletedPayments = async (req, res) => {
  const { startDate, endDate } = req.body;

  // Validate that at least one of startDate or endDate is provided
  if (
    (!startDate && !endDate) ||
    (startDate && isNaN(new Date(startDate))) ||
    (endDate && isNaN(new Date(endDate)))
  ) {
    return res.status(400).json({
      message:
        "Invalid dates provided. Please provide at least one valid date (start date or end date).",
    });
  }

  try {
    let formattedStartDate, formattedEndDate;

    // If startDate is provided, format it; if not, use the earliest date possible
    if (startDate) {
      formattedStartDate = new Date(startDate).toISOString().split("T")[0];
    } else {
      formattedStartDate = "1970-01-01";
    }

    if (endDate) {
      formattedEndDate = new Date(endDate).toISOString().split("T")[0];
    } else {
      formattedEndDate = new Date().toISOString().split("T")[0];
    }

    // Fetch completed payments and shipment details within the date range
    const results = await sequelize.query(
      `
      SELECT 
        cp.trans_id, 
        cp.date, 
        cp.amount, 
        cp.payment_mode, 
        cp.weight, 
        cp.invoice_no, 
        cp.shipping_rate, 
        cp.carton, 
        cp.custom_fee, 
        cp.doorstep_fee, 
        cp.pickup_fee, 
        si.shipper_name, 
        si.shipper_phone, 
        si.shipper_address, 
        si.shipper_email, 
        si.receiver_name, 
        si.receiver_phone, 
        si.receiver_address, 
        si.receiver_email, 
        si.shipment_type, 
        si.box_number, 
        si.courier, 
        si.origin, 
        si.destination, 
        si.pickup_date, 
        si.pickup_price, 
        si.expected_date_delivery, 
        si.comments, 
        si.province,
        si.trans_id, 
        si.status, 
        si.created_date,
        si.product_type_price,
        si.product_type,
        si.prepared_by
      FROM 
        completed_payments cp
      JOIN 
        shipment_info si
      ON 
        cp.trans_id = si.trans_id
      WHERE 
        DATE(cp.date) BETWEEN :formattedStartDate AND :formattedEndDate 
        AND si.location = :location
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          formattedStartDate,
          formattedEndDate,
          location: req.user.location,
        },
      }
    );
    
    if (results.length === 0) {
      return res.status(404).json({
        message: "No completed payments found for the given date range.",
      });
    }

    // Process each result to fetch items from shipment_items table
    const processedResults = await Promise.all(
      results.map(async (result) => {
        // Fetch items related to the current trans_id from shipment_items table
        const items = await sequelize.query(
          `
          SELECT 
           *
          FROM 
            shipment_items 
          WHERE 
            trans_id = :trans_id
          `,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: result.trans_id },
          }
        );

        // Safely parse the items if necessary
        const safelyParseJSON = (jsonString) => {
          try {
            const parsed = JSON.parse(jsonString);
            if (typeof parsed === "string") {
              return safelyParseJSON(parsed); // Recursively parse if it's a string
            }
            return parsed;
          } catch (error) {
            return []; // Return an empty array if parsing fails
          }
        };

        return {
          ...result,
          items: items.map((item) => ({
            ...item,
            items: safelyParseJSON(item.items), // Parse items JSON
          })),
        };
      })
    );

    res.status(200).json({
      message: "Completed payments retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching completed payments:", error);
    res.status(500).json({
      message: "Failed to retrieve completed payments.",
      error: error.message,
    });
  }
};

const getShipmentItems = async (req, res) => {
  const { start_date, end_date, status } = req.query;
  const location = req.user.location; // Extract location from authenticated user

  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const formattedStartDate = start_date
      ? new Date(start_date).toISOString().split("T")[0]
      : currentDate;
    const formattedEndDate = end_date
      ? new Date(end_date).toISOString().split("T")[0]
      : currentDate;

    // Fetch the basic shipment info from shipment_info table with location filter
    const shipments = await sequelize.query(
      `
      SELECT 
        shipper_name, 
        shipper_phone, 
        shipper_address, 
        shipper_email, 
        receiver_name, 
        receiver_phone, 
        receiver_address, 
        receiver_email, 
        shipment_type, 
        box_number, 
        courier, 
        payment_mode, 
        origin, 
        destination, 
        pickup_date, 
        expected_date_delivery, 
        comments, 
        trans_id, 
        status, 
        created_date,
        province
      FROM 
        shipment_info 
      WHERE 
        DATE(created_date) BETWEEN :startDate AND :endDate
        AND location = :location
      ORDER BY 
        created_date DESC
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          location,
        },
      }
    );

    if (shipments.length === 0) {
      return res.status(404).json({
        message: "No shipment items found for the specified date range and location.",
      });
    }

    const processedResults = await Promise.all(
      shipments.map(async (shipment) => {
        const allItems = await sequelize.query(
          `SELECT * FROM shipment_items WHERE trans_id = :trans_id`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: shipment.trans_id },
          }
        );

        const hasMatchingStatus = status
          ? allItems.some((item) => item.status === status)
          : true;

        if (status && !hasMatchingStatus) {
          return null;
        }

        return {
          ...shipment,
          items: allItems,
        };
      })
    );

    const filteredResults = processedResults.filter((result) => result !== null);

    if (filteredResults.length === 0) {
      return res.status(404).json({
        message: "No shipments match the specified criteria.",
      });
    }

    res.status(200).json({
      message: "Shipment items retrieved successfully.",
      data: filteredResults,
    });
  } catch (error) {
    console.error("Error fetching shipment items:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment items.",
      error: error.message,
    });
  }
};
const getAllShipmentItems = async (req, res) => {
  const { start_date, end_date, status } = req.query;
  const location = req.user.location; // Extract location from authenticated user

  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const formattedStartDate = start_date
      ? new Date(start_date).toISOString().split("T")[0]
      : currentDate;
    const formattedEndDate = end_date
      ? new Date(end_date).toISOString().split("T")[0]
      : currentDate;

    // Fetch the basic shipment info from shipment_info table with location filter
    const shipments = await sequelize.query(
      `
      SELECT 
        shipper_name, 
        shipper_phone, 
        shipper_address, 
        shipper_email, 
        receiver_name, 
        receiver_phone, 
        receiver_address, 
        receiver_email, 
        shipment_type, 
        box_number, 
        courier, 
        payment_mode, 
        origin, 
        destination, 
        pickup_date, 
        expected_date_delivery, 
        comments, 
        trans_id, 
        status, 
        created_date,
        province, location
      FROM 
        shipment_info 
      WHERE 
        DATE(created_date) BETWEEN :startDate AND :endDate
     
      ORDER BY 
        created_date DESC
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      }
    );

    if (shipments.length === 0) {
      return res.status(404).json({
        message: "No shipment items found for the specified date range and location.",
      });
    }

    const processedResults = await Promise.all(
      shipments.map(async (shipment) => {
        const allItems = await sequelize.query(
          `SELECT * FROM shipment_items WHERE trans_id = :trans_id`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: shipment.trans_id },
          }
        );

        const hasMatchingStatus = status
          ? allItems.some((item) => item.status === status)
          : true;

        if (status && !hasMatchingStatus) {
          return null;
        }

        return {
          ...shipment,
          items: allItems,
        };
      })
    );

    const filteredResults = processedResults.filter((result) => result !== null);

    if (filteredResults.length === 0) {
      return res.status(404).json({
        message: "No shipments match the specified criteria.",
      });
    }

    res.status(200).json({
      message: "Shipment items retrieved successfully.",
      data: filteredResults,
    });
  } catch (error) {
    console.error("Error fetching shipment items:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment items.",
      error: error.message,
    });
  }
};


const getBarcodeShipmentItems = async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    // If no dates are provided, use the current date for both start and end
    const currentDate = new Date().toISOString().split("T")[0];

    // If only one date is provided, use that particular date for the missing one
    const formattedStartDate = start_date
      ? new Date(start_date).toISOString().split("T")[0]
      : currentDate;
    const formattedEndDate = end_date
      ? new Date(end_date).toISOString().split("T")[0]
      : currentDate;

    // Fetch the basic shipment info from shipment_info table with filtered statuses
    const shipments = await sequelize.query(
      `
      SELECT 
        shipper_name, 
        shipper_phone, 
        shipper_address, 
        shipper_email, 
        receiver_name, 
        receiver_phone, 
        receiver_address, 
        receiver_email, 
        shipment_type, 
        box_number, 
        courier, 
        payment_mode, 
        origin, 
        destination, 
        pickup_date, 
        expected_date_delivery, 
        comments, 
        trans_id, 
        status, 
        created_date,
        province
      FROM 
        shipment_info 
      WHERE 
        DATE(created_date) BETWEEN :startDate AND :endDate
        AND status IN ('In transit', 'Processed', 'Out of office') 
        AND location = :location
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          location: req.user.location,
        },
      }
    );
    
    // If no shipments are found, return a 404 response
    if (shipments.length === 0) {
      return res.status(404).json({
        message: "No shipment items found for the specified date range.",
      });
    }

    // Process the items for each shipment by querying the shipment_items table
    const processedResults = await Promise.all(
      shipments.map(async (shipment) => {
        // Fetch items related to the current shipment using trans_id
        const items = await sequelize.query(
          `SELECT * FROM shipment_items WHERE trans_id = :trans_id`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: shipment.trans_id },
          }
        );

        // Process items and safely parse them (if needed)
        const safelyParseJSON = (jsonString) => {
          try {
            const parsed = JSON.parse(jsonString);
            if (typeof parsed === "string") {
              return safelyParseJSON(parsed); // Recursively parse if it's a string
            }
            return parsed;
          } catch (error) {
            return []; // Return an empty array if parsing fails
          }
        };

        // Attach the items to the shipment object
        return {
          ...shipment,
          items: items,
        };
      })
    );

    // Return the successfully processed results
    res.status(200).json({
      message: "Shipment items retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching shipment items:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment items.",
      error: error.message,
    });
  }
};

const getShipmentInfoByTransId = async (req, res) => {
  const { item_trans_id } = req.body;

  // Validate that item_trans_id is provided
  if (!item_trans_id) {
    return res.status(400).json({
      message: "Item Transaction ID (item_trans_id) is required.",
    });
  }


  try {
    // Query to fetch the specific item using item_trans_id
    const [item] = await sequelize.query(
      `
      SELECT 
        trans_id, 
        name, 
        type, 
        weight, 
        status, 
        item_trans_id 
      FROM 
        shipment_items 
      WHERE 
        item_trans_id = :item_trans_id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { item_trans_id },
      }
    );

    // Check if the specific item exists
    if (!item) {
      return res.status(404).json({
        message: `No item found for item transaction ID: ${item_trans_id}.`,
      });
    }

    // Fetch all items with the same trans_id
    const allItems = await sequelize.query(
      `
      SELECT 
        trans_id, 
        name, 
        type, 
        weight, 
        status, 
        item_trans_id 
      FROM 
        shipment_items 
      WHERE 
        trans_id = :trans_id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { trans_id: item.trans_id },
      }
    );

    // Fetch shipment details for the trans_id
    const [shipmentInfo] = await sequelize.query(
      `
      SELECT 
        shipper_name, 
        shipper_phone, 
        shipper_address, 
        shipper_email, 
        receiver_name, 
        receiver_phone, 
        receiver_address, 
        receiver_email, 
        shipment_type, 
        box_number, 
        courier, 
        payment_mode, 
        origin, 
        destination, 
        pickup_date, 
        expected_date_delivery, 
        comments, 
        trans_id, 
        status, 
        created_date 
      FROM 
        shipment_info 
      WHERE 
        trans_id = :trans_id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { trans_id: item.trans_id },
      }
    );

    // Check if shipment info exists
    if (!shipmentInfo) {
      return res.status(404).json({
        message: `No shipment information found for Item: ${item.trans_id}.`,
      });
    }

    console.log({
      data: {
        searchedItem: item,
        allItems: allItems,
        shipmentInfo: shipmentInfo,
      },
    });

    // Combine the data and return the response
    res.status(200).json({
      message: "Shipment information retrieved successfully.",
      data: {
        searchedItem: item,
        allItems: allItems,
        shipmentInfo: shipmentInfo,
      },
    });
  } catch (error) {
    console.error("Error fetching shipment information:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment information.",
      error: error.message,
    });
  }
};

const getShipmentInfoForEdit = async (req, res) => {
  const { trans_id } = req.body;

  // Validate that trans_id is provided
  if (!trans_id) {
    return res.status(400).json({
      message: "Transaction ID (trans_id) is required.",
    });
  }

  try {
    // Fetch shipment info using trans_id
    const [shipmentInfo] = await sequelize.query(
      `
      SELECT * FROM shipment_info WHERE trans_id = :trans_id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { trans_id },
      }
    );

    // Check if shipment info was found
    if (!shipmentInfo) {
      return res.status(404).json({
        message: `No shipment information found for Transaction ID: ${trans_id}.`,
      });
    }

    // Return the shipment info
    res.status(200).json({
      message: "Shipment information retrieved successfully.",
      data: shipmentInfo,
    });
  } catch (error) {
    console.error("Error retrieving shipment information:", error);
    res.status(500).json({
      message: "An error occurred while fetching shipment information.",
      error: error.message,
    });
  }
};


const updateItemStatusToOutOfOffice = async (req, res) => {
  const { item_trans_id, trans_id, senderEmail, receiverEmail } = req.body;

  // console.log(senderEmail, receiverEmail);

  if (!item_trans_id || item_trans_id.trim() === "") {
    return res.status(400).json({ message: "Item transaction ID is required" });
  }

  if (!senderEmail || senderEmail.trim() === "") {
    return res.status(400).json({ message: "Sender email is required" });
  }

  if (!receiverEmail || receiverEmail.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }

  try {
    const transaction = await sequelize.transaction();
    try {
      // Update the status of the item in the shipment_items table
      await sequelize.query(
        `UPDATE shipment_items 
         SET status = 'Out Of Office' 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      const currentDate = new Date().toISOString();
      await sequelize.query(
        `INSERT INTO out_of_office (item_trans_id, created_at) 
         VALUES (:item_trans_id, :created_at)`,
        {
          replacements: { item_trans_id, created_at: currentDate },
          transaction,
        }
      );

      const [remainingItems] = await sequelize.query(
        `SELECT COUNT(*) as count
         FROM shipment_items 
         WHERE trans_id = :trans_id AND status IN ('Pending', 'Processed')`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      await transaction.commit();

      if (remainingItems[0].count === 0) {
        const [shipmentInfo] = await sequelize.query(
          `SELECT shipper_name, receiver_name 
           FROM shipment_info 
           WHERE trans_id = :trans_id`,
          {
            replacements: { trans_id },
          }
        );

        if (!shipmentInfo || !shipmentInfo.length) {
          return res
            .status(404)
            .json({ message: "Shipment information not found" });
        }

        const { shipper_name, receiver_name } = shipmentInfo[0];

        // Send email notification


        const logoPath = path.join(__dirname, "logo.png");

        const mailOptions = {
          from: '"Canada Cargo" <info@canadacargo.net>',
          to: `${senderEmail}, ${receiverEmail}`, // receiver addresses (both sender and receiver)
          subject: `Item Status Update - Out Of Office`,
          html: `
            <div
              style="
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff69;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.044);
              "
            >
              <div
                style="text-align: center; padding: 20px; background-color: #007bff1f; border-radius: 8px 8px 0 0;"
              >
                <img
                  src="cid:logo"
                  alt="Canada Cargo Logo"
                  style="max-width: 180px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;"
                />
              </div>
              <div
                style="padding: 20px; color: #333; line-height: 1.6; background-color: #f9f9f93f; border-radius: 0 0 8px 8px;"
              >
                <p style="font-size: 16px; margin-bottom: 20px">Dear ${shipper_name} and ${receiver_name},</p>
    
                <p style="font-size: 16px; margin-bottom: 20px">
                  We are reaching out to inform you that the status your items
                  has been updated to <strong>Out of office</strong>. The updated status
                  is as follows:
                </p>
    
                <p style="font-size: 16px; margin-bottom: 20px">
                  <strong>Tracking Number:</strong>
                  <span style="font-size: 18px; font-weight: bold; color: #007bff">${trans_id}</span>
                </p>
    
                <p style="font-size: 16px; margin-bottom: 20px">
                  You can track the status of your item at any time by visiting our
                  website using the tracking number provided. Click the link below to
                  track your shipment:
                </p>
    
                <p style="font-size: 16px; margin-bottom: 20px">
                  <a
                    href="http://localhost:5174/trackshipment/${trans_id}"
                    target="_blank"
                    style="
                      color: #007bff;
                      font-weight: bold;
                      text-decoration: none;
                      padding: 10px 15px;
                      border: 2px solid #007bff;
                      border-radius: 5px;
                      display: inline-block;
                    "
                  >Track your shipment here</a>
                </p>
    
                <p style="font-size: 16px; margin-top: 30px">
                  If you have any questions or need further assistance, feel free to
                  reach out to us.
                </p>
    
                <p style="font-size: 16px; margin-top: 20px">
                  Best regards,<br />
                  <strong>Canada Cargo</strong>
                </p>
              </div>
    
              <div
                style="text-align: center; font-size: 14px; color: #888; padding: 10px; background-color: #f4f4f4; border-radius: 0 0 8px 8px;"
              >
                <p style="margin: 0">
                  Canada Cargo |
                  <a href="https://canadacargo.net" style="color: #007bff"> www.canadacargo.net </a>
                </p>
                <p style="margin: 0">© 2025 Canada Cargo. All Rights Reserved.</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "logo.png",
              path: logoPath,
              cid: "logo",
            },
          ],
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error sending email:", error);
            return res.status(500).send("Error sending email.");
          } else {
            console.log("Email sent: " + info.response);
            return res
              .status(200)
              .send("Item status updated and email sent successfully.");
          }
        });
      }

      res.status(200).json({
        message:
          "Item status updated to 'Out Of Office'. Email sent if this was the last item.",
        item_trans_id,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update item status",
      error: error.message,
    });
  }
};

const updateItemStatusToArrived = async (req, res) => {
  const { item_trans_id, trans_id, senderEmail, receiverEmail } = req.body;

  // Validate required fields
  if (!item_trans_id || item_trans_id.trim() === "") {
    return res.status(400).json({ message: "Item transaction ID is required" });
  }
  if (!senderEmail || senderEmail.trim() === "") {
    return res.status(400).json({ message: "Sender email is required" });
  }
  if (!receiverEmail || receiverEmail.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }

  try {
    // Fetch sender and receiver details from shipment_info table
    const shipmentInfoQuery = `SELECT shipper_name, receiver_name FROM shipment_info WHERE shipper_email = :senderEmail AND receiver_email = :receiverEmail LIMIT 1`;
    const [shipmentInfo] = await sequelize.query(shipmentInfoQuery, {
      replacements: { senderEmail, receiverEmail },
    });

    if (!shipmentInfo || shipmentInfo.length === 0) {
      return res
        .status(404)
        .json({ message: "Shipment information not found" });
    }

    const { shipper_name, receiver_name } = shipmentInfo[0];

    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Update the status of the item in the shipment_items table to 'Arrived'
      await sequelize.query(
        `UPDATE shipment_items 
         SET status = 'Arrived' 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Delete the item from the items_intransit table
      await sequelize.query(
        `DELETE FROM items_intransit 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Insert the item into the arrivals table with the current timestamp
      const currentDate = new Date().toISOString();
      await sequelize.query(
        `INSERT INTO arrivals (item_trans_id, created_at) 
         VALUES (:item_trans_id, :created_at)`,
        {
          replacements: { item_trans_id, created_at: currentDate },
          transaction,
        }
      );

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        message:
          "Item status updated to 'Arrived', deleted from 'in_transit', recorded in 'arrivals', and email sent",
        item_trans_id,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update item status, delete from 'in_transit', and insert into 'arrivals'",
      error: error.message,
    });
  }
};

const sendArrivalNotification = async (req, res) => {
  const { senderEmail, receiverEmail, trans_id } = req.body;

  if (!senderEmail?.trim()) {
    return res.status(400).json({ message: "Sender email is required" });
  }
  if (!receiverEmail?.trim()) {
    return res.status(400).json({ message: "Receiver email is required" });
  }
  if (!trans_id?.trim()) {
    return res.status(400).json({ message: "Transaction ID is required" });
  }

  try {
    const [shipmentInfo] = await sequelize.query(
      `SELECT shipper_name, receiver_name, province FROM shipment_info WHERE trans_id = :trans_id`,
      { replacements: { trans_id } }
    );

    if (!shipmentInfo || shipmentInfo.length === 0) {
      return res
        .status(404)
        .json({ message: "Shipment information not found" });
    }

    const { shipper_name, receiver_name, province } = shipmentInfo[0];
    const upperProvince =
      province?.toLowerCase() === "ontario" ? "ONTARIO" : province;

    const [items] = await sequelize.query(
      `SELECT * FROM shipment_items WHERE trans_id = :trans_id`,
      { replacements: { trans_id } }
    );

    if (!items || items.length === 0) {
      return res.status(404).json({ message: "Shipment items not found" });
    }

    const clearingFeeQuery = await sequelize.query(
      `SELECT oldrate, newrate, date FROM conf_clearing_fee ORDER BY date DESC LIMIT 1`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const clearingFeeTaxQuery = await sequelize.query(
      `SELECT oldrate, newrate, date FROM conf_clearing_tax ORDER BY date DESC LIMIT 1`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const clearingFee = clearingFeeQuery[0]?.newrate;
    const clearingFeeTax = clearingFeeTaxQuery[0]?.newrate;

    const totalWeight = items
      .filter((item) => item.status === "Arrived")
      .reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);

    const baseFee = 10;
    const fee =
      Number(totalWeight) <= 10
        ? baseFee
        : Number(totalWeight) * Number(clearingFee);
    const clearingFeeValue = fee + (Number(clearingFeeTax) / 100) * fee;

    const statusCount = items.reduce(
      (count, item) => {
        if (item.status.toLowerCase() === "arrived") count.arrived++;
        else if (
          item.status.toLowerCase() !== "arrived" &&
          item.status.toLowerCase() !== "delivered"
        )
          count.outOfOffice++;
        return count;
      },
      { arrived: 0, outOfOffice: 0 }
    );

    await sequelize.query(
      `UPDATE shipment_info SET customs_fee = :clearingFeeValue WHERE trans_id = :trans_id`,
      {
        replacements: { clearingFeeValue, trans_id },
      }
    );

    const isAllArrived = statusCount.arrived === items.length;
    const statusSummary = `${statusCount.arrived} Arrived, ${statusCount.outOfOffice} Not Arrived`;

   

    const logoPath = path.join(__dirname, "logo.png");

    const mailOptions = {
      from: '"Canada Cargo" <info@canadacargo.net>',
      to: `${senderEmail}, ${receiverEmail}`,
      subject: `Shipment Ready for Pickup - ${trans_id}`,
      html: `
        <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff69; border-radius: 8px; font-family: Arial, sans-serif; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.044);">
          <div style="text-align: center; padding: 20px; background-color: #007bff1f; border-radius: 8px 8px 0 0;">
            <img src="cid:logo" alt="Canada Cargo Logo" style="max-width: 180px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" />
          </div>
          <div style="padding: 20px; color: #333; line-height: 1.6; background-color: #f9f9f93f; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px">Dear ${receiver_name} and ${shipper_name},</p>
    
            <p style="font-size: 16px; margin-bottom: 20px">
              Your shipments from Nigeria are now ready for collection in our Pickering office.
            </p>
    
     <p style="font-size: 16px; margin-bottom: 20px">
              <strong>Item Status Summary:</strong> ${statusSummary}
            </p>
    
            <p style="font-size: 16px; margin-bottom: 20px">
              <strong>Tracking Number:</strong>
              <span style="font-size: 18px; font-weight: bold; color: #007bff">${trans_id}</span>
            </p>
    
            <p style="font-size: 16px; margin-bottom: 20px">
              <strong>Item Status Summary:</strong> ${statusSummary}
            </p>
               <p style="font-size: 16px; margin-bottom: 20px">
                      Your customs clearing fees are <strong>$${clearingFeeValue}</strong>. This fee applies only to the items that have arrived.
                    </p>
            ${
              province?.toLowerCase() !== "ontario"
                ? `
              <p style="font-size: 16px; margin-bottom: 20px">
                Outside Ontario locations:<br/>
                <a
                  href="http://localhost:5174/otherprovince/${trans_id}"
                  target="_blank"
                  style="color: #007bff; font-weight: bold; text-decoration: none;">
                  Click here to send your items Outside Ontario</a>
              </p>`
                : `       <p style="font-size: 16px; margin-bottom: 20px">
              ALL PAYMENTS TO<br/>
              <strong>AZEEZ@CANADACARGO.NET</strong>
            </p>
                     
              <a
                href="http://localhost:5174/confirmpayment/${trans_id}"
                target="_blank"
                style="color: #007bff; font-weight: bold; text-decoration: none;">
                After making the payment, click this link to notify us 
                </a>

              <p style="font-size: 16px; margin-bottom: 20px">
                Pick up can be done at:<br/>
                <strong>Unit 212, 1885 Clements Road, Pickering, Ontario, L1W 3V4</strong><br/>
                <strong>Hours of operation:</strong><br/>
                Monday to Friday: 10 AM - 7 PM<br/>
                Saturday: 12 Noon - 3 PM
              </p>`
            }
    
            <p style="font-size: 16px; margin-bottom: 20px">
              Track your shipment using the link below:<br/>
              <a
                href="http://localhost:5174/trackshipment/${trans_id}"
                target="_blank"
                style="color: #007bff; font-weight: bold; text-decoration: none;">
                Track your shipment here</a>
            </p>
    
            <p style="font-size: 16px; margin-top: 20px">
              Thank you for choosing Canada Cargo!
            </p>
          </div>
    
          <div style="text-align: center; font-size: 14px; color: #888; padding: 10px; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
            <p style="margin: 0">
              Canada Cargo |
              <a href="https://canadacargo.net" style="color: #007bff">www.canadacargo.net</a>
            </p>
            <p style="margin: 0">© 2025 Canada Cargo. All Rights Reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(`Error sending email for trans_id ${trans_id}:`, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendArrivalNotifications = async (req, res) => {
  const { notifications } = req.body;

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return res.status(400).json({
      message: "Notifications array is required and must not be empty",
    });
  }

  const errors = [];
  const successes = [];

  for (const notification of notifications) {
    const { senderEmail, receiverEmail, trans_id } = notification;

    if (!senderEmail || senderEmail.trim() === "") {
      errors.push({ trans_id, message: "Sender email is required" });
      continue;
    }
    if (!receiverEmail || receiverEmail.trim() === "") {
      errors.push({ trans_id, message: "Receiver email is required" });
      continue;
    }
    if (!trans_id || trans_id.trim() === "") {
      errors.push({ trans_id, message: "Transaction ID is required" });
      continue;
    }

    try {
      const [shipmentInfo] = await sequelize.query(
        `SELECT shipper_name, receiver_name, province FROM shipment_info WHERE trans_id = :trans_id`,
        { replacements: { trans_id } }
      );

      if (!shipmentInfo || shipmentInfo.length === 0) {
        errors.push({ trans_id, message: "Shipment information not found" });
        continue;
      }

      const { shipper_name, receiver_name, province } = shipmentInfo[0];
      const isOntario = province?.toLowerCase() === "ontario";
      const provinceDisplay = isOntario ? province.toUpperCase() : province;

      const [itemStatuses] = await sequelize.query(
        `SELECT status, COUNT(*) AS count FROM shipment_items WHERE trans_id = :trans_id GROUP BY status`,
        { replacements: { trans_id } }
      );

      if (!itemStatuses || itemStatuses.length === 0) {
        errors.push({
          trans_id,
          message: "No items found for this transaction ID",
        });
        continue;
      }

      let arrived = 0;
      let notArrived = 0;

      itemStatuses.forEach((item) => {
        const status = item.status.toLowerCase();
        const count = parseInt(item.count);

        if (status === "arrived") {
          arrived += count;
        } else if (status !== "delivered") {
          notArrived += count;
        }
      });

      const statusSummary = `${arrived} Arrived, ${notArrived} Not Arrived`;

      const [items] = await sequelize.query(
        `SELECT * FROM shipment_items WHERE trans_id = :trans_id`,
        { replacements: { trans_id } }
      );

      const clearingFeeQuery = await sequelize.query(
        `SELECT oldrate, newrate FROM conf_clearing_fee ORDER BY date DESC LIMIT 1`,
        { type: sequelize.QueryTypes.SELECT }
      );
      const clearingFeeTaxQuery = await sequelize.query(
        `SELECT oldrate, newrate FROM conf_clearing_tax ORDER BY date DESC LIMIT 1`,
        { type: sequelize.QueryTypes.SELECT }
      );

      let clearingFee = clearingFeeQuery[0]?.newrate;
      let clearingFeeTax = clearingFeeTaxQuery[0]?.newrate;

      const totalArrivedItems = items.filter(
        (item) => item.status === "Arrived"
      );
      const totalWeight = totalArrivedItems.reduce(
        (sum, item) => sum + parseFloat(item.weight || 0),
        0
      );

      const baseFee = 10;
      const fee =
        Number(totalWeight) <= 10
          ? baseFee
          : Number(totalWeight) * Number(clearingFee);
      const clearingFeeValue = fee + (Number(clearingFeeTax) / 100) * fee;

      await sequelize.query(
        `UPDATE shipment_info SET customs_fee = :clearingFeeValue WHERE trans_id = :trans_id`,
        {
          replacements: { clearingFeeValue, trans_id },
        }
      );

 

      const logoPath = path.join(__dirname, "logo.png");

      const mailOptions = {
        from: '"Canada Cargo" <info@canadacargo.net>',
        to: `${senderEmail}, ${receiverEmail}`,
        subject: `Item Ready for Pickup - ${trans_id}`,
        html: `
          <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff69; border-radius: 8px; font-family: Arial, sans-serif; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.044);">
            <div style="text-align: center; padding: 20px; background-color: #007bff1f; border-radius: 8px 8px 0 0;">
              <img src="cid:logo" alt="Canada Cargo Logo" style="max-width: 180px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;"/>
            </div>
            <div style="padding: 20px; color: #333; line-height: 1.6; background-color: #f9f9f93f; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 20px">Dear ${receiver_name} and ${shipper_name},</p>
      
              <p style="font-size: 16px; margin-bottom: 20px">
                Your shipments from Nigeria have arrived in Canada.
              </p>

                       <p style="font-size: 16px; margin-bottom: 20px">
                <strong>Item Status Summary:</strong> ${statusSummary}
              </p>
      
              ${
                isOntario
                  ? `<p style="font-size: 16px; margin-bottom: 20px">
                      Your customs clearing fees are <strong>$${clearingFeeValue}</strong>. This fee applies only to the items that have arrived.
                    </p>`
                  : `<p style="font-size: 16px; margin-bottom: 20px">
                      Your customs clearing fees <strong>($${clearingFeeValue})</strong> will be added to your delivery cost.
                    </p>`
              }
      
              <p style="font-size: 16px; margin-bottom: 20px">
                <strong>Tracking Number:</strong>
                <span style="font-size: 18px; font-weight: bold; color: #007bff">${trans_id}</span>
              </p>
      
     
      
              ${
                isOntario
                  ? `
              <p style="font-size: 16px; margin-bottom: 20px">
              ALL PAYMENTS TO<br/>
              <strong>AZEEZ@CANADACARGO.NET</strong>
            </p>
                     
              <a
                href="http://localhost:5174/confirmpayment/${trans_id}"
                target="_blank"
                style="color: #007bff; font-weight: bold; text-decoration: none;">
                After making the payment, click this link to notify us 
                </a>

              <p style="font-size: 16px; margin-bottom: 20px">
                Pick up can be done at:<br/>
                <strong>Unit 212, 1885 Clements Road, Pickering, Ontario, L1W 3V4</strong><br/>
                <strong>Hours of operation:</strong><br/>
                Monday to Friday: 10 AM - 7 PM<br/>
                Saturday: 12 Noon - 3 PM
              </p>
              `
                  : `
              <p style="font-size: 16px; margin-bottom: 20px">
                Outside Ontario locations:<br/>
                <a
                  href="http://localhost:5174/otherprovince/${trans_id}"                
                  target="_blank"
                  style="color: #007bff; font-weight: bold; text-decoration: none;">
                  Click here to send your items Outside Ontario</a>
              </p>
              `
              }
      
              <p style="font-size: 16px; margin-bottom: 20px">
                Track your shipment using the link below:<br/>
                <a
                  href="http://localhost:5174/trackshipment/${trans_id}"
                  target="_blank"
                  style="color: #007bff; font-weight: bold; text-decoration: none;">
                  Track your shipment here</a>
              </p>
      
              <p style="font-size: 16px; margin-bottom: 20px">
                Contact Numbers:<br/>
                <strong>289-660-0515</strong><br/>
                <strong>647-916-9511</strong><br/>
                <strong>647-773-9511</strong>
              </p>
      
              <p style="font-size: 16px; margin-top: 20px">
                Thank you for choosing Canada Cargo!
              </p>
            </div>
      
            <div style="text-align: center; font-size: 14px; color: #888; padding: 10px; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
              <p style="margin: 0">
                Canada Cargo |
                <a href="www.canadacargo.net" style="color: #007bff">www.canadacargo.net</a>
              </p>
              <p style="margin: 0">© 2025 Canada Cargo. All Rights Reserved.</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "logo",
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      successes.push({
        trans_id,
        message: "Email sent successfully",
        statusSummary,
      });
    } catch (error) {
      console.error(`Error sending email for trans_id ${trans_id}:`, error);
      errors.push({ trans_id, message: error.message });
    }
  }

  res.status(200).json({
    message: "Processed notifications",
    successes,
    errors,
  });
};

const updateItemStatusToDelivered = async (req, res) => {
  const { item_trans_id, senderEmail, receiverEmail } = req.body;

  // Validate required fields
  if (!item_trans_id || item_trans_id.trim() === "") {
    return res.status(400).json({ message: "Item transaction ID is required" });
  }

  if (!senderEmail || senderEmail.trim() === "") {
    return res.status(400).json({ message: "Sender email is required" });
  }

  if (!receiverEmail || receiverEmail.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      const [itemDetails] = await sequelize.query(
        `SELECT si.trans_id, si.name, si.type, si.weight, si.tracking_number,
                si.item_trans_id, s.shipper_name, s.receiver_name
         FROM shipment_items si
         JOIN shipment_info s ON s.trans_id = si.trans_id
         WHERE si.item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      if (!itemDetails || itemDetails.length === 0) {
        return res.status(404).json({ message: "Item not found" });
      }

      const {
        trans_id,
        name,
        type,
        weight,
        tracking_number,
        shipper_name,
        receiver_name,
      } = itemDetails[0];

      // Update the status of the item in the shipment_items table to 'Delivered'
      await sequelize.query(
        `UPDATE shipment_items 
         SET status = 'Delivered' 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Delete the item from the arrivals table
      await sequelize.query(
        `DELETE FROM arrivals 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Commit transaction
      await transaction.commit();

      // Send email notifications
  

      const logoPath = path.join(__dirname, "logo.png");

      const mailOptions = {
        from: '"Canada Cargo" <info@canadacargo.net>',
        to: `${senderEmail}, ${receiverEmail}`,
        subject: `Item Status Update - Delivered`,
        html: `
          <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; background-color: #007bff1f; padding: 20px; border-radius: 8px 8px 0 0;">
              <img src="cid:logo" alt="Canada Cargo Logo" style="max-width: 180px;" />
            </div>
            <div style="padding: 20px; color: #333; line-height: 1.6;">
              <p>Dear ${shipper_name} and ${receiver_name},</p>
              <p>The status of your item has been updated to <strong>Delivered</strong>. The details are as follows:</p>
              <p><strong>Transaction ID:</strong> ${trans_id}</p>
              <p><strong>Tracking Number:</strong> ${tracking_number}</p>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Type:</strong> ${type}</p>
              <p><strong>Weight:</strong> ${weight} kg</p>
              <p>Thank you for using our services.</p>
              <p>If you have any questions, feel free to contact us.</p>
              <p>Best regards,<br/><strong>Canada Cargo</strong></p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #888; padding: 10px; background-color: #f4f4f4;">
              <p>Canada Cargo | <a href="https://canadacargo.net" style="color: #007bff">www.canadacargo.net</a></p>
              <p>© 2025 Canada Cargo. All Rights Reserved.</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "logo",
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      res.status(200).json({
        message:
          "Item status updated to 'Delivered', deleted from 'arrivals', and email sent to sender and receiver",
        trans_id,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update item status to 'Delivered' and delete from 'arrivals'",
      error: error.message,
    });
  }
};

const updateItemTrackingAndStatus = async (req, res) => {
  const { item_trans_id, tracking_number, status, senderEmail, receiverEmail } =
    req.body;

  // Validate required fields
  if (!item_trans_id || item_trans_id.trim() === "") {
    return res.status(400).json({ message: "Item transaction ID is required" });
  }
  if (!tracking_number || tracking_number.trim() === "") {
    return res.status(400).json({ message: "Tracking number is required" });
  }
  if (!status || status.trim() === "") {
    return res.status(400).json({ message: "Status is required" });
  }
  if (!senderEmail || senderEmail.trim() === "") {
    return res.status(400).json({ message: "Sender email is required" });
  }
  if (!receiverEmail || receiverEmail.trim() === "") {
    return res.status(400).json({ message: "Receiver email is required" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Fetch trans_id from shipment_items using item_trans_id
      const [itemDetails] = await sequelize.query(
        `SELECT trans_id FROM shipment_items WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      if (!itemDetails || itemDetails.length === 0) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: "Item transaction ID not found in shipment_items" });
      }

      const { trans_id } = itemDetails[0];

      // Fetch sender and receiver names from shipment_info using trans_id
      const [shipmentDetails] = await sequelize.query(
        `SELECT shipper_name, receiver_name FROM shipment_info WHERE trans_id = :trans_id`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      if (!shipmentDetails || shipmentDetails.length === 0) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: "Transaction ID not found in shipment_info" });
      }

      const { shipper_name, receiver_name } = shipmentDetails[0];

      // Update the tracking number and status of the item in the shipment_items table
      await sequelize.query(
        `UPDATE shipment_items 
         SET tracking_number = :tracking_number, status = :status 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id, tracking_number, status },
          transaction,
        }
      );

      // Delete the item from the out_of_office table
      await sequelize.query(
        `DELETE FROM out_of_office 
         WHERE item_trans_id = :item_trans_id`,
        {
          replacements: { item_trans_id },
          transaction,
        }
      );

      // Insert the item into the items_intransit table with current timestamp
      await sequelize.query(
        `INSERT INTO items_intransit (item_trans_id, created_at) 
         VALUES (:item_trans_id, :created_at)`,
        {
          replacements: {
            item_trans_id,
            created_at: new Date(), // Get current timestamp
          },
          transaction,
        }
      );

      // Check if all items for the trans_id have been updated
      const [remainingItems] = await sequelize.query(
        `SELECT COUNT(*) AS remaining_count 
         FROM shipment_items 
         WHERE trans_id = :trans_id AND status NOT IN ('Pending', 'Processed')`,
        {
          replacements: { trans_id },
          transaction,
        }
      );

      if (remainingItems[0].remaining_count === 0) {
        // Commit transaction
        await transaction.commit();

    

        const logoPath = path.join(__dirname, "logo.png");

        const mailOptions = {
          from: '"Canada Cargo" <info@canadacargo.net>',
          to: `${senderEmail}, ${receiverEmail}`,
          subject: `Item Status Update - In Transit`,
          html: `
            <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; background-color: #007bff1f; padding: 20px; border-radius: 8px 8px 0 0;">
                <img src="cid:logo" alt="Canada Cargo Logo" style="max-width: 180px;" />
              </div>
              <div style="padding: 20px; color: #333; line-height: 1.6;">
                <p>Dear ${shipper_name} and ${receiver_name},</p>
                <p>The status of all items in your shipment has been updated successfully, and they are now marked as <strong>In Transit</strong>.</p>
                <p style="font-size: 16px; margin-bottom: 20px">
                  <strong>Tracking Number:</strong>
                  <span style="font-size: 18px; font-weight: bold; color: #007bff">${trans_id}</span>
                </p>
                <p>Thank you for using our services.</p>
                <p>Best regards,<br/><strong>Canada Cargo</strong></p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "logo.png",
              path: logoPath,
              cid: "logo",
            },
          ],
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error sending email:", error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      } else {
        // Commit transaction
        await transaction.commit();
      }

      res.status(200).json({
        message:
          "Item tracking number and status updated, item removed from out_of_office, added to items_intransit.",
        item_trans_id,
        tracking_number,
        status,
        trans_id,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update item tracking number and status, remove item from out_of_office, or insert into items_intransit",
      error: error.message,
    });
  }
};

const updateMultipleItemsTrackingAndStatus = async (req, res) => {
  const { items } = req.body;

  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "A list of items is required" });
  }

  try {
    // Begin transaction
    const transaction = await sequelize.transaction();
    try {
      // Map to group items by `trans_id`
      const groupedItems = {};

      for (const item of items) {
        const {
          item_trans_id,
          tracking_number,
          status,
          senderEmail,
          receiverEmail,
        } = item;

        if (!item_trans_id || !tracking_number || !status) {
          throw new Error(
            "Each item must have item_trans_id, tracking_number, and status"
          );
        }

        // Update shipment_items table
        await sequelize.query(
          `UPDATE shipment_items 
           SET tracking_number = :tracking_number, status = :status 
           WHERE item_trans_id = :item_trans_id`,
          {
            replacements: { item_trans_id, tracking_number, status },
            transaction,
          }
        );

        // Delete item from out_of_office table
        await sequelize.query(
          `DELETE FROM out_of_office 
           WHERE item_trans_id = :item_trans_id`,
          {
            replacements: { item_trans_id },
            transaction,
          }
        );

        // Insert the item into the items_intransit table with current timestamp
        await sequelize.query(
          `INSERT INTO items_intransit (item_trans_id, created_at) 
           VALUES (:item_trans_id, :created_at)`,
          {
            replacements: {
              item_trans_id,
              created_at: new Date(),
            },
            transaction,
          }
        );

        // Fetch trans_id and tracking_number from shipment_items
        const [itemData] = await sequelize.query(
          `SELECT trans_id, tracking_number 
           FROM shipment_items 
           WHERE item_trans_id = :item_trans_id`,
          {
            replacements: { item_trans_id },
          }
        );

        const { trans_id, tracking_number: fetchedTrackingNumber } =
          itemData[0];

        // Group items by `trans_id` for sending consolidated email later
        if (!groupedItems[trans_id]) {
          groupedItems[trans_id] = {
            senderEmail,
            receiverEmail,
            trackingNumbers: [],
          };
        }

        groupedItems[trans_id].trackingNumbers.push(fetchedTrackingNumber);
      }

      // Send a consolidated email for each `trans_id`
      for (const trans_id in groupedItems) {
        const { senderEmail, receiverEmail, trackingNumbers } =
          groupedItems[trans_id];

        // Fetch shipper and receiver names from shipment_info table using trans_id
        const [shipmentData] = await sequelize.query(
          `SELECT shipper_name, receiver_name 
           FROM shipment_info 
           WHERE trans_id = :trans_id`,
          {
            replacements: { trans_id },
          }
        );

        const { shipper_name, receiver_name } = shipmentData[0];

      

        const logoPath = path.join(__dirname, "logo.png");

        const mailOptions = {
          from: '"Canada Cargo" <info@canadacargo.net>',
          to: `${senderEmail}, ${receiverEmail}`,
          subject: `Items Status Update - In Transit`,
          html: `
            <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; background-color: #007bff1f; padding: 20px; border-radius: 8px 8px 0 0;">
                <img src="cid:logo" alt="Canada Cargo Logo" style="max-width: 180px;" />
              </div>
              <div style="padding: 20px; color: #333; line-height: 1.6;">
                <p>Dear ${shipper_name} and ${receiver_name},</p>
                <p>The status of your items has been updated successfully, and they are now marked as <strong>In Transit</strong>. The details are as follows:</p>
               
                <ul>
                 <li><strong>Tracking Number:</strong> ${trans_id}</li>
                </ul>

                <p>You can track the status of your items at any time by visiting our website using the tracking number provided. Click the link below to track your shipment:</p>

                <p style="font-size: 16px; margin-bottom: 20px">
                  <a
                    href="http://localhost:5174/trackshipment/${trans_id}"
                    target="_blank"
                    style="
                      color: #007bff;
                      font-weight: bold;
                      text-decoration: none;
                      padding: 10px 15px;
                      border: 2px solid #007bff;
                      border-radius: 5px;
                      display: inline-block;
                    "
                  >Track your shipment here</a>
                </p>

                <p>Thank you for using our services.</p>
                <p>If you have any questions, feel free to contact us.</p>
                <p>Best regards,<br/><strong>Canada Cargo</strong></p>
              </div>
              <div style="text-align: center; font-size: 12px; color: #888; padding: 10px; background-color: #f4f4f4;">
                <p>Canada Cargo | <a href="https://canadacargo.net" style="color: #007bff">www.canadacargo.net</a>
</p>
                <p>© 2025 Canada Cargo. All Rights Reserved.</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "logo.png",
              path: logoPath,
              cid: "logo",
            },
          ],
        };

        await transporter.sendMail(mailOptions);
      }

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        message:
          "All items updated, removed from out_of_office, added to items_intransit, and notifications sent successfully",
        updatedItems: items,
      });
    } catch (err) {
      // Rollback transaction on error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Failed to update items, remove from out_of_office, or insert into items_intransit",
      error: error.message,
    });
  }
};

const getOutOfOffice = async (req, res) => {
  try {
    const outOfOfficeItems = await sequelize.query(
      `SELECT item_trans_id, created_at 
       FROM out_of_office`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // If no out_of_office items are found, return a 404 response
    if (outOfOfficeItems.length === 0) {
      return res.status(404).json({
        message: "No out of office items found.",
      });
    }

    // Fetch shipment_info and group items by trans_id
    const transIdMap = {};

    for (const item of outOfOfficeItems) {
      // Fetch shipment_info for the current item_trans_id
      const shipmentInfo = await sequelize.query(
        `
        SELECT 
          shipper_name, 
          shipper_phone, 
          shipper_address, 
          shipper_email, 
          receiver_name, 
          receiver_phone, 
          receiver_address, 
          receiver_email, 
          shipment_type, 
          box_number, 
          courier, 
          payment_mode, 
          origin, 
          destination, 
          pickup_date, 
          expected_date_delivery, 
          comments, 
          trans_id, 
          status, 
          created_date,
          province
        FROM shipment_info 
        WHERE 
          trans_id = (
            SELECT trans_id 
            FROM shipment_items 
            WHERE item_trans_id = :item_trans_id 
            LIMIT 1
          )
          AND location = :location
        `,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: {
            item_trans_id: item.item_trans_id,
            location: req.user.location,
          },
        }
      );
      

      if (shipmentInfo.length === 0) {
        continue; // Skip if no shipment_info is found
      }

      const transId = shipmentInfo[0].trans_id;

      // If trans_id is already processed, skip fetching items again
      if (!transIdMap[transId]) {
        // Fetch all shipment_items for the current trans_id
        const items = await sequelize.query(
          `SELECT trans_id, name, type, weight, status, item_trans_id 
           FROM shipment_items 
           WHERE trans_id = :trans_id`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: transId },
          }
        );

        // Create a new entry for this trans_id
        transIdMap[transId] = {
          trans_id: transId,
          created_at: item.created_at, // Using created_at instead of date_created
          shipment_info: shipmentInfo[0], // Assuming one shipment_info per trans_id
          items: items,
        };
      }
    }

    // Convert the map to an array
    const processedResults = Object.values(transIdMap);

    // Return the successfully processed results
    res.status(200).json({
      message: "Shipment items retrieved successfully.",
      data: processedResults,
    });
  } catch (error) {
    console.error("Error fetching shipment items:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment items.",
      error: error.message,
    });
  }
};
const getItemsInTransit = async (req, res) => {
  try {
    const rawItems = await sequelize.query(
      `SELECT item_trans_id, created_at, 
              (SELECT trans_id FROM shipment_items WHERE item_trans_id = items_intransit.item_trans_id LIMIT 1) as trans_id
       FROM items_intransit`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (rawItems.length === 0) {
      return res.status(404).json({
        message: "No items in transit found.",
      });
    }

    // Group by trans_id to avoid duplicates
    const uniqueTransIds = [
      ...new Map(rawItems.map((item) => [item.trans_id, item])).values(),
    ];

    const results = await Promise.all(
      uniqueTransIds.map(async (entry) => {
        const shipmentInfo = await sequelize.query(
          `
          SELECT 
            shipper_name, shipper_phone, shipper_address, shipper_email,
            receiver_name, receiver_phone, receiver_address, receiver_email,
            shipment_type, box_number, courier, payment_mode, origin,
            destination, pickup_date, expected_date_delivery, comments,
            trans_id, status, created_date, province
          FROM shipment_info
          WHERE trans_id = :trans_id AND location = :location
          `,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
              trans_id: entry.trans_id,
              location: req.user.location,
            },
          }
        );
    
        if (!shipmentInfo.length) {
          return null; // No matching shipment_info with location — skip this
        }
    
        const items = await sequelize.query(
          `SELECT trans_id, name, type, weight, status, item_trans_id 
           FROM shipment_items 
           WHERE trans_id = :trans_id`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { trans_id: entry.trans_id },
          }
        );
    
        return {
          trans_id: entry.trans_id,
          created_at: entry.created_at,
          shipment_info: shipmentInfo[0],
          items,
        };
      })
    );
    
    const filteredResults = results.filter((r) => r !== null);
    
    res.status(200).json({
      message: "Items in transit retrieved successfully.",
      data: filteredResults,
    });
    
  } catch (error) {
    console.error("Error fetching items in transit:", error);
    res.status(500).json({
      message: "Failed to retrieve items in transit.",
      error: error.message,
    });
  }
};

const getItemsArrived = async (req, res) => {
  try {
    // Fetch the item_trans_ids and created_at from arrivals table
    const itemsArrived = await sequelize.query(
      `SELECT item_trans_id, created_at 
       FROM arrivals`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // If no items are found in arrivals, return a 404 response
    if (itemsArrived.length === 0) {
      return res.status(404).json({
        message: "No arrived items found.",
      });
    }

    // Process each arrived item and fetch related shipment_info and shipment_items
    const processedResults = await Promise.all(
      itemsArrived.map(async (item) => {
        // Fetch shipment_info for the current item based on item_trans_id
        const shipmentInfo = await sequelize.query(
          `SELECT 
            shipper_name, 
            shipper_phone, 
            shipper_address, 
            shipper_email, 
            receiver_name, 
            receiver_phone, 
            receiver_address, 
            receiver_email, 
            shipment_type, 
            box_number, 
            courier, 
            payment_mode, 
            origin, 
            destination, 
            pickup_date, 
            expected_date_delivery, 
            comments, 
            trans_id, 
            status, 
            created_date, province, location
           FROM shipment_info 
           WHERE trans_id = (SELECT trans_id FROM shipment_items WHERE item_trans_id = :item_trans_id LIMIT 1)`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { item_trans_id: item.item_trans_id },
          }
        );

        // Check if shipmentInfo is found
        if (!shipmentInfo || shipmentInfo.length === 0) {
          console.warn(
            `No shipment info found for item_trans_id: ${item.item_trans_id}`
          );
          return null; // Skip this item if no shipment info is found
        }

        // Fetch all shipment_items for the current trans_id
        const items = await sequelize.query(
          `SELECT *
           FROM shipment_items 
           WHERE trans_id = (SELECT trans_id FROM shipment_items WHERE item_trans_id = :item_trans_id LIMIT 1)`,
          {
            type: sequelize.QueryTypes.SELECT,
            replacements: { item_trans_id: item.item_trans_id },
          }
        );

        // Attach shipment_info and items to the result object
        return {
          item_trans_id: item.item_trans_id,
          created_at: item.created_at, // Using created_at from arrivals table
          shipment_info: shipmentInfo[0], // Assuming one shipment_info per item_trans_id
          items: items,
        };
      })
    );

    // Filter out null results
    const validResults = processedResults.filter((result) => result !== null);

    // Group items by trans_id and avoid duplication
    const groupedResults = validResults.reduce((acc, item) => {
      // Check if the trans_id already exists in the accumulator
      if (!acc[item.shipment_info.trans_id]) {
        acc[item.shipment_info.trans_id] = {
          trans_id: item.shipment_info.trans_id,
          items: [],
          shipment_info: item.shipment_info,
        };
      }
      // Avoid duplicating items by checking if the item already exists in the array
      const existingItemIds = acc[item.shipment_info.trans_id].items.map(
        (existingItem) => existingItem.item_trans_id
      );
      // Only add the item if it's not already in the array
      item.items.forEach((newItem) => {
        if (!existingItemIds.includes(newItem.item_trans_id)) {
          acc[item.shipment_info.trans_id].items.push(newItem);
        }
      });

      return acc;
    }, {});
    // Convert the grouped results to an array
    const groupedArray = Object.values(groupedResults);

    // Return the successfully grouped results
    res.status(200).json({
      message: "Arrived items grouped by trans_id retrieved successfully.",
      data: groupedArray,
    });
  } catch (error) {
    console.error("Error fetching arrived items:", error);
    res.status(500).json({
      message: "Failed to retrieve arrived items.",
      error: error.message,
    });
  }
};

const getDashboardData = async (req, res) => {
  try {
    // Ensure user location exists
    const userLocation = req.user?.location;
    if (!userLocation) {
      return res.status(400).json({
        message: "User location not provided or unavailable.",
      });
    }

    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
    const currentYear = currentDate.getFullYear();

    // Get last month and year
    const lastMonthDate = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1)
    );
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastMonthYear = lastMonthDate.getFullYear();

    // Query data from the specified tables with joins and location filter
    const [
      pendingPayments,
      outOfOfficeItems,
      itemsInTransit,
      shipmentItemsArrived,
      completedPayments,
    ] = await Promise.all([
      sequelize.query(
        `SELECT pp.* 
         FROM pending_payment pp
         INNER JOIN shipment_info si ON pp.trans_id = si.trans_id
         WHERE si.location = :location`,
        {
          replacements: { location: userLocation },
          type: sequelize.QueryTypes.SELECT,
        }
      ),
      sequelize.query(
        `SELECT oo.* 
         FROM out_of_office oo
         INNER JOIN shipment_info si ON oo.trans_id = si.trans_id
         WHERE si.location = :location`,
        {
          replacements: { location: userLocation },
          type: sequelize.QueryTypes.SELECT,
        }
      ),
      sequelize.query(
        `SELECT it.* 
         FROM items_intransit it
         INNER JOIN shipment_info si ON it.trans_id = si.trans_id
         WHERE si.location = :location`,
        {
          replacements: { location: userLocation },
          type: sequelize.QueryTypes.SELECT,
        }
      ),
      sequelize.query(
        `SELECT si.trans_id, si.name, si.type, si.weight, si.status, si.item_trans_id, si.tracking_number 
         FROM shipment_items si
         INNER JOIN shipment_info sinfo ON si.trans_id = sinfo.trans_id
         WHERE si.status = 'Arrived' AND sinfo.location = :location`,
        {
          replacements: { location: userLocation },
          type: sequelize.QueryTypes.SELECT,
        }
      ),
      sequelize.query(
        `SELECT cp.trans_id, cp.date, cp.amount, cp.payment_mode, cp.invoice_no, cp.weight, 
                cp.shipping_rate, cp.carton, cp.custom_fee, cp.doorstep_fee, cp.pickup_fee 
         FROM completed_payments cp
         INNER JOIN shipment_info si ON cp.trans_id = si.trans_id
         WHERE si.location = :location`,
        {
          replacements: { location: userLocation },
          type: sequelize.QueryTypes.SELECT,
        }
      ),
    ]);

    // Calculate the total revenue for the current month and year
    const monthlyRevenue = completedPayments
      .filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate.getFullYear() === currentYear &&
          paymentDate.getMonth() + 1 === currentMonth
        );
      })
      .reduce((total, payment) => total + parseFloat(payment.amount), 0);

    const yearlyRevenue = completedPayments
      .filter((payment) => new Date(payment.date).getFullYear() === currentYear)
      .reduce((total, payment) => total + parseFloat(payment.amount), 0);

    // Calculate the total revenue for the last month
    const lastMonthRevenue = completedPayments
      .filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate.getFullYear() === lastMonthYear &&
          paymentDate.getMonth() + 1 === lastMonth
        );
      })
      .reduce((total, payment) => total + parseFloat(payment.amount), 0);

    const response = {
      pendingPaymentsCount: pendingPayments.length,
      outOfOfficeCount: outOfOfficeItems.length,
      itemsInTransitCount: itemsInTransit.length,
      arrivedItemsCount: shipmentItemsArrived.length,
      monthlyRevenue,
      yearlyRevenue,
      lastMonthRevenue,
    };

    res.status(200).json({
      message: "Dashboard data retrieved successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      message: "Failed to retrieve dashboard data.",
      error: error.message,
    });
  }
};

const getMonthlyRevenue = async (req, res) => {
  try {
    const { year } = req.body;

    // Validate the year parameter
    if (!year || isNaN(year) || year < 2000) {
      return res.status(400).json({
        message: "Invalid or missing year parameter.",
      });
    }

    // Ensure user location exists
    const userLocation = req.user?.location;
    if (!userLocation) {
      return res.status(400).json({
        message: "User location not provided or unavailable.",
      });
    }

    // Initialize an array to store monthly revenue
    const monthlyRevenue = [];

    // Loop through all months (1-12)
    for (let month = 1; month <= 12; month++) {
      // Query to calculate the revenue for the given month, year, and location
      const result = await sequelize.query(
        `SELECT 
           SUM(cp.amount) AS total_revenue 
         FROM completed_payments cp
         INNER JOIN shipment_info si ON cp.trans_id = si.trans_id
         WHERE YEAR(cp.date) = :year AND MONTH(cp.date) = :month AND si.location = :location`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { year, month, location: userLocation },
        }
      );

      // Add the result to the monthly revenue array
      monthlyRevenue.push({
        month, // Month index (1-12)
        total_revenue: result[0]?.total_revenue || 0, // Default to 0 if no revenue
      });
    }

    // Return the monthly revenue data
    res.status(200).json({
      message: "Monthly revenue retrieved successfully.",
      data: monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    res.status(500).json({
      message: "Failed to retrieve monthly revenue.",
      error: error.message,
    });
  }
};
const getShipmentTypeCounts = async (req, res) => {
  try {
    const { month, year } = req.body;

    // Validate month and year
    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({
        message:
          "Invalid month or year. Please provide a valid month (1-12) and year.",
      });
    }

    // Ensure user location exists
    const userLocation = req.user?.location;
    if (!userLocation) {
      return res.status(400).json({
        message: "User location not provided or unavailable.",
      });
    }

    // Format month to ensure two digits
    const formattedMonth = month.toString().padStart(2, "0");

    // Query to get the shipment type counts
    const query = `
      SELECT shipment_type, COUNT(*) AS count
      FROM shipment_info
      WHERE 
        YEAR(created_date) = :year 
        AND MONTH(created_date) = :month
        AND location = :location
      GROUP BY shipment_type
    `;

    // Execute the query
    const results = await sequelize.query(query, {
      replacements: { year, month, location: userLocation },
      type: sequelize.QueryTypes.SELECT,
    });

    // Format the response
    const response = results.map((row) => ({
      shipmentType: row.shipment_type,
      count: row.count,
    }));

    res.status(200).json({
      message: "Shipment type counts retrieved successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching shipment type counts:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment type counts.",
      error: error.message,
    });
  }
};

const getMonthlyShipments = async (req, res) => {
  try {
    const { year } = req.body;

    // Validate the year parameter
    if (!year || isNaN(year) || year < 2000) {
      return res.status(400).json({
        message: "Invalid or missing year parameter.",
      });
    }

    // Initialize an array to store monthly shipment counts
    const monthlyShipments = [];

    // Loop through all months (1-12)
    for (let month = 1; month <= 12; month++) {
      const result = await sequelize.query(
        `SELECT 
           COUNT(*) AS total_shipments 
         FROM shipment_info 
         WHERE YEAR(created_date) = :year AND MONTH(created_date) = :month`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { year, month },
        }
      );

      monthlyShipments.push({
        month,
        total_shipments: result[0]?.total_shipments || 0,
      });
    }
    res.status(200).json({
      message: "Monthly shipments retrieved successfully.",
      data: monthlyShipments,
    });
  } catch (error) {
    console.error("Error fetching monthly shipments:", error);
    res.status(500).json({
      message: "Failed to retrieve monthly shipments.",
      error: error.message,
    });
  }
};

const createArrivalResponse = async (req, res) => {
  const {
    trans_id,
    boxnumber,
    fullname,
    address,
    city,
    aptunit,
    province,
    phone,
  } = req.body;

  if (!trans_id || trans_id.trim() === "") {
    return res.status(400).json({ message: "Transaction ID is required" });
  }

  try {
    const [result] = await sequelize.query(
      `INSERT INTO arrival_responses 
      (trans_id, boxnumber, fullname, address, city, aptunit, province, phone, date) 
      VALUES 
      (:trans_id, :boxnumber, :fullname, :address, :city, :aptunit, :province, :phone, :date)`,
      {
        replacements: {
          trans_id,
          boxnumber,
          fullname,
          address,
          city,
          aptunit,
          province,
          phone,
          date: new Date(),
        },
      }
    );

    const emailSubject = `New Arrival response received`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Shipment Confirmation</h2>
        <p>Dear Admin,</p>
        <p>New Arrival response received. Here are the details:</p>
        <ul>
          <li><strong>Tracking Number:</strong> ${fullname}</li>
          <li><strong>Tracking Number:</strong> ${trans_id}</li>
          <li><strong>Address:</strong> ${address}</li>
          <li><strong>City:</strong> ${city}</li>
          <li><strong>Province:</strong>${province}</li>
          <li><strong>Phone:</strong> ${phone}</li>
        </ul>
        <p>You can also see the information on your dashboard.</p>
      </div>`;

    await transporter.sendMail({
      from: "info@canadacargo.net",
      // to: "info@canadacargo.net",
      to: "canadacargobackup@gmail.com",
      subject: emailSubject,
      html: emailBody,
    });

    res.status(201).json({
      message: "Arrival response created successfully and email sent",
      arrivalResponse: {
        trans_id,
        boxnumber,
        fullname,
        address,
        city,
        aptunit,
        province,
        phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create arrival response or send email",
      error: error.message,
    });
  }
};

const checkTransactionExists = async (req, res) => {
  const { trans_id } = req.body;

  try {
    if (!trans_id || trans_id.trim() === "") {
      return res.status(400).json({ exists: false });
    }
    const [result] = await sequelize.query(
      `SELECT 1 FROM arrival_responses WHERE trans_id = :trans_id LIMIT 1`,
      {
        replacements: { trans_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.json({ exists: result });
  } catch (error) {
    console.log("Database query error:", error);
  }
};

const createPaymentResponse = async (req, res) => {
  const { transId, referenceNumber, phone } = req.body;

  if (!transId || transId.trim() === "") {
    return res.status(400).json({ message: "Transaction ID is required" });
  }

  try {
    const [result] = await sequelize.query(
      `INSERT INTO payment_responses (transId, referenceNumber, phone, date) 
      VALUES (:transId, :referenceNumber, :phone, :date)`,
      {
        replacements: {
          transId,
          referenceNumber,
          phone,
          date: new Date(),
        },
      }
    );

    const emailSubject = `New Payment Response Received`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Payment Confirmation</h2>
        <p>Dear Admin,</p>
        <p>A new payment response has been recorded. Here are the details:</p>
        <ul>
          <li><strong>Transaction ID:</strong> ${transId}</li>
          <li><strong>Reference Number:</strong> ${referenceNumber}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>You can also review this information on your dashboard.</p>
      </div>`;

    await transporter.sendMail({
      from: "info@canadacargo.net",
      to: "info@canadacargo.net",
      subject: emailSubject,
      html: emailBody,
    });

    res.status(201).json({
      message: "Payment response recorded successfully and email sent",
      paymentResponse: {
        transId,
        referenceNumber,
        phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create payment response or send email",
      error: error.message,
    });
  }
};

const checkPaymentTransactionExists = async (req, res) => {
  const { trans_id } = req.body;

  try {
    if (!trans_id || trans_id.trim() === "") {
      return res.status(400).json({ exists: false });
    }
    const [result] = await sequelize.query(
      `SELECT 1 FROM payment_responses WHERE transId = :trans_id LIMIT 1`,
      {
        replacements: { trans_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log(result);

    return res.json({ exists: result });
  } catch (error) {
    console.log("Database query error:", error);
    res.status(500).json({ exists: false, error: error.message });
  }
};

const getArrivalResponsesByDate = async (req, res) => {
  const { start_date, end_date } = req.body;

  try {
    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    // Fetch all arrival_responses and shipment_info in the date range
    const responses = await sequelize.query(
      `SELECT ar.*, 
              si.shipper_name, si.shipper_phone, si.shipper_address, si.shipper_email, 
              si.receiver_name, si.receiver_phone, si.receiver_address, si.receiver_email, 
              si.shipment_type, si.box_number, si.courier, si.payment_mode, si.origin, 
              si.destination, si.pickup_date, si.expected_date_delivery, si.comments, 
              si.province, si.status, si.created_date, si.items, si.pickup_location, 
              si.pickup_price,ar.status as arrival_status
       FROM arrival_responses ar
       LEFT JOIN shipment_info si ON ar.trans_id = si.trans_id
       WHERE ar.date BETWEEN :start_date AND :end_date`,
      {
        replacements: { start_date, end_date },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (responses.length === 0) {
      return res.status(404).json({
        message: "No arrival responses found in the given date range",
      });
    }

    // For each response, fetch items separately and attach them
    const enrichedResults = await Promise.all(
      responses.map(async (res) => {
        const items = await sequelize.query(
          `SELECT name AS item_name, type AS item_type, weight, status AS item_status, 
                  item_trans_id, tracking_number
           FROM shipment_items 
           WHERE trans_id = :trans_id`,
          {
            replacements: { trans_id: res.trans_id },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        return { ...res, items };
      })
    );

    res.json({ data: enrichedResults });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({
      message: "Failed to fetch arrival responses",
      error: error.message,
    });
  }
};

const getPaymentResponsesByDate = async (req, res) => {
  const { start_date, end_date } = req.body;

  try {
    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    // Query to join payment_responses with shipment_info and shipment_items using transId
    const results = await sequelize.query(
      `SELECT pr.transId, pr.referenceNumber, pr.phone, pr.date, pr.payment_status,

              si.shipper_name, si.shipper_phone, si.shipper_address, si.shipper_email, 
              si.receiver_name, si.receiver_phone, si.receiver_address, si.receiver_email, 
              si.shipment_type, si.box_number, si.courier, si.payment_mode, si.origin, 
              si.destination, si.pickup_date, si.expected_date_delivery, si.comments, si.province,
              si.status, si.created_date, si.items, si.pickup_location, si.pickup_price, 
              si.trans_id AS shipment_trans_id, 

              si_items.name AS item_name, si_items.type AS item_type, si_items.weight, 
              si_items.status AS item_status, si_items.item_trans_id, si_items.tracking_number

       FROM payment_responses pr
       LEFT JOIN shipment_info si ON pr.transId = si.trans_id
       LEFT JOIN shipment_items si_items ON pr.transId = si_items.trans_id
       WHERE pr.date BETWEEN :start_date AND :end_date`,
      {
        replacements: { start_date, end_date },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "No payment responses found in the given date range",
      });
    }

    res.json({ data: results });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({
      message: "Failed to fetch payment responses",
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  const { transId } = req.body;

  try {
    if (!transId || transId.trim() === "") {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    // Check if the payment response exists
    const [existingPayment] = await sequelize.query(
      `SELECT transId FROM payment_responses WHERE transId = :transId LIMIT 1`,
      {
        replacements: { transId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!existingPayment) {
      return res.status(404).json({ message: "Payment response not found" });
    }

    // Update payment_status to VERIFIED
    await sequelize.query(
      `UPDATE payment_responses SET payment_status = 'VERIFIED' WHERE transId = :transId`,
      {
        replacements: { transId },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.json({ message: "Payment successfully verified", transId });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res
      .status(500)
      .json({ message: "Failed to verify payment", error: error.message });
  }
};

const sendTrackingNotification = async (req, res) => {
  const { trans_id, tracking_number_delivery, tracking_link, postagebill } =
    req.body;

  if (
    !trans_id ||
    !tracking_number_delivery ||
    !tracking_link ||
    !postagebill
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Update tracking info
    await sequelize.query(
      `UPDATE arrival_responses 
       SET tracking_number_delivery = :tracking_number_delivery, 
           tracking_link = :tracking_link, 
           postagebill = :postagebill, 
           status = 'Processed' 
       WHERE trans_id = :trans_id`,
      {
        replacements: {
          tracking_number_delivery,
          tracking_link,
          postagebill,
          trans_id,
        },
      }
    );

    // Fetch shipment info including both emails
    const [shipmentInfo] = await sequelize.query(
      `SELECT shipper_name, shipper_email, receiver_name, receiver_email, province, customs_fee 
       FROM shipment_info 
       WHERE trans_id = :trans_id`,
      {
        replacements: { trans_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!shipmentInfo) {
      return res.status(404).json({ message: "Shipment not found." });
    }

    console.log(shipmentInfo);

    const {
      receiver_name,
      receiver_email,
      shipper_name,
      shipper_email,
      province,
      customs_fee,
    } = shipmentInfo;

    const totalBill = parseFloat(postagebill) + parseFloat(customs_fee);



    const logoPath = path.join(__dirname, "logo.png");

    const mailOptions = {
      from: '"Canada Cargo" <info@canadacargo.net>',
      to: `${shipper_email}, ${receiver_email}`,
      subject: `Tracking Information - ${trans_id}`,
      html: `
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.1);padding:20px;font-family:Arial,sans-serif;">
   
          <div style="text-align: center; padding: 20px; background-color: #007bff1f; border-radius: 8px 8px 0 0;">
            <img src="cid:logo" alt="Canada Cargo Logo" style="max-width: 180px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" />
          </div>

          <p style="font-size:16px;">Hello ${receiver_name},</p>
          <p style="font-size:16px;">This is the tracking number for your package:</p>
          <h2 style="color:#007bff;margin:10px 0;">${tracking_number_delivery}</h2>
          <p><a href="${tracking_link}" target="_blank" style="color:#007bff;font-weight:bold;">${tracking_link}</a></p>
          <p style="font-size:16px;margin-top:20px;">Your postage bill is <span></strong>$${parseFloat(
            postagebill
          ).toFixed(2)}.</strong><span></p>
              <p style="font-size:16px;margin-top:20px;">Customs clearing fee is <span></strong>$${parseFloat(
                customs_fee
              ).toFixed(2)}.</strong><span></p>
 
          <p style="font-size:16px;"><strong>Total bill is $${totalBill.toFixed(
            2
          )}</strong>.</p>
          


          <p style="margin-top:15px;font-size:16px;">
            All payments to <strong>AZEEZ@CANADACARGO.NET</strong>
          </p>
            <p style="margin-top:20px;">
            <a href="http://localhost:5174/confirmpayment/${trans_id}" 
              style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">
              After payment click this link to notify us.
            </a>
          </p>

          <p style="margin-top:30px;font-size:14px;color:#888;">Thank you for choosing Canada Cargo!</p>
        <div style="text-align: center; font-size: 14px; color: #888; padding: 10px; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
            <p style="margin: 0">
              Canada Cargo |
              <a href="https://canadacargo.net" style="color: #007bff">www.canadacargo.net</a>
            </p>
            <p style="margin: 0">© 2025 Canada Cargo. All Rights Reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Tracking updated and email sent" });
  } catch (err) {
    console.error(`Error:`, err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllShipmentItems,
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
  updateItemStatusToDelivered,
  getOutOfOffice,
  updateItemTrackingAndStatus,
  updateMultipleItemsTrackingAndStatus,
  getItemsInTransit,
  updateItemStatusToArrived,
  getItemsArrived,
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
  sendTrackingNotification,
  getMostRecentCounter,
  getShipmentInfoForEdit
};
