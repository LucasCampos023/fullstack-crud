const path = require("path");

// Lê o .env da pasta do projeto, de onde quer que o comando seja rodado.
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mysql = require("mysql2/promise");

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

module.exports = connection;