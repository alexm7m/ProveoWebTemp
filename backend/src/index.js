require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas de autenticacion (HU 01): /api/auth/register, /api/auth/login, /api/auth/perfil
app.use('/api/auth', authRoutes);

// Rutas de proveedores (HU 05): /api/proveedores/buscar, /api/proveedores/zonas
app.use('/api/proveedores', proveedorRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'conectada' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend en puerto ${PORT}`));
