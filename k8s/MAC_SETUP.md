# 🍎 Guía para Mac - Despliegue Local con k3d

## ✅ Opción FÁCIL: Todo en tu Mac con Docker Desktop

No necesitas 3 computadoras. Puedes crear un cluster Kubernetes completo usando **k3d** que simula múltiples nodos usando contenedores Docker.

## 📋 Requisitos

- ✅ Mac (el que ya tienes)
- ✅ Docker Desktop instalado
- ✅ Homebrew instalado

## 🚀 Instalación Paso a Paso

### 1. Instalar k3d (Kubernetes en Docker)

```bash
# Instalar k3d
brew install k3d

# Instalar kubectl si no lo tienes
brew install kubectl
```

### 2. Crear un Cluster Multi-Nodo en tu Mac

```bash
# Crear cluster con 1 server (master) + 3 agents (workers)
k3d cluster create description-evaluator \
  --servers 1 \
  --agents 3 \
  --port "8080:80@loadbalancer" \
  --port "8443:443@loadbalancer" \
  --api-port 6443

# Verificar que funciona
kubectl get nodes
```

**Deberías ver:**
```
NAME                              STATUS   ROLES                  AGE
k3d-description-evaluator-server-0    Ready    control-plane,master   1m
k3d-description-evaluator-agent-0     Ready    <none>                 1m
k3d-description-evaluator-agent-1     Ready    <none>                 1m
k3d-description-evaluator-agent-2     Ready    <none>                 1m
```

**¡4 nodos corriendo como contenedores Docker en tu Mac! 🎉**

### 3. Configurar Secrets con tus Credenciales

```bash
cd /Users/andreleandro/Documents/Description-Evaluator/k8s

# Editar el archivo con tus credenciales
nano backend-deployment.yaml
```

Busca y edita:
```yaml
stringData:
  DB_USER: "tu-usuario-supabase"
  DB_PASSWORD: "tu-password-supabase"
  DB_HOST: "tu-host-supabase.supabase.co"
  DB_PORT: "5432"
  DB_NAME: "postgres"
  REDIS_PASSWORD: "cualquier-password"
```

### 4. Desplegar la Aplicación

```bash
# Aplicar todos los manifiestos
kubectl apply -f all-in-one.yaml

# O si prefieres paso a paso
kubectl apply -f namespace.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml
```

### 5. Esperar a que Todo Esté Listo

```bash
# Ver el progreso
kubectl get pods -n description-evaluator -w

# Presiona Ctrl+C cuando todos estén "Running"
```

### 6. Acceder a la Aplicación

```bash
# La app está expuesta en el puerto 8080
open http://localhost:8080
```

**¡Tu aplicación con alta disponibilidad corriendo en tu Mac! 🎊**

## 🔥 Probar Alta Disponibilidad

### Opción 1: Script Automatizado

```bash
# Ejecutar prueba de saturación
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: memory-stress-test
  namespace: description-evaluator
spec:
  template:
    spec:
      containers:
      - name: stress
        image: polinux/stress
        command: ["stress"]
        args:
        - "--vm"
        - "1"
        - "--vm-bytes"
        - "450M"
        - "--timeout"
        - "120s"
        resources:
          limits:
            memory: "512Mi"
      restartPolicy: Never
      nodeSelector:
        kubernetes.io/hostname: k3d-description-evaluator-agent-0
  backoffLimit: 0
EOF

# Monitorear el comportamiento
watch -n 2 'kubectl get pods -n description-evaluator -o wide'
```

### Opción 2: Endpoint HTTP

```bash
# Saturar memoria desde la app
curl http://localhost:8080/stress-memory

# Ver qué pasa
kubectl get pods -n description-evaluator -w
```

**Verás:**
1. Un pod siendo eliminado (OOMKilled)
2. Kubernetes creando uno nuevo en otro "nodo"
3. La app sigue respondiendo en http://localhost:8080

## 📊 Comandos Útiles para Mac

