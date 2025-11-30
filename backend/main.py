from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes.product_routes import product_routes
from routes.file_routes import file_routes
from telemetry import setup_opentelemetry

load_dotenv()

port = int(os.environ.get("PORT", 10000))  # 10000 es el valor por defecto si no se define PORT

app = Flask(__name__)
CORS(app)

# Setup OpenTelemetry instrumentation
setup_opentelemetry(app)

# Register blueprints
app.register_blueprint(product_routes)
app.register_blueprint(file_routes)

@app.route('/')
def home():
    return "La API está corriendo correctamente."


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=False)