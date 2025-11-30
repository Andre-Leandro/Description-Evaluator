# 🚀 Guía Rápida de Despliegue k3s

## TL;DR - Inicio Rápido

```bash
# 1. Instalar k3s master
cd k8s
sudo ./install-k3s-master.sh

# 2. Unir workers (en cada nodo worker)
sudo ./install-k3s-worker.sh

# 3. Actualizar secrets
nano backend-deployment.yaml  # Editar sección Secret con tus credenciales

# 4. Desplegar todo
./deploy.sh

# 5. Probar alta disponibilidad
./test-memory-saturation.sh
```

## 📦 Qué Incluye Esta Implementación

### ✅ Cumple con los Requisitos

| Requisito | Implementado | Detalles |
|-----------|-------------|----------|
| k3s o rke2 | ✅ | k3s instalado |
| App en pods | ✅ | Backend (3 réplicas) + Frontend (2 réplicas) |
| Redis en pods | ✅ | Redis con 1 réplica |
| Servicio/Ingress | ✅ | Traefik Ingress para acceso web |
| YAMLs de configuración | ✅ | 8 archivos YAML + all-in-one.yaml |
| High Availability | ✅ | Anti-affinity, HPA, PDB |
| Prueba de saturación | ✅ | Script automatizado + endpoint HTTP |
| Failover automático | ✅ | Kubernetes reinicia pods en otros nodos |

### 🎯 Características de HA Implementadas

1. **Múltiples Réplicas**
   - Backend: 3 réplicas
   - Frontend: 2 réplicas
   - Redis: 1 réplica (puede escalarse)

2. **Anti-Affinity**
   - Pods distribuidos en diferentes nodos
   - Evita que todas las réplicas caigan juntas

3. **Health Checks**
   - Liveness probes: Reinicia pods no saludables
   - Readiness probes: Quita pods del balanceo si fallan

4. **Resource Limits**
   - Backend: 256Mi-512Mi RAM
   - Permite saturación y evicción controlada

5. **HPA (Horizontal Pod Autoscaler)**
   - Escala automáticamente al 70% de CPU/memoria
   - Backend: 3-10 réplicas
   - Frontend: 2-5 réplicas

6. **PDB (Pod Disruption Budget)**
   - Backend: mínimo 2 pods siempre disponibles
   - Frontend: mínimo 1 pod siempre disponible

## 🧪 Demostración de HA - Qué Esperar

### Escenario de Prueba

1. **Estado Inicial**: 3 pods de backend distribuidos en 2-3 nodos
2. **Acción**: Saturar memoria de un nodo al 80-100%
3. **Resultado Esperado**:
   - Pod afectado es terminado (OOMKilled)
   - Kubernetes detecta el fallo
   - Nuevo pod se crea en otro nodo
   - Servicio permanece disponible

### Comandos de Verificación

```bash
# Ver distribución de pods
kubectl get pods -n description-evaluator -o wide

# Monitorear en tiempo real
watch -n 2 'kubectl get pods -n description-evaluator -l app=backend -o wide'

# Ver eventos de failover
kubectl get events -n description-evaluator --sort-by='.lastTimestamp'

# Ver métricas de uso
kubectl top pods -n description-evaluator
```

## 📊 Arquitectura Desplegada

```
┌─────────────────────────────────────────────────────┐
│                  Traefik Ingress                    │
│                  (LoadBalancer)                     │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌────────▼────────┐
│   Frontend     │       │    Backend      │
│   (2 replicas) │◄──────┤   (3 replicas)  │
└────────────────┘       └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │     Redis       │
                         │   (1 replica)   │
                         └─────────────────┘
```

## 🔥 Dos Métodos de Prueba

### Método 1: Script Automático (Recomendado)

```bash
./test-memory-saturation.sh
```

**Ventajas**:
- Totalmente automatizado
- Monitoreo en tiempo real
- Muestra eventos y métricas
- Limpieza automática

