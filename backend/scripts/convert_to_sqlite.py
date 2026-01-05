"""Script para converter CSV de atletas olímpicos para SQLite."""
import pandas as pd
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "athlete_events.csv")
DB_PATH = os.path.join(BASE_DIR, "data", "olympics.db")

def convert_csv_to_sqlite():
    """Converte o arquivo CSV para banco SQLite."""
    if not os.path.exists(CSV_PATH):
        print(f"Erro: Arquivo CSV não encontrado em {CSV_PATH}")
        return

    print(f"Convertendo '{CSV_PATH}' para '{DB_PATH}'...")
    
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    chunk_size = 10000
    total_rows = 0
    
    encodings = ['utf-8', 'latin-1']
    success = False
    
    for encoding in encodings:
        try:
            print(f"Tentando ler CSV com encoding {encoding}...")
            with pd.read_csv(CSV_PATH, chunksize=chunk_size, encoding=encoding) as reader:
                for i, chunk in enumerate(reader):
                    if 'Medal' in chunk.columns:
                        chunk['Medal'] = chunk['Medal'].fillna('No Medal')
                    
                    if 'Name' in chunk.columns:
                        mask_talo = chunk['Name'].str.startswith('talo Manzine', na=False)
                        if mask_talo.any():
                            chunk.loc[mask_talo, 'Name'] = chunk.loc[mask_talo, 'Name'].str.replace(r'^talo Manzine', 'Ítalo Manzine', regex=True)
                        chunk['Name'] = chunk['Name'].str.strip()
                    
                    chunk.to_sql('athletes', conn, if_exists='append', index=False)
                    total_rows += len(chunk)
                    print(f"Processado chunk {i+1} ({total_rows} linhas)...")
            
            success = True
            break
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"Erro: {e}")
            break

    if success:
        print("Criando índices para performance...")
        cursor.execute("CREATE INDEX idx_year ON athletes (Year)")
        cursor.execute("CREATE INDEX idx_season ON athletes (Season)")
        cursor.execute("CREATE INDEX idx_noc ON athletes (NOC)")
        cursor.execute("CREATE INDEX idx_sport ON athletes (Sport)")
        cursor.execute("CREATE INDEX idx_medal ON athletes (Medal)")
        cursor.execute("CREATE INDEX idx_sex ON athletes (Sex)")
        
        conn.commit()
        print(f"Sucesso! Banco de dados criado com {total_rows} registros.")
        print(f"Arquivo salvo em: {DB_PATH}")
    else:
        print("Falha na conversão.")

    conn.close()

if __name__ == "__main__":
    convert_csv_to_sqlite()
