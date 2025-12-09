from fastapi import APIRouter, Query
from .data_loader import data_loader
import pandas as pd
from typing import List, Optional, Dict, Any

router = APIRouter()

def apply_filters(
    df, 
    year: Optional[int] = None, 
    season: Optional[str] = None, 
    sex: Optional[str] = None, 
    country: Optional[str] = None, 
    sport: Optional[str] = None, 
    start_year: Optional[int] = None, 
    end_year: Optional[int] = None
):
    mask = pd.Series(True, index=df.index)
    
    if year:
        mask &= (df['Year'] == year)
    
    if start_year is not None and end_year is not None:
        mask &= (df['Year'] >= start_year) & (df['Year'] <= end_year)

    if season and season != "Both":
        mask &= (df['Season'] == season)
        
    if sex and sex != "Both":
        mask &= (df['Sex'] == sex)
        
    if country and country != "All":
        mask &= (df['NOC'] == country)
        
    if sport and sport != "All":
        mask &= (df['Sport'] == sport)
        
    return df[mask]

@router.get("/filters")
def get_filters():
    df = data_loader.get_df()
    year_season_map = df.groupby('Year')['Season'].unique().apply(list).to_dict()
    
    noc_df = df[['NOC', 'Team']].drop_duplicates()
    noc_df['Team'] = noc_df['Team'].str.replace(r'-\d+$', '', regex=True)
    noc_map = noc_df.groupby('NOC')['Team'].first().to_dict()
    
    countries_list = []
    countries_list.append({"code": "All", "label": "Todos os Países"})
    sorted_nocs = sorted(df['NOC'].unique())
    
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
        "years": sorted(df['Year'].unique().tolist()),
        "sports": ["All"] + sorted(df['Sport'].unique().tolist()), 
        "countries": countries_list, 
        "year_season_map": year_season_map
    }

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
    df = data_loader.get_df()
    filtered = apply_filters(df, year, season, sex, country, sport, start_year, end_year)
    
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
    df = data_loader.get_df()
    filtered = apply_filters(df, year, season, sex, country, sport)
        
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
    df = data_loader.get_df()
    
    if country and country != "All":
        target_countries = [country]
    else:
        target_countries = countries

    filtered_base = apply_filters(df, season=season, sex=sex, sport=sport) 
    
    medals_only_base = filtered_base[filtered_base['Medal'] != 'No Medal']
    
    if medals_only_base.empty:
        return []

    medals_deduped = medals_only_base.drop_duplicates(subset=['Year', 'Season', 'NOC', 'Event', 'Medal'])

    if not target_countries:
        top_countries = medals_deduped['NOC'].value_counts().head(10).index.tolist()
        target_countries = top_countries
        
    mask = medals_deduped['NOC'].isin(target_countries)
    filtered = medals_deduped[mask]
    
    if filtered.empty:
        return []

    evolution = filtered.groupby(['Year', 'NOC']).size().reset_index(name='Medals')
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
    df = data_loader.get_df()
    
    # Filtro base
    filtered = apply_filters(df, year, season, sex, country, sport)
    medals_only = filtered[filtered['Medal'] != 'No Medal']
    
    if medals_only.empty:
        return []

    # Deduplicação por Evento (1 medalha por evento de time)
    medals_deduped = medals_only.drop_duplicates(subset=['Year', 'Season', 'NOC', 'Event', 'Medal'])
    
    # Definição da chave de agrupamento
    # Se country selecionado -> agrupa por Sport
    # Se country="All" -> agrupa por NOC
    group_key = 'Sport' if (country and country != "All") else 'NOC'
    
    stats = medals_deduped.groupby(group_key)['Medal'].value_counts().unstack(fill_value=0)
    
    # Garantir colunas
    desired_cols = ['Gold', 'Silver', 'Bronze']
    for col in desired_cols:
        if col not in stats.columns:
            stats[col] = 0
            
    stats['Total'] = stats.sum(axis=1)
    
    # Ordenação: Gold > Silver > Bronze
    stats = stats.sort_values(by=['Gold', 'Silver', 'Bronze'], ascending=False)
    
    # Formatar retorno
    result = []
    
    # Se for NOC, pegar o nome completo para ficar bonito
    noc_map = {}
    if group_key == 'NOC':
        noc_df = df[['NOC', 'Team']].drop_duplicates()
        noc_df['Team'] = noc_df['Team'].str.replace(r'-\d+$', '', regex=True)
        noc_map = noc_df.groupby('NOC')['Team'].first().to_dict()

    for key, row in stats.iterrows():
        label = str(key)
        if group_key == 'NOC':
            label = noc_map.get(key, key)
            
        result.append({
            "name": label,
            "code": str(key), # NOC ou Sport Name
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
    """Retorna os top atletas com mais medalhas"""
    df = data_loader.get_df()
    
    filtered = apply_filters(df, year, season, sex, country, sport, start_year, end_year)
    medals_only = filtered[filtered['Medal'] != 'No Medal']
    
    if medals_only.empty:
        return []
    
    # Aplicar filtro de tipo de medalha se especificado
    if medal_type and medal_type != "Total":
        medals_only = medals_only[medals_only['Medal'] == medal_type]
    
    if medals_only.empty:
        return []
    
    # Deduplicar por evento (uma medalha por evento para times)
    medals_deduped = medals_only.drop_duplicates(subset=['Year', 'Season', 'ID', 'Event', 'Medal'])
    
    # Agrupar por atleta
    athlete_medals = medals_deduped.groupby(['ID', 'Name', 'NOC'])['Medal'].value_counts().unstack(fill_value=0)
    
    desired_cols = ['Gold', 'Silver', 'Bronze']
    for col in desired_cols:
        if col not in athlete_medals.columns:
            athlete_medals[col] = 0
    
    athlete_medals['Total'] = athlete_medals[desired_cols].sum(axis=1)
    
    # Ordenar por total de medalhas (ou por tipo específico se filtrado)
    sort_col = medal_type if medal_type and medal_type != "Total" else 'Total'
    if sort_col not in athlete_medals.columns:
        sort_col = 'Total'
    
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
    """Busca atletas pelo nome (mínimo 2 caracteres)"""
    df = data_loader.get_df()
    
    # Busca case-insensitive
    mask = df['Name'].str.contains(query, case=False, na=False)
    matches = df[mask][['ID', 'Name', 'NOC', 'Sport']].drop_duplicates(subset=['ID'])
    
    # Ordenar por relevância (nomes que começam com a query primeiro)
    matches['starts_with'] = matches['Name'].str.lower().str.startswith(query.lower())
    matches = matches.sort_values(['starts_with', 'Name'], ascending=[False, True])
    
    results = []
    for _, row in matches.head(limit).iterrows():
        results.append({
            "id": int(row['ID']),
            "name": row['Name'],
            "noc": row['NOC'],
            "sport": row['Sport']
        })
    
    return results


@router.get("/athletes/{athlete_id}")
def get_athlete_profile(athlete_id: int):
    """Retorna o perfil completo de um atleta com todas as suas participações"""
    df = data_loader.get_df()
    
    athlete_data = df[df['ID'] == athlete_id]
    
    if athlete_data.empty:
        return {"error": "Atleta não encontrado"}
    
    # Informações básicas (pegar a mais recente)
    latest = athlete_data.sort_values('Year', ascending=False).iloc[0]
    
    # Coletar todas as participações
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
    
    # Ordenar participações por ano
    participations.sort(key=lambda x: x['year'])
    
    # Contar medalhas
    medals = athlete_data[athlete_data['Medal'] != 'No Medal']['Medal'].value_counts().to_dict()
    
    # Coletar esportes únicos
    sports = athlete_data['Sport'].unique().tolist()
    
    # Anos de participação
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


@router.get("/athletes/{athlete_id}/stats")
def get_athlete_stats(athlete_id: int):
    """Retorna estatísticas para os gráficos de um atleta específico"""
    df = data_loader.get_df()
    
    athlete_data = df[df['ID'] == athlete_id]
    
    if athlete_data.empty:
        return {"error": "Atleta não encontrado"}
    
    # Evolução de medalhas por ano
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
    
    # Biometria (dados do atleta)
    latest = athlete_data.sort_values('Year', ascending=False).iloc[0]
    biometrics = {
        "height": float(latest['Height']) if pd.notna(latest['Height']) else None,
        "weight": float(latest['Weight']) if pd.notna(latest['Weight']) else None,
        "sex": latest['Sex']
    }
    
    # Medalhas por esporte
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
    
    # Ordenar por total de medalhas
    medals_by_sport.sort(key=lambda x: x['total'], reverse=True)
    
    return {
        "evolution": evolution,
        "biometrics": biometrics,
        "medals_by_sport": medals_by_sport
    }
