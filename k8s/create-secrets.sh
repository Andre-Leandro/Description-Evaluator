#!/bin/bash
# Script para crear Secrets de Kubernetes desde el archivo .env
# Uso: ./create-secrets.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Creando Secrets de Kubernetes desde .env${NC}"

# Verificar que existe el archivo .env
if [ ! -f "../.env" ]; then
    echo -e "${RED}❌ Error: No se encontró el archivo .env en el directorio raíz${NC}"
    echo "Crea un archivo .env con las siguientes variables:"
    echo "  POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB"
    exit 1
fi

# Cargar variables del .env
export $(grep -v '^#' ../.env | xargs)

# Verificar que las variables existen
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_HOST" ]; then
    echo -e "${RED}❌ Error: Faltan variables en el archivo .env${NC}"
    echo "Asegúrate de tener: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB"
    exit 1
fi

# Verificar que el namespace existe
if ! kubectl get namespace description-evaluator &> /dev/null; then
    echo -e "${YELLOW}⚠️  El namespace 'description-evaluator' no existe. Creándolo...${NC}"
    kubectl create namespace description-evaluator
fi

# Eliminar el Secret si ya existe (para actualizarlo)
if kubectl get secret backend-secrets -n description-evaluator &> /dev/null; then
    echo -e "${YELLOW}🔄 Actualizando Secret existente...${NC}"
    kubectl delete secret backend-secrets -n description-evaluator
fi

# Crear el Secret desde las variables de entorno
kubectl create secret generic backend-secrets -n description-evaluator \
  --from-literal=DB_USER="${POSTGRES_USER}" \
  --from-literal=DB_PASSWORD="${POSTGRES_PASSWORD}" \
  --from-literal=DB_HOST="${POSTGRES_HOST}" \
  --from-literal=DB_PORT="${POSTGRES_PORT:-5432}" \
  --from-literal=DB_NAME="${POSTGRES_DB}" \
  --from-literal=REDIS_PASSWORD="${REDIS_PASSWORD:-}"

echo -e "${GREEN}✅ Secret 'backend-secrets' creado exitosamente${NC}"
echo ""
echo "Ahora puedes aplicar los deployments con:"
echo "  kubectl apply -f backend-deployment.yaml"
