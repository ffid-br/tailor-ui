import React from 'react';
import { cn } from '../cn';

/**
 * Carregamento na identidade Tailor: a fita métrica.
 *
 * Não é spinner de propósito: carregar é "tirar as medidas". A régua traz a
 * sequência de Fibonacci impressa e o verde percorre a fita com o ponto
 * quadrado na ponta, num ciclo de φ segundos. Quem pediu menos movimento vê a
 * régua parada, medida pela metade, e o texto — a informação é a mesma.
 *
 * - `inline`: ocupa o lugar do conteúdo (tabela, lista, card).
 * - `overlay`: tela inteira, bloqueia a interação.
 * - `compact`: uma linha só (botão, célula, rodapé de lista), sem a régua.
 */

const MARCAS = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
// Tracinhos entre as marcas: 4 por intervalo, como numa fita de costura.
const TRACOS_POR_INTERVALO = 4;

export type TailorLoaderProps = {
  /** Rótulo principal. Padrão: "Tirando as medidas". */
  label?: string;
  /** Linha de apoio abaixo do rótulo (o que está sendo carregado, ou quanto falta). */
  detail?: string;
  /**
   * `inline`: no lugar do conteúdo. `overlay`: tela inteira, bloqueia.
   * `compact`: uma linha (fio curto + rótulo), para botões e listas.
   * `caixa`: a régua numa caixa própria de 377px, com fundo e borda — para painéis
   * estreitos e fundos com estampa (chat), onde o inline ficaria transparente.
   */
  variant?: 'inline' | 'overlay' | 'compact' | 'caixa';
  /** Tira o respiro externo do `inline`/`caixa` (quem chama já tem espaçamento). */
  semRespiro?: boolean;
  className?: string;
};

const Fita: React.FC<{ onDark: boolean }> = ({ onDark }) => {
  const total = (MARCAS.length - 1) * TRACOS_POR_INTERVALO;
  const traco = onDark ? 'bg-white' : 'bg-black dark:bg-white';
  return (
    <div className="tailor-fita relative w-full select-none" aria-hidden="true">
      <div className="relative h-[55px]">
        {Array.from({ length: total + 1 }, (_, i) => {
          const principal = i % TRACOS_POR_INTERVALO === 0;
          const meio = i % (TRACOS_POR_INTERVALO / 2) === 0;
          return (
            <span
              key={i}
              className={cn('absolute top-0 w-px', traco, principal ? 'h-[34px] opacity-100' : meio ? 'h-[21px] opacity-60' : 'h-[13px] opacity-35')}
              style={{ left: `${(i / total) * 100}%` }}
            />
          );
        })}
        {MARCAS.map((n, i) => (
          <span
            key={n}
            className={cn(
              'absolute top-[38px] -translate-x-1/2 font-tailor-num text-[13px] font-medium leading-[13px] tabular-nums',
              onDark ? 'text-white/70' : 'text-neutral-500 dark:text-white/70',
              i === 0 && 'translate-x-0',
              i === MARCAS.length - 1 && '-translate-x-full',
            )}
            style={{ left: `${(i / (MARCAS.length - 1)) * 100}%` }}
          >
            {n}
          </span>
        ))}
      </div>
      {/* A medida: faixa verde que corre a fita, com o ponto na ponta. */}
      <div className={cn('relative mt-[8px] h-[8px]', onDark ? 'bg-white/15' : 'bg-neutral-200 dark:bg-white/15')}>
        <div className="tailor-fita__medida absolute inset-y-0 left-0 bg-tailor-green">
          <span className="absolute -right-[6px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 bg-tailor-green" />
        </div>
      </div>
    </div>
  );
};

/** Loader da marca (fita métrica). Sempre expõe `role="status"` com o rótulo. */
export const TailorLoader: React.FC<TailorLoaderProps> = ({
  label = 'Tirando as medidas',
  detail,
  variant = 'inline',
  semRespiro = false,
  className,
}) => {
  if (variant === 'compact') {
    return (
      <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-[8px] text-sm text-black dark:text-white', className)}>
        <span className="relative block h-[3px] w-[34px] bg-neutral-200 dark:bg-white/15" aria-hidden="true">
          <span className="tailor-fita__medida absolute inset-y-0 left-0 bg-tailor-green" />
        </span>
        <span>
          {label}
          <span className="tailor-fita__reticencias" aria-hidden="true" />
        </span>
      </span>
    );
  }

  const overlay = variant === 'overlay';
  const corpo = (
    <div
      role="status"
      aria-live="polite"
      className={cn('mx-auto flex w-full max-w-[610px] flex-col items-start gap-[34px]', overlay ? 'text-white' : 'text-black dark:text-white', className)}
    >
      <Fita onDark={overlay} />
      <div>
        <p className={cn('font-medium leading-[1.1]', overlay ? 'text-[42px]' : 'text-[26px]')}>
          {label}
          <span className="tailor-fita__reticencias" aria-hidden="true" />
        </p>
        {detail && (
          <p className={cn('mt-[8px] text-base leading-[1.618]', overlay ? 'text-white/70' : 'text-neutral-600 dark:text-neutral-400')}>{detail}</p>
        )}
      </div>
    </div>
  );

  if (variant === 'caixa') {
    return (
      <div className={cn('flex w-full items-center justify-center', !semRespiro && 'px-[13px] py-[34px]')}>
        <div
          role="status"
          aria-live="polite"
          className={cn('w-full max-w-[377px] border border-neutral-200 bg-white p-[21px] text-black dark:border-white/10 dark:bg-neutral-950 dark:text-white', className)}
        >
          <Fita onDark={false} />
          <p className="mt-[21px] text-base font-medium leading-[1.382]">
            {label}
            <span className="tailor-fita__reticencias" aria-hidden="true" />
          </p>
          {detail && <p className="mt-[8px] text-[13px] text-neutral-600 dark:text-neutral-400">{detail}</p>}
        </div>
      </div>
    );
  }

  if (!overlay) {
    return <div className={cn('flex w-full items-center justify-center', !semRespiro && 'px-[21px] py-[89px]')}>{corpo}</div>;
  }
  return (
    <div className="fixed inset-0 z-[1000] flex cursor-wait items-center justify-center bg-black/90 px-[21px]" aria-modal="true" role="dialog">
      {corpo}
    </div>
  );
};
