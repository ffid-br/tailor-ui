import React, { useState } from 'react';
import { cn } from '../cn';
import { PontoMalha } from './PontoMalha';
import { TailorTypewriter } from './TailorTypewriter';
import { useTailorLocale } from '../i18n';

/**
 * Carregamento na identidade Tailor: o ponto verde e a malha Fibonacci.
 *
 * É a mesma linguagem da entrada depois do login: o ponto pisca no centro e a
 * malha se desenha a partir dele. No `overlay` é literalmente a entrada (o
 * `PontoMalha` sobre o preto); no `inline`/`box` o ponto corre uma espiral
 * Fibonacci deixando rastro verde. Com `success`, o ponto vira check. Quem pediu
 * menos movimento vê tudo parado — a informação é a mesma.
 *
 * - `inline`: ocupa o lugar do conteúdo (tabela, lista, card).
 * - `overlay`: tela inteira, bloqueia a interação.
 * - `compact`: uma linha só (botão, célula, rodapé de lista): ponto + rótulo.
 * - `box`: numa caixa própria de 377px, com fundo e borda.
 */

// Arestas Fibonacci da malha pequena (a da entrada vai até 440).
const ARESTAS = [5, 8, 13, 21, 34];
const RAIO = 34;
const QUADRANTES = [1, -1].flatMap((sx) => [1, -1].map((sy) => ({ sx, sy })));

