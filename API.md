# API Documentation - Description-Evaluator

## 📋 Índice

- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Endpoints de Productos](#endpoints-de-productos)
- [Endpoints de Archivos](#endpoints-de-archivos)
- [Modelos de Datos](#modelos-de-datos)
- [Códigos de Error](#códigos-de-error)
- [Ejemplos de Uso](#ejemplos-de-uso)

## 🌐 Información General

### Base URL
```
Development: http://localhost:10000
Production:  http://backend-tp-devops.eastus.azurecontainer.io:10000
```

### Content-Type
```
Content-Type: application/json
```

### Versión de API
```
Version: 1.0.0
```

### Rate Limiting
- **Productos**: 100 requests/minuto
- **Votaciones**: 10 requests/minuto
- **Archivos**: 5 requests/minuto

## 🔐 Autenticación

La API utiliza autenticación basada en tokens JWT proporcionados por Supabase.

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Obtener Token
```javascript
// Frontend con Supabase
const { data: { user } } = await supabase.auth.getUser();
const token = user.access_token;
```

## 📦 Endpoints de Productos

### GET /products

Obtiene todos los productos con sus descripciones y evaluaciones.

#### Request
```http
GET /products HTTP/1.1
Host: localhost:10000
Content-Type: application/json
```

#### Response Success (200)
```json
{
  "products": [
    {
      "id": 1,
      "name": "Smartphone Galaxy S24",
      "og_description": "Smartphone de última generación con cámara avanzada",
      "evaluated": true,
      "vote": 2,
      "descriptions": [
        {
          "id": 1,
          "generated_description": "Descubre el poder de la innovación con el Galaxy S24...",
          "product_id": 1,
          "model": {
            "id": 1,
            "name": "GPT-4",
            "created_at": "2024-01-15T10:30:00Z"
          },
          "condition": {
            "id": 1,
            "description": "Formal",
            "temperature": 30
          }
        },
        {
          "id": 2,
          "generated_description": "¡Experimenta la revolución móvil con el Galaxy S24!...",
          "product_id": 1,
          "model": {
            "id": 2,
            "name": "Claude-3",
            "created_at": "2024-01-15T10:30:00Z"
          },
          "condition": {
            "id": 2,
            "description": "Creativo",
            "temperature": 70
          }
        }
      ],
      "evaluations": [
        {
          "id": 1,
          "evaluated": true,
          "vote": 2,
          "product_id": 1,
          "condition": {
            "id": 1,
            "description": "Formal",
            "temperature": 30
          },
          "model": {
            "id": 2,
            "name": "Claude-3",
            "created_at": "2024-01-15T10:30:00Z"
          }
        }
      ]
    }
  ]
}
```

#### Response Error (500)
```json
{
  "error": "Database connection failed",
  "timestamp": "2024-12-01T15:30:00Z",
  "path": "/products"
}
```

#### Características
- ✅ **Cache Redis**: Datos cacheados por 5 minutos
- ✅ **Eager Loading**: Incluye relaciones en una sola consulta
- ✅ **Performance**: Optimizado para grandes volúmenes de datos

### GET /products/{id}

Obtiene un producto específico por su ID.

#### Request
```http
GET /products/1 HTTP/1.1
Host: localhost:10000
Content-Type: application/json
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID único del producto |

#### Response Success (200)
```json
{
  "product": {
    "id": 1,
    "name": "Smartphone Galaxy S24",
    "og_description": "Smartphone de última generación",
    "evaluated": true,
    "vote": 2,
    "descriptions": [...],
    "evaluations": [...]
  }
}
```

#### Response Error (404)
```json
{
  "error": "Product not found",
  "message": "No product found with ID 999",
  "timestamp": "2024-12-01T15:30:00Z"
}
```

### POST /vote

Registra el voto de un usuario para un producto bajo una condición específica.

#### Request
```http
POST /vote HTTP/1.1
Host: localhost:10000
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "id": 1,
  "model_id": 2,
  "condition_id": 1
}
```

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | integer | Yes | ID del producto |
| model_id | integer | Yes | ID del modelo votado |
| condition_id | integer | No | ID de la condición (default: 1) |

#### Response Success (200)
```json
{
  "message": "Vote registered successfully",
  "product_id": 1,
  "model_id": 2,
  "condition_id": 1,
  "timestamp": "2024-12-01T15:30:00Z"
}
```

#### Response Error (400)
```json
{
  "error": "Missing required fields",
  "message": "Required fields: id, model_id",
  "missing_fields": ["id"],
  "timestamp": "2024-12-01T15:30:00Z"
}
```

#### Response Error (404)
```json
{
  "error": "Product not found",
  "message": "No product found with ID 999",
  "timestamp": "2024-12-01T15:30:00Z"
}
```

#### Características
- ✅ **Cache Invalidation**: Elimina cache automáticamente después del voto
- ✅ **Transaccional**: Operación atómica en base de datos
- ✅ **Validación**: Valida existencia de producto y modelo

## 📄 Endpoints de Archivos

### POST /upload-csv

Sube y procesa un archivo CSV con productos.

#### Request
```http
POST /upload-csv HTTP/1.1
Host: localhost:10000
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Content-Disposition: form-data; name="file"; filename="productos.csv"
Content-Type: text/csv

nombre_producto,descripcion,meta_titulo,meta_descripcion,id_imagen
"Smartphone XYZ","Teléfono inteligente de última generación","Smartphone XYZ - Innovación","El mejor smartphone del mercado","IMG001"
```

#### Form Data
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Archivo CSV con productos |

#### CSV Format
```csv
nombre_producto,descripcion,meta_titulo,meta_descripcion,id_imagen
"Producto 1","Descripción del producto 1","Meta título","Meta descripción","IMG001"
"Producto 2","Descripción del producto 2","Meta título","Meta descripción","IMG002"
```

#### Response Success (200)
```json
{
  "message": "Archivo procesado exitosamente",
  "filename": "productos.csv",
  "records_processed": 150,
  "records_created": 145,
  "records_updated": 5,
  "errors": [],
  "timestamp": "2024-12-01T15:30:00Z"
}
```

#### Response Error (400)
```json
{
  "error": "Invalid file format",
  "message": "El archivo debe ser formato CSV",
  "allowed_formats": [".csv"],
  "timestamp": "2024-12-01T15:30:00Z"
}
```

#### Response Error (413)
```json
{
  "error": "File too large",
  "message": "El archivo excede el tamaño máximo permitido",
  "max_size": "10MB",
  "timestamp": "2024-12-01T15:30:00Z"
}
```

#### Características
- ✅ **Validación**: Verifica formato y estructura del CSV
- ✅ **Procesamiento**: Maneja grandes volúmenes de datos
- ✅ **Error Handling**: Reporta errores específicos por fila

### GET /download-csv

Descarga los datos procesados en formato CSV.

#### Request
```http
GET /download-csv HTTP/1.1
Host: localhost:10000
Authorization: Bearer <jwt_token>
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | No | Formato de descarga (csv, xlsx) |
| filter | string | No | Filtro de datos (all, evaluated, pending) |

#### Response Success (200)
```http
HTTP/1.1 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="productos_export_20241201.csv"

nombre_producto,descripcion,meta_titulo,meta_descripcion,id_imagen,evaluated,vote_model
"Smartphone XYZ","Descripción generada...","Meta título","Meta descripción","IMG001",true,"GPT-4"
```

## 📊 Modelos de Datos

### Product
```json
{
  "id": 1,
  "name": "string",
  "og_description": "string",
  "evaluated": boolean,
  "vote": integer | null,
  "descriptions": [Description],
  "evaluations": [Evaluation]
}
```

### Description
```json
{
  "id": 1,
  "generated_description": "string",
  "product_id": 1,
  "model": Model,
  "condition": Condition
}
```

### Model
```json
{
  "id": 1,
  "name": "string",
  "created_at": "ISO 8601 datetime"
}
```

### Condition
```json
{
  "id": 1,
  "description": "string",
  "temperature": integer
}
```

### Evaluation
```json
{
  "id": 1,
  "evaluated": boolean,
  "vote": integer | null,
  "product_id": 1,
  "condition": Condition,
  "model": Model | null
}
```

## ❌ Códigos de Error

### HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de solicitud inválidos |
| 401 | Unauthorized | Token de autenticación inválido |
| 403 | Forbidden | Permisos insuficientes |
| 404 | Not Found | Recurso no encontrado |
| 413 | Payload Too Large | Archivo demasiado grande |
| 422 | Unprocessable Entity | Error de validación |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error interno del servidor |
| 502 | Bad Gateway | Error de gateway |
| 503 | Service Unavailable | Servicio no disponible |

### Error Response Format
```json
{
  "error": "Error code or type",
  "message": "Human-readable error message",
  "details": {
    "field": "Specific field error",
    "validation": "Validation rule that failed"
  },
  "timestamp": "2024-12-01T15:30:00Z",
  "path": "/api/endpoint",
  "request_id": "uuid-v4"
}
```

### Common Errors

#### Validation Error (422)
```json
{
  "error": "Validation failed",
  "message": "Los datos proporcionados no son válidos",
  "details": {
    "id": "Field is required",
    "model_id": "Must be a positive integer",
    "condition_id": "Must be between 1 and 10"
  },
  "timestamp": "2024-12-01T15:30:00Z"
}
```

#### Rate Limit Error (429)
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60,
  "limit": 10,
  "remaining": 0,
  "timestamp": "2024-12-01T15:30:00Z"
}
```

#### Database Error (500)
```json
{
  "error": "Database connection failed",
  "message": "Unable to connect to database",
  "timestamp": "2024-12-01T15:30:00Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## 💡 Ejemplos de Uso

### JavaScript/Fetch
```javascript
// Obtener productos
const getProducts = async () => {
  try {
    const response = await fetch('http://localhost:10000/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Registrar voto
const registerVote = async (productId, modelId, conditionId = 1) => {
  try {
    const response = await fetch('http://localhost:10000/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: productId,
        model_id: modelId,
        condition_id: conditionId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Vote failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error registering vote:', error);
    throw error;
  }
};

// Subir archivo CSV
const uploadCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://localhost:10000/upload-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading CSV:', error);
    throw error;
  }
};
```

### Python/Requests
```python
import requests
import json

BASE_URL = "http://localhost:10000"
TOKEN = "your_jwt_token_here"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

# Obtener productos
def get_products():
    try:
        response = requests.get(f"{BASE_URL}/products", headers=headers)
        response.raise_for_status()
        return response.json()["products"]
    except requests.exceptions.RequestException as e:
        print(f"Error fetching products: {e}")
        raise

# Registrar voto
def register_vote(product_id, model_id, condition_id=1):
    data = {
        "id": product_id,
        "model_id": model_id,
        "condition_id": condition_id
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/vote",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error registering vote: {e}")
        raise

# Subir archivo CSV
def upload_csv(file_path):
    files = {"file": open(file_path, "rb")}
    auth_headers = {"Authorization": f"Bearer {TOKEN}"}
    
    try:
        response = requests.post(
            f"{BASE_URL}/upload-csv",
            headers=auth_headers,
            files=files
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error uploading CSV: {e}")
        raise
    finally:
        files["file"].close()

# Ejemplo de uso
if __name__ == "__main__":
    # Obtener productos
    products = get_products()
    print(f"Found {len(products)} products")
    
    # Votar por el primer producto
    if products:
        result = register_vote(products[0]["id"], 2)
        print(f"Vote registered: {result['message']}")
```

### cURL Examples
```bash
# Obtener productos
curl -X GET \
  http://localhost:10000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Registrar voto
curl -X POST \
  http://localhost:10000/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": 1,
    "model_id": 2,
    "condition_id": 1
  }'

# Subir archivo CSV
curl -X POST \
  http://localhost:10000/upload-csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@productos.csv"

# Obtener producto específico
curl -X GET \
  http://localhost:10000/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### React Hook Example
```javascript
// hooks/useAPI.js
import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSupabase();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:10000/products', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.access_token) {
      fetchProducts();
    }
  }, [user]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};

export const useVote = () => {
  const { user } = useSupabase();
  
  const submitVote = async (productId, modelId, conditionId = 1) => {
    const response = await fetch('http://localhost:10000/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.access_token}`
      },
      body: JSON.stringify({
        id: productId,
        model_id: modelId,
        condition_id: conditionId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  };

  return { submitVote };
};
```

## 🔄 WebSocket Events (Future)

Para actualizaciones en tiempo real:

```javascript
// Conexión WebSocket
const ws = new WebSocket('ws://localhost:10000/ws');

// Events disponibles
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'vote_registered':
      console.log('New vote:', data.payload);
      break;
    case 'product_updated':
      console.log('Product updated:', data.payload);
      break;
    case 'new_product':
      console.log('New product added:', data.payload);
      break;
  }
};
```

---

**Última actualización:** Diciembre 2024  
**Versión de API:** 1.0.0  
**Documentación generada automáticamente**