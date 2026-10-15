-- Datos migrados desde la base de datos heredada (PostgreSQL) - sesion UTC.
-- Los IDs UUID originales se reasignaron a 1..N conservando las relaciones:
--   usuarios:            1 Juan Perez | 2 Valeria Esparza Rocha
--                        3 Password Policy Test | 4 Pavel Naret
--   categorias:          1 Plomeria
--   perfiles_proveedor:  1 -> usuario 1 | 2 -> usuario 4
--   servicios:           1 -> proveedor 1
--   solicitudes, mensajes_chat y resenas estaban vacias en el origen.
--
-- SET NAMES evita que un cliente que no conecta en utf8mb4 doble codifique los
-- acentos; SET time_zone conserva el instante UTC de origen en TIMESTAMP(6).
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- usuarios (4)
INSERT INTO usuarios (id, nombre, email, password_hash, rol, estatus, creado_en, telefono) VALUES
  (1, 'Juan Pérez', 'juan.plomero@example.com', '$2a$10$dummyhashstringparaefectosdeprueba123', 'proveedor', 'activo', '2026-10-04 17:36:24.186577', NULL),
  (2, 'Valeria Esparza Rocha', 'valeesrocha24@gmail.com', '$2a$12$Xz8a8MBcCRMlbwTbioBvxeybD2z.TFpJcciPquuPqrA/gcP6yeMi2', 'cliente', 'activo', '2026-10-09 19:06:28.376188', '+52 4443939181'),
  (3, 'Password Policy Test', 'password-test-1791573892898-5d393o3s63g@example.test', '$2a$12$nlM7EnsQLihcpqkv0k36VOtTlIFmhqsl2edUVL0tjQv7CVEqGRE4u', 'cliente', 'activo', '2026-10-09 19:24:54.687457', '+525512345678'),
  (4, 'Pavel Naret', 'valeesrocha@gmail.com', '$2a$12$oSQgGBi6yH9Eyh5kxTI3ruh6l7uLb/hZExuk1CFwmVdMGPF1HiRWe', 'proveedor', 'activo', '2026-10-09 19:54:13.041818', '+524443939181');

-- categorias (1)
INSERT INTO categorias (id, nombre) VALUES
  (1, 'Plomería');

-- perfiles_proveedor (2)
INSERT INTO perfiles_proveedor
  (usuario_id, titulo_profesional, descripcion, telefono, foto_url, promedio_calificacion, total_resenas,
   ubicacion, nombre_negocio, tipo_servicio, formacion, servicio_domicilio, colonia, codigo_postal,
   foto_perfil_url, fotos_trabajo, solo_cotizacion, costo_aproximado, direccion_maps)
VALUES
  (1, 'Plomero Especialista 24/7', 'Reparación de fugas, instalaciones de hidroneumáticos y mantenimiento general en la zona.',
   '4441234567', NULL, 4.80, 12,
   ST_GeomFromText('POINT(-100.9792 22.1565)', 4326, 'axis-order=long-lat'),
   NULL, NULL, NULL, NULL, NULL, NULL,
   NULL, '[]', NULL, NULL, NULL),
  (4, NULL, 'Ayuda', '+524443939181', NULL, 0.00, 0,
   NULL, 'Peinados cute', 'Peinado', NULL, 1, 'UT', '78433',
   '/uploads/79d30e6a-d436-4e77-bbf2-7022137e6164.jpg', '["/uploads/86daf7cb-b7dc-44e7-980d-29731df4604a.jpg"]', 1, NULL,
   'https://maps.app.goo.gl/BxKuq6WYPktQLHix5');

-- proveedor_categorias (1)
INSERT INTO proveedor_categorias (proveedor_id, categoria_id) VALUES
  (1, 1);

-- servicios (1)
INSERT INTO servicios (id, proveedor_id, titulo, descripcion, precio_referencia) VALUES
  (1, 1, 'Reparación de Fuga de Agua y Drenajes', 'Detección electrónica de fugas y arreglo inmediato.', 350.00);

-- solicitudes, mensajes_chat y resenas: sin filas en el origen.
