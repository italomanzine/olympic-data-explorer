from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Olympic Data API is running"}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_get_filters():
    response = client.get("/api/filters")
    assert response.status_code == 200
    data = response.json()
    assert "years" in data
    assert "sports" in data
    assert len(data["years"]) > 0

def test_get_map_stats():
    # Pega um ano válido dos filtros primeiro
    filters = client.get("/api/filters").json()
    year = filters["years"][0]
    
    response = client.get(f"/api/stats/map?year={year}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

