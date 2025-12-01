from flask import Blueprint, jsonify
import redis
import os
import threading
import time

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
    print("🔥 CHAOS TEST: Starting aggressive memory consumption...")
    
    # Start memory consumption in a background thread to allow response
    def consume_memory():
        memory_hog = []
        chunk_size = 10 * 1024 * 1024  # 10MB chunks
        try:
            while True:
                # Allocate 10MB chunks rapidly
                memory_hog.append(' ' * chunk_size)
                current_size = len(memory_hog) * chunk_size / (1024 * 1024)
                print(f"💀 Memory allocated: {current_size:.0f} MB")
                time.sleep(0.1)  # Small delay to allow logging
        except MemoryError:
            print("💥 MemoryError reached - OOMKilled imminent")
    
    # Start in background so we can return a response
    thread = threading.Thread(target=consume_memory, daemon=True)
    thread.start()
    
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
    try:
        print("🗑️ Executing Redis FLUSHALL...")
        redis_client.flushall()
        print("✅ Redis cache cleared successfully")
        return jsonify({
            "status": "success",
            "message": "Redis cache cleared (FLUSHALL executed)"
        }), 200
    except redis.exceptions.ConnectionError as e:
        print(f"❌ Redis connection error: {e}")
        return jsonify({
            "status": "error",
            "message": f"Failed to connect to Redis: {str(e)}"
        }), 503
    except Exception as e:
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
