"""Testes para o módulo data_loader."""
import pytest
from unittest.mock import patch, MagicMock
import pandas as pd
import numpy as np
import os
import sqlite3

from app.data_loader import DataLoader, data_loader, DB_PATH


class TestDataLoaderSingleton:
    """Testes para o padrão Singleton."""
    
    def test_singleton_instance(self):
        """DataLoader é um singleton."""
        loader1 = DataLoader()
        loader2 = DataLoader()
        assert loader1 is loader2
    
    def test_data_loader_global_instance(self):
        """Instância global data_loader."""
        assert isinstance(data_loader, DataLoader)


class TestDataLoaderConnection:
    """Testes para conexões."""
    
    def test_get_connection_success(self):
        """Conexão bem sucedida."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            conn = loader.get_connection()
            assert conn is not None
            conn.close()
    
    def test_get_connection_file_not_found(self):
        """Banco de dados não existe."""
        loader = DataLoader()
        with patch('os.path.exists', return_value=False):
            with pytest.raises(FileNotFoundError):
                loader.get_connection()
    
    def test_get_connection_context_success(self):
        """Context manager de conexão."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            with loader.get_connection_context() as conn:
                assert conn is not None
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                assert result == (1,)
    
    def test_get_connection_context_closes_connection(self):
        """Context manager fecha a conexão."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            with loader.get_connection_context() as conn:
                pass
            with pytest.raises(sqlite3.ProgrammingError):
                conn.cursor()


class TestDataLoaderQueries:
    """Testes para queries."""
    
    def test_query_filtered_no_filters(self):
        """Query sem filtros."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered()
            assert isinstance(df, pd.DataFrame)
            assert len(df) > 0
    
    def test_query_filtered_with_year(self):
        """Query com filtro de ano."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered(year=2016)
            assert isinstance(df, pd.DataFrame)
            if len(df) > 0:
                assert all(df['Year'] == 2016)
    
    def test_query_filtered_with_year_range(self):
        """Query com intervalo de anos."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered(start_year=2008, end_year=2016)
            assert isinstance(df, pd.DataFrame)
            if len(df) > 0:
                assert all((df['Year'] >= 2008) & (df['Year'] <= 2016))
    
    def test_query_filtered_with_season(self):
        """Query com filtro de temporada."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered(season='Summer')
            assert isinstance(df, pd.DataFrame)
            if len(df) > 0:
                assert all(df['Season'] == 'Summer')
    
    def test_query_filtered_with_season_both(self):
        """Query com temporada 'Both' (ignora filtro)."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df_both = loader.query_filtered(season='Both')
            df_none = loader.query_filtered()
            assert len(df_both) == len(df_none)
    
    def test_query_filtered_with_sex(self):
        """Query com filtro de sexo."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered(sex='M')
            assert isinstance(df, pd.DataFrame)
            if len(df) > 0:
                assert all(df['Sex'] == 'M')
    
    def test_query_filtered_with_sex_both(self):
        """Query com sexo 'Both' (ignora filtro)."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df_both = loader.query_filtered(sex='Both')
            df_none = loader.query_filtered()
            assert len(df_both) == len(df_none)
    
    def test_query_filtered_with_country(self):
        """Query com filtro de país."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered(country='USA')
            assert isinstance(df, pd.DataFrame)
            if len(df) > 0:
                assert all(df['NOC'] == 'USA')
    
    def test_query_filtered_with_country_all(self):
        """Query com país 'All' (ignora filtro)."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df_all = loader.query_filtered(country='All')
            df_none = loader.query_filtered()
            assert len(df_all) == len(df_none)
    
    def test_query_filtered_with_countries_list(self):
        """Query com lista de países."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered(countries=['USA', 'BRA', 'CHN'])
            assert isinstance(df, pd.DataFrame)
            if len(df) > 0:
                assert all(df['NOC'].isin(['USA', 'BRA', 'CHN']))
    
    def test_query_filtered_with_sport(self):
        """Query com filtro de esporte."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered(sport='Swimming')
            assert isinstance(df, pd.DataFrame)
            if len(df) > 0:
                assert all(df['Sport'] == 'Swimming')
    
    def test_query_filtered_with_sport_all(self):
        """Query com esporte 'All' (ignora filtro)."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df_all = loader.query_filtered(sport='All')
            df_none = loader.query_filtered()
            assert len(df_all) == len(df_none)
    
    def test_query_filtered_multiple_filters(self):
        """Query com múltiplos filtros."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered(year=2016, season='Summer', sex='M', country='USA')
            assert isinstance(df, pd.DataFrame)
            if len(df) > 0:
                assert all(df['Year'] == 2016)
                assert all(df['Season'] == 'Summer')
                assert all(df['Sex'] == 'M')
                assert all(df['NOC'] == 'USA')
    
    def test_query_filtered_empty_result(self):
        """Query com resultado vazio."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            df = loader.query_filtered(year=1800)
            assert isinstance(df, pd.DataFrame)
            assert len(df) == 0


class TestDataLoaderUniqueValues:
    """Testes para valores únicos."""
    
    def test_get_unique_values_year(self):
        """Valores únicos para ano."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            years = loader.get_unique_values('Year')
            assert isinstance(years, list)
            assert len(years) > 0
            assert years == sorted(years)
    
    def test_get_unique_values_sport(self):
        """Valores únicos para esporte."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            sports = loader.get_unique_values('Sport')
            assert isinstance(sports, list)
            assert len(sports) > 0
    
    def test_get_unique_values_invalid_column(self):
        """Valores únicos para coluna inválida."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            result = loader.get_unique_values('InvalidColumn')
            assert result == []


