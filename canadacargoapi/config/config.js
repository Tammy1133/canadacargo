require("dotenv").config(); // Load environment variables from the .env file

module.exports = {
  development: {
    username: "root",
    password: "",
    database: "canadacargo",
    host: "127.0.0.1",
    dialect: "mysql",
    port: "3306",
  },

  //   development: {
  //   username: process.env.MYSQL_ADDON_USER,
  //   password: process.env.MYSQL_ADDON_PASSWORD,
  //   database: process.env.MYSQL_ADDON_DB,
  //   host: process.env.MYSQL_ADDON_HOST,
  //   port: process.env.MYSQL_ADDON_PORT,
  //   dialect: "mysql",
  // },
  production: {
    username: "acehwyxb_canadacargo",
    password: "Adegboyega1",
    database: "tammy_mynewdatabase",
    host: "127.0.0.1",
    dialect: "mysql",
    port: "3306",
  },
};

// require("dotenv").config(); // Load environment variables from the .env file

// module.exports = {
//   development: {
//     username: "root",
//     password: "",
//     database: "canadacargo",
//     dialect: "mysql",
//     dialectOptions: {
//       options: {
//         requestTimeout: 30000,
//         trustServerCertificate: true,
//       },
//     },
//     port: 3306,
//   },

//   // development: {
//   //   username: process.env.MYSQL_ADDON_USER,
//   //   password: process.env.MYSQL_ADDON_PASSWORD,
//   //   database: process.env.MYSQL_ADDON_DB,
//   //   host: process.env.MYSQL_ADDON_HOST,
//   //   port: process.env.MYSQL_ADDON_PORT,
//   //   dialect: "mysql",
//   // },

//   production: {
//     username: process.env.MYSQL_ADDON_USER,
//     password: process.env.MYSQL_ADDON_PASSWORD,
//     database: process.env.MYSQL_ADDON_DB,
//     host: process.env.MYSQL_ADDON_HOST,
//     port: process.env.MYSQL_ADDON_PORT,
//     dialect: "mysql",
//   },
// };
