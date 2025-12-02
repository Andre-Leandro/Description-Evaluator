# SmartCatalog

Una aplicación web moderna para evaluar y analizar descripciones utilizando tecnologías de vanguardia y arquitectura containerizada.

## Arquitectura del Proyecto

Este proyecto implementa una arquitectura de microservicios completa con:

- **Frontend**: Next.js 15 con React 19 y Tailwind CSS
- **Backend**: Python (Flask/FastAPI)
- **Base de Datos**: Redis para cacheo y almacenamiento rápido
- **Infraestructura**: Docker y Docker Compose
- **Integración**: Supabase para servicios adicionales

## Tecnologías Utilizadas

### Frontend

- **Next.js 15.3.5** - Framework React con soporte para Turbopack
- **React 19** - Biblioteca de interfaz de usuario
- **Tailwind CSS 4** - Framework de CSS utilitario
- **Radix UI** - Componentes accesibles y primitivos
- **Lucide React** - Iconos modernos
- **Recharts** - Gráficos y visualizaciones de datos
- **Supabase** - Backend como servicio

### Backend

- **Python** - Lenguaje de programación principal
- **Redis** - Base de datos en memoria para cacheo
- **OpenTelemetry** - Instrumentación para observabilidad

### DevOps

- **Docker** - Containerización
- **Docker Compose** - Orquestación de contenedores
- **Kubernetes (k3d/K3s)** - Orquestación en cluster local
- **GitHub Actions** - CI/CD automatizado
- **Azure Container Instances** - Hosting en la nube
- **Azure Container Registry** - Registro de imágenes Docker

### Observabilidad

- **Grafana** - Visualización de métricas y trazas
- **Prometheus** - Recolección de métricas
- **Tempo** - Almacenamiento de trazas distribuidas
- **OpenTelemetry Collector** - Pipeline de telemetría

## 📁 Estructura del Proyecto

```
Description-Evaluator/
├── .github/                    # Configuración de GitHub Actions
├── backend/                    # Aplicación Python
├── frontend/                   # Aplicación Next.js
├── k8s/                        # Manifiestos de Kubernetes
│   ├── app/                    # Aplicación (backend, frontend, redis)
│   │   ├── backend.yaml
│   │   ├── frontend.yaml
│   │   └── redis.yaml
│   └── observability/          # Stack de observabilidad
│       ├── grafana.yaml
│       ├── otel-collector.yaml
│       ├── prometheus.yaml
│       └── tempo.yaml
├── .env.example               # Variables de entorno de ejemplo
├── .gitignore                 # Archivos ignorados por Git
├── docker-compose.yml         # Configuración de Docker Compose
└── README.md                  # Este archivo
```

---

## 🚀 TP2 DevOps - Despliegue con k3d (K3s en Docker)

### Prerrequisitos

- Docker instalado y ejecutándose
- k3d instalado (`curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash`)
- kubectl instalado

### 1. Crear el Cluster k3d

```bash
# Crear cluster con mapeo de puertos para Grafana, Frontend y Backend
k3d cluster create tp2-cluster \
  -p "30000:30000@server:0" \
  -p "30080:30080@server:0" \
  -p "30100:30100@server:0" \
  --agents 2
```

Este comando:

- Crea un cluster K3s con 1 servidor y 2 agentes (workers)
- Mapea el puerto **30000** (Grafana) al localhost
- Mapea el puerto **30080** (Frontend) al localhost
- Mapea el puerto **30100** (Backend) al localhost
- Los agentes proporcionan alta disponibilidad distribuyendo los pods

**⚠️ IMPORTANTE**: Es crítico exponer estos 3 puertos al crear el cluster. Si olvidas alguno, deberás recrear el cluster completo.

**🔧 Problema Común - host.docker.internal**:
Si kubectl falla con errores de conexión a `host.docker.internal`, ejecuta:

