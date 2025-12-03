from flask import Flask
from flask_cors import CORS
import os
import logging
import json
from dotenv import load_dotenv
from routes.product_routes import product_routes
from routes.file_routes import file_routes
from routes.devops_routes import devops_routes
from prometheus_flask_exporter import PrometheusMetrics
from prometheus_client import Gauge, Counter
from kubernetes import client, config
import threading
import time

# OpenTelemetry imports
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

load_dotenv()

# Configure structured JSON logging
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.handlers = [handler]
logger.setLevel(logging.INFO)

# OpenTelemetry configuration
OTEL_COLLECTOR_ENDPOINT = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317")
SERVICE_NAME_VALUE = os.getenv("OTEL_SERVICE_NAME", "backend-service")

# Setup tracer provider with resource attributes
resource = Resource(attributes={
    SERVICE_NAME: SERVICE_NAME_VALUE,
    "service.version": "1.0.0",
    "deployment.environment": os.getenv("ENVIRONMENT", "development")
})

# Initialize tracer provider
provider = TracerProvider(resource=resource)

# Configure OTLP exporter to send traces to OpenTelemetry Collector
try:
    otlp_exporter = OTLPSpanExporter(
        endpoint=OTEL_COLLECTOR_ENDPOINT,
        insecure=True
    )
    provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
    logger.info(f"OpenTelemetry configured to export to: {OTEL_COLLECTOR_ENDPOINT}")
except Exception as e:
    logger.warning(f"Failed to configure OTLP exporter: {e}. Traces will not be exported.")

trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

port = int(os.environ.get("PORT", 10000))  # 10000 es el valor por defecto si no se define PORT

app = Flask(__name__)
CORS(app)

# Enable Prometheus metrics (basic)
metrics = PrometheusMetrics(app)
metrics.info('app_info', 'Application info', version='1.0.0')

# Custom Counter for HTTP requests with path label
http_requests_by_path = Counter(
    'http_requests_by_path_total',
    'Total HTTP requests by path',
    ['method', 'path', 'status']
)

# Custom Gauge for backend pod restarts
backend_restarts_gauge = Gauge('backend_pod_restarts_total', 'Total number of backend pod restarts')

# Middleware to track requests by path
@app.before_request
def before_request():
    from flask import request
    request._start_time = time.time()

@app.after_request
def after_request(response):
    from flask import request
    # Increment custom counter with path label
    http_requests_by_path.labels(
        method=request.method,
        path=request.path,
        status=response.status_code
    ).inc()
    return response

def update_restart_count():
    """Background thread to update restart count metric from Kubernetes API"""
    try:
        # Load in-cluster config
        config.load_incluster_config()
        v1 = client.CoreV1Api()
        
        while True:
            try:
                # Get all pods with label app=backend
                pods = v1.list_namespaced_pod(namespace='default', label_selector='app=backend')
                total_restarts = sum(
                    container.restart_count 
                    for pod in pods.items 
                    for container in pod.status.container_statuses or []
                )
                backend_restarts_gauge.set(total_restarts)
                logger.info(f"Updated backend restart count: {total_restarts}")
            except Exception as e:
                logger.error(f"Error updating restart count: {e}")
            
            # Update every 10 seconds
            time.sleep(10)
    except Exception as e:
        logger.warning(f"Could not load in-cluster config, restart metric will not be available: {e}")

# Start background thread for restart count monitoring
restart_thread = threading.Thread(target=update_restart_count, daemon=True)
restart_thread.start()

# Instrument Flask with OpenTelemetry
FlaskInstrumentor().instrument_app(app)
RedisInstrumentor().instrument()
RequestsInstrumentor().instrument()

# Register blueprints
app.register_blueprint(product_routes)
app.register_blueprint(file_routes)
app.register_blueprint(devops_routes)

@app.route('/')
def home():
    with tracer.start_as_current_span("home_endpoint"):
        logger.info("Home endpoint accessed")
        return "La API está corriendo correctamente."


if __name__ == '__main__':
    logger.info(f"Starting Flask application on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)