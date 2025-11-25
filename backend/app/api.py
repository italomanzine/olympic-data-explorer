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
        top_countries = medals_deduped['NOC'].value_counts().head(5).index.tolist()
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
