# Documentación de API - Description Evaluator

## Información General

**Base URL**: `http://backend-tp-devops.eastus.azurecontainer.io:10000` (Producción)  
**Base URL Local**: `http://localhost:10000` (Desarrollo)  
**Formato**: JSON  
**Autenticación**: No requerida (MVP)  
**CORS**: Habilitado para todos los orígenes  

## Endpoints de Productos

### GET /products

Obtiene la lista completa de productos con sus descripciones y evaluaciones.

**Características:**
- Implementa cache con Redis (TTL: 5 minutos)
- Incluye todas las relaciones (descripciones, evaluaciones)
- Fallback a base de datos si cache falla

**Request:**
```http
GET /products HTTP/1.1
Host: localhost:10000
Accept: application/json
```

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": 4186694,
      "name": "Termo Critter",
      "og_description": "¡Haz que la hidratación sea divertida con el Termo Critter Hot Focus! Este termo de 600ml...",
      "evaluated": true,
      "vote": 2,
      "descriptions": [
        {
          "id": 1,
          "generated_description": "META TÍTULO: Termo Critter Hot Focus: Diseño Infantil...",
          "product_id": 4186694,
          "model": {
            "id": 2,
            "name": "us.amazon.nova-premier-v1:0",
            "created_at": "2024-12-01T10:00:00.000Z"
          },
          "condition": {
            "id": 3,
            "description": "meta_seo_v2",
            "temperature": 80
          }
        }
      ],
      "evaluations": [
        {
          "id": 1,
          "evaluated": true,
          "vote": 2,
          "product_id": 4186694,
          "condition": {
            "id": 3,
            "description": "meta_seo_v2",
            "temperature": 80
          },
          "model": {
            "id": 2,
            "name": "us.amazon.nova-premier-v1:0",
            "created_at": "2024-12-01T10:00:00.000Z"
          }
        }
      ]
    }
  ]
}
```

**Códigos de Estado:**
- `200` - Éxito
- `500` - Error del servidor

---

### GET /products/{id}

Obtiene un producto específico por su ID con todas sus descripciones y evaluaciones.

**Parámetros de URL:**
- `id` (integer, requerido): ID del producto

**Request:**
```http
GET /products/4186694 HTTP/1.1
Host: localhost:10000
Accept: application/json
```

**Response (200 OK):**
```json
{
  "product": {
    "id": 4186694,
    "name": "Termo Critter",
    "og_description": "¡Haz que la hidratación sea divertida...",
    "evaluated": true,
    "vote": 2,
    "descriptions": [...],
    "evaluations": [...]
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Product not found"
}
```

**Códigos de Estado:**
- `200` - Producto encontrado
- `404` - Producto no encontrado
- `500` - Error del servidor

---

### POST /vote

Registra un voto para un producto bajo una condición específica.

**Request Body:**
```json
{
  "id": 4186694,           // ID del producto (requerido)
  "model_id": 2,           // ID del modelo votado (requerido)  
  "condition_id": 1        // ID de la condición (opcional, default: 1)
}
```

**Request:**
```http
POST /vote HTTP/1.1
Host: localhost:10000
Content-Type: application/json
Accept: application/json

{
  "id": 4186694,
  "model_id": 2,
  "condition_id": 1
}
```

**Response (200 OK):**
```json
{
  "message": "Vote registered successfully",
  "product_id": 4186694,
  "model_id": 2,
  "condition_id": 1
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Missing required fields. Required: id, model_id"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Product not found"
}
```

**Efectos Secundarios:**
- Invalida automáticamente el cache de productos
- Actualiza las estadísticas de evaluación
- Registra timestamp del voto

**Códigos de Estado:**
- `200` - Voto registrado exitosamente
- `400` - Campos requeridos faltantes
- `404` - Producto no encontrado
- `500` - Error del servidor

## Endpoints de Archivos

### POST /upload-csv

Permite cargar archivos CSV con datos de productos para procesamiento.

**Request:**
```http
POST /upload-csv HTTP/1.1
Host: localhost:10000
Content-Type: multipart/form-data

--boundary123
Content-Disposition: form-data; name="file"; filename="productos.csv"
Content-Type: text/csv

id,nombre,descripcion_original,descripcion_generada
4186694,Termo Critter,Descripción original...,Descripción generada...
--boundary123--
```

**Validaciones:**
- Archivo debe tener extensión `.csv`
- Archivo no puede estar vacío
- Debe ser un CSV válido
- Tamaño máximo: 10MB (configurable)

**Response (200 OK):**
```json
{
  "message": "Archivo procesado correctamente",
  "filename": "productos.csv",
  "records_processed": 150,
  "records_inserted": 145,
  "records_updated": 5,
  "errors": []
}
```

**Response (400 Bad Request):**
```json
{
  "error": "El archivo debe ser formato CSV"
}
```

**Posibles Errores:**
- `"No se encontró archivo en la petición"`
- `"No se seleccionó ningún archivo"`  
- `"El archivo debe ser formato CSV"`
- `"Archivo CSV inválido o corrupto"`

**Códigos de Estado:**
- `200` - Archivo procesado exitosamente
- `400` - Archivo inválido o formato incorrecto
- `413` - Archivo demasiado grande
- `500` - Error en el procesamiento

## Endpoint de Salud

### GET /

Endpoint simple para verificar que la API esté funcionando.

**Request:**
```http
GET / HTTP/1.1
Host: localhost:10000
```

**Response (200 OK):**
```
La API está corriendo correctamente.
```

## Modelos de Datos

### Product
```json
{
  "id": "integer",
  "name": "string",
  "og_description": "string",
  "evaluated": "boolean",
  "vote": "integer|null",
  "descriptions": "array<Description>",
  "evaluations": "array<Evaluation>"
}
```

### Description
```json
{
  "id": "integer",
  "generated_description": "string",
  "product_id": "integer",
  "model": "Model",
  "condition": "Condition"
}
```

### Model
```json
{
  "id": "integer",
  "name": "string",
  "created_at": "string (ISO 8601)"
}
```

### Condition
```json
{
  "id": "integer", 
  "description": "string",
  "temperature": "integer"
}
```

### Evaluation
```json
{
  "id": "integer",
  "evaluated": "boolean",
  "vote": "integer|null",
  "product_id": "integer",
  "condition": "Condition",
  "model": "Model|null"
}
```

## Sistema de Cache

### Estrategia Cache-Aside

1. **Cache Hit**: Datos devueltos directamente desde Redis
2. **Cache Miss**: Consulta a PostgreSQL → Cache en Redis → Respuesta
3. **Cache Invalidation**: Eliminación automática tras escrituras

### Configuración de Cache

- **TTL**: 5 minutos (300 segundos)
- **Keys**: `products` (lista completa)
- **Invalidation**: Automática en operaciones POST/PUT/DELETE
- **Fallback**: Aplicación funciona aunque Redis falle

### Headers de Cache

```http
X-Cache: HIT|MISS
X-Cache-TTL: 300
```

## Rate Limiting

**Límites actuales (MVP):**
- Sin límites implementados
- Preparado para implementar con Flask-Limiter

**Límites recomendados para producción:**
- GET requests: 100/minuto por IP
- POST requests: 20/minuto por IP
- Upload requests: 5/minuto por IP

## Manejo de Errores

### Formato de Error Estándar

```json
{
  "error": "Descripción del error",
  "code": "ERROR_CODE",
  "timestamp": "2024-12-01T10:00:00.000Z",
  "path": "/products/999999"
}
```

### Códigos de Error Comunes

- `400` - Bad Request (datos inválidos)
- `404` - Not Found (recurso no encontrado)
- `413` - Payload Too Large (archivo muy grande)
- `422` - Unprocessable Entity (datos válidos pero lógicamente incorrectos)
- `500` - Internal Server Error (error del servidor)
- `503` - Service Unavailable (servicio temporalmente no disponible)

## Ejemplos de Integración

### JavaScript/Fetch

```javascript
// Obtener productos
const products = await fetch('http://localhost:10000/products')
  .then(res => res.json());

// Registrar voto
const vote = await fetch('http://localhost:10000/vote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 4186694,
    model_id: 2,
    condition_id: 1
  })
}).then(res => res.json());
```

### Python/Requests

```python
import requests

