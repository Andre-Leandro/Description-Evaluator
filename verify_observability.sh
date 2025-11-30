#!/bin/bash

echo "================================================"
echo "🎯 VERIFICACIÓN DE OBSERVABILIDAD"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar servicio
check_service() {
    local name=$1
    local url=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - $url"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - $url"
        return 1
    fi
}

echo "🔍 Verificando servicios principales..."
echo ""
check_service "Backend API        " "http://localhost:10000/"
check_service "Backend Metrics    " "http://localhost:8000/metrics"
check_service "Frontend           " "http://localhost:80/"
echo ""

echo "📊 Verificando stack de observabilidad..."
echo ""
check_service "Prometheus         " "http://localhost:9090/-/healthy"
check_service "Grafana            " "http://localhost:3000/api/health"
check_service "Jaeger UI          " "http://localhost:16686/"
check_service "cAdvisor           " "http://localhost:8080/healthz"
check_service "Redis Exporter     " "http://localhost:9121/metrics"
check_service "OTel Collector     " "http://localhost:8889/metrics"
echo ""

echo "================================================"
echo "📈 MÉTRICAS DE LA APLICACIÓN"
echo "================================================"
echo ""
echo "🔢 Métricas disponibles en el backend:"
curl -s http://localhost:8000/metrics | grep "^app_" | grep -v "#" | head -10
echo ""

echo "================================================"
echo "🎯 TARGETS DE PROMETHEUS"
echo "================================================"
echo ""
targets=$(curl -s http://localhost:9090/api/v1/targets 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    active = data['data']['activeTargets']
    for t in active:
        status = '✅' if t['health'] == 'up' else '❌'
        print(f\"{status} {t['labels']['job']:20} {t['labels']['instance']}\")
except:
    print('⏳ Prometheus aún iniciando...')
")
echo "$targets"
echo ""

echo "================================================"
echo "🔗 URLS DE ACCESO"
echo "================================================"
echo ""
echo "📱 Aplicación:"
echo "   • Backend:     http://localhost:10000"
echo "   • Frontend:    http://localhost:80"
echo ""
echo "📊 Observabilidad:"
echo "   • Grafana:     http://localhost:3000 (admin/admin)"
echo "   • Prometheus:  http://localhost:9090"
echo "   • Jaeger:      http://localhost:16686"
echo "   • cAdvisor:    http://localhost:8080"
echo ""
echo "🔧 Métricas:"
echo "   • Backend:     http://localhost:8000/metrics"
echo "   • Redis:       http://localhost:9121/metrics"
echo "   • OTel:        http://localhost:8889/metrics"
echo ""

echo "================================================"
echo "✅ VERIFICACIÓN COMPLETA"
echo "================================================"
echo ""
echo "Para ver el dashboard de Grafana:"
echo "  1. Abre http://localhost:3000"
echo "  2. Login: admin/admin"
echo "  3. Ve a Dashboards → Description Evaluator"
echo ""
echo "Para generar más tráfico:"
echo "  ./test_metrics.sh"
echo ""
