#!/bin/bash
# Script para instalar k3s en el nodo MAESTRO
# Este script debe ejecutarse en el servidor que actuará como master

set -e

echo "================================================"
echo "Instalando k3s en el nodo MAESTRO"
echo "================================================"

# Instalar k3s como servidor (master)
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server \
  --cluster-init \
  --write-kubeconfig-mode=644 \
  --disable traefik \
  --node-taint node-role.kubernetes.io/master:NoSchedule" sh -

echo ""
echo "✅ k3s instalado correctamente"

# Esperar a que k3s esté listo
echo "⏳ Esperando a que k3s esté listo..."
sleep 10

# Verificar instalación
kubectl get nodes

# Obtener el token para los nodos workers
K3S_TOKEN=$(sudo cat /var/lib/rancher/k3s/server/node-token)
K3S_URL="https://$(hostname -I | awk '{print $1}'):6443"

echo ""
echo "================================================"
echo "INFORMACIÓN PARA CONFIGURAR NODOS WORKERS"
echo "================================================"
echo "Token: $K3S_TOKEN"
echo "URL: $K3S_URL"
echo ""
echo "Ejecuta este comando en cada nodo worker:"
echo "curl -sfL https://get.k3s.io | K3S_URL=$K3S_URL K3S_TOKEN=$K3S_TOKEN sh -"
echo "================================================"

# Guardar información en archivo
cat > k3s-join-info.txt <<EOF
K3S_URL=$K3S_URL
K3S_TOKEN=$K3S_TOKEN

Comando para workers:
curl -sfL https://get.k3s.io | K3S_URL=$K3S_URL K3S_TOKEN=$K3S_TOKEN sh -
EOF

echo "✅ Información guardada en k3s-join-info.txt"

# Instalar Traefik como Ingress Controller
echo ""
echo "📦 Instalando Traefik Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-rbac.yml

# Esperar a que el CRD esté listo
sleep 5

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: traefik-ingress-controller
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: traefik-ingress-controller
rules:
  - apiGroups:
      - ""
    resources:
      - services
      - endpoints
      - secrets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
      - networking.k8s.io
    resources:
      - ingresses
      - ingressclasses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
      - networking.k8s.io
    resources:
      - ingresses/status
    verbs:
      - update
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: traefik-ingress-controller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: traefik-ingress-controller
subjects:
  - kind: ServiceAccount
    name: traefik-ingress-controller
    namespace: kube-system
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: kube-system
  labels:
    app: traefik
spec:
  replicas: 1
  selector:
    matchLabels:
      app: traefik
  template:
    metadata:
      labels:
        app: traefik
    spec:
      serviceAccountName: traefik-ingress-controller
      containers:
        - name: traefik
          image: traefik:v2.10
          args:
            - --api.insecure=true
            - --providers.kubernetesingress
            - --entrypoints.web.address=:80
            - --entrypoints.websecure.address=:443
          ports:
            - name: web
              containerPort: 80
            - name: websecure
              containerPort: 443
            - name: admin
              containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: traefik
  namespace: kube-system
spec:
  type: LoadBalancer
  ports:
    - name: web
      port: 80
      targetPort: 80
    - name: websecure
      port: 443
      targetPort: 443
    - name: admin
      port: 8080
      targetPort: 8080
  selector:
    app: traefik
EOF

echo "✅ Traefik instalado correctamente"

# Habilitar metrics-server para HPA
echo ""
echo "📊 Habilitando metrics-server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch para que funcione sin TLS (desarrollo)
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

echo ""
echo "✅ ¡Instalación del nodo maestro completada!"
echo "================================================"