class TestDataLoaderYearSeasonMap:
    """Testes para mapeamento ano-temporada."""
    
    def test_get_year_season_map(self):
        """Mapeamento ano-temporada."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            year_season_map = loader.get_year_season_map()
            assert isinstance(year_season_map, dict)
            assert len(year_season_map) > 0
            
            for year, seasons in year_season_map.items():
                assert isinstance(seasons, list)
                for season in seasons:
                    assert season in ['Summer', 'Winter']


class TestDataLoaderNOCMap:
    """Testes para mapeamento NOC-Nome."""
    
    def test_get_noc_map(self):
        """Mapeamento NOC-Nome."""
        if os.path.exists(DB_PATH):
            loader = DataLoader()
            noc_map = loader.get_noc_map()
            assert isinstance(noc_map, dict)
            assert len(noc_map) > 0
            assert 'USA' in noc_map or 'BRA' in noc_map


class TestDataLoaderErrorHandling:
    """Testes para tratamento de erros."""
    
    def test_query_filtered_handles_exception(self):
        """query_filtered trata exceções."""
        loader = DataLoader()
        with patch.object(loader, 'get_connection_context') as mock_ctx:
            mock_ctx.side_effect = Exception("Erro de conexão")
            df = loader.query_filtered()
            assert isinstance(df, pd.DataFrame)
            assert len(df) == 0
    
    def test_get_unique_values_handles_exception(self):
        """get_unique_values trata exceções."""
        loader = DataLoader()
        with patch.object(loader, 'get_connection_context') as mock_ctx:
            mock_ctx.side_effect = Exception("Erro de conexão")
            result = loader.get_unique_values('Year')
            assert result == []
    
    def test_get_year_season_map_handles_exception(self):
        """get_year_season_map trata exceções."""
        loader = DataLoader()
        with patch.object(loader, 'get_connection_context') as mock_ctx:
            mock_ctx.side_effect = Exception("Erro de conexão")
            result = loader.get_year_season_map()
            assert result == {}
    
    def test_get_noc_map_handles_exception(self):
        """get_noc_map trata exceções."""
        loader = DataLoader()
        with patch.object(loader, 'get_connection_context') as mock_ctx:
            mock_ctx.side_effect = Exception("Erro de conexão")
            result = loader.get_noc_map()
            assert result == {}


class TestDBPath:
    """Testes para caminho do banco de dados."""
    
    def test_db_path_is_constructed(self):
        """DB_PATH é construído corretamente."""
        assert 'olympics.db' in DB_PATH
        assert 'data' in DB_PATH
