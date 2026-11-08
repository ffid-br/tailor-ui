import React from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';
import { formatValue } from './TailorTable';
import { TailorSkeleton } from './TailorSkeleton';

export type TailorStatFormat = 'number' | 'currency' | 'percent' | 'text';

export type TailorStatProps = {
  /** O que o número mede, em palavras de quem lê ("Respostas"). */
  label: string;
  value: number | string | null | undefined;
  /** `percent` recebe fração (0,3 = 30%). Padrão: `number` se o valor for número, senão `text`. */
  format?: TailorStatFormat;
  /** Valor do período anterior: a variação percentual e a direção saem daqui. */
  previous?: number;
  /** Variação já calculada (fração: 0,12 = +12%). Vence `previous`. */
  delta?: number;
  /** Meta na mesma unidade do valor: mostra quanto falta e a barra de avanço. */
  goal?: number;
  /** Uma linha em português simples ("de cada 10 que leram, 3 responderam"). */
  meaning?: string;
  /** Subir é bom ou ruim? Define a cor da variação (custo por lead: `down`). Padrão: `up`. */
  goodWhen?: 'up' | 'down';
  /** Nota curta de rodapé (período, fonte). */
  hint?: string;
  loading?: boolean;
  /** `compact`: rótulo, valor e variação em coluna enxuta. `inline`: tudo numa linha, para frases e cabeçalhos. */
  variant?: 'default' | 'compact' | 'inline';
  onClick?: () => void;
  href?: string;
  className?: string;
};

export type TailorStatDirection = 'up' | 'down' | 'flat';
export type TailorStatDelta = { ratio: number; direction: TailorStatDirection };

/** Variação (fração) entre o valor e o anterior. Sem base (anterior 0 ou ausente) não há percentual: devolve `null`. */
export function statDelta(value: number, previous: number): TailorStatDelta | null {
  if (!Number.isFinite(value) || !Number.isFinite(previous) || previous === 0) return null;
  const ratio = (value - previous) / Math.abs(previous);
  // Abaixo de 0,05% o arredondamento mostraria 0,0%: é estável.
  return { ratio, direction: Math.abs(ratio) < 0.0005 ? 'flat' : ratio > 0 ? 'up' : 'down' };
}

const FRASE = { up: 'Subiu', down: 'Caiu', flat: 'Ficou estável' } as const;

const Seta = ({ direction }: { direction: TailorStatDirection }) => (
  <svg className="tailor-stat__arrow" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="square">
    {direction === 'up' && <path d="M6 10V2M2.5 5.5L6 2l3.5 3.5" />}
    {direction === 'down' && <path d="M6 2v8M2.5 6.5L6 10l3.5-3.5" />}
    {direction === 'flat' && <path d="M2 6h8" />}
  </svg>
);

/**
 * Um número com contexto: de onde veio, se melhorou, quanto falta para a meta e
 * o que ele quer dizer. A variação nunca depende só da cor: tem seta, sinal e
 * texto para o leitor de tela.
 */
export function TailorStat({ label, value, format, previous, delta, goal, meaning, goodWhen = 'up', hint, loading, variant = 'default', onClick, href, className }: TailorStatProps) {
  const { locale, currency } = useTailorLocale();
  const tipo: TailorStatFormat = format ?? (typeof value === 'number' ? 'number' : 'text');
  const fmt = (v: number | string | null | undefined) => formatValue(v, tipo === 'text' ? 'text' : tipo, locale, currency);
  const pct = (r: number, sinal: boolean) =>
    new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1, signDisplay: sinal ? 'exceptZero' : 'never' }).format(r);

  const variacao: TailorStatDelta | null =
    delta !== undefined && Number.isFinite(delta)
      ? { ratio: delta, direction: Math.abs(delta) < 0.0005 ? 'flat' : delta > 0 ? 'up' : 'down' }
      : typeof value === 'number' && previous !== undefined ? statDelta(value, previous) : null;
  const tom = !variacao || variacao.direction === 'flat' ? 'neutral' : variacao.direction === goodWhen ? 'good' : 'bad';

  const avanco = goal && typeof value === 'number' && goal > 0 ? Math.max(0, value / goal) : null;

  const corpo = loading ? (
    <TailorSkeleton shape="text" lines={2} label={`${label}: carregando`} />
  ) : (
    <>
      <span className="tailor-stat__label">{label}</span>
      <span className="tailor-stat__main">
        <span className="tailor-stat__value">{fmt(value)}</span>
        {variacao && (
          <span className={cn('tailor-stat__delta', `tailor-stat__delta--${tom}`)}>
            <Seta direction={variacao.direction} />
            <span aria-hidden="true">{pct(variacao.ratio, true)}</span>
            <span className="tailor-stat__sr">
              {variacao.direction === 'flat'
                ? 'Ficou estável em relação ao período anterior'
                : `${FRASE[variacao.direction]} ${pct(variacao.ratio, false)} em relação ao período anterior, ${tom === 'good' ? 'o que é bom' : 'o que é ruim'}`}
            </span>
          </span>
        )}
      </span>
      {variante(variant) && variacao && previous !== undefined && <span className="tailor-stat__sub">Antes: {fmt(previous)}</span>}
      {variante(variant) && avanco !== null && (
        <span className="tailor-stat__goal">
          <span className="tailor-stat__goal-text">Meta {fmt(goal)} · {pct(avanco, false)}</span>
          <span className="tailor-stat__goal-track" role="progressbar" aria-label={`Avanço da meta de ${label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(avanco * 100))}>
            <span className="tailor-stat__goal-fill" style={{ width: `${Math.min(100, avanco * 100)}%` }} />
          </span>
        </span>
      )}
      {variant !== 'inline' && meaning && <span className="tailor-stat__meaning">{meaning}</span>}
      {variant !== 'inline' && hint && <span className="tailor-stat__hint">{hint}</span>}
    </>
  );

  const cls = cn('tailor-stat', `tailor-stat--${variant}`, (onClick || href) && 'tailor-stat--action', className);
  if (href) return <a href={href} onClick={onClick} className={cls} aria-busy={loading || undefined}>{corpo}</a>;
  if (onClick) return <button type="button" onClick={onClick} className={cls} aria-busy={loading || undefined}>{corpo}</button>;
  const Tag = variant === 'inline' ? 'span' : 'div'; // inline cabe dentro de um <p>
  return <Tag className={cls} aria-busy={loading || undefined}>{corpo}</Tag>;
}

// Só o `default` mostra o "Antes" e a meta; o compacto e o inline guardam o essencial.
const variante = (v: TailorStatProps['variant']) => v === 'default' || v === undefined;

export type TailorStatGroupProps = {
  children: React.ReactNode;
  /** Largura mínima de cada indicador. Padrão: 200. */
  minWidth?: number;
  /** Contorno em cada indicador. Padrão: sem, só um fio entre eles. */
  bordered?: boolean;
  /** Nome do grupo para o leitor de tela. */
  label?: string;
  className?: string;
};

/** Indicadores lado a lado: quebram de linha sozinhos conforme a largura. Sem cartões por padrão. */
export function TailorStatGroup({ children, minWidth = 200, bordered = false, label, className }: TailorStatGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('tailor-stat-group', bordered && 'tailor-stat-group--bordered', className)}
      style={{ ['--tailor-stat-min' as string]: `${minWidth}px` }}
    >
      {children}
    </div>
  );
}
