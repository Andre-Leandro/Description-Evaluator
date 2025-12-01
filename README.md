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
# Crear cluster con mapeo de puertos para Grafana y Frontend
k3d cluster create tp2-cluster \
  -p "30000:30000@server:0" \
  -p "30080:30080@server:0" \
  --agents 2
```

Este comando:
- Crea un cluster K3s con 1 servidor y 2 agentes
- Mapea el puerto 30000 (Grafana) al localhost
- Mapea el puerto 30080 (Frontend) al localhost

### 2. Construir e Importar Imágenes

```bash
# Opción A: Construir localmente e importar a k3d
cd backend
docker build -t devopsregistrytp.azurecr.io/backend:latest .
k3d image import devopsregistrytp.azurecr.io/backend:latest -c tp2-cluster

cd ../frontend
docker build -t devopsregistrytp.azurecr.io/frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=http://backend:10000 .
k3d image import devopsregistrytp.azurecr.io/frontend:latest -c tp2-cluster

# Opción B: Si las imágenes están en Azure CR, configurar pull secret
kubectl create secret docker-registry acr-secret \
  --docker-server=devopsregistrytp.azurecr.io \
  --docker-username=<USERNAME> \
  --docker-password=<PASSWORD>
```

### 3. Configurar Secretos (Opcional)

Si necesitas conectar a una base de datos externa:

```bash
kubectl create secret generic backend-secrets \
  --from-literal=db_user=your_user \
  --from-literal=db_password=your_password \
  --from-literal=db_host=your_host \
  --from-literal=db_port=5432 \
  --from-literal=db_name=your_db \
  --from-literal=redis_password=""
```

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
# Ver todos los pods
kubectl get pods

# Ver servicios
kubectl get services

# Ver logs del backend
kubectl logs -l app=backend -f
```

---

## 🎯 Guía de Validación TP2

### Accesos

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:30080 | Aplicación web |
| Grafana | http://localhost:30000 | Dashboard de observabilidad |
| Backend (interno) | http://backend:10000 | API (acceso desde dentro del cluster) |

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

1. En Grafana, ve al panel "Traces (Tempo)"
2. Realiza algunas operaciones en la aplicación
3. Verás las trazas con el waterfall de tiempos:
   - `check_redis` - Verificación de cache
   - `redis_get` / `redis_set` - Operaciones de cache
   - `supabase_query` - Consultas a la base de datos

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
# Ver eventos del cluster
kubectl get events --sort-by=.lastTimestamp

# Ver recursos utilizados
kubectl top pods

# Reiniciar deployment
kubectl rollout restart deployment/<deployment-name>
```
