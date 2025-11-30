# Configuración de k3s para Producción

Este documento contiene configuraciones adicionales para un entorno de producción más robusto.

## 🔒 Seguridad

### 1. Usar Sealed Secrets

```bash
# Instalar Sealed Secrets Controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Instalar kubeseal CLI
brew install kubeseal  # macOS
# o
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-0.24.0-linux-amd64.tar.gz
tar xfz kubeseal-0.24.0-linux-amd64.tar.gz
sudo install -m 755 kubeseal /usr/local/bin/kubeseal

# Crear un secret y sellarlo
kubectl create secret generic backend-secrets \
  --from-literal=DB_USER=myuser \
  --from-literal=DB_PASSWORD=mypassword \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > sealed-backend-secrets.yaml

# Aplicar el sealed secret
kubectl apply -f sealed-backend-secrets.yaml -n description-evaluator
```

### 2. NetworkPolicies

Restringir el tráfico de red entre pods:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
  namespace: description-evaluator
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    - namespaceSelector:
        matchLabels:
          name: kube-system  # Para Ingress
    ports:
    - protocol: TCP
      port: 10000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 53   # DNS
    - protocol: UDP
      port: 53
```

## 💾 Persistencia

### PersistentVolume para Redis

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: description-evaluator
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: local-path  # k3s default storage class
---
# Actualizar redis-deployment.yaml para usar el PVC
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: description-evaluator
spec:
  template:
    spec:
      containers:
      - name: redis
        volumeMounts:
        - name: redis-data
          mountPath: /data
        - name: redis-config
          mountPath: /usr/local/etc/redis/redis.conf
          subPath: redis.conf
        command:
        - redis-server
        - /usr/local/etc/redis/redis.conf
        - --appendonly
        - "yes"
      volumes:
      - name: redis-data
        persistentVolumeClaim:
          claimName: redis-pvc
      - name: redis-config
        configMap:
          name: redis-config
```

## 📊 Observabilidad Completa

### Desplegar Stack de Observabilidad

```bash
# Crear namespace
kubectl create namespace observability

# Instalar Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace observability \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# Exponer Grafana
kubectl port-forward -n observability svc/prometheus-grafana 3000:80

# Credentials por defecto:
# Usuario: admin
# Contraseña: prom-operator
```

### ServiceMonitor para Backend

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: backend-metrics
  namespace: description-evaluator
  labels:
    app: backend
spec:
  selector:
    matchLabels:
      app: backend
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
```

### Desplegar Jaeger

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
  namespace: observability
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:latest
        ports:
        - containerPort: 16686
          name: ui
        - containerPort: 14268
          name: collector
        - containerPort: 4317
          name: otlp-grpc
        env:
        - name: COLLECTOR_OTLP_ENABLED
          value: "true"
---
apiVersion: v1
kind: Service
metadata:
  name: jaeger
  namespace: observability
spec:
  type: ClusterIP
  ports:
  - port: 16686
    name: ui
  - port: 14268
    name: collector
  - port: 4317
    name: otlp-grpc
  selector:
    app: jaeger
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: jaeger-ingress
  namespace: observability
spec:
  rules:
  - host: jaeger.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: jaeger
            port:
              number: 16686
```

## 🚀 CI/CD con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to k3s

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Login to ACR
      uses: azure/docker-login@v1
      with:
        login-server: devopsregistrytp.azurecr.io
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}
    
    - name: Build and push Backend
      run: |
        docker build -t devopsregistrytp.azurecr.io/backend:${{ github.sha }} ./backend
        docker push devopsregistrytp.azurecr.io/backend:${{ github.sha }}
    
    - name: Build and push Frontend
      run: |
        docker build -t devopsregistrytp.azurecr.io/frontend:${{ github.sha }} ./frontend
        docker push devopsregistrytp.azurecr.io/frontend:${{ github.sha }}
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
    
    - name: Set K8s context
      run: |
        mkdir -p $HOME/.kube
        echo "${{ secrets.KUBECONFIG }}" | base64 -d > $HOME/.kube/config
    
    - name: Deploy to k3s
      run: |
        kubectl set image deployment/backend backend=devopsregistrytp.azurecr.io/backend:${{ github.sha }} -n description-evaluator
        kubectl set image deployment/frontend frontend=devopsregistrytp.azurecr.io/frontend:${{ github.sha }} -n description-evaluator
        kubectl rollout status deployment/backend -n description-evaluator
        kubectl rollout status deployment/frontend -n description-evaluator
```

## 🔄 Backup y Restore

### Backup del Cluster

```bash
# Usar Velero para backups
kubectl apply -f https://github.com/vmware-tanzu/velero/releases/download/v1.12.0/velero-v1.12.0-linux-amd64.tar.gz

# Configurar backup schedule
velero schedule create daily-backup --schedule="0 2 * * *" --include-namespaces description-evaluator

# Backup manual
velero backup create manual-backup --include-namespaces description-evaluator

# Restore
velero restore create --from-backup manual-backup
```

## 📈 Autoscaling Avanzado

### KEDA (Event-Driven Autoscaling)

```bash
# Instalar KEDA
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
helm install keda kedacore/keda --namespace keda --create-namespace

# ScaledObject para Redis
kubectl apply -f - <<EOF
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: redis-scaledobject
  namespace: description-evaluator
spec:
  scaleTargetRef:
    name: backend
  minReplicaCount: 3
  maxReplicaCount: 20
  triggers:
  - type: redis
    metadata:
      address: redis:6379
      listName: tasks_queue
      listLength: "5"
EOF
```

## 🌐 Ingress con TLS

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: description-evaluator-tls
  namespace: description-evaluator
spec:
  secretName: description-evaluator-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - description-evaluator.example.com
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: description-evaluator-ingress-tls
  namespace: description-evaluator
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - description-evaluator.example.com
    secretName: description-evaluator-tls
  rules:
  - host: description-evaluator.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

## 🔍 Troubleshooting

### Ver logs de todos los pods

```bash
# Stern - tail de múltiples pods
brew install stern
stern backend -n description-evaluator

# Ver logs de todos los containers
kubectl logs -f --all-containers=true -l app=backend -n description-evaluator
```

### Debug de networking

```bash
# Crear pod de debug
kubectl run debug --image=nicolaka/netshoot -it --rm -n description-evaluator

# Dentro del pod:
# nslookup redis
# curl http://backend:10000/health
# ping frontend
```

### Verificar recursos

```bash
# Ver límites y requests configurados
kubectl describe nodes | grep -A 5 "Allocated resources"

# Ver qué está consumiendo más recursos
kubectl top pods -n description-evaluator --sort-by=memory
kubectl top pods -n description-evaluator --sort-by=cpu
```

## 🏆 Best Practices

1. **Usa namespaces** para separar entornos (dev, staging, prod)
2. **Define resource limits** siempre
3. **Implementa health checks** (liveness, readiness, startup probes)
4. **Usa anti-affinity** para distribuir pods
5. **Configura PDB** para evitar pérdida de disponibilidad
6. **Implementa RBAC** para seguridad
7. **Usa Secrets** para datos sensibles
8. **Monitorea todo** (métricas, logs, traces)
9. **Automatiza con CI/CD**
10. **Haz backups regulares**

---

Estas configuraciones llevan tu cluster k3s a un nivel de producción. ¡Los perritos estarán super protegidos! 🐕✨
