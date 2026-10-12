# Esquema de base de datos

Base de datos: `proveo` (MySQL 8.0, contenedor `proveo_db`, puerto 3307).

Hay dos grupos de tablas en la misma base de datos:

| Grupo | Scripts | Quien la usa |
|---|---|---|
| `users`, `provider_profiles` | `backend/db/init.sql` | el backend actual y HU01 (registro/login) |
| Tablas migradas desde la base heredada (PostgreSQL) | `backend/db/migrations/*.sql` | modelos de negocio: usuarios, perfiles, solicitudes, chat y reseñas |

Las dos conviven sin tocarse: no hay claves foráneas entre grupos.

## Tabla users

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INT | PK, AUTO_INCREMENT |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL (hash con bcrypt) |
| role | ENUM('cliente','proveedor','admin') | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## Tabla provider_profiles

| Columna | Tipo | Restricciones |
|---|---|---|
| id | INT | PK, AUTO_INCREMENT |
| user_id | INT | NOT NULL, FK a users(id), ON DELETE CASCADE |
| nombre | VARCHAR(150) | anulable (HU01 no lo envia al registrar) |
| descripcion | TEXT | |
| categoria | VARCHAR(100) | |
| zona | VARCHAR(100) | |
| nombre_negocio | VARCHAR(150) | HU01 |
| telefono | VARCHAR(20) | HU01 |
| ubicacion | VARCHAR(255) | HU01 |
| tarifa_base | DECIMAL(10,2) | HU01 |
| codigo_postal | VARCHAR(10) | Indice idx_codigo_postal |
| latitud | DECIMAL(10,8) | Geolocalizacion |
| longitud | DECIMAL(11,8) | Geolocalizacion |
| created_at / updated_at | TIMESTAMP | automaticos |

### Base existente (sin recrear el volumen)

`init.sql` solo corre cuando el volumen esta vacio. En una base que ya estaba
corriendo hay que agregar las columnas de HU01 una sola vez:

```sql
ALTER TABLE provider_profiles
  ADD COLUMN nombre_negocio VARCHAR(150) NULL AFTER zona,
  ADD COLUMN telefono VARCHAR(20) NULL AFTER nombre_negocio,
  ADD COLUMN ubicacion VARCHAR(255) NULL AFTER telefono,
  ADD COLUMN tarifa_base DECIMAL(10, 2) NULL AFTER ubicacion,
  MODIFY nombre VARCHAR(150) NULL;
```

---

## Tablas migradas desde la base heredada (PostgreSQL)

Origen: base de datos heredada en PostgreSQL, ya fuera de servicio. La migración
fue de solo lectura (2026-10-12), no se escribio nada alli y ya no se usa para nada.

**Convencion actual: IDs `INT AUTO_INCREMENT` y collation por defecto del servidor
(`utf8mb4_0900_ai_ci`)**, igual que `init.sql`, que `zonas` y el id del JWT
(`payload.sub`), para que todo el equipo trabaje igual.

| Tabla | Contenido | Filas migradas |
|---|---|---|
| usuarios | cuentas de cliente/proveedor/administrador | 4 |
| perfiles_proveedor | perfil profesional y ubicacion en el mapa | 2 |
| categorias | categorias de servicios | 1 |
| proveedor_categorias | relacion N:M proveedor-categoria | 1 |
| servicios | servicios publicados por un proveedor | 1 |
| solicitudes | solicitudes cliente -> proveedor | 0 (vacia) |
| mensajes_chat | chat por solicitud | 0 (vacia) |
| resenas | reseñas de solicitudes finalizadas | 0 (vacia) |
| zonas, proveedor_zonas | HU05/HU08 (archivo del equipo) | 0 |

### Archivos y orden de ejecucion

`docker-compose.yml` monta los scripts en `/docker-entrypoint-initdb.d`, que los
ejecuta en orden alfabetico cuando el volumen esta vacio:

