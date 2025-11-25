# Olympic Data Explorer 🏅

Projeto de Visualização de Dados usando Next.js e FastAPI.

## Estrutura
- `frontend/`: Aplicação Next.js (React, Tailwind, Recharts, Maps).
- `backend/`: API FastAPI (Python, Pandas).

## Como Rodar

### 1. Backend (API)
Necessário Python 3.10+.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
A API rodará em `http://localhost:8000`.
Acesse `http://localhost:8000/docs` para ver a documentação interativa.

> **Nota:** Se você tiver o arquivo `athlete_events.csv`, coloque-o em `backend/data/`. Caso contrário, o sistema gerará dados simulados automaticamente.

### 2. Frontend (Dashboard)
Necessário Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```
O dashboard rodará em `http://localhost:3000`.

## Funcionalidades
- **Filtros Globais:** Ano, Esporte.
- **Mapa Interativo:** Distribuição de medalhas por país.
- **Gráfico de Biometria:** Scatter plot de Altura x Peso.
- **Gráfico de Evolução:** Histórico de medalhas dos principais países.

