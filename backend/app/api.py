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
    filtered = data_loader.query_filtered(
        year=year, start_year=start_year, end_year=end_year, 
        season=season, sex=sex, country=country, sport=sport
    )
    
    if filtered.empty:
        return []
    
    medals_only = filtered[filtered['Medal'] != 'No Medal']
    if medals_only.empty:
        return []

    medals_deduped = medals_only.drop_duplicates(subset=['Year', 'Season', 'NOC', 'Event', 'Medal'])
    country_stats = medals_deduped.groupby('NOC')['Medal'].value_counts().unstack(fill_value=0)
    
    desired_cols = ['Gold', 'Silver', 'Bronze']
    for col in desired_cols:
        if col not in country_stats.columns:
            country_stats[col] = 0
            
    country_stats = country_stats[desired_cols]
    country_stats['Total'] = country_stats.sum(axis=1)
    
    result = []
    for noc, row in country_stats.iterrows():
        result.append({
            "id": noc, 
            "gold": int(row['Gold']),
            "silver": int(row['Silver']),
            "bronze": int(row['Bronze']),
            "total": int(row['Total'])
        })
        
    return result

@router.get("/stats/biometrics")
def get_biometrics(
    sport: Optional[str] = "All", 
    year: Optional[int] = None,
    season: Optional[str] = None,
    sex: Optional[str] = None,
    country: Optional[str] = None
):
    filtered = data_loader.query_filtered(
        year=year, season=season, sex=sex, country=country, sport=sport
    )
    if filtered.empty:
        return []

    filtered = filtered.dropna(subset=['Height', 'Weight'])
    if filtered.empty:
        return []

    medal_rank = {'Gold': 3, 'Silver': 2, 'Bronze': 1, 'No Medal': 0}
    filtered = filtered.copy()
    filtered['Medal_Rank'] = filtered['Medal'].map(medal_rank).fillna(0)
    
    filtered = filtered.sort_values(by=['ID', 'Medal_Rank'], ascending=[True, False])
    unique_athletes = filtered.drop_duplicates(subset=['ID', 'Year'])
    
    if len(unique_athletes) > 2000 and (country == "All" or country is None):
        unique_athletes = unique_athletes.sample(2000)

    return unique_athletes[['Name', 'Sex', 'Height', 'Weight', 'Medal', 'NOC', 'Year', 'Sport']].to_dict(orient='records')

@router.get("/stats/evolution")
def get_evolution(
    countries: Optional[List[str]] = Query(None),
    season: Optional[str] = None,
    sex: Optional[str] = None,
    country: Optional[str] = None,
    sport: Optional[str] = None 
):
    target_countries = []
    if country and country != "All":
        target_countries = [country]
    elif countries:
        target_countries = countries
    
    if not target_countries:
        filtered_base = data_loader.query_filtered(season=season, sex=sex, sport=sport)
        if filtered_base.empty:
            return []
            
        medals_only = filtered_base[filtered_base['Medal'] != 'No Medal']
        if medals_only.empty:
            return []
            
        medals_deduped = medals_only.drop_duplicates(subset=['Year', 'Season', 'NOC', 'Event', 'Medal'])
        top_countries = medals_deduped['NOC'].value_counts().head(10).index.tolist()
        target_countries = top_countries
    
    filtered = data_loader.query_filtered(
        season=season, sex=sex, sport=sport, countries=target_countries
    )
    if filtered.empty:
        return []

    medals_only = filtered[filtered['Medal'] != 'No Medal']
    if medals_only.empty:
        return []

    medals_deduped = medals_only.drop_duplicates(subset=['Year', 'Season', 'NOC', 'Event', 'Medal'])
    evolution = medals_deduped.groupby(['Year', 'NOC']).size().reset_index(name='Medals')
    pivot = evolution.pivot(index='Year', columns='NOC', values='Medals').fillna(0).reset_index()
    
    return pivot.to_dict(orient='records')

@router.get("/stats/medals")
def get_medal_table(
    year: Optional[int] = None, 
    season: Optional[str] = None, 
    sex: Optional[str] = None,
    country: Optional[str] = None,
    sport: Optional[str] = None
):
    filtered = data_loader.query_filtered(
        year=year, season=season, sex=sex, country=country, sport=sport
    )
    if filtered.empty:
        return []
        
    medals_only = filtered[filtered['Medal'] != 'No Medal']
    if medals_only.empty:
        return []

    medals_deduped = medals_only.drop_duplicates(subset=['Year', 'Season', 'NOC', 'Event', 'Medal'])
    group_key = 'Sport' if (country and country != "All") else 'NOC'
    
    stats = medals_deduped.groupby(group_key)['Medal'].value_counts().unstack(fill_value=0)
    desired_cols = ['Gold', 'Silver', 'Bronze']
    for col in desired_cols:
        if col not in stats.columns:
            stats[col] = 0
            
    stats['Total'] = stats.sum(axis=1)
    stats = stats.sort_values(by=['Gold', 'Silver', 'Bronze'], ascending=False)
    
    result = []
    noc_map = {}
    if group_key == 'NOC':
        noc_map = data_loader.get_noc_map()

    for key, row in stats.iterrows():
        label = str(key)
        if group_key == 'NOC':
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
    filtered = data_loader.query_filtered(
        year=year, start_year=start_year, end_year=end_year,
        season=season, sex=sex, country=country, sport=sport
    )
    if filtered.empty:
        return []

    medals_only = filtered[filtered['Medal'] != 'No Medal']
    if medals_only.empty:
        return []
    
    if medal_type and medal_type != "Total":
        medals_only = medals_only[medals_only['Medal'] == medal_type]
        if medals_only.empty:
            return []
    
    medals_deduped = medals_only.drop_duplicates(subset=['Year', 'Season', 'ID', 'Event', 'Medal'])
    athlete_medals = medals_deduped.groupby(['ID', 'Name', 'NOC'])['Medal'].value_counts().unstack(fill_value=0)
    
    desired_cols = ['Gold', 'Silver', 'Bronze']
    for col in desired_cols:
        if col not in athlete_medals.columns:
            athlete_medals[col] = 0
    
    athlete_medals['Total'] = athlete_medals[desired_cols].sum(axis=1)
    sort_col = medal_type if medal_type and medal_type != "Total" else 'Total'
    athlete_medals = athlete_medals.sort_values(by=sort_col, ascending=False).head(limit)
    
    result = []
    for (athlete_id, name, noc), row in athlete_medals.iterrows():
        result.append({
            "id": int(athlete_id),
            "name": name,
            "noc": noc,
            "gold": int(row.get('Gold', 0)),
            "silver": int(row.get('Silver', 0)),
            "bronze": int(row.get('Bronze', 0)),
            "total": int(row['Total'])
        })
    return result

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
