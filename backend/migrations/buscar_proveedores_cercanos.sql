-- Equivalente MySQL 8 de la funcion de PostgreSQL/PostGIS
-- public.buscar_proveedores_cercanos(latitud, longitud, radio_metros, nombre_categoria).
--
-- Diferencias con el original:
--  * PostgreSQL devuelve una tabla (RETURNS TABLE); MySQL no tiene funciones
--    que devuelvan conjuntos, asi que se implementa como PROCEDURE: el
--    resultado sale como conjunto de filas en el mismo SELECT.
--  * ST_DWithin(geography, ...) -> ST_Distance_Sphere(...) <= radio
--    (la columna se guarda con 'axis-order=long-lat', igual que PostGIS
--    guarda x=longitud, y=latitud).
--  * El resultado de distancia se expresa en km, igual que el original.
--  * La comparacion de la categoria lleva COLLATE utf8mb4_unicode_ci: el
--    parametro llega con la collation de conexion utf8mb4_0900_ai_ci y MySQL
--    no permite comparar dos collations IMPLICIT distintas (ERROR 1267).
--    Las consultas normales con placeholders ? no tienen este problema.

DROP PROCEDURE IF EXISTS buscar_proveedores_cercanos;

DELIMITER $$

CREATE PROCEDURE buscar_proveedores_cercanos(
    IN p_latitud DOUBLE,
    IN p_longitud DOUBLE,
    IN p_radio_metros INT,
    IN p_nombre_categoria VARCHAR(100)
)
READS SQL DATA
BEGIN
    SELECT p.usuario_id                AS proveedor_id,
           u.nombre                    AS nombre,
           p.promedio_calificacion     AS promedio_calificacion,
           ST_Distance_Sphere(
               p.ubicacion,
               ST_GeomFromText(
                   CONCAT('POINT(', p_longitud, ' ', p_latitud, ')'),
                   4326,
                   'axis-order=long-lat'
               )
           ) / 1000                    AS distancia_km
      FROM perfiles_proveedor p
      JOIN usuarios u              ON u.id = p.usuario_id
      JOIN proveedor_categorias pc ON pc.proveedor_id = p.usuario_id
      JOIN categorias c            ON c.id = pc.categoria_id
     WHERE c.nombre = p_nombre_categoria COLLATE utf8mb4_unicode_ci
       AND p.ubicacion IS NOT NULL
    HAVING distancia_km <= p_radio_metros / 1000
     ORDER BY p.promedio_calificacion DESC, distancia_km ASC;
END$$

DELIMITER ;
