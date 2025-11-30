#!/bin/bash
# 🎬 Script de Demostración de Kubernetes - High Availability
# Este script guía una demo paso a paso mostrando cada comando

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Función para pausar y esperar input del usuario
pause() {
    echo ""
    echo -e "${CYAN}${BOLD}➜ Presiona ENTER para continuar...${NC}"
    read
}

# Función para mostrar un paso
step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Función para ejecutar comandos mostrándolos primero
run_cmd() {
    echo -e "${YELLOW}$ $1${NC}"
    eval $1
}

clear
echo -e "${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║      🎬  DEMO DE KUBERNETES - HIGH AVAILABILITY  🎬           ║
║                                                               ║
║  Demostración completa de orquestación con auto-recuperación ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

pause

# ============================================
# PASO 0: LIMPIEZA
# ============================================
step "PASO 0: Limpieza Total 🧹"

echo -e "${GREEN}Explicación:${NC}"
echo "Vamos a empezar desde cero. Eliminaremos cualquier cluster existente."
pause

run_cmd "k3d cluster list"
pause

echo ""
echo -e "${YELLOW}Eliminando cluster si existe...${NC}"
k3d cluster delete description-evaluator 2>/dev/null || echo "No hay cluster para eliminar"
pause

run_cmd "docker ps | grep k3d || echo 'No hay contenedores de k3d corriendo'"
pause

run_cmd "kubectl get nodes 2>&1 | head -5 || echo 'No hay cluster de Kubernetes'"
pause

# ============================================
# PASO 1: CREAR CLUSTER
# ============================================
step "PASO 1: Crear el Cluster de Kubernetes 🏗️"

echo -e "${GREEN}Explicación:${NC}"
echo "• 1 servidor = nodo maestro (control plane)"
echo "• 3 agentes = nodos trabajadores (workers)"
echo "• Puerto 8080 → Frontend web"
echo "• Puerto 10000 → Backend API"
pause

run_cmd "k3d cluster create description-evaluator --servers 1 --agents 3 --port '8080:80@loadbalancer' -p '10000:30000@agent:0'"
pause

# ============================================
# PASO 2: VERIFICAR INFRAESTRUCTURA
# ============================================
step "PASO 2: Verificar la Infraestructura 🔍"

echo -e "${GREEN}Explicación:${NC}"
echo "Ahora veremos los 4 nodos del cluster (1 servidor + 3 agentes)"
pause

run_cmd "kubectl get nodes -o wide"
pause

echo ""
echo -e "${GREEN}Cada nodo es un contenedor Docker:${NC}"
run_cmd "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep k3d"
pause

# ============================================
# PASO 3: IMPORTAR IMÁGENES
# ============================================
step "PASO 3: Importar las Imágenes Docker 📦"

echo -e "${GREEN}Explicación:${NC}"
echo "Importamos las imágenes de backend (Flask) y frontend (Next.js) al cluster"
pause

run_cmd "docker images | grep -E 'REPOSITORY|backend|frontend'"
pause

run_cmd "k3d image import devopsregistrytp.azurecr.io/backend:latest devopsregistrytp.azurecr.io/frontend:latest -c description-evaluator"
pause

# ============================================
# PASO 4: CREAR SECRETS
# ============================================
step "PASO 4: Crear los Secrets 🔐"

echo -e "${GREEN}Explicación:${NC}"
echo "Por seguridad, las credenciales NO están en el código."
echo "Las cargamos desde el archivo .env usando un script."
pause

echo -e "${YELLOW}Variables de entorno (valores ocultos):${NC}"
cat ../.env | grep -E "POSTGRES_|REDIS_" | sed 's/=.*/=***OCULTO***/'
pause

run_cmd "./create-secrets.sh"
pause

run_cmd "kubectl get secrets -n description-evaluator"
pause

# ============================================
# PASO 5: DESPLEGAR APLICACIÓN
# ============================================
step "PASO 5: Desplegar la Aplicación 🚀"

