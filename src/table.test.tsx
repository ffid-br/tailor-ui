import { fireEvent, render, screen, within } from '@testing-library/react';
import { TailorLocaleProvider, TailorTable, formatValue, sumBy, type TailorTableColumn } from './index';

type Row = { id: string; agent: string; leads: number; revenue: number; conversion: number };
const rows: Row[] = [
  { id: 'a1', agent: 'Bruna', leads: 12, revenue: 1500, conversion: 0.125 },
  { id: 'a2', agent: 'Ana', leads: 40, revenue: 9800.5, conversion: 0.3 },
  { id: 'a3', agent: 'Caio', leads: 7, revenue: 0, conversion: 0 },
];
const columns: Array<TailorTableColumn<Row>> = [
  { key: 'agent', header: 'Corretor', sortable: true },
  { key: 'leads', header: 'Leads', type: 'number', sortable: true, total: sumBy((r: Row) => r.leads) },
  { key: 'revenue', header: 'Receita', type: 'currency', total: sumBy((r: Row) => r.revenue) },
  { key: 'conversion', header: 'Conversão', type: 'percent' },
];
const names = () => screen.getAllByRole('row').slice(1, -1).map((r) => within(r).getAllByRole('cell')[0].textContent);

describe('TailorTable', () => {
  it('formata por tipo, alinha números à direita e soma o total de todas as linhas', () => {
    render(<TailorTable caption="Corretores" columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={2} />);
    expect(screen.getByRole('table', { name: 'Corretores' })).toBeInTheDocument();
    expect(screen.getByText('12,5%')).toBeInTheDocument();
    expect(screen.getByText('R$ 9.800,50').closest('td')).toHaveClass('tailor-table--right');
    expect(screen.getByText('59')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveTextContent('Página 1 de 2 · 3 registros');
  });

  it('ordena no navegador e marca aria-sort', () => {
    render(<TailorTable caption="Corretores" columns={columns} rows={rows} rowKey={(r) => r.id} />);
    fireEvent.click(screen.getByRole('button', { name: /Leads/ }));
    expect(names()).toEqual(['Caio', 'Bruna', 'Ana']);
    expect(screen.getByRole('columnheader', { name: /Leads/ })).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(screen.getByRole('button', { name: /Leads/ }));
    expect(names()).toEqual(['Ana', 'Bruna', 'Caio']);
  });

  it('ordem controlada só avisa; vazio e carregando ocupam a linha toda', () => {
    const onSortChange = vi.fn();
    const { rerender } = render(<TailorTable caption="T" columns={columns} rows={rows} rowKey={(r) => r.id} onSortChange={onSortChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Corretor/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'agent', direction: 'asc' });
    expect(names()).toEqual(['Bruna', 'Ana', 'Caio']);
    rerender(<TailorTable caption="T" columns={columns} rows={[]} rowKey={(r) => r.id} />);
    expect(screen.getByText('Nenhum registro no período.').closest('td')).toHaveAttribute('colspan', '4');
    rerender(<TailorTable caption="T" columns={columns} rows={rows} rowKey={(r) => r.id} loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('em inglês: textos, número e moeda pelo provider', () => {
    render(
      <TailorLocaleProvider locale="en" currency="USD">
        <TailorTable caption="Agents" columns={columns} rows={rows} rowKey={(r) => r.id} pageSize={2} />
      </TailorLocaleProvider>,
    );
    expect(screen.getByText('$9,800.50')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent('Page 1 of 2 · 3 records');
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('formatValue: vazio vira hífen, data no idioma', () => {
    expect(formatValue(null)).toBe('-');
    expect(formatValue('2026-10-28T12:00:00', 'date')).toBe('28/10/2026');
    expect(formatValue('2026-10-28T12:00:00', 'date', 'en-US')).toBe('10/28/2026');
  });
  it('renderExpanded abre o detalhe embaixo da linha, na largura da tabela', () => {
    render(<TailorTable caption="Corretores" columns={columns} rows={rows} rowKey={(r) => r.id}
      renderExpanded={(r) => (r.id === 'a2' ? <p>Detalhe da Ana</p> : null)} />);
    const detalhe = screen.getByText('Detalhe da Ana').closest('td')!;
    expect(detalhe).toHaveAttribute('colspan', '4');
    expect(detalhe.closest('tr')).toHaveClass('tailor-table__expanded');
    expect(screen.getByText('Ana').closest('tr')).toHaveClass('tailor-table__row--open');
    expect(screen.queryAllByText(/Detalhe/)).toHaveLength(1);
  });
});

describe('TailorTable: correções da validação geral', () => {
  it('data "AAAA-MM-DD" mostra o próprio dia, em qualquer fuso', () => {
    // sem hora, o JS lê como UTC; em fuso negativo (Brasil) virava o dia anterior
    expect(formatValue('2026-10-28', 'date')).toBe('28/10/2026');
    expect(formatValue('2026-01-01', 'date')).toBe('01/01/2026');
  });

  it('número que chega como texto é formatado e ordenado como número', () => {
    expect(formatValue('12.5', 'currency')).toMatch(/R\$\s?12,50/);
    expect(formatValue('12 un', 'number')).toBe('12 un');
    type L = { id: string; valor: string };
    const linhas: L[] = [{ id: 'a', valor: '1.5' }, { id: 'b', valor: '1.25' }, { id: 'c', valor: '10' }];
    render(<TailorTable<L> caption="Valores" columns={[{ key: 'id', header: 'Id' }, { key: 'valor', header: 'Valor', type: 'number', sortable: true }]} rows={linhas} rowKey={(r) => r.id} defaultSort={{ key: 'valor', direction: 'asc' }} />);
    const ids = screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(ids).toEqual(['b', 'a', 'c']);
  });

  it('clique e Enter em botão dentro da célula não disparam o clique da linha', () => {
    const naLinha = vi.fn();
    const noBotao = vi.fn();
    type L = { id: string };
    render(<TailorTable<L> caption="Ações" columns={[{ key: 'id', header: 'Id' }, { key: 'acao', header: 'Ação', cell: () => <button type="button" onClick={noBotao}>Editar</button> }]} rows={[{ id: 'a' }]} rowKey={(r) => r.id} onRowClick={naLinha} />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.keyDown(screen.getByRole('button', { name: 'Editar' }), { key: 'Enter' });
    expect(noBotao).toHaveBeenCalledTimes(1);
    expect(naLinha).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('a'));
    expect(naLinha).toHaveBeenCalledTimes(1);
  });
});
