from flask import Blueprint, jsonify
import redis
import os
import threading
import time
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "127.0.0.1"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD", None),
)

devops_routes = Blueprint('devops', __name__)


@devops_routes.route('/api/kill-memory', methods=['POST'])
def kill_memory():
    """
    Chaos endpoint that aggressively consumes RAM until OOMKilled.
    This is used to test Kubernetes pod resilience and memory alerts.
    WARNING: This will crash the pod intentionally!
    
    Uses POST method as this is a destructive operation.
    """
    with tracer.start_as_current_span("kill_memory_chaos_test") as span:
        span.set_attribute("chaos.type", "memory_exhaustion")
        span.set_attribute("chaos.target", "pod")
        span.set_attribute("chaos.severity", "critical")
        
        print("🔥 CHAOS TEST: Starting aggressive memory consumption...")
        
        # Start memory consumption in a background thread to allow response
        def consume_memory():
            with tracer.start_as_current_span("memory_consumption_loop") as loop_span:
                memory_hog = []
                chunk_size = 10 * 1024 * 1024  # 10MB chunks
                loop_span.set_attribute("memory.chunk_size_mb", 10)
                try:
                    iteration = 0
                    while True:
                        # Allocate 10MB chunks rapidly
                        memory_hog.append(' ' * chunk_size)
                        current_size = len(memory_hog) * chunk_size / (1024 * 1024)
                        print(f"💀 Memory allocated: {current_size:.0f} MB")
                        loop_span.set_attribute("memory.allocated_mb", current_size)
                        loop_span.set_attribute("memory.iterations", iteration)
                        iteration += 1
                        time.sleep(0.1)  # Small delay to allow logging
                except MemoryError:
                    loop_span.set_attribute("memory.error", "MemoryError")
                    loop_span.set_status(trace.StatusCode.ERROR, "OOMKilled imminent")
                    print("💥 MemoryError reached - OOMKilled imminent")
        
        # Start in background so we can return a response
        thread = threading.Thread(target=consume_memory, daemon=True)
        thread.start()
        
        span.set_attribute("response.status", "chaos_initiated")
        return jsonify({
            "status": "chaos_initiated",
            "message": "Memory consumption started. Pod will crash soon (OOMKilled).",
            "warning": "This is a chaos engineering test!"
        }), 200


@devops_routes.route('/api/cache', methods=['DELETE'])
def clear_cache():
    """
    Cleanup endpoint that executes FLUSHALL on Redis.
    Clears all data from the Redis cache.
    """
    with tracer.start_as_current_span("clear_redis_cache") as span:
        span.set_attribute("cache.type", "redis")
        span.set_attribute("cache.operation", "FLUSHALL")
        span.set_attribute("db.system", "redis")
        
        try:
            print("🗑️ Executing Redis FLUSHALL...")
            
            with tracer.start_as_current_span("redis_flushall") as redis_span:
                redis_client.flushall()
                redis_span.set_attribute("redis.command", "FLUSHALL")
                redis_span.set_attribute("redis.result", "success")
            
            print("✅ Redis cache cleared successfully")
            span.set_attribute("response.status", "success")
            return jsonify({
                "status": "success",
                "message": "Redis cache cleared (FLUSHALL executed)"
            }), 200
        except redis.exceptions.ConnectionError as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, f"Redis connection error: {str(e)}")
            span.set_attribute("error.type", "ConnectionError")
            print(f"❌ Redis connection error: {e}")
            return jsonify({
                "status": "error",
                "message": f"Failed to connect to Redis: {str(e)}"
            }), 503
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            span.set_attribute("error.type", type(e).__name__)
            print(f"❌ Error clearing cache: {e}")
            return jsonify({
                "status": "error",
                "message": f"Failed to clear cache: {str(e)}"
            }), 500


@devops_routes.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for Kubernetes probes.
    Checks Redis connectivity.
    """
    health = {
        "status": "healthy",
        "redis": "unknown"
    }
    
    try:
        redis_client.ping()
        health["redis"] = "connected"
    except Exception as e:
        health["redis"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    status_code = 200 if health["status"] == "healthy" else 503
    return jsonify(health), status_code
