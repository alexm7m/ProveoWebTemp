services:
  db:
    image: mysql:8.0
    container_name: proveo_db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3307:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./backend/db/init.sql:/docker-entrypoint-initdb.d/000_init.sql
      - ./backend/db/migrations/001_esquema.sql:/docker-entrypoint-initdb.d/001_esquema.sql
      - ./backend/db/migrations/001_zonas_servicios.sql:/docker-entrypoint-initdb.d/001_zonas_servicios.sql
      - ./backend/db/migrations/002_datos.sql:/docker-entrypoint-initdb.d/002_datos.sql
      - ./backend/db/migrations/003_procedimiento.sql:/docker-entrypoint-initdb.d/003_procedimiento.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p${DB_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 20

  backend:
    build: ./backend
    container_name: proveo_backend
    restart: unless-stopped
    env_file: .env
    environment:
      DB_HOST: db
      DB_PORT: 3306
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    container_name: proveo_frontend
    restart: unless-stopped
    environment:
      VITE_API_TARGET: http://backend:3000
    ports:
      - "5173:5173"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  db_data:
  
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
