from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os
import math
from dotenv import load_dotenv
from flask import jsonify
from models import Product, Description
from sqlalchemy.orm import joinedload
from db import engine
from sqlalchemy.orm import sessionmaker

load_dotenv()
Session = sessionmaker(bind=engine)
session = Session()


port = int(os.environ.get("PORT", 10000))  # 10000 es el valor por defecto si no se define PORT

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def read_csv_local(filename):
    return pd.read_csv(os.path.join(BASE_DIR, filename))

@app.route('/')
def home():
    return "La API está corriendo correctamente."


@app.route('/products', methods=['GET'])
def get_products():
    try:
        # Trae todos los productos que tienen al menos una descripción
        products = (
            session.query(Product)
            .options(joinedload(Product.descriptions).joinedload(Description.model_ref))
            .all()
        )

        result = []

        for product in products:
            if not product.descriptions:
                continue  # Saltar productos sin descripciones

            descriptions = [
                {
                    "model": desc.model_ref.name,
                    "text": desc.generated_description
                }
                for desc in product.descriptions
            ]

            result.append({
                "id": product.id,
                "name": product.name,
                "original": product.og_description,
                "evaluated": product.evaluated,
                "descriptions": descriptions
            })

        return jsonify({"products": result})

    except Exception as e:
        print(f"❌ Error al obtener productos: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        session.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=False)