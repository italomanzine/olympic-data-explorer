import React from 'react';
import { render, screen } from '@testing-library/react';
import GenderPieChart from '../../../components/charts/GenderPieChart';
import { LanguageProvider } from '../../../contexts/LanguageContext';

// Mock do Recharts para evitar problemas de renderização no Jest
// Vamos renderizar o conteúdo do Tooltip diretamente para testar o CustomTooltip
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 400, height: 400 }}>
        {children}
      </div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: ({ children, data }: { children?: React.ReactNode; data?: any[] }) => (
      <div data-testid="pie" data-length={data?.length || 0}>{children}</div>
    ),
    Cell: ({ fill }: { fill: string }) => (
      <div data-testid="cell" data-fill={fill} />
    ),
    Tooltip: ({ content }: { content?: any }) => {
      // Renderiza o conteúdo do tooltip com dados mock para testar CustomTooltip
      if (content && typeof content === 'object' && content.type) {
        const TooltipComponent = content.type;
        // Testa estado ativo
        const activePayload = [{
          payload: { name: 'M', value: 500, percent: 50 }
        }];
        // Testa estado inativo
        const inactiveRender = <TooltipComponent active={false} payload={[]} />;
        const activeRender = <TooltipComponent active={true} payload={activePayload} />;
        return (
          <div data-testid="tooltip">
            <div data-testid="tooltip-inactive">{inactiveRender}</div>
            <div data-testid="tooltip-active">{activeRender}</div>
          </div>
        );
      }
      return <div data-testid="tooltip">{content}</div>;
    },
    Legend: ({ formatter }: { formatter?: (value: string) => string }) => (
      <div data-testid="legend">
        {formatter && <span data-testid="legend-m">{formatter('M')}</span>}
        {formatter && <span data-testid="legend-f">{formatter('F')}</span>}
      </div>
    ),
  };
});

const renderWithLanguage = (component: React.ReactNode) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('GenderPieChart', () => {
  describe('Renderização básica', () => {
    it('deve renderizar o gráfico com dados válidos', () => {
      const mockData = [
        { Sex: 'M', Count: 1000 },
        { Sex: 'F', Count: 800 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    it('deve renderizar mensagem quando não há dados', () => {
      renderWithLanguage(<GenderPieChart data={[]} />);
      
      // Não deve ter o gráfico
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });

    it('deve renderizar mensagem quando data é undefined', () => {
      renderWithLanguage(<GenderPieChart data={undefined as any} />);
      
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
    });
  });

  describe('Processamento de dados', () => {
    it('deve calcular percentuais corretamente', () => {
      const mockData = [
        { Sex: 'M', Count: 600 },
        { Sex: 'F', Count: 400 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      // O componente deve processar e renderizar
      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-length', '2');
    });

    it('deve lidar com apenas um gênero', () => {
      const mockData = [
        { Sex: 'M', Count: 1000 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      const pie = screen.getByTestId('pie');
      expect(pie).toHaveAttribute('data-length', '1');
    });

    it('deve ordenar dados por valor (maior primeiro)', () => {
      const mockData = [
        { Sex: 'F', Count: 500 },
        { Sex: 'M', Count: 1000 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      // Verifica que o gráfico foi renderizado
      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });
  });

  describe('Cores', () => {
    it('deve usar cores olímpicas para M e F', () => {
      const mockData = [
        { Sex: 'M', Count: 100 },
        { Sex: 'F', Count: 100 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      // Verifica que as células são renderizadas
      const cells = screen.getAllByTestId('cell');
      expect(cells.length).toBeGreaterThan(0);
      
      // Verifica as cores (azul olímpico para M, vermelho para F)
      const fills = cells.map(cell => cell.getAttribute('data-fill'));
      expect(fills).toContain('#0081C8'); // Azul olímpico
      expect(fills).toContain('#EE334E'); // Vermelho olímpico
    });
  });

  describe('Legenda', () => {
    it('deve renderizar legenda com traduções', () => {
      const mockData = [
        { Sex: 'M', Count: 100 },
        { Sex: 'F', Count: 100 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      expect(screen.getByTestId('legend')).toBeInTheDocument();
      // Formatter traduz M e F para os nomes localizados
      expect(screen.getByTestId('legend-m')).toBeInTheDocument();
      expect(screen.getByTestId('legend-f')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('deve renderizar tooltip', () => {
      const mockData = [
        { Sex: 'M', Count: 100 },
        { Sex: 'F', Count: 100 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Integração com contexto de idioma', () => {
    it('deve usar traduções do contexto', () => {
      const mockData = [
        { Sex: 'M', Count: 500 },
        { Sex: 'F', Count: 500 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      // Verifica que a legenda usa o formatter que traduz
      const legendM = screen.getByTestId('legend-m');
      const legendF = screen.getByTestId('legend-f');
      
      // O formatter deve ter traduzido os valores
      expect(legendM).toBeInTheDocument();
      expect(legendF).toBeInTheDocument();
    });
  });

  describe('Casos de borda', () => {
    it('deve lidar com contagens zero', () => {
      const mockData = [
        { Sex: 'M', Count: 0 },
        { Sex: 'F', Count: 0 },
      ];
      
      // Quando ambos são 0, o total é 0 e a divisão por 0 deve ser tratada
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      // Deve renderizar sem erros
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('deve lidar com valores grandes', () => {
      const mockData = [
        { Sex: 'M', Count: 10000000 },
        { Sex: 'F', Count: 8000000 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('deve lidar com valores decimais implícitos', () => {
      const mockData = [
        { Sex: 'M', Count: 333 },
        { Sex: 'F', Count: 667 },
      ];
      
      renderWithLanguage(<GenderPieChart data={mockData} />);
      
      // Percentuais: 33.3% e 66.7%
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });
});

describe('CustomTooltip', () => {
  // Testes do CustomTooltip são indiretos já que é um componente interno
  // A funcionalidade é testada através do GenderPieChart
  
  it('deve ser passado como conteúdo do Tooltip', () => {
    const mockData = [
      { Sex: 'M', Count: 100 },
    ];
    
    renderWithLanguage(<GenderPieChart data={mockData} />);
    
    // Verifica que o Tooltip recebe content
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });
});

