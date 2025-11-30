# 🎬 DEMO DE KUBERNETES - HIGH AVAILABILITY

Demo completa de orquestación Kubernetes con k3d mostrando alta disponibilidad y auto-recuperación.

---

## 📋 GUIÓN DE LA DEMO

### **PASO 0: Limpieza Total** 🧹

Empezamos desde cero para mostrar todo el proceso.

```bash
# Ver si hay clusters existentes
k3d cluster list

# Eliminar el cluster (si existe)
k3d cluster delete description-evaluator

# Verificar que se eliminó
docker ps
kubectl get nodes 2>&1 | head -5
```

**🎤 EXPLICAR:** "Vamos a empezar desde cero. Actualmente no hay ningún cluster de Kubernetes corriendo."

---

### **PASO 1: Crear el Cluster de Kubernetes** 🏗️

Creamos un cluster con 1 nodo master y 3 workers.

```bash
k3d cluster create description-evaluator \
  --servers 1 \
  --agents 3 \
  --port "8080:80@loadbalancer" \
  -p "10000:30000@agent:0"
```

**🎤 EXPLICAR:** 
- "Estoy creando un cluster de Kubernetes con k3d (Kubernetes en Docker)"
- "1 servidor = nodo maestro que controla todo"
- "3 agentes = nodos trabajadores donde corren las aplicaciones"
- "Puerto 8080 para el frontend y 10000 para el backend API"

**⏱️ ESPERAR:** ~30 segundos

---

### **PASO 2: Verificar la Infraestructura** 🔍

```bash
# Ver los nodos de Kubernetes
kubectl get nodes -o wide

# Ver los contenedores Docker que representan los nodos
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**🎤 EXPLICAR:** 
- "Aquí vemos los 4 nodos: 1 servidor y 3 agentes, todos Ready"
- "Cada nodo es en realidad un contenedor Docker. Así simulamos un cluster real en mi Mac"

---

### **PASO 3: Importar las Imágenes** 📦

```bash
# Ver las imágenes Docker disponibles localmente
docker images | grep -E "backend|frontend"

# Importar las imágenes al cluster de k3d
k3d image import \
  devopsregistrytp.azurecr.io/backend:latest \
  devopsregistrytp.azurecr.io/frontend:latest \
  -c description-evaluator
```

**🎤 EXPLICAR:** 
- "Tenemos las imágenes Docker del backend (Flask + Python) y frontend (Next.js)"
- "Las importamos al cluster para que los nodos puedan usarlas sin descargar de internet"

**⏱️ ESPERAR:** ~25 segundos

---

### **PASO 4: Crear los Secrets** 🔐

```bash
# Mostrar el archivo .env (SIN las credenciales reales)
echo "📄 Variables de entorno configuradas en .env:"
cat ../.env | grep -E "POSTGRES_|REDIS_" | sed 's/=.*/=***OCULTO***/'

# Crear el Secret desde el .env
./create-secrets.sh

# Verificar que el Secret se creó (sin mostrar los valores)
kubectl get secrets -n description-evaluator
```

**🎤 EXPLICAR:** 
- "Por seguridad, las credenciales de la base de datos NO están en el código"
- "Las cargo desde un archivo .env local usando un script"
- "Así puedo subir mi código a GitHub sin exponer passwords"

---

### **PASO 5: Desplegar la Aplicación** 🚀

```bash
# Crear el namespace
kubectl apply -f namespace.yaml

# Desplegar todos los componentes
kubectl apply -f redis-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml

echo ""
echo "⏳ Esperando que los pods arranquen..."
sleep 15
```

**🎤 EXPLICAR:** 
- "Namespace = espacio aislado para nuestra app"
- "Redis = caché en memoria"
- "Backend = 3 réplicas de la API (Flask + PostgreSQL)"
- "Frontend = 2 réplicas de la interfaz web (Next.js)"
- "Ingress = puerta de entrada (enrutamiento HTTP)"
- "HPA = Horizontal Pod Autoscaler (escala automáticamente)"
- "PDB = Pod Disruption Budget (garantiza disponibilidad)"

---

### **PASO 6: Ver la Distribución de Pods** 🗺️

```bash
# Ver todos los pods y en qué nodo están corriendo
kubectl get pods -n description-evaluator -o wide

