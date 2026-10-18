-- Esquema completo de Proveo (MySQL 8.0).
-- Se aplica automaticamente en la PRIMERA levantada del contenedor db
-- (montado en /docker-entrypoint-initdb.d/ junto a init.sql).
-- Idempotente: usa IF NOT EXISTS, se puede re-ejecutar sin borrar datos.
--
-- Orden: cada tabla aparece despues de las que referencia (FK).

-- ============================================================
-- Usuarios y perfiles de proveedor
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('cliente','proveedor','administrador') NOT NULL,
  estatus VARCHAR(20) NOT NULL DEFAULT 'activo',
  creado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY usuarios_email_unique_idx (email),
  UNIQUE KEY usuarios_telefono_unique_idx (telefono)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS perfiles_proveedor (
  usuario_id INT NOT NULL,
  nombre_negocio VARCHAR(150) DEFAULT NULL,
  tipo_servicio VARCHAR(150) DEFAULT NULL,
  formacion VARCHAR(500) DEFAULT NULL,
  servicio_domicilio TINYINT(1) DEFAULT NULL,
  colonia VARCHAR(150) DEFAULT NULL,
  codigo_postal VARCHAR(5) DEFAULT NULL,
  titulo_profesional VARCHAR(150) DEFAULT NULL,
  descripcion TEXT,
  telefono VARCHAR(20) DEFAULT NULL,
  foto_url VARCHAR(255) DEFAULT NULL,
  foto_perfil_url VARCHAR(500) DEFAULT NULL,
  fotos_trabajo JSON NOT NULL DEFAULT (JSON_ARRAY()),
  solo_cotizacion TINYINT(1) DEFAULT NULL,
  costo_aproximado DECIMAL(10,2) DEFAULT NULL,
  direccion_maps TEXT,
  promedio_calificacion DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_resenas INT NOT NULL DEFAULT 0,
  ubicacion POINT /*!80003 SRID 4326 */ DEFAULT NULL,
  PRIMARY KEY (usuario_id),
  KEY idx_perfiles_cp (codigo_postal),
  CONSTRAINT fk_perfiles_proveedor_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Zonas geograficas (HU 05) y su relacion N:M con proveedores
-- ============================================================
CREATE TABLE IF NOT EXISTS zonas (
  id INT NOT NULL AUTO_INCREMENT,
  codigo_postal VARCHAR(5) NOT NULL,
  colonia VARCHAR(150) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  estado_republica VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_zona (codigo_postal, colonia),
  KEY idx_zona_ubicacion (estado_republica, ciudad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS proveedor_zonas (
  proveedor_id INT NOT NULL,
  zona_id INT NOT NULL,
  PRIMARY KEY (proveedor_id, zona_id),
  KEY idx_zona_proveedor (zona_id, proveedor_id),
  CONSTRAINT proveedor_zonas_ibfk_1 FOREIGN KEY (proveedor_id)
    REFERENCES perfiles_proveedor (usuario_id) ON DELETE CASCADE,
  CONSTRAINT proveedor_zonas_ibfk_2 FOREIGN KEY (zona_id)
    REFERENCES zonas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Categorias de servicio (HU 06) y su relacion N:M
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS proveedor_categorias (
  proveedor_id INT NOT NULL,
  categoria_id INT NOT NULL,
  PRIMARY KEY (proveedor_id, categoria_id),
  KEY fk_proveedor_categorias_categoria (categoria_id),
  CONSTRAINT fk_proveedor_categorias_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias (id) ON DELETE CASCADE,
  CONSTRAINT fk_proveedor_categorias_proveedor FOREIGN KEY (proveedor_id)
    REFERENCES perfiles_proveedor (usuario_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Servicios, solicitudes y chat
-- ============================================================
CREATE TABLE IF NOT EXISTS servicios (
  id INT NOT NULL AUTO_INCREMENT,
  proveedor_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio_referencia DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_servicio_proveedor (proveedor_id),
  CONSTRAINT fk_servicios_proveedor FOREIGN KEY (proveedor_id)
    REFERENCES perfiles_proveedor (usuario_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS solicitudes (
  id INT NOT NULL AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  servicio_id INT DEFAULT NULL,
  descripcion TEXT NOT NULL,
  fecha_servicio DATE DEFAULT NULL,
  costo_acordado DECIMAL(10,2) DEFAULT NULL,
  estado ENUM('pendiente','aceptada','rechazada','en_proceso','finalizada','cancelada') NOT NULL DEFAULT 'pendiente',
  creado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY fk_solicitudes_proveedor (proveedor_id),
  KEY fk_solicitudes_servicio (servicio_id),
  KEY idx_solic_participantes (cliente_id, proveedor_id, estado),
  CONSTRAINT fk_solicitudes_cliente FOREIGN KEY (cliente_id)
    REFERENCES usuarios (id),
  CONSTRAINT fk_solicitudes_proveedor FOREIGN KEY (proveedor_id)
    REFERENCES perfiles_proveedor (usuario_id),
  CONSTRAINT fk_solicitudes_servicio FOREIGN KEY (servicio_id)
    REFERENCES servicios (id),
  CONSTRAINT chk_no_autocontratacion CHECK (cliente_id <> proveedor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS mensajes_chat (
  id INT NOT NULL AUTO_INCREMENT,
  solicitud_id INT NOT NULL,
  emisor_id INT NOT NULL,
  contenido TEXT NOT NULL,
  creado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  leido_en TIMESTAMP(6) NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY fk_mensajes_emisor (emisor_id),
  KEY idx_mensajes_solic (solicitud_id, creado_en DESC),
  CONSTRAINT fk_mensajes_emisor FOREIGN KEY (emisor_id)
    REFERENCES usuarios (id),
  CONSTRAINT fk_mensajes_solicitud FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Resenas
-- ============================================================
CREATE TABLE IF NOT EXISTS resenas (
  id INT NOT NULL AUTO_INCREMENT,
  solicitud_id INT NOT NULL,
  proveedor_id INT DEFAULT NULL,
  autor VARCHAR(150) DEFAULT NULL,
  fecha TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  calificacion SMALLINT NOT NULL,
  comentario TEXT,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY solicitud_id (solicitud_id),
  KEY fk_resenas_proveedor (proveedor_id),
  CONSTRAINT fk_resenas_proveedor FOREIGN KEY (proveedor_id)
    REFERENCES perfiles_proveedor (usuario_id) ON DELETE CASCADE,
  CONSTRAINT fk_resenas_solicitud FOREIGN KEY (solicitud_id)
    REFERENCES solicitudes (id) ON DELETE CASCADE,
  CONSTRAINT chk_resenas_calificacion CHECK (calificacion BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Vista publica de proveedores (la consume la busqueda geoespacial)
-- ============================================================
CREATE OR REPLACE VIEW proveedores AS
SELECT u.id AS id,
       u.nombre AS nombre,
       (SELECT c.nombre
          FROM proveedor_categorias pc
          JOIN categorias c ON c.id = pc.categoria_id
         WHERE pc.proveedor_id = u.id
         ORDER BY pc.categoria_id
         LIMIT 1) AS categoria,
       ST_Latitude(p.ubicacion) AS latitud,
       ST_Longitude(p.ubicacion) AS longitud,
       p.promedio_calificacion AS promedio_calificacion,
       p.descripcion AS descripcion,
       COALESCE(p.telefono, u.telefono) AS telefono,
       p.direccion_maps AS direccion
  FROM perfiles_proveedor p
  JOIN usuarios u ON u.id = p.usuario_id;

-- ============================================================
-- Busqueda geoespacial por radio (reservada para mapa/ubicacion)
-- ============================================================
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
