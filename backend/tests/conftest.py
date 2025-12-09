"""
Configurações e fixtures compartilhadas para testes
"""
import pytest
from fastapi.testclient import TestClient
import pandas as pd
import numpy as np

from app.main import app
from app.data_loader import DataLoader


@pytest.fixture(scope="session")
def client():
    """Cliente de teste para API FastAPI"""
    return TestClient(app)


@pytest.fixture
def sample_dataframe():
    """DataFrame de exemplo para testes unitários"""
    return pd.DataFrame({
        'ID': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'Name': [
            'Athlete A', 'Athlete B', 'Athlete C', 'Athlete D', 'Athlete E',
            'Athlete F', 'Athlete G', 'Athlete H', 'Athlete I', 'Athlete J'
        ],
        'Sex': ['M', 'F', 'M', 'F', 'M', 'F', 'M', 'F', 'M', 'F'],
        'Age': [25, 28, 22, 30, 19, 26, 32, 21, 27, 24],
        'Height': [180.0, 165.0, 175.0, 170.0, 185.0, 160.0, 190.0, 168.0, 178.0, 172.0],
        'Weight': [75.0, 58.0, 70.0, 65.0, 80.0, 55.0, 85.0, 62.0, 72.0, 68.0],
        'Team': ['USA', 'BRA', 'USA', 'CHN', 'GBR', 'FRA', 'GER', 'JPN', 'AUS', 'RUS'],
        'NOC': ['USA', 'BRA', 'USA', 'CHN', 'GBR', 'FRA', 'GER', 'JPN', 'AUS', 'RUS'],
        'Year': [2016, 2016, 2012, 2012, 2008, 2016, 2012, 2008, 2016, 2012],
        'Season': ['Summer', 'Summer', 'Winter', 'Winter', 'Summer', 'Summer', 'Winter', 'Summer', 'Summer', 'Winter'],
        'City': ['Rio', 'Rio', 'Sochi', 'Sochi', 'Beijing', 'Rio', 'Sochi', 'Beijing', 'Rio', 'Sochi'],
        'Sport': ['Basketball', 'Judo', 'Basketball', 'Swimming', 'Football', 'Tennis', 'Skiing', 'Gymnastics', 'Swimming', 'Ice Hockey'],
        'Event': ['Event 1', 'Event 2', 'Event 3', 'Event 4', 'Event 5', 'Event 6', 'Event 7', 'Event 8', 'Event 9', 'Event 10'],
        'Medal': ['Gold', 'Silver', 'No Medal', 'Bronze', 'Gold', 'No Medal', 'Silver', 'Gold', 'Bronze', 'No Medal']
    })


@pytest.fixture
def empty_dataframe():
    """DataFrame vazio para testes de cenários sem dados"""
    return pd.DataFrame(columns=[
        'ID', 'Name', 'Sex', 'Age', 'Height', 'Weight',
        'Team', 'NOC', 'Year', 'Season', 'City', 'Sport', 'Event', 'Medal'
    ])


@pytest.fixture
def medals_only_dataframe():
    """DataFrame apenas com medalhas (sem 'No Medal')"""
    return pd.DataFrame({
        'ID': [1, 2, 3, 4, 5],
        'Name': ['Athlete A', 'Athlete B', 'Athlete C', 'Athlete D', 'Athlete E'],
        'Sex': ['M', 'F', 'M', 'F', 'M'],
        'Age': [25, 28, 22, 30, 19],
        'Height': [180.0, 165.0, 175.0, 170.0, 185.0],
        'Weight': [75.0, 58.0, 70.0, 65.0, 80.0],
        'Team': ['USA', 'BRA', 'USA', 'CHN', 'GBR'],
        'NOC': ['USA', 'BRA', 'USA', 'CHN', 'GBR'],
        'Year': [2016, 2016, 2012, 2012, 2008],
        'Season': ['Summer', 'Summer', 'Winter', 'Winter', 'Summer'],
        'City': ['Rio', 'Rio', 'Sochi', 'Sochi', 'Beijing'],
        'Sport': ['Basketball', 'Judo', 'Basketball', 'Swimming', 'Football'],
        'Event': ['Event 1', 'Event 2', 'Event 3', 'Event 4', 'Event 5'],
        'Medal': ['Gold', 'Silver', 'Gold', 'Bronze', 'Gold']
    })


@pytest.fixture(autouse=True)
def reset_data_loader():
    """
    Reset do DataLoader antes de cada teste para garantir isolamento.
    Não reseta em testes de integração que precisam dos dados reais.
    """
    yield
    # Após o teste, podemos limpar o cache se necessário
    # DataLoader._df = None  # Descomente se quiser resetar após cada teste
