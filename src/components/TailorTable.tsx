import React, { useMemo, useState } from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';
import { TailorSkeleton } from './TailorSkeleton';

/** Como o valor aparece e se alinha. `percent` recebe fração (0,123 = 12,3%). */
export type TailorColumnType = 'text' | 'number' | 'currency' | 'percent' | 'date' | 'id';

export type TailorTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  type?: TailorColumnType;
  /** Valor para ordenar e formatar. Padrão: `row[key]`. */
  value?: (row: T) => unknown;
  /** Célula própria (badge, link). Sem ela, o valor formatado pelo `type`. */
  cell?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string;
  /** Linha de total: um valor pronto ou uma conta sobre as linhas (todas, não só a página). */
  total?: React.ReactNode | ((rows: T[]) => unknown);
};

export type TailorTableSort = { key: string; direction: 'asc' | 'desc' };

export type TailorTableProps<T> = {
  columns: Array<TailorTableColumn<T>>;
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  /** Título acessível da tabela (vira `<caption>`, só para leitor de tela). */
  caption: string;
  loading?: boolean;
  /** O que aparece sem linhas. Padrão: o texto `empty` do idioma. */
  empty?: React.ReactNode;
  /** Ordem controlada (servidor). Sem `onSortChange`, a tabela ordena sozinha. */
  sort?: TailorTableSort;
  onSortChange?: (sort: TailorTableSort) => void;
  defaultSort?: TailorTableSort;
  /** Paginação no navegador. */
  pageSize?: number;
  /** Paginação no servidor: a tabela só mostra as `rows` que recebeu. */
  pagination?: { page: number; totalPages: number; onPageChange: (page: number) => void; totalRows?: number };
  onRowClick?: (row: T) => void;
  /** Cabeçalho preso ao rolar a página. */
  stickyHeader?: boolean;
  className?: string;
};

const formatadores = new Map<string, { format: (v: never) => string }>();
function formatador<F extends { format: (v: never) => string }>(chave: string, criar: () => F): F {
  let f = formatadores.get(chave) as F | undefined;
  if (!f) { f = criar(); formatadores.set(chave, f); }
  return f;
}

/** Formata pelo tipo da coluna; vazio vira traço. */
export function formatValue(v: unknown, type: TailorColumnType = 'text', locale = 'pt-BR', currency = 'BRL'): React.ReactNode {
  if (v === null || v === undefined || v === '') return '–';
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (type === 'currency') return formatador(`c${locale}${currency}`, () => new Intl.NumberFormat(locale, { style: 'currency', currency })).format(v);
    if (type === 'percent') return formatador(`p${locale}`, () => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 })).format(v);
    if (type === 'number') return formatador(`n${locale}`, () => new Intl.NumberFormat(locale)).format(v);
  }
  if (type === 'date') {
    const d = v instanceof Date ? v : new Date(String(v));
    return Number.isNaN(d.getTime()) ? String(v) : formatador(`d${locale}`, () => new Intl.DateTimeFormat(locale)).format(d);
  }
  return React.isValidElement(v) ? v : String(v);
}

const NUMERICO: TailorColumnType[] = ['number', 'currency', 'percent'];
const ler = <T,>(c: TailorTableColumn<T>, r: T) => (c.value ? c.value(r) : (r as Record<string, unknown>)[c.key]);

function comparar(a: unknown, b: unknown, locale: string) {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: 'base' });
}

/**
 * Tabela de relatório: cabeçalho em overline, números tabulares à direita, IDs
 * em mono, ordenação, paginação (navegador ou servidor) e linha de total.
 * Visual por variáveis `--tailor-brand-*` e `--tailor-table-*`, como o cabeçalho.
 */
