const pool = require('../config/db');

// Tabla users (backend/db/init.sql): id, email, password_hash, role, created_at

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, email, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

const create = async ({ email, passwordHash, role }) => {
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [email, passwordHash, role]
  );
  return { id: result.insertId, email, role };
};

module.exports = { findByEmail, findById, create };
