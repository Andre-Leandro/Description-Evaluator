from flask import Blueprint, jsonify, request
from services.product_service import ProductService

product_routes = Blueprint('products', __name__)

@product_routes.route('/products', methods=['GET'])
def get_products():
    try:
        products = ProductService.get_all_products()
        return jsonify({"products": products})
    except Exception as e:
        print(f"❌ Error al obtener productos: {e}")
        return jsonify({"error": str(e)}), 500

@product_routes.route('/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    try:
        product = ProductService.get_product_by_id(product_id)
        if product is None:
            return jsonify({"error": "Producto no encontrado"}), 404
        return jsonify({"product": product})
    except Exception as e:
        print(f"❌ Error al obtener producto {product_id}: {e}")
        return jsonify({"error": str(e)}), 500

@product_routes.route("/vote", methods=["POST"])
def register_vote():
    data = request.get_json()
    print(data)

    required_fields = ["id", "model_id"]
    if not all(field in data for field in required_fields):
        return {"error": "Faltan campos obligatorios."}, 400

    try:
        result = ProductService.register_vote(data["id"], data["model_id"])
        if result is None:
            return {"error": "Producto no encontrado."}, 404
        return {"message": "Voto registrado correctamente."}, 200
    except Exception as e:
        return {"error": str(e)}, 500