```bash
# Obtener el puerto del API server
docker ps --filter "name=k3d-tp2-cluster-serverlb" --format "{{.Ports}}"
# Busca el puerto mapeado a 6443, ejemplo: 0.0.0.0:xxxxx->6443/tcp

# Configurar kubectl para usar 0.0.0.0 en lugar de host.docker.internal
kubectl config set-cluster k3d-tp2-cluster --server=https://0.0.0.0:<PUERTO> --insecure-skip-tls-verify=true

# Verificar que funciona
kubectl get nodes
```

### 2. Construir e Importar Imágenes

```bash
# Construir la imagen del backend
cd backend
docker build -t devopsregistrytp.azurecr.io/backend:latest .

# Construir la imagen del frontend
# IMPORTANTE: Usar localhost:30100 para que el navegador pueda acceder al backend
cd ../frontend
docker build -t devopsregistrytp.azurecr.io/frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:30100 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://illglqdcmfjqktkyxhhh.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_GvcxsZEZvkvsrDj6qhlbkw_2Gb8sFF6 \
  .

# Importar ambas imágenes al cluster k3d
cd ..
k3d image import devopsregistrytp.azurecr.io/backend:latest devopsregistrytp.azurecr.io/frontend:latest -c tp2-cluster
```

**📝 Notas importantes**:

- El frontend se ejecuta en el navegador (lado cliente), por eso necesita `http://localhost:30100`
- Si usas `http://backend:10000`, el navegador no podrá resolver ese nombre DNS interno de Kubernetes
- Las variables de Supabase son opcionales para funcionalidad básica
- La importación de imágenes puede tardar varios minutos

### 3. Configurar Secretos

El backend necesita credenciales para conectarse a la base de datos Supabase y Redis:

```bash
kubectl create secret generic backend-secrets \
  --from-literal=user=postgres.illglqdcmfjqktkyxhhh \
  --from-literal=password=Strata-ce-2025 \
  --from-literal=host=aws-0-us-east-2.pooler.supabase.com \
  --from-literal=port=6543 \
  --from-literal=dbname=postgres \
  --from-literal=REDIS_PASSWORD=""
```

**📝 Variables de entorno**:

- `user`, `password`, `host`, `port`, `dbname`: Credenciales de Supabase PostgreSQL
- `REDIS_PASSWORD`: Contraseña de Redis (vacía para desarrollo local)
- Los nombres de las variables deben coincidir exactamente con lo que espera el código del backend
- Si usas tu propia base de datos, reemplaza estos valores con los tuyos del archivo `.env`

### 4. Desplegar el Stack de Observabilidad

```bash
# Aplicar todos los manifiestos de observabilidad
kubectl apply -f k8s/observability/

# Verificar que los pods estén corriendo
kubectl get pods -l 'app in (tempo,prometheus,otel-collector,grafana)'
```

### 5. Desplegar la Aplicación

```bash
# Aplicar todos los manifiestos de la aplicación
kubectl apply -f k8s/app/

# Verificar que los pods estén corriendo
kubectl get pods -l 'app in (redis,backend,frontend)'
```

### 6. Verificar el Despliegue

```bash
# Ver todos los pods (deben estar Running y Ready 1/1)
kubectl get pods

# Ver servicios con sus puertos
kubectl get services

# Verificar que los 3 puertos estén expuestos en Docker
docker ps --filter "name=k3d-tp2-cluster-serverlb" --format "table {{.Names}}\t{{.Ports}}"
# Deberías ver: 30000->30000, 30080->30080, 30100->30100

# Ver logs del backend
kubectl logs -l app=backend -f

# Si los pods del backend no están Ready, verificar logs
kubectl logs -l app=backend --tail=50
```

**🔍 Tiempos de inicio esperados**:

- Redis, Prometheus, Tempo: ~10-15 segundos
- Grafana: ~20-30 segundos (carga dashboards)
- Backend: ~30-45 segundos (conecta a DB, inicializa OpenTelemetry)
- Frontend: ~15-20 segundos

