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

@app.route('/health')
def health():
    """Health check endpoint para Kubernetes"""
    return {"status": "healthy", "service": "backend"}, 200

@app.route('/stress-memory')
def stress_memory():
    """Endpoint para saturar memoria y probar HA en Kubernetes"""
    import gc
    memory_hog = []
    try:
        # Llenar memoria con datos hasta alcanzar ~400MB
        for i in range(100):
            # Crear listas grandes en memoria
            memory_hog.append([0] * (1024 * 1024))  # ~8MB por iteración
            if i % 10 == 0:
                gc.collect()  # Forzar garbage collection
        return {"status": "memory_saturated", "allocated_mb": len(memory_hog) * 8}, 200
    except MemoryError:
        return {"status": "oom", "message": "Out of memory"}, 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=False)