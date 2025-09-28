# Description-Evaluator

## 📋 Índice

- [Descripción General](#-descripción-general)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Base de Datos](#-base-de-datos)
- [API Endpoints](#-api-endpoints)
- [Frontend](#-frontend)
- [Docker y Contenedores](#-docker-y-contenedores)
- [GitHub Actions CI/CD](#-github-actions-cicd)
- [Deployment en Azure](#-deployment-en-azure)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

## 🚀 Descripción General

**Description-Evaluator** es una aplicación web completa para la evaluación y comparación de descripciones de productos generadas por diferentes modelos de inteligencia artificial. La aplicación permite a los usuarios:

- **Evaluar descripciones**: Comparar diferentes descripciones generadas por distintos modelos de IA
- **Sistema de votación**: Permitir a los usuarios votar por las mejores descripciones
- **Análisis estadístico**: Generar reportes y estadísticas sobre las evaluaciones
- **Gestión de datos**: Cargar productos mediante CSV y gestionar imágenes
- **Cache inteligente**: Utiliza Redis para optimizar el rendimiento

### Características Principales

- ✅ **Interfaz moderna** con Next.js 15 y React 19
- ✅ **API REST robusta** con Flask y SQLAlchemy
- ✅ **Base de datos PostgreSQL** con modelos relacionales
- ✅ **Cache Redis** para optimización de rendimiento
- ✅ **Autenticación** con Supabase
- ✅ **Containerización** completa con Docker
- ✅ **CI/CD automatizado** con GitHub Actions
- ✅ **Deployment en Azure** Container Instances
- ✅ **Testing automatizado** con pytest

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │───▶│   (Flask API)   │───▶│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 10000   │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │              ┌─────────────────┐              
         │              │     Redis       │              
         └──────────────│   (Cache)       │              
                        │   Port: 6379    │              
                        └─────────────────┘              

┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Actions CI/CD                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Build     │  │    Test     │  │      Deploy to Azure    │ │
│  │  Containers │  │   Backend   │  │   Container Instances   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Usuario** interactúa con la interfaz web (Next.js)
2. **Frontend** realiza peticiones HTTP a la API REST
3. **Backend** procesa las peticiones y consulta:
   - **Redis** para datos cacheados
   - **PostgreSQL** para datos persistentes
4. **Respuesta** se devuelve al frontend para mostrar al usuario

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework de React para aplicaciones web
- **React 19** - Biblioteca para interfaces de usuario
- **Tailwind CSS 4** - Framework CSS utilitario
- **Supabase** - Backend como servicio para autenticación
- **Recharts** - Biblioteca para gráficos y visualizaciones
- **Lucide React** - Iconos para la interfaz

### Backend
- **Python 3.11** - Lenguaje de programación
- **Flask** - Micro framework web
- **SQLAlchemy** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **Redis** - Base de datos en memoria para cache
- **psycopg2** - Adaptador de PostgreSQL para Python
- **python-dotenv** - Gestión de variables de entorno
- **pandas** - Manipulación y análisis de datos

### DevOps e Infraestructura
- **Docker & Docker Compose** - Containerización
- **GitHub Actions** - CI/CD
- **Azure Container Registry** - Registro de contenedores
- **Azure Container Instances** - Hosting de contenedores
- **pytest** - Framework de testing para Python

## ⚙️ Requisitos Previos

### Para Desarrollo Local
- **Node.js** 20+ y npm
- **Python** 3.11+
- **PostgreSQL** 12+
- **Redis** 6+
- **Git**

### Para Deployment
- **Docker** y Docker Compose
- **Cuenta de Azure** con Container Registry
- **GitHub** para CI/CD

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Andre-Leandro/Description-Evaluator.git
cd Description-Evaluator
```

### 2. Configurar Variables de Entorno

#### Backend (.env en /backend)
```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:
```env
# Base de datos PostgreSQL
user=tu_usuario_db
password=tu_password_db
host=localhost
port=5432
dbname=description_evaluator

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=tu_redis_password

# Flask
FLASK_ENV=development
FLASK_DEBUG=1
```

#### Frontend (.env.local en /frontend)
```bash
cp frontend/.env.local.example frontend/.env.local
```

Editar `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:10000
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_supabase_key
```

### 3. Instalación con Docker (Recomendado)

```bash
# Construir y levantar todos los servicios
docker-compose up --build

# En modo desarrollo con logs
docker-compose up --build -d
docker-compose logs -f
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:10000
- **Redis**: localhost:6379

### 4. Instalación Manual (Desarrollo)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
Description-Evaluator/
├── 📁 .github/
│   └── 📁 workflows/
│       ├── backend-test.yml      # Testing automatizado
│       └── deploy.yml            # Deployment a Azure
├── 📁 backend/
│   ├── 📁 routes/
│   │   ├── product_routes.py     # Endpoints de productos
│   │   └── file_routes.py        # Endpoints de archivos
│   ├── 📁 services/
│   │   ├── product_service.py    # Lógica de negocio productos
│   │   └── file_service.py       # Lógica de negocio archivos
│   ├── 📁 csv/                   # Archivos CSV de prueba
│   ├── main.py                   # Punto de entrada Flask
│   ├── models.py                 # Modelos SQLAlchemy
│   ├── db.py                     # Configuración base de datos
│   ├── requirements.txt          # Dependencias Python
│   ├── Dockerfile               # Imagen Docker backend
│   ├── test_api.py              # Tests de API
│   └── test_model.py            # Tests de modelos
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── page.js           # Página principal
│   │   │   └── 📁 pages/
│   │   │       ├── MainTabs.jsx  # Componente principal
│   │   │       ├── DescriptionVoting.jsx # Evaluación
│   │   │       ├── CSVUpload.jsx # Carga de datos
│   │   │       └── Results.jsx   # Resultados
│   │   └── 📁 components/
│   │       └── Sidebar.jsx       # Navegación lateral
│   ├── 📁 public/               # Archivos estáticos
│   ├── package.json             # Dependencias Node.js
│   ├── Dockerfile              # Imagen Docker frontend
│   └── next.config.js          # Configuración Next.js
├── docker-compose.yml           # Orquestación servicios
├── README.md                   # Documentación principal
└── TP1-AppWebRedisContenerizados-DevOps-UTN-2025.pdf # Especificaciones
```

## 🗄️ Base de Datos

### Esquema de la Base de Datos

La aplicación utiliza PostgreSQL con el siguiente esquema relacional:

```sql
-- Modelos de IA disponibles
CREATE TABLE model (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Condiciones/contextos de evaluación
CREATE TABLE condition (
    id BIGSERIAL PRIMARY KEY,
    description TEXT,
    temperature BIGINT
);

-- Productos a evaluar
CREATE TABLE product (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    og_description TEXT
);

-- Descripciones generadas por los modelos
CREATE TABLE description (
    id BIGSERIAL PRIMARY KEY,
    generated_description TEXT NOT NULL,
    product BIGINT REFERENCES product(id),
    model BIGINT REFERENCES model(id),
    condition BIGINT REFERENCES condition(id)
);

-- Evaluaciones y votos de usuarios
CREATE TABLE evaluation (
    id BIGSERIAL PRIMARY KEY,
    evaluated BOOLEAN NOT NULL DEFAULT FALSE,
    vote BIGINT REFERENCES model(id),
    product BIGINT REFERENCES product(id),
    condition BIGINT REFERENCES condition(id)
);
```

### Relaciones

- **Product** tiene muchas **Description** (una por modelo/condición)
- **Product** tiene muchas **Evaluation** (una por condición)
- **Model** genera muchas **Description**
- **Condition** define el contexto para **Description** y **Evaluation**

### Datos de Ejemplo

```python
# Modelos disponibles
models = ["GPT-4", "Claude-3", "Gemini-Pro"]

# Condiciones de evaluación
conditions = [
    {"description": "Formal", "temperature": 0.3},
    {"description": "Creativo", "temperature": 0.7},
    {"description": "Persuasivo", "temperature": 0.5}
]
```

## 🔌 API Endpoints

### Productos

#### `GET /products`
Obtiene todos los productos con sus descripciones y evaluaciones.

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Smartphone XYZ",
      "og_description": "Descripción original...",
      "evaluated": true,
      "vote": 2,
      "descriptions": [
        {
          "id": 1,
          "generated_description": "Descripción generada...",
          "model": {"id": 1, "name": "GPT-4"},
          "condition": {"id": 1, "description": "Formal"}
        }
      ],
      "evaluations": [
        {
          "id": 1,
          "evaluated": true,
          "vote": 2,
          "condition": {"id": 1, "description": "Formal"}
        }
      ]
    }
  ]
}
```

**Características:**
- ✅ **Cache Redis**: Datos cacheados por 5 minutos
- ✅ **Eager Loading**: Incluye relaciones en una sola consulta
- ✅ **Error Handling**: Manejo robusto de errores

#### `GET /products/<id>`
Obtiene un producto específico por ID.

**Response:**
```json
{
  "product": {
    "id": 1,
    "name": "Producto",
    "descriptions": [...],
    "evaluations": [...]
  }
}
```

#### `POST /vote`
Registra el voto de un usuario para un producto.

**Request:**
```json
{
  "id": 1,              // Product ID
  "model_id": 2,        // Model ID votado
  "condition_id": 1     // Condición (opcional, default: 1)
}
```

**Response:**
```json
{
  "message": "Vote registered successfully",
  "product_id": 1,
  "model_id": 2,
  "condition_id": 1
}
```

**Características:**
- ✅ **Cache Invalidation**: Limpia cache después del voto
- ✅ **Validación**: Valida campos requeridos
- ✅ **Transaccional**: Operación atómica

### Archivos

#### `POST /upload-csv`
Sube un archivo CSV con productos.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Field**: `file` (archivo CSV)

**CSV Format:**
```csv
nombre_producto,descripcion,meta_titulo,meta_descripcion,id_imagen
"Producto 1","Descripción del producto 1",...
```

**Response:**
```json
{
  "message": "Archivo procesado exitosamente",
  "filename": "productos.csv",
  "records_processed": 50
}
```

## 🎨 Frontend

### Arquitectura Frontend

El frontend está construido con **Next.js 15** usando el nuevo **App Router** y **React 19**.

### Componentes Principales

#### 1. **MainTabs.jsx** - Componente Principal
```jsx
export default function MainTabs() {
  const [activeTab, setActiveTab] = useState("comparacion");
  
  return (
    <>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto p-8">
        {activeTab === "comparacion" && <DescriptionVoting />}
        {activeTab === "individual" && <ModelIndividualRating />}
        {activeTab === "resultados" && <Results />}
        {activeTab === "upload" && <CSVUpload />}
      </main>
    </>
  );
}
```

#### 2. **DescriptionVoting.jsx** - Evaluación de Descripciones
- **Funcionalidad**: Comparación lado a lado de descripciones
- **Features**: 
  - Votación interactiva
  - Filtros por estado (evaluado/pendiente)
  - Navegación por productos
  - Integración con Supabase para imágenes

#### 3. **CSVUpload.jsx** - Carga de Datos
- **Funcionalidad**: Subida de archivos CSV y conexión a DB
- **Features**:
  - Drag & drop interface
  - Validación de archivos
  - Preview de datos
  - Conexión a base de datos

#### 4. **Results.jsx** - Visualización de Resultados
- **Funcionalidad**: Dashboard con estadísticas
- **Features**:
  - Gráficos con Recharts
  - Métricas en tiempo real
  - Exportación de datos

### Hooks Personalizados

```jsx
// useProducts.js - Gestión de estado de productos
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lógica de fetch y cache
  return { products, loading, error };
};

// useVote.js - Gestión de votaciones
const useVote = () => {
  const sendVote = async (productId, modelId, conditionId) => {
    // Lógica de votación
  };
  
  return { sendVote };
};
```

### Estilos y Diseño

- **Tailwind CSS 4**: Framework CSS utilitario
- **Design System**: Componentes reutilizables
- **Responsive**: Adaptable a móviles y desktop
- **Dark Mode**: Soporte para tema oscuro (futuro)

```css
/* Ejemplos de estilos con Tailwind */
.card {
  @apply bg-white rounded-xl shadow-lg p-6 border border-gray-200;
}

.button-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition;
}
```

## 🐳 Docker y Contenedores

### Arquitectura de Contenedores

La aplicación está completamente containerizada con **Docker** y orquestada con **Docker Compose**.

#### docker-compose.yml
```yaml
services:
  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}

  backend:
    build: ./backend
    image: devopsregistrytp.azurecr.io/backend:latest
    container_name: backend
    ports:
      - "10000:10000"
    depends_on:
      - redis
    environment:
      - user=${db_user}
      - password=${db_password}
      - host=${db_host}
      - port=${db_port}
      - dbname=${db_name}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - REDIS_PASSWORD=${REDIS_PASSWORD}

  frontend:
    build:
      context: ./frontend
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
    image: devopsregistrytp.azurecr.io/frontend:latest
    container_name: frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Dockerfile Backend

