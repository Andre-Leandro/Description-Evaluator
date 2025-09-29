# SmartCatalog

Una aplicación web moderna para evaluar y analizar descripciones utilizando tecnologías de vanguardia y arquitectura containerizada.

## Arquitectura del Proyecto

Este proyecto implementa una arquitectura de microservicios completa con:

- **Frontend**: Next.js 15 con React 19 y Tailwind CSS
- **Backend**: Python (Flask/FastAPI)
- **Base de Datos**: Redis para cacheo y almacenamiento rápido
- **Infraestructura**: Docker y Docker Compose
- **Integración**: Supabase para servicios adicionales

## Tecnologías Utilizadas

### Frontend

- **Next.js 15.3.5** - Framework React con soporte para Turbopack
- **React 19** - Biblioteca de interfaz de usuario
- **Tailwind CSS 4** - Framework de CSS utilitario
- **Radix UI** - Componentes accesibles y primitivos
- **Lucide React** - Iconos modernos
- **Recharts** - Gráficos y visualizaciones de datos
- **Supabase** - Backend como servicio

### Backend

- **Python** - Lenguaje de programación principal
- **Redis** - Base de datos en memoria para cacheo

### DevOps

- **Docker** - Containerización
- **Docker Compose** - Orquestación de contenedores
- **GitHub Actions** - CI/CD automatizado
- **Azure Container Instances** - Hosting en la nube
- **Azure Container Registry** - Registro de imágenes Docker

## 📁 Estructura del Proyecto

```
Description-Evaluator/
├── .github/                    # Configuración de GitHub Actions
├── backend/                    # Aplicación Python
├── frontend/                   # Aplicación Next.js
├── .env.example               # Variables de entorno de ejemplo
├── .gitignore                 # Archivos ignorados por Git
├── docker-compose.yml         # Configuración de Docker Compose
└── README.md                  # Este archivo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Docker y Docker Compose instalados
- Node.js 18+ (para desarrollo local)
- Python 3.8+ (para desarrollo local)

### Configuración con Docker (Recomendado)

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/Andre-Leandro/Description-Evaluator.git
   cd Description-Evaluator
   ```

2. **Configura las variables de entorno:**

   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones
   ```

3. **Ejecuta la aplicación:**

   ```bash
   docker-compose up -d
   ```

4. **Accede a la aplicación:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - Redis: `localhost:6379`

### Despliegue Automático

El proyecto incluye CI/CD automatizado con GitHub Actions que:

1. **Se activa automáticamente** al hacer push a la rama `docker`
2. **Build y Push** de imágenes Docker a Azure Container Registry
3. **Deploy automático** a Azure Container Instances
4. **Configuración de servicios**:
   - Redis como cache distribuido
   - Backend con conexión a base de datos y Redis
   - Frontend conectado al backend desplegado

**Rama de deploy**: `docker` (push automático despliega a producción)

### Desarrollo Local

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## 🚀 Aplicación Desplegada

La aplicación está desplegada en Azure Container Instances y disponible en las siguientes URLs:

### Enlaces de Producción

- **💻 Frontend (Aplicación Principal)**:

  - `http://frontend-tp-devops.eastus.azurecontainer.io`

- **🖥️ Backend (API)**:

  - `http://backend-tp-devops.eastus.azurecontainer.io:10000`

- **💾 Redis (Cache)**:
  - Host: `redis-tp-devops.eastus.azurecontainer.io`
  - Puerto: `6379`

### 💻 Conexión a Redis por Consola

Para conectarte al Redis desplegado desde tu terminal:

```bash
# Conectar usando redis-cli
redis-cli -h redis-tp-devops.eastus.azurecontainer.io -p 6379 -a $REDIS_PASSWORD
```
