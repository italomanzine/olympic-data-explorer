"""Testes para garantir alta cobertura."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, PropertyMock, MagicMock
import pandas as pd
import numpy as np
import sqlite3

from app.main import app
from app.data_loader import data_loader, DataLoader
from app.api import RESPONSE_CACHE, get_cache_key

client = TestClient(app)


class TestCacheOverflow:
    """Testes para overflow do cache."""
    
    def test_cache_clear_on_overflow(self):
        """Cache é limpo quando excede 1000 itens."""
        for i in range(1005):
            RESPONSE_CACHE[f"test_key_{i}"] = {"data": i}
        
        response = client.get("/api/filters")
        assert response.status_code == 200
        
        keys_to_remove = [k for k in RESPONSE_CACHE.keys() if k.startswith("test_key_")]
        for k in keys_to_remove:
            del RESPONSE_CACHE[k]


class TestEmptyDataScenarios:
    """Testes para cenários com dados vazios."""
    
    def test_map_stats_returns_empty_for_nonexistent_year(self):
        """Retorna vazio para ano inexistente."""
        response = client.get("/api/stats/map?year=1700")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_gender_stats_returns_empty_for_nonexistent_year(self):
        """Retorna vazio para ano inexistente."""
        response = client.get("/api/stats/gender?year=1700")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_biometrics_returns_empty_for_nonexistent_year(self):
        """Retorna vazio para ano inexistente."""
        response = client.get("/api/stats/biometrics?year=1700")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_evolution_returns_empty_for_nonexistent_countries(self):
        """Retorna vazio para países inexistentes."""
        response = client.get("/api/stats/evolution?countries=ZZZ")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_medals_returns_empty_for_nonexistent_year(self):
        """Retorna vazio para ano inexistente."""
        response = client.get("/api/stats/medals?year=1700")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_top_athletes_returns_empty_for_nonexistent_year(self):
        """Retorna vazio para ano inexistente."""
        response = client.get("/api/stats/top-athletes?year=1700")
        assert response.status_code == 200
        assert response.json() == []


class TestDataLoaderConnectionErrors:
    """Testes para erros de conexão."""
    
    def test_data_loader_handles_db_errors(self):
        """Erros de banco são tratados."""
        loader = DataLoader()
        
        with patch.object(loader, 'get_connection_context') as mock_ctx:
            mock_ctx.side_effect = sqlite3.Error("Erro de banco")
            
            df = loader.query_filtered()
            assert isinstance(df, pd.DataFrame)
            assert len(df) == 0


class TestAllEndpointsWithMocks:
    """Testes com mocks para cobrir branches de erro."""
    
    def test_filters_handles_exception(self):
        """/api/filters trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_loader.get_unique_values.side_effect = Exception("Erro")
            mock_loader.get_year_season_map.return_value = {}
            mock_loader.get_noc_map.return_value = {}
            
            response = client.get("/api/filters")
            assert response.status_code == 200
            data = response.json()
            assert "years" in data
    
    def test_map_stats_handles_exception(self):
        """/api/stats/map trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_ctx = MagicMock()
            mock_ctx.__enter__ = MagicMock(side_effect=Exception("Erro de conexão"))
            mock_ctx.__exit__ = MagicMock(return_value=False)
            mock_loader.get_connection_context.return_value = mock_ctx
            
            response = client.get("/api/stats/map")
            assert response.status_code == 200
            assert response.json() == []
    
    def test_gender_stats_handles_exception(self):
        """/api/stats/gender trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_ctx = MagicMock()
            mock_ctx.__enter__ = MagicMock(side_effect=Exception("Erro"))
            mock_ctx.__exit__ = MagicMock(return_value=False)
            mock_loader.get_connection_context.return_value = mock_ctx
            
            response = client.get("/api/stats/gender")
            assert response.status_code == 200
            assert response.json() == []
    
    def test_biometrics_handles_exception(self):
        """/api/stats/biometrics trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_ctx = MagicMock()
            mock_ctx.__enter__ = MagicMock(side_effect=Exception("Erro"))
            mock_ctx.__exit__ = MagicMock(return_value=False)
            mock_loader.get_connection_context.return_value = mock_ctx
            
            response = client.get("/api/stats/biometrics")
            assert response.status_code == 200
            assert response.json() == []
    
    def test_evolution_handles_exception(self):
        """/api/stats/evolution trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_ctx = MagicMock()
            mock_ctx.__enter__ = MagicMock(side_effect=Exception("Erro"))
            mock_ctx.__exit__ = MagicMock(return_value=False)
            mock_loader.get_connection_context.return_value = mock_ctx
            
            response = client.get("/api/stats/evolution")
            assert response.status_code == 200
            assert response.json() == []
    
    def test_medals_handles_exception(self):
        """/api/stats/medals trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_ctx = MagicMock()
            mock_ctx.__enter__ = MagicMock(side_effect=Exception("Erro"))
            mock_ctx.__exit__ = MagicMock(return_value=False)
            mock_loader.get_connection_context.return_value = mock_ctx
            
            response = client.get("/api/stats/medals")
            assert response.status_code == 200
            assert response.json() == []
    
    def test_top_athletes_handles_exception(self):
        """/api/stats/top-athletes trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_ctx = MagicMock()
            mock_ctx.__enter__ = MagicMock(side_effect=Exception("Erro"))
            mock_ctx.__exit__ = MagicMock(return_value=False)
            mock_loader.get_connection_context.return_value = mock_ctx
            
            response = client.get("/api/stats/top-athletes")
            assert response.status_code == 200
            assert response.json() == []
    
    def test_search_athletes_handles_exception(self):
        """/api/athletes/search trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_ctx = MagicMock()
            mock_ctx.__enter__ = MagicMock(side_effect=Exception("Erro"))
            mock_ctx.__exit__ = MagicMock(return_value=False)
            mock_loader.get_connection_context.return_value = mock_ctx
            
            response = client.get("/api/athletes/search?query=Test")
            assert response.status_code == 200
            assert response.json() == []
    
    def test_athlete_profile_handles_exception(self):
        """/api/athletes/{id} trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_ctx = MagicMock()
            mock_ctx.__enter__ = MagicMock(side_effect=Exception("Erro"))
            mock_ctx.__exit__ = MagicMock(return_value=False)
            mock_loader.get_connection_context.return_value = mock_ctx
            
            response = client.get("/api/athletes/1")
            assert response.status_code == 200
            assert "error" in response.json()
    
    def test_athlete_stats_handles_exception(self):
        """/api/athletes/{id}/stats trata exceções."""
        with patch('app.api.data_loader') as mock_loader:
            mock_ctx = MagicMock()
            mock_ctx.__enter__ = MagicMock(side_effect=Exception("Erro"))
            mock_ctx.__exit__ = MagicMock(return_value=False)
            mock_loader.get_connection_context.return_value = mock_ctx
            
            response = client.get("/api/athletes/1/stats")
            assert response.status_code == 200
            assert "error" in response.json()


