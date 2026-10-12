require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

// 1. Importamos tus rutas de proveedores
const proveedorRoutes = require('./routes/proveedorRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// 2. Conectamos la ruta. Toda petición a /api/v1/proveedores se irá a tu archivo de rutas
app.use('/api/v1/proveedores', proveedorRoutes);

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