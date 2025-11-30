# Secrets de Kubernetes

Este directorio contiene los manifiestos de Kubernetes para el proyecto Description Evaluator.

## ⚠️ Seguridad de Credenciales

Las credenciales sensibles (passwords, usuarios de BD, etc.) **NO** están incluidas en los archivos YAML para evitar exposición en el control de versiones.

### Configuración de Secrets

Antes de desplegar la aplicación, debes crear los Secrets de Kubernetes desde tu archivo `.env`:

```bash
# 1. Asegúrate de tener un archivo .env en la raíz del proyecto con:
#    POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB

# 2. Ejecuta el script para crear los Secrets
cd k8s
./create-secrets.sh
```

El script `create-secrets.sh` lee las variables del archivo `.env` y crea el Secret `backend-secrets` en Kubernetes de forma segura, sin exponer las credenciales en el código fuente.

### Despliegue

Una vez creados los Secrets:

```bash
# Aplicar todos los manifiestos
kubectl apply -f namespace.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml
```

O usar el archivo consolidado:

```bash
kubectl apply -f all-in-one.yaml
```

### Verificación

```bash
# Ver el estado de los pods
kubectl get pods -n description-evaluator

# Ver los secrets (sin mostrar valores)
kubectl get secrets -n description-evaluator

# Probar el backend
curl http://localhost:10000/health
```

## Archivos

- `backend-deployment.yaml` - Backend (Flask) con ConfigMap (NO incluye Secret)
- `frontend-deployment.yaml` - Frontend (Next.js)
- `redis-deployment.yaml` - Redis cache
- `ingress.yaml` - Configuración de Ingress (Traefik)
- `hpa.yaml` - HorizontalPodAutoscaler para autoescalado
- `pdb.yaml` - PodDisruptionBudget para alta disponibilidad
- `create-secrets.sh` - Script para crear Secrets desde .env (⭐ usar este)
- `all-in-one.yaml` - Todos los manifiestos consolidados

## Importante

- **NUNCA** hagas commit de archivos `.env` o Secrets con credenciales reales
- El archivo `.env` debe estar en `.gitignore`
- Usa `create-secrets.sh` para gestionar credenciales de forma segura
