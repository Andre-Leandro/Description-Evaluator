# ✅ Checklist de Validación - Kubernetes con Alta Disponibilidad

Este documento te guía paso a paso para validar que TODOS los requisitos estén cumplidos.

## 📋 Pre-requisitos

- [ ] Tienes al menos 3 máquinas/VMs disponibles (1 master + 2 workers)
- [ ] Cada máquina tiene Ubuntu 20.04+ o similar
- [ ] Cada máquina tiene al menos 2GB RAM
- [ ] Las máquinas tienen conectividad de red entre sí
- [ ] Tienes acceso SSH a todas las máquinas

## 🔧 Fase 1: Instalación del Cluster

### Nodo Master

- [ ] Ejecutaste `sudo ./install-k3s-master.sh` en el nodo master
- [ ] El script completó sin errores
- [ ] Obtuviste el token y la URL del master
- [ ] Guardaste el token en un lugar seguro
- [ ] Ejecutaste `kubectl get nodes` y ves el nodo master

**Comando de validación:**
```bash
kubectl get nodes
# Deberías ver al menos 1 nodo (master) en estado Ready
```

### Nodos Workers

- [ ] Ejecutaste `sudo ./install-k3s-worker.sh` en el Worker 1
- [ ] Ingresaste correctamente la URL y token del master
- [ ] El script completó sin errores
- [ ] Ejecutaste `sudo ./install-k3s-worker.sh` en el Worker 2 (y otros si aplica)

**Comando de validación (desde el master):**
```bash
kubectl get nodes
# Deberías ver: master + todos los workers en estado Ready
```

**Salida esperada:**
```
NAME      STATUS   ROLES                  AGE   VERSION
master    Ready    control-plane,master   10m   v1.28.x+k3s1
worker1   Ready    <none>                 5m    v1.28.x+k3s1
worker2   Ready    <none>                 3m    v1.28.x+k3s1
```

### Componentes del Sistema

- [ ] Traefik está desplegado
- [ ] Metrics-server está desplegado

**Comando de validación:**
```bash
kubectl get pods -n kube-system
# Busca: traefik-xxx y metrics-server-xxx en estado Running
```

## 📦 Fase 2: Despliegue de la Aplicación

### Configuración de Secrets

- [ ] Editaste `backend-deployment.yaml`
- [ ] Actualizaste los valores del Secret con tus credenciales reales:
  - DB_USER
  - DB_PASSWORD
  - DB_HOST
  - DB_PORT
  - DB_NAME
  - REDIS_PASSWORD

### Despliegue

- [ ] Ejecutaste `./deploy.sh`
- [ ] El script completó sin errores
- [ ] Todos los pods están en estado Running

**Comando de validación:**
```bash
kubectl get pods -n description-evaluator
```

**Salida esperada:**
```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxx-aaaaa        1/1     Running   0          2m
backend-xxxxx-bbbbb        1/1     Running   0          2m
backend-xxxxx-ccccc        1/1     Running   0          2m
frontend-xxxxx-ddddd       1/1     Running   0          2m
frontend-xxxxx-eeeee       1/1     Running   0          2m
redis-xxxxx-fffff          1/1     Running   0          2m
```

### Servicios

- [ ] Los servicios están creados
- [ ] El Ingress está configurado

**Comando de validación:**
```bash
kubectl get svc -n description-evaluator
kubectl get ingress -n description-evaluator
```

### HPA y PDB

- [ ] HorizontalPodAutoscalers están creados
- [ ] PodDisruptionBudgets están creados

**Comando de validación:**
```bash
kubectl get hpa -n description-evaluator
kubectl get pdb -n description-evaluator
```

## 🌐 Fase 3: Acceso a la Aplicación

### Obtener IP Externa

- [ ] Obtuviste la IP del LoadBalancer

**Comando:**
```bash
kubectl get svc traefik -n kube-system
```

**Verifica:**
```
NAME      TYPE           EXTERNAL-IP      PORT(S)
traefik   LoadBalancer   <EXTERNAL-IP>    80:xxxxx/TCP,443:xxxxx/TCP
```

### Probar Acceso Web

