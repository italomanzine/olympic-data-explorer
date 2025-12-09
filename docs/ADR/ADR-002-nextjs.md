# ADR-002: Escolha do Next.js como Framework Frontend

> **Status:** Aceito  
> **Data:** 2025-01-20  
> **Autor:** Ítalo Manzine  
> **Decisores:** Ítalo Manzine

---

## Contexto

O projeto requer um frontend moderno para exibir visualizações de dados olímpicos com:

- Interface responsiva e interativa
- Múltiplos gráficos complexos (mapa, área, scatter, barras)
- Internacionalização (5 idiomas)
- Boa experiência de desenvolvimento com TypeScript
- Compatibilidade com bibliotecas de visualização React

## Alternativas Consideradas

### 1. Next.js

**Prós:**
- App Router moderno (Next.js 13+)
- Suporte nativo a TypeScript
- Otimizações automáticas de performance
- Flexibilidade: SSR, SSG, CSR conforme necessário
- Excelente DX (Developer Experience)

**Contras:**
- Pode ser "overkill" para SPA simples
- Complexidade adicional do servidor

### 2. Vite + React

**Prós:**
- Build extremamente rápido
- Configuração mínima
- Hot Module Replacement eficiente

**Contras:**
- Sem SSR nativo
- Menos convenções/estrutura definida
- Roteamento manual necessário

### 3. Create React App

**Prós:**
- Familiar para desenvolvedores React
- Configuração zero

**Contras:**
- Descontinuado oficialmente
- Build lento
- Sem SSR

### 4. Vue.js + Nuxt

**Prós:**
- Framework maduro
- Excelente documentação

**Contras:**
- Ecossistema de visualização menor que React
- Equipe mais familiarizada com React

### 5. Svelte + SvelteKit

**Prós:**
- Performance excelente
- Bundle menor

**Contras:**
- Bibliotecas de visualização limitadas
- Comunidade menor

## Decisão

**Escolhemos Next.js** pelos seguintes motivos:

1. **Ecossistema React**: Maior disponibilidade de bibliotecas de visualização
2. **TypeScript nativo**: Tipagem completa sem configuração adicional
3. **App Router**: Estrutura moderna baseada em convenções
4. **Flexibilidade de renderização**: CSR para gráficos interativos
5. **Tailwind integrado**: Estilização rápida e consistente
6. **Comunidade**: Ampla documentação e suporte

## Consequências

### Positivas

- Estrutura de projeto bem definida
- Suporte a React 19 e features modernas
- Fácil integração com Recharts e React Simple Maps
- DevTools excelentes

### Negativas

- Overhead de servidor mesmo para SPA
- Atualizações frequentes podem quebrar compatibilidade

### Neutras

- Deploy em qualquer provedor Node.js (Vercel, Netlify, etc.)

## Validação

A decisão foi validada através de:

- [x] Implementação de 4 tipos de gráficos distintos
- [x] Internacionalização funcionando em 5 idiomas
- [x] 98.88% de cobertura de testes (291 testes)
- [x] Tempo de carregamento inicial < 3s

## Referências

- [Next.js Official Documentation](https://nextjs.org/docs)
- [React 19 Release Notes](https://react.dev/blog)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
