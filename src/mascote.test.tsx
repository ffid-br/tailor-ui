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

  it('aba sem conteúdo diz "Em breve"', () => {
    render(<EquipeDock agentes={agentes} abertoInicial />);
    fireEvent.click(screen.getAllByRole('tab')[1]);
    expect(screen.getByText('Em breve.')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
  });
});
