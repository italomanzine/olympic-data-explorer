"""
Testes completos para o módulo data_loader
Cobrindo todos os cenários: CSV existe, não existe, diferentes encodings, mock data
"""
import pytest
from unittest.mock import patch, MagicMock, mock_open
import pandas as pd
import numpy as np
import os

from app.data_loader import DataLoader, generate_mock_data, DATA_PATH


class TestGenerateMockData:
    """Testes para a função generate_mock_data"""
    
    def test_generate_mock_data_default(self):
        """Teste com número padrão de linhas"""
        df = generate_mock_data()
        assert len(df) == 1000
    
    def test_generate_mock_data_custom_rows(self):
        """Teste com número customizado de linhas"""
        df = generate_mock_data(rows=500)
        assert len(df) == 500
    
    def test_generate_mock_data_structure(self):
        """Teste da estrutura do DataFrame gerado"""
        df = generate_mock_data(rows=10)
        
        expected_columns = [
            'ID', 'Name', 'Sex', 'Age', 'Height', 'Weight',
            'Team', 'NOC', 'Year', 'Season', 'City', 'Sport', 'Event', 'Medal'
        ]
        
        for col in expected_columns:
            assert col in df.columns
    
    def test_generate_mock_data_values(self):
        """Teste dos valores gerados"""
        df = generate_mock_data(rows=100)
        
        # IDs são sequenciais começando de 1
        assert df['ID'].iloc[0] == 1
        assert df['ID'].iloc[-1] == 100
        
        # Sexo é M ou F
        assert set(df['Sex'].unique()).issubset({'M', 'F'})
        
        # Idade entre 18 e 39
        assert df['Age'].min() >= 18
        assert df['Age'].max() < 40
        
        # Altura entre 150 e 209
        assert df['Height'].min() >= 150
        assert df['Height'].max() < 210
        
        # Peso entre 45 e 119
        assert df['Weight'].min() >= 45
        assert df['Weight'].max() < 120
        
        # Season é sempre Summer no mock
        assert all(df['Season'] == 'Summer')


class TestDataLoaderSingleton:
    """Testes para o padrão Singleton do DataLoader"""
    
    def test_singleton_instance(self):
        """Teste que DataLoader é um singleton"""
        loader1 = DataLoader()
        loader2 = DataLoader()
        assert loader1 is loader2


class TestDataLoaderLoadData:
    """Testes para o método load_data do DataLoader"""
    
    def test_load_data_returns_dataframe(self):
        """Teste que load_data retorna um DataFrame"""
        loader = DataLoader()
        # Resetar o DataFrame para forçar recarregamento
        loader._df = None
        
        df = loader.load_data()
        assert isinstance(df, pd.DataFrame)
    
    def test_load_data_caches_result(self):
        """Teste que load_data usa cache"""
        loader = DataLoader()
        loader._df = None
        
        df1 = loader.load_data()
        df2 = loader.load_data()
        
        assert df1 is df2
    
    def test_get_df_loads_if_needed(self):
        """Teste que get_df carrega dados se necessário"""
        loader = DataLoader()
        loader._df = None
        
        df = loader.get_df()
        assert isinstance(df, pd.DataFrame)
    
    def test_get_df_returns_cached(self):
        """Teste que get_df retorna dados do cache"""
        loader = DataLoader()
        
        df1 = loader.get_df()
        df2 = loader.get_df()
        
        assert df1 is df2