**⚠️ Si el backend tiene RESTARTS > 0**:
Los reinicios pueden ocurrir durante el inicio si:

1. Redis aún no está listo cuando el backend intenta conectarse
2. La base de datos Supabase tarda en responder
3. Límites de memoria (512Mi) temporalmente excedidos durante inicialización

Esto es normal en el primer despliegue. Kubernetes reiniciará automáticamente el pod y eventualmente quedará estable.

---

## 🎯 Guía de Validación TP2

### Accesos

| Servicio   | URL                    | Descripción                 | Visible en Docker Desktop |
| ---------- | ---------------------- | --------------------------- | ------------------------- |
| Frontend   | http://localhost:30080 | Aplicación web              | ✅ Puerto 30080           |
| Backend    | http://localhost:30100 | API REST                    | ✅ Puerto 30100           |
| Grafana    | http://localhost:30000 | Dashboard de observabilidad | ✅ Puerto 30000           |
| Prometheus | (interno)              | Métricas                    | ❌ Solo ClusterIP         |
| Tempo      | (interno)              | Trazas                      | ❌ Solo ClusterIP         |
| Redis      | (interno)              | Cache                       | ❌ Solo ClusterIP         |

**📝 Notas**:

- Los 3 servicios principales (Frontend, Backend, Grafana) están expuestos como **NodePort** y son accesibles desde tu máquina
- Puedes verlos en Docker Desktop en el contenedor `k3d-tp2-cluster-serverlb` con los puertos 30000, 30080 y 30100
- Los servicios internos (Prometheus, Tempo, Redis) usan **ClusterIP** y solo son accesibles dentro del cluster
- Si un servicio no responde, verifica que los pods estén Running con `kubectl get pods`

### Credenciales Grafana

- Usuario: `admin`
- Contraseña: `admin`

### Validar Alta Disponibilidad (HA)

1. **Verificar réplicas del backend:**

   ```bash
   kubectl get pods -l app=backend
   # Deberías ver 2 pods backend-xxxx corriendo
   ```

2. **Probar el Crash Test:**

   - Accede a http://localhost:30080
   - En el menú lateral, haz clic en "🔥 Crash Test"
   - Confirma la acción

3. **Observar en Grafana:**

   - Accede a http://localhost:30000
   - Ve al dashboard "TP2 DevOps Monitor"
   - Observa:
     - **Memory Usage by Pod**: Verás cómo la memoria sube hasta el límite (512Mi)
     - **Pod Restarts**: Se incrementará el contador
     - **Running Backend Pods**: Momentáneamente bajará a 1 y luego volverá a 2

4. **Verificar recuperación automática:**

   ```bash
   # Ver eventos del pod crasheado
   kubectl get events --sort-by=.lastTimestamp | grep OOMKilled

   # Ver que Kubernetes reinició el pod
   kubectl get pods -l app=backend
   ```

### Validar Limpieza de Cache

1. En el menú lateral, haz clic en "🗑️ Vaciar Redis"
2. Confirma la acción
3. El cache de Redis se limpiará (FLUSHALL)

### Validar Trazas en Tempo

