#!/bin/bash
# Script de verificación de instalación de k3s

echo "================================================"
echo "Verificación de Instalación de k3s"
echo "================================================"
echo ""

# Función para mostrar estado
show_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1"
        return 1
    fi
}

# Verificar si k3s está instalado
echo "Verificando instalación de k3s..."
if command -v k3s &> /dev/null; then
    K3S_VERSION=$(k3s --version | head -n1)
    show_status "k3s instalado: $K3S_VERSION"
else
    echo "❌ k3s no está instalado"
    echo "   Ejecuta: ./install-k3s-master.sh o ./install-k3s-worker.sh"
    exit 1
fi

echo ""

# Verificar kubectl
echo "Verificando kubectl..."
if command -v kubectl &> /dev/null; then
    show_status "kubectl disponible"
else
    echo "❌ kubectl no disponible"
    exit 1
fi

echo ""

# Verificar conexión al cluster
echo "Verificando conexión al cluster..."
if kubectl get nodes &> /dev/null; then
    show_status "Conectado al cluster k3s"
else
    echo "❌ No se puede conectar al cluster"
    echo "   Verifica que k3s esté corriendo: sudo systemctl status k3s"
    exit 1
fi

echo ""

# Mostrar nodos
echo "================================================"
echo "Nodos del Cluster:"
echo "================================================"
kubectl get nodes -o wide

echo ""

# Verificar componentes del sistema
echo "================================================"
echo "Componentes del Sistema:"
echo "================================================"
kubectl get pods -n kube-system

echo ""

# Verificar si la app está desplegada
if kubectl get namespace description-evaluator &> /dev/null; then
    echo "================================================"
    echo "Aplicación Description Evaluator:"
    echo "================================================"
    
    echo ""
    echo "Pods:"
    kubectl get pods -n description-evaluator -o wide
    
    echo ""
    echo "Servicios:"
    kubectl get svc -n description-evaluator
    
    echo ""
    echo "Ingress:"
    kubectl get ingress -n description-evaluator
    
    echo ""
    echo "HPA:"
    kubectl get hpa -n description-evaluator
    
    echo ""
    echo "Estado de salud de los pods:"
    BACKEND_READY=$(kubectl get pods -n description-evaluator -l app=backend --no-headers 2>/dev/null | grep -c "Running")
    FRONTEND_READY=$(kubectl get pods -n description-evaluator -l app=frontend --no-headers 2>/dev/null | grep -c "Running")
    REDIS_READY=$(kubectl get pods -n description-evaluator -l app=redis --no-headers 2>/dev/null | grep -c "Running")
    
    echo "  Backend:  $BACKEND_READY pods running"
    echo "  Frontend: $FRONTEND_READY pods running"
    echo "  Redis:    $REDIS_READY pods running"
    
    echo ""
    
    # Obtener URL de acceso
    echo "================================================"
    echo "URLs de Acceso:"
    echo "================================================"
    
    EXTERNAL_IP=$(kubectl get svc traefik -n kube-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    if [ -n "$EXTERNAL_IP" ]; then
        echo "  🌐 Aplicación: http://$EXTERNAL_IP"
        echo "  🔥 Prueba de saturación: http://$EXTERNAL_IP/stress-memory"
    else
        echo "  ⏳ LoadBalancer aún asignando IP externa..."
        echo "     Ejecuta: kubectl get svc -n kube-system traefik"
    fi
else
    echo "================================================"
    echo "Aplicación no desplegada"
    echo "================================================"
    echo "Para desplegar la aplicación, ejecuta:"
    echo "  ./deploy.sh"
fi

echo ""
echo "================================================"
echo "Métricas del Cluster:"
echo "================================================"

if kubectl top nodes &> /dev/null; then
    kubectl top nodes
    echo ""
    
    if kubectl get namespace description-evaluator &> /dev/null; then
        echo "Métricas de la aplicación:"
        kubectl top pods -n description-evaluator
    fi
else
    echo "⏳ Metrics-server aún no disponible"
    echo "   Las métricas estarán disponibles en unos minutos"
fi

echo ""
echo "================================================"
echo "✅ Verificación Completada"
echo "================================================"
echo ""
echo "Comandos útiles:"
echo "  kubectl get all -n description-evaluator     # Ver todos los recursos"
echo "  kubectl logs -f deployment/backend -n description-evaluator  # Ver logs"
echo "  ./test-memory-saturation.sh                 # Probar HA"
echo "================================================"
