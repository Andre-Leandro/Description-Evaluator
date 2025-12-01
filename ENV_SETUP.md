# Configuración de Variables de Entorno

Este documento describe todas las variables de entorno necesarias para ejecutar el proyecto Description-Evaluator.

## 📋 Archivos de Configuración

### `.env` (Raíz del proyecto)
Variables para Docker Compose y configuración general del proyecto.

### `backend/.env`
Variables específicas para el servicio backend cuando se ejecuta localmente.

## 🔑 Variables de Entorno Requeridas

### Base de Datos (Supabase PostgreSQL)

| Variable | Descripción | Valor por defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `db_user` | Usuario de la base de datos | - | `postgres.illglqdcmfjqktkyxhhh` |
| `db_password` | Contraseña de la base de datos | - | `Strata-ce-2025` |
| `db_host` | Host de la base de datos | - | `aws-0-us-east-2.pooler.supabase.com` |
| `db_port` | Puerto de la base de datos | `6543` | `6543` |
| `db_name` | Nombre de la base de datos | `postgres` | `postgres` |

**Nota:** También se mantienen las variables con prefijo `POSTGRES_*` para compatibilidad.

### Redis

| Variable | Descripción | Valor por defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `REDIS_HOST` | Host del servidor Redis | `redis` | `redis` (Docker) / `localhost` (local) |
| `REDIS_PORT` | Puerto del servidor Redis | `6379` | `6379` |
| `REDIS_PASSWORD` | Contraseña de Redis (opcional) | - | - |

### OpenTelemetry (Observabilidad)

| Variable | Descripción | Valor por defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Endpoint del colector OTLP | `http://otel-collector:4317` | `http://otel-collector:4317` |
| `OTEL_SERVICE_NAME` | Nombre del servicio para trazas | `backend-service` | `backend-service` |
| `ENVIRONMENT` | Ambiente de ejecución | `development` | `production` / `development` |

### Frontend (Next.js)

| Variable | Descripción | Valor por defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend API | - | `http://localhost:10000` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | - | `https://illglqdcmfjqktkyxhhh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase | - | `sb_publishable_...` |

### Aplicación

| Variable | Descripción | Valor por defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `PORT` | Puerto del backend | `10000` | `10000` |

## 🚀 Configuración Rápida

### Para Docker Compose:
```bash
# Las variables ya están configuradas en .env
docker-compose up -d
```

### Para Kubernetes:
```bash
# Crear ConfigMap desde el archivo .env
kubectl create configmap backend-config --from-env-file=.env

# Crear Secret para datos sensibles
kubectl create secret generic backend-secrets \
  --from-literal=db_password="Strata-ce-2025" \
  --from-literal=db_user="postgres.illglqdcmfjqktkyxhhh"
```

### Para desarrollo local del backend:
```bash
cd backend
# Asegúrate de que .env existe con las variables correctas
# Cambia REDIS_HOST=localhost si ejecutas Redis localmente
python main.py
```

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- Nunca subir archivos `.env` al repositorio
- Los archivos `.env.example` son plantillas sin valores sensibles
- En producción, usar secretos de Kubernetes o servicios de gestión de secretos
- Rotar credenciales regularmente

## ✅ Validación

Para validar que todas las variables están configuradas correctamente:

```bash
# Verificar variables en Docker Compose
docker-compose config

# Verificar conexión a la base de datos
cd backend
python -c "from db import engine; print('✅ DB OK' if engine else '❌ DB Failed')"
```

## 🐛 Troubleshooting

### Error: "Missing environment variables"
- Verificar que el archivo `.env` existe en la raíz del proyecto
- Verificar que `backend/.env` existe
- Verificar que todas las variables requeridas están definidas

### Error: "Database connection failed"
- Verificar credenciales de Supabase
- Verificar conectividad al host de Supabase
- Verificar que el puerto sea correcto (6543 para pooler)

### Error: "Redis connection failed"
- Verificar que Redis está ejecutándose
- Verificar que `REDIS_HOST` apunta al host correcto
- En local: `localhost`, en Docker: `redis`

## 📝 Notas Adicionales

- El backend usa `python-dotenv` para cargar variables automáticamente
- Docker Compose interpola variables del archivo `.env` automáticamente
- Las variables con prefijo `NEXT_PUBLIC_` son expuestas al cliente en Next.js
- En Kubernetes, las variables se configuran mediante ConfigMaps y Secrets
