# Despliegue en Kubernetes con k3s - Alta Disponibilidad 🐕

## 📋 Descripción

Este documento describe cómo desplegar la aplicación **Description Evaluator** en un cluster Kubernetes ligero usando **k3s**, con configuración de alta disponibilidad (HA) para resistir fallos de nodos cuando se satura la memoria.

## 🎯 Objetivo

Implementar un sistema resiliente que:
- Distribuya la aplicación en múltiples nodos
- Mantenga el servicio disponible aunque un nodo falle por saturación de memoria (80-100%)
- Levante automáticamente contenedores en otros nodos cuando uno caiga

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    k3s Cluster                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Master     │  │   Worker 1   │  │   Worker 2   │ │
│  │              │  │              │  │              │ │
│  │ - Control    │  │ - Backend    │  │ - Backend    │ │
│  │   Plane      │  │ - Frontend   │  │ - Frontend   │ │
│  │ - Traefik    │  │ - Redis      │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  Características de HA:                                │
│  • 3 réplicas de backend con anti-affinity             │
│  • 2 réplicas de frontend                              │
│  • HPA para escalar según memoria/CPU                  │
│  • Health checks y readiness probes                    │
│  • PodDisruptionBudgets                                │
└─────────────────────────────────────────────────────────┘
```

## 📦 Componentes

### Manifiestos YAML (`k8s/`)

1. **namespace.yaml** - Namespace para aislar la aplicación
2. **redis-deployment.yaml** - Redis con persistencia y health checks
3. **backend-deployment.yaml** - Backend con 3 réplicas y anti-affinity
4. **frontend-deployment.yaml** - Frontend con 2 réplicas
5. **ingress.yaml** - Traefik Ingress para exponer la aplicación
6. **hpa.yaml** - HorizontalPodAutoscaler para escalar automáticamente
7. **pdb.yaml** - PodDisruptionBudgets para garantizar disponibilidad mínima

### Scripts de Instalación

1. **install-k3s-master.sh** - Instala k3s en el nodo maestro
2. **install-k3s-worker.sh** - Instala k3s en nodos workers
3. **deploy.sh** - Despliega toda la aplicación
4. **test-memory-saturation.sh** - Prueba de saturación y HA

## 🚀 Instalación

### Prerrequisitos

- **Mínimo 3 máquinas/VMs** (1 master + 2 workers) con:
  - Ubuntu 20.04+ / Debian 10+ / CentOS 7+
  - 2 GB RAM mínimo por nodo
  - 2 vCPUs por nodo
  - Conectividad de red entre nodos
  - Puertos abiertos: 6443, 443, 80, 8472, 10250

### Paso 1: Instalar k3s en el Nodo Maestro

En la máquina que será el **master**:

```bash
cd k8s
chmod +x install-k3s-master.sh
sudo ./install-k3s-master.sh
```

Este script:
- ✅ Instala k3s como servidor
- ✅ Configura Traefik como Ingress Controller
- ✅ Instala metrics-server para HPA
- ✅ Genera el token para workers (guarda en `k3s-join-info.txt`)

**Importante**: Anota el token y la URL que se muestran al final.

### Paso 2: Unir Nodos Workers

En **cada máquina worker**:

```bash
cd k8s
chmod +x install-k3s-worker.sh
sudo ./install-k3s-worker.sh
```

Cuando se solicite:
- **URL del master**: `https://<IP-DEL-MASTER>:6443`
- **Token**: (el token generado en el paso 1)

Verifica que los nodos se unieron correctamente (desde el master):

```bash
kubectl get nodes
```

Deberías ver algo como:
```
NAME       STATUS   ROLES                  AGE   VERSION
master     Ready    control-plane,master   5m    v1.28.x+k3s1
worker1    Ready    <none>                 2m    v1.28.x+k3s1
worker2    Ready    <none>                 1m    v1.28.x+k3s1
```

### Paso 3: Configurar Secrets

