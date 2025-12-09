# Especificação do Produto - Olympic Data Explorer

> **Versão:** 1.0.0  
> **Data:** 2024-12-09  
> **Status:** Aprovado  
> **Autor:** Ítalo Manzine  

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Glossário](#2-glossário)
3. [Requisitos Funcionais](#3-requisitos-funcionais)
4. [Requisitos Não-Funcionais](#4-requisitos-não-funcionais)
5. [User Stories](#5-user-stories)
6. [Critérios de Aceitação](#6-critérios-de-aceitação)
7. [Fonte de Dados](#7-fonte-de-dados)
8. [Priorização MoSCoW](#8-priorização-moscow)
9. [Histórico de Revisões](#9-histórico-de-revisões)

---

## 1. Visão Geral

### 1.1 Objetivo

O **Olympic Data Explorer** é um dashboard interativo para exploração e visualização de dados históricos dos Jogos Olímpicos, abrangendo 120 anos de história (1896-2016). O sistema permite análises multidimensionais através de visualizações modernas, filtros dinâmicos e insights estatísticos.

### 1.2 Escopo

O sistema contempla:
- Visualização geográfica de medalhas por país
- Análise biométrica de atletas por modalidade
- Evolução histórica de países ao longo das edições
- Ranking de atletas medalhistas
- Perfil detalhado de atletas individuais
- Suporte a múltiplos idiomas

### 1.3 Público-Alvo

- Pesquisadores e acadêmicos de ciência de dados
- Estudantes de visualização de dados
- Entusiastas de história olímpica
- Jornalistas esportivos

### 1.4 Contexto

Este projeto foi desenvolvido como atividade da disciplina de **Visualização de Dados** do curso de graduação, aplicando conceitos de design de dashboards, visualização multidimensional e desenvolvimento full-stack.

---

## 2. Glossário

| Termo | Definição |
|-------|-----------|
| **NOC** | National Olympic Committee - Código de 3 letras identificando cada país/região |
| **Edição** | Uma realização dos Jogos Olímpicos (ex: Rio 2016) |
| **Temporada** | Summer (Verão) ou Winter (Inverno) |
| **Biometria** | Dados físicos do atleta (altura, peso, idade) |
| **Coroplético** | Mapa onde regiões são coloridas proporcionalmente a uma variável |
| **Scatter Plot** | Gráfico de dispersão com pontos em eixos X/Y |
| **Streamgraph** | Gráfico de área empilhada com fluxo temporal |
| **i18n** | Internacionalização - suporte a múltiplos idiomas |

---

## 3. Requisitos Funcionais

### 3.1 Módulo de Filtros Globais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| **RF-001** | O sistema deve permitir filtrar dados por temporada (Verão/Inverno/Ambos) | Must |
| **RF-002** | O sistema deve permitir filtrar dados por gênero (M/F/Ambos) | Must |
| **RF-003** | O sistema deve permitir filtrar dados por país (NOC) | Must |
| **RF-004** | O sistema deve permitir filtrar dados por modalidade esportiva | Must |
| **RF-005** | O sistema deve permitir selecionar um ano específico via slider | Must |
| **RF-006** | O sistema deve permitir animação temporal automática (play/pause) | Should |
| **RF-007** | O sistema deve permitir ajuste de velocidade da animação | Could |

### 3.2 Módulo de Mapa Global

| ID | Requisito | Prioridade |
|----|-----------|------------|
| **RF-010** | O sistema deve exibir mapa mundial com países coloridos por medalhas | Must |
| **RF-011** | O sistema deve mostrar tooltip ao passar mouse sobre país | Must |
| **RF-012** | O sistema deve exibir breakdown de medalhas (Ouro/Prata/Bronze) no tooltip | Must |
| **RF-013** | O sistema deve atualizar cores do mapa conforme filtros aplicados | Must |
| **RF-014** | O sistema deve permitir expansão do mapa em modal fullscreen | Should |

### 3.3 Módulo de Evolução Histórica

| ID | Requisito | Prioridade |
|----|-----------|------------|
| **RF-020** | O sistema deve exibir gráfico de linha com evolução temporal | Must |
| **RF-021** | O sistema deve mostrar Top 10 países por padrão | Must |
| **RF-022** | O sistema deve permitir filtrar países individualmente via legenda | Should |
| **RF-023** | O sistema deve exibir notas históricas sobre países (ex: USSR → RUS) | Could |
| **RF-024** | O sistema deve permitir expansão do gráfico em modal fullscreen | Should |

### 3.4 Módulo de Biometria

| ID | Requisito | Prioridade |
|----|-----------|------------|
| **RF-030** | O sistema deve exibir scatter plot de Altura x Peso | Must |
| **RF-031** | O sistema deve diferenciar pontos por tipo de medalha (cores) | Must |
| **RF-032** | O sistema deve agrupar pontos sobrepostos (clustering) | Should |
| **RF-033** | O sistema deve mostrar tooltip com nome do atleta | Must |
| **RF-034** | O sistema deve filtrar biometria por modalidade esportiva | Must |
| **RF-035** | O sistema deve permitir expansão do gráfico em modal fullscreen | Should |

### 3.5 Módulo de Ranking de Atletas

| ID | Requisito | Prioridade |
|----|-----------|------------|
| **RF-040** | O sistema deve exibir Top 10 atletas mais medalhistas | Must |
| **RF-041** | O sistema deve permitir filtrar por tipo de medalha | Should |
| **RF-042** | O sistema deve exibir gráfico de barras horizontais | Must |
| **RF-043** | O sistema deve permitir clicar em atleta para ver perfil | Should |

### 3.6 Módulo de Busca e Perfil de Atleta

| ID | Requisito | Prioridade |
|----|-----------|------------|
| **RF-050** | O sistema deve permitir buscar atleta por nome | Must |
| **RF-051** | O sistema deve exibir autocomplete durante busca | Should |
| **RF-052** | O sistema deve exibir card de perfil do atleta selecionado | Must |
| **RF-053** | O sistema deve mostrar histórico de participações do atleta | Must |
| **RF-054** | O sistema deve mostrar evolução de medalhas do atleta | Should |
| **RF-055** | O sistema deve mostrar foto placeholder do atleta | Could |

### 3.7 Módulo de Internacionalização

| ID | Requisito | Prioridade |
|----|-----------|------------|
| **RF-060** | O sistema deve suportar idioma Português (Brasil) | Must |
| **RF-061** | O sistema deve suportar idioma Inglês | Must |
| **RF-062** | O sistema deve suportar idioma Espanhol | Should |
| **RF-063** | O sistema deve suportar idioma Francês | Could |
| **RF-064** | O sistema deve suportar idioma Chinês | Could |
| **RF-065** | O sistema deve persistir preferência de idioma | Should |

### 3.8 Módulo de Quadro de Medalhas

| ID | Requisito | Prioridade |
|----|-----------|------------|
| **RF-070** | O sistema deve exibir tabela com quadro de medalhas | Must |
| **RF-071** | O sistema deve ordenar por Ouro > Prata > Bronze | Must |
| **RF-072** | O sistema deve alternar entre países e esportes conforme filtro | Should |

---

## 4. Requisitos Não-Funcionais

### 4.1 Performance

| ID | Requisito | Métrica |
|----|-----------|---------|
| **RNF-001** | Tempo de carregamento inicial | < 3 segundos |
| **RNF-002** | Tempo de resposta da API | < 500ms |
| **RNF-003** | Atualização de visualizações | < 200ms |
| **RNF-004** | Suporte a dataset de 271K registros | Sem degradação |

### 4.2 Usabilidade

| ID | Requisito | Métrica |
|----|-----------|---------|
| **RNF-010** | Interface responsiva | Suporte a desktop, tablet, mobile |
| **RNF-011** | Acessibilidade | Contraste adequado, labels em elementos |
| **RNF-012** | Feedback visual | Loading states em todas operações |

### 4.3 Confiabilidade

| ID | Requisito | Métrica |
|----|-----------|---------|
| **RNF-020** | Tratamento de dados faltantes | Não quebrar visualização |
| **RNF-021** | Tratamento de erros de API | Mensagens amigáveis |
| **RNF-022** | Cobertura de testes (Backend) | ≥ 100% |
| **RNF-023** | Cobertura de testes (Frontend) | ≥ 95% |

### 4.4 Manutenibilidade

| ID | Requisito | Métrica |
|----|-----------|---------|
| **RNF-030** | Código tipado | TypeScript no frontend |
| **RNF-031** | Documentação de API | OpenAPI/Swagger |
| **RNF-032** | Separação de responsabilidades | Componentes modulares |

---

## 5. User Stories

### US-001: Explorar Medalhas por País
**Como** pesquisador de dados olímpicos  
**Quero** ver a distribuição de medalhas no mapa mundial  
**Para** identificar padrões de dominância geográfica  

**Critérios de Aceitação:**
- [ ] Mapa exibe todos os países participantes
- [ ] Cores representam quantidade de medalhas
- [ ] Tooltip mostra breakdown Gold/Silver/Bronze
- [ ] Filtros afetam visualização em tempo real

---

### US-002: Analisar Biometria por Esporte
**Como** analista esportivo  
**Quero** comparar altura e peso dos atletas por modalidade  
**Para** entender os biotipos ideais de cada esporte  

**Critérios de Aceitação:**
- [ ] Scatter plot exibe altura vs peso
- [ ] Dropdown permite selecionar modalidade
- [ ] Medalhas são diferenciadas por cor
- [ ] Atletas sem dados biométricos não quebram visualização

---

### US-003: Acompanhar Evolução Histórica
**Como** historiador esportivo  
**Quero** ver a evolução de medalhas dos países ao longo do tempo  
**Para** identificar ascensão e queda de potências olímpicas  

**Critérios de Aceitação:**
- [ ] Gráfico de linha mostra Top 10 países
- [ ] Eixo X representa anos olímpicos
- [ ] Legenda permite filtrar países
- [ ] Notas explicam mudanças geopolíticas

---

### US-004: Buscar Atleta Específico
**Como** fã de esportes olímpicos  
**Quero** buscar um atleta pelo nome  
**Para** ver seu histórico completo de participações  

**Critérios de Aceitação:**
- [ ] Campo de busca com autocomplete
- [ ] Resultados aparecem em tempo real
- [ ] Card de perfil mostra todas as informações
- [ ] Histórico lista todas as edições e medalhas

---

### US-005: Animar Linha do Tempo
**Como** apresentador de dados  
**Quero** animar a evolução ano a ano  
**Para** criar uma narrativa visual da história olímpica  

**Critérios de Aceitação:**
- [ ] Botão play/pause controla animação
- [ ] Slider mostra ano atual
- [ ] Velocidade é ajustável
- [ ] Visualizações atualizam suavemente

---

### US-006: Usar em Outro Idioma
**Como** usuário internacional  
**Quero** usar o dashboard no meu idioma  
**Para** entender todas as informações  

**Critérios de Aceitação:**
- [ ] Seletor de idioma visível na interface
- [ ] Todos os textos são traduzidos
- [ ] Preferência é persistida
- [ ] Mudança é instantânea

---

## 6. Critérios de Aceitação

### 6.1 Critérios Gerais

| Critério | Descrição |
|----------|-----------|
| **CA-001** | Todas as visualizações devem carregar sem erros |
| **CA-002** | Filtros devem afetar todas as visualizações simultaneamente |
| **CA-003** | Interface deve ser responsiva em telas ≥ 320px |
| **CA-004** | API deve retornar dados em < 500ms |
| **CA-005** | Dados faltantes não devem causar crashes |

### 6.2 Definição de Pronto (DoD)

Uma feature é considerada **pronta** quando:
- [ ] Código implementado e revisado
- [ ] Testes unitários escritos e passando
- [ ] Testes de integração passando
- [ ] Documentação atualizada
- [ ] Sem erros de lint
- [ ] Build de produção funcionando

---

## 7. Fonte de Dados

### 7.1 Dataset Principal

| Atributo | Valor |
|----------|-------|
| **Nome** | 120 Years of Olympic History: Athletes and Results |
| **Fonte** | [Kaggle](https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-and-results) |
| **Arquivo** | `athlete_events.csv` |
| **Registros** | 271.116 |
| **Período** | 1896 - 2016 |

### 7.2 Estrutura do Dataset

| Coluna | Tipo | Descrição | Obrigatório |
|--------|------|-----------|-------------|
| ID | int | Identificador único do atleta | Sim |
| Name | string | Nome completo | Sim |
| Sex | string | Gênero (M/F) | Sim |
| Age | int | Idade na competição | Não |
| Height | float | Altura em cm | Não |
| Weight | float | Peso em kg | Não |
| Team | string | Nome da equipe | Sim |
| NOC | string | Código do país (3 letras) | Sim |
| Games | string | Edição (ex: "2016 Summer") | Sim |
| Year | int | Ano | Sim |
| Season | string | Summer/Winter | Sim |
| City | string | Cidade sede | Sim |
| Sport | string | Modalidade | Sim |
| Event | string | Evento específico | Sim |
| Medal | string | Gold/Silver/Bronze/NA | Sim |

### 7.3 Tratamento de Dados

| Situação | Tratamento |
|----------|------------|
| Medal = NA | Converter para "No Medal" |
| Height/Weight = NA | Excluir do scatter plot biométrico |
| Age = NA | Manter, não usado em visualizações |
| Nomes com encoding errado | Correção automática de encoding |

---

## 8. Priorização MoSCoW

### Must Have (Essencial)
- Mapa global de medalhas
- Filtros básicos (ano, temporada, gênero)
- Gráfico de evolução histórica
- Scatter plot biométrico
- API REST funcional
- Suporte a PT-BR e EN

### Should Have (Importante)
- Animação temporal (play/pause)
- Busca de atletas
- Perfil detalhado de atleta
- Ranking de atletas
- Quadro de medalhas
- Modais de expansão

### Could Have (Desejável)
- Controle de velocidade da animação
- Notas históricas sobre países
- Suporte a ES, FR, ZH
- Foto placeholder de atletas
- Prefetch de dados

### Won't Have (Fora do Escopo)
- Dados de 2020+ (Tokyo, Paris)
- Comparação lado a lado
- Export de dados
- Login/autenticação
- Dados em tempo real

---

## 9. Histórico de Revisões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0.0 | 2024-12-09 | Ítalo Manzine | Versão inicial completa |
| 0.2.0 | 2024-12-01 | Ítalo Manzine | Adição de user stories |
| 0.1.0 | 2024-11-15 | Ítalo Manzine | Rascunho inicial |

---

## Referências

- [Dataset Kaggle - 120 Years of Olympic History](https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-and-results)
- [C4 Model for Software Architecture](https://c4model.com/)
- [MoSCoW Prioritization](https://www.productplan.com/glossary/moscow-prioritization/)
- [User Story Mapping](https://www.jpattonassociates.com/user-story-mapping/)
