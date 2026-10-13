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

-- Calificaciones de ejemplo; se asignan por email para que funcionen tanto en
-- una BD limpia (ids 1,2,3) como en una BD ya existente. demo.zona3 se queda
-- en 0 (sin resenas) a proposit para mostrar el caso "Sin resenas".
UPDATE perfiles_proveedor p JOIN usuarios u ON u.id = p.usuario_id
   SET p.promedio_calificacion = 4.50, p.total_resenas = 8
 WHERE u.email = 'demo.zona1@proveo.test';

UPDATE perfiles_proveedor p JOIN usuarios u ON u.id = p.usuario_id
   SET p.promedio_calificacion = 3.90, p.total_resenas = 5
 WHERE u.email = 'demo.zona2@proveo.test';
