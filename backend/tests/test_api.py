"""
Testes completos para a API do backend
Cobrindo todos os endpoints e cenários possíveis
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import pandas as pd
import numpy as np

from app.main import app
from app.api import apply_filters, router
from app.data_loader import DataLoader, generate_mock_data, DATA_PATH

client = TestClient(app)


class TestApplyFilters:
    """Testes para a função apply_filters"""
    
    @pytest.fixture
    def sample_df(self):
        """DataFrame de exemplo para testes"""
        return pd.DataFrame({
            'ID': [1, 2, 3, 4, 5],
            'Name': ['Athlete A', 'Athlete B', 'Athlete C', 'Athlete D', 'Athlete E'],
            'Sex': ['M', 'F', 'M', 'F', 'M'],
            'Year': [2016, 2016, 2012, 2012, 2008],
            'Season': ['Summer', 'Summer', 'Winter', 'Winter', 'Summer'],
            'NOC': ['USA', 'BRA', 'USA', 'CHN', 'GBR'],
            'Sport': ['Basketball', 'Judo', 'Basketball', 'Swimming', 'Football'],
            'Medal': ['Gold', 'Silver', 'No Medal', 'Bronze', 'Gold']
        })
    
    def test_apply_filters_no_filters(self, sample_df):
        """Teste sem filtros aplicados"""
        result = apply_filters(sample_df)
        assert len(result) == 5
    
    def test_apply_filters_year(self, sample_df):
        """Teste com filtro de ano"""
        result = apply_filters(sample_df, year=2016)
        assert len(result) == 2
        assert all(result['Year'] == 2016)
    
    def test_apply_filters_year_range(self, sample_df):
        """Teste com intervalo de anos"""
        result = apply_filters(sample_df, start_year=2010, end_year=2016)
        assert len(result) == 4
        assert all((result['Year'] >= 2010) & (result['Year'] <= 2016))
    
    def test_apply_filters_season(self, sample_df):
        """Teste com filtro de temporada"""
        result = apply_filters(sample_df, season='Summer')
        assert len(result) == 3
        assert all(result['Season'] == 'Summer')
    
    def test_apply_filters_season_both(self, sample_df):
        """Teste com temporada 'Both' (ignora filtro)"""
        result = apply_filters(sample_df, season='Both')
        assert len(result) == 5
    
    def test_apply_filters_sex(self, sample_df):
        """Teste com filtro de sexo"""
        result = apply_filters(sample_df, sex='M')
        assert len(result) == 3
        assert all(result['Sex'] == 'M')
    
    def test_apply_filters_sex_both(self, sample_df):
        """Teste com sexo 'Both' (ignora filtro)"""
        result = apply_filters(sample_df, sex='Both')
        assert len(result) == 5
    
    def test_apply_filters_country(self, sample_df):
        """Teste com filtro de país"""
        result = apply_filters(sample_df, country='USA')
        assert len(result) == 2
        assert all(result['NOC'] == 'USA')
    
    def test_apply_filters_country_all(self, sample_df):
        """Teste com país 'All' (ignora filtro)"""
        result = apply_filters(sample_df, country='All')
        assert len(result) == 5
    
    def test_apply_filters_sport(self, sample_df):
        """Teste com filtro de esporte"""
        result = apply_filters(sample_df, sport='Basketball')
        assert len(result) == 2
        assert all(result['Sport'] == 'Basketball')
    
    def test_apply_filters_sport_all(self, sample_df):
        """Teste com esporte 'All' (ignora filtro)"""
        result = apply_filters(sample_df, sport='All')
        assert len(result) == 5
    
    def test_apply_filters_multiple(self, sample_df):
        """Teste com múltiplos filtros"""
        result = apply_filters(sample_df, year=2016, season='Summer', sex='M')
        assert len(result) == 1
        assert result.iloc[0]['Name'] == 'Athlete A'


class TestFiltersEndpoint:
    """Testes para o endpoint /api/filters"""
    
    def test_get_filters_success(self):
        """Teste de sucesso ao obter filtros"""
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
        assert len(data["years"]) > 0
    
    def test_get_filters_countries_structure(self):
        """Teste da estrutura de países"""
        response = client.get("/api/filters")
        data = response.json()
        
        # Primeiro item deve ser "All"
        assert data["countries"][0]["code"] == "All"
        
        # Cada país deve ter code e label
        for country in data["countries"]:
            assert "code" in country
            assert "label" in country


class TestMapStatsEndpoint:
    """Testes para o endpoint /api/stats/map"""
    
    def test_get_map_stats_no_filters(self):
        """Teste sem filtros"""
        response = client.get("/api/stats/map")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_map_stats_with_year(self):
        """Teste com filtro de ano"""
        # Pega um ano válido primeiro
        filters = client.get("/api/filters").json()
        year = filters["years"][0]
        
        response = client.get(f"/api/stats/map?year={year}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_map_stats_with_year_range(self):
        """Teste com intervalo de anos"""
        filters = client.get("/api/filters").json()
        start_year = filters["years"][0]
        end_year = filters["years"][-1]
        
        response = client.get(f"/api/stats/map?start_year={start_year}&end_year={end_year}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_map_stats_with_season(self):
        """Teste com filtro de temporada"""
        response = client.get("/api/stats/map?season=Summer")
        assert response.status_code == 200
    
    def test_get_map_stats_with_sex(self):
        """Teste com filtro de sexo"""
        response = client.get("/api/stats/map?sex=M")
        assert response.status_code == 200
    
    def test_get_map_stats_with_country(self):
        """Teste com filtro de país"""
        response = client.get("/api/stats/map?country=USA")
        assert response.status_code == 200
    
    def test_get_map_stats_with_sport(self):
        """Teste com filtro de esporte"""
        response = client.get("/api/stats/map?sport=Athletics")
        assert response.status_code == 200
    
    def test_get_map_stats_structure(self):
        """Teste da estrutura de retorno"""
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
        """Teste com filtros que retornam resultado vazio"""
        # Combinação improvável de filtros
        response = client.get("/api/stats/map?year=1800&country=XXX")
        assert response.status_code == 200
        data = response.json()
        assert data == []


class TestBiometricsEndpoint:
    """Testes para o endpoint /api/stats/biometrics"""
    
    def test_get_biometrics_default(self):
        """Teste com parâmetros padrão"""
        response = client.get("/api/stats/biometrics")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_biometrics_with_sport(self):
        """Teste com filtro de esporte"""
        response = client.get("/api/stats/biometrics?sport=Swimming")
        assert response.status_code == 200
    
    def test_get_biometrics_with_year(self):
        """Teste com filtro de ano"""
        filters = client.get("/api/filters").json()
        year = filters["years"][-1]
        
        response = client.get(f"/api/stats/biometrics?year={year}")
        assert response.status_code == 200
    
    def test_get_biometrics_with_all_filters(self):
        """Teste com todos os filtros"""
        response = client.get("/api/stats/biometrics?sport=All&year=2016&season=Summer&sex=M&country=USA")
        assert response.status_code == 200
    
    def test_get_biometrics_structure(self):
        """Teste da estrutura de retorno"""
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


class TestEvolutionEndpoint:
    """Testes para o endpoint /api/stats/evolution"""
    
    def test_get_evolution_default(self):
        """Teste sem filtros (usa top 10 países)"""
        response = client.get("/api/stats/evolution")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_evolution_with_countries(self):
        """Teste com lista de países específicos"""
        response = client.get("/api/stats/evolution?countries=USA&countries=CHN&countries=BRA")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_evolution_with_country_filter(self):
        """Teste com filtro de país único"""
        response = client.get("/api/stats/evolution?country=USA")
        assert response.status_code == 200
    
    def test_get_evolution_with_season(self):
        """Teste com filtro de temporada"""
        response = client.get("/api/stats/evolution?season=Summer")
        assert response.status_code == 200
    
    def test_get_evolution_with_sex(self):
        """Teste com filtro de sexo"""
        response = client.get("/api/stats/evolution?sex=F")
        assert response.status_code == 200
    
    def test_get_evolution_with_sport(self):
        """Teste com filtro de esporte"""
        response = client.get("/api/stats/evolution?sport=Swimming")
        assert response.status_code == 200
    
    def test_get_evolution_structure(self):
        """Teste da estrutura de retorno"""
        response = client.get("/api/stats/evolution")
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "Year" in item


class TestMedalsEndpoint:
    """Testes para o endpoint /api/stats/medals"""
    
    def test_get_medals_default(self):
        """Teste sem filtros"""
        response = client.get("/api/stats/medals")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_medals_with_year(self):
        """Teste com filtro de ano"""
        filters = client.get("/api/filters").json()
        year = filters["years"][-1]
        
        response = client.get(f"/api/stats/medals?year={year}")
        assert response.status_code == 200
    
    def test_get_medals_with_country(self):
        """Teste com filtro de país (agrupa por esporte)"""
        response = client.get("/api/stats/medals?country=USA")
        assert response.status_code == 200
    
    def test_get_medals_with_season(self):
        """Teste com filtro de temporada"""
        response = client.get("/api/stats/medals?season=Winter")
        assert response.status_code == 200
    
    def test_get_medals_with_sex(self):
        """Teste com filtro de sexo"""
        response = client.get("/api/stats/medals?sex=F")
        assert response.status_code == 200
    
    def test_get_medals_with_sport(self):
        """Teste com filtro de esporte"""
        response = client.get("/api/stats/medals?sport=Gymnastics")
        assert response.status_code == 200
    
    def test_get_medals_structure(self):
        """Teste da estrutura de retorno"""
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
        """Teste com filtros que retornam resultado vazio"""
        response = client.get("/api/stats/medals?year=1800")
        assert response.status_code == 200
        data = response.json()
        assert data == []


class TestTopAthletesEndpoint:
    """Testes para o endpoint /api/stats/top-athletes"""
    
    def test_get_top_athletes_default(self):
        """Teste com parâmetros padrão"""
        response = client.get("/api/stats/top-athletes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10  # Limite padrão
    
    def test_get_top_athletes_with_limit(self):
        """Teste com limite customizado"""
        response = client.get("/api/stats/top-athletes?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5
    
    def test_get_top_athletes_with_year(self):
        """Teste com filtro de ano"""
        filters = client.get("/api/filters").json()
        year = filters["years"][-1]
        
        response = client.get(f"/api/stats/top-athletes?year={year}")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_year_range(self):
        """Teste com intervalo de anos"""
        filters = client.get("/api/filters").json()
        start_year = filters["years"][0]
        end_year = filters["years"][-1]
        
        response = client.get(f"/api/stats/top-athletes?start_year={start_year}&end_year={end_year}")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_medal_type_gold(self):
        """Teste com filtro de medalha de ouro"""
        response = client.get("/api/stats/top-athletes?medal_type=Gold")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_medal_type_silver(self):
        """Teste com filtro de medalha de prata"""
        response = client.get("/api/stats/top-athletes?medal_type=Silver")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_medal_type_bronze(self):
        """Teste com filtro de medalha de bronze"""
        response = client.get("/api/stats/top-athletes?medal_type=Bronze")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_medal_type_total(self):
        """Teste com filtro de total"""
        response = client.get("/api/stats/top-athletes?medal_type=Total")
        assert response.status_code == 200
    
    def test_get_top_athletes_with_all_filters(self):
        """Teste com todos os filtros"""
        response = client.get("/api/stats/top-athletes?year=2016&season=Summer&sex=M&country=USA&sport=Swimming&limit=5")
        assert response.status_code == 200
    
    def test_get_top_athletes_structure(self):
        """Teste da estrutura de retorno"""
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
    
    def test_get_top_athletes_invalid_limit(self):
        """Teste com limite inválido (fora do range permitido)"""
        response = client.get("/api/stats/top-athletes?limit=0")
        assert response.status_code == 422  # Validation error
        
        response = client.get("/api/stats/top-athletes?limit=100")
        assert response.status_code == 422  # Validation error


class TestAthleteSearchEndpoint:
    """Testes para o endpoint /api/athletes/search"""
    
    def test_search_athletes_success(self):
        """Teste de busca com sucesso"""
        response = client.get("/api/athletes/search?query=Michael")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_search_athletes_with_limit(self):
        """Teste de busca com limite"""
        response = client.get("/api/athletes/search?query=Michael&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5
    
    def test_search_athletes_short_query(self):
        """Teste com query muito curta"""
        response = client.get("/api/athletes/search?query=M")
        assert response.status_code == 422  # Validation error (min_length=2)
    
    def test_search_athletes_no_query(self):
        """Teste sem query"""
        response = client.get("/api/athletes/search")
        assert response.status_code == 422  # Validation error
    
    def test_search_athletes_structure(self):
        """Teste da estrutura de retorno"""
        response = client.get("/api/athletes/search?query=John")
        data = response.json()
        
        if len(data) > 0:
            item = data[0]
            assert "id" in item
            assert "name" in item
            assert "noc" in item
            assert "sport" in item
    
    def test_search_athletes_no_results(self):
        """Teste sem resultados"""
        response = client.get("/api/athletes/search?query=XYZXYZXYZ123456")
        assert response.status_code == 200
        data = response.json()
        assert data == []


class TestAthleteProfileEndpoint:
    """Testes para o endpoint /api/athletes/{athlete_id}"""
    
    def test_get_athlete_profile_success(self):
        """Teste de perfil com sucesso"""
        # Primeiro busca um atleta válido
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
        """Teste com ID inexistente"""
        response = client.get("/api/athletes/9999999")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
    
    def test_get_athlete_profile_structure(self):
        """Teste completo da estrutura de retorno"""
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
                
                # Verificar estrutura de medals
                assert "gold" in data["medals"]
                assert "silver" in data["medals"]
                assert "bronze" in data["medals"]
                assert "total" in data["medals"]
                
                # Verificar estrutura de age_range
                assert "min" in data["age_range"]
                assert "max" in data["age_range"]


class TestAthleteStatsEndpoint:
    """Testes para o endpoint /api/athletes/{athlete_id}/stats"""
    
    def test_get_athlete_stats_success(self):
        """Teste de estatísticas com sucesso"""
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
        """Teste com ID inexistente"""
        response = client.get("/api/athletes/9999999/stats")
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
    
    def test_get_athlete_stats_structure(self):
        """Teste completo da estrutura de retorno"""
        search = client.get("/api/athletes/search?query=Phelps&limit=1").json()
        if len(search) > 0:
            athlete_id = search[0]["id"]
            response = client.get(f"/api/athletes/{athlete_id}/stats")
            data = response.json()
            
            if "error" not in data:
                # Evolution
                assert isinstance(data["evolution"], list)
                if len(data["evolution"]) > 0:
                    evo_item = data["evolution"][0]
                    assert "Year" in evo_item
                    assert "Gold" in evo_item
                    assert "Silver" in evo_item
                    assert "Bronze" in evo_item
                    assert "Total" in evo_item
                    assert "Events" in evo_item
                
                # Biometrics
                assert "height" in data["biometrics"]
                assert "weight" in data["biometrics"]
                assert "sex" in data["biometrics"]
                
                # Medals by sport
                assert isinstance(data["medals_by_sport"], list)


class TestRootEndpoint:
    """Testes para o endpoint raiz"""
    
    def test_root(self):
        """Teste do endpoint raiz"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Olympic Data API is running"}


class TestHealthEndpoint:
    """Testes para o endpoint de saúde"""
    
    def test_health_check(self):
        """Teste do health check"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
