# SmartCatalog - Description Evaluator

**Aplicación Web Moderna para Evaluación de Descripciones de Productos con IA**

[![Deploy Status](https://github.com/Andre-Leandro/Description-Evaluator/workflows/Build,%20Push%20and%20Deploy%20to%20Azure/badge.svg)](https://github.com/Andre-Leandro/Description-Evaluator/actions)
[![Tests](https://github.com/Andre-Leandro/Description-Evaluator/workflows/Backend%20Test%20(Docker)/badge.svg)](https://github.com/Andre-Leandro/Description-Evaluator/actions)

## 🚀 Descripción

SmartCatalog es una herramienta profesional para evaluar, comparar y optimizar descripciones de productos generadas por diferentes modelos de inteligencia artificial. La aplicación permite cargar datos de productos, mostrar descripciones originales y generadas, y recopilar votos de usuarios para determinar qué descripciones son más efectivas.

### ✨ Características Principales

- 📊 **Sistema de Votación**: Compara descripciones originales vs generadas por IA
- 📈 **Análisis de Resultados**: Visualización de estadísticas y métricas
- 📁 **Gestión de Datos**: Carga y descarga de archivos CSV
- ⚡ **Alto Rendimiento**: Cache con Redis para respuestas rápidas
- 🐳 **Containerizado**: Deploy fácil con Docker
- ☁️ **Cloud Ready**: Desplegado en Microsoft Azure
- 🔄 **CI/CD**: Integración continua con GitHub Actions

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- Next.js 15.3.5 (React 19)
- TailwindCSS 4
- Radix UI Components
- Recharts para visualizaciones

**Backend:**
- Flask (Python)
- Redis (Cache)
- PostgreSQL (Supabase)
- SQLAlchemy ORM

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Azure Container Registry
- Azure Container Instances

### Diagrama de Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    FRONTEND     │    │     BACKEND     │    │   DATABASES     │
│   (Next.js)     │◄──►│    (Flask)      │◄──►│  PostgreSQL     │
│   Port: 3000    │    │   Port: 10000   │    │  (Supabase)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     REDIS       │
                       │   (Cache)       │
                       │   Port: 6379    │
                       └─────────────────┘
```

## 🚀 Inicio Rápido

### Prerequisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo)
- Python 3.10+ (para desarrollo)

### Instalación con Docker (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/Andre-Leandro/Description-Evaluator.git
cd Description-Evaluator

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 3. Ejecutar con Docker Compose
docker-compose up -d

# 4. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:10000
```

### Instalación Manual

Ver [INSTALACION.md](./INSTALACION.md) para instrucciones detalladas.

## 📖 Documentación

### Documentos Principales

- 📋 **[Documentación Técnica Completa (.docx)](./Documentacion_Tecnica_Description_Evaluator.docx)** - Documento principal con toda la información técnica
- 🏗️ **[Arquitectura del Sistema](./ARQUITECTURA.md)** - Detalles de la arquitectura y componentes
- ⚙️ **[Guía de Instalación](./INSTALACION.md)** - Instrucciones paso a paso para instalación
- 🔌 **[Documentación de API](./API_DOCUMENTATION.md)** - Endpoints y ejemplos de uso

### Características de la Documentación

✅ **Completamente en Español** como solicitado  
✅ **Formato .docx editable** para modificaciones posteriores  
✅ **Diagramas de arquitectura** detallados  
✅ **Guías de instalación** paso a paso  
✅ **Documentación de APIs** completa  
✅ **Instrucciones de despliegue** en Azure  
✅ **Mejores prácticas** de DevOps implementadas  

## 🖥️ Capturas de Pantalla

### Página Principal
![Homepage](https://github.com/user-attachments/assets/25138c0e-1468-48e1-94ba-12bb45f482b3)

### Carga de Datos CSV  
![CSV Upload](https://github.com/user-attachments/assets/0bb5ed64-e915-405a-85f9-30a7cbea1747)

### Descarga de Resultados
![CSV Download](https://github.com/user-attachments/assets/5ccadd2a-736d-4ed9-bed4-be709c85afdf)

## 🔧 APIs Principales

### Productos
```bash
# Obtener todos los productos
GET /products

# Obtener producto específico  
GET /products/{id}

# Registrar voto
POST /vote
```

### Archivos
```bash
# Subir archivo CSV
POST /upload-csv
```

Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para detalles completos.

## 🧪 Testing

```bash
# Tests del backend
cd backend
pytest test_api.py -v

# Tests con Docker
docker-compose up -d
pytest test_api.py
docker-compose down
```

## 🚀 Despliegue

### Desarrollo Local
```bash
docker-compose up -d
```

### Producción (Azure)
El despliegue es automático mediante GitHub Actions cuando se hace push al branch `docker`.

### Variables de Entorno
```env
# Base de datos
DATABASE_URL=postgresql://...
user=tu_usuario
password=tu_password
host=db.xyz.supabase.co
port=5432
dbname=postgres

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=tu_password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:10000
```

## 📊 Monitoreo

- **Métricas**: CPU, memoria, tiempo de respuesta
- **Logs**: Structured logging en JSON
- **Alertas**: Configuradas para errores críticos
- **Health Checks**: Endpoints automáticos

## 🔒 Seguridad

- Validación de entrada de datos
- Sanitización de archivos CSV
- Headers de seguridad HTTP
- Secrets externalizados
- Imágenes Docker seguras

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Changelog

### v1.0.0 (2025-01-XX)
- ✅ Sistema completo de evaluación de descripciones
- ✅ Frontend moderno con Next.js 15
- ✅ Backend escalable con Flask + Redis
- ✅ CI/CD con GitHub Actions
- ✅ Despliegue en Azure
- ✅ Documentación técnica completa

## 👥 Equipo

- **Desarrollo**: Andre-Leandro
- **Universidad**: Universidad Tecnológica Nacional (UTN)
- **Curso**: Aplicaciones Web con Redis Contenerizadas - DevOps
- **Año**: 2025

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

¿Necesitas ayuda? 

- 📖 Lee la [documentación completa](./Documentacion_Tecnica_Description_Evaluator.docx)  
- 🐛 Reporta bugs en [Issues](https://github.com/Andre-Leandro/Description-Evaluator/issues)
- 💬 Preguntas en [Discussions](https://github.com/Andre-Leandro/Description-Evaluator/discussions)

---

<div align="center">

**⭐ Si este proyecto te ayudó, considera darle una estrella ⭐**

</div>