```dockerfile
# Usar imagen base de Python
FROM python:3.10-slim

# Establecer directorio de trabajo
WORKDIR /app

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=main.py \
    FLASK_ENV=development \
    FLASK_DEBUG=0

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Puerto expuesto
EXPOSE 10000

# Comando de ejecución
CMD ["flask", "run", "--host=0.0.0.0", "--port=10000", "--no-debugger", "--no-reload"]
```

### Dockerfile Frontend

```dockerfile
# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY . .

# Build arguments para Next.js
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Instalar dependencias y construir
RUN npm ci
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar archivos necesarios
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Configuración
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]
```

### Comandos Docker Útiles

```bash
# Desarrollo local
docker-compose up --build
docker-compose down

# Logs en tiempo real
docker-compose logs -f [service_name]

# Ejecutar comandos en contenedores
docker-compose exec backend python test_api.py
docker-compose exec frontend npm run lint

# Reconstruir un servicio específico
docker-compose build backend
docker-compose up -d backend

# Limpiar volúmenes y redes
docker-compose down -v
docker system prune -a
```

## ⚙️ GitHub Actions CI/CD

La aplicación implementa un pipeline completo de **CI/CD** con GitHub Actions.

### Pipeline de Testing (backend-test.yml)

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
    defaults:
      run:
        working-directory: backend
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest requests

      - name: Setup Redis
        uses: shogo82148/actions-setup-redis@v1
        with:
          redis-version: "6.x"

      - name: Create .env for tests
        run: |
          echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" > .env
          # ... más variables de entorno

      - name: Run backend in background
        run: |
          python main.py & 
          sleep 15

      - name: Run backend tests
        run: pytest test_api.py
