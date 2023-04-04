require('dotenv').config();
const { Pool } = require('pg');

isProduction = process.env.NODE_ENV === "production";
const conenctionString = `postgres://${process.env.PG_USER}:${process.env.PG_PASS}@${process.env.PG_ENDPOINT}/${process.env.PG_DB}`

const pool = new Pool({
    connectionString: conenctionString
});
//connectionString: isProduction ? process.env.DATABASE : conenctionString

module.exports = { pool }