- [ ] Abriste el navegador en `http://<EXTERNAL-IP>`
- [ ] La aplicación frontend carga correctamente
- [ ] Puedes navegar por la aplicación

### Probar Backend API

- [ ] Ejecutaste `curl http://<EXTERNAL-IP>/health`
- [ ] Obtuviste respuesta: `{"status": "healthy", "service": "backend"}`

## 🎯 Fase 4: Validación de Alta Disponibilidad

### Verificar Distribución de Pods

- [ ] Los pods de backend están en diferentes nodos
- [ ] Los pods de frontend están en diferentes nodos

**Comando:**
```bash
kubectl get pods -n description-evaluator -o wide
```

**Verifica que:**
- Los 3 pods de backend estén en al menos 2 nodos diferentes
- Los 2 pods de frontend estén en nodos diferentes (si hay múltiples nodos)

### Verificar Resource Limits

- [ ] Los pods tienen resource requests y limits configurados

**Comando:**
```bash
kubectl describe pod <BACKEND-POD-NAME> -n description-evaluator | grep -A 5 "Limits"
```

**Salida esperada:**
```
Limits:
  cpu:     500m
  memory:  512Mi
Requests:
  cpu:     200m
  memory:  256Mi
```

### Verificar Health Checks

- [ ] Los pods tienen liveness probes
- [ ] Los pods tienen readiness probes

**Comando:**
```bash
kubectl describe pod <BACKEND-POD-NAME> -n description-evaluator | grep -A 3 "Liveness"
kubectl describe pod <BACKEND-POD-NAME> -n description-evaluator | grep -A 3 "Readiness"
```

## 🔥 Fase 5: Prueba de Saturación de Memoria

### Método 1: Script Automatizado

- [ ] Ejecutaste `./test-memory-saturation.sh`
- [ ] El script mostró el estado inicial de los pods
- [ ] El script creó un Job de estrés de memoria
- [ ] Observaste pods siendo terminados (OOMKilled)
- [ ] Observaste nuevos pods siendo creados
- [ ] Los nuevos pods se crearon en nodos diferentes
- [ ] El servicio se mantuvo disponible durante todo el proceso

**Validaciones durante la prueba:**

1. **Antes de saturar:**
   - [ ] 3 pods de backend running
   - [ ] Distribuidos en diferentes nodos

2. **Durante saturación:**
   - [ ] Viste eventos de OOMKilled
   - [ ] Viste pods en estado Pending o ContainerCreating
   - [ ] La aplicación web siguió respondiendo

3. **Después de recuperación:**
   - [ ] 3 pods de backend running nuevamente
   - [ ] Posiblemente en nodos diferentes al inicial
   - [ ] La aplicación web funciona correctamente

### Método 2: Endpoint HTTP

- [ ] Ejecutaste `curl http://<EXTERNAL-IP>/stress-memory`
- [ ] Monitoreaste con `kubectl get pods -n description-evaluator -w`
- [ ] Observaste el mismo comportamiento de failover

## 📊 Fase 6: Validación de Métricas

### Metrics Server

- [ ] El metrics-server está funcionando
- [ ] Puedes obtener métricas de nodos

**Comando:**
```bash
kubectl top nodes
```

**Salida esperada:**
```
NAME      CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
master    100m         5%     800Mi           40%
worker1   200m         10%    1200Mi          60%
worker2   150m         7%     900Mi           45%
```

### Métricas de Pods

- [ ] Puedes obtener métricas de los pods

**Comando:**
```bash
kubectl top pods -n description-evaluator
```

**Salida esperada:**
```
NAME                        CPU(cores)   MEMORY(bytes)
backend-xxxxx-aaaaa        50m          200Mi
backend-xxxxx-bbbbb        45m          190Mi
backend-xxxxx-ccccc        48m          195Mi
frontend-xxxxx-ddddd       20m          100Mi
frontend-xxxxx-eeeee       22m          105Mi
redis-xxxxx-fffff          10m          50Mi
```

### HPA Funcionando

- [ ] El HPA muestra métricas actuales

**Comando:**
```bash
kubectl get hpa -n description-evaluator
```

