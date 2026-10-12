-- datos exportados desde la base heredada (PostgreSQL) - sesion UTC
SET NAMES utf8mb4;
SET time_zone = '+00:00';
-- usuarios
INSERT INTO usuarios (id, nombre, email, password_hash, rol, estatus, creado_en, telefono) VALUES ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Juan Pérez', 'juan.plomero@example.com', '$2a$10$dummyhashstringparaefectosdeprueba123', 'proveedor', 'activo', '2026-10-04 17:36:24.186577', NULL);
INSERT INTO usuarios (id, nombre, email, password_hash, rol, estatus, creado_en, telefono) VALUES ('ccf1b7c4-d63d-42cc-8bd0-22d6981fd47c', 'Valeria Esparza Rocha', 'valeesrocha24@gmail.com', '$2a$12$Xz8a8MBcCRMlbwTbioBvxeybD2z.TFpJcciPquuPqrA/gcP6yeMi2', 'cliente', 'activo', '2026-10-09 19:06:28.376188', '+52 4443939181');
INSERT INTO usuarios (id, nombre, email, password_hash, rol, estatus, creado_en, telefono) VALUES ('cfb0b22d-b3eb-458b-8045-bd390fc4ec61', 'Password Policy Test', 'password-test-1791573892898-5d393o3s63g@example.test', '$2a$12$nlM7EnsQLihcpqkv0k36VOtTlIFmhqsl2edUVL0tjQv7CVEqGRE4u', 'cliente', 'activo', '2026-10-09 19:24:54.687457', '+525512345678');
INSERT INTO usuarios (id, nombre, email, password_hash, rol, estatus, creado_en, telefono) VALUES ('cddea7d0-76bd-4f8b-bd7b-096ce4cabf40', 'Pavel Naret', 'valeesrocha@gmail.com', '$2a$12$oSQgGBi6yH9Eyh5kxTI3ruh6l7uLb/hZExuk1CFwmVdMGPF1HiRWe', 'proveedor', 'activo', '2026-10-09 19:54:13.041818', '+524443939181');
-- categorias
INSERT INTO categorias (id, nombre) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Plomería');
-- perfiles_proveedor
INSERT INTO perfiles_proveedor (usuario_id, titulo_profesional, descripcion, telefono, foto_url, promedio_calificacion, total_resenas, ubicacion, nombre_negocio, tipo_servicio, formacion, servicio_domicilio, colonia, codigo_postal, foto_perfil_url, fotos_trabajo, solo_cotizacion, costo_aproximado, direccion_maps) VALUES ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Plomero Especialista 24/7', 'Reparación de fugas, instalaciones de hidroneumáticos y mantenimiento general en la zona.', '4441234567', NULL, '4.80', '12', ST_GeomFromText('POINT(-100.9792 22.1565)', 4326, 'axis-order=long-lat'), NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL, NULL, NULL);
INSERT INTO perfiles_proveedor (usuario_id, titulo_profesional, descripcion, telefono, foto_url, promedio_calificacion, total_resenas, ubicacion, nombre_negocio, tipo_servicio, formacion, servicio_domicilio, colonia, codigo_postal, foto_perfil_url, fotos_trabajo, solo_cotizacion, costo_aproximado, direccion_maps) VALUES ('cddea7d0-76bd-4f8b-bd7b-096ce4cabf40', NULL, 'Ayuda', '+524443939181', NULL, '0.00', '0', NULL, 'Peinados cute', 'Peinado', NULL, 1, 'UT', '78433', '/uploads/79d30e6a-d436-4e77-bbf2-7022137e6164.jpg', '["/uploads/86daf7cb-b7dc-44e7-980d-29731df4604a.jpg"]', 1, NULL, 'https://maps.app.goo.gl/BxKuq6WYPktQLHix5');
-- proveedor_categorias
INSERT INTO proveedor_categorias (proveedor_id, categoria_id) VALUES ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22');
-- servicios
INSERT INTO servicios (id, proveedor_id, titulo, descripcion, precio_referencia) VALUES ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Reparación de Fuga de Agua y Drenajes', 'Detección electrónica de fugas y arreglo inmediato.', '350.00');
-- solicitudes
-- mensajes_chat
-- resenas
-- fin de migracion de datos
