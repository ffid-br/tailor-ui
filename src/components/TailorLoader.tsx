import React from 'react';
import { cn } from '../cn';
import { PontoMalha } from './PontoMalha';

/**
 * Carregamento na identidade Tailor: o ponto verde e a malha Fibonacci.
 *
 * É a mesma linguagem da entrada depois do login: o ponto pisca no centro e a
 * malha se desenha a partir dele. No `overlay` é literalmente a entrada (o
 * `PontoMalha` sobre o preto); no `inline`/`caixa` o ponto corre uma espiral
 * Fibonacci deixando rastro verde. Com `sucesso`, o ponto vira check. Quem pediu
 * menos movimento vê tudo parado — a informação é a mesma.
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
  /** Troca a corrida pelo sucesso animado (a malha nasce verde e o ponto vira check). Rótulo padrão: "Pronto". */
  sucesso?: boolean;
  /** Tira o respiro externo do `inline`/`caixa` (quem chama já tem espaçamento). */
  semRespiro?: boolean;
  className?: string;
};

// O caminho do ponto: espiral quadrada com trechos Fibonacci (3, 5, 8, 13, 21, 34) saindo do centro.
const ESPIRAL = 'M0 0h3v-5h-8v13h21v-34';
const CHECK = '-11,0 -4,7 11,-8';

/**
 * Malha pequena. Carregando: o ponto corre a espiral deixando o rastro verde,
 * pulsa na chegada e volta ao centro. Sucesso: a malha nasce verde do ponto e o
 * ponto vira o check.
 */
const Malha: React.FC<{ sucesso?: boolean }> = ({ sucesso }) => (
  <div className="relative h-[89px] w-[89px] shrink-0" aria-hidden="true">
    <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`${-RAIO} ${-RAIO} ${RAIO * 2} ${RAIO * 2}`}>
      <g className={cn('stroke-black/15 dark:stroke-white/15', sucesso && 'tailor-loader__ok-malha stroke-tailor-green')}>
        {QUADRANTES.map(({ sx, sy }) =>
          ARESTAS.map((p, i) => (
            <React.Fragment key={`${sx}${sy}${p}`}>
              <line className={cn(sucesso && 'tailor-malha__linha')} style={sucesso ? { animationDelay: `${i * 0.05}s` } : undefined} pathLength={1} strokeWidth={0.5} x1={0} y1={sy * p} x2={sx * RAIO} y2={sy * p} />
              <line className={cn(sucesso && 'tailor-malha__linha')} style={sucesso ? { animationDelay: `${i * 0.05}s` } : undefined} pathLength={1} strokeWidth={0.5} x1={sx * p} y1={0} x2={sx * p} y2={sy * RAIO} />
            </React.Fragment>
          ))
        )}
      </g>
      {sucesso ? (
        <>
          <rect className="tailor-loader__ok-ponto fill-tailor-green" x={-3} y={-3} width={6} height={6} />
          <polyline className="tailor-loader__check stroke-tailor-green" points={CHECK} pathLength={1} fill="none" strokeWidth={4} strokeLinecap="square" strokeLinejoin="miter" />
        </>
      ) : (
        <>
          <path className="tailor-loader__rastro stroke-tailor-green" d={ESPIRAL} pathLength={1} fill="none" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" />
          <rect className="tailor-loader__corredor fill-tailor-green" x={-3} y={-3} width={6} height={6} />
        </>
      )}
    </svg>
  </div>
);

const Rotulo: React.FC<{ label: string; className?: string; sucesso?: boolean }> = ({ label, className, sucesso }) => (
  <p className={cn('font-medium', className)}>
    {label}
    {!sucesso && <span className="tailor-loader__reticencias" aria-hidden="true" />}
  </p>
);

/** Loader da marca (ponto verde e malha Fibonacci). Sempre expõe `role="status"` com o rótulo. */
export const TailorLoader: React.FC<TailorLoaderProps> = ({
  sucesso = false,
  label = sucesso ? 'Pronto' : 'Carregando',
  detail,
  variant = 'inline',
  semRespiro = false,
  className,
}) => {
  if (variant === 'compact') {
    return (
      <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-[8px] text-sm text-black dark:text-white', className)}>
        {sucesso ? (
          <svg className="h-[13px] w-[13px] shrink-0 overflow-visible" viewBox="-12 -12 24 24" aria-hidden="true">
            <polyline className="tailor-loader__check stroke-tailor-green" points={CHECK} pathLength={1} fill="none" strokeWidth={5} strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        ) : (
          <span className="relative block h-[13px] w-[13px] shrink-0" aria-hidden="true">
            <span className="tailor-loader__volta absolute left-0 top-0 block h-[5px] w-[5px] bg-tailor-green" />
          </span>
        )}
        <span>
          {label}
          {!sucesso && <span className="tailor-loader__reticencias" aria-hidden="true" />}
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
          <Malha sucesso={sucesso} />
          <div className="min-w-0">
            <Rotulo sucesso={sucesso} label={label} className="text-base leading-[1.382]" />
            {detail && <p className="mt-[8px] text-[13px] text-neutral-600 dark:text-neutral-400">{detail}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full items-center justify-center', !semRespiro && 'px-[21px] py-[89px]')}>
      <div role="status" aria-live="polite" className={cn('flex flex-col items-center gap-[21px] text-center text-black dark:text-white', className)}>
        <Malha sucesso={sucesso} />
        <div>
          <Rotulo sucesso={sucesso} label={label} className="text-[26px] leading-[1.1]" />
          {detail && <p className="mt-[8px] text-base leading-[1.618] text-neutral-600 dark:text-neutral-400">{detail}</p>}
        </div>
      </div>
    </div>
  );
};
