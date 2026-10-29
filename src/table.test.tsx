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

  it('formatValue: vazio vira traço, data no idioma', () => {
    expect(formatValue(null)).toBe('–');
    expect(formatValue('2026-10-28T12:00:00', 'date')).toBe('28/10/2026');
    expect(formatValue('2026-10-28T12:00:00', 'date', 'en-US')).toBe('10/28/2026');
  });
});
