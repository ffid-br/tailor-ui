import React from 'react';
import { cn } from '../cn';
import { PontoMalha } from './PontoMalha';

/**
 * Carregamento na identidade Tailor: o ponto verde e a malha Fibonacci.
 *
 * É a mesma linguagem da entrada depois do login: o ponto pisca no centro e a
 * malha se desenha a partir dele. No `overlay` é literalmente a entrada (o
 * `PontoMalha` sobre o preto); no `inline`/`caixa` é uma malha pequena que se
 * desenha e some em ciclo de 2φ segundos. Quem pediu menos movimento vê a malha
 * já desenhada e o ponto parado — a informação é a mesma.
 *
 * - `inline`: ocupa o lugar do conteúdo (tabela, lista, card).
 * - `overlay`: tela inteira, bloqueia a interação.
 * - `compact`: uma linha só (botão, célula, rodapé de lista): ponto + rótulo.
 * - `caixa`: numa caixa própria de 377px, com fundo e borda.
 */

// Arestas Fibonacci da malha pequena (a da entrada vai até 440).
const ARESTAS = [5, 8, 13, 21, 34];
const RAIO = 34;
const QUADRANTES = [1, -1].flatMap((sx) => [1, -1].map((sy) => ({ sx, sy })));

export type TailorLoaderProps = {
  /** Rótulo principal. Padrão: "Carregando". */
  label?: string;
  /** Linha de apoio abaixo do rótulo (o que está sendo carregado, ou quanto falta). */
  detail?: string;
  /**
   * `inline`: no lugar do conteúdo. `overlay`: tela inteira, bloqueia.
   * `compact`: uma linha (ponto + rótulo), para botões e listas.
   * `caixa`: numa caixa própria de 377px, com fundo e borda — para painéis
   * estreitos e fundos com estampa (chat), onde o inline ficaria transparente.
   */
  variant?: 'inline' | 'overlay' | 'compact' | 'caixa';
  /** Tira o respiro externo do `inline`/`caixa` (quem chama já tem espaçamento). */
  semRespiro?: boolean;
  className?: string;
};

/** Malha pequena: linhas Fibonacci que nascem do ponto, desenham e somem. */
const Malha: React.FC = () => (
  <div className="relative h-[89px] w-[89px] shrink-0" aria-hidden="true">
    <svg className="absolute inset-0 h-full w-full stroke-black/25 dark:stroke-white/25" viewBox={`${-RAIO} ${-RAIO} ${RAIO * 2} ${RAIO * 2}`}>
      {QUADRANTES.map(({ sx, sy }) =>
        ARESTAS.map((p, i) => (
          <React.Fragment key={`${sx}${sy}${p}`}>
            <line className="tailor-malha__linha" style={{ animationDelay: `${i * 0.08}s` }} pathLength={1} strokeWidth={0.5} x1={0} y1={sy * p} x2={sx * RAIO} y2={sy * p} />
            <line className="tailor-malha__linha" style={{ animationDelay: `${i * 0.08}s` }} pathLength={1} strokeWidth={0.5} x1={sx * p} y1={0} x2={sx * p} y2={sy * RAIO} />
          </React.Fragment>
        ))
      )}
    </svg>
    <span className="tailor-ponto-pisca absolute left-1/2 top-1/2 block h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 bg-tailor-green" />
  </div>
);

const Rotulo: React.FC<{ label: string; className?: string }> = ({ label, className }) => (
  <p className={cn('font-medium', className)}>
    {label}
    <span className="tailor-loader__reticencias" aria-hidden="true" />
  </p>
);

/** Loader da marca (ponto verde e malha Fibonacci). Sempre expõe `role="status"` com o rótulo. */
export const TailorLoader: React.FC<TailorLoaderProps> = ({
  label = 'Carregando',
  detail,
  variant = 'inline',
  semRespiro = false,
  className,
}) => {
  if (variant === 'compact') {
    return (
      <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-[8px] text-sm text-black dark:text-white', className)}>
        <span className="tailor-ponto-pisca block h-[8px] w-[8px] shrink-0 bg-tailor-green" aria-hidden="true" />
        <span>
          {label}
          <span className="tailor-loader__reticencias" aria-hidden="true" />
        </span>
      </span>
    );
  }

  if (variant === 'overlay') {
    // A entrada do login: preto, ponto no centro, malha nascendo; o texto fica abaixo do ponto.
    return (
      <div className="fixed inset-0 z-[1000] cursor-wait bg-black text-white" aria-modal="true" role="dialog">
        <PontoMalha />
        <div role="status" aria-live="polite" className={cn('absolute inset-x-0 top-1/2 mt-[55px] px-[21px] text-center', className)}>
          <Rotulo label={label} className="text-[26px] leading-[1.1]" />
          {detail && <p className="mt-[8px] text-base leading-[1.618] text-white/70">{detail}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'caixa') {
    return (
      <div className={cn('flex w-full items-center justify-center', !semRespiro && 'px-[13px] py-[34px]')}>
        <div
          role="status"
          aria-live="polite"
          className={cn('flex w-full max-w-[377px] items-center gap-[21px] border border-neutral-200 bg-white p-[21px] text-black dark:border-white/10 dark:bg-neutral-950 dark:text-white', className)}
        >
          <Malha />
          <div className="min-w-0">
            <Rotulo label={label} className="text-base leading-[1.382]" />
            {detail && <p className="mt-[8px] text-[13px] text-neutral-600 dark:text-neutral-400">{detail}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full items-center justify-center', !semRespiro && 'px-[21px] py-[89px]')}>
      <div role="status" aria-live="polite" className={cn('flex flex-col items-center gap-[21px] text-center text-black dark:text-white', className)}>
        <Malha />
        <div>
          <Rotulo label={label} className="text-[26px] leading-[1.1]" />
          {detail && <p className="mt-[8px] text-base leading-[1.618] text-neutral-600 dark:text-neutral-400">{detail}</p>}
        </div>
      </div>
    </div>
  );
};
