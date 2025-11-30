#!/bin/bash

echo "🧪 Generando tráfico para probar observabilidad..."

# Hacer varias requests para generar métricas
for i in {1..10}; do
    echo "Request $i..."
    curl -s http://localhost:10000/ > /dev/null
    curl -s http://localhost:10000/products > /dev/null
    sleep 0.5
done

echo ""
echo "✅ Tráfico generado!"
echo ""
echo "📊 Verificando métricas del backend:"
curl -s http://localhost:8000/metrics | grep -E "^app_" | grep -v "#"

echo ""
echo "🔗 URLs disponibles:"
echo "  - Backend API:       http://localhost:10000"
echo "  - Backend Metrics:   http://localhost:8000/metrics"
echo "  - Prometheus:        http://localhost:9090"
echo "  - Grafana:           http://localhost:3000 (admin/admin)"
echo "  - Jaeger UI:         http://localhost:16686"
echo "  - cAdvisor:          http://localhost:8080"
echo ""
