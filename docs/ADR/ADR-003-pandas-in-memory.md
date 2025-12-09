# ADR-003: Processamento In-Memory com Pandas

> **Status:** Aceito  
> **Data:** 2025-01-20  
> **Autor:** Ítalo Manzine  
> **Decisores:** Ítalo Manzine

---

## Contexto

O projeto utiliza o dataset Kaggle "120 Years of Olympic History" com:

- **271.117 registros** de participações olímpicas
- **15 colunas** por registro
- **Dataset estático** (não há atualizações em runtime)
- Necessidade de filtragem e agregação dinâmica

A questão central é: **como armazenar e consultar esses dados?**

## Alternativas Consideradas

### 1. Pandas In-Memory

**Prós:**
- Carregamento instantâneo (~500ms na inicialização)
- Queries extremamente rápidas (< 50ms)
- Sem dependência de banco de dados externo
- Portabilidade total
- Sem necessidade de schema/migrations

**Contras:**
- Uso de memória constante (~50MB)
- Não escala para datasets muito maiores
- Sem persistência de writes

### 2. PostgreSQL

**Prós:**
- Queries SQL complexas
- Escalabilidade comprovada
- Índices otimizados

**Contras:**
- Overhead de configuração
- Dependência externa
- Latência de rede (mesmo local)
- Migrations necessárias

### 3. SQLite

**Prós:**
- Sem servidor externo
- Portátil (arquivo único)
- SQL completo

**Contras:**
- Performance inferior a Pandas para agregações
- Write locks em concorrência
- Não aproveita ecossistema Pandas

### 4. MongoDB

**Prós:**
- Schema flexível
- Queries de agregação poderosas

**Contras:**
- Overhead para dataset estruturado
- Dependência externa
- Curva de aprendizado

### 5. Redis

**Prós:**
- Extremamente rápido
- Bom para cache

**Contras:**
- Não adequado como storage primário
- Sem queries complexas nativas

## Decisão

**Escolhemos Pandas In-Memory** pelos seguintes motivos:

1. **Dataset estático**: Não há writes, apenas reads
2. **Tamanho gerenciável**: 271K registros cabem facilmente na RAM
3. **Simplicidade operacional**: Zero dependências externas
4. **Performance**: Agregações com Pandas são extremamente eficientes
5. **Integração natural**: FastAPI + Pandas é uma combinação comum

## Implementação

```python
# data_loader.py
import pandas as pd

# Carrega na inicialização do servidor
df = pd.read_csv("data/athlete_events.csv")
noc_df = pd.read_csv("data/noc_regions.csv")

def get_medals_by_country(year: int, season: str):
    """Query típica - executa em < 50ms"""
    filtered = df[(df['Year'] == year) & (df['Season'] == season)]
    return filtered.groupby('NOC').agg({
        'Medal': lambda x: x.value_counts().to_dict()
    })
```

## Consequências

### Positivas

- Deploy simplificado (apenas Python + arquivo CSV)
- Tempo de resposta consistente < 100ms
- Sem configuração de banco de dados
- Fácil de testar (mock do DataFrame)

### Negativas

- Uso fixo de ~50MB de RAM
- Não adequado se dataset crescer 10x+
- Reinicialização do servidor recarrega dados

### Neutras

- Dados somente leitura (adequado para visualização)

## Métricas de Validação

| Operação | Tempo Médio | Memória |
|----------|-------------|---------|
| Carregamento inicial | ~500ms | 50MB |
| Filtro por ano | < 30ms | - |
| Agregação por país | < 50ms | - |
| Busca de atleta | < 20ms | - |

## Trade-offs Aceitos

1. **RAM sobre Disco**: Aceitamos uso constante de RAM em troca de performance
2. **Simplicidade sobre Escalabilidade**: Adequado para uso acadêmico
3. **Pandas sobre SQL**: Maior flexibilidade com menor overhead

## Quando Reconsiderar

Esta decisão deve ser revista se:

- Dataset ultrapassar 1 milhão de registros
- Múltiplas instâncias do backend forem necessárias
- Operações de escrita forem requeridas
- Queries muito complexas (JOINs múltiplos) forem frequentes

## Referências

- [Pandas Performance Tips](https://pandas.pydata.org/docs/user_guide/enhancingperf.html)
- [When to Use a Database vs. In-Memory](https://stackoverflow.com/questions/tagged/in-memory)
- [FastAPI with Pandas Best Practices](https://fastapi.tiangolo.com/advanced/sql-databases/)
