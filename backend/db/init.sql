CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('cliente','proveedor','admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  -- nombre es anulable: HU01 (registro de proveedor) no lo envia y en modo
  -- estricto MySQL fallaria con "Field 'nombre' doesn't have a default value".
  nombre VARCHAR(150) NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  zona VARCHAR(100),
  -- Columnas que usa HU01 (profileRepository.js): INSERT y UPDATE con
  -- nombre_negocio, telefono, ubicacion y tarifa_base.
  nombre_negocio VARCHAR(150) NULL,
  telefono VARCHAR(20) NULL,
  ubicacion VARCHAR(255) NULL,
  tarifa_base DECIMAL(10, 2) NULL,
  codigo_postal VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_codigo_postal (codigo_postal)
);
