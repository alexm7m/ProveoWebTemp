# Esquema de base de datos

Base de datos: proveo (MySQL 8.0). Script de creacion: backend/db/init.sql

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

## Relaciones
- Un usuario con rol proveedor tiene un perfil profesional (users 1 a 1 provider_profiles).
- Si se elimina un usuario, se elimina su perfil (ON DELETE CASCADE).

## Indices
- users.email (UNIQUE): evita correos duplicados.
- provider_profiles.codigo_postal: acelera la busqueda por zona (HU 05, sprint 4).
- provider_profiles.ubicacion (latitud, longitud): acelera busquedas por proximidad geográfica.
