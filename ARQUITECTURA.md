# Arquitectura del Sistema - Description Evaluator

## Visión General

Description Evaluator implementa una **arquitectura de microservicios moderna** con las siguientes características:

- **Frontend**: Next.js 15 con React 19 y TailwindCSS
- **Backend**: Flask con Redis y PostgreSQL
- **Containerización**: Docker y Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: Microsoft Azure (Container Instances + Container Registry)

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                         │
│  - React 19 Components                                          │
│  - TailwindCSS Styling                                          │
│  - Responsive Design                                             │
│  - Port: 3000                                                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │ REST API
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Flask)                            │
│  - REST API Endpoints                                           │
│  - Business Logic                                               │
│  - Cache Management                                              │
│  - Port: 10000                                                  │
└─────────────────────┬───────────┬───────────────────────────────┘
                      │           │
                      ▼           ▼
┌─────────────────────┐  ┌─────────────────────┐
│    REDIS CACHE      │  │    POSTGRESQL       │
│  - Session Store    │  │  - Product Data     │
│  - Query Cache      │  │  - Evaluations      │
│  - TTL: 5 minutes   │  │  - Descriptions     │
│  - Port: 6379       │  │  - (Supabase)       │
└─────────────────────┘  └─────────────────────┘
```

## Componentes del Sistema

### 1. Frontend (Next.js + React)

**Tecnologías:**
- Next.js 15.3.5 (App Router)
- React 19 (Server Components)
- TailwindCSS 4 (Utility-first CSS)
- Radix UI (Accessible components)
- Recharts (Data visualization)

**Páginas Principales:**
- `/` - Homepage con introducción
- `/subir-csv` - Carga de archivos CSV
- `/comparacion` - Sistema de votación
- `/calificacion` - Evaluación individual
- `/resultados` - Visualización de resultados
- `/descargar-csv` - Exportación de datos

### 2. Backend (Flask + Python)

**Tecnologías:**
- Flask (Web framework)
- SQLAlchemy (ORM)
- Redis-py (Cache client)
- Pandas (Data processing)
- PostgreSQL/Supabase (Database)

**Estructura:**
```
backend/
├── main.py              # Application entry point
├── routes/              # API endpoints
│   ├── product_routes.py
│   └── file_routes.py
├── services/            # Business logic
│   ├── product_service.py
│   └── file_service.py
├── models.py            # Data models
└── db.py               # Database configuration
```

### 3. Base de Datos (PostgreSQL)

**Tablas Principales:**
- `product` - Información de productos
- `description` - Descripciones generadas
- `model` - Modelos de IA
- `condition` - Condiciones de generación
- `evaluation` - Evaluaciones y votos

### 4. Cache (Redis)

**Estrategias:**
- **Cache-aside pattern**
- **TTL de 5 minutos** para datos de productos
- **Invalidación automática** tras operaciones de escritura
- **Fallback robusto** si Redis falla

## Flujo de Datos

### 1. Carga de Datos
```
Usuario → Frontend → Backend → PostgreSQL
                  ↓
               Invalidar Cache Redis
```

### 2. Consulta de Productos
```
Usuario → Frontend → Backend → Redis (check)
                            ↓ (miss)
                        PostgreSQL → Redis (cache) → Usuario
```

### 3. Registro de Votos
```
Usuario → Frontend → Backend → PostgreSQL
                            ↓
                        Redis (invalidate)
```

## Containerización

### Docker Compose (Desarrollo)
```yaml
services:
  redis:    # Cache service
  backend:  # Flask API
  frontend: # Next.js app
```

### Azure Container Instances (Producción)
- **Redis Container**: 0.5 CPU, 0.5GB RAM
- **Backend Container**: 1 CPU, 1GB RAM  
- **Frontend Container**: 1 CPU, 1GB RAM

## CI/CD Pipeline

### GitHub Actions Workflows:

1. **backend-test.yml**
   - Tests automatizados
   - Setup de Redis
   - Validación de APIs

2. **deploy.yml**
   - Build de imágenes Docker
   - Push a Azure Container Registry
   - Deploy a Azure Container Instances

## Monitoreo y Observabilidad

### Logging
- **Structured logs** en formato JSON
- **Correlation IDs** para trazabilidad
- **Diferentes niveles**: DEBUG, INFO, WARNING, ERROR

### Métricas
- Tiempo de respuesta de APIs
- Cache hit ratio
- Uso de CPU y memoria
- Conexiones activas

### Alertas
- Contenedores caídos
- CPU > 80%
- Memoria > 90%
- Errores HTTP 5xx > 10%

## Seguridad

### Aplicación
- Validación de entrada de datos
- Sanitización de archivos CSV
- Headers de seguridad HTTP
- CORS configurado apropiadamente

### Infraestructura
- Imágenes Docker oficiales
- Secrets externalizados
- Comunicación encriptada
- Firewall de Azure

## Escalabilidad

### Horizontal Scaling
- Contenedores stateless
- Load balancer ready
- Database connection pooling
- Cache distribuido

### Vertical Scaling
- CPU y memoria ajustables
- Auto-scaling configurado
- Monitoreo de recursos

## Backup y Recuperación

### Datos
- Backups automáticos de PostgreSQL
- Retention policy de 30 días
- Point-in-time recovery

### Configuración
- Infrastructure as Code
- Versionado de configuraciones
- Rollback automatizado