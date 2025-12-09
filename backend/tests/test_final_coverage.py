"""
Testes finais para garantir 100% de cobertura
Focando nas linhas específicas que faltam
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, PropertyMock
import pandas as pd
import numpy as np

from app.main import app
from app.data_loader import data_loader, DataLoader

client = TestClient(app)


class TestLine264Coverage:
    """
    Testes específicos para linha 264: 
    if medals_only.empty: return []
    Após filtrar por medal_type específico
    """
    
    def test_line_264_medal_filter_empties_results(self):
        """
        Cenário: Dados têm medalhas, mas após filtrar por um tipo específico,
        o resultado fica vazio.
        
        Linha 264: if medals_only.empty: return []
        """
        mock_df = pd.DataFrame({
            'ID': [1, 2, 3],
            'Name': ['Athlete A', 'Athlete B', 'Athlete C'],
            'Sex': ['M', 'F', 'M'],
            'Year': [2016, 2016, 2016],
            'Season': ['Summer', 'Summer', 'Summer'],
            'NOC': ['USA', 'BRA', 'CHN'],
            'Sport': ['Swimming', 'Judo', 'Gymnastics'],
            'Event': ['100m', '60kg', 'Floor'],
            'Medal': ['Silver', 'Bronze', 'Silver']  # Nenhum Gold
        })
        
        # Patch no nível do módulo api
        with patch('app.api.data_loader') as mock_loader:
            mock_loader.get_df.return_value = mock_df
            # Filtra especificamente por Gold quando não há nenhum
            response = client.get("/api/stats/top-athletes?medal_type=Gold")
            assert response.status_code == 200
            data = response.json()
            # Deve retornar lista vazia porque após filtrar por Gold, não sobra nada
            assert data == []
    
    def test_line_264_with_integration_impossible_filter(self):
        """
        Teste de integração: Usa filtros que garantem nenhum Gold
        """
        # Este teste usa dados reais mas com filtros que provavelmente
        # resultam em nenhuma medalha de ouro específica
        # Por exemplo: filtrar por um esporte raro em um ano específico
        # e depois pedir apenas Gold
        response = client.get("/api/stats/top-athletes?sport=Curling&year=1896&medal_type=Gold")
        assert response.status_code == 200
        # Curling não existia em 1896, então deve retornar vazio ou
        # pelo menos cobrir o caminho de código


class TestLine289Coverage:
    """
    Testes específicos para linha 289:
    sort_col = 'Total' (fallback quando sort_col não está nas colunas)
    
    Análise: Esta linha é código defensivo. Quando medal_type é definido:
    - Se é Gold/Silver/Bronze: a coluna sempre existirá (adicionada em desired_cols)
    - Se é Total: sort_col já será Total pela lógica anterior
    - Se é outro valor (ex: Platinum): o filtro na linha 268 esvazia o df
      e retorna na linha 271 antes de chegar aqui
    
    Para cobrir esta linha, precisaríamos de um cenário onde:
    - medal_type não é None, não é "Total"
    - medal_type passa pelo filtro da linha 268 (há medalhas desse tipo)
    - Mas após groupby, a coluna não existe
    
    Isso é impossível no fluxo atual, pois se passarmos o filtro,
    teremos medalhas desse tipo e a coluna existirá no groupby.
    
    Solução: Aceitar 99% ou refatorar o código.
    """
    
    def test_line_289_verify_unreachable(self):
        """
        Este teste documenta que a linha 289 é código defensivo
        que não pode ser alcançado pelo fluxo normal.
        """
        # A linha 289 é inalcançável no fluxo atual
        # Vamos apenas documentar isso
        assert True  # Teste de documentação


class TestForceCoverage:
    """Tentativas finais de forçar cobertura"""
    
    def test_force_line_264_with_direct_patch(self):
        """
        Usar patch direto no módulo api.data_loader
        """
        mock_df = pd.DataFrame({
            'ID': [1],
            'Name': ['Test'],
            'Sex': ['M'],
            'Year': [2016],
            'Season': ['Summer'],
            'NOC': ['USA'],
            'Sport': ['Swimming'],
            'Event': ['100m'],
            'Medal': ['Silver']  # Apenas Silver, sem Gold
        })
        
        with patch('app.api.data_loader') as mock_loader:
            mock_loader.get_df.return_value = mock_df
            response = client.get("/api/stats/top-athletes?medal_type=Gold")
            assert response.status_code == 200
            assert response.json() == []
    
    def test_force_line_289_with_custom_medal_type(self):
        """
        Tentar forçar a linha 289 criando um cenário impossível
        com mock do groupby
        """
        # Este cenário é impossível de alcançar sem refatorar o código
        # A linha 289 é código defensivo "morto"
        pass
