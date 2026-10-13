-- Seed HU 06: categorias, asignaciones y calificaciones de ejemplo.
-- Requiere seed-hu05.sql (crea los proveedores de prueba).
-- Idempotente: se puede ejecutar mas de una vez.

INSERT IGNORE INTO categorias (nombre) VALUES
  ('Carpinteria'),
  ('Electricidad'),
  ('Jardineria'),
  ('Limpieza'),
  ('Plomeria');

-- Asignar categoria a cada proveedor de prueba.
INSERT IGNORE INTO proveedor_categorias (proveedor_id, categoria_id)
SELECT u.id, c.id FROM usuarios u JOIN categorias c
 WHERE u.email = 'demo.zona1@proveo.test' AND c.nombre = 'Electricidad';

INSERT IGNORE INTO proveedor_categorias (proveedor_id, categoria_id)
SELECT u.id, c.id FROM usuarios u JOIN categorias c
 WHERE u.email = 'demo.zona2@proveo.test' AND c.nombre = 'Limpieza';

INSERT IGNORE INTO proveedor_categorias (proveedor_id, categoria_id)
SELECT u.id, c.id FROM usuarios u JOIN categorias c
 WHERE u.email = 'demo.zona3@proveo.test' AND c.nombre = 'Jardineria';

-- Calificaciones de ejemplo (el usuario 1 conserva 4.80/12 y el 4 queda sin resenas).
UPDATE perfiles_proveedor SET promedio_calificacion = 4.50, total_resenas = 8 WHERE usuario_id = 5;
UPDATE perfiles_proveedor SET promedio_calificacion = 3.90, total_resenas = 5 WHERE usuario_id = 6;
UPDATE perfiles_proveedor SET promedio_calificacion = 4.70, total_resenas = 3 WHERE usuario_id = 7;
