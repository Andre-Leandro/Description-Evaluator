# 🎯 Guía Rápida de Acceso a Observabilidad

## ✅ Estado Actual

Todos los componentes están desplegados y corriendo:
- ✅ OpenTelemetry Collector
- ✅ Jaeger
- ✅ Prometheus
- ✅ Grafana
- ✅ Redis Exporter

## 🚀 Acceso a los Servicios

Como estás usando **k3d**, usa el script de port-forward:

```bash
cd k8s
./access-observability.sh
```

Esto abrirá:
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

**⚠️ IMPORTANTE**: Deja esa terminal abierta mientras uses los servicios.

## 📊 Verificación

### Ver pods corriendo
```bash
kubectl get pods -n description-evaluator -l tier=observability
```

### Ver logs de un componente
```bash
# Grafana
kubectl logs -n description-evaluator deployment/grafana -f

# Prometheus
kubectl logs -n description-evaluator deployment/prometheus -f

# OpenTelemetry Collector
kubectl logs -n description-evaluator deployment/otel-collector -f
```

### Verificar que Prometheus está recolectando métricas
1. Abrir http://localhost:9090
2. Ir a Status > Targets
3. Deberías ver: backend, otel-collector, redis-exporter

## 🔧 Troubleshooting

### Port-forward no funciona
```bash
# Matar procesos previos
pkill -f "kubectl port-forward"

# Reintentar
./access-observability.sh
```

### Pods no están listos
```bash
kubectl get pods -n description-evaluator
kubectl describe pod <pod-name> -n description-evaluator
```

### Backend no envía métricas a OTEL
Verificar que las variables estén configuradas:
```bash
kubectl get configmap backend-config -n description-evaluator -o yaml
```

Deberías ver:
- `OTEL_SERVICE_NAME: description-evaluator-backend`
- `OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-collector:4317`

## 🎨 Configurar Grafana

1. Acceder a http://localhost:3000 (admin/admin)
2. Los datasources ya están configurados:
   - Prometheus (métricas)
   - Jaeger (trazas)
3. Para importar tu dashboard existente:
   - Ir a Dashboards > Import
   - Subir `/grafana/dashboard.json`

## 📈 Métricas Disponibles

En Prometheus puedes consultar:
```promql
# Requests por segundo del backend
rate(http_server_duration_milliseconds_count{job="backend"}[1m])

# Latencia promedio
rate(http_server_duration_milliseconds_sum{job="backend"}[1m]) / 
rate(http_server_duration_milliseconds_count{job="backend"}[1m])

# Métricas de Redis
redis_connected_clients
redis_used_memory_bytes
```

## 🔍 Ver Trazas en Jaeger

1. Acceder a http://localhost:16686
2. Seleccionar servicio: `description-evaluator-backend`
3. Click en "Find Traces"
4. Deberías ver las trazas de tus requests HTTP