**ANTES de desplegar**, edita `k8s/backend-deployment.yaml` y actualiza el Secret con tus credenciales:

```bash
nano k8s/backend-deployment.yaml
```

Busca la sección `Secret` y actualiza:

```yaml
stringData:
  DB_USER: "tu-usuario-db"
  DB_PASSWORD: "tu-contraseña-db"
  DB_HOST: "tu-host-db"
  DB_PORT: "5432"
  DB_NAME: "tu-nombre-db"
  REDIS_PASSWORD: "tu-contraseña-redis"
```

### Paso 4: Desplegar la Aplicación

Desde el **nodo master**:

```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

Este script despliega todos los componentes en orden:
1. Namespace
2. Secrets y ConfigMaps
3. Redis
4. Backend (con 3 réplicas)
5. Frontend (con 2 réplicas)
6. Ingress
7. HPA y PDB

### Paso 5: Verificar el Despliegue

```bash
# Ver todos los pods
kubectl get pods -n description-evaluator

# Ver servicios
kubectl get svc -n description-evaluator

# Ver ingress
kubectl get ingress -n description-evaluator

# Ver HPA
kubectl get hpa -n description-evaluator

# Ver distribución de pods por nodo
kubectl get pods -n description-evaluator -o wide
```

### Paso 6: Acceder a la Aplicación

Obtén la IP del LoadBalancer:

```bash
kubectl get svc -n kube-system traefik
```

Accede a la aplicación en tu navegador:
```
http://<EXTERNAL-IP>
```

## 🧪 Demostración de Alta Disponibilidad

### Método 1: Script Automático (Recomendado)

```bash
cd k8s
chmod +x test-memory-saturation.sh
./test-memory-saturation.sh
```

Este script:
1. 📊 Muestra el estado inicial de los pods
2. 🔥 Crea un Job que satura la memoria en un nodo específico
3. 👀 Monitorea en tiempo real cómo Kubernetes:
   - Detecta el alto uso de memoria
   - Mata el pod saturado (OOMKilled)
   - Levanta automáticamente un nuevo pod en otro nodo
4. ✅ Verifica que el servicio se mantiene disponible

### Método 2: Endpoint HTTP

Desde cualquier cliente HTTP:

```bash
# Obtener el pod actual
BACKEND_POD=$(kubectl get pods -n description-evaluator -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Ver en qué nodo está
kubectl get pod $BACKEND_POD -n description-evaluator -o wide

# Saturar memoria del pod
curl http://<EXTERNAL-IP>/api/stress-memory

# Observar el comportamiento
watch -n 2 'kubectl get pods -n description-evaluator -l app=backend -o wide'
```

### Qué Deberías Observar

1. **Antes de saturar**:
   ```
   NAME                      READY   STATUS    RESTARTS   NODE
   backend-xxxxx-aaaaa       1/1     Running   0          worker1
   backend-xxxxx-bbbbb       1/1     Running   0          worker2
   backend-xxxxx-ccccc       1/1     Running   0          worker1
   ```

2. **Durante saturación**:
   ```
   NAME                      READY   STATUS      RESTARTS   NODE
   backend-xxxxx-aaaaa       0/1     OOMKilled   0          worker1
   backend-xxxxx-bbbbb       1/1     Running     0          worker2
   backend-xxxxx-ccccc       1/1     Running     0          worker1
   backend-xxxxx-ddddd       0/1     Pending     0          worker2
   ```

3. **Después de recuperación**:
   ```
   NAME                      READY   STATUS    RESTARTS   NODE
   backend-xxxxx-bbbbb       1/1     Running   0          worker2
   backend-xxxxx-ccccc       1/1     Running   0          worker1
   backend-xxxxx-ddddd       1/1     Running   0          worker2
   ```

**✅ El servicio se mantiene disponible todo el tiempo gracias a las réplicas restantes.**

## 📊 Monitoreo

### Ver métricas de uso de recursos

```bash
# CPU y memoria de los pods
kubectl top pods -n description-evaluator

# Recursos por nodo
kubectl top nodes

# Estado detallado del HPA
kubectl describe hpa backend-hpa -n description-evaluator
```

### Ver logs

```bash
# Logs del backend
kubectl logs -f deployment/backend -n description-evaluator

# Logs de un pod específico
kubectl logs -f <POD-NAME> -n description-evaluator

# Eventos del cluster
kubectl get events -n description-evaluator --sort-by='.lastTimestamp'
```

## 🔧 Configuración de HA

### Recursos y Límites

Los pods tienen configurados:

**Backend:**
- Requests: 256Mi RAM, 200m CPU
- Limits: 512Mi RAM, 500m CPU
- Réplicas: 3 (mínimo 2 disponibles por PDB)

**Frontend:**
- Requests: 128Mi RAM, 100m CPU
- Limits: 256Mi RAM, 200m CPU
- Réplicas: 2 (mínimo 1 disponible por PDB)

### Anti-Affinity

Los pods de backend y frontend tienen configurado `podAntiAffinity` para distribuirse en diferentes nodos:

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        topologyKey: kubernetes.io/hostname
```

### HPA (Horizontal Pod Autoscaler)

Escala automáticamente cuando:
- Uso de memoria > 70%
- Uso de CPU > 70%

```bash
# Ver estado del HPA
kubectl get hpa -n description-evaluator
```

### Health Checks

Todos los pods tienen:
- **livenessProbe**: Reinicia el pod si falla
- **readinessProbe**: Quita el pod del balanceo si no está listo

## 🛠️ Comandos Útiles

```bash
# Escalar manualmente
kubectl scale deployment backend --replicas=5 -n description-evaluator

# Ver detalles de un pod
kubectl describe pod <POD-NAME> -n description-evaluator

# Ejecutar shell en un pod
kubectl exec -it <POD-NAME> -n description-evaluator -- /bin/sh

# Eliminar un pod (se recreará automáticamente)
kubectl delete pod <POD-NAME> -n description-evaluator

# Ver distribución de pods
kubectl get pods -n description-evaluator -o wide

# Forzar redeploy
kubectl rollout restart deployment/backend -n description-evaluator
```

## 🧹 Limpieza

```bash
# Eliminar la aplicación
kubectl delete namespace description-evaluator

# Desinstalar k3s del master
/usr/local/bin/k3s-uninstall.sh

# Desinstalar k3s de workers
/usr/local/bin/k3s-agent-uninstall.sh
```

## 📝 Notas Importantes

1. **Seguridad**: Los secrets están en texto plano en los YAMLs. Para producción, usa herramientas como:
   - Sealed Secrets
   - External Secrets Operator
   - HashiCorp Vault

2. **Persistencia**: Redis no tiene persistencia configurada. Para producción, agrega un PersistentVolume.

3. **Ingress**: Se usa Traefik que viene con k3s. El hostname por defecto es `description-evaluator.local`.

4. **Métricas**: El metrics-server está configurado con `--kubelet-insecure-tls` para desarrollo. En producción, configura certificados TLS.

5. **Observabilidad**: Los componentes de observabilidad (Jaeger, Prometheus, Grafana) no están incluidos en k8s. Se pueden agregar posteriormente.

## 🎉 Resultado Esperado

Al ejecutar la prueba de saturación:

✅ **El pod afectado es terminado** (OOMKilled)  
✅ **Kubernetes detecta el fallo automáticamente**  
✅ **Se crea un nuevo pod en otro nodo disponible**  
✅ **El servicio se mantiene disponible** (sin downtime)  
✅ **Los usuarios no perciben interrupciones** (gracias a las réplicas)

**¡Los perritos están a salvo! 🐕💚**

---

## 📚 Referencias

- [Documentación de k3s](https://docs.k3s.io/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [HPA Walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)
- [Pod Disruption Budgets](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/)