echo -e "${GREEN}Explicación:${NC}"
echo "• Namespace = espacio aislado"
echo "• Redis = caché en memoria"
echo "• Backend = 3 réplicas de la API (Flask + PostgreSQL)"
echo "• Frontend = 2 réplicas de la UI (Next.js)"
echo "• Ingress = enrutamiento HTTP"
echo "• HPA = autoscaling automático"
echo "• PDB = garantía de disponibilidad"
pause

run_cmd "kubectl apply -f namespace.yaml"
run_cmd "kubectl apply -f redis-deployment.yaml"
run_cmd "kubectl apply -f backend-deployment.yaml"
run_cmd "kubectl apply -f frontend-deployment.yaml"
run_cmd "kubectl apply -f ingress.yaml"
run_cmd "kubectl apply -f hpa.yaml"
run_cmd "kubectl apply -f pdb.yaml"

echo ""
echo -e "${YELLOW}⏳ Esperando que los pods arranquen (15 segundos)...${NC}"
sleep 15
pause

# ============================================
# PASO 6: VER DISTRIBUCIÓN
# ============================================
step "PASO 6: Ver la Distribución de Pods 🗺️"

echo -e "${GREEN}Explicación:${NC}"
echo "Los pods se distribuyen en diferentes nodos (anti-affinity)"
echo "Esto garantiza alta disponibilidad: si cae un nodo, los otros siguen."
pause

run_cmd "kubectl get pods -n description-evaluator -o wide"
pause

echo ""
echo -e "${CYAN}Distribución detallada:${NC}"
run_cmd "kubectl get pods -n description-evaluator -o custom-columns=POD:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName,IP:.status.podIP"
pause

# ============================================
# PASO 7: VERIFICAR QUE FUNCIONA
# ============================================
step "PASO 7: Verificar que la App Funciona ✅"

echo -e "${GREEN}Explicación:${NC}"
echo "El backend está conectado a PostgreSQL en Supabase (cloud)"
pause

echo -e "${CYAN}Health check:${NC}"
run_cmd "curl -s http://localhost:10000/health | jq ."
pause

echo ""
echo -e "${CYAN}Productos en la base de datos:${NC}"
run_cmd "curl -s http://localhost:10000/products | jq '.products | length'"
pause

echo ""
echo -e "${GREEN}🌐 Abriendo la aplicación web...${NC}"
run_cmd "open http://localhost:8080"
echo -e "${YELLOW}→ Muestra la aplicación funcionando en el navegador${NC}"
pause

# ============================================
# PASO 8: VER RECURSOS
# ============================================
step "PASO 8: Ver Recursos y Autoscaling 📈"

echo -e "${GREEN}Explicación:${NC}"
echo "El HPA (Horizontal Pod Autoscaler) monitorea CPU y memoria"
echo "Si la carga sube, crea más pods automáticamente"
pause

run_cmd "kubectl get hpa -n description-evaluator"
pause

echo ""
echo -e "${CYAN}Uso de recursos (si kubectl top está disponible):${NC}"
kubectl top pods -n description-evaluator 2>/dev/null || echo "kubectl top no disponible (requiere metrics-server)"
pause

# ============================================
# PASO 9: LA MAGIA - ALTA DISPONIBILIDAD
# ============================================
step "PASO 9: 🎯 LA MAGIA - Demostración de Alta Disponibilidad 💥"

echo -e "${GREEN}Explicación:${NC}"
echo "Voy a eliminar un pod manualmente (simulando un fallo)"
echo "Kubernetes debería:"
echo "  1. Detectar que falta un pod"
echo "  2. Crear uno nuevo automáticamente"
echo "  3. Distribuirlo en otro nodo"
echo "  4. La app sigue funcionando sin interrupción"
pause

echo -e "${CYAN}📸 ANTES:${NC}"
run_cmd "kubectl get pods -n description-evaluator -o custom-columns=POD:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName | grep backend"
pause

POD_TO_DELETE=$(kubectl get pods -n description-evaluator -l app=backend -o jsonpath='{.items[0].metadata.name}')
NODE_BEFORE=$(kubectl get pod $POD_TO_DELETE -n description-evaluator -o jsonpath='{.spec.nodeName}')

echo ""
echo -e "${RED}🔪 Eliminando pod: ${BOLD}$POD_TO_DELETE${NC}${RED} (estaba en $NODE_BEFORE)${NC}"
pause

