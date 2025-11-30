# 🎯 Configuración Manual del Dashboard de Grafana

Ya que el provisioning automático está teniendo problemas, aquí están los pasos para configurar manualmente el dashboard:

## Paso 1: Acceder a Grafana

1. Abre http://localhost:3000
2. Login con:
   - Usuario: `admin`
   - Contraseña: `admin`
3. (Opcional) Cambiar contraseña o hacer skip

## Paso 2: Agregar el Datasource de Prometheus

1. Ve al menú lateral → **Connections** → **Data Sources**
2. Click en **Add data source**
3. Busca y selecciona **Prometheus**
4. Configura:
   - **Name**: `Prometheus`
   - **URL**: `http://prometheus:9090`
   - **Access**: `Server (default)`
5. Scroll hasta abajo y click en **Save & Test**
6. Deberías ver "✅ Successfully queried the Prometheus API"

## Paso 3: Importar el Dashboard

### Opción A: Importar desde archivo (MÁS FÁCIL)

1. Ve al menú lateral → **Dashboards**
2. Click en **New** → **Import**
3. Click en **Upload dashboard JSON file**
4. Selecciona el archivo: `/Users/andreleandro/Documents/Description-Evaluator/grafana/dashboard.json`
5. Click en **Load**
6. En **Prometheus**, selecciona el datasource que creaste
7. Click en **Import**

### Opción B: Crear Dashboard Manual

1. Ve a **Dashboards** → **New** → **New Dashboard**
2. Agrega los siguientes paneles:

#### Panel 1: Requests por Endpoint
- Type: Time series
- Query: `sum(rate(app_requests_total[5m])) by (endpoint)`
- Legend: `{{endpoint}}`

#### Panel 2: Tiempo de Respuesta P95
- Type: Time series
- Query: `histogram_quantile(0.95, sum(rate(app_request_duration_seconds_bucket[5m])) by (le, endpoint))`
- Legend: `{{endpoint}} (p95)`

#### Panel 3: CPU por Contenedor
- Type: Time series
- Query: `rate(container_cpu_usage_seconds_total{name=~"backend|frontend|redis"}[5m]) * 100`
- Legend: `{{name}}`
- Unit: Percent (0-100)

#### Panel 4: Memoria por Contenedor
- Type: Time series  
- Query: `container_memory_usage_bytes{name=~"backend|frontend|redis"} / 1024 / 1024`
- Legend: `{{name}}`
- Unit: MB

#### Panel 5: Total Productos Cargados
- Type: Stat
- Query: `app_products_loaded_total`

#### Panel 6: CSV Files Uploaded
- Type: Stat
- Query: `app_csv_files_uploaded_total`

#### Panel 7: Objetos en Cache
- Type: Gauge
- Query: `app_cache_objects_total`

#### Panel 8: Total Requests
- Type: Stat
- Query: `sum(app_requests_total)`

## Paso 4: Verificar que las Métricas Funcionan

Para ver si el backend está exponiendo métricas correctamente:

```bash
# Ver métricas del backend
curl http://localhost:8000/metrics

# Ver métricas de cAdvisor (contenedores)
curl http://localhost:8080/metrics | grep container_cpu

# Ver targets en Prometheus
open http://localhost:9090/targets
```

## Troubleshooting

### Si no ves métricas de la aplicación:

1. Verifica que el backend esté exponiendo métricas:
   ```bash
   curl http://localhost:8000/metrics | grep app_
   ```

2. Verifica que Prometheus esté scrapeando el backend:
   - Ve a http://localhost:9090/targets
   - Busca el target "backend" - debe estar "UP"

3. Haz algunos requests al backend para generar métricas:
   ```bash
   curl http://localhost:10000/
   curl http://localhost:10000/products
   ```

### Si no ves métricas de contenedores:

1. Verifica que cAdvisor esté funcionando:
   ```bash
   curl http://localhost:8080/metrics | head
   ```

2. Ve a http://localhost:9090/targets y verifica que "cadvisor" esté "UP"

## URLs Importantes

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger (Trazas)**: http://localhost:16686
- **cAdvisor**: http://localhost:8080
- **Backend**: http://localhost:10000
- **Backend Metrics**: http://localhost:8000/metrics

## 🐕 ¡Listo para Salvar Perritos!

Una vez configurado, deberías poder ver:
- 📊 Requests procesados en tiempo real
- ⚡ Tiempos de respuesta
- 🖥️ CPU y memoria de contenedores
- 📦 Productos cargados desde DB
- 💾 Objetos en caché Redis
- Y mucho más!
