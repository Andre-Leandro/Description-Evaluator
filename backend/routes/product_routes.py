from flask import Blueprint, jsonify, request
from services.product_service import ProductService
import redis
import json
import os
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "127.0.0.1"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD", None),
)


product_routes = Blueprint('products', __name__)

@product_routes.route('/products', methods=['GET'])
def get_products():
    with tracer.start_as_current_span("get_products") as span:
        try:
            # Intentar obtener del cache
            with tracer.start_as_current_span("check_redis") as redis_span:
                redis_span.set_attribute("cache.type", "redis")
                cache_exists = redis_client.exists('products')
                
            if cache_exists:
                with tracer.start_as_current_span("redis_get") as redis_get_span:
                    redis_get_span.set_attribute("cache.hit", True)
                    print('📦 Serving from Redis cache')
                    products = redis_client.get('products')
                    products = json.loads(products)
                    span.set_attribute("data.source", "redis_cache")
                    return jsonify({"products": products})
            
            # Si no está en cache, obtener de DB (Supabase)
            with tracer.start_as_current_span("supabase_query") as db_span:
                db_span.set_attribute("db.system", "postgresql")
                db_span.set_attribute("db.operation", "SELECT")
                print('🔄 Fetching from database')
                products = ProductService.get_all_products()
            
            # Guardar en cache con TTL de 5 minutos (300 segundos)
            with tracer.start_as_current_span("redis_set") as redis_set_span:
                redis_set_span.set_attribute("cache.ttl_seconds", 300)
                redis_client.setex('products', 300, json.dumps(products))
                print('✅ Data cached for 5 minutes')
            
            span.set_attribute("data.source", "database")
            return jsonify({"products": products})
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            print(f"❌ Error getting products: {e}")
            return jsonify({"error": str(e)}), 500

@product_routes.route('/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    """
    Get a single product by ID with its descriptions and evaluations
    
    Args:
        product_id (int): The ID of the product to retrieve
        
    Returns:
        JSON: The product data with descriptions and evaluations
    """
    with tracer.start_as_current_span("get_product_by_id") as span:
        span.set_attribute("product.id", product_id)
        try:
            with tracer.start_as_current_span("supabase_query") as db_span:
                db_span.set_attribute("db.system", "postgresql")
                db_span.set_attribute("db.operation", "SELECT")
                product = ProductService.get_product_by_id(product_id)
            if product is None:
                span.set_attribute("product.found", False)
                return jsonify({"error": "Product not found"}), 404
            span.set_attribute("product.found", True)
            return jsonify({"product": product})
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            print(f"❌ Error getting product {product_id}: {e}")
            return jsonify({"error": str(e)}), 500

@product_routes.route("/vote", methods=["POST"])
def register_vote():
    """
    Register a vote for a product under a specific condition
    
    Expected JSON payload:
    {
        "id": 123,               # Product ID (required)
        "model_id": 1,           # Model ID being voted for (required)
        "condition_id": 1        # Condition/context ID (optional, defaults to 1)
    }
    
    Returns:
        JSON: Success or error message
    """
    with tracer.start_as_current_span("register_vote") as span:
        data = request.get_json()
        print("Received vote data:", data)

        # Validate required fields
        required_fields = ["id", "model_id"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields. Required: id, model_id"}), 400

        try:
            # Extract parameters with defaults
            product_id = data["id"]
            model_id = data["model_id"]
            condition_id = data.get("condition_id", 1)  # Default to 1 if not provided
            
            span.set_attribute("vote.product_id", product_id)
            span.set_attribute("vote.model_id", model_id)
            span.set_attribute("vote.condition_id", condition_id)
            
            # Register the vote
            with tracer.start_as_current_span("supabase_insert") as db_span:
                db_span.set_attribute("db.system", "postgresql")
                db_span.set_attribute("db.operation", "INSERT")
                result = ProductService.register_vote(
                    product_id=product_id,
                    model_id=model_id,
                    condition_id=condition_id
                )
            
            if result is None:
                return jsonify({"error": "Product not found"}), 404
            
            # 🔥 CACHE INVALIDATION: Eliminar cache cuando hay cambios
            with tracer.start_as_current_span("redis_cache_invalidation") as redis_span:
                try:
                    redis_client.delete('products')
                    redis_span.set_attribute("cache.invalidated", True)
                    print("✅ Cache invalidated after vote")
                except Exception as redis_error:
                    redis_span.set_attribute("cache.invalidated", False)
                    redis_span.record_exception(redis_error)
                    print(f"⚠️ Could not invalidate cache: {redis_error}")
                    # No fallar si Redis falla, solo log
                
            return jsonify({
                "message": "Vote registered successfully",
                "product_id": product_id,
                "model_id": model_id,
                "condition_id": condition_id
            }), 200
        
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            print(f"❌ Error registering vote: {e}")
            return jsonify({"error": str(e)}), 500