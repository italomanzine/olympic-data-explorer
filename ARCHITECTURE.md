# Arquitetura do Sistema

## 1. Stack Tecnológica

### Frontend
- **Framework:** Next.js 14+ (App Router, TypeScript).
- **Estilização:** Tailwind CSS.
- **Visualização:** 
  - `recharts` (para gráficos de área/linha/scatter simples).
  - `react-simple-maps` ou `d3-geo` (para o mapa).
  - `framer-motion` (para animações de transição).
- **State Management:** React Context ou Zustand (para filtros globais).

### Backend
- **Framework:** FastAPI (Python 3.10+).
- **Data Processing:** Pandas.
- **Fonte de Dados:** Arquivo CSV estático (`athlete_events.csv`) carregado na memória na inicialização.

### QA / Testes
- **Backend:** `pytest` para endpoints da API.
- **Frontend:** `vitest` + `react-testing-library`.

## 2. Estrutura de Diretórios (Monorepo Simulado)

```
/
├── backend/
│   ├── data/               # Onde fica o athlete_events.csv
│   ├── app/
│   │   ├── main.py         # Entrypoint FastAPI
│   │   ├── api.py          # Rotas
│   │   └── data_loader.py  # Lógica Pandas
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Charts, Filters
│   │   ├── app/            # Pages
│   │   └── lib/            # API clients
│   ├── package.json
│   └── ...
└── README.md
```

## 3. API Endpoints Planejados

- `GET /api/meta/filters`: Retorna listas únicas de Anos, Esportes, Países para preencher os dropdowns.
- `GET /api/stats/map`: Retorna dados agregados por País (NOC) para o ano/filtros selecionados.
- `GET /api/stats/biometrics`: Retorna lista plana de {height, weight, sex, medal} filtrado por Esporte.
- `GET /api/stats/evolution`: Retorna série temporal para o Streamgraph.

