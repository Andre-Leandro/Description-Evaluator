# 🎯 DEMOSTRACIÓN DE ALTA DISPONIBILIDAD - RESUMEN EJECUTIVO

## ¿Qué vamos a demostrar?

Orquestación de contenedores con **Kubernetes** mostrando **alta disponibilidad** y **auto-recuperación** en vivo.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  CLUSTER KUBERNETES (k3d - Docker en Mac)               │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Agent-0  │  │ Agent-1  │  │ Agent-2  │  ← Workers  │
│  └──────────┘  └──────────┘  └──────────┘             │
│       ↓              ↓              ↓                   │
│  ┌─────────────────────────────────────┐               │
│  │        Server-0 (Master)            │               │
│  └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘

Aplicación distribuida:
• Backend  → 3 réplicas (Flask + PostgreSQL)
• Frontend → 2 réplicas (Next.js)
• Redis    → 1 réplica (cache)

Total: 6 pods en 4 nodos
```

---

## 🎬 DEMO EN 3 PASOS

### **PASO 1: Levantar el entorno** (30 segundos)

```bash
cd k8s
./demo.sh  # Script interactivo con explicaciones
```

O manualmente:
```bash
# Crear cluster
k3d cluster create description-evaluator --servers 1 --agents 3 \
  --port "8080:80@loadbalancer" -p "10000:30000@agent:0"

# Importar imágenes
k3d image import devopsregistrytp.azurecr.io/backend:latest \
                 devopsregistrytp.azurecr.io/frontend:latest

# Crear secrets desde .env
./create-secrets.sh

# Desplegar aplicación
kubectl apply -f namespace.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml
```

---

### **PASO 2: Verificar distribución** (10 segundos)

```bash
kubectl get pods -n description-evaluator -o wide
```

**Resultado esperado:**
```
NAME                        NODE
backend-xxx-aaa            agent-0
backend-xxx-bbb            agent-1
backend-xxx-ccc            agent-2
frontend-xxx-ddd           agent-0
frontend-xxx-eee           agent-1
redis-xxx-fff              server-0
```

✅ Pods distribuidos en diferentes nodos (anti-affinity)

---

### **PASO 3: Saturar memoria y demostrar HA** (20 segundos)

#### **OPCIÓN A: Desde la Web (MÁS VISUAL)** 🎯

1. Abre una terminal:
   ```bash
   kubectl get pods -n description-evaluator -w
   ```

2. Abre el navegador: `http://localhost:8080`

3. En la página principal, haz clic en:
   **💣 Saturar Memoria del Pod**

4. **Observa en tiempo real:**
   - **Terminal:** Pod pasa de `Running` → `OOMKilled` → nuevo pod creado
   - **Navegador:** La app **SIGUE FUNCIONANDO** (sin errores)

#### **OPCIÓN B: Desde Terminal (CLÁSICA)**

```bash
# Terminal 1: Monitorear pods
kubectl get pods -n description-evaluator -w

# Terminal 2: Saturar memoria
curl http://localhost:10000/stress-memory

# O eliminar un pod manualmente
kubectl delete pod <backend-pod> -n description-evaluator
```

---

## 🎉 ¿Qué acabamos de demostrar?

### ✅ **Alta Disponibilidad**
- Un pod se cayó por saturación de memoria
- Kubernetes lo detectó y creó uno nuevo **automáticamente**
- Los otros 2 pods del backend siguieron funcionando
- **Zero downtime** → La aplicación nunca dejó de responder

### ✅ **Auto-recuperación**
- No hubo intervención manual
- Kubernetes mantuvo las 3 réplicas configuradas
- El nuevo pod se distribuyó en un nodo diferente

### ✅ **Resiliencia**
- Si un nodo completo falla, los pods migran a otros nodos
- El HPA (Horizontal Pod Autoscaler) puede crear más réplicas si la carga aumenta
- El PDB (Pod Disruption Budget) garantiza mínimo 2 backends disponibles

---

## 📊 Métricas de la Demo

| Métrica | Valor |
|---------|-------|
| Tiempo de detección de fallo | ~2 segundos |
| Tiempo de creación de nuevo pod | ~8-12 segundos |
| Downtime de la aplicación | **0 segundos** |
| Requests perdidas | **0** (load balancer redirige a pods sanos) |

---

## 🔑 Conceptos Clave Explicados

### **Pod**
Unidad mínima en Kubernetes. Contenedor(es) que corren juntos.

### **Réplica**
Copia idéntica de un pod. Más réplicas = mayor disponibilidad.

### **Anti-Affinity**
Regla que distribuye pods en diferentes nodos para evitar single point of failure.

### **HPA (Horizontal Pod Autoscaler)**
Escala automáticamente (crea/destruye pods) según CPU/memoria.

### **PDB (Pod Disruption Budget)**
Garantiza que siempre haya un mínimo de pods disponibles.

### **Health Checks**
Kubernetes monitorea constantemente si los pods están sanos.
- Liveness: ¿El pod está vivo?
- Readiness: ¿El pod puede recibir tráfico?

---

## 💡 Por Qué Esto es Importante

### **Antes (sin Kubernetes):**
```
Servidor cae → Aplicación cae → Usuario frustrado → Pérdida de dinero
```

### **Ahora (con Kubernetes):**
```
Pod cae → Kubernetes lo recrea → Otros pods responden → Usuario no nota nada
```

### **Beneficios Reales:**
- ✅ **99.9% uptime** en producción
- ✅ **Escalado automático** en Black Friday
- ✅ **Deploy sin downtime** (rolling updates)
- ✅ **Recuperación automática** de fallos
- ✅ **Infraestructura como código** (versionado en Git)

---

## 🎯 Comandos Útiles Durante la Demo

```bash
# Ver todos los pods
kubectl get pods -n description-evaluator

# Ver distribución en nodos
kubectl get pods -n description-evaluator -o wide

# Monitorear en tiempo real
kubectl get pods -n description-evaluator -w

# Ver logs de un pod
kubectl logs <pod-name> -n description-evaluator

# Ver métricas (si metrics-server está instalado)
kubectl top pods -n description-evaluator

# Ver el HPA
kubectl get hpa -n description-evaluator

# Ver eventos del cluster
kubectl get events -n description-evaluator --sort-by='.lastTimestamp'

# Verificar que la app funciona
curl http://localhost:10000/health
curl http://localhost:10000/products | jq '.products | length'

# Abrir la app en el navegador
open http://localhost:8080
```

---

## 🧹 Cleanup (Después de la Demo)

```bash
# Eliminar el cluster
k3d cluster delete description-evaluator

# Verificar que se eliminó
docker ps | grep k3d
kubectl get nodes
```

---

## 📚 Referencias

- **Kubernetes Docs:** https://kubernetes.io/docs/
- **k3d (k3s en Docker):** https://k3d.io/
- **Anti-Affinity:** https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/
- **HPA:** https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/

---

## 🎤 Talking Points para la Demo

1. **Intro (30 seg):**
   - "Voy a mostrar cómo Kubernetes maneja fallos automáticamente"
   - "Tengo una app con 3 réplicas del backend en diferentes nodos"

2. **Durante el stress (20 seg):**
   - "Voy a saturar la memoria de un pod hasta que se caiga"
   - "Observa cómo Kubernetes detecta el fallo y recrea el pod"
   - "Mientras tanto, los otros 2 pods siguen respondiendo"

3. **Conclusión (10 seg):**
   - "La app nunca dejó de funcionar. Zero downtime."
   - "Esto es alta disponibilidad en acción. Sin intervención manual."

---

**¡Listo para impresionar!** 🚀