**Salida esperada:**
```
NAME           REFERENCE            TARGETS         MINPODS   MAXPODS   REPLICAS
backend-hpa    Deployment/backend   45%/70%,30%/70%    3         10        3
frontend-hpa   Deployment/frontend  25%/75%,20%/75%    2         5         2
```

## 🎓 Fase 7: Validación de Comportamiento HA

### Test 1: Eliminar un Pod Manualmente

- [ ] Eliminaste un pod de backend: `kubectl delete pod <POD-NAME> -n description-evaluator`
- [ ] Kubernetes creó automáticamente un nuevo pod
- [ ] El servicio se mantuvo disponible
- [ ] El nuevo pod alcanzó estado Running en <30 segundos

### Test 2: Escalar Manualmente

- [ ] Escalaste el backend: `kubectl scale deployment backend --replicas=5 -n description-evaluator`
- [ ] Kubernetes creó 2 pods adicionales
- [ ] Los nuevos pods se distribuyeron en diferentes nodos
- [ ] Todos los pods alcanzaron estado Running

### Test 3: Rolling Update

- [ ] Actualizaste la imagen (o hiciste un rollout restart)
- [ ] Los pods se actualizaron uno por uno
- [ ] Siempre hubo al menos 2 pods disponibles (según PDB)
- [ ] El servicio nunca dejó de responder

**Comando:**
```bash
kubectl rollout restart deployment/backend -n description-evaluator
kubectl rollout status deployment/backend -n description-evaluator
```

### Test 4: Verificar PDB

- [ ] Intentaste drenar un nodo: `kubectl drain <NODE-NAME> --ignore-daemonsets`
- [ ] El PDB previno la evicción simultánea de todos los pods
- [ ] Siempre quedó al menos 1 pod de backend disponible

## 📝 Fase 8: Documentación

### Archivos Presentes

- [ ] `README.md` - Documentación completa
- [ ] `QUICKSTART.md` - Guía rápida
- [ ] `PRODUCTION.md` - Configuraciones avanzadas
- [ ] `SUMMARY.md` - Resumen de implementación
- [ ] `VALIDATION.md` - Este checklist
- [ ] Todos los archivos YAML necesarios
- [ ] Todos los scripts shell con permisos de ejecución

### Scripts Ejecutables

- [ ] `install-k3s-master.sh` tiene permisos +x
- [ ] `install-k3s-worker.sh` tiene permisos +x
- [ ] `deploy.sh` tiene permisos +x
- [ ] `test-memory-saturation.sh` tiene permisos +x
- [ ] `verify-installation.sh` tiene permisos +x

## ✅ Resumen Final

### Requisitos del Proyecto

| Requisito | Estado | Evidencia |
|-----------|--------|-----------|
| Uso de k3s o rke2 | ✅ | `k3s --version` |
| App desplegada en pods | ✅ | `kubectl get pods -n description-evaluator` |
| Redis en pods | ✅ | `kubectl get pods -n description-evaluator -l app=redis` |
| Servicio/Ingress para web | ✅ | `kubectl get ingress -n description-evaluator` |
| YAMLs de configuración | ✅ | Todos los archivos en `k8s/` |
| Alta Disponibilidad | ✅ | 3 réplicas backend, 2 frontend |
| Saturación 80-100% memoria | ✅ | `./test-memory-saturation.sh` |
| Nodo fuera de servicio | ✅ | Pods OOMKilled y evictados |
| Failover automático | ✅ | Nuevos pods en otros nodos |
| Servicio mantenido | ✅ | Aplicación siempre disponible |

### Validación Final

Ejecuta este comando para verificar todo:

```bash
./verify-installation.sh
```

**Si todos los checks están en ✅, la implementación está completa y funcionando!**

## 🎉 Certificación de HA

Si completaste TODOS los checks anteriores, tu implementación:

✅ Cumple con TODOS los requisitos solicitados  
✅ Demuestra alta disponibilidad real  
✅ Resiste fallos de nodos  
✅ Mantiene el servicio 24/7  
✅ Está lista para salvar perritos 🐕💚  

---

**Fecha de validación**: _________________  
**Validado por**: _________________  
**Resultado**: ⬜ APROBADO  ⬜ REQUIERE AJUSTES  

### Notas adicionales:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