```

### Pipeline de Deployment (deploy.yml)

El pipeline de deployment automatiza:

1. **Build** de imágenes Docker
2. **Push** a Azure Container Registry
3. **Deploy** a Azure Container Instances

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

      # ... resto de los pasos
```

### Secrets Configurados

En GitHub Secrets están configuradas:

- `DATABASE_URL` - URL de conexión a PostgreSQL
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME` - Credenciales DB
- `ACR_PASSWORD` - Password del Azure Container Registry
- `AZURE_CREDENTIALS` - Service Principal para Azure

## ☁️ Deployment en Azure

### Arquitectura en Azure

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Cloud                          │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Container       │  │ Container       │              │
│  │ Registry (ACR)  │  │ Instances (ACI) │              │
│  │                 │  │                 │              │
│  │ - backend:latest│  │ ┌─────────────┐ │              │
│  │ - frontend:latest│  │ │   Redis     │ │              │
│  │ - redis:alpine  │  │ │   Backend   │ │              │
│  └─────────────────┘  │ │   Frontend  │ │              │
│                       │ └─────────────┘ │              │
│  ┌─────────────────┐  └─────────────────┘              │
│  │   PostgreSQL    │                                   │
│  │   Database      │                                   │
│  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

### Proceso de Deployment

1. **GitHub Actions** detecta cambios en branch `docker`
2. **Build** imágenes Docker localmente
3. **Push** imágenes a Azure Container Registry
4. **Deploy** Redis, Backend y Frontend a Azure Container Instances
5. **Configure** networking y variables de entorno

### URLs de Producción

- **Frontend**: http://frontend-tp-devops.eastus.azurecontainer.io
- **Backend API**: http://backend-tp-devops.eastus.azurecontainer.io:10000
- **Redis**: redis-tp-devops.eastus.azurecontainer.io:6379

### Configuración Azure Container Instances

```bash
# Ejemplo del comando de deployment
az container create \
  --resource-group tp-devops \
  --name backend \
  --image devopsregistrytp.azurecr.io/backend:latest \
  --cpu 1 --memory 1 \
  --os-type Linux \
  --ports 10000 \
  --ip-address public \
  --dns-name-label backend-tp-devops \
  --environment-variables \
    user=${db_user} \
    password=${db_password} \
    REDIS_HOST=${REDIS_IP}
