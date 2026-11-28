import { fireEvent, render, screen } from '@testing-library/react';
import { AgenteMascote, EquipeCarregando, EquipeDock } from './index';

describe('AgenteMascote', () => {
  it('desenha 64 quadradinhos e diz nome, estado e pendências no rótulo', () => {
    const { container } = render(<AgenteMascote agente="desk" nome="Alfred" estado="esperando" selo={4} />);
    expect(container.querySelectorAll('.tailor-mascote__pixel')).toHaveLength(64);
    expect(container.querySelectorAll('.tailor-mascote__verde')).toHaveLength(2);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Alfred: Esperando você, 4 pendentes');
  });

  it('desligado fecha os olhos e não mostra selo zerado; estado sempre com texto', () => {
    const { container } = render(<AgenteMascote agente="pm" nome="PM" estado="desligado" mostrarEstado />);
    expect(container.querySelectorAll('.tailor-mascote__olho')).toHaveLength(0);
    expect(container.querySelector('.tailor-mascote__selo')).toBeNull();
    expect(screen.getByText('Desligado')).toBeInTheDocument();
  });
});

describe('AgenteMascote estilo vetor', () => {
  it('desenha em SVG, com o olhar do estado e a fala no rótulo', () => {
    const { container } = render(<AgenteMascote agente="desk" nome="Alfred" estilo="vetor" estado="falando" fala="Achei 3 leads." />);
    expect(container.querySelector('.tailor-mascote__pixel')).toBeNull();
    expect(container.querySelector('.tailor-mv--falando svg')).not.toBeNull();
    expect(container.querySelectorAll('.tailor-mv__pupila')).toHaveLength(2);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Alfred: Falando. Achei 3 leads.');
  });

  it('agente sem mapa 8x8 sai em vetor; tema veste acessório e objeto; dormindo fecha os olhos', () => {
    const { container } = render(<AgenteMascote agente="sdr" nome="SDR" estado="desligado" tema="natal" />);
    expect(container.querySelector('.tailor-mv--dormindo')).not.toBeNull();
    expect(container.querySelectorAll('.tailor-mv__pupila')).toHaveLength(0);
    expect(container.querySelector('.tailor-mv__zzz')).not.toBeNull();
    expect(container.querySelectorAll('.tailor-mv__corpo > g[transform]')).toHaveLength(2);
  });

  it('expressão sobrescreve o olhar do estado', () => {
    const { container } = render(<AgenteMascote agente="pm" nome="PM" estilo="vetor" estado="parado" expressao="tonto" />);
    expect(container.querySelectorAll('.tailor-mv__pupila')).toHaveLength(0);
  });
});

describe('EquipeDock', () => {
  const agentes = [
    { chave: 'desk' as const, nome: 'Alfred', estado: 'esperando' as const, selo: 3, conteudo: <p>feed do Alfred</p> },
    { chave: 'pergunte' as const, nome: 'Pergunte', estado: 'desligado' as const },
  ];

  it('botão soma as pendências e abre o painel com uma aba por agente', () => {
    render(<EquipeDock agentes={agentes} />);
    const botao = screen.getByRole('button', { name: 'Abrir equipe, 3 pendentes' });
    expect(screen.queryByRole('tablist')).toBeNull();
    fireEvent.click(botao);
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByText('feed do Alfred')).toBeInTheDocument();
  });

  it('mostra quem está trabalhando junto do principal', () => {
    render(<EquipeDock estilo="vetor" agentes={[
      { chave: 'desk', nome: 'Alfred', estado: 'analisando' },
      { chave: 'sdr', nome: 'SDR', estado: 'falando' },
      { chave: 'cred', nome: 'Cred', estado: 'analisando' },
      { chave: 'bi', nome: 'BI', estado: 'desligado' },
    ]} />);
    const botao = screen.getByRole('button', { name: 'Abrir equipe, 3 trabalhando' });
    expect(botao.querySelectorAll('[role="img"]')).toHaveLength(3);
  });

  it('aba sem conteúdo diz "Em breve"', () => {
    render(<EquipeDock agentes={agentes} abertoInicial />);
    fireEvent.click(screen.getAllByRole('tab')[1]);
    expect(screen.getByText('Em breve.')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
  });
});