1. En Grafana (http://localhost:30000), ve al dashboard "TP2 DevOps Monitor"
2. Desplázate hasta los paneles de trazas:
   - **Application Traces (Products & Votes)**: Vista principal de todas las trazas de endpoints de negocio
   - **Product Listing Traces**: Trazas específicas del endpoint GET /products
   - **Vote Registration Traces**: Trazas específicas del endpoint POST /vote
3. Realiza algunas operaciones en la aplicación (consultar productos, votar)
4. Espera ~5-10 segundos para que las trazas se procesen
5. Verás las trazas con información detallada:
   - **Nombre del span**: `get_products`, `register_vote`, `check_redis`, `redis_get`, `supabase_query`, etc.
   - **Duración**: Tiempo que tomó cada operación
   - **TraceID**: Identificador único para correlacionar spans relacionados

**🔍 Para ver más detalles**:

- Click en "Explore" (ícono de brújula) en el menú lateral
- Selecciona "Tempo" como datasource
- En "Query type" selecciona "Search"
- Filtra por `service.name = "backend-service"`
- Haz clic en cualquier traza para ver el **waterfall completo** con todos los spans anidados y sus tiempos

**📊 Spans esperados**:

- `get_products`: Endpoint principal para listar productos
  - `check_redis`: Verifica si hay datos en cache
  - `redis_get`: Obtiene datos del cache (si hay hit)
  - `supabase_query`: Consulta la base de datos (si cache miss)
  - `redis_set`: Guarda en cache los datos obtenidos
- `register_vote`: Endpoint para registrar votos
  - `supabase_insert`: Inserta el voto en la base de datos
  - `redis_cache_invalidation`: Invalida el cache de productos

**⚠️ Si no ves trazas**:

1. Verifica que el pod `otel-collector` esté Running: `kubectl get pods -l app=otel-collector`
2. Verifica que el pod `tempo` esté Running: `kubectl get pods -l app=tempo`
3. Haz algunas peticiones al backend: `curl http://localhost:30100/products`
4. Espera 10-15 segundos para el procesamiento de trazas
5. Refresca el dashboard en Grafana

---

## 🛠️ Instalación y Configuración (Docker Compose)

### Prerrequisitos

- Docker y Docker Compose instalados
- Node.js 18+ (para desarrollo local)
- Python 3.8+ (para desarrollo local)

### Configuración con Docker (Recomendado)

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/Andre-Leandro/Description-Evaluator.git
   cd Description-Evaluator
   ```

2. **Configura las variables de entorno:**

   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones
   ```

3. **Ejecuta la aplicación:**

   ```bash
   docker-compose up -d
   ```

4. **Accede a la aplicación:**
   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:10000`
   - Redis: `localhost:6379`

### Despliegue Automático

El proyecto incluye CI/CD automatizado con GitHub Actions que:

1. **Se activa automáticamente** al hacer push a la rama `docker`
2. **Build y Push** de imágenes Docker a Azure Container Registry
3. **Deploy automático** a Azure Container Instances
4. **Configuración de servicios**:
   - Redis como cache distribuido
   - Backend con conexión a base de datos y Redis
   - Frontend conectado al backend desplegado

**Rama de deploy**: `docker` (push automático despliega a producción)

### Desarrollo Local

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

## 🚀 Aplicación Desplegada

La aplicación está desplegada en Azure Container Instances y disponible en las siguientes URLs:

### Enlaces de Producción

- **💻 Frontend (Aplicación Principal)**:

  - `http://frontend-tp-devops.eastus.azurecontainer.io`

- **🖥️ Backend (API)**:

  - `http://backend-tp-devops.eastus.azurecontainer.io:10000`

- **💾 Redis (Cache)**:
  - Host: `redis-tp-devops.eastus.azurecontainer.io`
  - Puerto: `6379`

### 💻 Conexión a Redis por Consola

Para conectarte al Redis desplegado desde tu terminal:

```bash
# Conectar usando redis-cli
redis-cli -h redis-tp-devops.eastus.azurecontainer.io -p 6379 -a $REDIS_PASSWORD
```

---

## 🔧 Comandos Útiles

### k3d

```bash
# Listar clusters
k3d cluster list

# Eliminar cluster
k3d cluster delete tp2-cluster

# Importar imagen al cluster
k3d image import <image-name> -c tp2-cluster
```

### kubectl

```bash
# Ver pods con más detalles
kubectl get pods -o wide

# Describir un pod específico
kubectl describe pod <pod-name>

# Ver logs en tiempo real
kubectl logs -f <pod-name>

# Ejecutar comando en un pod
kubectl exec -it <pod-name> -- /bin/sh

# Port forward para debugging
kubectl port-forward svc/backend 10000:10000
```

### Troubleshooting

```bash
# Ver eventos del cluster (útil para diagnosticar problemas)
kubectl get events --sort-by=.lastTimestamp

# Ver recursos utilizados por los pods
kubectl top pods

# Reiniciar un deployment si está con problemas
kubectl rollout restart deployment/<deployment-name>

# Ver detalles de un pod específico (errores, eventos, estado)
kubectl describe pod <pod-name>

# Acceder a un pod para debugging
kubectl exec -it <pod-name> -- /bin/sh
```

## 🐛 Problemas Comunes y Soluciones

### 1. Error: "Unable to connect to the server: dial tcp host.docker.internal"

**Problema**: kubectl no puede conectarse al cluster porque intenta usar `host.docker.internal` que no resuelve correctamente en Windows.

**Solución**:

```bash
# Paso 1: Obtener el puerto correcto
docker ps --filter "name=k3d-tp2-cluster-serverlb" --format "{{.Ports}}"
# Busca algo como: 0.0.0.0:xxxxx->6443/tcp (el xxxxx es tu puerto)

# Paso 2: Reconfigurar kubectl
kubectl config set-cluster k3d-tp2-cluster --server=https://0.0.0.0:xxxxx --insecure-skip-tls-verify=true

# Paso 3: Verificar
kubectl get nodes
```

### 2. Frontend no puede conectarse al Backend

**Problema**: El frontend muestra errores de "Failed to fetch" o "Network error".

**Causas y soluciones**:

**a) Puerto del backend no expuesto**:

