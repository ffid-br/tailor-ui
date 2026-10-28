import { fireEvent, render, screen, within } from '@testing-library/react';
import { TailorTabela, formatarValor, somar, type TailorTabelaColuna } from './index';

type Linha = { id: string; corretor: string; leads: number; receita: number; conversao: number };
const linhas: Linha[] = [
  { id: 'a1', corretor: 'Bruna', leads: 12, receita: 1500, conversao: 0.125 },
  { id: 'a2', corretor: 'Ana', leads: 40, receita: 9800.5, conversao: 0.3 },
  { id: 'a3', corretor: 'Caio', leads: 7, receita: 0, conversao: 0 },
];
const colunas: Array<TailorTabelaColuna<Linha>> = [
  { chave: 'corretor', titulo: 'Corretor', ordenavel: true },
  { chave: 'leads', titulo: 'Leads', tipo: 'numero', ordenavel: true, total: somar((l: Linha) => l.leads) },
  { chave: 'receita', titulo: 'Receita', tipo: 'moeda', total: somar((l: Linha) => l.receita) },
  { chave: 'conversao', titulo: 'Conversão', tipo: 'percentual' },
];
const nomes = () => screen.getAllByRole('row').slice(1, -1).map((r) => within(r).getAllByRole('cell')[0].textContent);

describe('TailorTabela', () => {
  it('formata por tipo, alinha números à direita e soma o total de todas as linhas', () => {
    render(<TailorTabela legenda="Corretores" colunas={colunas} linhas={linhas} chaveDaLinha={(l) => l.id} porPagina={2} />);
    expect(screen.getByRole('table', { name: 'Corretores' })).toBeInTheDocument();
    expect(screen.getByText('12,5%')).toBeInTheDocument();
    expect(screen.getByText('R$ 9.800,50').closest('td')).toHaveClass('tailor-tabela--direita');
    expect(screen.getByText('59')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveTextContent('Página 1 de 2 · 3 registros');
  });

  it('ordena no navegador e marca aria-sort; paginação anda', () => {
    render(<TailorTabela legenda="Corretores" colunas={colunas} linhas={linhas} chaveDaLinha={(l) => l.id} />);
    fireEvent.click(screen.getByRole('button', { name: /Leads/ }));
    expect(nomes()).toEqual(['Caio', 'Bruna', 'Ana']);
    expect(screen.getByRole('columnheader', { name: /Leads/ })).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(screen.getByRole('button', { name: /Leads/ }));
    expect(nomes()).toEqual(['Ana', 'Bruna', 'Caio']);
  });

  it('ordem controlada só avisa; vazio e carregando ocupam a linha toda', () => {
    const aoOrdenar = vi.fn();
    const { rerender } = render(<TailorTabela legenda="T" colunas={colunas} linhas={linhas} chaveDaLinha={(l) => l.id} aoOrdenar={aoOrdenar} />);
    fireEvent.click(screen.getByRole('button', { name: /Corretor/ }));
    expect(aoOrdenar).toHaveBeenCalledWith({ chave: 'corretor', direcao: 'asc' });
    expect(nomes()).toEqual(['Bruna', 'Ana', 'Caio']);
    rerender(<TailorTabela legenda="T" colunas={colunas} linhas={[]} chaveDaLinha={(l) => l.id} />);
    expect(screen.getByText('Nenhum registro no período.').closest('td')).toHaveAttribute('colspan', '4');
    rerender(<TailorTabela legenda="T" colunas={colunas} linhas={linhas} chaveDaLinha={(l) => l.id} carregando />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('formatarValor: vazio vira traço, data em pt-BR', () => {
    expect(formatarValor(null)).toBe('–');
    expect(formatarValor('2026-10-28T12:00:00', 'data')).toBe('28/10/2026');
  });
});
