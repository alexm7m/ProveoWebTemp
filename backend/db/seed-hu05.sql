-- Seed HU 05: zonas y proveedores de ejemplo para el buscador por zona.
-- Idempotente: se puede ejecutar mas de una vez.

INSERT IGNORE INTO zonas (codigo_postal, colonia, ciudad, estado_republica) VALUES
  ('78433', 'Centro', 'Zacatecas', 'Zacatecas'),
  ('78433', 'Libertad', 'Zacatecas', 'Zacatecas'),
  ('78433', 'Guadalupe', 'Zacatecas', 'Zacatecas'),
  ('78460', 'La Bufa', 'Zacatecas', 'Zacatecas');

-- El proveedor de Plomeria (usuario 1) ya existia sin zona asignada.
UPDATE perfiles_proveedor
   SET colonia = 'Centro', codigo_postal = '78433'
 WHERE usuario_id = 1 AND (colonia IS NULL OR codigo_postal IS NULL);

-- Proveedores de prueba (solo para el entorno de desarrollo).
INSERT IGNORE INTO usuarios (nombre, email, telefono, password_hash, rol, estatus) VALUES
  ('Maria Lopez', 'demo.zona1@proveo.test', '4920000001', 'seed-hash', 'proveedor', 'activo'),
  ('Juan Perez', 'demo.zona2@proveo.test', '4920000002', 'seed-hash', 'proveedor', 'activo'),
  ('Ana Garcia', 'demo.zona3@proveo.test', '4920000003', 'seed-hash', 'proveedor', 'activo');

INSERT INTO perfiles_proveedor (usuario_id, nombre_negocio, colonia, codigo_postal, descripcion, telefono)
SELECT u.id, 'Electricidad Lopez', 'Libertad', '78433', 'Instalaciones electricas domiciliarias.', '4920000001'
  FROM usuarios u WHERE u.email = 'demo.zona1@proveo.test'
ON DUPLICATE KEY UPDATE
  nombre_negocio = VALUES(nombre_negocio), colonia = VALUES(colonia), codigo_postal = VALUES(codigo_postal);

INSERT INTO perfiles_proveedor (usuario_id, nombre_negocio, colonia, codigo_postal, descripcion, telefono)
SELECT u.id, 'Limpieza Integral JP', 'Guadalupe', '78433', 'Limpieza de hogares y oficinas.', '4920000002'
  FROM usuarios u WHERE u.email = 'demo.zona2@proveo.test'
ON DUPLICATE KEY UPDATE
  nombre_negocio = VALUES(nombre_negocio), colonia = VALUES(colonia), codigo_postal = VALUES(codigo_postal);

INSERT INTO perfiles_proveedor (usuario_id, nombre_negocio, colonia, codigo_postal, descripcion, telefono)
SELECT u.id, 'Jardines La Bufa', 'La Bufa', '78460', 'Diseno y mantenimiento de jardines.', '4920000003'
  FROM usuarios u WHERE u.email = 'demo.zona3@proveo.test'
ON DUPLICATE KEY UPDATE
  nombre_negocio = VALUES(nombre_negocio), colonia = VALUES(colonia), codigo_postal = VALUES(codigo_postal);
