from fastapi import APIRouter, Query, HTTPException
from .data_loader import data_loader
import pandas as pd
from typing import List, Optional, Dict, Any

router = APIRouter()

@router.get("/filters")
def get_filters():
    try:
        years = data_loader.get_unique_values('Year')
        sports = ["All"] + data_loader.get_unique_values('Sport')
        year_season_map = data_loader.get_year_season_map()
        noc_map = data_loader.get_noc_map()
        sorted_nocs = sorted(noc_map.keys())
        
        countries_list = []
        countries_list.append({"code": "All", "label": "Todos os Países"})
        
        temp_list = []
        for noc in sorted_nocs:
            name = noc_map.get(noc, noc)
            temp_list.append({
                "code": noc, 
                "label": f"{name} ({noc})"
            })
            
        temp_list.sort(key=lambda x: x['label'])
        countries_list.extend(temp_list)

        return {
            "years": years,
            "sports": sports, 
            "countries": countries_list, 
            "year_season_map": year_season_map
        }
    except Exception as e:
        print(f"Erro ao carregar filtros: {e}")
        return {"years": [], "sports": [], "countries": [], "year_season_map": {}}

@router.get("/stats/map")
def get_map_stats(
    year: Optional[int] = None, 
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    season: Optional[str] = None, 
    sex: Optional[str] = None,
    country: Optional[str] = None,
    sport: Optional[str] = None
):
    try:
        with data_loader.get_connection_context() as conn:
            # Correção Lógica: Contar Eventos Distintos para não inflar medalhas de time
            # Seleciona apenas as combinações únicas de (NOC, Event, Medal) antes de contar
            query = """
                SELECT NOC, Medal, COUNT(*) as Count
                FROM (
                    SELECT DISTINCT Year, Season, NOC, Event, Medal
                    FROM athletes
                    WHERE Medal != 'No Medal'
            """
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
            if sport and sport != "All":
                query += " AND Sport = ?"
                params.append(sport)

            # Fecha a subquery e agrupa
            query += ") GROUP BY NOC, Medal"
            
            df = pd.read_sql_query(query, conn, params=params)
            
            if df.empty:
                return []
                
            pivot = df.pivot(index='NOC', columns='Medal', values='Count').fillna(0)
            
            for col in ['Gold', 'Silver', 'Bronze']:
                if col not in pivot.columns:
                    pivot[col] = 0
            
            pivot['Total'] = pivot['Gold'] + pivot['Silver'] + pivot['Bronze']
            
            result = []
            for noc, row in pivot.iterrows():
                result.append({
                    "id": noc, 
                    "gold": int(row['Gold']),
                    "silver": int(row['Silver']),
                    "bronze": int(row['Bronze']),
                    "total": int(row['Total'])
                })
                
            return result
    except Exception as e:
        print(f"Erro map stats: {e}")
        return []

@router.get("/stats/biometrics")
def get_biometrics(
    sport: Optional[str] = "All", 
    year: Optional[int] = None,
    season: Optional[str] = None,
    sex: Optional[str] = None,
    country: Optional[str] = None
):
    try:
        with data_loader.get_connection_context() as conn:
            query = """
                SELECT Name, Sex, Height, Weight, Medal, NOC, Year, Sport
                FROM athletes
                WHERE Height IS NOT NULL AND Weight IS NOT NULL
            """
            params = []
            
            if year:
                query += " AND Year = ?"
                params.append(year)
            if season and season != "Both":
                query += " AND Season = ?"
                params.append(season)
            if sex and sex != "Both":
                query += " AND Sex = ?"
                params.append(sex)
            if country and country != "All":
                query += " AND NOC = ?"
                params.append(country)
            if sport and sport != "All":
                query += " AND Sport = ?"
                params.append(sport)
            
            query += " ORDER BY RANDOM() LIMIT 2000"
            
            df = pd.read_sql_query(query, conn, params=params)
            
            if df.empty:
                return []
                
            return df.to_dict(orient='records')
            
    except Exception as e:
        print(f"Erro biometrics: {e}")
        return []

