require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Prueba de conexión al iniciar
pool.getConnection()
  .then(() => console.log('✅ Conexión exitosa a MySQL local'))
  .catch(err => console.error('❌ Error conectando a MySQL:', err.message));

module.exports = pool;