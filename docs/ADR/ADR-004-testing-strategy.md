# ADR-004: Estratégia de Testes com Alta Cobertura

> **Status:** Aceito  
> **Data:** 2025-01-20  
> **Autor:** Ítalo Manzine  
> **Decisores:** Ítalo Manzine

---

## Contexto

O projeto requer validação de qualidade através de testes automatizados para:

- Garantir corretude das agregações de dados
- Validar comportamento dos componentes de visualização
- Prevenir regressões durante desenvolvimento
- Atender requisitos acadêmicos de qualidade

A meta estabelecida foi: **100% de cobertura de testes**.

## Alternativas Consideradas

### Backend: Framework de Testes

#### 1. pytest (Escolhido)

**Prós:**
- Padrão de facto em Python
- Fixtures poderosas
- Integração com pytest-cov
- Suporte nativo a async

**Contras:**
- Curva de aprendizado para fixtures avançadas

#### 2. unittest

**Prós:**
- Incluso na biblioteca padrão
- Familiar para desenvolvedores Java/C#

**Contras:**
- Verboso
- Menos features que pytest

### Frontend: Framework de Testes

#### 1. Jest + Testing Library (Escolhido)

**Prós:**
- Padrão de facto para React
- Integração com Next.js 15
- Filosofia de testar comportamento, não implementação
- Suporte a mocking avançado

**Contras:**
- Configuração inicial com Next.js 15 pode ser complexa

#### 2. Vitest

**Prós:**
- Mais rápido que Jest
- Compatível com API Jest

**Contras:**
- Menos maduro
- Menos documentação para Next.js

#### 3. Cypress Component Testing

**Prós:**
- Testes em browser real
- Debugging visual

**Contras:**
- Overhead de execução
- Mais adequado para E2E

## Decisão

**Backend:** pytest + pytest-cov + httpx (para TestClient assíncrono)

**Frontend:** Jest 30 + @testing-library/react 16 + jest-environment-jsdom

### Estratégia de Cobertura

1. **Testes Unitários**: Funções isoladas de processamento
2. **Testes de Integração**: Endpoints completos da API
3. **Testes de Componentes**: Renderização e interação de componentes React
4. **Testes de Snapshot**: Estrutura de componentes complexos

## Implementação

### Backend (pytest)

```python
# test_main.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_filters():
    response = client.get("/api/meta/filters")
    assert response.status_code == 200
    assert "years" in response.json()
```

### Frontend (Jest + Testing Library)

```typescript
// Dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('renders loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
```

### Configuração de Cobertura

```json
// jest.config.ts
{
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

## Consequências

### Positivas

- **100% cobertura backend**: 107 testes passando
- **98.88% cobertura frontend**: 291 testes passando
- Alta confiança em refatorações
- Documentação viva do comportamento esperado

### Negativas

- Tempo de CI aumentado (~3 min total)
- Manutenção de testes ao mudar componentes

### Neutras

- Curva de aprendizado para equipe

## Métricas Alcançadas

### Backend

| Métrica | Valor |
|---------|-------|
| Testes | 107 |
| Cobertura | 100% |
| Tempo de execução | ~15s |

### Frontend

| Métrica | Valor |
|---------|-------|
| Testes | 291 |
| Cobertura | 98.88% |
| Tempo de execução | ~45s |

## Padrões Adotados

### Given-When-Then

```python
def test_filter_by_year():
    # Given: API está disponível
    # When: Requisição com filtro de ano
    response = client.get("/api/stats/map?year=2016")
    # Then: Retorna dados filtrados
    assert all(r["year"] == 2016 for r in response.json())
```

### Arrange-Act-Assert

```typescript
it('updates when year changes', async () => {
  // Arrange
  const { rerender } = render(<Chart year={2012} />);
  
  // Act
  rerender(<Chart year={2016} />);
  
  // Assert
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('2016'));
  });
});
```

## Desafios Superados

1. **Mocking de fetch**: Uso de `jest-fetch-mock`
2. **Componentes com useEffect**: `waitFor` e `findBy*`
3. **Testes de gráficos**: Exportação de subcomponentes internos
4. **Cobertura de branches**: Testes explícitos para cada condição

## Comandos de Execução

```bash
# Backend
cd backend && pytest --cov=app --cov-report=html

# Frontend
cd frontend && npm run test:coverage
```

## Referências

- [pytest Documentation](https://docs.pytest.org/)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [Martin Fowler - Test Coverage](https://martinfowler.com/bliki/TestCoverage.html)