@router.get("/stats/evolution")
def get_evolution(
    countries: Optional[List[str]] = Query(None),
    season: Optional[str] = None,
    sex: Optional[str] = None,
    country: Optional[str] = None,
    sport: Optional[str] = None 
):
    try:
        with data_loader.get_connection_context() as conn:
            target_countries = []
            if country and country != "All":
                target_countries = [country]
            elif countries:
                target_countries = countries
            
            if not target_countries:
                # 1. Definir Top 10 com base na contagem CORRETA (deduplicada)
                base_query = """
                    SELECT NOC, COUNT(*) as Medals 
                    FROM (
                        SELECT DISTINCT Year, Season, NOC, Event, Medal
                        FROM athletes 
                        WHERE Medal != 'No Medal'
                """
                params = []
                if season and season != "Both":
                    base_query += " AND Season = ?"
                    params.append(season)
                if sex and sex != "Both":
                    base_query += " AND Sex = ?"
                    params.append(sex)
                if sport and sport != "All":
                    base_query += " AND Sport = ?"
                    params.append(sport)
                
                base_query += ") GROUP BY NOC ORDER BY Medals DESC LIMIT 10"
                
                df_top = pd.read_sql_query(base_query, conn, params=params)
                if df_top.empty: return []
                target_countries = df_top['NOC'].tolist()

            # 2. Evolução com contagem correta
            evo_query = f"""
                SELECT Year, NOC, COUNT(*) as Medals
                FROM (
                    SELECT DISTINCT Year, Season, NOC, Event, Medal
                    FROM athletes
                    WHERE Medal != 'No Medal'
                    AND NOC IN ({','.join(['?']*len(target_countries))})
            """
            evo_params = target_countries[:]
            
            if season and season != "Both":
                evo_query += " AND Season = ?"
                evo_params.append(season)
            if sex and sex != "Both":
                evo_query += " AND Sex = ?"
                evo_params.append(sex)
            if sport and sport != "All":
                evo_query += " AND Sport = ?"
                evo_params.append(sport)

            evo_query += ") GROUP BY Year, NOC ORDER BY Year"
            
            df_evo = pd.read_sql_query(evo_query, conn, params=evo_params)
            if df_evo.empty: return []

            pivot = df_evo.pivot(index='Year', columns='NOC', values='Medals').fillna(0).reset_index()
            return pivot.to_dict(orient='records')
            
    except Exception as e:
        print(f"Erro em evolution: {e}")
        return []

@router.get("/stats/medals")
def get_medal_table(
    year: Optional[int] = None, 
    season: Optional[str] = None, 
    sex: Optional[str] = None,
    country: Optional[str] = None,
    sport: Optional[str] = None
):
    try:
        with data_loader.get_connection_context() as conn:
            group_col = 'Sport' if (country and country != "All") else 'NOC'
            
            # Query com deduplicação para contagem correta
            # Nota: Se group_col for Sport, deduplicamos por (Sport, Event, Medal)
            # Se for NOC, deduplicamos por (NOC, Event, Medal)
            
            # A query abaixo é genérica o suficiente:
            # Seleciona eventos distintos com suas chaves de agrupamento
            query = f"""
                SELECT {group_col} as Key, Medal, COUNT(*) as Count
                FROM (
                    SELECT DISTINCT Year, Season, NOC, Sport, Event, Medal
                    FROM athletes
                    WHERE Medal != 'No Medal'
            """
            params = []
            
            if year:
                query += " AND Year = ?"
                params.append(year)
            if season and season != "Both":
                query += " AND Season = ?"
                params.append(season)
            if sex and sex != "Both":
                query += " AND Sex = ?"
                params.append(sex)
            if country and country != "All":
                query += " AND NOC = ?"
                params.append(country)
            if sport and sport != "All":
                query += " AND Sport = ?"
                params.append(sport)
                
            query += f") GROUP BY {group_col}, Medal"
            
            df = pd.read_sql_query(query, conn, params=params)
            
            if df.empty:
                return []
                
            pivot = df.pivot(index='Key', columns='Medal', values='Count').fillna(0)
            
            for col in ['Gold', 'Silver', 'Bronze']:
                if col not in pivot.columns:
                    pivot[col] = 0
                    
            pivot['Total'] = pivot['Gold'] + pivot['Silver'] + pivot['Bronze']
            pivot = pivot.sort_values(by=['Gold', 'Silver', 'Bronze'], ascending=False)
            
            noc_map = {}
            if group_col == 'NOC':
                noc_map = data_loader.get_noc_map()
                
            result = []
            for key, row in pivot.iterrows():
                label = str(key)
                if group_col == 'NOC':
                    label = noc_map.get(key, key)
                    
                result.append({
                    "name": label,
                    "code": str(key), 
                    "gold": int(row['Gold']),
                    "silver": int(row['Silver']),
                    "bronze": int(row['Bronze']),
                    "total": int(row['Total'])
                })
            return result
    except Exception as e:
        print(f"Erro medal table: {e}")
        return []