export type TailorLoaderProps = {
  /** Rótulo principal. Padrão: o texto `loading` do idioma. */
  label?: string;
  /** Linha de apoio abaixo do rótulo (o que está sendo carregado, ou quanto falta). */
  detail?: React.ReactNode;
  /**
   * Arte do parceiro ou do cliente acima do loader (`inline` e `overlay`), para a
   * espera assinar com a marca dele. Ex.: `whitelabel.logos.rectangular_light`.
   */
  logo?: string;
  /** Arte para fundo escuro (tema escuro e `overlay`). Sem ela, vale `logo`. */
  logoDark?: string;
  /** Frases que o ponto escreve e apaga em ciclo, abaixo do rótulo ("Cruzando dados", "Quase lá"). */
  messages?: string[];
  /** Progresso real, 0 a 100. Mostra a barra e o número. Sem ele, só a animação. */
  progress?: number;
  /** Etapas da carga; só aparecem com `progress` (sem ele não há etapa atual). */
  steps?: string[];
  /**
   * `inline`: no lugar do conteúdo. `overlay`: tela inteira, bloqueia.
   * `compact`: uma linha (ponto + rótulo), para botões e listas.
   * `dot`: só o ponto, do tamanho da fonte (1em), no lugar de um ícone; o rótulo vai para o leitor de tela.
   * `box`: numa caixa própria de 377px, com fundo e borda — para painéis
   * estreitos e fundos com estampa (chat), onde o inline ficaria transparente.
   */
  /** `caixa` é o nome antigo de `box` (obsoleto). */
  variant?: 'inline' | 'overlay' | 'compact' | 'box' | 'dot' | 'caixa';
  /** Troca a corrida pelo sucesso animado (a malha nasce verde e o ponto vira check). Rótulo padrão: o texto `done` do idioma. */
  success?: boolean;
  /** Tira o respiro externo do `inline`/`box` (quem chama já tem espaçamento). */
  noPadding?: boolean;
  /** @deprecated use `noPadding`. */
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

/** Arte do parceiro: troca no tema escuro; se a imagem falhar, some. */
const Logo: React.FC<{ logo: string; logoDark?: string; escuro?: boolean }> = ({ logo, logoDark, escuro }) => {
  const [falhou, setFalhou] = useState(false);
  if (falhou) return null;
  const img = (src: string, cls: string) => <img src={src} alt="" className={cn('h-auto max-h-[89px] w-[233px] object-contain', cls)} onError={() => setFalhou(true)} />;
  if (escuro) return img(logoDark ?? logo, '');
  return logoDark ? <>{img(logo, 'dark:hidden')}{img(logoDark, 'hidden dark:block')}</> : img(logo, '');
};

/** Barra de progresso reta e as etapas (feita, atual com o ponto piscando, a fazer). */
const Progresso: React.FC<{ progresso: number; etapas?: string[]; escuro?: boolean }> = ({ progresso, etapas, escuro }) => {
  const p = Math.max(0, Math.min(100, progresso));
  const atual = etapas?.length ? Math.min(etapas.length - 1, Math.floor((p / 100) * etapas.length)) : -1;
  return (
    <div className="w-full max-w-[233px] text-left">
      <div className="mb-[5px] text-right font-[family-name:var(--tailor-font-num)] text-[13px] font-medium tabular-nums">{Math.round(p)}%</div>
      <div className={cn('h-[3px] w-full', escuro ? 'bg-white/15' : 'bg-black/10 dark:bg-white/15')}
        role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)}>
        <div className="h-full bg-tailor-green transition-[width] duration-300" style={{ width: `${p}%` }} />
      </div>
      {etapas && etapas.length > 0 && (
        <ul className="mt-[13px] grid gap-[5px] text-[13px]">
          {etapas.map((e, i) => (
            <li key={e} className={cn('flex items-center gap-[8px]', i === atual ? 'font-medium' : escuro ? 'text-white/60' : 'text-neutral-500 dark:text-neutral-400')}>
              <span aria-hidden="true" className={cn('block h-[8px] w-[8px] shrink-0',
                i < atual ? 'bg-tailor-green' : i === atual ? 'tailor-ponto-pisca bg-tailor-green' : escuro ? 'bg-white/20' : 'bg-black/15 dark:bg-white/20')} />
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Rotulo: React.FC<{ label: string; className?: string; sucesso?: boolean }> = ({ label, className, sucesso }) => (
  <p className={cn('font-medium', className)}>
    {label}
    {!sucesso && <span className="tailor-loader__reticencias" aria-hidden="true" />}
  </p>
);

/** Loader da marca (ponto verde e malha Fibonacci). Sempre expõe `role="status"` com o rótulo. */
export const TailorLoader: React.FC<TailorLoaderProps> = ({
  success: sucesso = false,
  label: rotulo,
  detail,
  logo,
  logoDark,
  progress: progresso,
  steps: etapas,
  messages: mensagens,
  variant = 'inline',
  noPadding,
  semRespiro: semRespiroAntigo,
  className,
}) => {
  const { messages: m } = useTailorLocale();
  const label = rotulo ?? (sucesso ? m.done : m.loading);
  const semRespiro = noPadding ?? semRespiroAntigo ?? false;
  if (variant === 'dot') {
    return (
      <span role="status" aria-label={label} className={cn('relative inline-block size-[1em] shrink-0 align-[-0.125em]', className)}>
        <span className="tailor-loader__dot absolute left-0 top-0 block size-[38.2%]" aria-hidden="true" />
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-[8px] text-sm text-black dark:text-white', className)}>
        {sucesso ? (
          <svg className="h-[13px] w-[13px] shrink-0 overflow-visible" viewBox="-12 -12 24 24" aria-hidden="true">
            <polyline className="tailor-loader__check stroke-tailor-green" points={CHECK} pathLength={1} fill="none" strokeWidth={5} strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        ) : (
          <span className="relative block h-[13px] w-[13px] shrink-0" aria-hidden="true">
            <span className="tailor-loader__volta absolute left-0 top-0 block h-[5px] w-[5px]" />
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
        {logo && (
          <div className="absolute inset-x-0 bottom-1/2 mb-[55px] flex justify-center px-[21px]">
            <Logo logo={logo} logoDark={logoDark} escuro />
          </div>
        )}
        <div role="status" aria-live="polite" className={cn('absolute inset-x-0 top-1/2 mt-[55px] flex flex-col items-center px-[21px] text-center', className)}>
          <Rotulo label={label} className="text-[26px] leading-[1.1]" />
          {detail && <div className="mt-[8px] text-base leading-[1.618] text-white/70">{detail}</div>}
          {mensagens?.length ? <TailorTypewriter texts={mensagens} className="mt-[8px] text-base text-white/70" /> : null}
          {progresso !== undefined && <div className="mt-[21px] flex w-full justify-center"><Progresso progresso={progresso} etapas={etapas} escuro /></div>}
        </div>
      </div>
    );
  }

  if (variant === 'box' || variant === 'caixa') {
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
            {detail && <div className="mt-[8px] text-[13px] text-neutral-600 dark:text-neutral-400">{detail}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full items-center justify-center', !semRespiro && 'px-[21px] py-[89px]')}>
      <div role="status" aria-live="polite" className={cn('flex flex-col items-center gap-[21px] text-center text-black dark:text-white', className)}>
        {logo && <Logo logo={logo} logoDark={logoDark} />}
        <Malha sucesso={sucesso} />
        <div>
          <Rotulo sucesso={sucesso} label={label} className="text-[26px] leading-[1.1]" />
          {detail && <div className="mt-[8px] text-base leading-[1.618] text-neutral-600 dark:text-neutral-400">{detail}</div>}
          {mensagens?.length && !sucesso ? <TailorTypewriter texts={mensagens} className="mt-[8px] block min-h-[1.618em] text-base text-neutral-600 dark:text-neutral-400" /> : null}
        </div>
        {progresso !== undefined && !sucesso && <Progresso progresso={progresso} etapas={etapas} />}
      </div>
    </div>
  );
};
