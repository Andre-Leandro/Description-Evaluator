"""
OpenTelemetry configuration for the Flask application
Provides tracing, metrics, and logging setup
"""
import logging
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from prometheus_client import start_http_server, Counter, Histogram, Gauge
import os

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": "%(message)s"}'
)

logger = logging.getLogger(__name__)

# Application metrics
REQUESTS_TOTAL = Counter(
    'app_requests_total',
    'Total number of requests processed',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'app_request_duration_seconds',
    'Request duration in seconds',
    ['method', 'endpoint']
)

CACHE_OBJECTS = Gauge(
    'app_cache_objects_total',
    'Number of objects in Redis cache',
    ['cache_type']
)

PRODUCTS_LOADED = Counter(
    'app_products_loaded_total',
    'Total number of products loaded from database'
)

CSV_FILES_UPLOADED = Counter(
    'app_csv_files_uploaded_total',
    'Total number of CSV files uploaded'
)

def setup_opentelemetry(app):
    """
    Configure OpenTelemetry for the Flask application
    
    Args:
        app: Flask application instance
    """
    # Create resource identifying this service
    resource = Resource(attributes={
        SERVICE_NAME: "description-evaluator-backend",
        SERVICE_VERSION: "1.0.0"
    })
    
    # Get OTEL Collector endpoint from environment
    otel_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317")
    
    # Setup Tracing
    trace_provider = TracerProvider(resource=resource)
    
    # OTLP exporter for traces
    otlp_span_exporter = OTLPSpanExporter(
        endpoint=otel_endpoint,
        insecure=True
    )
    
    trace_provider.add_span_processor(
        BatchSpanProcessor(otlp_span_exporter)
    )
    
    trace.set_tracer_provider(trace_provider)
    
    # Setup Metrics
    # Prometheus exporter (for direct scraping)
    prometheus_reader = PrometheusMetricReader()
    
    # OTLP exporter for metrics
    otlp_metric_exporter = OTLPMetricExporter(
        endpoint=otel_endpoint,
        insecure=True
    )
    
    otlp_metric_reader = PeriodicExportingMetricReader(
        otlp_metric_exporter,
        export_interval_millis=10000  # Export every 10 seconds
    )
    
    meter_provider = MeterProvider(
        resource=resource,
        metric_readers=[prometheus_reader, otlp_metric_reader]
    )
    
    metrics.set_meter_provider(meter_provider)
    
    # Auto-instrument Flask
    FlaskInstrumentor().instrument_app(app)
    
    # Auto-instrument Redis
    RedisInstrumentor().instrument()
    
    # Auto-instrument SQLAlchemy (if using it)
    try:
        SQLAlchemyInstrumentor().instrument()
    except Exception as e:
        logger.warning(f"Could not instrument SQLAlchemy: {e}")
    
    # Start Prometheus metrics server on port 8000
    try:
        start_http_server(8000)
        logger.info("Prometheus metrics server started on port 8000")
    except Exception as e:
        logger.warning(f"Could not start Prometheus metrics server: {e}")
    
    logger.info("OpenTelemetry instrumentation configured successfully")
    logger.info(f"Sending traces and metrics to: {otel_endpoint}")

def get_tracer():
    """Get a tracer instance"""
    return trace.get_tracer(__name__)

def get_meter():
    """Get a meter instance"""
    return metrics.get_meter(__name__)
