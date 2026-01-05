"""Testes para a API do backend."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import pandas as pd
import numpy as np

from app.main import app
from app.api import router, RESPONSE_CACHE, get_cache_key, cached_endpoint

client = TestClient(app)


class TestCacheUtils:
    """Testes para funções de cache."""
    
    def test_get_cache_key_simple(self):
        """Geração de chave de cache simples."""
        key = get_cache_key("test_func", {"year": 2016, "season": "Summer"})
        assert "test_func" in key
        assert "2016" in key
        assert "Summer" in key
    
    def test_get_cache_key_with_none_values(self):
        """Geração de chave de cache com valores None."""
        key = get_cache_key("test_func", {"year": 2016, "season": None})
        assert "test_func" in key
        assert "2016" in key
        assert "season" not in key
    
    def test_get_cache_key_with_list(self):
        """Geração de chave de cache com lista."""
        key = get_cache_key("test_func", {"countries": ["USA", "BRA"]})
        assert "test_func" in key
        assert "BRA" in key
        assert "USA" in key
    
    def test_cached_endpoint_decorator(self):
        """Decorator de cache."""
        RESPONSE_CACHE.clear()
        
        response1 = client.get("/api/filters")
        response2 = client.get("/api/filters")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.json() == response2.json()


class TestFiltersEndpoint:
    """Testes para /api/filters."""
    
    def test_get_filters_success(self):
        """Obter filtros com sucesso."""
        response = client.get("/api/filters")
        assert response.status_code == 200
        data = response.json()
        
        assert "years" in data
        assert "sports" in data
        assert "countries" in data
        assert "year_season_map" in data
        
        assert isinstance(data["years"], list)
        assert isinstance(data["sports"], list)
        assert isinstance(data["countries"], list)
    
    def test_get_filters_countries_structure(self):
        """Estrutura de países."""
        response = client.get("/api/filters")
        data = response.json()
        
        assert data["countries"][0]["code"] == "All"
        
        for country in data["countries"]:
            assert "code" in country
            assert "label" in country
    
    def test_get_filters_year_season_map(self):
        """Mapeamento ano-temporada."""
        response = client.get("/api/filters")
        data = response.json()
        
        assert isinstance(data["year_season_map"], dict)
        for year, seasons in data["year_season_map"].items():
            assert isinstance(seasons, list)


class TestMapStatsEndpoint:
    """Testes para /api/stats/map."""
    
    def test_get_map_stats_no_filters(self):
        """Sem filtros."""
        response = client.get("/api/stats/map")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_map_stats_with_year(self):
        """Com filtro de ano."""
        filters = client.get("/api/filters").json()
        if filters["years"]:
            year = filters["years"][0]
            response = client.get(f"/api/stats/map?year={year}")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
    
    def test_get_map_stats_with_year_range(self):
        """Com intervalo de anos."""
        filters = client.get("/api/filters").json()
        if len(filters["years"]) >= 2:
            start_year = filters["years"][0]
            end_year = filters["years"][-1]
            
            response = client.get(f"/api/stats/map?start_year={start_year}&end_year={end_year}")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
    
    def test_get_map_stats_with_season(self):
        """Com filtro de temporada."""
        response = client.get("/api/stats/map?season=Summer")
        assert response.status_code == 200
    
    def test_get_map_stats_with_sex(self):
        """Com filtro de sexo."""
        response = client.get("/api/stats/map?sex=M")
        assert response.status_code == 200
    
    def test_get_map_stats_with_country(self):
        """Com filtro de país."""
        response = client.get("/api/stats/map?country=USA")
        assert response.status_code == 200
    
    def test_get_map_stats_with_sport(self):
        """Com filtro de esporte."""
        response = client.get("/api/stats/map?sport=Athletics")
        assert response.status_code == 200
    
    def test_get_map_stats_structure(self):
        """Estrutura de retorno."""
        response = client.get("/api/stats/map")
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "id" in item
            assert "gold" in item
            assert "silver" in item
            assert "bronze" in item
            assert "total" in item
    
    def test_get_map_stats_empty_result(self):
        """Filtros que retornam vazio."""
        response = client.get("/api/stats/map?year=1800&country=XXX")
        assert response.status_code == 200
        data = response.json()
        assert data == []
    
    def test_get_map_stats_season_both(self):
        """Temporada Both."""
        response = client.get("/api/stats/map?season=Both")
        assert response.status_code == 200


class TestGenderStatsEndpoint:
    """Testes para /api/stats/gender."""
    
    def test_get_gender_stats_default(self):
        """Sem filtros."""
        response = client.get("/api/stats/gender")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_gender_stats_with_year(self):
        """Com filtro de ano."""
        filters = client.get("/api/filters").json()
        if filters["years"]:
            year = filters["years"][-1]
            response = client.get(f"/api/stats/gender?year={year}")
            assert response.status_code == 200
    
    def test_get_gender_stats_with_year_range(self):
        """Com intervalo de anos."""
        filters = client.get("/api/filters").json()
        if len(filters["years"]) >= 2:
            start_year = filters["years"][0]
            end_year = filters["years"][-1]
            
            response = client.get(f"/api/stats/gender?start_year={start_year}&end_year={end_year}")
            assert response.status_code == 200
    
    def test_get_gender_stats_with_season(self):
        """Com filtro de temporada."""
        response = client.get("/api/stats/gender?season=Summer")
        assert response.status_code == 200
    
    def test_get_gender_stats_with_sex(self):
        """Com filtro de sexo."""
        response = client.get("/api/stats/gender?sex=M")
        assert response.status_code == 200
    
    def test_get_gender_stats_with_country(self):
        """Com filtro de país."""
        response = client.get("/api/stats/gender?country=USA")
        assert response.status_code == 200
    
    def test_get_gender_stats_with_sport(self):
        """Com filtro de esporte."""
        response = client.get("/api/stats/gender?sport=Swimming")
        assert response.status_code == 200
    
    def test_get_gender_stats_with_medal_type(self):
        """Com filtro de tipo de medalha."""
        response = client.get("/api/stats/gender?medal_type=Gold")
        assert response.status_code == 200
    
    def test_get_gender_stats_structure(self):
        """Estrutura de retorno."""
        response = client.get("/api/stats/gender")
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "Sex" in item
            assert "Count" in item
    
    def test_get_gender_stats_empty(self):
        """Filtros que retornam vazio."""
        response = client.get("/api/stats/gender?year=1800")
        assert response.status_code == 200
        data = response.json()
        assert data == []


class TestBiometricsEndpoint:
    """Testes para /api/stats/biometrics."""
    
    def test_get_biometrics_default(self):
        """Com parâmetros padrão."""
        response = client.get("/api/stats/biometrics")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_biometrics_with_sport(self):
        """Com filtro de esporte."""
        response = client.get("/api/stats/biometrics?sport=Swimming")
        assert response.status_code == 200
    
    def test_get_biometrics_with_year(self):
        """Com filtro de ano."""
        filters = client.get("/api/filters").json()
        if filters["years"]:
            year = filters["years"][-1]
            response = client.get(f"/api/stats/biometrics?year={year}")
            assert response.status_code == 200
    
    def test_get_biometrics_with_all_filters(self):
        """Com todos os filtros."""
        response = client.get("/api/stats/biometrics?sport=All&year=2016&season=Summer&sex=M&country=USA")
        assert response.status_code == 200
    
    def test_get_biometrics_structure(self):
        """Estrutura de retorno."""
        response = client.get("/api/stats/biometrics")
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "Name" in item
            assert "Sex" in item
            assert "Height" in item
            assert "Weight" in item
            assert "Medal" in item
            assert "NOC" in item
    
    def test_get_biometrics_sport_all(self):
        """Com esporte All."""
        response = client.get("/api/stats/biometrics?sport=All")
        assert response.status_code == 200
    
    def test_get_biometrics_country_all(self):
        """Com país All."""
        response = client.get("/api/stats/biometrics?country=All")
        assert response.status_code == 200
    
    def test_get_biometrics_season_both(self):
        """Com temporada Both."""
        response = client.get("/api/stats/biometrics?season=Both")
        assert response.status_code == 200


class TestEvolutionEndpoint:
    """Testes para /api/stats/evolution."""
    
    def test_get_evolution_default(self):
        """Sem filtros (usa top 10 países)."""
        response = client.get("/api/stats/evolution")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_evolution_with_countries(self):
        """Com lista de países."""
        response = client.get("/api/stats/evolution?countries=USA&countries=CHN&countries=BRA")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_evolution_with_country_filter(self):
        """Com filtro de país único."""
        response = client.get("/api/stats/evolution?country=USA")
        assert response.status_code == 200
    
    def test_get_evolution_with_season(self):
        """Com filtro de temporada."""
        response = client.get("/api/stats/evolution?season=Summer")
        assert response.status_code == 200
    
    def test_get_evolution_with_sex(self):
        """Com filtro de sexo."""
        response = client.get("/api/stats/evolution?sex=F")
        assert response.status_code == 200
    
    def test_get_evolution_with_sport(self):
        """Com filtro de esporte."""
        response = client.get("/api/stats/evolution?sport=Swimming")
        assert response.status_code == 200
    
    def test_get_evolution_structure(self):
        """Estrutura de retorno."""
        response = client.get("/api/stats/evolution")
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "Year" in item
    
    def test_get_evolution_empty_countries(self):
        """Com países inexistentes."""
        response = client.get("/api/stats/evolution?countries=XXX&countries=YYY")
        assert response.status_code == 200
        data = response.json()
        assert data == []


class TestMedalsEndpoint:
    """Testes para /api/stats/medals."""
    
    def test_get_medals_default(self):
        """Sem filtros."""
        response = client.get("/api/stats/medals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_medals_with_year(self):
        """Com filtro de ano."""
        filters = client.get("/api/filters").json()
        if filters["years"]:
            year = filters["years"][-1]
            response = client.get(f"/api/stats/medals?year={year}")
            assert response.status_code == 200
    
    def test_get_medals_with_country(self):
        """Com filtro de país (agrupa por esporte)."""
        response = client.get("/api/stats/medals?country=USA")
        assert response.status_code == 200
    
    def test_get_medals_with_season(self):
        """Com filtro de temporada."""
        response = client.get("/api/stats/medals?season=Winter")
        assert response.status_code == 200
    
    def test_get_medals_with_sex(self):
        """Com filtro de sexo."""
        response = client.get("/api/stats/medals?sex=F")
        assert response.status_code == 200
    
    def test_get_medals_with_sport(self):
        """Com filtro de esporte."""
        response = client.get("/api/stats/medals?sport=Gymnastics")
        assert response.status_code == 200
    
    def test_get_medals_structure(self):
        """Estrutura de retorno."""
        response = client.get("/api/stats/medals")
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "name" in item
            assert "code" in item
            assert "gold" in item
            assert "silver" in item
            assert "bronze" in item
            assert "total" in item
    
    def test_get_medals_empty_result(self):
        """Filtros que retornam vazio."""
        response = client.get("/api/stats/medals?year=1800")
        assert response.status_code == 200
        data = response.json()
        assert data == []


class TestTopAthletesEndpoint:
    """Testes para /api/stats/top-athletes."""
    
    def test_get_top_athletes_default(self):
        """Com parâmetros padrão."""
        response = client.get("/api/stats/top-athletes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10
    
    def test_get_top_athletes_with_limit(self):
        """Com limite customizado."""
        response = client.get("/api/stats/top-athletes?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5
    
    def test_get_top_athletes_with_year(self):
        """Com filtro de ano."""
        filters = client.get("/api/filters").json()
        if filters["years"]:
            year = filters["years"][-1]
            response = client.get(f"/api/stats/top-athletes?year={year}")
            assert response.status_code == 200
    
    def test_get_top_athletes_with_year_range(self):
        """Com intervalo de anos."""
        filters = client.get("/api/filters").json()
        if len(filters["years"]) >= 2:
            start_year = filters["years"][0]
            end_year = filters["years"][-1]
            
            response = client.get(f"/api/stats/top-athletes?start_year={start_year}&end_year={end_year}")
            assert response.status_code == 200
    
    def test_get_top_athletes_with_medal_type_gold(self):
        """Com filtro de ouro."""
        response = client.get("/api/stats/top-athletes?medal_type=Gold")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_medal_type_silver(self):
        """Com filtro de prata."""
        response = client.get("/api/stats/top-athletes?medal_type=Silver")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_medal_type_bronze(self):
        """Com filtro de bronze."""
        response = client.get("/api/stats/top-athletes?medal_type=Bronze")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_medal_type_total(self):
        """Com filtro de total."""
        response = client.get("/api/stats/top-athletes?medal_type=Total")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_all_filters(self):
        """Com todos os filtros."""
        response = client.get("/api/stats/top-athletes?year=2016&season=Summer&sex=M&country=USA&sport=Swimming&limit=5")
        assert response.status_code == 200
    
    def test_get_top_athletes_structure(self):
        """Estrutura de retorno."""
        response = client.get("/api/stats/top-athletes")
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "id" in item
            assert "name" in item
            assert "noc" in item
            assert "gold" in item
            assert "silver" in item
            assert "bronze" in item
            assert "total" in item
    
    def test_get_top_athletes_invalid_limit_low(self):
        """Limite inválido baixo."""
        response = client.get("/api/stats/top-athletes?limit=0")
        assert response.status_code == 422
    
    def test_get_top_athletes_invalid_limit_high(self):
        """Limite inválido alto."""
        response = client.get("/api/stats/top-athletes?limit=100")
        assert response.status_code == 422


class TestAthleteSearchEndpoint:
    """Testes para /api/athletes/search."""
    
    def test_search_athletes_success(self):
        """Busca com sucesso."""
        response = client.get("/api/athletes/search?query=Michael")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_search_athletes_with_limit(self):
        """Busca com limite."""
        response = client.get("/api/athletes/search?query=Michael&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5
    
    def test_search_athletes_short_query(self):
        """Query muito curta."""
        response = client.get("/api/athletes/search?query=M")
        assert response.status_code == 422
    
    def test_search_athletes_no_query(self):
        """Sem query."""
        response = client.get("/api/athletes/search")
        assert response.status_code == 422
    
    def test_search_athletes_structure(self):
        """Estrutura de retorno."""
        response = client.get("/api/athletes/search?query=John")
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "id" in item
            assert "name" in item
            assert "noc" in item
            assert "sport" in item
    
    def test_search_athletes_no_results(self):
        """Sem resultados."""
        response = client.get("/api/athletes/search?query=XYZXYZXYZ123456")
        assert response.status_code == 200
        data = response.json()
        assert data == []
    
    def test_search_athletes_starts_with_priority(self):
        """Nomes que começam com a query aparecem primeiro."""
        response = client.get("/api/athletes/search?query=Phelps")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            first_name_lower = data[0]['name'].lower()
            assert 'phelps' in first_name_lower


class TestAthleteProfileEndpoint:
    """Testes para /api/athletes/{athlete_id}."""
    
    def test_get_athlete_profile_success(self):
        """Perfil com sucesso."""
        search = client.get("/api/athletes/search?query=Michael&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}")
            assert response.status_code == 200
            data = response.json()
            
            assert "id" in data
            assert "name" in data
            assert "sex" in data
            assert "noc" in data
            assert "medals" in data
            assert "participations" in data
    
    def test_get_athlete_profile_not_found(self):
        """ID inexistente."""
        response = client.get("/api/athletes/9999999")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
    
    def test_get_athlete_profile_structure(self):
        """Estrutura completa de retorno."""
        search = client.get("/api/athletes/search?query=Usain&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}")
            data = response.json()
            
            if "error" not in data:
                assert "id" in data
                assert "name" in data
                assert "sex" in data
                assert "noc" in data
                assert "team" in data
                assert "height" in data
                assert "weight" in data
                assert "age_range" in data
                assert "sports" in data
                assert "years" in data
                assert "medals" in data
                assert "participations" in data
                
                assert "gold" in data["medals"]
                assert "silver" in data["medals"]
                assert "bronze" in data["medals"]
                assert "total" in data["medals"]
                
                assert "min" in data["age_range"]
                assert "max" in data["age_range"]


class TestAthleteStatsEndpoint:
    """Testes para /api/athletes/{athlete_id}/stats."""
    
    def test_get_athlete_stats_success(self):
        """Estatísticas com sucesso."""
        search = client.get("/api/athletes/search?query=Michael&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}/stats")
            assert response.status_code == 200
            data = response.json()
            
            if "error" not in data:
                assert "evolution" in data
                assert "biometrics" in data
                assert "medals_by_sport" in data
    
    def test_get_athlete_stats_not_found(self):
        """ID inexistente."""
        response = client.get("/api/athletes/9999999/stats")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
    
    def test_get_athlete_stats_structure(self):
        """Estrutura completa de retorno."""
        search = client.get("/api/athletes/search?query=Phelps&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}/stats")
            data = response.json()
            
            if "error" not in data:
                assert isinstance(data["evolution"], list)
                if len(data["evolution"]) > 0:
                    evo_item = data["evolution"][0]
                    assert "Year" in evo_item
                    assert "Gold" in evo_item
                    assert "Silver" in evo_item
                    assert "Bronze" in evo_item
                    assert "Total" in evo_item
                    assert "Events" in evo_item
                
                assert "height" in data["biometrics"]
                assert "weight" in data["biometrics"]
                assert "sex" in data["biometrics"]
                
                assert isinstance(data["medals_by_sport"], list)


class TestRootEndpoint:
    """Testes para o endpoint raiz."""
    
    def test_root(self):
        """Endpoint raiz."""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Olympic Data API is running"}


class TestHealthEndpoint:
    """Testes para health check."""
    
    def test_health_check(self):
        """Health check."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
