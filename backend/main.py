from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os
import math

port = int(os.environ.get("PORT", 5000))  # Usa PORT si está definido, sino 5000 por defecto




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
    df_claude = read_csv_local("description-parragraph-us.anthropic.claude-3-5-sonnet-20240620-v1_0.csv")
    df_claude["modelo"] = "Claude 3.5 Sonnet"

    df_nova_premier = read_csv_local("description-parragraph-us.amazon.nova-premier-v1_0.csv")
    df_nova_premier["modelo"] = "Amazon Nova Premier"

    df_nova_micro = read_csv_local("description-parragraph-us.amazon.nova-micro-v1_0.csv")
    df_nova_micro["modelo"] = "Amazon Nova Micro"

    df_original = read_csv_local("productos_limpios.csv")  # columnas: nombre, descripcion_estandarizada

    df_all = pd.concat([df_claude, df_nova_premier, df_nova_micro], ignore_index=True)

    products = []
    for i, row in df_original.iterrows():
        nombre = row["nombre"]
        original = row["descripcion_estandarizada"]
        if isinstance(original, float) and math.isnan(original):
            original = None
        subset = df_all[df_all["nombre"] == nombre]
        descriptions = [
            {"model": r["modelo"], "text": r["descripcion_generada"]}
            for _, r in subset.iterrows()
        ]
        products.append({
            "id": i + 1,
            "name": nombre,
            "original": original,
            "descriptions": descriptions
        })

    return jsonify({"products": products})

if __name__ == '__main__':
    app.run(debug=True)
