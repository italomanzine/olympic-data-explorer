import pandas as pd
import sqlite3
import os
import contextlib
from typing import Optional, List

# Caminhos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "olympics.db")

class DataLoader:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataLoader, cls).__new__(cls)
        return cls._instance

    def get_connection(self):
        """Retorna uma conexão crua (Cuidado: deve ser fechada manualmente)."""
        if not os.path.exists(DB_PATH):
            raise FileNotFoundError(f"Banco de dados não encontrado em {DB_PATH}. Execute scripts/convert_to_sqlite.py primeiro.")
        return sqlite3.connect(DB_PATH)

    @contextlib.contextmanager
    def get_connection_context(self):
        """Context manager que garante o fechamento da conexão."""
        conn = self.get_connection()
        try:
            yield conn
        finally:
            conn.close()

    def query_filtered(
        self, 
        year: Optional[int] = None, 
        season: Optional[str] = None, 
        sex: Optional[str] = None, 
        country: Optional[str] = None, 
        sport: Optional[str] = None, 
        start_year: Optional[int] = None, 
        end_year: Optional[int] = None,
        countries: Optional[List[str]] = None
    ) -> pd.DataFrame:
        query = "SELECT * FROM athletes WHERE 1=1"
        params = []

        if year:
            query += " AND Year = ?"
            params.append(year)
        
        if start_year is not None and end_year is not None:
            query += " AND Year >= ? AND Year <= ?"
            params.extend([start_year, end_year])

        if season and season != "Both":
            query += " AND Season = ?"
            params.append(season)
            
        if sex and sex != "Both":
            query += " AND Sex = ?"
            params.append(sex)
            
        if country and country != "All":
            query += " AND NOC = ?"
            params.append(country)
        
        if countries:
            placeholders = ','.join(['?'] * len(countries))
            query += f" AND NOC IN ({placeholders})"
            params.extend(countries)
            
        if sport and sport != "All":
            query += " AND Sport = ?"
            params.append(sport)
            
        try:
            with self.get_connection_context() as conn:
                return pd.read_sql_query(query, conn, params=params)
        except Exception as e:
            print(f"Erro ao executar query: {e}")
            return pd.DataFrame() 

    def get_unique_values(self, column: str) -> List:
        try:
            with self.get_connection_context() as conn:
                query = f"SELECT DISTINCT {column} FROM athletes ORDER BY {column}"
                cursor = conn.cursor()
                cursor.execute(query)
                return [row[0] for row in cursor.fetchall()]
        except Exception:
            return []

    def get_year_season_map(self):
        try:
            with self.get_connection_context() as conn:
                query = "SELECT DISTINCT Year, Season FROM athletes"
                df = pd.read_sql_query(query, conn)
                return df.groupby('Year')['Season'].unique().apply(list).to_dict()
        except Exception:
            return {}

    def get_noc_map(self):
        try:
            with self.get_connection_context() as conn:
                query = "SELECT DISTINCT NOC, Team FROM athletes"
                df = pd.read_sql_query(query, conn)
                df['Team'] = df['Team'].str.replace(r'-\d+$', '', regex=True)
                return df.groupby('NOC')['Team'].first().to_dict()
        except Exception:
            return {}

data_loader = DataLoader()