```

## 👨‍💻 Desarrollo

### Setup de Desarrollo Local

1. **Clonar repositorio**
```bash
git clone https://github.com/Andre-Leandro/Description-Evaluator.git
cd Description-Evaluator
```

2. **Variables de entorno**
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Editar frontend/.env.local
```

3. **Base de datos local**
```bash
# PostgreSQL
createdb description_evaluator

# Redis
redis-server
```

4. **Instalación**
```bash
# Opción 1: Docker (recomendado)
docker-compose up --build

# Opción 2: Manual
cd backend && pip install -r requirements.txt && python main.py
cd frontend && npm install && npm run dev
```

### Workflow de Desarrollo

```bash
# 1. Crear branch para feature
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y testear
npm run dev          # Frontend
python main.py       # Backend
pytest              # Tests

# 3. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request
# 5. Review y merge a docker branch
# 6. Deployment automático via GitHub Actions
```

### Estructura de Commits

Usamos **Conventional Commits**:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Documentación
- `style:` Formateo de código
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Tareas de mantenimiento

### Comandos de Desarrollo

```bash
# Backend
cd backend
python main.py                    # Correr servidor
pytest test_api.py               # Tests API
pytest test_model.py             # Tests modelos
python -c "from db import *; create_tables()"  # Crear tablas

# Frontend
cd frontend
npm run dev                      # Servidor desarrollo
npm run build                   # Build para producción
npm run start                   # Servidor producción
npm run lint                    # Linting
```