describe('EquipeDock pelo teclado', () => {
  const agentes = (['desk', 'sdr', 'cred'] as const).map((chave) => ({ chave, nome: chave }));

  it('setas, Home e End trocam a aba e levam o foco; só a aba atual entra no Tab', () => {
    render(<EquipeDock estilo="vetor" agentes={agentes} abertoInicial />);
    const abas = screen.getAllByRole('tab');
    expect(abas.map((a) => a.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    abas[0].focus();
    fireEvent.keyDown(abas[0], { key: 'ArrowRight' });
    expect(abas[1]).toHaveAttribute('aria-selected', 'true');
    expect(abas[1]).toHaveFocus();
    fireEvent.keyDown(abas[1], { key: 'End' });
    expect(abas[2]).toHaveFocus();
    fireEvent.keyDown(abas[2], { key: 'ArrowRight' });
    expect(abas[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(abas[0], { key: 'ArrowLeft' });
    expect(abas[2]).toHaveFocus();
  });

  it('Esc fecha o painel e devolve o foco ao botão', () => {
    render(<EquipeDock agentes={agentes} abertoInicial />);
    fireEvent.keyDown(screen.getAllByRole('tab')[0], { key: 'Escape' });
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByRole('button', { name: 'Abrir equipe' })).toHaveFocus();
  });
});

describe('recorte do vetor', () => {
  it('sem tema, o quadro é justo e o corpo ocupa a largura', () => {
    const { container } = render(<AgenteMascote agente="diretor" nome="Diretor" estilo="vetor" tamanho={24} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('viewBox', '36 44 148 144');
    expect(Number(svg.getAttribute('height'))).toBeCloseTo((24 * 144) / 148);
  });

  it('com tema, o quadro e o tamanho do corpo não mudam: o que sobra vira margem', () => {
    const { container } = render(<AgenteMascote agente="desk" nome="Desk" estilo="vetor" tema="natal" tamanho={148} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('viewBox', '36 44 148 144');
    expect(svg).toHaveAttribute('width', '148');
    // gorro: 44 - (70 + 2 - 60) = 32 acima; presente: 165 + 8 + 36 - 184 = 25 à direita (escala 1)
    expect(svg.style.marginTop).toBe('32px');
    expect(svg.style.marginRight).toBe('25px');
  });

  it('quem já usa chapéu troca o chapéu pelo acessório, sem empilhar', () => {
    const quepe = 'path[d^="M54 78"]';
    const semTema = render(<AgenteMascote agente="pilot" nome="Pilot" estado="parado" />);
    expect(semTema.container.querySelector(quepe)).not.toBeNull();
    const natal = render(<AgenteMascote agente="pilot" nome="Pilot" estado="parado" tema="natal" />);
    expect(natal.container.querySelector(quepe)).toBeNull();
    expect(natal.container.querySelector('.tailor-mv__verde circle')).toHaveAttribute('cy', '160');
  });
});

describe('EquipeCarregando', () => {
  it('um mascote por agente, em onda, com rótulo de status', () => {
    const { container } = render(<EquipeCarregando agentes={['vigia', 'agenda', 'diretor', 'pm']} rotulo="Preparando" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Preparando');
    const agentes = container.querySelectorAll<HTMLElement>('.tailor-equipe-carregando__agente');
    expect(agentes).toHaveLength(4);
    expect(Array.from(agentes, (a) => a.style.animationDelay)).toEqual(['0s', '0.12s', '0.24s', '0.36s']);
    expect(container.querySelectorAll('.tailor-mv__pupila')).toHaveLength(8);
  });
});
