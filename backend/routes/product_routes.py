from flask import Blueprint, jsonify, request
from services.product_service import ProductService
import redis
import json
import os


redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "127.0.0.1"),
    port=int(os.getenv("REDIS_PORT", 6379)),
)


product_routes = Blueprint('products', __name__)

@product_routes.route('/products', methods=['GET'])
def get_products():
    try:
        
        if redis_client.exists('products'):
            products = redis_client.get('products')
            products = json.loads(products)
            return jsonify({"products": products})
        
        products = ProductService.get_all_products()
        
        redis_client.set('products', json.dumps(products))
        
        return jsonify({"products": products})
    except Exception as e:
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
    try:
        product = ProductService.get_product_by_id(product_id)
        if product is None:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"product": product})
    except Exception as e:
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
        
        # Register the vote
        result = ProductService.register_vote(
            product_id=product_id,
            model_id=model_id,
            condition_id=condition_id
        )
        
        if result is None:
            return jsonify({"error": "Product not found"}), 404
            
        return jsonify({
            "message": "Vote registered successfully",
            "product_id": product_id,
            "model_id": model_id,
            "condition_id": condition_id
        }), 200
        
    except Exception as e:
        print(f"❌ Error registering vote: {e}")
        return jsonify({"error": str(e)}), 500