const jwt = require("jsonwebtoken");
const { sequelize } = require("../models");

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  

  if (!token) {
    const err = new Error("No token provided");
    err.status = 401;
    return next(err);
  }

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      const error = new Error("Invalid token");
      error.status = 407;
      return next(error);
    }

    req.user = decoded;

    console.log(decoded);
    

    sequelize.query(`SET @current_user_email = '${req.user.email}'`);
    next();
  });
};

const isAdmin = (req, res, next) => {
  console.log(req.user);

  if (
    (req.user && req.user.userrole?.toUpperCase() === "ADMIN") ||
    req.user.userrole?.toUpperCase() === "SUPERADMIN"
  ) {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};

module.exports = { authenticateUser, isAdmin };
