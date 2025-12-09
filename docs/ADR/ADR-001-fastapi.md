# ADR-001: Escolha do FastAPI como Framework Backend

> **Status:** Aceito  
> **Data:** 2025-01-20  
> **Autor:** Ítalo Manzine  
> **Decisores:** Ítalo Manzine

---

## Contexto

O projeto necessita de um backend para servir uma API REST que fornece dados olímpicos filtrados e agregados para visualizações interativas. Os requisitos principais são:

- Performance adequada para processar ~270K registros
- Facilidade de integração com Pandas para processamento de dados
- Documentação automática da API
- Tipagem para reduzir erros de desenvolvimento
- Curva de aprendizado adequada para projeto acadêmico

## Alternativas Consideradas

### 1. FastAPI

**Prós:**
- Performance nativa com suporte assíncrono
- Tipagem com Pydantic integrada
- Documentação automática (OpenAPI/Swagger)
- Comunidade ativa e crescente
- Excelente integração com o ecossistema Python científico

**Contras:**
- Menos maduro que Django/Flask
- Menos recursos "batteries included"

### 2. Flask

**Prós:**
- Extremamente simples e minimalista
- Grande comunidade e muitos tutoriais
- Flexibilidade total

**Contras:**
- Sem tipagem nativa
- Documentação manual necessária
- Sem validação automática de request/response

### 3. Django REST Framework

**Prós:**
- Maduro e estável
- ORM integrado
- Admin panel incluso

**Contras:**
- Overhead desnecessário para API simples
- Curva de aprendizado maior
- ORM não necessário (usamos CSV/Pandas)

### 4. Express.js (Node.js)

**Prós:**
- Mesma linguagem que frontend
- Grande ecossistema

**Contras:**
- Ecossistema de data science menos maduro que Python
- Integração com Pandas não disponível

## Decisão

**Escolhemos FastAPI** pelos seguintes motivos:

1. **Tipagem nativa**: Reduz bugs e melhora a experiência de desenvolvimento
2. **Documentação automática**: Swagger UI gerado automaticamente em `/docs`
3. **Performance**: Adequado para processar o dataset em memória
4. **Integração Python**: Excelente compatibilidade com Pandas, NumPy
5. **Modernidade**: Padrões Python 3.10+ com type hints

## Consequências

### Positivas

- Documentação da API sempre atualizada
- Validação automática de parâmetros
- Código mais legível com tipagem
- Facilidade de testes com `TestClient`

### Negativas

- Equipe precisa conhecer type hints do Python
- Menos recursos "prontos" comparado a Django

### Neutras

- Deploy similar a outros frameworks Python (Uvicorn/Gunicorn)

## Validação

A decisão foi validada através de:

- [x] Implementação completa dos 7 endpoints
- [x] 100% de cobertura de testes (107 testes)
- [x] Tempo de resposta < 100ms para todas as rotas
- [x] Documentação Swagger funcional em `/docs`

## Referências

- [FastAPI Official Documentation](https://fastapi.tiangolo.com/)
- [Benchmarks FastAPI vs Flask](https://www.techempower.com/benchmarks/)
- [PEP 484 - Type Hints](https://peps.python.org/pep-0484/)