# Obtener productos
response = requests.get('http://localhost:10000/products')
products = response.json()

# Registrar voto
vote_data = {
    'id': 4186694,
    'model_id': 2,
    'condition_id': 1
}
response = requests.post('http://localhost:10000/vote', json=vote_data)
result = response.json()
```

### cURL

```bash
# Obtener productos
curl -X GET http://localhost:10000/products \
  -H "Accept: application/json"

# Registrar voto
curl -X POST http://localhost:10000/vote \
  -H "Content-Type: application/json" \
  -d '{"id": 4186694, "model_id": 2, "condition_id": 1}'

# Subir CSV
curl -X POST http://localhost:10000/upload-csv \
  -F "file=@productos.csv"
```

## Testing de API

### Colección Postman

Disponible en: `docs/Description-Evaluator.postman_collection.json`

### Tests Automatizados

```bash
# Ejecutar tests de API
cd backend
pytest test_api.py -v

# Con cobertura
pytest test_api.py --cov=. --cov-report=html
```

## Versionado de API

**Versión Actual**: v1 (implícita)  
**Estrategia**: Path-based versioning para futuras versiones  
**Ejemplo futuro**: `/api/v2/products`

## Changelog

### v1.0.0 (Actual)
- ✅ CRUD de productos
- ✅ Sistema de votación
- ✅ Upload de CSV
- ✅ Cache con Redis
- ✅ Documentación completa