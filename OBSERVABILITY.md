# 🐕 Observabilidad - Description Evaluator

## Stack de Observabilidad

Esta aplicación cuenta con un stack completo de observabilidad para salvar a los perritos:

### 📊 Componentes

1. **OpenTelemetry** - Instrumentación y recolección de telemetría
2. **Prometheus** - Almacenamiento y consulta de métricas
3. **Grafana** - Visualización de métricas y dashboards
4. **Jaeger** - Trazas distribuidas
5. **cAdvisor** - Métricas de contenedores
6. **Redis Exporter** - Métricas específicas de Redis

## 🚀 Inicio Rápido

### 1. Levantar todos los servicios

```bash
docker compose up -d --build
```

### 2. Acceder a las interfaces

- **Aplicación Backend**: http://localhost:10000
- **Aplicación Frontend**: http://localhost:80
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686
- **cAdvisor**: http://localhost:8080

## 📈 Métricas Disponibles

### Métricas de la Aplicación

1. **`app_requests_total`** - Total de requests procesados
   - Labels: `method`, `endpoint`, `status`
   
2. **`app_request_duration_seconds`** - Duración de requests
   - Labels: `method`, `endpoint`
   
3. **`app_cache_objects_total`** - Objetos en caché Redis
   - Labels: `cache_type`
   
4. **`app_products_loaded_total`** - Total de productos cargados desde DB
   
5. **`app_csv_files_uploaded_total`** - Total de archivos CSV subidos

### Métricas de Contenedores (cAdvisor)

- **CPU Usage**: `container_cpu_usage_seconds_total`
- **Memory Usage**: `container_memory_usage_bytes`
- **Network I/O**: `container_network_receive_bytes_total`, `container_network_transmit_bytes_total`

### Métricas de Redis

- Conexiones activas
- Comandos procesados
- Uso de memoria
- Hit/Miss ratio del caché

## 🔍 Trazas Distribuidas

Las trazas se pueden visualizar en Jaeger UI (http://localhost:16686).

Cada request HTTP genera una traza que incluye:
- Operaciones de Flask
- Queries a la base de datos
- Operaciones de Redis
- Spans personalizados

## 📊 Dashboard de Grafana

El dashboard incluye:

### Gráficos de Aplicación
- Total de requests por endpoint
- Tiempo de respuesta (percentil 95)
- Rate de requests
- Distribución de status codes

### Indicadores Numéricos
- Total de productos cargados
- Total de archivos CSV subidos
- Objetos en caché Redis
- Total de requests procesados

### Métricas de Contenedores
- CPU usage por contenedor
- Memoria usage por contenedor
- Network I/O por contenedor

## 🔧 Configuración

### Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env`:

```env
# Database
db_user=tu_usuario
db_password=tu_password
db_host=tu_host
db_port=5432
db_name=tu_database

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=tu_redis_password

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:10000
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_supabase_key
```

### Endpoints de Métricas

- **Backend Prometheus Metrics**: http://localhost:8000/metrics
- **OTel Collector Metrics**: http://localhost:8889/metrics
- **cAdvisor Metrics**: http://localhost:8080/metrics
- **Redis Exporter**: http://localhost:9121/metrics

## 📝 Logs Estructurados

Todos los logs están en formato JSON para facilitar el análisis:

```json
{
  "time": "2024-11-29 10:30:00",
  "level": "INFO",
  "name": "backend.routes.product_routes",
  "message": "Request completed: GET /products - Status: 200 - Duration: 0.123s"
}
```

### Ver logs en tiempo real

```bash
# Backend
docker compose logs -f backend

# Todos los servicios
docker compose logs -f
```

## 🎯 Queries Útiles de Prometheus

### Rate de requests por segundo
```promql
sum(rate(app_requests_total[5m]))
```

### Latencia P95 por endpoint
```promql
histogram_quantile(0.95, sum(rate(app_request_duration_seconds_bucket[5m])) by (le, endpoint))
```

### CPU usage por contenedor
```promql
rate(container_cpu_usage_seconds_total{name=~"backend|frontend|redis"}[5m]) * 100
```

### Memoria por contenedor (MB)
```promql
container_memory_usage_bytes{name=~"backend|frontend|redis"} / 1024 / 1024
```

## 🐛 Troubleshooting

### Ver si los servicios están funcionando

```bash
docker compose ps
```

### Verificar que Prometheus esté scrapeando correctamente

1. Ir a http://localhost:9090/targets
2. Verificar que todos los targets estén "UP"

### Ver logs de OpenTelemetry Collector

```bash
docker compose logs otel-collector
```

### Verificar métricas del backend

```bash
curl http://localhost:8000/metrics
```

## 🏗️ Arquitectura

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│   Backend   │────▶│ OTel Collector│────▶│  Jaeger   │
│   (Flask)   │     └──────────────┘     └───────────┘
└──────┬──────┘            │
       │                   │
       ▼                   ▼
┌─────────────┐     ┌──────────────┐
│    Redis    │     │  Prometheus  │
└─────────────┘     └──────┬───────┘
                           │
       ┌───────────────────┼──────────────────┐
       ▼                   ▼                  ▼
┌─────────────┐     ┌──────────────┐  ┌─────────────┐
│   cAdvisor  │     │Redis Exporter│  │   Backend   │
└─────────────┘     └──────────────┘  │  (metrics)  │
       │                   │           └─────────────┘
       └───────────────────┴────────────────┐
                                            ▼
                                     ┌──────────────┐
                                     │   Grafana    │
                                     └──────────────┘
```

## 🐕 ¡Felicidades!

¡Ya tienes observabilidad completa y puedes salvar a los perritos! 🎉

Los dashboards te permitirán:
- Monitorear el rendimiento de tu aplicación
- Detectar problemas antes de que afecten a los usuarios
- Optimizar el uso de recursos
- Entender el comportamiento de tu sistema

**¡A salvar perritos con datos! 🐶📊**
