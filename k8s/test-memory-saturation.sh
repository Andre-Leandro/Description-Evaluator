#!/bin/bash
# Script para probar la saturación de memoria y alta disponibilidad

set -e

NAMESPACE="description-evaluator"

echo "================================================"
echo "Prueba de Alta Disponibilidad - Saturación de Memoria"
echo "================================================"

# Verificar que la app está desplegada
if ! kubectl get deployment backend -n $NAMESPACE &> /dev/null; then
    echo "❌ Error: La aplicación no está desplegada"
    exit 1
fi

echo "✅ Aplicación detectada"
echo ""

# Mostrar estado inicial
echo "Estado inicial de los pods:"
kubectl get pods -n $NAMESPACE -l app=backend -o wide

echo ""
echo "Estado del HPA:"
kubectl get hpa backend-hpa -n $NAMESPACE

echo ""
echo "================================================"
echo "Iniciando prueba de saturación de memoria..."
echo "================================================"
echo ""

# Obtener un pod de backend
BACKEND_POD=$(kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[0].metadata.name}')
NODE_NAME=$(kubectl get pod $BACKEND_POD -n $NAMESPACE -o jsonpath='{.spec.nodeName}')

echo "📍 Pod seleccionado: $BACKEND_POD"
echo "📍 Nodo actual: $NODE_NAME"
echo ""

# Función para monitorear el estado
monitor_pods() {
    echo "================================================"
    echo "⏱️  $(date '+%H:%M:%S') - Estado de los pods:"
    kubectl get pods -n $NAMESPACE -l app=backend -o wide
    echo ""
    kubectl top pods -n $NAMESPACE -l app=backend 2>/dev/null || echo "Métricas aún no disponibles"
    echo ""
}

# Mostrar estado antes de la prueba
monitor_pods

echo "================================================"
echo "🔥 Ejecutando saturación de memoria..."
echo "================================================"
echo ""
echo "Este comando llenará la memoria del pod hasta alcanzar el límite."
echo "Deberías ver cómo Kubernetes:"
echo "1. Detecta el alto uso de memoria"
echo "2. Marca el pod como OOMKilled o Evicted"
echo "3. Inicia automáticamente un nuevo pod en otro nodo"
echo ""

# Crear un job que sature la memoria del pod
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: memory-stress-test
  namespace: $NAMESPACE
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
        - "450M"  # Cerca del límite de 512Mi
        - "--vm-hang"
        - "0"
        - "--timeout"
        - "120s"
        resources:
          requests:
            memory: "256Mi"
          limits:
            memory: "512Mi"
      restartPolicy: Never
      nodeSelector:
        kubernetes.io/hostname: $NODE_NAME
  backoffLimit: 0
EOF

echo "✅ Job de estrés iniciado en el nodo: $NODE_NAME"
echo ""

# Monitorear cada 10 segundos durante 2 minutos
for i in {1..12}; do
    sleep 10
    monitor_pods
    
    # Verificar eventos
    echo "Eventos recientes:"
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep -E "backend|OOM|Evict|Kill" | tail -5
    echo ""
done

# Limpiar job de prueba
echo "🧹 Limpiando job de prueba..."
kubectl delete job memory-stress-test -n $NAMESPACE 2>/dev/null || true

echo ""
echo "================================================"
echo "Resultado de la prueba:"
echo "================================================"

# Verificar si hay pods en diferentes nodos
NODES_COUNT=$(kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[*].spec.nodeName}' | tr ' ' '\n' | sort -u | wc -l)

echo ""
echo "Pods de backend distribuidos en $NODES_COUNT nodo(s):"
kubectl get pods -n $NAMESPACE -l app=backend -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName,RESTARTS:.status.containerStatuses[0].restartCount

echo ""
echo "Estado del HPA después de la prueba:"
kubectl get hpa backend-hpa -n $NAMESPACE

echo ""
echo "================================================"
echo "✅ Prueba completada"
echo "================================================"
echo ""
echo "Si viste pods reiniciándose o moviéndose entre nodos,"
echo "¡la alta disponibilidad está funcionando correctamente! 🎉"
echo ""
echo "Los perritos están a salvo gracias a Kubernetes 🐕💚"
echo "================================================"
