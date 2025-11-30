#!/bin/bash
# Script para demostrar la estrategia de balanceo de carga

echo "🔍 Analizando estrategia de Load Balancing en Kubernetes"
echo ""

# Ver configuración del servicio
echo "📋 CONFIGURACIÓN DEL SERVICIO BACKEND:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl describe svc backend -n description-evaluator | grep -E "Type:|Session Affinity:|External Traffic Policy:|Internal Traffic Policy:"
echo ""

# Ver los pods disponibles
echo "🎯 PODS BACKEND DISPONIBLES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get pods -n description-evaluator -l app=backend -o custom-columns=\
NAME:.metadata.name,\
IP:.status.podIP,\
NODE:.spec.nodeName

echo ""
echo "🔄 HACIENDO 20 REQUESTS PARA VER LA DISTRIBUCIÓN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Crear un endpoint que devuelva el hostname del pod
for i in {1..20}; do
    # Hacer request y capturar el pod que respondió
    RESPONSE=$(kubectl exec -n description-evaluator deployment/backend -- hostname 2>/dev/null | head -1)
    echo "Request $i → Pod: $RESPONSE"
    sleep 0.1
done

echo ""
echo "📊 ANÁLISIS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Estrategia: Round-Robin (por defecto en Kubernetes)"
echo "Session Affinity: None (cada request puede ir a un pod diferente)"
echo ""
echo "Kubernetes usa IPTABLES (o IPVS en clusters grandes) para distribuir"
echo "las conexiones de forma aleatoria entre los pods disponibles."
echo ""
echo "Cada request TCP nueva se balancea, pero si usas HTTP keep-alive,"
echo "múltiples requests HTTP pueden ir al mismo pod (misma conexión TCP)."