@router.get("/stats/top-athletes")
def get_top_athletes(
    year: Optional[int] = None,
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    season: Optional[str] = None,
    sex: Optional[str] = None,
    country: Optional[str] = None,
    sport: Optional[str] = None,
    medal_type: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50)
):
    try:
        with data_loader.get_connection_context() as conn:
            # Para atletas, a contagem é individual (não deduplica evento de time)
            # Mas devemos garantir que não estamos duplicando por joins errados
            # A query anterior estava certa, mas vou usar uma versão segura
            # que considera DISTINCT Year, Season, Event para o mesmo atleta
            # para evitar duplicação caso o dataset tenha linhas repetidas sujas
            
            query = """
                SELECT ID, Name, NOC,
                    SUM(CASE WHEN Medal = 'Gold' THEN 1 ELSE 0 END) as Gold,
                    SUM(CASE WHEN Medal = 'Silver' THEN 1 ELSE 0 END) as Silver,
                    SUM(CASE WHEN Medal = 'Bronze' THEN 1 ELSE 0 END) as Bronze,
                    COUNT(*) as Total
                FROM (
                    SELECT DISTINCT ID, Name, NOC, Year, Season, Event, Medal
                    FROM athletes
                    WHERE Medal != 'No Medal'
            """
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
            if sport and sport != "All":
                query += " AND Sport = ?"
                params.append(sport)
            
            if medal_type and medal_type != "Total":
                query += " AND Medal = ?"
                params.append(medal_type)

            query += ") GROUP BY ID, Name, NOC"
            
            sort_col = medal_type if medal_type and medal_type != "Total" else 'Total'
            query += f" ORDER BY {sort_col} DESC LIMIT ?"
            params.append(limit)
            
            df = pd.read_sql_query(query, conn, params=params)
            
            # Garantir que os tipos sejam int nativos do Python para JSON serializable
            records = df.to_dict(orient='records')
            for record in records:
                record['gold'] = int(record['Gold'])
                record['silver'] = int(record['Silver'])
                record['bronze'] = int(record['Bronze'])
                record['total'] = int(record['Total'])
                # Remove chaves maiúsculas se o frontend esperar minúsculas
                del record['Gold']
                del record['Silver']
                del record['Bronze']
                del record['Total']
                
            return records
            
    except Exception as e:
        print(f"Erro top athletes: {e}")
        return []

@router.get("/athletes/search")
def search_athletes(
    query: str = Query(..., min_length=2, description="Nome do atleta para buscar"),
    limit: int = Query(20, ge=1, le=100)
):
    try:
        with data_loader.get_connection_context() as conn:
            sql = """
            SELECT DISTINCT ID, Name, NOC, Sport 
            FROM athletes 
            WHERE Name LIKE ? 
            LIMIT ?
            """
            search_param = f"%{query}%"
            df = pd.read_sql_query(sql, conn, params=[search_param, limit*2])
            
            if df.empty:
                return []
            
            df['starts_with'] = df['Name'].str.lower().str.startswith(query.lower())
            df = df.sort_values(['starts_with', 'Name'], ascending=[False, True]).head(limit)
            
            results = []
            for _, row in df.iterrows():
                results.append({
                    "id": int(row['ID']),
                    "name": row['Name'],
                    "noc": row['NOC'],
                    "sport": row['Sport']
                })
            return results
    except Exception as e:
        print(f"Erro na busca: {e}")
        return []

