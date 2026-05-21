// src/db/index.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "project-db-campus.smhrd.com",
  port: process.env.DB_PORT || 3312,
  user: process.env.DB_USER || "cd_25K_HI5_p2_3",
  password: process.env.DB_PASSWORD || "smhrd3",
  database: process.env.DB_NAME || "cd_25K_HI5_p2_3",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;