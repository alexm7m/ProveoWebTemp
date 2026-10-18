require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes'); // <-- Importamos las rutas de proveedor (HU 03)

const app = express();
app.use(cors());
app.use(express.json());

// Rutas de autenticacion (HU 01): /api/auth/register, /api/auth/login, /api/auth/perfil
app.use('/api/auth', authRoutes);

// Rutas de proveedores (HU 05): /api/proveedores/buscar, /api/proveedores/zonas
app.use('/api/proveedores', proveedorRoutes);

// COMENTADO DE RUTAS DE PROVEEDOR (HU 03)
// Rutas de perfil de proveedor (HU 03)
// app.use('/api', proveedorRoutes); // Quedarán disponibles como /api/perfil

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'conectada' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.use('/api/proveedores', require('./routes/proveedores.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend en puerto ${PORT}`));