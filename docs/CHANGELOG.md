# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2025-01-20

### Adicionado

#### Backend
- API REST completa com FastAPI
- 7 endpoints funcionais:
  - `GET /api/meta/filters` - Opções de filtros
  - `GET /api/stats/map` - Dados do mapa coroplético
  - `GET /api/stats/biometrics` - Dados biométricos (altura/peso)
  - `GET /api/stats/evolution` - Série temporal de medalhas
  - `GET /api/stats/top-athletes` - Ranking de atletas
  - `GET /api/athlete/{id}` - Perfil de atleta
  - `GET /api/search/athletes` - Busca de atletas
- Processamento in-memory com Pandas
- Suporte a filtros por ano, temporada, esporte e país
- Documentação automática OpenAPI/Swagger
- 100% de cobertura de testes (107 testes)

#### Frontend
- Interface completa com Next.js 16 e React 19
- 4 visualizações interativas:
  - Mapa coroplético mundial
  - Gráfico de área (evolução temporal)
  - Gráfico de dispersão (biometria)
  - Gráfico de barras (top atletas)
- Tabela de medalhas com ordenação
- Card de perfil de atleta
- Sistema de filtros:
  - Slider de intervalo de anos
  - Selects pesquisáveis (país, esporte)
  - Toggle de temporada (Verão/Inverno)
- Modal expansível para gráficos em tela cheia
- Internacionalização (pt-BR, en, es, fr, zh)
- Tema escuro
- Design responsivo
- 98.88% de cobertura de testes (291 testes)

#### Documentação
- README.md profissional com diagramas Mermaid
- Documentação de arquitetura (ARCHITECTURE.md)
- Especificação de requisitos (SPEC.md)
- 4 Architecture Decision Records (ADRs)
- Este CHANGELOG.md

### Técnico

- Monorepo com estrutura `/backend` e `/frontend`
- TypeScript no frontend com tipagem estrita
- Python 3.10+ com type hints
- Tailwind CSS para estilização
- Framer Motion para animações
- Recharts para gráficos
- React Simple Maps para mapa mundial

---

## [0.2.0] - 2025-01-19 (Desenvolvimento)

### Adicionado

- Implementação inicial do Dashboard
- Primeiros componentes de visualização
- Integração frontend-backend

### Corrigido

- Problemas de CORS entre frontend e backend
- Tratamento de valores NaN no dataset

---

## [0.1.0] - 2025-01-18 (Início)

### Adicionado

- Estrutura inicial do projeto
- Configuração do backend FastAPI
- Configuração do frontend Next.js
- Carregamento do dataset Kaggle
- Primeiros endpoints da API

---

## Tipos de Mudanças

- **Adicionado** para novas funcionalidades.
- **Alterado** para mudanças em funcionalidades existentes.
- **Depreciado** para funcionalidades que serão removidas em breve.
- **Removido** para funcionalidades removidas.
- **Corrigido** para correções de bugs.
- **Segurança** para correções de vulnerabilidades.

---

## Links

- [Repositório do Projeto](https://github.com/seu-usuario/olympic-data-viz)
- [Dataset Kaggle](https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-and-results)