@router.get("/athletes/{athlete_id}")
def get_athlete_profile(athlete_id: int):
    try:
        with data_loader.get_connection_context() as conn:
            query = "SELECT * FROM athletes WHERE ID = ?"
            athlete_data = pd.read_sql_query(query, conn, params=[athlete_id])
            
        if athlete_data.empty:
            return {"error": "Atleta não encontrado"}
        
        latest = athlete_data.sort_values('Year', ascending=False).iloc[0]
        participations = []
        for _, row in athlete_data.iterrows():
            participations.append({
                "year": int(row['Year']),
                "season": row['Season'],
                "city": row['City'] if pd.notna(row['City']) else None,
                "sport": row['Sport'],
                "event": row['Event'],
                "medal": row['Medal'] if row['Medal'] != 'No Medal' else None
            })
        
        participations.sort(key=lambda x: x['year'])
        medals = athlete_data[athlete_data['Medal'] != 'No Medal']['Medal'].value_counts().to_dict()
        sports = athlete_data['Sport'].unique().tolist()
        years = sorted(athlete_data['Year'].unique().tolist())
        
        return {
            "id": athlete_id,
            "name": latest['Name'],
            "sex": latest['Sex'],
            "noc": latest['NOC'],
            "team": latest['Team'] if pd.notna(latest['Team']) else latest['NOC'],
            "height": float(latest['Height']) if pd.notna(latest['Height']) else None,
            "weight": float(latest['Weight']) if pd.notna(latest['Weight']) else None,
            "age_range": {
                "min": int(athlete_data['Age'].min()) if pd.notna(athlete_data['Age'].min()) else None,
                "max": int(athlete_data['Age'].max()) if pd.notna(athlete_data['Age'].max()) else None
            },
            "sports": sports,
            "years": years,
            "medals": {
                "gold": int(medals.get('Gold', 0)),
                "silver": int(medals.get('Silver', 0)),
                "bronze": int(medals.get('Bronze', 0)),
                "total": sum(medals.values())
            },
            "participations": participations
        }
    except Exception as e:
        print(f"Erro no perfil: {e}")
        return {"error": "Erro ao buscar dados"}

@router.get("/athletes/{athlete_id}/stats")
def get_athlete_stats(athlete_id: int):
    try:
        with data_loader.get_connection_context() as conn:
            query = "SELECT * FROM athletes WHERE ID = ?"
            athlete_data = pd.read_sql_query(query, conn, params=[athlete_id])
            
        if athlete_data.empty:
            return {"error": "Atleta não encontrado"}
        
        evolution = []
        for year in sorted(athlete_data['Year'].unique()):
            year_data = athlete_data[athlete_data['Year'] == year]
            medals = year_data[year_data['Medal'] != 'No Medal']['Medal'].value_counts().to_dict()
            evolution.append({
                "Year": int(year),
                "Gold": int(medals.get('Gold', 0)),
                "Silver": int(medals.get('Silver', 0)),
                "Bronze": int(medals.get('Bronze', 0)),
                "Total": sum(medals.values()),
                "Events": len(year_data)
            })
        
        latest = athlete_data.sort_values('Year', ascending=False).iloc[0]
        biometrics = {
            "height": float(latest['Height']) if pd.notna(latest['Height']) else None,
            "weight": float(latest['Weight']) if pd.notna(latest['Weight']) else None,
            "sex": latest['Sex']
        }
        
        medals_by_sport = []
        for sport in athlete_data['Sport'].unique():
            sport_data = athlete_data[athlete_data['Sport'] == sport]
            medals = sport_data[sport_data['Medal'] != 'No Medal']['Medal'].value_counts().to_dict()
            medals_by_sport.append({
                "name": sport,
                "code": sport,
                "gold": int(medals.get('Gold', 0)),
                "silver": int(medals.get('Silver', 0)),
                "bronze": int(medals.get('Bronze', 0)),
                "total": sum(medals.values())
            })
        
        medals_by_sport.sort(key=lambda x: x['total'], reverse=True)
        
        return {
            "evolution": evolution,
            "biometrics": biometrics,
            "medals_by_sport": medals_by_sport
        }
    except Exception as e:
        return {"error": str(e)}
