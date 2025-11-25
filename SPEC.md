# Especificação do Produto - Olympic Data Explorer

## 1. Visão Geral
Dashboard interativo para exploração de dados históricos das Olimpíadas (1896-2016), focando em visualizações modernas e insights estatísticos além da contagem simples de medalhas.

## 2. Funcionalidades Principais (User Stories)

### 2.1. Painel de Controle (Sidebar)
- O usuário pode filtrar os dados globais por:
  - **Temporada:** Verão, Inverno ou Ambos.
  - **Intervalo de Anos:** Slider de 1896 a 2016.
  - **Gênero:** Masculino, Feminino, Ambos.

### 2.2. Visualização 1: Mapa Geopolítico (Coropleth/Bubble Map)
- **Objetivo:** Ver a dominância global ao longo do tempo.
- **Interação:** Slider de tempo (play/pause) que atualiza o mapa ano a ano.
- **Dados:** Cores dos países baseadas no total de medalhas ou contagem de atletas naquele ano.

### 2.3. Visualização 2: Atlas Fisiológico (Scatter Plot)
- **Objetivo:** Analisar biotipos (Altura vs Peso) por Esporte.
- **Interação:** Dropdown para selecionar Esporte (ex: "Basketball" vs "Gymnastics").
- **Visual:** Eixo X (Peso), Eixo Y (Altura), Cores (Medalha ou Sexo). Tooltip com nome do atleta.

### 2.4. Visualização 3: Fluxo de Modalidades (Streamgraph ou Area Chart)
- **Objetivo:** Ver a ascensão e queda de esportes ou nações.
- **Interação:** Seleção de Top 5 Países ou Top 5 Esportes para comparar evolução.

## 3. Requisitos de Dados (Backend)
O sistema deve ser capaz de lidar com falhas nos dados (ex: atletas sem peso/altura registrados) sem quebrar a visualização.