### Método 2: Endpoint HTTP Manual

```bash
# Obtener IP del servicio
EXTERNAL_IP=$(kubectl get svc traefik -n kube-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Saturar memoria
curl http://$EXTERNAL_IP/stress-memory

# Observar comportamiento
kubectl get pods -n description-evaluator -l app=backend -w
```

**Ventajas**:
- Más control manual
- Puedes repetir múltiples veces
- Simula carga real de usuario

## 📁 Estructura de Archivos k8s/

```
k8s/
├── README.md                      # Documentación completa
├── QUICKSTART.md                  # Esta guía rápida
├── PRODUCTION.md                  # Configuraciones avanzadas
├── all-in-one.yaml               # Todos los manifiestos en un archivo
├── namespace.yaml                # Namespace
├── redis-deployment.yaml         # Redis + Service
├── backend-deployment.yaml       # Backend + Service + Secrets
├── frontend-deployment.yaml      # Frontend + Service
├── ingress.yaml                  # Traefik Ingress
├── hpa.yaml                      # HorizontalPodAutoscalers
├── pdb.yaml                      # PodDisruptionBudgets
├── install-k3s-master.sh        # Script instalación master
├── install-k3s-worker.sh        # Script instalación workers
├── deploy.sh                     # Script despliegue aplicación
└── test-memory-saturation.sh    # Script prueba HA
```

## 🛠️ Troubleshooting Común

### Problema: Pods en estado Pending

```bash
# Ver por qué está pending
kubectl describe pod <POD-NAME> -n description-evaluator

# Solución común: recursos insuficientes
kubectl top nodes
```

### Problema: ImagePullBackOff

```bash
# Verificar que las imágenes existan en ACR
kubectl describe pod <POD-NAME> -n description-evaluator

# Solución: actualizar la imagen en el deployment
kubectl set image deployment/backend backend=devopsregistrytp.azurecr.io/backend:latest -n description-evaluator
```

### Problema: No puedo acceder a la aplicación

```bash
# Verificar el Ingress
kubectl get ingress -n description-evaluator

# Verificar Traefik
kubectl get svc -n kube-system traefik

# Ver logs de Traefik
kubectl logs -n kube-system -l app=traefik
```

### Problema: HPA no escala

```bash
# Verificar metrics-server
kubectl get deployment metrics-server -n kube-system

# Ver métricas disponibles
kubectl top pods -n description-evaluator

# Reiniciar metrics-server si es necesario
kubectl rollout restart deployment/metrics-server -n kube-system
```

## 📞 Soporte

### Logs Útiles

```bash
# Backend
kubectl logs -f deployment/backend -n description-evaluator

# Frontend
kubectl logs -f deployment/frontend -n description-evaluator

# Todos los pods
kubectl logs -f -l app=backend -n description-evaluator --all-containers=true
```

### Información del Sistema

```bash
# Versión de k3s
k3s --version

# Estado del cluster
kubectl cluster-info

# Nodos disponibles
kubectl get nodes -o wide

# Recursos totales
kubectl describe nodes
```

## 🎉 Resultado Final

Al completar esta guía tendrás:

✅ Cluster k3s multi-nodo funcionando  
✅ Aplicación desplegada con alta disponibilidad  
✅ Ingress configurado para acceso web  
✅ Autoscaling basado en métricas  
✅ Pruebas de saturación funcionando  
✅ Failover automático verificado  

**¡Los perritos están seguros! 🐕💚**

---

## 📚 Próximos Pasos

1. **Seguridad**: Implementar Sealed Secrets (ver PRODUCTION.md)
2. **Persistencia**: Agregar PersistentVolumes para Redis
3. **Monitoreo**: Desplegar Prometheus + Grafana
4. **CI/CD**: Automatizar deployments con GitHub Actions
5. **Backups**: Configurar Velero para backups del cluster

Ver `PRODUCTION.md` para más detalles.
