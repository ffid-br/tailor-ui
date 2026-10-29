import React from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';

export type TailorSkeletonProps = {
  /** `text`: parágrafo. `block`: um retângulo (gráfico, imagem). `table`: linhas e colunas. `cards`: indicadores lado a lado. */
  shape?: 'text' | 'block' | 'table' | 'cards';
  /** Linhas do texto ou da tabela, ou quantidade de cartões. */
  lines?: number;
  /** Colunas da tabela. */
  columns?: number;
  /** Altura do `block`. Padrão: 144px. */
  height?: string;
  /** Lido pelo leitor de tela. Padrão: o texto `loading` do idioma. */
  label?: string;
  className?: string;
};

// Larguras na proporção áurea, para o texto falso não parecer régua.
const LARGURAS = ['100%', '89%', '61.8%'];

/**
 * O lugar do conteúdo enquanto ele chega: barras cinza retas e a linha verde
 * varrendo de cima a baixo. Sem gradiente nem cantos (manual da marca).
 */
export function TailorSkeleton({ shape = 'text', lines, columns = 4, height = '144px', label, className }: TailorSkeletonProps) {
  const { messages } = useTailorLocale();
  const barra = (largura: string, key: React.Key, extra?: string) => (
    <span key={key} className={cn('tailor-skeleton__bar', extra)} style={{ width: largura }} />
  );
  let corpo: React.ReactNode;
  if (shape === 'block') corpo = <span className="tailor-skeleton__bar" style={{ height }} />;
  else if (shape === 'table') {
    corpo = Array.from({ length: (lines ?? 5) + 1 }, (_, l) => (
      <span key={l} className={cn('tailor-skeleton__row', l === 0 && 'tailor-skeleton__row--header')} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }, (_, c) => barra(l === 0 ? '55%' : LARGURAS[(l + c) % 3], c))}
      </span>
    ));
  } else if (shape === 'cards') {
    corpo = (
      <span className="tailor-skeleton__cards">
        {Array.from({ length: lines ?? 3 }, (_, i) => (
          <span key={i} className="tailor-skeleton__card">
            {barra('34%', 'r', 'tailor-skeleton__bar--thin')}
            {barra('61.8%', 'v', 'tailor-skeleton__bar--thick')}
            {barra('89%', 'd', 'tailor-skeleton__bar--thin')}
          </span>
        ))}
      </span>
    );
  } else {
    const n = lines ?? 3;
    corpo = Array.from({ length: n }, (_, i) => barra(i === n - 1 ? '61.8%' : LARGURAS[i % 2], i));
  }
  return (
    <div role="status" aria-busy="true" className={cn('tailor-skeleton', className)}>
      <span className="tailor-skeleton__label">{label ?? messages.loading}</span>
      {corpo}
    </div>
  );
}
