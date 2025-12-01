#!/bin/bash

# Script para abrir port-forwards a todos los servicios de observabilidad
# Ejecuta este script y deja la terminal abierta

NAMESPACE="description-evaluator"

echo "🔗 Abriendo port-forwards para servicios de observabilidad..."
echo "=============================================================="
echo ""
echo "⚠️  IMPORTANTE: Deja esta terminal abierta para mantener las conexiones"
echo ""

# Función para manejar la limpieza al salir
cleanup() {
    echo ""
    echo "🛑 Cerrando todos los port-forwards..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Grafana
echo "📊 Grafana: http://localhost:3000 (admin/admin)"
kubectl port-forward -n $NAMESPACE svc/grafana 3000:3000 > /dev/null 2>&1 &

# Prometheus
echo "📈 Prometheus: http://localhost:9090"
kubectl port-forward -n $NAMESPACE svc/prometheus 9090:9090 > /dev/null 2>&1 &

# Jaeger
echo "🔍 Jaeger: http://localhost:16686"
kubectl port-forward -n $NAMESPACE svc/jaeger 16686:16686 > /dev/null 2>&1 &

echo ""
echo "✅ Todos los servicios están disponibles!"
echo "=============================================================="
echo ""
echo "Presiona Ctrl+C para cerrar todas las conexiones"
echo ""

# Esperar indefinidamente
wait
