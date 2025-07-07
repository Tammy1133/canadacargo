const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../models/index");

const JWT_SECRET = process.env.JWT_KEY;

const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    // Fetch the user from the database
    const user = await sequelize.query(
      `SELECT \`email\`, \`password\`, \`firstname\`, \`lastname\`, \`modules\`, \`location\` 
       FROM \`appusers\` WHERE \`email\` = :email`,
      {
        type: QueryTypes.SELECT,
        replacements: { email },
      }
    );

    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate the password\\

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        email: user[0].email,
        firstname: user[0].firstname,
        lastname: user[0].lastname,
        location: user[0].location,
        modules: JSON.parse(user[0].modules), // Parse the stringified modules
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      userDetails: {
        email: user[0].email,
        firstname: user[0].firstname,
        lastname: user[0].lastname,
        location: user[0].location,
        modules: JSON.parse(user[0].modules), // Parse the stringified modules
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const register = async (req, res) => {
  const { email, firstname, lastname, password, modules } = req.body;

  // Validate required fields
  if (!firstname)
    return res.status(400).json({ message: "Firstname is required" });
  if (!lastname)
    return res.status(400).json({ message: "Lastname is required" });
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });
  if (!modules || !Array.isArray(modules))
    return res.status(400).json({ message: "Modules must be an array" });

  try {
    // Check if the user already exists
    const userExists = await sequelize.query(
      "SELECT * FROM `appusers` WHERE `email` = :email",
      {
        type: QueryTypes.SELECT,
        replacements: { email },
      }
    );

    if (userExists.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password.toString(), 10);

    const stringifiedModules = JSON.stringify(modules);

    console.log(req.user);

    await sequelize.query(
      `INSERT INTO \`appusers\` 
       (\`email\`, \`password\`, \`firstname\`, \`lastname\`, \`modules\`, \`location\`) 
       VALUES (:email, :password, :firstname, :lastname, :modules, :location )`,
      {
        replacements: {
          email,
          password: hashedPassword,
          firstname,
          lastname,
          modules: stringifiedModules,
          location: req.user?.location,
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { email, password, firstname, lastname, selectedModules } = req.body;

  // Debugging: Log the incoming request body
  // console.log("Request body:", req.body);

  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!firstname)
    return res.status(400).json({ message: "Firstname is required" });
  if (!lastname)
    return res.status(400).json({ message: "Lastname is required" });

  try {
    // Check if the user exists in the database
    const userExists = await sequelize.query(
      "SELECT `email`, `password` FROM `appusers` WHERE `email` = :email",
      {
        type: QueryTypes.SELECT,
        replacements: { email },
      }
    );

    // Debugging: Log the result of the userExists query
    console.log("User exists query result:", userExists);

    if (userExists.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateFields = {
      firstname,
      lastname,
      modules: selectedModules ? JSON.stringify(selectedModules) : undefined,
    };

    if (password) {
      // console.log("Password before hashing:", password); // Log the password before hashing

      // Hash the password
      const hashedPassword = await bcrypt.hash(password.toString(), 10);
      // console.log("Hashed password:", hashedPassword); // Log the hashed password

      updateFields.password = hashedPassword;
    }

    // console.log("Update fields:", updateFields); // Log the updateFields object

    // Dynamically build the update query
    const updateQuery = Object.keys(updateFields)
      .filter((key) => updateFields[key] !== undefined) // Ignore undefined fields
      .map((key) => `\`${key}\` = :${key}`)
      .join(", ");

    // console.log(
    //   `Generated UPDATE query: UPDATE \`appusers\` SET ${updateQuery} WHERE \`email\` = :email`
    // );
    // console.log("Replacements for query:", { ...updateFields, email }); // Log the replacements used in the query

    await sequelize.query(
      `UPDATE \`appusers\`
       SET ${updateQuery}
       WHERE \`email\` = :email`,
      {
        replacements: { ...updateFields, email },
        type: QueryTypes.UPDATE,
      }
    );

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

const getShipmentInfoByPhone = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const [shipment] = await sequelize.query(
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
        created_date, 
        items 
      FROM shipment_info 
      WHERE shipper_phone = :phone 
      LIMIT 1`,
      {
        replacements: { phone },
        type: QueryTypes.SELECT,
      }
    );

    if (!shipment) {
      return res.status(404).json({
        message: "No shipment information found for the given phone number",
      });
    }

    if (shipment.items) {
      try {
        shipment.items = JSON.parse(shipment.items);
      } catch (error) {
        console.error(
          "Error parsing items for shipment:",
          shipment.trans_id,
          error
        );
        shipment.items = [];
      }
    }

    res.status(200).json({ shipment });
  } catch (error) {
    console.error("Get shipment info error:", error);
    res.status(500).json({
      message: "Failed to retrieve shipment information",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await sequelize.query(
      "SELECT * FROM appusers WHERE location = :location",
      {
        replacements: { location: req.user.location },
        type: QueryTypes.SELECT,
      }
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    users.forEach((user) => {
      if (user.modules) {
        try {
          user.modules = JSON.parse(user.modules);
        } catch (error) {
          console.error("Error parsing modules for user:", user.email, error);
          user.modules = [];
        }
      }
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve users", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const userExists = await sequelize.query(
      "SELECT * FROM `appusers` WHERE `email` = :email",
      {
        type: QueryTypes.SELECT,
        replacements: { email },
      }
    );
    if (userExists.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await sequelize.query("DELETE FROM `appusers` WHERE `email` = :email", {
      type: QueryTypes.DELETE,
      replacements: { email },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

const getActiveModules = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Query to get the user and their modules
    const userModules = await sequelize.query(
      `SELECT modules FROM appusers WHERE email = :email`,
      {
        type: QueryTypes.SELECT,
        replacements: { email },
      }
    );

    if (userModules.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parse the modules field (assuming it's a JSON string or delimited format)
    const modules = userModules[0].modules;

    if (!modules) {
      return res
        .status(200)
        .json({ message: "No modules found for this user." });
    }

    res.status(200).json({
      message: `Active modules for user with email ${email}`,
      modules: userModules,
    });
  } catch (error) {
    console.error("Error fetching active modules:", error);
    res
      .status(500)
      .json({ message: "Error fetching active modules", error: error.message });
  }
};
// .
// .
const getUnreadNotifications = async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Decode the token to get the username
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const { username } = decoded;

    if (!username) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Query the user table to get the user's roles
    const user = await sequelize.query(
      `SELECT cashiermanage, specialdiscountmanage, BarManage, Kitchenmanage, Shishamanage, orderManage,  manageuserorders 
      FROM [MoodLagos].[dbo].[userCreation_table]
      WHERE username = :username`,
      {
        type: QueryTypes.SELECT,
        replacements: { username },
      }
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      cashiermanage,
      specialdiscountmanage,
      BarManage,
      Kitchenmanage,
      Shishamanage,
      orderManage,
      manageuserorders,
    } = user[0];

    let queryConditions = [];
    let replacements = { username }; // Replacements for the query

    // Build query conditions based on the user's roles
    if (cashiermanage === "1") {
      queryConditions.push("location = 'cashier' AND isread = 0");
    }
    if (specialdiscountmanage === "1") {
      queryConditions.push("location = 'specialdiscount' AND isread = 0");
    }
    if (BarManage === "1") {
      queryConditions.push("location = 'bar' AND isread = 0");
    }
    if (Kitchenmanage === "1") {
      queryConditions.push("location = 'kitchen' AND isread = 0");
    }
    if (Shishamanage === "1") {
      queryConditions.push("location = 'SHISHA' AND isread = 0");
    }
    if (manageuserorders === "1") {
      queryConditions.push("location = 'orderitemsmanage' AND isread = 0");
    }
    if (orderManage === "1") {
      queryConditions.push(
        "location = 'order' AND username = :username AND isread = 0"
      );
    }

    // If no roles matched, return an empty response
    if (queryConditions.length === 0) {
      return res.status(403).json({ message: "No management permissions" });
    }

    // Combine all query conditions with OR
    const whereClause = queryConditions.join(" OR ");

    // Fetch unread notifications based on the user's roles
    const notifications = await sequelize.query(
      `SELECT * FROM [MoodLagos].[dbo].[notifications] WHERE ${whereClause}`,
      {
        type: QueryTypes.SELECT,
        replacements,
      }
    );

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({ message: "Notification ID is required" });
  }

  try {
    const [results, metadata] = await sequelize.query(
      `UPDATE [MoodLagos].[dbo].[notifications]
      SET isread = 1
      WHERE sid = :notificationId`,
      {
        replacements: { notificationId },
      }
    );

    if (results[0] === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  const { sids } = req.body;

  // Check if sids is provided and is an array
  if (!Array.isArray(sids) || sids.length === 0) {
    return res
      .status(400)
      .json({ message: "An array of notification IDs is required" });
  }

  try {
    // Use Promise.all to execute updates in parallel
    const updatePromises = sids.map(async (sid) => {
      return await sequelize.query(
        `UPDATE [MoodLagos].[dbo].[notifications]
        SET isread = 1
        WHERE sid = :sid`,
        {
          replacements: { sid },
        }
      );
    });

    // Await all promises to complete
    const results = await Promise.all(updatePromises);

    // Count how many notifications were updated
    const updatedCount = results.length;

    return res
      .status(200)
      .json({ message: `${updatedCount} notifications marked as read` });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const authenticateUserSide = async (req, res) => {
  const { email, trans_id } = req.body;

  // Validate required fields
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!trans_id)
    return res.status(400).json({ message: "Transaction ID is required" });

  try {
    // Fetch the shipment info from the database
    const shipmentInfo = await sequelize.query(
      `SELECT * 
   FROM \`shipment_info\` 
   WHERE (\`shipper_email\` = :email OR \`receiver_email\` = :email) 
   AND \`trans_id\` = :trans_id`,
      {
        type: QueryTypes.SELECT,
        replacements: { email, trans_id },
      }
    );

    // Check if no matching record was found
    if (shipmentInfo.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid email or Tracking number" });
    }

    // Fetch all items associated with the trans_id
    const shipmentItems = await sequelize.query(
      `SELECT *
       FROM \`shipment_items\` 
       WHERE \`trans_id\` = :trans_id`,
      {
        type: QueryTypes.SELECT,
        replacements: { trans_id },
      }
    );

    const userToken = jwt.sign(
      {
        trans_id,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Authentication successful",
      shipmentInfo: shipmentInfo[0],
      shipmentItems,
      userToken,
    });
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = {
  login,
  register,
  updateUser,
  getAllUsers,
  deleteUser,
  getActiveModules,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getShipmentInfoByPhone,
  authenticateUserSide,
};
