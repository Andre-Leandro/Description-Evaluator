#!/bin/bash

# Script para desplegar el stack completo de observabilidad en Kubernetes
# Ejecutar desde el directorio k8s/

set -e

NAMESPACE="description-evaluator"

echo "🚀 Desplegando Stack de Observabilidad en Kubernetes"
echo "=================================================="
echo ""

# Función para verificar que el namespace existe
check_namespace() {
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        echo "❌ Error: El namespace '$NAMESPACE' no existe."
        echo "   Crea el namespace primero con: kubectl apply -f namespace.yaml"
        exit 1
    fi
    echo "✅ Namespace '$NAMESPACE' encontrado"
}

# Verificar namespace
check_namespace

# 1. Aplicar ConfigMaps
echo ""
echo "📦 Aplicando ConfigMaps..."
kubectl apply -f observability-configmaps.yaml

# 2. Desplegar componentes de telemetría (OpenTelemetry Collector y Jaeger)
echo ""
echo "📊 Desplegando OpenTelemetry Collector y Jaeger..."
kubectl apply -f observability-telemetry.yaml

# 3. Desplegar Prometheus
echo ""
echo "📈 Desplegando Prometheus..."
kubectl apply -f observability-prometheus.yaml

# 4. Desplegar Grafana
echo ""
echo "📉 Desplegando Grafana..."
kubectl apply -f observability-grafana.yaml

# 5. Desplegar Redis Exporter
echo ""
echo "🔍 Desplegando Redis Exporter..."
kubectl apply -f observability-redis-exporter.yaml

# Esperar a que los pods estén listos
echo ""
echo "⏳ Esperando a que los pods de observabilidad estén listos..."
echo ""

kubectl wait --for=condition=ready pod -l tier=observability -n $NAMESPACE --timeout=120s || true

# Mostrar estado de los pods
echo ""
echo "📊 Estado de los pods de observabilidad:"
kubectl get pods -n $NAMESPACE -l tier=observability

# Mostrar los servicios
echo ""
echo "🌐 Servicios de observabilidad desplegados:"
kubectl get svc -n $NAMESPACE | grep -E "prometheus|grafana|jaeger|otel-collector|redis-exporter"

echo ""
echo "✅ Stack de Observabilidad desplegado exitosamente!"
echo ""
echo "🔗 Acceso a los servicios (port-forward):"
echo "=================================================="
echo ""
echo "Grafana (Dashboard principal):"
echo "  kubectl port-forward -n $NAMESPACE svc/grafana 3000:3000"
echo "  URL: http://localhost:3000"
echo "  Usuario: admin / Contraseña: admin"
echo ""
echo "Prometheus (Métricas):"
echo "  kubectl port-forward -n $NAMESPACE svc/prometheus 9090:9090"
echo "  URL: http://localhost:9090"
echo ""
echo "Jaeger (Trazas distribuidas):"
echo "  kubectl port-forward -n $NAMESPACE svc/jaeger 16686:16686"
echo "  URL: http://localhost:16686"
echo ""
echo "=================================================="
