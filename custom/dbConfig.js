require('dotenv').config();
const { Pool } = require('pg');

isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING
});
//connectionString: isProduction ? process.env.DATABASE : conenctionString

module.exports = { pool }
