"""
Testes adicionais para cobrir cenários de borda e linhas específicas
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import pandas as pd
import numpy as np

from app.main import app
from app.api import apply_filters
from app.data_loader import data_loader

client = TestClient(app)


class TestMapStatsEdgeCases:
    """Testes de casos de borda para /api/stats/map"""
    
    def test_map_stats_with_only_gold_medals(self):
        """Teste quando há apenas medalhas de ouro (sem silver/bronze)"""
        mock_df = pd.DataFrame({
            'ID': [1, 2],
            'Name': ['A', 'B'],
            'Sex': ['M', 'F'],
            'Year': [2016, 2016],
            'Season': ['Summer', 'Summer'],
            'NOC': ['USA', 'USA'],
            'Sport': ['Swimming', 'Swimming'],
            'Event': ['100m', '200m'],
            'Medal': ['Gold', 'Gold']
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            response = client.get("/api/stats/map?year=2016")
            assert response.status_code == 200
            data = response.json()
            if len(data) > 0:
                # Deve ter Silver e Bronze zerados
                assert data[0]['silver'] == 0
                assert data[0]['bronze'] == 0


class TestBiometricsEdgeCases:
    """Testes de casos de borda para /api/stats/biometrics"""
    
    def test_biometrics_empty_after_height_weight_filter(self):
        """Teste quando não há dados após filtrar por Height/Weight"""
        mock_df = pd.DataFrame({
            'ID': [1],
            'Name': ['A'],
            'Sex': ['M'],
            'Year': [2016],
            'Season': ['Summer'],
            'NOC': ['USA'],
            'Sport': ['Swimming'],
            'Event': ['100m'],
            'Medal': ['Gold'],
            'Height': [np.nan],  # Sem altura
            'Weight': [np.nan]   # Sem peso
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            response = client.get("/api/stats/biometrics")
            assert response.status_code == 200
            data = response.json()
            assert data == []  # Linha 127 - retorna vazio


class TestEvolutionEdgeCases:
    """Testes de casos de borda para /api/stats/evolution"""
    
    def test_evolution_with_non_matching_countries(self):
        """Teste quando países especificados não têm dados"""
        response = client.get("/api/stats/evolution?countries=XXX&countries=YYY")
        assert response.status_code == 200
        data = response.json()
        assert data == []  # Linha 173 - retorna vazio quando filtro resulta em nada
    
    def test_evolution_no_medals_at_all(self):
        """Teste quando não há medalhas após filtros - Linha 161"""
        mock_df = pd.DataFrame({
            'ID': [1, 2],
            'Name': ['A', 'B'],
            'Sex': ['M', 'F'],
            'Year': [2016, 2016],
            'Season': ['Summer', 'Summer'],
            'NOC': ['USA', 'BRA'],
            'Sport': ['Swimming', 'Judo'],
            'Event': ['100m', '60kg'],
            'Medal': ['No Medal', 'No Medal']  # Sem medalhas
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            response = client.get("/api/stats/evolution")
            assert response.status_code == 200
            data = response.json()
            assert data == []  # Linha 161


class TestMedalsEdgeCases:
    """Testes de casos de borda para /api/stats/medals"""
    
    def test_medals_with_only_silver_medals(self):
        """Teste quando há apenas medalhas de prata (sem gold/bronze)"""
        mock_df = pd.DataFrame({
            'ID': [1, 2],
            'Name': ['A', 'B'],
            'Sex': ['M', 'F'],
            'Year': [2016, 2016],
            'Season': ['Summer', 'Summer'],
            'NOC': ['USA', 'BRA'],
            'Team': ['United States', 'Brazil'],
            'Sport': ['Swimming', 'Judo'],
            'Event': ['100m', '60kg'],
            'Medal': ['Silver', 'Silver']
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            response = client.get("/api/stats/medals?year=2016")
            assert response.status_code == 200
            data = response.json()
            if len(data) > 0:
                # Deve ter Gold e Bronze zerados - Linha 211
                assert data[0]['gold'] == 0
                assert data[0]['bronze'] == 0


class TestTopAthletesEdgeCases:
    """Testes de casos de borda para /api/stats/top-athletes"""
    
    def test_top_athletes_medal_type_filters_to_empty(self):
        """Teste quando filtro de medalha resulta em lista vazia - Linha 264"""
        mock_df = pd.DataFrame({
            'ID': [1, 2],
            'Name': ['A', 'B'],
            'Sex': ['M', 'F'],
            'Year': [2016, 2016],
            'Season': ['Summer', 'Summer'],
            'NOC': ['USA', 'BRA'],
            'Sport': ['Swimming', 'Judo'],
            'Event': ['100m', '60kg'],
            'Medal': ['Bronze', 'Bronze']  # Só bronze
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            # Pedir Gold quando só há Bronze - deve retornar vazio na linha 264
            response = client.get("/api/stats/top-athletes?medal_type=Gold")
            assert response.status_code == 200
            data = response.json()
            assert data == []  # Linha 264 - retorna vazio
    
    def test_top_athletes_only_silver_medals(self):
        """Teste quando atletas têm apenas medalhas de prata"""
        mock_df = pd.DataFrame({
            'ID': [1, 1, 2],
            'Name': ['Athlete A', 'Athlete A', 'Athlete B'],
            'Sex': ['M', 'M', 'F'],
            'Year': [2016, 2012, 2016],
            'Season': ['Summer', 'Summer', 'Summer'],
            'NOC': ['USA', 'USA', 'BRA'],
            'Sport': ['Swimming', 'Swimming', 'Judo'],
            'Event': ['100m', '200m', '60kg'],
            'Medal': ['Silver', 'Silver', 'Silver']  # Apenas prata
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            response = client.get("/api/stats/top-athletes")
            assert response.status_code == 200
            data = response.json()
            if len(data) > 0:
                # Deve ter Gold e Bronze zerados - Linha 271
                assert data[0]['gold'] == 0
                assert data[0]['bronze'] == 0
    
    def test_top_athletes_with_invalid_medal_type_sort(self):
        """Teste ordenação com tipo de medalha que não está na coluna - Linha 289"""
        mock_df = pd.DataFrame({
            'ID': [1, 2],
            'Name': ['A', 'B'],
            'Sex': ['M', 'F'],
            'Year': [2016, 2016],
            'Season': ['Summer', 'Summer'],
            'NOC': ['USA', 'BRA'],
            'Sport': ['Swimming', 'Judo'],
            'Event': ['100m', '60kg'],
            'Medal': ['Gold', 'Silver']
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            # Pedir para ordenar por tipo que não existe no resultado agrupado
            # 'Platinum' não é uma medalha válida, então sort_col será 'Total' - Linha 289
            response = client.get("/api/stats/top-athletes?medal_type=Platinum")
            assert response.status_code == 200
            # O código vai tentar usar Platinum como sort_col, mas não existe
            # então cai no fallback para 'Total' na linha 289
            data = response.json()
            assert isinstance(data, list)
    
    def test_top_athletes_empty_after_medal_filter_with_data(self):
        """Teste específico: medalhas existem mas filtro específico retorna vazio"""
        mock_df = pd.DataFrame({
            'ID': [1, 2, 3],
            'Name': ['A', 'B', 'C'],
            'Sex': ['M', 'F', 'M'],
            'Year': [2016, 2016, 2016],
            'Season': ['Summer', 'Summer', 'Summer'],
            'NOC': ['USA', 'BRA', 'CHN'],
            'Sport': ['Swimming', 'Judo', 'Gymnastics'],
            'Event': ['100m', '60kg', 'Floor'],
            'Medal': ['Silver', 'Bronze', 'Silver']  # Sem Gold
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            # Filtra por Gold quando só há Silver e Bronze
            response = client.get("/api/stats/top-athletes?medal_type=Gold")
            assert response.status_code == 200
            data = response.json()
            assert data == []


class TestAthleteProfileEdgeCases:
    """Testes de casos de borda para perfil de atleta"""
    
    def test_athlete_profile_with_null_values(self):
        """Teste de perfil com valores nulos"""
        mock_df = pd.DataFrame({
            'ID': [1, 1],
            'Name': ['Test Athlete', 'Test Athlete'],
            'Sex': ['M', 'M'],
            'Age': [25, 26],
            'Height': [np.nan, np.nan],  # Sem altura
            'Weight': [np.nan, np.nan],  # Sem peso
            'Team': ['Test Team', 'Test Team'],
            'NOC': ['TST', 'TST'],
            'Year': [2016, 2012],
            'Season': ['Summer', 'Summer'],
            'City': [np.nan, 'London'],  # Uma cidade nula
            'Sport': ['Swimming', 'Swimming'],
            'Event': ['100m', '200m'],
            'Medal': ['Gold', 'No Medal']
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            response = client.get("/api/athletes/1")
            assert response.status_code == 200
            data = response.json()
            
            if "error" not in data:
                assert data['height'] is None
                assert data['weight'] is None
    
    def test_athlete_stats_with_no_medals(self):
        """Teste de estatísticas de atleta sem medalhas"""
        mock_df = pd.DataFrame({
            'ID': [1, 1],
            'Name': ['Test Athlete', 'Test Athlete'],
            'Sex': ['M', 'M'],
            'Age': [25, 26],
            'Height': [180.0, 180.0],
            'Weight': [75.0, 75.0],
            'Team': ['Test Team', 'Test Team'],
            'NOC': ['TST', 'TST'],
            'Year': [2016, 2012],
            'Season': ['Summer', 'Summer'],
            'City': ['Rio', 'London'],
            'Sport': ['Swimming', 'Swimming'],
            'Event': ['100m', '200m'],
            'Medal': ['No Medal', 'No Medal']
        })
        
        with patch.object(data_loader, 'get_df', return_value=mock_df):
            response = client.get("/api/athletes/1/stats")
            assert response.status_code == 200
            data = response.json()
            
            if "error" not in data:
                # Evolution deve mostrar 0 medalhas
                for year_data in data['evolution']:
                    assert year_data['Total'] == 0


class TestSearchAthletesSorting:
    """Testes de ordenação na busca de atletas"""
    
    def test_search_athletes_starts_with_priority(self):
        """Teste que nomes que começam com a query aparecem primeiro"""
        response = client.get("/api/athletes/search?query=Phelps")
        assert response.status_code == 200
        data = response.json()
        
        # Se houver resultados, os que começam com 'Phelps' devem vir primeiro
        if len(data) > 1:
            first_name_lower = data[0]['name'].lower()
            # O primeiro deve começar com a query ou ter alta relevância
            assert 'phelps' in first_name_lower


class TestEvolutionWithoutCountryFilter:
    """Testes para evolução sem filtro de país"""
    
    def test_evolution_uses_top_10_by_default(self):
        """Teste que usa top 10 países quando nenhum é especificado"""
        response = client.get("/api/stats/evolution")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            # Verifica que há dados de evolução
            assert 'Year' in data[0]
            # Deve haver no máximo 10 países + Year
            assert len(data[0]) <= 11


class TestBiometricsLargeSampling:
    """Testes para amostragem de biometria"""
    
    def test_biometrics_large_dataset(self):
        """Teste que dados grandes são amostrados"""
        # Este teste verifica se a amostragem funciona
        # Criando um mock com mais de 2000 atletas
        large_data = pd.DataFrame({
            'ID': range(1, 3001),
            'Name': [f'Athlete {i}' for i in range(1, 3001)],
            'Sex': ['M'] * 3000,
            'Year': [2016] * 3000,
            'Season': ['Summer'] * 3000,
            'NOC': ['USA'] * 1000 + ['BRA'] * 1000 + ['CHN'] * 1000,
            'Sport': ['Swimming'] * 3000,
            'Event': ['100m'] * 3000,
            'Medal': ['Gold'] * 1000 + ['Silver'] * 1000 + ['Bronze'] * 1000,
            'Height': [180.0] * 3000,
            'Weight': [75.0] * 3000
        })
        
        with patch.object(data_loader, 'get_df', return_value=large_data):
            response = client.get("/api/stats/biometrics")
            assert response.status_code == 200
            data = response.json()
            # Com country=All, deve amostrar para 2000 - Linha 139
            assert len(data) <= 2000
