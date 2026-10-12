# Esquema de base de datos

Base de datos: `proveo` (MySQL 8.0, contenedor `proveo_db` en el puerto 3307).

Hay dos grupos de tablas en la misma base de datos:

| Grupo | Scripts | Quien la usa |
|---|---|---|
| `users`, `provider_profiles` | `backend/db/init.sql` | el backend actual (`src/repositories`, `src/controllers`) |
| Tablas migradas desde la base heredada (PostgreSQL) | `backend/migrations/*.sql` | modelos de negocio: usuarios, perfiles de proveedor, solicitudes, chat y reseñas |

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
| nombre | VARCHAR(150) | NOT NULL |
| descripcion | TEXT | |
| categoria | VARCHAR(100) | |
| zona | VARCHAR(100) | |
| codigo_postal | VARCHAR(10) | Indice idx_codigo_postal |
| latitud | DECIMAL(10, 8) | Para geolocalización |
| longitud | DECIMAL(11, 8) | Para geolocalización |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Se actualiza automaticamente |

### Relaciones y indices (grupo antiguo)
- Un usuario con rol proveedor tiene un perfil profesional (users 1 a 1 provider_profiles).
- Si se elimina un usuario, se elimina su perfil (ON DELETE CASCADE).
- `users.email` (UNIQUE): evita correos duplicados.
- `provider_profiles.codigo_postal`: acelera la busqueda por zona (HU 05, sprint 4).
- `provider_profiles` (latitud, longitud): acelera busquedas por proximidad geográfica.

---

## Tablas migradas desde la base heredada (PostgreSQL)

Origen: base de datos heredada en PostgreSQL (Supabase). **Queda fuera de
servicio**: la unica base de datos del proyecto es MySQL en Docker. La
migración fue de solo lectura (2026-10-12), no se escribio nada alli y ya no
se usa para nada.

| Tabla | Contenido | Filas migradas |
|---|---|---|
| usuarios | cuentas de cliente/proveedor/administrador | 4 |
| perfiles_proveedor | perfil profesional y ubicación en el mapa | 2 |
| categorias | categorias de servicios | 1 |
| proveedor_categorias | relacion N:M proveedor-categoria | 1 |
| servicios | servicios publicados por un proveedor | 1 |
| solicitudes | solicitudes cliente -> proveedor | 0 (vacía) |
| mensajes_chat | chat por solicitud | 0 (vacía) |
| resenas | reseñas de solicitudes finalizadas | 0 (vacía) |

Scripts (en `backend/migrations/`, se aplican en este orden):

1. `schema.sql` — crea las 8 tablas con FK, CHECK e indices.
2. `data.sql` — INSERT con los datos exportados de la base heredada.
3. `buscar_proveedores_cercanos.sql` — procedimiento equivalente a la funcion de PostGIS.

`docker-compose.yml` monta estos archivos en `/docker-entrypoint-initdb.d`, asi que
una base nueva (después de `docker compose down -v`) se crea con las dos versiones.

### Conversion respecto al esquema de origen

| PostgreSQL | MySQL | Nota |
|---|---|---|
| `UUID` | `CHAR(36)` | los UUID los genera la aplicación |
| `TIMESTAMPTZ` (microsegundos) | `TIMESTAMP(6)` en UTC | `data.sql` abre con `SET time_zone='+00:00'` |
| tipo ENUM `rol_usuario`, `estado_solicitud` | `ENUM` de MySQL | mismos valores |
| `text[] fotos_trabajo` | `JSON` | array de rutas, default `[]` |
| `GEOMETRY(Point,4326)` + indice GIST | `POINT SRID 4326` | **sin indice espacial**: MySQL exige columnas NOT NULL para indices SPATIAL y `ubicacion` es anulable |
| funcion `buscar_proveedores_cercanos` | procedimiento `buscar_proveedores_cercanos` | misma firma: (latitud, longitud, radio_metros, nombre_categoria) y devuelve `proveedor_id, nombre, promedio_calificacion, distancia_km` |

### Cuidado con el orden de ejes de `ubicacion`

PostGIS guarda x = longitud, y = latitud. En MySQL el orden por defecto del SRID 4326
es lat-long, hay que declararlo siempre:

```sql
-- escribir
ST_GeomFromText('POINT(-100.9792 22.1565)', 4326, 'axis-order=long-lat')
-- leer
ST_AsText(ubicacion, 'axis-order=long-lat')
```

### Indices de este grupo
- `usuarios.email` (UNIQUE) y `usuarios.telefono` (UNIQUE, permite NULLs).
- `categorias.nombre` (UNIQUE).
- `resenas.solicitud_id` (UNIQUE): una sola reseña por solicitud.
- `solicitudes(cliente_id, proveedor_id, estado)` — "Mis Solicitudes".
- `mensajes_chat(solicitud_id, creado_en DESC)` — historial del chat.
- Restricciones: `chk_no_autocontratacion` (cliente != proveedor) y
  `chk_resenas_calificacion` (calificacion entre 1 y 5), igual que en PostgreSQL.

### Collation
Las tablas migradas usan `utf8mb4_unicode_ci` (las antiguas usan la del servidor,
`utf8mb4_0900_ai_ci`). En consultas normales con `?` o variables esto no afecta,
pero al comparar **parametros de procedimientos** hay que poner `COLLATE utf8mb4_unicode_ci`
(explicado en `buscar_proveedores_cercanos.sql`).
