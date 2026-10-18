// backend/src/repositories/profileRepository.js
const pool = require('../config/db');

async function findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM provider_profiles WHERE user_id = ?', [userId]);
    return rows[0];
}

async function createOrUpdate(userId, data) {
    const { nombre_negocio, descripcion, categoria, telefono, ubicacion, tarifa_base } = data;

    // Verificamos si ya existe el perfil
    const existing = await findByUserId(userId);

    if (existing) {
        // Si existe, lo actualizamos
        await pool.query(
            `UPDATE provider_profiles 
             SET nombre_negocio = ?, descripcion = ?, categoria = ?, telefono = ?, ubicacion = ?, tarifa_base = ? 
             WHERE user_id = ?`, [nombre_negocio, descripcion, categoria, telefono, ubicacion, tarifa_base, userId]
        );
        return await findByUserId(userId);
    } else {
        // Si no existe, lo creamos
        const [result] = await pool.query(
            `INSERT INTO provider_profiles (user_id, nombre_negocio, descripcion, categoria, telefono, ubicacion, tarifa_base) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`, [userId, nombre_negocio, descripcion, categoria, telefono, ubicacion, tarifa_base]
        );
        return await findByUserId(userId);
    }
}

module.exports = { findByUserId, createOrUpdate };