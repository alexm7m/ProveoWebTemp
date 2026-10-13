# Guía de configuración del entorno local (Docker / Docker Compose)

## Requisitos previos
- Git
- Docker Desktop con WSL 2 (debe mostrar "Engine running")
- Windows: tener activada la función "Virtual Machine Platform"

No se necesita instalar Node.js ni MySQL en la máquina: corren dentro de contenedores.

## Puesta en marcha
1. Clonar el repositorio y cambiar a la rama de desarrollo:
   git clone https://github.com/valeriarocha-svg/ProveoWeb.git
   cd ProveoWeb
   git checkout develop
   (o la rama de la historia que se este revisando, ej. feature/hu06-listado-directorio)
2. Crear el archivo de variables de entorno a partir del ejemplo:
   copy .env.example .env
3. Levantar los servicios:
   docker compose up --build
4. Verificar en el navegador:
   - Backend: http://localhost:3000/api/health
     Respuesta esperada: {"status":"ok","db":"conectada"}
   - Frontend: http://localhost:5173

## Base de datos (primera vez)
En la primera levantada, el contenedor db aplica automaticamente:
- backend/db/init.sql -> tablas base de autenticacion (users, provider_profiles).
- backend/db/schema.sql -> esquema completo de la aplicacion (usuarios,
  perfiles_proveedor, zonas, categorias, proveedor_categorias, servicios,
  solicitudes, mensajes_chat, resenas, proveedor_zonas, vista proveedores
  y el procedimiento buscar_proveedores_cercanos).

Estos archivos solo se ejecutan cuando el volumen db_data esta vacio.
Para regenerar la BD desde cero: docker compose down -v y volver a levantar.

### Datos demo (opcional)
Seeds idempotentes (se pueden ejecutar varias veces sin duplicar nada):
   Get-Content backend/db/seed-hu05.sql -Raw | docker exec -e MYSQL_PWD=<DB_PASSWORD> proveo_db mysql -u<DB_USER> proveo
   Get-Content backend/db/seed-hu06.sql -Raw | docker exec -e MYSQL_PWD=<DB_PASSWORD> proveo_db mysql -u<DB_USER> proveo

(usar los valores de DB_USER / DB_PASSWORD del archivo .env; en la plantilla
.env.example son proveo_user / proveo_pass).

- seed-hu05.sql: zonas de Zacatecas + 3 proveedores de prueba (buscador HU05).
- seed-hu06.sql: categorias, asignaciones y calificaciones (tarjetas HU06).

## Servicios
| Servicio | Contenedor | Puerto en la PC | Descripción |
|---|---|---|---|
| db | proveo_db | 3307 | MySQL 8.0 con volumen persistente db_data |
| backend | proveo_backend | 3000 | Node 20 + Express, recarga automática (--watch) |
| frontend | proveo_frontend | 5173 | Vite + React, hot reload en el navegador |

## Variables de entorno (.env)
| Variable | Uso |
|---|---|
| DB_ROOT_PASSWORD | Contraseña root de MySQL |
| DB_NAME | Nombre de la base de datos |
| DB_USER / DB_PASSWORD | Usuario de la aplicación |
| JWT_SECRET | Clave para firmar tokens |
| PORT | Puerto del backend |

El archivo .env no se sube a Git (esta en .gitignore). El archivo backend/.env
solo hace falta si se corre node fuera de Docker; dentro de compose usan el .env
de la raiz (env_file) con las variables de red sobrescritas (DB_HOST=db).

## Endpoints principales
- GET  /api/health
- POST /api/auth/register, /api/auth/login, /api/auth/perfil (Bearer)
- GET  /api/proveedores/buscar?codigo_postal=78433  (o ?zona=Libertad)
- GET  /api/proveedores/zonas
- GET  /api/proveedores/categorias
- GET  /api/proveedores/:id

Frontend: / (pagina principal con el buscador), /login, /register,
/perfil, /proveedores/:id (perfil detallado del proveedor).

## Comandos utiles
- Detener: docker compose down
- Reiniciar la BD desde cero (borra datos): docker compose down -v
- Ver logs: docker compose logs -f backend
- Shell en MySQL: docker exec -it proveo_db mysql -uproveo_user -pproveo_pass proveo

## Problemas comunes
- "docker no se reconoce": cerrar y abrir una PowerShell nueva; verificar que Docker Desktop este abierto.
- Docker "Engine stopped" / "Virtual Machine Platform not enabled": en PowerShell como administrador ejecutar
  Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
  wsl --install --no-distribution
  wsl --update
  y reiniciar la PC.
- Puerto 3000 ocupado: cambiar "3000:3000" por "3001:3000" en docker-compose.yml.
- init.sql / schema.sql no se aplican: solo corren la primera vez; usar
  docker compose down -v y volver a levantar.
- El frontend no detecta cambios en Windows: docker compose restart frontend
  (igual que el backend si no recarga).
- Git "Author identity unknown": configurar git config --global user.name y user.email.
