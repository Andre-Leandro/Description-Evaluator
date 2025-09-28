# Guía de Desarrollo - Description-Evaluator

## 📋 Índice

- [Setup del Entorno de Desarrollo](#setup-del-entorno-de-desarrollo)
- [Estructura del Código](#estructura-del-código)
- [Estándares de Codificación](#estándares-de-codificación)
- [Testing](#testing)
- [Debugging](#debugging)
- [Performance](#performance)
- [Contribución](#contribución)

## 🚀 Setup del Entorno de Desarrollo

### Requisitos del Sistema

```bash
# Versiones mínimas requeridas
node >= 20.0.0
npm >= 10.0.0
python >= 3.11
docker >= 20.10
docker-compose >= 2.0
git >= 2.30
```

### 1. Configuración Inicial

```bash
# 1. Clonar repositorio
git clone https://github.com/Andre-Leandro/Description-Evaluator.git
cd Description-Evaluator

# 2. Configurar Git hooks (opcional)
cp .githooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit

# 3. Crear archivos de configuración
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 2. Desarrollo con Docker (Recomendado)

```bash
# Desarrollo con hot-reload
docker compose -f docker-compose.dev.yml up --build

# Solo servicios externos (Redis, PostgreSQL)
docker compose up redis postgres -d

# Logs en tiempo real
docker compose logs -f backend frontend
```

### 3. Desarrollo Manual

#### Frontend Setup
```bash
cd frontend

# Instalar dependencias
npm install

# Modo desarrollo con Turbopack
npm run dev

# Build para testing
npm run build
npm start

# Linting y formato
npm run lint
npm run lint:fix
```

#### Backend Setup
```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Dependencias de desarrollo

# Variables de entorno
export FLASK_ENV=development
export FLASK_DEBUG=1

# Ejecutar servidor con hot-reload
flask run --host=0.0.0.0 --port=10000 --reload
```

### 4. Base de Datos Local

```bash
# PostgreSQL con Docker
docker run -d \
  --name postgres-dev \
  -e POSTGRES_DB=description_evaluator \
  -e POSTGRES_USER=dev_user \
  -e POSTGRES_PASSWORD=dev_pass \
  -p 5432:5432 \
  postgres:15

# Crear tablas
cd backend
python -c "from db import create_tables; create_tables()"

# Poblar con datos de prueba
python scripts/seed_data.py
```

## 📁 Estructura del Código

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── page.js            # Homepage
│   │   ├── layout.js          # Layout principal
│   │   ├── loading.js         # Loading UI
│   │   ├── error.js           # Error boundary
│   │   └── pages/             # Páginas de la aplicación
│   │       ├── MainTabs.jsx   # Componente principal con tabs
│   │       ├── DescriptionVoting.jsx  # Evaluación comparativa
│   │       ├── CSVUpload.jsx  # Carga de archivos
│   │       ├── Results.jsx    # Dashboard resultados
│   │       └── CSVDownload.jsx # Descarga de datos
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes UI base
│   │   ├── Sidebar.jsx       # Navegación lateral
│   │   └── common/           # Componentes comunes
│   ├── hooks/                # Custom React hooks
│   │   ├── useProducts.js    # Hook para productos
│   │   ├── useVote.js        # Hook para votaciones
│   │   └── useSupabase.js    # Hook para Supabase
│   ├── lib/                  # Utilities y helpers
│   │   ├── api.js           # Cliente API
│   │   ├── supabase.js      # Cliente Supabase
│   │   └── utils.js         # Funciones utilitarias
│   └── styles/              # Estilos globales
├── public/                  # Assets estáticos
├── package.json
├── next.config.js           # Configuración Next.js
├── tailwind.config.js       # Configuración Tailwind
└── jsconfig.json           # Configuración JavaScript
```

### Backend (Flask)

```
backend/
├── main.py                 # Punto de entrada Flask
├── config.py              # Configuración de la aplicación
├── models.py              # Modelos SQLAlchemy
├── db.py                  # Configuración base de datos
├── routes/                # Blueprints de rutas
│   ├── __init__.py
│   ├── product_routes.py  # Endpoints de productos
│   └── file_routes.py     # Endpoints de archivos
├── services/              # Lógica de negocio
│   ├── __init__.py
│   ├── product_service.py # Servicio de productos
│   ├── file_service.py    # Servicio de archivos
│   └── cache_service.py   # Servicio de cache
├── utils/                 # Utilidades
│   ├── __init__.py
│   ├── validators.py      # Validadores
│   └── helpers.py         # Funciones auxiliares
├── tests/                 # Tests
│   ├── __init__.py
│   ├── test_api.py        # Tests de API
│   ├── test_models.py     # Tests de modelos
│   └── test_services.py   # Tests de servicios
├── scripts/               # Scripts utilitarios
│   ├── seed_data.py       # Poblar datos de prueba
│   └── migrate.py         # Migraciones de DB
├── requirements.txt       # Dependencias producción
├── requirements-dev.txt   # Dependencias desarrollo
└── Dockerfile
```

## 📝 Estándares de Codificación

### Frontend (JavaScript/React)

#### 1. Naming conventions

```javascript
// Componentes: PascalCase
const DescriptionVoting = () => {}

// Hooks: camelCase con prefijo 'use'
const useProducts = () => {}

// Variables y funciones: camelCase
const productList = []
const handleSubmit = () => {}

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:10000'

// Archivos de componentes: PascalCase.jsx
// DescriptionVoting.jsx
// MainTabs.jsx
```

#### 2. Estructura de Componentes

```javascript
// Importaciones en orden
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

/**
 * Componente para evaluar descripciones de productos
 * @param {Object} props - Props del componente
 * @param {number} props.productId - ID del producto
 * @param {Function} props.onVote - Callback al votar
 */
const DescriptionVoting = ({ productId, onVote }) => {
  // 1. Estado local
  const [selectedModel, setSelectedModel] = useState(null);
  
  // 2. Hooks personalizados
  const { products, loading, error } = useProducts();
  
  // 3. Efectos
  useEffect(() => {
    // Lógica de efectos
  }, [productId]);
  
  // 4. Handlers
  const handleVote = (modelId) => {
    setSelectedModel(modelId);
    onVote(productId, modelId);
  };
  
  // 5. Early returns
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // 6. Render
  return (
    <div className={cn("p-4 bg-white rounded-lg", className)}>
      {/* JSX */}
    </div>
  );
};

// PropTypes
DescriptionVoting.propTypes = {
  productId: PropTypes.number.isRequired,
  onVote: PropTypes.func.isRequired,
};

export default DescriptionVoting;
```

#### 3. Hooks Personalizados

```javascript
// hooks/useProducts.js
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

/**
 * Hook para gestionar productos
 * @returns {Object} Estado y funciones de productos
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products');
      setProducts(response.data.products);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};
```

### Backend (Python)

#### 1. Naming Conventions

```python
# Clases: PascalCase
class ProductService:
    pass

# Funciones y variables: snake_case
def get_all_products():
    pass

product_list = []

# Constantes: UPPER_SNAKE_CASE
API_VERSION = "1.0.0"
DEFAULT_PAGE_SIZE = 20

# Archivos: snake_case.py
# product_service.py
# file_routes.py
```

#### 2. Estructura de Módulos

```python
"""
Servicio para gestión de productos.

Este módulo contiene la lógica de negocio para operaciones
relacionadas con productos y evaluaciones.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from models import Product, Description, Evaluation
from utils.validators import validate_product_data
from services.cache_service import CacheService

import logging

logger = logging.getLogger(__name__)


class ProductService:
    """Servicio para operaciones de productos."""
    
    def __init__(self, db_session: Session):
        """
        Inicializar el servicio.
        
        Args:
            db_session: Sesión de base de datos SQLAlchemy
        """
        self.db = db_session
        self.cache = CacheService()
    
    def get_all_products(self) -> List[Dict[str, Any]]:
        """
        Obtener todos los productos con sus evaluaciones.
        
        Returns:
            Lista de productos con sus datos relacionados
            
        Raises:
            ServiceError: Error al obtener productos
        """
        try:
            # Intentar obtener del cache
            cached_products = self.cache.get('products')
            if cached_products:
                logger.info("Serving products from cache")
                return cached_products
            
            # Consultar base de datos
            products = (
                self.db.query(Product)
                .options(joinedload(Product.descriptions))
                .all()
            )
            
            # Transformar a diccionario
            result = [product.to_dict() for product in products]
            
            # Cachear resultado
            self.cache.set('products', result, ttl=300)
            
            logger.info(f"Retrieved {len(result)} products from database")
            return result
            
        except SQLAlchemyError as e:
            logger.error(f"Database error getting products: {e}")
            raise ServiceError("Error retrieving products") from e
```

#### 3. Estructura de Rutas

```python
"""Rutas para operaciones de productos."""

from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from services.product_service import ProductService
from schemas.product_schema import ProductSchema, VoteSchema
from utils.decorators import require_auth, rate_limit
from utils.responses import success_response, error_response

import logging

logger = logging.getLogger(__name__)

product_routes = Blueprint('products', __name__)
product_schema = ProductSchema()
vote_schema = VoteSchema()


@product_routes.route('/products', methods=['GET'])
@rate_limit(requests=100, per=60)  # 100 requests per minute
def get_products():
    """
    Obtener todos los productos.
    
    Returns:
        JSON: Lista de productos con evaluaciones
    """
    try:
        service = ProductService(db.session)
        products = service.get_all_products()
        
        return success_response(
            data={'products': products},
            message='Products retrieved successfully'
        )
        
    except ServiceError as e:
        logger.error(f"Service error in get_products: {e}")
        return error_response(
            message=str(e),
            status_code=500
        )


@product_routes.route('/vote', methods=['POST'])
@require_auth
@rate_limit(requests=10, per=60)  # 10 votes per minute
def register_vote():
    """
    Registrar voto para un producto.
    
    Returns:
        JSON: Confirmación del voto registrado
    """
    try:
        # Validar datos de entrada
        data = vote_schema.load(request.json)
        
        # Procesar voto
        service = ProductService(db.session)
        result = service.register_vote(
            product_id=data['product_id'],
            model_id=data['model_id'],
            condition_id=data.get('condition_id', 1)
        )
        
        return success_response(
            data=result,
            message='Vote registered successfully'
        )
        
    except ValidationError as e:
        return error_response(
            message='Invalid data',
            details=e.messages,
            status_code=400
        )
    except ServiceError as e:
        logger.error(f"Service error in register_vote: {e}")
        return error_response(
            message=str(e),
            status_code=500
        )
```

## 🧪 Testing

### Frontend Testing

#### 1. Setup Testing Environment

```bash
cd frontend

# Instalar dependencias de testing
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

#### 2. Unit Tests para Componentes

```javascript
// __tests__/components/DescriptionVoting.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DescriptionVoting from '@/pages/DescriptionVoting';

// Mock del hook
vi.mock('@/hooks/useProducts', () => ({
  useProducts: vi.fn(() => ({
    products: [
      { id: 1, name: 'Test Product', descriptions: [] }
    ],
    loading: false,
    error: null
  }))
}));

describe('DescriptionVoting', () => {
  test('renders product evaluation interface', () => {
    render(<DescriptionVoting />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
  
  test('handles vote submission', async () => {
    const mockOnVote = vi.fn();
    
    render(<DescriptionVoting onVote={mockOnVote} />);
    
    const voteButton = screen.getByRole('button', { name: /votar/i });
    fireEvent.click(voteButton);
    
    await waitFor(() => {
      expect(mockOnVote).toHaveBeenCalledWith(1, 2);
    });
  });
});
```

#### 3. Integration Tests

```javascript
// __tests__/integration/api.test.js
import { apiClient } from '@/lib/api';

describe('API Integration', () => {
  test('fetches products successfully', async () => {
    const response = await apiClient.get('/products');
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('products');
    expect(Array.isArray(response.data.products)).toBe(true);
  });
});
```

### Backend Testing

#### 1. Setup Testing Environment

```bash
cd backend

# Instalar dependencias de testing
pip install pytest pytest-cov pytest-mock requests

# Ejecutar tests
pytest

# Tests con coverage
pytest --cov=. --cov-report=html

# Tests específicos
pytest tests/test_api.py -v
pytest tests/test_models.py::TestProductModel -v
```

#### 2. Unit Tests para Servicios

```python
# tests/test_services.py
import pytest
from unittest.mock import Mock, patch

from services.product_service import ProductService
from models import Product


class TestProductService:
    
    @pytest.fixture
    def mock_db_session(self):
        return Mock()
    
    @pytest.fixture
    def service(self, mock_db_session):
        return ProductService(mock_db_session)
    
    def test_get_all_products_from_cache(self, service):
        # Arrange
        cached_products = [{'id': 1, 'name': 'Test Product'}]
        
        with patch.object(service.cache, 'get', return_value=cached_products):
            # Act
            result = service.get_all_products()
            
            # Assert
            assert result == cached_products
            service.db.query.assert_not_called()
    
    def test_get_all_products_from_database(self, service, mock_db_session):
        # Arrange
        mock_product = Mock(spec=Product)
        mock_product.to_dict.return_value = {'id': 1, 'name': 'Test Product'}
        
        mock_db_session.query.return_value.options.return_value.all.return_value = [mock_product]
        
        with patch.object(service.cache, 'get', return_value=None):
            with patch.object(service.cache, 'set') as mock_cache_set:
                # Act
                result = service.get_all_products()
                
                # Assert
                assert len(result) == 1
                assert result[0]['name'] == 'Test Product'
                mock_cache_set.assert_called_once()
```

#### 3. API Integration Tests

```python
# tests/test_api.py
import pytest
import requests
import json

BASE_URL = "http://localhost:10000"


class TestProductAPI:
    
    def test_get_products_endpoint(self):
        """Test que el endpoint de productos funciona correctamente."""
        response = requests.get(f"{BASE_URL}/products")
        
        assert response.status_code == 200
        data = response.json()
        assert 'products' in data
        assert isinstance(data['products'], list)
    
    def test_vote_endpoint_success(self):
        """Test votación exitosa."""
        vote_data = {
            "id": 1,
            "model_id": 2,
            "condition_id": 1
        }
        
        response = requests.post(
            f"{BASE_URL}/vote",
            json=vote_data,
            headers={'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert 'message' in data
        assert data['message'] == 'Vote registered successfully'
    
    def test_vote_endpoint_validation(self):
        """Test validación de datos en votación."""
        invalid_data = {"id": "invalid"}
        
        response = requests.post(
            f"{BASE_URL}/vote",
            json=invalid_data,
            headers={'Content-Type': 'application/json'}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
```

#### 4. Database Tests

```python
# tests/test_models.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base, Product, Description, Model
from db import create_tables


class TestProductModel:
    
    @pytest.fixture(scope="function")
    def db_session(self):
        # Crear base de datos en memoria
        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        
        Session = sessionmaker(bind=engine)
        session = Session()
        
        yield session
        
        session.close()
    
    def test_create_product(self, db_session):
        """Test creación de producto."""
        product = Product(
            name="Test Product",
            og_description="Original description"
        )
        
        db_session.add(product)
        db_session.commit()
        
        assert product.id is not None
        assert product.name == "Test Product"
    
    def test_product_relationships(self, db_session):
        """Test relaciones del modelo Product."""
        # Crear modelo
        model = Model(name="GPT-4")
        db_session.add(model)
        db_session.commit()
        
        # Crear producto
        product = Product(name="Test Product")
        db_session.add(product)
        db_session.commit()
        
        # Crear descripción
        description = Description(
            generated_description="Generated description",
            product=product.id,
            model=model.id,
            condition=1
        )
        db_session.add(description)
        db_session.commit()
        
        # Verificar relaciones
        assert len(product.descriptions) == 1
        assert product.descriptions[0].generated_description == "Generated description"
```

## 🐛 Debugging

### Frontend Debugging

#### 1. Development Tools

```javascript
// Habilitar React DevTools
if (process.env.NODE_ENV === 'development') {
  import('@welldone-software/why-did-you-render').then(wdyr => {
    wdyr.default(React, {
      trackAllPureComponents: true,
    });
  });
}

// Debug hooks
import { useDebugValue } from 'react';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  
  // Debug value en React DevTools
  useDebugValue(products.length > 0 ? `${products.length} products` : 'No products');
  
  return { products, setProducts };
};
```

#### 2. Logging

```javascript
// utils/logger.js
class Logger {
  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${message}`, data);
    }
  }
  
  static info(message, data = null) {
    console.log(`ℹ️ [INFO] ${message}`, data);
  }
  
  static error(message, error = null) {
    console.error(`❌ [ERROR] ${message}`, error);
    
    // En producción, enviar a servicio de logging
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, etc.
    }
  }
}

// Uso en componentes
const DescriptionVoting = () => {
  const handleVote = (productId, modelId) => {
    Logger.debug('Vote submitted', { productId, modelId });
    
    try {
      // Lógica de votación
      Logger.info('Vote registered successfully');
    } catch (error) {
      Logger.error('Failed to register vote', error);
    }
  };
};
```

### Backend Debugging

#### 1. Logging Configuration

```python
# config/logging.py
import logging
import logging.config

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'detailed': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
        'simple': {
            'format': '%(levelname)s - %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
            'formatter': 'detailed',
            'stream': 'ext://sys.stdout'
        },
        'file': {
            'class': 'logging.FileHandler',
            'level': 'INFO',
            'formatter': 'detailed',
            'filename': 'app.log',
            'mode': 'a'
        }
    },
    'loggers': {
        '': {  # root logger
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False
        }
    }
}

logging.config.dictConfig(LOGGING_CONFIG)
```

#### 2. Debug Decorators

```python
# utils/decorators.py
import functools
import logging
import time

logger = logging.getLogger(__name__)


def debug_performance(func):
    """Decorator para medir performance de funciones."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        
        result = func(*args, **kwargs)
        
        execution_time = time.time() - start_time
        logger.debug(f"{func.__name__} executed in {execution_time:.4f}s")
        
        return result
    return wrapper


def log_exceptions(func):
    """Decorator para logging automático de excepciones."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Exception in {func.__name__}: {e}", exc_info=True)
            raise
    return wrapper


# Uso
@debug_performance
@log_exceptions
def get_all_products():
    # Lógica de la función
    pass
```

#### 3. Database Query Debugging

```python
# Habilitar logging de queries SQLAlchemy
import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Debug queries en desarrollo
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    if context is not None:
        print(f"Query: {statement}")
        print(f"Parameters: {parameters}")
```

## ⚡ Performance

### Frontend Performance

#### 1. React Optimizations

```javascript
// Lazy loading de componentes
const Results = lazy(() => import('./pages/Results'));
const CSVUpload = lazy(() => import('./pages/CSVUpload'));

// Uso con Suspense
<Suspense fallback={<div>Cargando...</div>}>
  <Results />
</Suspense>

// Memoización de componentes
const ProductCard = memo(({ product, onVote }) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={() => onVote(product.id)}>
        Votar
      </button>
    </div>
  );
});

// Memoización de callbacks
const DescriptionVoting = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const handleVote = useCallback((productId, modelId) => {
    // Lógica de votación
  }, []);
  
  const memoizedProducts = useMemo(() => 
    products.filter(p => p.evaluated === false),
    [products]
  );
};
```

#### 2. Bundle Optimization

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
  },
  
  // Bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },
  
  // Optimización de imágenes
  images: {
    domains: ['supabase.co'],
    formats: ['image/webp'],
  },
  
  // Compresión
  compress: true,
  
  // Headers de performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};
```

### Backend Performance

#### 1. Database Optimizations

```python
# Eager loading para evitar N+1 queries
from sqlalchemy.orm import joinedload, subqueryload

def get_all_products():
    return (
        session.query(Product)
        .options(
            subqueryload(Product.descriptions).joinedload(Description.model_ref),
            subqueryload(Product.evaluations).joinedload(Evaluation.condition_ref)
        )
        .all()
    )

# Índices para optimización
class Product(Base):
    __tablename__ = "product"
    
    id = Column(BigInteger, primary_key=True)
    name = Column(String, nullable=False, index=True)  # Índice en name
    
    __table_args__ = (
        Index('idx_product_name_id', 'name', 'id'),  # Índice compuesto
    )

# Connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600
)
```

#### 2. Caching Strategy

```python
# services/cache_service.py
import redis
import json
import pickle
from typing import Any, Optional

class CacheService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            password=os.getenv("REDIS_PASSWORD"),
            decode_responses=True
        )
    
    def get(self, key: str) -> Optional[Any]:
        """Obtener valor del cache."""
        try:
            value = self.redis_client.get(key)
            return json.loads(value) if value else None
        except (redis.RedisError, json.JSONDecodeError):
            return None
    
    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Guardar valor en cache con TTL."""
        try:
            serialized_value = json.dumps(value, default=str)
            return self.redis_client.setex(key, ttl, serialized_value)
        except (redis.RedisError, TypeError):
            return False
    
    def delete(self, key: str) -> bool:
        """Eliminar clave del cache."""
        try:
            return bool(self.redis_client.delete(key))
        except redis.RedisError:
            return False
    
    def get_many(self, keys: list) -> dict:
        """Obtener múltiples claves."""
        try:
            values = self.redis_client.mget(keys)
            return {
                key: json.loads(value) if value else None
                for key, value in zip(keys, values)
            }
        except (redis.RedisError, json.JSONDecodeError):
            return {}

# Uso en servicios
class ProductService:
    def __init__(self):
        self.cache = CacheService()
    
    def get_product_by_id(self, product_id: int):
        cache_key = f"product:{product_id}"
        
        # Intentar cache
        cached_product = self.cache.get(cache_key)
        if cached_product:
            return cached_product
        
        # Consultar DB y cachear
        product = self.db.query(Product).get(product_id)
        if product:
            product_dict = product.to_dict()
            self.cache.set(cache_key, product_dict, ttl=600)  # 10 minutos
            return product_dict
        
        return None
```

## 🤝 Contribución

### Workflow de Contribución

```bash
# 1. Fork del repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/tu-usuario/Description-Evaluator.git
cd Description-Evaluator

# 3. Configurar remoto upstream
git remote add upstream https://github.com/Andre-Leandro/Description-Evaluator.git

# 4. Crear branch para feature
git checkout -b feature/descripcion-de-la-feature

# 5. Desarrollar y commitear
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 6. Sincronizar con upstream
git fetch upstream
git rebase upstream/main

# 7. Push a tu fork
git push origin feature/descripcion-de-la-feature

# 8. Crear Pull Request en GitHub
```

### Conventional Commits

```bash
# Tipos de commits
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, missing semi colons, etc
refactor: refactoring de código
test: agregar tests
chore: mantenimiento

# Ejemplos
git commit -m "feat: agregar componente de evaluación comparativa"
git commit -m "fix: corregir error de conexión con Redis"
git commit -m "docs: actualizar README con instrucciones de deployment"
git commit -m "test: agregar tests unitarios para ProductService"
```

### Code Review Checklist

#### Frontend
- [ ] Componentes están memoizados cuando es necesario
- [ ] Props tienen PropTypes definidos
- [ ] Hooks siguen las reglas de React
- [ ] No hay console.log en código de producción
- [ ] Estilos siguen convenciones de Tailwind
- [ ] Componentes son responsivos
- [ ] Manejo de errores implementado
- [ ] Tests unitarios agregados

#### Backend
- [ ] Funciones tienen docstrings
- [ ] Validación de datos implementada
- [ ] Manejo de excepciones adecuado
- [ ] Logs informativos agregados
- [ ] Tests unitarios e integración
- [ ] No hay credenciales hardcodeadas
- [ ] Queries optimizadas (no N+1)
- [ ] Cache invalidation implementado

### Pull Request Template

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de cambio
- [ ] Bug fix (cambio que corrige un problema)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe funcionalidad existente)
- [ ] Documentación

## ¿Cómo se ha probado?
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Pruebas manuales
- [ ] Tests E2E

## Checklist:
- [ ] Código sigue las convenciones del proyecto
- [ ] Self-review del código realizado
- [ ] Comentarios en código complejo
- [ ] Documentación actualizada
- [ ] Tests agregados/actualizados
- [ ] No hay warnings en build
- [ ] Funciona en local
```

---

**Última actualización:** Diciembre 2024  
**Autor:** DevOps Team UTN  
**Versión:** 1.0.0