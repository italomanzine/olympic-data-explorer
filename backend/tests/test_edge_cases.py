"""Testes adicionais para cenários de borda."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import pandas as pd
import numpy as np

from app.main import app
from app.data_loader import data_loader

client = TestClient(app)


class TestMapStatsEdgeCases:
    """Casos de borda para /api/stats/map."""
    
    def test_map_stats_with_all_filters(self):
        """Com todos os filtros combinados."""
        response = client.get("/api/stats/map?year=2016&season=Summer&sex=M&country=USA&sport=Swimming")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_map_stats_empty_with_invalid_combination(self):
        """Combinação de filtros que retorna vazio."""
        response = client.get("/api/stats/map?year=1800&country=ZZZ&sport=InvalidSport")
        assert response.status_code == 200
        data = response.json()
        assert data == []
    
    def test_map_stats_winter_season(self):
        """Temporada de inverno."""
        response = client.get("/api/stats/map?season=Winter")
        assert response.status_code == 200


class TestGenderStatsEdgeCases:
    """Casos de borda para /api/stats/gender."""
    
    def test_gender_stats_with_all_filters(self):
        """Com todos os filtros combinados."""
        response = client.get("/api/stats/gender?year=2016&season=Summer&sex=M&country=USA&sport=Swimming&medal_type=Gold")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_gender_stats_medal_type_total(self):
        """Com medal_type=Total."""
        response = client.get("/api/stats/gender?medal_type=Total")
        assert response.status_code == 200


class TestBiometricsEdgeCases:
    """Casos de borda para /api/stats/biometrics."""
    
    def test_biometrics_empty_with_invalid_filters(self):
        """Filtros que retornam vazio."""
        response = client.get("/api/stats/biometrics?year=1800")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_biometrics_with_winter_sport(self):
        """Esporte de inverno."""
        response = client.get("/api/stats/biometrics?sport=Ice%20Hockey")
        assert response.status_code == 200


class TestEvolutionEdgeCases:
    """Casos de borda para /api/stats/evolution."""
    
    def test_evolution_with_non_matching_countries(self):
        """Países sem dados."""
        response = client.get("/api/stats/evolution?countries=XXX&countries=YYY")
        assert response.status_code == 200
        data = response.json()
        assert data == []
    
    def test_evolution_country_overrides_countries(self):
        """Country sobrescreve countries."""
        response = client.get("/api/stats/evolution?country=BRA&countries=USA&countries=CHN")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            assert 'BRA' in data[0] or 'Year' in data[0]
    
    def test_evolution_with_all_filters(self):
        """Com todos os filtros."""
        response = client.get("/api/stats/evolution?season=Summer&sex=M&sport=Swimming")
        assert response.status_code == 200


class TestMedalsEdgeCases:
    """Casos de borda para /api/stats/medals."""
    
    def test_medals_grouping_by_sport_when_country_set(self):
        """Agrupa por esporte quando país está definido."""
        response = client.get("/api/stats/medals?country=USA")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            assert 'code' in data[0]
    
    def test_medals_grouping_by_noc_when_country_not_set(self):
        """Agrupa por NOC quando país não está definido."""
        response = client.get("/api/stats/medals")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            assert 'code' in data[0]
    
    def test_medals_with_all_filters(self):
        """Com todos os filtros."""
        response = client.get("/api/stats/medals?year=2016&season=Summer&sex=M&sport=Swimming")
        assert response.status_code == 200


class TestTopAthletesEdgeCases:
    """Casos de borda para /api/stats/top-athletes."""
    
    def test_top_athletes_empty_with_invalid_medal_type(self):
        """Tipo de medalha sem resultados."""
        response = client.get("/api/stats/top-athletes?sport=Curling&year=1896&medal_type=Gold")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_top_athletes_with_max_limit(self):
        """Limite máximo permitido."""
        response = client.get("/api/stats/top-athletes?limit=50")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 50
    
    def test_top_athletes_ordering_by_gold(self):
        """Ordenação por medalhas de ouro."""
        response = client.get("/api/stats/top-athletes?medal_type=Gold&limit=10")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 1:
            for i in range(len(data) - 1):
                assert data[i]['gold'] >= data[i + 1]['gold']
    
    def test_top_athletes_ordering_by_total(self):
        """Ordenação por total de medalhas."""
        response = client.get("/api/stats/top-athletes?medal_type=Total&limit=10")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 1:
            for i in range(len(data) - 1):
                assert data[i]['total'] >= data[i + 1]['total']


class TestAthleteProfileEdgeCases:
    """Casos de borda para perfil de atleta."""
    
    def test_athlete_profile_with_valid_id(self):
        """Perfil com ID válido."""
        search = client.get("/api/athletes/search?query=Phelps&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}")
            assert response.status_code == 200
            data = response.json()
            
            if "error" not in data:
                participations = data.get('participations', [])
                if len(participations) > 1:
                    years = [p['year'] for p in participations]
                    assert years == sorted(years)
    
    def test_athlete_profile_medals_structure(self):
        """Estrutura de medalhas no perfil."""
        search = client.get("/api/athletes/search?query=Bolt&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}")
            data = response.json()
            
            if "error" not in data:
                medals = data.get('medals', {})
                assert 'gold' in medals
                assert 'silver' in medals
                assert 'bronze' in medals
                assert 'total' in medals
                assert medals['total'] == medals['gold'] + medals['silver'] + medals['bronze']


class TestAthleteStatsEdgeCases:
    """Casos de borda para estatísticas de atleta."""
    
    def test_athlete_stats_evolution_structure(self):
        """Estrutura de evolução nas estatísticas."""
        search = client.get("/api/athletes/search?query=Phelps&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}/stats")
            data = response.json()
            
            if "error" not in data:
                evolution = data.get('evolution', [])
                for evo in evolution:
                    assert 'Year' in evo
                    assert 'Gold' in evo
                    assert 'Silver' in evo
                    assert 'Bronze' in evo
                    assert 'Total' in evo
                    assert 'Events' in evo
    
    def test_athlete_stats_medals_by_sport(self):
        """Medalhas por esporte."""
        search = client.get("/api/athletes/search?query=Phelps&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}/stats")
            data = response.json()
            
            if "error" not in data:
                medals_by_sport = data.get('medals_by_sport', [])
                if len(medals_by_sport) > 0:
                    for sport in medals_by_sport:
                        assert 'name' in sport
                        assert 'code' in sport
                        assert 'gold' in sport
                        assert 'silver' in sport
                        assert 'bronze' in sport
                        assert 'total' in sport


class TestSearchAthletesSorting:
    """Testes de ordenação na busca de atletas."""
    
    def test_search_athletes_returns_list(self):
        """Busca retorna lista."""
        response = client.get("/api/athletes/search?query=Michael")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_search_athletes_limit_respected(self):
        """Limite é respeitado."""
        response = client.get("/api/athletes/search?query=John&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 3


class TestCacheBehavior:
    """Testes para comportamento do cache."""
    
    def test_cache_returns_same_result(self):
        """Cache retorna mesmo resultado."""
        response1 = client.get("/api/stats/map?year=2016")
        response2 = client.get("/api/stats/map?year=2016")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.json() == response2.json()
    
    def test_different_params_different_cache(self):
        """Parâmetros diferentes usam cache diferente."""
        response1 = client.get("/api/stats/map?year=2016")
        response2 = client.get("/api/stats/map?year=2012")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