echo ""
echo "📊 Distribución por nodo:"
kubectl get pods -n description-evaluator -o custom-columns=\
POD:.metadata.name,\
STATUS:.status.phase,\
NODE:.spec.nodeName,\
IP:.status.podIP
```

**🎤 EXPLICAR:** 
- "Fijate que los 3 backends están distribuidos en diferentes nodos (anti-affinity)"
- "Lo mismo con los 2 frontends"
- "Esto es clave para alta disponibilidad: si cae un nodo, los otros siguen funcionando"

---

### **PASO 7: Verificar que la App Funciona** ✅

```bash
# Health check del backend
echo "🏥 Health check del backend:"
curl -s http://localhost:10000/health | jq .

echo ""
echo "📦 Cantidad de productos en la BD:"
curl -s http://localhost:10000/products | jq '.products | length'

echo ""
echo "🌐 Abriendo la aplicación en el navegador..."
open http://localhost:8080
```

**🎤 EXPLICAR:** 
- "El backend está conectado a PostgreSQL en Supabase"
- "Tenemos 1775 productos cargados"
- "La app web está funcionando perfectamente"

**💡 MOSTRAR EN EL NAVEGADOR:** Navegar por la aplicación, cargar productos, etc.

---

### **PASO 8: Ver los Recursos y Autoscaling** 📈

```bash
# Ver el estado del HPA (Horizontal Pod Autoscaler)
kubectl get hpa -n description-evaluator

echo ""
echo "📊 Uso de recursos por pod:"
kubectl top pods -n description-evaluator
```

**🎤 EXPLICAR:** 
- "El HPA monitorea el uso de CPU y memoria"
- "Si la memoria sube a 70%, crea más pods automáticamente"
- "Ahora mismo estamos en ~40%, tranqui"

---

### **PASO 9: 🎯 LA MAGIA - Saturar Memoria y Ver Auto-Recuperación** 💥

```bash
echo "🎯 DEMO DE ALTA DISPONIBILIDAD"
echo "================================"
echo ""
echo "Voy a saturar la memoria de un pod para que se caiga..."
echo "Kubernetes debería:"
echo "  1. Detectar que el pod murió"
echo "  2. Crear un nuevo pod automáticamente"
echo "  3. Distribuirlo en otro nodo"
echo ""

# Ver los pods antes
echo "📸 ANTES:"
kubectl get pods -n description-evaluator -o custom-columns=\
POD:.metadata.name,\
STATUS:.status.phase,\
NODE:.spec.nodeName | grep backend

echo ""
echo "💣 Saturando memoria del pod backend..."
echo ""

# Llamar al endpoint de stress-memory (esto hace que el pod se quede sin memoria)
POD_TO_KILL=$(kubectl get pods -n description-evaluator -l app=backend -o jsonpath='{.items[0].metadata.name}')
echo "🎯 Target: $POD_TO_KILL"
echo ""

curl -s http://localhost:10000/stress-memory &
STRESS_PID=$!

# Esperar un poco para que empiece a saturar
sleep 3

# Monitorear en tiempo real
echo "👀 Monitoreando pods (presiona Ctrl+C después de ver la recuperación):"
kubectl get pods -n description-evaluator -l app=backend -w
```

**🎤 EXPLICAR MIENTRAS SE EJECUTA:** 
- "Llamé al endpoint `/stress-memory` que aloca 400MB en memoria"
- "Los pods tienen límite de 512MB, así que esto los va a tumbar"
- "Mira cómo el pod pasa de Running → OOMKilled → Terminating"
- "Y automáticamente Kubernetes crea uno nuevo en otro nodo"
- "Esto pasa en menos de 20 segundos!"

**Después de Ctrl+C:**

```bash
echo ""
echo "📸 DESPUÉS:"
kubectl get pods -n description-evaluator -o custom-columns=\
POD:.metadata.name,\
STATUS:.status.phase,\
NODE:.spec.nodeName,\
RESTARTS:.status.containerStatuses[0].restartCount | grep backend

echo ""
echo "🎉 ¿Viste? El pod se recuperó automáticamente!"
echo ""

