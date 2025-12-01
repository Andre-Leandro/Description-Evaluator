# Stack de Observabilidad en Kubernetes

Este directorio contiene los manifiestos de Kubernetes para desplegar el stack completo de observabilidad migrado desde Docker Compose.

## 📋 Componentes

### Telemetría y Trazas
- **OpenTelemetry Collector**: Recibe y procesa trazas y métricas de la aplicación
- **Jaeger**: Visualización de trazas distribuidas

### Métricas
- **Prometheus**: Almacenamiento y consulta de métricas
- **Redis Exporter**: Exporta métricas específicas de Redis

### Visualización
- **Grafana**: Dashboards y visualización de métricas y trazas

## 🚀 Despliegue Rápido

### Opción 1: Script automático (Recomendado)

```bash
cd k8s
./deploy-observability.sh
```

### Opción 2: Despliegue manual

```bash
# 1. Aplicar ConfigMaps
kubectl apply -f observability-configmaps.yaml

# 2. Desplegar telemetría
kubectl apply -f observability-telemetry.yaml

# 3. Desplegar Prometheus
kubectl apply -f observability-prometheus.yaml

# 4. Desplegar Grafana
kubectl apply -f observability-grafana.yaml

# 5. Desplegar Redis Exporter
kubectl apply -f observability-redis-exporter.yaml
```

## 🔍 Verificar el Despliegue

```bash
# Ver pods de observabilidad
kubectl get pods -n description-evaluator -l tier=observability

# Ver servicios
kubectl get svc -n description-evaluator | grep -E "prometheus|grafana|jaeger|otel"

# Ver logs de un componente
kubectl logs -n description-evaluator deployment/prometheus -f
```

## 🌐 Acceso a los Servicios

### Grafana (Dashboard Principal)
```bash
kubectl port-forward -n description-evaluator svc/grafana 3000:3000
```
- URL: http://localhost:3000
- Usuario: `admin`
- Contraseña: `admin`

### Prometheus (Métricas)
```bash
kubectl port-forward -n description-evaluator svc/prometheus 9090:9090
```
- URL: http://localhost:9090

### Jaeger (Trazas Distribuidas)
```bash
kubectl port-forward -n description-evaluator svc/jaeger 16686:16686
```
- URL: http://localhost:16686

## 📁 Archivos del Stack

### `observability-configmaps.yaml`
ConfigMaps con configuraciones para:
- Prometheus (scrape configs)
- OpenTelemetry Collector (receivers, processors, exporters)
- Grafana datasources

### `observability-telemetry.yaml`
- OpenTelemetry Collector Deployment & Service
- Jaeger Deployment & Service

### `observability-prometheus.yaml`
- Prometheus Deployment & Service
- PersistentVolumeClaim para almacenamiento de métricas (10Gi)

### `observability-grafana.yaml`
- Grafana Deployment & Service
- PersistentVolumeClaim para dashboards (5Gi)
- ConfigMap para dashboard provisioning

### `observability-redis-exporter.yaml`
- Redis Exporter Deployment & Service

## 🔧 Configuración del Backend

El backend ya está configurado para enviar telemetría. Las variables de entorno se configuran en `backend-deployment.yaml`:

```yaml
env:
- name: OTEL_SERVICE_NAME
  value: "description-evaluator-backend"
- name: OTEL_EXPORTER_OTLP_ENDPOINT
  value: "http://otel-collector:4317"
```

## 📊 Flujo de Datos

```
Backend Application
    ├─> OpenTelemetry Collector (OTLP)
    │   ├─> Prometheus (métricas)
    │   └─> Jaeger (trazas)
    │
    └─> Prometheus (métricas HTTP directas en :8000)

Redis
    └─> Redis Exporter
        └─> Prometheus

Prometheus
    └─> Grafana (visualización)

Jaeger
    └─> Grafana (visualización de trazas)
```

## 🎯 Métricas Disponibles

### Backend
- `http_server_duration_milliseconds`: Latencia de requests HTTP
- `http_server_request_count`: Contador de requests
- Métricas custom de la aplicación

### Redis
- `redis_connected_clients`
- `redis_used_memory_bytes`
- `redis_commands_processed_total`

### OpenTelemetry
- Trazas distribuidas con spans
- Métricas de rendimiento de servicios

## 🔄 Actualización del Stack

Para actualizar configuraciones:

```bash
# Editar ConfigMap
kubectl edit configmap prometheus-config -n description-evaluator

# O aplicar cambios
kubectl apply -f observability-configmaps.yaml

# Reiniciar pods para aplicar cambios
kubectl rollout restart deployment/prometheus -n description-evaluator
kubectl rollout restart deployment/grafana -n description-evaluator
```

## 🗑️ Eliminar el Stack de Observabilidad

```bash
kubectl delete -f observability-redis-exporter.yaml
kubectl delete -f observability-grafana.yaml
kubectl delete -f observability-prometheus.yaml
kubectl delete -f observability-telemetry.yaml
kubectl delete -f observability-configmaps.yaml

# Eliminar PVCs si es necesario
kubectl delete pvc prometheus-pvc grafana-pvc -n description-evaluator
```

## 📝 Notas Importantes

1. **Almacenamiento**: Los PVCs se crean automáticamente. En producción, considera usar StorageClass específicos.

2. **Recursos**: Los límites de recursos están configurados conservadoramente. Ajusta según tu cluster:
   - Prometheus: 512Mi-2Gi RAM
   - Grafana: 256Mi-512Mi RAM
   - OTEL Collector: 256Mi-512Mi RAM

3. **Persistencia**: Prometheus y Grafana usan PVCs. Los datos persisten entre reinicios de pods.

4. **Seguridad**: La contraseña de Grafana está hardcodeada (`admin/admin`). En producción, usa Secrets de Kubernetes.

## 🐛 Troubleshooting

### Pods no inician
```bash
kubectl describe pod <pod-name> -n description-evaluator
kubectl logs <pod-name> -n description-evaluator
```

### Prometheus no recolecta métricas
```bash
# Verificar targets en Prometheus UI
kubectl port-forward -n description-evaluator svc/prometheus 9090:9090
# Ir a http://localhost:9090/targets
```

### Grafana no muestra datos
```bash
# Verificar datasources
kubectl logs -n description-evaluator deployment/grafana
# Verificar que Prometheus esté accesible desde Grafana
kubectl exec -n description-evaluator deployment/grafana -- wget -O- http://prometheus:9090/api/v1/status/config
```

### OTEL Collector no recibe trazas
```bash
# Ver logs del collector
kubectl logs -n description-evaluator deployment/otel-collector -f

# Verificar que el backend puede alcanzar el collector
kubectl exec -n description-evaluator deployment/backend -- nc -zv otel-collector 4317
```
