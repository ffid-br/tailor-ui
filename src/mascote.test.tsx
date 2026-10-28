import { fireEvent, render, screen } from '@testing-library/react';
import { AgenteMascote, EquipeDock } from './index';

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