```bash
# Verificar puertos expuestos
docker ps --filter "name=k3d-tp2-cluster-serverlb"

# Si falta el puerto 30100, debes recrear el cluster:
k3d cluster delete tp2-cluster
k3d cluster create tp2-cluster -p "30000:30000@server:0" -p "30080:30080@server:0" -p "30100:30100@server:0" --agents 2
# Luego volver a desplegar todo
```

**b) Frontend construido con URL incorrecta**:

```bash
# Reconstruir frontend con URL correcta
cd frontend
docker build -t devopsregistrytp.azurecr.io/frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:30100 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://illglqdcmfjqktkyxhhh.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_GvcxsZEZvkvsrDj6qhlbkw_2Gb8sFF6 \
  .

# Reimportar e imagen
k3d image import devopsregistrytp.azurecr.io/frontend:latest -c tp2-cluster

# Reiniciar frontend
kubectl rollout restart deployment frontend
```

### 3. Pods del Backend en estado CrashLoopBackOff

**Problema**: Los pods del backend se reinician constantemente.

**Diagnóstico**:

```bash
# Ver logs del pod con errores
kubectl logs -l app=backend --tail=100

# Ver descripción del pod para ver el motivo del reinicio
kubectl describe pod -l app=backend | grep -A 10 "Last State"
```

**Causas comunes**:

- **Variables de entorno faltantes**: Verifica que el secret `backend-secrets` existe y tiene las variables correctas
- **Redis no disponible**: Espera a que Redis esté Running antes de que el backend inicie
- **Límite de memoria excedido (OOMKilled)**: Aumenta el límite de memoria en `k8s/app/backend.yaml`

**Soluciones**:

```bash
# Verificar secret
kubectl get secret backend-secrets
kubectl describe secret backend-secrets

# Recrear secret si es necesario
kubectl delete secret backend-secrets
kubectl create secret generic backend-secrets \
  --from-literal=user=postgres.illglqdcmfjqktkyxhhh \
  --from-literal=password=Strata-ce-2025 \
  --from-literal=host=aws-0-us-east-2.pooler.supabase.com \
  --from-literal=port=6543 \
  --from-literal=dbname=postgres \
  --from-literal=REDIS_PASSWORD=""

# Reiniciar backend
kubectl rollout restart deployment backend
```

### 4. Grafana no responde en localhost:30000