## 🧪 Testing

### Testing Backend

```bash
cd backend

# Instalar dependencias de testing
pip install pytest requests

# Correr todos los tests
pytest

# Tests específicos
pytest test_api.py -v
pytest test_model.py -v

# Tests con coverage
pytest --cov=. test_api.py
```

#### test_api.py - Tests de API
```python
import requests
import pytest

BASE_URL = "http://localhost:10000"

def test_products_endpoint():
    response = requests.get(f"{BASE_URL}/products")
    assert response.status_code == 200
    assert "products" in response.json()

def test_vote_endpoint():
    data = {"id": 1, "model_id": 2}
    response = requests.post(f"{BASE_URL}/vote", json=data)
    assert response.status_code == 200
```

#### test_model.py - Tests de Modelos
```python
from models import Product, Description, Model
from db import Session

def test_product_model():
    session = Session()
    product = Product(name="Test Product", og_description="Test desc")
    session.add(product)
    session.commit()
    
    assert product.id is not None
    assert product.name == "Test Product"
```

### Testing Frontend

```bash
cd frontend

# Linting
npm run lint

# Type checking (si usas TypeScript)
npx tsc --noEmit

# Build test
npm run build
```

### Testing End-to-End

Para testing E2E recomendamos **Playwright** o **Cypress**:

```bash
# Instalar Playwright
npm install @playwright/test

# Configurar test E2E
npx playwright install

# Correr tests E2E
npx playwright test
```

### CI Testing

Los tests se ejecutan automáticamente en GitHub Actions:

1. **Unit Tests** - Backend con pytest
2. **Integration Tests** - API endpoints
3. **Build Tests** - Docker builds exitosos
4. **Deployment Tests** - Verificación post-deployment

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos

```bash
# Error
sqlalchemy.exc.OperationalError: could not connect to server

# Solución
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql
sudo systemctl start postgresql

# Verificar credenciales en .env
cat backend/.env
```

#### 2. Error de Redis

```bash
# Error
redis.exceptions.ConnectionError: Error connecting to Redis

# Solución
# Verificar Redis
redis-cli ping
# Debería responder PONG

# Si no está corriendo
redis-server

# En Docker
docker-compose up redis
```

#### 3. Error de Build Frontend

```bash
# Error
Error: Cannot find module 'next'

# Solución
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 4. Error de Permisos Docker

```bash
# Error
permission denied while trying to connect to Docker daemon

# Solución
sudo usermod -aG docker $USER
# Logout y login nuevamente
```

#### 5. Error de Variables de Entorno

```bash
# Error
KeyError: 'DATABASE_URL'

# Solución
# Verificar que .env existe y tiene todas las variables
cp .env.example .env
# Editar .env con valores correctos
```

### Logs y Debugging

```bash
# Logs Docker
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis

# Logs específicos
docker logs <container_id>

# Entrar a contenedor para debug
docker-compose exec backend bash
docker-compose exec frontend sh

# Verificar variables de entorno
docker-compose exec backend printenv
```

### Monitoreo

```bash
# Verificar estado de servicios
docker-compose ps

# Uso de recursos
docker stats

# Verificar endpoints
curl http://localhost:10000/products
curl http://localhost:3000
```

### Performance

#### Backend Optimization
- **Redis Cache**: 5 minutos TTL para productos
- **Database Indexing**: Índices en foreign keys
- **Connection Pooling**: SQLAlchemy pool configuration

#### Frontend Optimization
- **Next.js Static Generation**: Pre-render pages
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic con Next.js
- **Bundle Analysis**: `npm run analyze`

---

## 📞 Soporte

Para soporte técnico o consultas:

- **GitHub Issues**: [Crear issue](https://github.com/Andre-Leandro/Description-Evaluator/issues)
- **Documentación**: Este README.md
- **Logs**: Revisar logs de Docker/GitHub Actions

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

---

**Desarrollado con ❤️ para UTN - DevOps 2025**