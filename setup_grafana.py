#!/usr/bin/env python3
"""
Script para configurar automáticamente Grafana con datasource y dashboard
"""
import requests
import json
import time
import sys

GRAFANA_URL = "http://localhost:3000"
GRAFANA_USER = "admin"
GRAFANA_PASS = "admin"

def wait_for_grafana():
    """Esperar a que Grafana esté listo"""
    print("⏳ Esperando a que Grafana esté listo...")
    for i in range(30):
        try:
            response = requests.get(f"{GRAFANA_URL}/api/health", timeout=2)
            if response.status_code == 200:
                print("✅ Grafana está listo!")
                return True
        except requests.exceptions.RequestException:
            pass
        time.sleep(2)
    print("❌ Grafana no respondió después de 60 segundos")
    return False

def create_datasource():
    """Crear datasource de Prometheus"""
    print("\n📊 Configurando datasource de Prometheus...")
    
    datasource = {
        "name": "Prometheus",
        "type": "prometheus",
        "access": "proxy",
        "url": "http://prometheus:9090",
        "isDefault": True,
        "jsonData": {
            "timeInterval": "15s"
        }
    }
    
    try:
        response = requests.post(
            f"{GRAFANA_URL}/api/datasources",
            auth=(GRAFANA_USER, GRAFANA_PASS),
            headers={"Content-Type": "application/json"},
            json=datasource
        )
        
        if response.status_code == 200:
            print("✅ Datasource de Prometheus creado exitosamente")
            return True
        elif response.status_code == 409:
            print("ℹ️  Datasource ya existe")
            return True
        else:
            print(f"❌ Error creando datasource: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def import_dashboard():
    """Importar dashboard desde archivo JSON"""
    print("\n📈 Importando dashboard...")
    
    try:
        with open('/Users/andreleandro/Documents/Description-Evaluator/grafana/dashboard.json', 'r') as f:
            dashboard_json = json.load(f)
        
        payload = {
            "dashboard": dashboard_json,
            "overwrite": True,
            "inputs": [{
                "name": "DS_PROMETHEUS",
                "type": "datasource",
                "pluginId": "prometheus",
                "value": "Prometheus"
            }]
        }
        
        response = requests.post(
            f"{GRAFANA_URL}/api/dashboards/db",
            auth=(GRAFANA_USER, GRAFANA_PASS),
            headers={"Content-Type": "application/json"},
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            dashboard_url = f"{GRAFANA_URL}{result.get('url', '')}"
            print(f"✅ Dashboard importado exitosamente")
            print(f"🔗 URL: {dashboard_url}")
            return True
        else:
            print(f"❌ Error importando dashboard: {response.status_code}")
            print(response.text)
            return False
    except FileNotFoundError:
        print("❌ No se encontró el archivo dashboard.json")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🐕 Configurando Grafana para salvar perritos...")
    print("=" * 60)
    
    if not wait_for_grafana():
        sys.exit(1)
    
    if not create_datasource():
        print("\n⚠️  Advertencia: No se pudo crear el datasource automáticamente")
        print("Consulta GRAFANA_SETUP.md para configuración manual")
    
    time.sleep(2)  # Dar tiempo para que el datasource se registre
    
    if not import_dashboard():
        print("\n⚠️  Advertencia: No se pudo importar el dashboard automáticamente")
        print("Consulta GRAFANA_SETUP.md para configuración manual")
    
    print("\n" + "=" * 60)
    print("🎉 ¡Configuración completada!")
    print(f"🌐 Abre Grafana en: {GRAFANA_URL}")
    print(f"👤 Usuario: {GRAFANA_USER}")
    print(f"🔑 Contraseña: {GRAFANA_PASS}")
    print("\n🐶 ¡Los perritos agradecen tu servicio!")

if __name__ == "__main__":
    main()