run_cmd "kubectl delete pod $POD_TO_DELETE -n description-evaluator"

echo ""
echo -e "${YELLOW}⏳ Kubernetes detectó el fallo y está creando un reemplazo...${NC}"
sleep 5

echo ""
echo -e "${CYAN}📸 DESPUÉS:${NC}"
run_cmd "kubectl get pods -n description-evaluator -o custom-columns=POD:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName,AGE:.metadata.creationTimestamp | grep backend"
pause

echo ""
echo -e "${GREEN}✅ Verificando que la app SIGUE funcionando:${NC}"
run_cmd "curl -s http://localhost:10000/products | jq '.products | length'"
pause

echo ""
echo -e "${BOLD}${GREEN}🎉 ¡Fijate! El pod se recuperó automáticamente y la app nunca dejó de funcionar${NC}"
pause

# ============================================
# PASO 10: STRESS TEST (OPCIONAL)
# ============================================
step "PASO 10: (OPCIONAL) Stress Test de Memoria 💣"

echo -e "${GREEN}Explicación:${NC}"
echo "Podemos saturar la memoria de un pod para que se caiga por OOMKilled"
echo "Kubernetes lo reiniciará automáticamente"
echo ""
echo -e "${YELLOW}⚠️  Esto puede causar que el pod se reinicie varias veces${NC}"
echo ""
read -p "¿Querés ejecutar el stress test? (s/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${RED}💣 Saturando memoria...${NC}"
    curl -s http://localhost:10000/stress-memory &
    
    echo ""
    echo -e "${YELLOW}Monitoreando pods (presiona Ctrl+C después de ~20 segundos):${NC}"
    sleep 2
    kubectl get pods -n description-evaluator -l app=backend -w || true
    
    echo ""
    echo -e "${GREEN}Pods después del stress test:${NC}"
    kubectl get pods -n description-evaluator -l app=backend
fi

pause

# ============================================
# PASO 11: VER LOGS
# ============================================
step "PASO 11: Ver Logs y Debugging 🔍"

echo -e "${GREEN}Explicación:${NC}"
echo "Podemos ver los logs de cualquier pod para debugging"
pause

POD=$(kubectl get pods -n description-evaluator -l app=backend -o jsonpath='{.items[0].metadata.name}')
echo -e "${CYAN}📋 Últimas 20 líneas del log de ${BOLD}$POD${NC}:"
run_cmd "kubectl logs $POD -n description-evaluator --tail=20"
pause

# ============================================
# PASO 12: RESUMEN
# ============================================
step "PASO 12: Resumen Final 📊"

echo -e "${GREEN}Ver todos los recursos del namespace:${NC}"
run_cmd "kubectl get all -n description-evaluator"
pause

echo ""
echo -e "${MAGENTA}${BOLD}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                    🎯 PUNTOS CLAVE                            ║
╠═══════════════════════════════════════════════════════════════╣
║  ✅ Infraestructura como Código (YAML)                        ║
║  ✅ Alta Disponibilidad (múltiples réplicas)                  ║
║  ✅ Auto-recuperación (pods se recrean automáticamente)       ║
║  ✅ Escalado Automático (HPA)                                 ║
║  ✅ Seguridad (Secrets separados del código)                  ║
║  ✅ Monitoreo (logs, métricas, health checks)                 ║
║  ✅ Portabilidad (dev = producción)                           ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${CYAN}Aplicación corriendo en:${NC}"
echo -e "  Frontend: ${BOLD}http://localhost:8080${NC}"
echo -e "  Backend:  ${BOLD}http://localhost:10000${NC}"

echo ""
read -p "¿Querés eliminar el cluster? (s/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    run_cmd "k3d cluster delete description-evaluator"
    echo -e "${GREEN}✅ Cluster eliminado${NC}"
else
    echo ""
    echo -e "${YELLOW}El cluster sigue corriendo. Para eliminarlo luego ejecuta:${NC}"
    echo "  k3d cluster delete description-evaluator"
fi

echo ""
echo -e "${GREEN}${BOLD}🎬 ¡FIN DE LA DEMO! 🎬${NC}"
echo ""