| Orden | Archivo | Que hace |
|---|---|---|
| 000 | `backend/db/init.sql` | `users` y `provider_profiles` |
| 001 | `backend/db/migrations/001_esquema.sql` | las 8 tablas migradas + vista `proveedores` |
| 001 | `backend/db/migrations/001_zonas_servicios.sql` | `zonas`, `proveedor_zonas` e indices (HU05/HU08, archivo del equipo) |
| 002 | `backend/db/migrations/002_datos.sql` | los INSERT con los datos migrados |
| 003 | `backend/db/migrations/003_procedimiento.sql` | `buscar_proveedores_cercanos` |

(`001_esquema.sql` va antes que `001_zonas_servicios.sql` por orden alfabetico.)

### Conversion respecto al esquema de origen

| PostgreSQL | MySQL | Nota |
|---|---|---|
| `UUID` | `INT AUTO_INCREMENT` | los IDs se reasignaron a 1..N conservando relaciones (mapping en `002_datos.sql`) |
| `TIMESTAMPTZ` (microsegundos) | `TIMESTAMP(6)` en UTC | `002_datos.sql` abre con `SET time_zone='+00:00'` |
| tipo ENUM `rol_usuario`, `estado_solicitud` | `ENUM` de MySQL | mismos valores |
| `text[] fotos_trabajo` | `JSON` | array de rutas, default `[]` |
| `GEOMETRY(Point,4326)` + indice GIST | `POINT SRID 4326` | **sin indice espacial**: MySQL exige NOT NULL para indices SPATIAL y `ubicacion` es anulable |
| funcion `buscar_proveedores_cercanos` | procedimiento (en `003_procedimiento.sql`) | misma firma: (latitud, longitud, radio_metros, nombre_categoria) |

### Coordenadas: cuidado con el orden de ejes

PostGIS guarda x = longitud, y = latitud. MySQL guarda x = **latitud**,
y = **longitud** para el SRID 4326. Por eso:

```sql
-- escribir o leer el WKT con el orden largo-latitud
ST_GeomFromText('POINT(-100.9792 22.1565)', 4326, 'axis-order=long-lat')
ST_AsText(ubicacion, 'axis-order=long-lat')
-- para obtener los numeros usar SIEMPRE estas dos (no ST_X/ST_Y, salen cruzadas)
ST_Latitude(ubicacion)   -- 22.1565
ST_Longitude(ubicacion)  -- -100.9792
```

### Compatibilidad con las HU del equipo

| HU | Que pide | Como se resuelve |
|---|---|---|
| HU06/HU07 | `SELECT id, nombre, categoria, latitud, longitud, promedio_calificacion, descripcion, telefono, direccion FROM proveedores WHERE id = ?` | **vista** `proveedores` sobre `usuarios` + `perfiles_proveedor` (solo lectura) |
| HU06/HU07 | `SELECT id, autor, calificacion, comentario, fecha FROM resenas WHERE proveedor_id = ?` | `resenas` suma las columnas `proveedor_id`, `autor` y `fecha` sin quitar `solicitud_id` ni `creado_en` |
| HU05/HU08 | `proveedor_zonas.proveedor_id` tipo `INT` | todos los IDs son `INT`, el FK encaja |
| HU01 | `provider_profiles` con `nombre_negocio`, `telefono`, `ubicacion`, `tarifa_base` | agregadas en `init.sql` (y el ALTER de arriba para bases existentes) |

Si el equipo decide que `proveedores` sea tabla y no vista:
`DROP VIEW proveedores;` antes de crearla.

### Indices y restricciones

- `usuarios.email` (UNIQUE) y `usuarios.telefono` (UNIQUE, permite NULLs).
- `categorias.nombre` (UNIQUE).
- `resenas.solicitud_id` (UNIQUE): una sola reseña por solicitud.
- `solicitudes(cliente_id, proveedor_id, estado)` — "Mis Solicitudes".
- `mensajes_chat(solicitud_id, creado_en DESC)` — historial del chat.
- `chk_no_autocontratacion` (cliente != proveedor) y `chk_resenas_calificacion`
  (entre 1 y 5), igual que en el origen.
- `zonas(codigo_postal, colonia)` UNIQUE y `proveedor_zonas(zona_id, proveedor_id)`
  del archivo del equipo.
