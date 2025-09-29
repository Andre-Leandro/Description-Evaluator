import requests

BASE_URL = "http://127.0.0.1:10000"  # Cambia el puerto si usás otro

def test_get_products():
    response = requests.get(f"{BASE_URL}/products")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "products" in data
    assert isinstance(data["products"], list)
