# 🔍 Observabilidad - Description Evaluator

## ✅ Stack Completo Implementado

### Componentes Principales

1. **OpenTelemetry** - Instrumentación automática de Flask, Redis y SQLAlchemy
2. **Prometheus** - Scraping y almacenamiento de métricas
3. **Grafana** - Visualización de dashboards
4. **Jaeger** - Trazas distribuidas
5. **cAdvisor** - Métricas de contenedores Docker
6. **Redis Exporter** - Métricas específicas de Redis

## 🚀 Comandos Rápidos

### Levantar todo el stack
```bash
docker compose up -d --build
```

### Ver estado de servicios
```bash
docker compose ps
```

### Generar tráfico de prueba
```bash
./test_metrics.sh
```

### Ver logs
```bash
# Logs del backend
docker compose logs backend -f

# Logs de OpenTelemetry Collector
docker compose logs otel-collector -f

# Logs de Prometheus
docker compose logs prometheus -f
```

## 📊 URLs de Acceso

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Backend API** | http://localhost:10000 | - |
| **Backend Metrics** | http://localhost:8000/metrics | - |
| **Grafana** | http://localhost:3000 | admin/admin |
| **Prometheus** | http://localhost:9090 | - |
| **Jaeger UI** | http://localhost:16686 | - |
| **cAdvisor** | http://localhost:8080 | - |

## 📈 Métricas Disponibles

### Métricas de la Aplicación (Backend)

Disponibles en: http://localhost:8000/metrics

1. **`app_requests_total`** - Total de requests procesados
   - Labels: `method`, `endpoint`, `status`
   
2. **`app_request_duration_seconds`** - Duración de requests
   - Labels: `method`, `endpoint`
   
3. **`app_cache_objects_total`** - Objetos en caché Redis
   - Labels: `cache_type`
   
4. **`app_products_loaded_total`** - Total de productos cargados desde DB
   
5. **`app_csv_files_uploaded_total`** - Total de archivos CSV subidos

### Métricas de Contenedores (cAdvisor)

Disponibles en: http://localhost:8080/metrics

- **CPU Usage**: `container_cpu_usage_seconds_total`
- **Memory Usage**: `container_memory_usage_bytes`
- **Network I/O**: `container_network_receive_bytes_total`

### Métricas de Redis

Disponibles en: http://localhost:9121/metrics

- Conexiones activas
- Comandos procesados
- Hit/Miss ratio
- Uso de memoria

## 🔍 Trazas Distribuidas

### Ver trazas en Jaeger

1. Abre http://localhost:16686
2. Selecciona el servicio: `description-evaluator-backend`
3. Click en "Find Traces"

Las trazas incluyen:
- Requests HTTP completos
- Queries a PostgreSQL/Supabase
- Operaciones de Redis
- Tiempo de ejecución de cada operación

## 📊 Dashboard de Grafana

### Acceder al Dashboard

1. Abre http://localhost:3000
2. Login: `admin` / `admin`
3. Ve a "Dashboards" → "Description Evaluator"

### Paneles Disponibles

#### 📱 Aplicación
- Total de requests por endpoint
- Tiempo de respuesta (p95, p99)
- Rate de requests por segundo
- Distribución de status codes (200, 404, 500)
- Productos cargados
- Archivos CSV subidos

#### 🐳 Contenedores (cAdvisor)
- CPU usage por contenedor
- Memoria usage por contenedor
- Network I/O
- Disk I/O

#### 🔴 Redis
- Conexiones activas
- Hit/Miss ratio
- Comandos por segundo
- Uso de memoria

## 🧪 Probar la Observabilidad

### 1. Generar tráfico
```bash
./test_metrics.sh
```

### 2. Ver métricas en Prometheus
```bash
# Abrir http://localhost:9090
# Query de ejemplo: rate(app_requests_total[1m])
```

### 3. Ver en Grafana
```bash
# Abrir http://localhost:3000
# Dashboard: Description Evaluator
```

### 4. Ver trazas en Jaeger
```bash
# Abrir http://localhost:16686
# Service: description-evaluator-backend
```

## 📋 Cumplimiento de Requisitos

### ✅ Logs y Trazas

- ✅ Logs estructurados en JSON (vía OpenTelemetry)
- ✅ Trazas distribuidas con OpenTelemetry
- ✅ Seguimiento de requests completos
- ✅ Auto-instrumentación de Flask, Redis, SQLAlchemy

### ✅ Métricas

#### Indicadores de Contenedor:
- ✅ CPU usage (cAdvisor)
- ✅ Memory usage (cAdvisor)
- ✅ Network I/O (cAdvisor)

#### Indicadores de Aplicación:
- ✅ Total de requests procesados
- ✅ Tiempo de respuesta
- ✅ Objetos en cache (Redis)
- ✅ Productos cargados desde DB
- ✅ Archivos CSV subidos

### ✅ Visualización

- ✅ Grafana con dashboards
- ✅ Gráficos y paneles configurados
- ✅ Indicadores numéricos
- ✅ Múltiples datasources (Prometheus)

### ✅ Stack Recomendado

- ✅ OpenTelemetry SDK + Auto-Instrumentation
- ✅ Prometheus
- ✅ Grafana
- ✅ OTel Collector

## 🛠️ Arquitectura

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │
┌────────▼────────┐     ┌──────────────┐
│   Backend       │────►│  PostgreSQL  │
│   (Flask)       │     │  (Supabase)  │
└────┬───┬───┬────┘     └──────────────┘
     │   │   │
     │   │   └──────────┐
     │   │              │
┌────▼───▼────┐    ┌────▼────────┐
│   Redis     │    │ OTel        │
│             │    │ Collector   │
└─────────────┘    └───┬─────────┘
                       │
              ┌────────┼────────┐
              │        │        │
         ┌────▼───┐ ┌──▼──┐ ┌──▼──────┐
         │Prometheus│Jaeger│Grafana  │
         └──────────┘└─────┘└─────────┘
              │
         ┌────▼────────┐
         │  cAdvisor   │
         │Redis Export │
         └─────────────┘
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Database
db_user=postgres.illglqdcmfjqktkyxhhh
db_password=Strata-ce-2025
db_host=aws-0-us-east-2.pooler.supabase.com
db_port=6543
db_name=postgres

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
OTEL_SERVICE_NAME=description-evaluator-backend
```

## 📝 Notas

- Todos los logs son estructurados en formato JSON
- Las trazas se envían automáticamente a Jaeger vía OTel Collector
- Prometheus scrapea métricas cada 15 segundos
- Grafana está pre-configurado con dashboards
- cAdvisor monitorea todos los contenedores Docker

## 🆘 Troubleshooting

### No veo métricas en Grafana
```bash
# Verificar que Prometheus esté scrapeando
curl http://localhost:9090/api/v1/targets

# Verificar métricas del backend
curl http://localhost:8000/metrics
```

### No aparecen trazas en Jaeger
```bash
# Verificar logs del OTel Collector
docker compose logs otel-collector

# Generar tráfico
./test_metrics.sh
```

### Error al levantar servicios
```bash
# Bajar todo y limpiar
docker compose down -v

# Levantar de nuevo
docker compose up -d --build
```
