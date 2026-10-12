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
2. Crear el archivo de variables de entorno a partir del ejemplo:
   copy .env.example .env
3. Levantar los servicios:
   docker compose up --build
4. Verificar en el navegador: http://localhost:3000/api/health
   Respuesta esperada: {"status":"ok","db":"conectada"}

## Servicios
| Servicio | Contenedor | Puerto en la PC | Descripción |
|---|---|---|---|
| db | proveo_db | 3307 | MySQL 8.0 con volumen persistente db_data |
| backend | proveo_backend | 3000 | Node 20 + Express, recarga automática (--watch) |

## Variables de entorno (.env)
| Variable | Uso |
|---|---|
| DB_ROOT_PASSWORD | Contraseña root de MySQL |
| DB_NAME | Nombre de la base de datos |
| DB_USER / DB_PASSWORD | Usuario de la aplicación |
| JWT_SECRET | Clave para firmar tokens |
| PORT | Puerto del backend |

El archivo .env no se sube a Git (esta en .gitignore).

## Comandos utiles
- Detener: docker compose down
- Reiniciar la BD desde cero (borra datos): docker compose down -v
- Ver logs: docker compose logs -f backend

## Problemas comunes
- "docker no se reconoce": cerrar y abrir una PowerShell nueva; verificar que Docker Desktop este abierto.
- Docker "Engine stopped" / "Virtual Machine Platform not enabled": en PowerShell como administrador ejecutar
  Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
  wsl --install --no-distribution
  wsl --update
  y reiniciar la PC.
- Puerto 3000 ocupado: cambiar "3000:3000" por "3001:3000" en docker-compose.yml.
- init.sql o las migraciones (backend/db/migrations/*.sql) no se aplican: solo corren la primera vez;
  usar docker compose down -v y volver a levantar. En bases que ya existian ver
  docs/esquema-base-de-datos.md (ALTER unico para provider_profiles).
- Git "Author identity unknown": configurar git config --global user.name y user.email.
