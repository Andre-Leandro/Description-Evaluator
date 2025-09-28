# Guía de Deployment - Description-Evaluator

## 📋 Índice

- [Deployment Local](#deployment-local)
- [Deployment en Azure](#deployment-en-azure)
- [CI/CD con GitHub Actions](#cicd-con-github-actions)
- [Configuración de Servicios](#configuración-de-servicios)
- [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
- [Troubleshooting](#troubleshooting)

## 🏠 Deployment Local

### Requisitos Previos

```bash
# Verificar versiones
docker --version          # >= 20.10
docker compose version    # >= 2.0
node --version            # >= 20.0
python --version          # >= 3.11
```

### 1. Configuración Rápida con Docker Compose

```bash
# 1. Clonar repositorio
git clone https://github.com/Andre-Leandro/Description-Evaluator.git
cd Description-Evaluator

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Levantar todos los servicios
docker compose up --build

# 4. Verificar servicios
curl http://localhost:3000      # Frontend
curl http://localhost:10000     # Backend API
redis-cli -p 6379 ping         # Redis
```

### 2. Variables de Entorno Requeridas

```bash
# .env
# Redis
REDIS_PASSWORD=tu_redis_password
REDIS_HOST=redis
REDIS_PORT=6379

# PostgreSQL
db_user=tu_usuario
db_password=tu_password
db_host=tu_host
db_port=5432
db_name=description_evaluator

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API
NEXT_PUBLIC_API_URL=http://localhost:10000
```

### 3. Deployment Manual (Desarrollo)

#### Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos
createdb description_evaluator
python -c "from db import create_tables; create_tables()"

# Ejecutar servidor
python main.py
```

#### Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build producción
npm run build
npm start
```

## ☁️ Deployment en Azure

### Arquitectura Azure

```
Azure Resource Group: tp-devops
├── Azure Container Registry (ACR)
│   ├── devopsregistrytp.azurecr.io/backend:latest
│   ├── devopsregistrytp.azurecr.io/frontend:latest
│   └── devopsregistrytp.azurecr.io/redis:alpine
├── Azure Container Instances (ACI)
│   ├── redis-tp-devops (Redis Cache)
│   ├── backend-tp-devops (Flask API)
│   └── frontend-tp-devops (Next.js App)
└── Azure Database for PostgreSQL (External)
```

### 1. Configuración Azure Container Registry

```bash
# Login en Azure CLI
az login

# Crear Resource Group
az group create --name tp-devops --location eastus

# Crear Azure Container Registry
az acr create --resource-group tp-devops \
  --name devopsregistrytp --sku Basic

# Obtener credenciales del registry
az acr credential show --name devopsregistrytp
```

### 2. Build y Push Manual

```bash
# Login en ACR
docker login devopsregistrytp.azurecr.io
# Usuario: devopsregistrytp
# Password: [obtenido del comando anterior]

# Build y push backend
docker build -t devopsregistrytp.azurecr.io/backend:latest ./backend
docker push devopsregistrytp.azurecr.io/backend:latest

# Build y push frontend
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://backend-tp-devops.eastus.azurecontainer.io:10000 \
  -t devopsregistrytp.azurecr.io/frontend:latest ./frontend
docker push devopsregistrytp.azurecr.io/frontend:latest

# Push Redis
docker pull redis:alpine
docker tag redis:alpine devopsregistrytp.azurecr.io/redis:alpine
docker push devopsregistrytp.azurecr.io/redis:alpine
```

### 3. Deploy Azure Container Instances

#### Redis
```bash
az container create \
  --resource-group tp-devops \
  --name redis \
  --image devopsregistrytp.azurecr.io/redis:alpine \
  --cpu 0.5 --memory 0.5 \
  --os-type Linux \
  --ports 6379 \
  --ip-address public \
  --dns-name-label redis-tp-devops \
  --registry-login-server devopsregistrytp.azurecr.io \
  --registry-username devopsregistrytp \
  --registry-password [PASSWORD] \
  --restart always \
  --command-line "redis-server --requirepass myredispassword123 --appendonly yes"
```

#### Backend
```bash
# Obtener IP de Redis
REDIS_IP=$(az container show --resource-group tp-devops --name redis --query ipAddress.ip -o tsv)

az container create \
  --resource-group tp-devops \
  --name backend \
  --image devopsregistrytp.azurecr.io/backend:latest \
  --cpu 1 --memory 1 \
  --os-type Linux \
  --ports 10000 \
  --ip-address public \
  --dns-name-label backend-tp-devops \
  --registry-login-server devopsregistrytp.azurecr.io \
  --registry-username devopsregistrytp \
  --registry-password [PASSWORD] \
  --restart always \
  --environment-variables \
    user=tu_db_user \
    password=tu_db_password \
    host=tu_db_host \
    port=5432 \
    dbname=description_evaluator \
    REDIS_HOST=$REDIS_IP \
    REDIS_PORT=6379 \
    REDIS_PASSWORD=myredispassword123
```

#### Frontend
```bash
# Obtener IP de Backend
BACKEND_IP=$(az container show --resource-group tp-devops --name backend --query ipAddress.ip -o tsv)

az container create \
  --resource-group tp-devops \
  --name frontend \
  --image devopsregistrytp.azurecr.io/frontend:latest \
  --cpu 1 --memory 1 \
  --os-type Linux \
  --ports 3000 \
  --ip-address public \
  --dns-name-label frontend-tp-devops \
  --registry-login-server devopsregistrytp.azurecr.io \
  --registry-username devopsregistrytp \
  --registry-password [PASSWORD] \
  --restart always \
  --environment-variables \
    NEXT_PUBLIC_API_URL=http://$BACKEND_IP:10000 \
    NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_supabase_key
```

### 4. URLs de Producción

- **Frontend**: http://frontend-tp-devops.eastus.azurecontainer.io:3000
- **Backend API**: http://backend-tp-devops.eastus.azurecontainer.io:10000
- **Redis**: redis-tp-devops.eastus.azurecontainer.io:6379

## 🔄 CI/CD con GitHub Actions

### 1. Configuración de Secrets

En GitHub Repository → Settings → Secrets and variables → Actions:

```bash
# Azure
AZURE_CREDENTIALS          # Service Principal JSON
ACR_PASSWORD               # Azure Container Registry password

# Database
DATABASE_URL               # URL completa de PostgreSQL
DB_USER                    # Usuario de base de datos
DB_PASSWORD                # Password de base de datos
DB_HOST                    # Host de base de datos
DB_PORT                    # Puerto de base de datos (5432)
DB_NAME                    # Nombre de base de datos

# Services
RENDER_API_KEY             # Para deployment alternativo
```

### 2. Pipeline de Testing (.github/workflows/backend-test.yml)

```yaml
name: Backend Test (Docker)
on:
  push:
    branches: [docker]
  pull_request:
    branches: [docker]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          
      - name: Setup Redis
        uses: shogo82148/actions-setup-redis@v1
        with:
          redis-version: "6.x"
          
      - name: Install dependencies
        working-directory: backend
        run: |
          pip install -r requirements.txt
          pip install pytest requests
          
      - name: Create test environment
        working-directory: backend
        run: |
          echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" > .env
          echo "user=${{ secrets.DB_USER }}" >> .env
          echo "password=${{ secrets.DB_PASSWORD }}" >> .env
          echo "host=${{ secrets.DB_HOST }}" >> .env
          echo "port=${{ secrets.DB_PORT }}" >> .env
          echo "dbname=${{ secrets.DB_NAME }}" >> .env
          
      - name: Run backend
        working-directory: backend
        run: python main.py &
        
      - name: Wait for backend
        run: sleep 15
        
      - name: Run tests
        working-directory: backend
        run: pytest test_api.py -v
```

### 3. Pipeline de Deployment (.github/workflows/deploy.yml)

```yaml
name: Build, Push and Deploy to Azure
on:
  push:
    branches: ["docker"]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Log in to ACR
        uses: azure/docker-login@v1
        with:
          login-server: devopsregistrytp.azurecr.io
          username: devopsregistrytp
          password: ${{ secrets.ACR_PASSWORD }}
          
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
          
      # Deploy Redis
      - name: Deploy Redis
        run: |
          az container delete --resource-group tp-devops --name redis --yes || true
          az container create \
            --resource-group tp-devops \
            --name redis \
            --image devopsregistrytp.azurecr.io/redis:alpine \
            [... resto de configuración]
            
      # Build y deploy backend
      - name: Build & Deploy Backend
        run: |
          docker build -t devopsregistrytp.azurecr.io/backend:latest ./backend
          docker push devopsregistrytp.azurecr.io/backend:latest
          [... deployment commands]
          
      # Build y deploy frontend
      - name: Build & Deploy Frontend
        run: |
          BACKEND_IP=$(az container show --resource-group tp-devops --name backend --query ipAddress.ip -o tsv)
          docker build \
            --build-arg NEXT_PUBLIC_API_URL=http://$BACKEND_IP:10000 \
            -t devopsregistrytp.azurecr.io/frontend:latest ./frontend
          docker push devopsregistrytp.azurecr.io/frontend:latest
          [... deployment commands]
```

### 4. Workflow de Desarrollo

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y testear localmente
docker compose up --build
npm run test  # Frontend
pytest        # Backend

# 3. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request a 'docker' branch
# GitHub Actions ejecutará tests automáticamente

# 5. Merge a 'docker' branch
# GitHub Actions desplegará automáticamente a Azure
```

## ⚙️ Configuración de Servicios

### 1. PostgreSQL Database

```sql
-- Crear base de datos
CREATE DATABASE description_evaluator;

-- Crear usuario
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE description_evaluator TO app_user;

-- Conectar y crear tablas
\c description_evaluator;
-- Las tablas se crean automáticamente con SQLAlchemy
```

### 2. Supabase Setup

```bash
# 1. Crear proyecto en https://supabase.com
# 2. Obtener URL y API Key del dashboard
# 3. Crear bucket para imágenes
supabase storage create-bucket SmartCatalog --public

# 4. Configurar políticas de acceso
-- Permitir lecturas públicas
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'SmartCatalog');
```

### 3. Redis Configuration

```bash
# Redis en Docker
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:alpine \
  redis-server --requirepass myredispassword123 --appendonly yes

# Verificar conexión
redis-cli -h localhost -p 6379 -a myredispassword123 ping
```

## 📊 Monitoreo y Mantenimiento

### 1. Health Checks

```bash
# Frontend
curl -f http://localhost:3000/_next/static/chunks/main.js

# Backend
curl -f http://localhost:10000/

# Redis
redis-cli -h localhost -p 6379 -a password ping

# Database
pg_isready -h localhost -p 5432 -U username
```

### 2. Logs y Debugging

```bash
# Docker Compose logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f redis

# Azure Container Instances logs
az container logs --resource-group tp-devops --name backend
az container logs --resource-group tp-devops --name frontend
az container logs --resource-group tp-devops --name redis

# Logs en tiempo real
az container logs --resource-group tp-devops --name backend --follow
```

### 3. Métricas y Alertas

```bash
# Verificar uso de recursos Azure
az monitor metrics list \
  --resource /subscriptions/[SUB-ID]/resourceGroups/tp-devops/providers/Microsoft.ContainerInstance/containerGroups/backend \
  --metric CpuUsage,MemoryUsage

# Configurar alertas
az monitor metrics alert create \
  --name "High CPU Usage" \
  --resource-group tp-devops \
  --scopes [RESOURCE-ID] \
  --condition "avg CpuUsage > 80" \
  --description "Alert when CPU usage exceeds 80%"
```

### 4. Backup y Recovery

```bash
# Backup PostgreSQL
pg_dump -h host -U user -d description_evaluator > backup_$(date +%Y%m%d).sql

# Backup Redis (si tiene persistencia)
redis-cli -h host -p 6379 -a password BGSAVE

# Restore PostgreSQL
psql -h host -U user -d description_evaluator < backup_20241201.sql
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión entre Servicios

```bash
# Verificar network Docker
docker network ls
docker network inspect description-evaluator_default

# Verificar conectividad
docker compose exec backend ping redis
docker compose exec frontend curl http://backend:10000/
```

#### 2. Error de Variables de Entorno

```bash
# Verificar variables en contenedor
docker compose exec backend printenv | grep -E "(REDIS|DB_)"
docker compose exec frontend printenv | grep NEXT_PUBLIC

# Recrear con nuevas variables
docker compose down
docker compose up --build
```

#### 3. Error de Build en Azure

```bash
# Verificar logs de build
az acr task logs --registry devopsregistrytp

# Build local y push manual
docker build -t devopsregistrytp.azurecr.io/backend:latest ./backend
docker push devopsregistrytp.azurecr.io/backend:latest
```

#### 4. Error de Deployment

```bash
# Verificar estado del container
az container show --resource-group tp-devops --name backend

# Restart container
az container restart --resource-group tp-devops --name backend

# Recrear container
az container delete --resource-group tp-devops --name backend --yes
# Ejecutar comando de creación nuevamente
```

### Comandos de Emergencia

```bash
# Rollback rápido
git checkout [COMMIT-ANTERIOR]
git push origin docker --force

# Parar todos los servicios
docker compose down
az container stop --resource-group tp-devops --name backend
az container stop --resource-group tp-devops --name frontend

# Restart completo
docker compose down -v
docker system prune -a
docker compose up --build
```

---

**Última actualización:** Diciembre 2024  
**Autor:** DevOps Team UTN  
**Versión:** 1.0.0