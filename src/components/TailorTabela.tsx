import React, { useMemo, useState } from 'react';
import { cn } from '../cn';
import { TailorLoader } from './TailorLoader';

/** Como o valor aparece e se alinha. `percentual` recebe fração (0,123 = 12,3%). */
export type TipoDaColuna = 'texto' | 'numero' | 'moeda' | 'percentual' | 'data' | 'id';

export type TailorTabelaColuna<T> = {
  chave: string;
  titulo: React.ReactNode;
  tipo?: TipoDaColuna;
  /** Valor para ordenar e formatar. Padrão: `linha[chave]`. */
  valor?: (linha: T) => unknown;
  /** Célula própria (badge, link). Sem ela, o valor formatado pelo `tipo`. */
  celula?: (linha: T) => React.ReactNode;
  alinhar?: 'esquerda' | 'centro' | 'direita';
  ordenavel?: boolean;
  largura?: string;
  /** Linha de total: um valor pronto ou uma conta sobre as linhas (todas, não só a página). */
  total?: React.ReactNode | ((linhas: T[]) => unknown);
};

export type TailorTabelaOrdem = { chave: string; direcao: 'asc' | 'desc' };

export type TailorTabelaProps<T> = {
  colunas: Array<TailorTabelaColuna<T>>;
  linhas: T[];
  chaveDaLinha: (linha: T, indice: number) => string | number;
  /** Título acessível da tabela (vira `<caption>`, só para leitor de tela). */
  legenda: string;
  carregando?: boolean;
  /** O que aparece sem linhas. Padrão: "Nenhum registro no período." */
  vazio?: React.ReactNode;
  /** Ordem controlada (servidor). Sem `aoOrdenar`, a tabela ordena sozinha. */
  ordem?: TailorTabelaOrdem;
  aoOrdenar?: (ordem: TailorTabelaOrdem) => void;
  ordemInicial?: TailorTabelaOrdem;
  /** Paginação no navegador. */
  porPagina?: number;
  /** Paginação no servidor: a tabela só mostra as `linhas` que recebeu. */
  paginacao?: { pagina: number; totalPaginas: number; aoMudar: (pagina: number) => void; totalRegistros?: number };
  aoClicarLinha?: (linha: T) => void;
  /** Cabeçalho preso ao rolar a página. */
  cabecalhoFixo?: boolean;
  className?: string;
};

const NUMERO = new Intl.NumberFormat('pt-BR');
const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PERCENTUAL = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
const DATA = new Intl.DateTimeFormat('pt-BR');

/** Formata pelo tipo da coluna; vazio vira traço. */
export function formatarValor(v: unknown, tipo: TipoDaColuna = 'texto'): React.ReactNode {
  if (v === null || v === undefined || v === '') return '–';
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (tipo === 'moeda') return MOEDA.format(v);
    if (tipo === 'percentual') return PERCENTUAL.format(v);
    if (tipo === 'numero') return NUMERO.format(v);
  }
  if (tipo === 'data') {
    const d = v instanceof Date ? v : new Date(String(v));
    return Number.isNaN(d.getTime()) ? String(v) : DATA.format(d);
  }
  return React.isValidElement(v) ? v : String(v);
}

const NUMERICO: TipoDaColuna[] = ['numero', 'moeda', 'percentual'];
const ler = <T,>(c: TailorTabelaColuna<T>, l: T) => (c.valor ? c.valor(l) : (l as Record<string, unknown>)[c.chave]);

