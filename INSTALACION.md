# Guía de Instalación - Description Evaluator

## Requisitos del Sistema

### Desarrollo Local
- **Node.js** 20+ (para frontend)
- **Python** 3.10+ (para backend)
- **Docker** y **Docker Compose**
- **Git**
- **Redis** (opcional, se puede usar Docker)
- **PostgreSQL** (opcional, se puede usar Supabase)

### Producción
- **Azure CLI**
- **Docker**
- Cuenta de **Azure** con permisos de Container Registry y Container Instances
- Cuenta de **Supabase** (base de datos)

## Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Andre-Leandro/Description-Evaluator.git
cd Description-Evaluator
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus configuraciones
nano .env
```

**Contenido del .env:**
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/dbname
user=tu_usuario_db
password=tu_password_db
host=db.xyz.supabase.co
port=5432
dbname=postgres

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=tu_redis_password

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API URL (para frontend)
NEXT_PUBLIC_API_URL=http://localhost:10000
```

### 3. Opción A: Docker Compose (Recomendado)

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

**Acceder a:**
- Frontend: http://localhost:3000
- Backend: http://localhost:10000
- Redis: localhost:6379

### 4. Opción B: Instalación Manual

#### Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar aplicación
python main.py
```

#### Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# O build para producción
npm run build
npm start
```

#### Redis (Local)
```bash
# Ubuntu/Debian
sudo apt install redis-server
redis-server

# MacOS
brew install redis
redis-server

# Windows (WSL recomendado)
sudo apt install redis-server
```

## Instalación en Producción (Azure)

### 1. Preparar Azure

```bash
# Instalar Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Configurar subscription
az account set --subscription "tu-subscription-id"

# Crear Resource Group
az group create --name tp-devops --location eastus
```

### 2. Crear Container Registry

```bash
# Crear ACR
az acr create \
  --resource-group tp-devops \
  --name devopsregistrytp \
  --sku Basic

# Obtener credenciales
az acr credential show --name devopsregistrytp
```

### 3. Configurar GitHub Secrets

En tu repositorio de GitHub, ve a **Settings → Secrets and variables → Actions** y agrega:

```yaml
# Database
DB_USER: tu_usuario_db
DB_PASSWORD: tu_password_db
DB_HOST: db.xyz.supabase.co
DB_PORT: 5432
DB_NAME: postgres

# Azure Service Principal (crear con az ad sp create-for-rbac)
AZURE_CREDENTIALS: |
  {
    "clientId": "xxx",
    "clientSecret": "xxx", 
    "subscriptionId": "xxx",
    "tenantId": "xxx"
  }

# Container Registry
ACR_LOGIN_SERVER: devopsregistrytp.azurecr.io
ACR_USERNAME: devopsregistrytp
ACR_PASSWORD: tu_acr_password
```

### 4. Despliegue Automático

```bash
# Push al branch docker para triggear deploy
git checkout -b docker
git push origin docker
```

El workflow de GitHub Actions automáticamente:
1. Construye las imágenes Docker
2. Las sube al Azure Container Registry
3. Despliega los contenedores en Azure Container Instances

## Configuración de Base de Datos

### Supabase (Recomendado)

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Obtener URL y API Key del proyecto
4. Ejecutar migraciones SQL:

```sql
-- Crear tablas
CREATE TABLE model (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE condition (
    id BIGSERIAL PRIMARY KEY,
    description TEXT,
    temperature BIGINT
);

CREATE TABLE product (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    og_description TEXT
);

CREATE TABLE description (
    id BIGSERIAL PRIMARY KEY,
    generated_description TEXT NOT NULL,
    product BIGINT REFERENCES product(id),
    model BIGINT REFERENCES model(id),
    condition BIGINT REFERENCES condition(id)
);

CREATE TABLE evaluation (
    id BIGSERIAL PRIMARY KEY,
    evaluated BOOLEAN NOT NULL DEFAULT FALSE,
    vote BIGINT REFERENCES model(id),
    product BIGINT REFERENCES product(id),
    condition BIGINT REFERENCES condition(id)
);
```

### PostgreSQL Local

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres createdb description_evaluator

# Crear usuario
sudo -u postgres createuser --interactive --pwprompt tu_usuario
```

## Configuración de Redis

### Redis Cloud (Recomendado para producción)

1. Crear cuenta en [redislabs.com](https://redislabs.com)
2. Crear base de datos Redis
3. Obtener connection string
4. Actualizar variables de entorno

### Redis Local

```bash
# Configurar Redis con password
echo "requirepass tu_password" >> /etc/redis/redis.conf
sudo systemctl restart redis-server
```

## Verificación de Instalación

### Health Checks

```bash
# Backend
curl http://localhost:10000/
# Respuesta: "La API está corriendo correctamente."

# Frontend  
curl http://localhost:3000/
# Respuesta: HTML de la página principal

# Redis
redis-cli ping
# Respuesta: PONG
```

### Tests

```bash
# Backend tests
cd backend
pytest test_api.py -v

# Frontend tests (si existen)
cd frontend
npm test
```

## Troubleshooting

### Problemas Comunes

**Error: supabaseUrl is required**
```bash
# Verificar variables de entorno del frontend
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

**Error de conexión a Redis**
```bash
# Verificar que Redis esté corriendo
redis-cli ping

# Verificar configuración
echo $REDIS_HOST $REDIS_PORT
```

**Error de conexión a Base de Datos**
```bash
# Test de conexión
python -c "import psycopg2; conn = psycopg2.connect('postgresql://user:pass@host:port/db')"
```

### Logs y Debugging

```bash
# Docker Compose logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs redis

# Logs de Azure Container Instances
az container logs --resource-group tp-devops --name backend
az container logs --resource-group tp-devops --name frontend
```

## Monitoreo Post-Instalación

### Métricas a Supervisar

- **Tiempo de respuesta** de APIs < 2 segundos
- **Cache hit ratio** > 70%
- **CPU usage** < 80%
- **Memory usage** < 90%
- **Error rate** < 1%

### Alertas Recomendadas

- Contenedores caídos o reiniciándose
- High CPU/Memory usage
- Database connection errors
- High response times

## Mantenimiento

### Actualizaciones

```bash
# Actualizar dependencias backend
cd backend
pip install --upgrade -r requirements.txt

# Actualizar dependencias frontend
cd frontend
npm update

# Rebuild y redeploy
docker-compose build --no-cache
docker-compose up -d
```

### Backups

```bash
# Backup de base de datos (Supabase automático)
# Backup de configuraciones
cp .env .env.backup.$(date +%Y%m%d)

# Backup de código
git push origin --all
```