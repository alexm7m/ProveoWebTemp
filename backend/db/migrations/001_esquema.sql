-- Esquema de las tablas migradas desde la base de datos heredada en PostgreSQL,
-- ajustado a la convencion del equipo de backend:
--   * IDs INT AUTO_INCREMENT (igual que backend/db/init.sql, que zonas usa
--     y que el id que viene en el JWT: payload.sub)
--   * collation por defecto del servidor (utf8mb4_0900_ai_ci), la misma que
--     usan los archivos del equipo, para no mezclar collations entre ramas
--   * directorio backend/db/migrations/ con numeracion (001, 002, 003...)
--
-- Conversion respecto al origen PostgreSQL (detalles en docs/esquema-base-de-datos.md):
--   * UUID                 -> INT AUTO_INCREMENT (los datos se reasignaron a 1..N)
--   * TIMESTAMP WITH TIME ZONE -> TIMESTAMP(6) en UTC (sesion '+00:00' en 002_datos.sql)
--   * tipos ENUM           -> ENUM de MySQL (mismos valores)
--   * text[] fotos_trabajo -> JSON
--   * GEOMETRY(Point,4326) -> POINT SRID 4326. PostGIS guarda x=longitud,
--                             y=latitud; MySQL guarda x=latitud, y=longitud
--                             (orden de autoridad) y usa 'axis-order=long-lat'
--                             al escribir/leer WKT. Para obtener las
--                             coordenadas usas ST_Latitude/ST_Longitude.
--   * indice GIST          -> no migrado: MySQL exige NOT NULL para indices SPATIAL
--                             y ubicacion es anulable.
--
-- Compatibilidad con las HU del equipo:
--   * resenas suma proveedor_id, autor y fecha (no quita nada) porque HU06/07
--     hace "SELECT id, autor, calificacion, comentario, fecha FROM resenas
--     WHERE proveedor_id = ?".
--   * se crea la VISTA proveedores con las columnas que pide HU06/07:
--     id, nombre, categoria, latitud, longitud, promedio_calificacion,
--     descripcion, telefono, direccion. Solo lectura.

CREATE TABLE usuarios (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'proveedor', 'administrador') NOT NULL,
    estatus VARCHAR(20) NOT NULL DEFAULT 'activo',
    creado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY usuarios_email_unique_idx (email),
    UNIQUE KEY usuarios_telefono_unique_idx (telefono)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE perfiles_proveedor (
    usuario_id INT NOT NULL PRIMARY KEY,
    nombre_negocio VARCHAR(150) NULL,
    tipo_servicio VARCHAR(150) NULL,
    formacion VARCHAR(500) NULL,
    servicio_domicilio BOOLEAN NULL,
    colonia VARCHAR(150) NULL,
    codigo_postal VARCHAR(5) NULL,
    titulo_profesional VARCHAR(150) NULL,
    descripcion TEXT NULL,
    telefono VARCHAR(20) NULL,
    foto_url VARCHAR(255) NULL,
    foto_perfil_url VARCHAR(500) NULL,
    fotos_trabajo JSON NOT NULL DEFAULT (JSON_ARRAY()),
    solo_cotizacion BOOLEAN NULL,
    costo_aproximado DECIMAL(10, 2) NULL,
    direccion_maps TEXT NULL,
    promedio_calificacion DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    total_resenas INT NOT NULL DEFAULT 0,
    ubicacion POINT SRID 4326 NULL,
    CONSTRAINT fk_perfiles_proveedor_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categorias (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE proveedor_categorias (
    proveedor_id INT NOT NULL,
    categoria_id INT NOT NULL,
    PRIMARY KEY (proveedor_id, categoria_id),
    CONSTRAINT fk_proveedor_categorias_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES perfiles_proveedor(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_proveedor_categorias_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE servicios (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    precio_referencia DECIMAL(10, 2) NULL,
    CONSTRAINT fk_servicios_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES perfiles_proveedor(usuario_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE solicitudes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    servicio_id INT NULL,
    descripcion TEXT NOT NULL,
    fecha_servicio DATE NULL,
    costo_acordado DECIMAL(10, 2) NULL,
    estado ENUM('pendiente', 'aceptada', 'rechazada', 'en_proceso', 'finalizada', 'cancelada')
        NOT NULL DEFAULT 'pendiente',
    creado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    actualizado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT chk_no_autocontratacion CHECK (cliente_id <> proveedor_id),
    CONSTRAINT fk_solicitudes_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    CONSTRAINT fk_solicitudes_proveedor FOREIGN KEY (proveedor_id) REFERENCES perfiles_proveedor(usuario_id),
    CONSTRAINT fk_solicitudes_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id),
    KEY idx_solic_participantes (cliente_id, proveedor_id, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mensajes_chat (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    emisor_id INT NOT NULL,
    contenido TEXT NOT NULL,
    creado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    leido_en TIMESTAMP(6) NULL,
    CONSTRAINT fk_mensajes_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensajes_emisor FOREIGN KEY (emisor_id) REFERENCES usuarios(id),
    KEY idx_mensajes_solic (solicitud_id, creado_en DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE resenas (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL UNIQUE,
    -- Columnas de compatibilidad con HU06/HU07 (no sustituyen a las de arriba):
    proveedor_id INT NULL,
    autor VARCHAR(150) NULL,
    fecha TIMESTAMP(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    calificacion SMALLINT NOT NULL,
    comentario TEXT NULL,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT chk_resenas_calificacion CHECK (calificacion BETWEEN 1 AND 5),
    CONSTRAINT fk_resenas_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    CONSTRAINT fk_resenas_proveedor FOREIGN KEY (proveedor_id) REFERENCES perfiles_proveedor(usuario_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vista para HU06/HU07 (SELECT * FROM proveedores WHERE id = ?):
-- nombre viene de usuarios, categoria de la relacion N:M (la primera),
-- latitud/longitud se calculan del POINT, direccion es la direccion_maps del
-- perfil y telefono usa el del perfil o el de la cuenta como respaldo.
--
-- OJO con las coordenadas: en SRID 4326 MySQL guarda x=latitud, y=longitud,
-- asi que ST_X/ST_Y devuelven (lat, lon) y no sirven para nombrarlas. Se usan
-- ST_Latitude/ST_Longitude, que devuelven el valor correcto sin importar el
-- orden en que se haya escrito el punto.
CREATE OR REPLACE VIEW proveedores AS
SELECT u.id                          AS id,
       u.nombre                      AS nombre,
       (SELECT c.nombre
          FROM proveedor_categorias pc
          JOIN categorias c ON c.id = pc.categoria_id
         WHERE pc.proveedor_id = u.id
         ORDER BY pc.categoria_id
         LIMIT 1)                    AS categoria,
       ST_Latitude(p.ubicacion)      AS latitud,
       ST_Longitude(p.ubicacion)     AS longitud,
       p.promedio_calificacion       AS promedio_calificacion,
       p.descripcion                 AS descripcion,
       COALESCE(p.telefono, u.telefono) AS telefono,
       p.direccion_maps              AS direccion
  FROM perfiles_proveedor p
  JOIN usuarios u ON u.id = p.usuario_id;