**Problema**: Curl a localhost:30000 devuelve "Empty reply from server" o timeout.

**Diagnóstico**:

```bash
# Ver estado del pod
kubectl get pods -l app=grafana

# Ver logs para errores
kubectl logs -l app=grafana --tail=50
```

**Soluciones**:

**a) Pod no está Ready todavía**:

```bash
# Esperar a que el pod esté Running y Ready
kubectl get pods -l app=grafana -w
# Espera hasta ver 1/1 en READY
```

**b) Dashboard con configuración inválida**:

```bash
# Reiniciar Grafana
kubectl rollout restart deployment grafana

# Si persiste, verificar el ConfigMap
kubectl get configmap grafana-dashboard-tp2 -o yaml | grep -i "error"
```

### 5. No se ven trazas en Grafana/Tempo

**Problema**: Los paneles de trazas en Grafana están vacíos.

**Verificaciones**:

```bash
# 1. Verificar que OpenTelemetry Collector está corriendo
kubectl get pods -l app=otel-collector

# 2. Verificar que Tempo está corriendo
kubectl get pods -l app=tempo

# 3. Ver logs del collector para verificar que recibe trazas
kubectl logs -l app=otel-collector --tail=100 | grep "TracesExporter"

# 4. Hacer peticiones al backend para generar trazas
curl http://localhost:30100/products
curl http://localhost:30100/products

# 5. Esperar 10-15 segundos y refrescar Grafana
```

### 6. Imágenes no se importan correctamente a k3d

**Problema**: Al aplicar los manifiestos, los pods quedan en estado `ImagePullBackOff`.

**Solución**:

```bash
# Verificar que las imágenes están construidas localmente
docker images | grep devopsregistrytp.azurecr.io

# Si no existen, construirlas:
cd backend
docker build -t devopsregistrytp.azurecr.io/backend:latest .
cd ../frontend
docker build -t devopsregistrytp.azurecr.io/frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:30100 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://illglqdcmfjqktkyxhhh.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_GvcxsZEZvkvsrDj6qhlbkw_2Gb8sFF6 \
  .

# Importar al cluster
cd ..
k3d image import devopsregistrytp.azurecr.io/backend:latest devopsregistrytp.azurecr.io/frontend:latest -c tp2-cluster

# Si los pods ya están creados con error, eliminarlos para que se recreen
kubectl delete pods -l app=backend
kubectl delete pods -l app=frontend
```

### 7. "No space left on device" durante k3d image import

**Problema**: Error durante la importación de imágenes por falta de espacio.

**Solución**:

```bash
# Limpiar imágenes Docker no utilizadas
docker system prune -a --volumes

# Limpiar cache de build
docker builder prune -a

# Si tienes múltiples clusters k3d, elimina los que no uses
k3d cluster list
k3d cluster delete <nombre-cluster-viejo>
```

### 8. Alta latencia o timeout en peticiones

**Problema**: Las peticiones al backend son muy lentas o fallan con timeout.

**Diagnóstico**:

```bash
# Ver consumo de recursos
kubectl top pods

# Ver si hay limits alcanzados
kubectl describe pod -l app=backend | grep -A 5 "Limits"
```

**Soluciones**:

- Aumentar los límites de CPU/memoria en los manifiestos
- Verificar conectividad con Supabase: `kubectl exec -it <backend-pod> -- curl https://aws-0-us-east-2.pooler.supabase.com`
- Verificar logs del backend para errores de conexión a DB o Redis

---

## 📚 Recursos Adicionales

- [Documentación de k3d](https://k3d.io/)
- [Documentación de Kubernetes](https://kubernetes.io/docs/)
- [OpenTelemetry Python](https://opentelemetry.io/docs/instrumentation/python/)
- [Grafana Tempo](https://grafana.com/docs/tempo/latest/)
- [Prometheus](https://prometheus.io/docs/introduction/overview/)

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es parte de un trabajo académico para la materia DevOps.