function comparar(a: unknown, b: unknown) {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

/**
 * Tabela de relatório: cabeçalho em overline, números tabulares à direita, IDs
 * em mono, ordenação, paginação (navegador ou servidor) e linha de total.
 * Visual por variáveis `--tailor-marca-*` e `--tailor-tabela-*`, como o cabeçalho.
 */
export function TailorTabela<T>({
  colunas, linhas, chaveDaLinha, legenda, carregando = false, vazio = 'Nenhum registro no período.',
  ordem, aoOrdenar, ordemInicial, porPagina, paginacao, aoClicarLinha, cabecalhoFixo = false, className,
}: TailorTabelaProps<T>) {
  const [ordemLocal, setOrdemLocal] = useState<TailorTabelaOrdem | undefined>(ordemInicial);
  const [paginaLocal, setPaginaLocal] = useState(1);
  const ordemAtual = aoOrdenar ? ordem : ordemLocal;

  const ordenadas = useMemo(() => {
    if (aoOrdenar || !ordemAtual) return linhas;
    const col = colunas.find((c) => c.chave === ordemAtual.chave);
    if (!col) return linhas;
    const sinal = ordemAtual.direcao === 'asc' ? 1 : -1;
    return [...linhas].sort((a, b) => sinal * comparar(ler(col, a), ler(col, b)));
  }, [linhas, colunas, ordemAtual, aoOrdenar]);

  const totalPaginasLocal = porPagina ? Math.max(1, Math.ceil(ordenadas.length / porPagina)) : 1;
  const pagina = Math.min(paginaLocal, totalPaginasLocal);
  const visiveis = porPagina && !paginacao ? ordenadas.slice((pagina - 1) * porPagina, pagina * porPagina) : ordenadas;

  const ordenar = (chave: string) => {
    const proxima: TailorTabelaOrdem = ordemAtual?.chave === chave && ordemAtual.direcao === 'asc'
      ? { chave, direcao: 'desc' } : { chave, direcao: 'asc' };
    if (aoOrdenar) aoOrdenar(proxima);
    else { setOrdemLocal(proxima); setPaginaLocal(1); }
  };

  const alinhamento = (c: TailorTabelaColuna<T>) => c.alinhar ?? (NUMERICO.includes(c.tipo ?? 'texto') ? 'direita' : 'esquerda');
  const temTotal = colunas.some((c) => c.total !== undefined);
  const pag = paginacao ?? (porPagina && totalPaginasLocal > 1
    ? { pagina, totalPaginas: totalPaginasLocal, aoMudar: setPaginaLocal, totalRegistros: linhas.length }
    : undefined);

  return (
    <div className={cn('tailor-tabela', className)}>
      <div className="tailor-tabela__rolagem">
        <table aria-busy={carregando || undefined}>
          <caption className="tailor-tabela__legenda">{legenda}</caption>
          <thead className={cn(cabecalhoFixo && 'tailor-tabela__fixo')}>
            <tr>
              {colunas.map((c) => {
                const ativa = ordemAtual?.chave === c.chave;
                return (
                  <th key={c.chave} scope="col" style={{ width: c.largura }}
                    className={`tailor-tabela--${alinhamento(c)}`}
                    aria-sort={ativa ? (ordemAtual!.direcao === 'asc' ? 'ascending' : 'descending') : undefined}>
                    {c.ordenavel ? (
                      <button type="button" className="tailor-tabela__ordenar" onClick={() => ordenar(c.chave)}>
                        {c.titulo}
                        <span className={cn('tailor-tabela__seta', ativa && 'tailor-tabela__seta--ativa')} aria-hidden="true">
                          {ativa && ordemAtual!.direcao === 'desc' ? '↓' : '↑'}
                        </span>
                      </button>
                    ) : c.titulo}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={colunas.length} className="tailor-tabela__estado"><TailorLoader variant="compact" /></td></tr>
            ) : visiveis.length === 0 ? (
              <tr><td colSpan={colunas.length} className="tailor-tabela__estado">{vazio}</td></tr>
            ) : visiveis.map((l, i) => (
              <tr key={chaveDaLinha(l, i)}
                className={cn(aoClicarLinha && 'tailor-tabela__clicavel')}
                onClick={aoClicarLinha ? () => aoClicarLinha(l) : undefined}
                onKeyDown={aoClicarLinha ? (e) => { if (e.key === 'Enter') aoClicarLinha(l); } : undefined}
                tabIndex={aoClicarLinha ? 0 : undefined}>
                {colunas.map((c) => (
                  <td key={c.chave} className={cn(`tailor-tabela--${alinhamento(c)}`, c.tipo === 'id' && 'tailor-tabela__id')}>
                    {c.celula ? c.celula(l) : formatarValor(ler(c, l), c.tipo)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {temTotal && !carregando && linhas.length > 0 && (
            <tfoot>
              <tr>
                {colunas.map((c, i) => (
                  <td key={c.chave} className={`tailor-tabela--${alinhamento(c)}`}>
                    {typeof c.total === 'function'
                      ? formatarValor((c.total as (ls: T[]) => unknown)(linhas), c.tipo)
                      : c.total ?? (i === 0 ? 'Total' : null)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {pag && (
        <nav className="tailor-tabela__paginacao" aria-label="Paginação">
          <span>
            Página {pag.pagina} de {pag.totalPaginas}
            {pag.totalRegistros !== undefined && <> · {NUMERO.format(pag.totalRegistros)} registros</>}
          </span>
          <span className="tailor-tabela__paginas">
            <button type="button" disabled={pag.pagina <= 1} onClick={() => pag.aoMudar(pag.pagina - 1)}>Anterior</button>
            <button type="button" disabled={pag.pagina >= pag.totalPaginas} onClick={() => pag.aoMudar(pag.pagina + 1)}>Próxima</button>
          </span>
        </nav>
      )}
    </div>
  );
}

/** Soma de uma coluna, para usar em `total`. */
export const somar = <T,>(valor: (l: T) => number) => (linhas: T[]) => linhas.reduce((s, l) => s + (valor(l) || 0), 0);
