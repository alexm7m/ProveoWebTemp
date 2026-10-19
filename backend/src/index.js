//require('dotenv').config();
const path = require('path');
const dotenv = require('dotenv');

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
// 1. Importamos tus rutas de proveedores
const proveedorRoutes = require('./routes/proveedorRoutes'); // <-- Importamos las rutas de proveedor (HU 03)
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

if (!process.env.JWT_SECRET) {
    throw new Error('Configura JWT_SECRET en backend/.env.local o en las variables de entorno.');
}

const app = express();
const uploadsPath = path.resolve(__dirname, 'uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

app.get('/api/v1/ping', (req, res) => {
    res.status(200).json({ mensaje: 'Backend de Proveo conectado' });
});
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'conectada' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});
// Rutas de autenticacion (HU 01): /api/auth/register, /api/auth/login, /api/auth/perfil
app.use('/api/v1/auth', authRoutes);

// Rutas de proveedores (HU 05): /api/proveedores/buscar, /api/proveedores/zonas
app.use('/api/v1/proveedores', proveedorRoutes);
// app.use('/api/proveedores', require('./routes/proveedores.routes'));

// COMENTADO DE RUTAS DE PROVEEDOR (HU 03)
// Rutas de perfil de proveedor (HU 03)
// app.use('/api', proveedorRoutes); // Quedarán disponibles como /api/perfil
// COMENTADO DE RUTAS DE PROVEEDOR (HU 06)
// 2. Conectamos la ruta. Toda petición a /api/v1/proveedores se irá a tu archivo de rutas
//app.use('/api/v1/proveedores', proveedorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});