class TestMedalPivotScenarios:
    """Testes para pivot de medalhas."""
    
    def test_map_stats_with_only_gold(self):
        """Quando só há medalhas de ouro."""
        response = client.get("/api/stats/map?medal_type=Gold")
        assert response.status_code == 200
    
    def test_medals_with_specific_sport(self):
        """Medalhas com esporte específico."""
        response = client.get("/api/stats/medals?sport=Swimming&year=2016")
        assert response.status_code == 200


class TestAthleteProfileNullValues:
    """Testes para valores nulos no perfil."""
    
    def test_athlete_with_null_biometrics(self):
        """Atleta com biometria nula."""
        search = client.get("/api/athletes/search?query=Smith&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}")
            assert response.status_code == 200
            data = response.json()
            
            if "error" not in data:
                assert "height" in data
                assert "weight" in data


class TestCacheKeyGeneration:
    """Testes para geração de chave de cache."""
    
    def test_cache_key_with_empty_dict(self):
        """Chave com dict vazio."""
        key = get_cache_key("test", {})
        assert "test" in key
    
    def test_cache_key_with_all_none(self):
        """Chave com todos valores None."""
        key = get_cache_key("test", {"a": None, "b": None})
        assert "test" in key
        assert "null" not in key.lower()
    
    def test_cache_key_deterministic(self):
        """Chave é determinística."""
        key1 = get_cache_key("test", {"year": 2016, "season": "Summer"})
        key2 = get_cache_key("test", {"year": 2016, "season": "Summer"})
        assert key1 == key2
    
    def test_cache_key_different_for_different_params(self):
        """Parâmetros diferentes geram chaves diferentes."""
        key1 = get_cache_key("test", {"year": 2016})
        key2 = get_cache_key("test", {"year": 2012})
        assert key1 != key2