export function TailorTable<T>({
  columns, rows, rowKey, caption, loading = false, empty,
  sort, onSortChange, defaultSort, pageSize, pagination, onRowClick, stickyHeader = false, className,
}: TailorTableProps<T>) {
  const { locale, currency, messages: m } = useTailorLocale();
  const [ordemLocal, setOrdemLocal] = useState<TailorTableSort | undefined>(defaultSort);
  const [paginaLocal, setPaginaLocal] = useState(1);
  const ordemAtual = onSortChange ? sort : ordemLocal;

  const ordenadas = useMemo(() => {
    if (onSortChange || !ordemAtual) return rows;
    const col = columns.find((c) => c.key === ordemAtual.key);
    if (!col) return rows;
    const sinal = ordemAtual.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => sinal * comparar(ler(col, a), ler(col, b), locale));
  }, [rows, columns, ordemAtual, onSortChange, locale]);

  const totalPaginasLocal = pageSize ? Math.max(1, Math.ceil(ordenadas.length / pageSize)) : 1;
  const pagina = Math.min(paginaLocal, totalPaginasLocal);
  const visiveis = pageSize && !pagination ? ordenadas.slice((pagina - 1) * pageSize, pagina * pageSize) : ordenadas;

  const ordenar = (key: string) => {
    const proxima: TailorTableSort = ordemAtual?.key === key && ordemAtual.direction === 'asc'
      ? { key, direction: 'desc' } : { key, direction: 'asc' };
    if (onSortChange) onSortChange(proxima);
    else { setOrdemLocal(proxima); setPaginaLocal(1); }
  };

  const fmt = (v: unknown, type?: TailorColumnType) => formatValue(v, type, locale, currency);
  const alinhamento = (c: TailorTableColumn<T>) => c.align ?? (NUMERICO.includes(c.type ?? 'text') ? 'right' : 'left');
  const temTotal = columns.some((c) => c.total !== undefined);
  const pag = pagination ?? (pageSize && totalPaginasLocal > 1
    ? { page: pagina, totalPages: totalPaginasLocal, onPageChange: setPaginaLocal, totalRows: rows.length }
    : undefined);

  return (
    <div className={cn('tailor-table', className)}>
      <div className="tailor-table__scroll">
        <table aria-busy={loading || undefined}>
          <caption className="tailor-table__caption">{caption}</caption>
          <thead className={cn(stickyHeader && 'tailor-table__sticky')}>
            <tr>
              {columns.map((c) => {
                const ativa = ordemAtual?.key === c.key;
                return (
                  <th key={c.key} scope="col" style={{ width: c.width }}
                    className={`tailor-table--${alinhamento(c)}`}
                    aria-sort={ativa ? (ordemAtual!.direction === 'asc' ? 'ascending' : 'descending') : undefined}>
                    {c.sortable ? (
                      <button type="button" className="tailor-table__sort" onClick={() => ordenar(c.key)}>
                        {c.header}
                        <span className={cn('tailor-table__arrow', ativa && 'tailor-table__arrow--active')} aria-hidden="true">
                          {ativa && ordemAtual!.direction === 'desc' ? '↓' : '↑'}
                        </span>
                      </button>
                    ) : c.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length}><TailorSkeleton shape="table" columns={columns.length} lines={Math.min(pageSize ?? 5, 8)} /></td></tr>
            ) : visiveis.length === 0 ? (
              <tr><td colSpan={columns.length} className="tailor-table__state">{empty ?? m.empty}</td></tr>
            ) : visiveis.map((r, i) => (
              <tr key={rowKey(r, i)}
                className={cn(onRowClick && 'tailor-table__clickable')}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(r); } : undefined}
                tabIndex={onRowClick ? 0 : undefined}>
                {columns.map((c) => (
                  <td key={c.key} className={cn(`tailor-table--${alinhamento(c)}`, c.type === 'id' && 'tailor-table__id')}>
                    {c.cell ? c.cell(r) : fmt(ler(c, r), c.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {temTotal && !loading && rows.length > 0 && (
            <tfoot>
              <tr>
                {columns.map((c, i) => (
                  <td key={c.key} className={`tailor-table--${alinhamento(c)}`}>
                    {typeof c.total === 'function'
                      ? fmt((c.total as (rs: T[]) => unknown)(rows), c.type)
                      : c.total ?? (i === 0 ? m.total : null)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {pag && (
        <nav className="tailor-table__pagination" aria-label={m.pagination}>
          <span>
            {m.page(pag.page, pag.totalPages)}
            {pag.totalRows !== undefined && <> · {m.rows(String(fmt(pag.totalRows, 'number')))}</>}
          </span>
          <span className="tailor-table__pages">
            <button type="button" disabled={pag.page <= 1} onClick={() => pag.onPageChange(pag.page - 1)}>{m.previous}</button>
            <button type="button" disabled={pag.page >= pag.totalPages} onClick={() => pag.onPageChange(pag.page + 1)}>{m.next}</button>
          </span>
        </nav>
      )}
    </div>
  );
}

/** Soma de uma coluna, para usar em `total`. */
export const sumBy = <T,>(value: (r: T) => number) => (rows: T[]) => rows.reduce((s, r) => s + (value(r) || 0), 0);
