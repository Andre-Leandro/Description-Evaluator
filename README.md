# Description Evaluator 📊

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
- **Jupyter Notebook** - Para análisis y prototipado

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación de contenedores
- **GitHub Actions** - CI/CD (configurado en `.github/`)

## 📁 Estructura del Proyecto

```
Description-Evaluator/
├── .github/                    # Configuración de GitHub Actions
├── backend/                    # Aplicación Python
├── frontend/                   # Aplicación Next.js
├── .env.example               # Variables de entorno de ejemplo
├── .gitignore                 # Archivos ignorados por Git
├── docker-compose.yml         # Configuración de Docker Compose
├── TP1-AppWebRedisContenerizados-DevOps-UTN-2025.pdf  # Documentación del proyecto
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

## Características Principales

- **Evaluación Inteligente**: Análisis avanzado de descripciones de texto
- **Interfaz Moderna**: UI/UX responsive con Next.js y Tailwind CSS
- **Visualización de Datos**: Gráficos interactivos con Recharts
- **Cacheo Eficiente**: Redis para optimización de rendimiento
- **Arquitectura Escalable**: Microservicios containerizados
- **Integración Cloud**: Supabase para funcionalidades adicionales



