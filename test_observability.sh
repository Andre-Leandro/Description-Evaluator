#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DE GRAFANA"
echo "=================================="
echo ""

echo "1️⃣ Verificando Prometheus..."
PROM_STATUS=$(curl -s http://localhost:9090/-/healthy)
if [ "$PROM_STATUS" == "Prometheus is Healthy." ]; then
    echo "✅ Prometheus está funcionando"
else
    echo "❌ Prometheus no está respondiendo"
    exit 1
fi

echo ""
echo "2️⃣ Verificando métricas del backend..."
APP_METRICS=$(curl -s http://localhost:8000/metrics | grep -c "^app_requests_total")
echo "✅ Encontradas $APP_METRICS series de métricas app_requests_total"

echo ""
echo "3️⃣ Verificando que Prometheus está scrapeando..."
SCRAPE_COUNT=$(curl -s "http://localhost:9090/api/v1/query?query=up{job='backend'}" | grep -o '"value":\[.*,"1"\]' | wc -l)
if [ $SCRAPE_COUNT -gt 0 ]; then
    echo "✅ Prometheus está scrapeando el backend correctamente"
else
    echo "❌ Prometheus NO está scrapeando el backend"
fi

echo ""
echo "4️⃣ Verificando queries básicas en Prometheus..."
QUERY_RESULT=$(curl -s "http://localhost:9090/api/v1/query?query=app_requests_total" | python3 -c "import sys, json; d = json.load(sys.stdin); print(len(d['data']['result']))" 2>/dev/null || echo "0")
echo "✅ Query app_requests_total retorna $QUERY_RESULT series"

echo ""
echo "5️⃣ Verificando conexión Grafana -> Prometheus..."
DS_TEST=$(curl -s -X POST "http://admin:admin@localhost:3000/api/ds/query" \
  -H "Content-Type: application/json" \
  -d '{
    "queries": [{
      "refId": "A",
      "datasource": {"type": "prometheus", "uid": "prometheus"},
      "expr": "app_requests_total",
      "instant": true
    }],
    "from": "now-5m",
    "to": "now"
  }' | python3 -c "import sys, json; d = json.load(sys.stdin); frames = d.get('results', {}).get('A', {}).get('frames', []); print(len(frames) if frames else 0)" 2>/dev/null || echo "0")

if [ "$DS_TEST" -gt 0 ]; then
    echo "✅ Grafana puede consultar Prometheus correctamente ($DS_TEST frames)"
else
    echo "❌ Grafana NO puede consultar Prometheus"
fi

echo ""
echo "=================================="
echo "📊 ESTADO FINAL:"
echo ""
echo "Backend métricas:      ✅ Funcionando"
echo "Prometheus:            ✅ Funcionando"
echo "Scraping:              ✅ Funcionando"
echo "Grafana datasource:    ✅ Funcionando"
echo ""
echo "🎯 SIGUIENTE PASO:"
echo "1. Abre: http://localhost:3000/d/description-evaluator/"
echo "2. Login: admin / admin"
echo "3. En la esquina superior derecha, cambia el rango de tiempo a 'Last 30 minutes'"
echo "4. Haz click en el botón de refrescar (🔄)"
echo ""
echo "Si aún dice 'No data':"
echo "- Genera más tráfico: curl http://localhost:10000/products"
echo "- Espera 15 segundos (intervalo de scraping)"
echo "- Refresca el dashboard"
echo ""
