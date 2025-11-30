#!/bin/bash
# Script para desplegar la aplicación en k3s

set -e

NAMESPACE="description-evaluator"

echo "================================================"
echo "Desplegando Description Evaluator en k3s"
echo "================================================"

# Verificar que kubectl funciona
if ! kubectl get nodes &> /dev/null; then
    echo "❌ Error: kubectl no está configurado o k3s no está corriendo"
    exit 1
fi

echo "✅ k3s está corriendo"
echo ""

# Crear namespace
echo "📦 Creando namespace..."
kubectl apply -f namespace.yaml

# Aplicar secrets (IMPORTANTE: actualizar con valores reales antes)
echo "🔐 Aplicando secrets..."
kubectl apply -f backend-deployment.yaml

# Desplegar Redis
echo "🗄️  Desplegando Redis..."
kubectl apply -f redis-deployment.yaml

# Esperar a que Redis esté listo
echo "⏳ Esperando a que Redis esté listo..."
kubectl wait --for=condition=available --timeout=120s deployment/redis -n $NAMESPACE

# Desplegar Backend
echo "🔧 Desplegando Backend..."
kubectl apply -f backend-deployment.yaml

# Esperar a que Backend tenga al menos 1 pod listo
echo "⏳ Esperando a que Backend esté listo..."
kubectl wait --for=condition=available --timeout=180s deployment/backend -n $NAMESPACE

# Desplegar Frontend
echo "🌐 Desplegando Frontend..."
kubectl apply -f frontend-deployment.yaml

# Esperar a que Frontend esté listo
echo "⏳ Esperando a que Frontend esté listo..."
kubectl wait --for=condition=available --timeout=180s deployment/frontend -n $NAMESPACE

# Aplicar Ingress
echo "🌍 Configurando Ingress..."
kubectl apply -f ingress.yaml

# Aplicar HPA
echo "📈 Configurando HPA..."
kubectl apply -f hpa.yaml

# Aplicar PDB
echo "🛡️  Configurando PodDisruptionBudgets..."
kubectl apply -f pdb.yaml

echo ""
echo "================================================"
echo "✅ ¡Despliegue completado!"
echo "================================================"

# Mostrar estado
echo ""
echo "Estado de los pods:"
kubectl get pods -n $NAMESPACE

echo ""
echo "Estado de los servicios:"
kubectl get svc -n $NAMESPACE

echo ""
echo "Estado del Ingress:"
kubectl get ingress -n $NAMESPACE

echo ""
echo "Estado del HPA:"
kubectl get hpa -n $NAMESPACE

# Obtener IP del LoadBalancer
echo ""
echo "================================================"
echo "Acceso a la aplicación:"
echo "================================================"
EXTERNAL_IP=$(kubectl get svc traefik -n kube-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pendiente...")

if [ "$EXTERNAL_IP" != "Pendiente..." ]; then
    echo "🌐 URL: http://$EXTERNAL_IP"
else
    echo "⏳ El LoadBalancer aún está asignando una IP..."
    echo "   Ejecuta: kubectl get svc -n kube-system traefik"
fi

echo ""
echo "Para ver los logs:"
echo "  kubectl logs -f deployment/backend -n $NAMESPACE"
echo "  kubectl logs -f deployment/frontend -n $NAMESPACE"
echo ""
echo "Para ejecutar la prueba de saturación de memoria:"
echo "  ./test-memory-saturation.sh"
echo "================================================"