```bash
# Ver todos los nodos (contenedores Docker)
kubectl get nodes -o wide

# Ver contenedores Docker de k3d
docker ps | grep k3d

# Ver distribución de pods entre nodos
kubectl get pods -n description-evaluator -o wide

# Ver métricas (necesitas esperar ~1 minuto)
kubectl top nodes
kubectl top pods -n description-evaluator

# Ver logs
kubectl logs -f deployment/backend -n description-evaluator

# Escalar manualmente
kubectl scale deployment backend --replicas=5 -n description-evaluator

# Ver eventos
kubectl get events -n description-evaluator --sort-by='.lastTimestamp'
```

## 🧹 Limpieza

```bash
# Eliminar la aplicación pero mantener el cluster
kubectl delete namespace description-evaluator

# Eliminar todo el cluster
k3d cluster delete description-evaluator

# Listar clusters
k3d cluster list
```

## 🎯 Flujo Completo para Mac (Copy-Paste)

```bash
# 1. Instalar herramientas (solo una vez)
brew install k3d kubectl

# 2. Crear cluster
k3d cluster create description-evaluator \
  --servers 1 \
  --agents 3 \
  --port "8080:80@loadbalancer"

# 3. Verificar nodos
kubectl get nodes

# 4. Ir al directorio k8s
cd /Users/andreleandro/Documents/Description-Evaluator/k8s

# 5. Editar credenciales
nano backend-deployment.yaml  # Edita DB_USER, DB_PASSWORD, etc.

# 6. Desplegar todo
kubectl apply -f all-in-one.yaml

# 7. Esperar a que inicie (2-3 minutos)
kubectl get pods -n description-evaluator -w
# Presiona Ctrl+C cuando todos estén Running

# 8. Abrir la app
open http://localhost:8080

# 9. Probar saturación
curl http://localhost:8080/stress-memory

# 10. Monitorear
kubectl get pods -n description-evaluator -w
```

## 🎓 Ventajas de Usar k3d en Mac

| Ventaja | Descripción |
|---------|-------------|
| ✅ **Fácil** | No necesitas VMs ni servidores externos |
| ✅ **Rápido** | Cluster listo en 30 segundos |
| ✅ **Gratis** | Todo local, sin costos de nube |
| ✅ **Realista** | Simula cluster real con múltiples nodos |
| ✅ **Destruible** | Borra y recrea el cluster cuando quieras |
| ✅ **Mac-friendly** | Optimizado para Docker Desktop en Mac |

## 🔧 Troubleshooting en Mac

### "k3d cluster create" falla
```bash
# Asegúrate que Docker Desktop esté corriendo
open -a Docker

# Verifica que funciona
docker ps
```

### Pods en estado "Pending"
```bash
# Aumenta recursos de Docker Desktop
# Docker Desktop > Settings > Resources
# RAM: Mínimo 6GB
# CPUs: Mínimo 4
```

### No puedo acceder a localhost:8080
```bash
# Verifica el port mapping
k3d cluster list

# Recrea el cluster con los puertos
k3d cluster delete description-evaluator
k3d cluster create description-evaluator \
  --servers 1 \
  --agents 3 \
  --port "8080:80@loadbalancer"
```

### "kubectl: command not found"
```bash
brew install kubectl
```

## 📚 Recursos Adicionales

- [Documentación k3d](https://k3d.io/)
- [k3d en GitHub](https://github.com/k3d-io/k3d)

## 🎉 Resultado Final

Con k3d en tu Mac tendrás:

- ✅ 4 "nodos" (contenedores Docker simulando servidores)
- ✅ Backend con 3 réplicas distribuidas
- ✅ Frontend con 2 réplicas
- ✅ Redis funcionando
- ✅ Alta disponibilidad real
- ✅ Failover automático cuando saturas memoria
- ✅ Todo corriendo en http://localhost:8080

**¡Los perritos están a salvo sin necesidad de múltiples servidores! 🐕💚**

---

## ⚡ Cheat Sheet - Comandos Rápidos

```bash
# Crear cluster
k3d cluster create description-evaluator --servers 1 --agents 3 --port "8080:80@loadbalancer"

# Desplegar app
cd k8s && kubectl apply -f all-in-one.yaml

# Ver estado
kubectl get all -n description-evaluator

# Acceder
open http://localhost:8080

# Probar HA
curl http://localhost:8080/stress-memory

# Limpiar
k3d cluster delete description-evaluator
```