# Verificar que la app sigue funcionando
echo "✅ Verificando que la app sigue funcionando:"
curl -s http://localhost:10000/health | jq .
```

**🎤 EXPLICAR:** 
- "Fijate que el pod que se cayó fue reemplazado"
- "La aplicación nunca dejó de funcionar porque había otros 2 pods activos"
- "Esto es alta disponibilidad: tolerancia a fallos automática"

---

### **PASO 10: Demo Alternativa - Eliminar un Pod Manualmente** 🔪

Si prefieres algo más visual y controlado:

```bash
echo "🔪 DEMO ALTERNATIVA: Simulando fallo de un pod"
echo ""

# Ver los pods
kubectl get pods -n description-evaluator -l app=backend -o wide

# Elegir un pod para eliminar
POD_TO_DELETE=$(kubectl get pods -n description-evaluator -l app=backend -o jsonpath='{.items[0].metadata.name}')
NODE_BEFORE=$(kubectl get pod $POD_TO_DELETE -n description-evaluator -o jsonpath='{.spec.nodeName}')

echo "🎯 Eliminando pod: $POD_TO_DELETE (estaba en $NODE_BEFORE)"
echo ""

kubectl delete pod $POD_TO_DELETE -n description-evaluator

echo "⏳ Kubernetes creando pod de reemplazo..."
sleep 5

# Ver los nuevos pods
echo ""
echo "📸 Nuevos pods:"
kubectl get pods -n description-evaluator -l app=backend -o custom-columns=\
POD:.metadata.name,\
STATUS:.status.phase,\
NODE:.spec.nodeName,\
AGE:.metadata.creationTimestamp

echo ""
echo "✅ La aplicación sigue funcionando:"
curl -s http://localhost:10000/products | jq '.products | length'
```

**🎤 EXPLICAR:** 
- "Eliminé un pod a propósito (simulando un fallo)"
- "Kubernetes detectó que ahora hay 2 pods en vez de 3"
- "Creó uno nuevo automáticamente para mantener las 3 réplicas"
- "Probablemente lo puso en un nodo diferente (anti-affinity)"

---

### **PASO 11: Ver Logs y Debugging** 🔍

```bash
# Ver logs de un pod específico
POD=$(kubectl get pods -n description-evaluator -l app=backend -o jsonpath='{.items[0].metadata.name}')
echo "📋 Últimas 20 líneas del log del pod $POD:"
kubectl logs $POD -n description-evaluator --tail=20
```

**🎤 EXPLICAR:** 
- "Podemos ver los logs de cualquier pod para debugging"
- "Acá se ve la conexión exitosa a PostgreSQL"

---

### **PASO 12: Cleanup (Opcional)** 🧹

```bash
# Si querés limpiar todo al final
k3d cluster delete description-evaluator
```

---

## 🎯 PUNTOS CLAVE PARA REMARCAR

1. **Infraestructura como Código**: Todo está definido en archivos YAML versionados
2. **Alta Disponibilidad**: Múltiples réplicas en diferentes nodos
3. **Auto-recuperación**: Kubernetes recrea pods fallidos automáticamente
4. **Escalado Automático**: HPA escala según carga (CPU/memoria)
5. **Seguridad**: Credenciales en Secrets, no en código
6. **Monitoreo**: Logs, métricas, health checks
7. **Portabilidad**: Corre igual en dev (k3d) que en producción (EKS, GKE, AKS)

---

## 📊 COMANDOS ÚTILES EXTRA

```bash
# Ver todos los recursos del namespace
kubectl get all -n description-evaluator

# Ver eventos del cluster
kubectl get events -n description-evaluator --sort-by='.lastTimestamp'

# Describir un pod específico
kubectl describe pod <POD_NAME> -n description-evaluator

# Ver configuración del HPA en detalle
kubectl describe hpa backend-hpa -n description-evaluator

# Ver el Service y sus endpoints
kubectl get svc -n description-evaluator
kubectl get endpoints -n description-evaluator
```

---

## 🎬 TIPS PARA LA DEMO

- **Practica antes**: Corre el script completo una vez antes de la demo real
- **Pantalla compartida**: Usa una fuente grande en la terminal
- **Ventanas preparadas**: Ten browser, terminal, y tal vez k9s abiertos
- **Timing**: La demo completa toma ~10-15 minutos
- **Backup**: Si algo falla, podés saltear pasos y usar el cluster existente

¡Éxito con tu demo! 🚀
