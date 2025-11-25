import pandas as pd
import numpy as np
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/athlete_events.csv")

def generate_mock_data(rows=1000):
    """Gera dados falsos para teste caso o CSV não exista."""
    years = range(1896, 2016, 4)
    sports = ["Basketball", "Judo", "Football", "Swimming", "Athletics", "Gymnastics"]
    countries = ["USA", "CHN", "BRA", "FRA", "GBR", "JPN"]
    
    data = {
        "ID": range(1, rows + 1),
        "Name": [f"Athlete {i}" for i in range(rows)],
        "Sex": np.random.choice(["M", "F"], rows),
        "Age": np.random.randint(18, 40, rows),
        "Height": np.random.randint(150, 210, rows),
        "Weight": np.random.randint(45, 120, rows),
        "Team": np.random.choice(countries, rows),
        "NOC": np.random.choice(countries, rows),
        "Year": np.random.choice(years, rows),
        "Season": "Summer",
        "City": "City",
        "Sport": np.random.choice(sports, rows),
        "Event": "Event",
        "Medal": np.random.choice(["Gold", "Silver", "Bronze", "NA"], rows, p=[0.05, 0.05, 0.05, 0.85])
    }
    
    return pd.DataFrame(data)

class DataLoader:
    _instance = None
    _df = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataLoader, cls).__new__(cls)
        return cls._instance

    def load_data(self):
        if self._df is not None:
            return self._df

        if os.path.exists(DATA_PATH):
            print(f"Carregando dados de {DATA_PATH}...")
            # Tenta lista de encodings possíveis
            encodings_to_try = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
            
            for encoding in encodings_to_try:
                try:
                    print(f"Tentando ler com encoding: {encoding}...")
                    self._df = pd.read_csv(DATA_PATH, encoding=encoding)
                    print(f"Sucesso com {encoding}!")
                    break
                except UnicodeDecodeError:
                    continue
            
            # Se nenhum funcionou, tenta latin-1 ignorando erros (fallback)
            if self._df is None:
                print("Todos encodings falharam. Forçando latin-1 com replace.")
                self._df = pd.read_csv(DATA_PATH, encoding='latin-1', encoding_errors='replace')

        else:
            print("Arquivo CSV não encontrado. Gerando dados de MOCK...")
            self._df = generate_mock_data()
        
        # --- LIMPEZA E CORREÇÕES ---
        
        if 'Sex' in self._df.columns:
            self._df['Sex'] = self._df['Sex'].astype(str).str.strip()
            
        self._df['Medal'] = self._df['Medal'].fillna('No Medal')
        
        if 'Name' in self._df.columns:
            # Correção específica solicitada (Patch de dados)
            # Se o nome começa com "talo Manzine", corrige para "Ítalo Manzine"
            self._df['Name'] = self._df['Name'].str.replace(r'^talo Manzine', 'Ítalo Manzine', regex=True)
            
            # Remove espaços extras nos nomes em geral
            self._df['Name'] = self._df['Name'].str.strip()

        return self._df

    def get_df(self):
        if self._df is None:
            self.load_data()
        return self._df

data_loader = DataLoader()