class TestDataLoaderWithMock:
    """Testes com mock do sistema de arquivos"""
    
    def test_load_data_csv_not_found(self):
        """Teste quando CSV não existe - usa mock data"""
        loader = DataLoader()
        loader._df = None
        
        with patch('os.path.exists', return_value=False):
            df = loader.load_data()
            assert isinstance(df, pd.DataFrame)
            # Mock data tem Medal preenchido com valores específicos
            assert 'Medal' in df.columns
    
    def test_load_data_csv_with_utf8(self):
        """Teste de leitura com encoding UTF-8"""
        loader = DataLoader()
        loader._df = None
        
        mock_df = pd.DataFrame({
            'ID': [1],
            'Name': ['Test Athlete'],
            'Sex': ['M'],
            'Age': [25],
            'Height': [180.0],
            'Weight': [75.0],
            'Team': ['Test'],
            'NOC': ['TST'],
            'Year': [2016],
            'Season': ['Summer'],
            'City': ['Rio'],
            'Sport': ['Test Sport'],
            'Event': ['Test Event'],
            'Medal': [np.nan]
        })
        
        with patch('os.path.exists', return_value=True):
            with patch('pandas.read_csv', return_value=mock_df):
                df = loader.load_data()
                assert isinstance(df, pd.DataFrame)
                # Medal NaN deve ser convertido para 'No Medal'
                assert df['Medal'].iloc[0] == 'No Medal'
    
    def test_load_data_name_correction(self):
        """Teste de correção de nomes específicos"""
        loader = DataLoader()
        loader._df = None
        
        mock_df = pd.DataFrame({
            'ID': [1],
            'Name': ['talo Manzine Test'],
            'Sex': ['M'],
            'Age': [25],
            'Height': [180.0],
            'Weight': [75.0],
            'Team': ['Test'],
            'NOC': ['TST'],
            'Year': [2016],
            'Season': ['Summer'],
            'City': ['Rio'],
            'Sport': ['Test Sport'],
            'Event': ['Test Event'],
            'Medal': ['Gold']
        })
        
        with patch('os.path.exists', return_value=True):
            with patch('pandas.read_csv', return_value=mock_df):
                df = loader.load_data()
                # Nome deve ser corrigido para 'Ítalo Manzine Test'
                assert df['Name'].iloc[0] == 'Ítalo Manzine Test'
    
    def test_load_data_sex_stripping(self):
        """Teste de limpeza da coluna Sex"""
        loader = DataLoader()
        loader._df = None
        
        mock_df = pd.DataFrame({
            'ID': [1],
            'Name': ['Test Athlete'],
            'Sex': ['  M  '],  # Com espaços
            'Age': [25],
            'Height': [180.0],
            'Weight': [75.0],
            'Team': ['Test'],
            'NOC': ['TST'],
            'Year': [2016],
            'Season': ['Summer'],
            'City': ['Rio'],
            'Sport': ['Test Sport'],
            'Event': ['Test Event'],
            'Medal': ['Gold']
        })
        
        with patch('os.path.exists', return_value=True):
            with patch('pandas.read_csv', return_value=mock_df):
                df = loader.load_data()
                assert df['Sex'].iloc[0] == 'M'
    
    def test_load_data_unicode_error_fallback(self):
        """Teste de fallback para erros de encoding"""
        loader = DataLoader()
        loader._df = None
        
        mock_df = pd.DataFrame({
            'ID': [1],
            'Name': ['Test'],
            'Sex': ['M'],
            'Medal': [np.nan]
        })
        
        def side_effect_read_csv(path, encoding=None, encoding_errors=None):
            if encoding == 'utf-8':
                raise UnicodeDecodeError('utf-8', b'', 0, 1, 'mock error')
            if encoding == 'utf-8-sig':
                raise UnicodeDecodeError('utf-8-sig', b'', 0, 1, 'mock error')
            if encoding == 'latin-1' and encoding_errors is None:
                raise UnicodeDecodeError('latin-1', b'', 0, 1, 'mock error')
            if encoding == 'cp1252':
                raise UnicodeDecodeError('cp1252', b'', 0, 1, 'mock error')
            # Última tentativa com latin-1 e encoding_errors='replace'
            return mock_df
        
        with patch('os.path.exists', return_value=True):
            with patch('pandas.read_csv', side_effect=side_effect_read_csv):
                df = loader.load_data()
                assert isinstance(df, pd.DataFrame)


class TestDataLoaderIntegration:
    """Testes de integração com o arquivo real"""
    
    def test_real_data_if_exists(self):
        """Teste com dados reais se o arquivo existir"""
        if os.path.exists(DATA_PATH):
            loader = DataLoader()
            loader._df = None
            
            df = loader.load_data()
            assert isinstance(df, pd.DataFrame)
            assert len(df) > 0
            assert 'Medal' in df.columns
            assert 'Name' in df.columns


class TestDataPath:
    """Testes para o caminho dos dados"""
    
    def test_data_path_is_relative(self):
        """Teste que DATA_PATH é construído corretamente"""
        assert 'data/athlete_events.csv' in DATA_PATH or 'data\\athlete_events.csv' in DATA_PATH
