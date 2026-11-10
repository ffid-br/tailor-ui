import React from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';

/*
 * Os outros efeitos de loading do brand guide (tailor.ia.br/brand, 12.5). Um efeito
 * por região: botão, tabela e seção podem carregar juntos, cada um com o seu.
 * O de tela inteira continua sendo o `TailorLoader`.
 */

const SPINNER = { sm: 'size-4 border-2', md: 'size-6 border-2', lg: 'size-9 border-[3px]', xl: 'size-14 border-4' } as const;

export type TailorSpinnerProps = {
  /** 16, 24, 36 ou 56 px. Padrão: `md` (24). */
  size?: keyof typeof SPINNER;
  /** Lido pelo leitor de tela. Padrão: o texto `loading` do idioma. */
  label?: string;
  className?: string;
};

/** Anel cinza com o quadrante verde: ação pontual e refresh. */
export function TailorSpinner({ size = 'md', label, className }: TailorSpinnerProps) {
  const { messages } = useTailorLocale();
  return <span role="status" aria-label={label ?? messages.loading} className={cn('tailor-spinner', SPINNER[size], className)} />;
}

export type TailorDotsProps = {
  /** Rótulo em overline ao lado ("Digitando"). Sem ele, o leitor de tela ouve o `loading` do idioma. */
  label?: string;
  className?: string;
};

/** Três pontos quadrados verdes: espera conversacional, agente digitando. */
export function TailorDots({ label, className }: TailorDotsProps) {
  const { messages } = useTailorLocale();
  return (
    <span role="status" aria-label={label ?? messages.loading} className={cn('tailor-dots', className)}>
      <i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
      {label && <span className="tailor-overline" aria-hidden="true">{label}</span>}
    </span>
  );
}

const PROGRESSO = { sm: 'h-1', md: 'h-2', lg: 'h-3' } as const;

export type TailorProgressProps = {
  /** 0 a 100. Sem ele, a barra é indeterminada (duração desconhecida). */
  value?: number;
  /** Altura 4, 8 ou 12 px. Padrão: `md` (8). */
  size?: keyof typeof PROGRESSO;
  /** Nome da barra para o leitor de tela. Padrão: o texto `loading` do idioma. */
  label?: string;
  className?: string;
};

/** Barra de progresso: trilho cinza e fill verde; sem `value`, um segmento varre o trilho. */
export function TailorProgress({ value, size = 'md', label, className }: TailorProgressProps) {
  const { messages } = useTailorLocale();
  const v = value === undefined ? undefined : Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label ?? messages.loading}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v === undefined ? undefined : Math.round(v)}
      className={cn('tailor-progress', PROGRESSO[size], v === undefined && 'tailor-progress--indeterminate', className)}
    >
      <span style={v === undefined ? undefined : { width: `${v}%` }} />
    </div>
  );
}

export type TailorBlindsProps = {
  /** O que aparece por trás das cortinas (em geral, o logotipo). */
  children?: React.ReactNode;
  /** Repete sem parar enquanto carrega. Sem ele, abre uma vez. */
  loop?: boolean;
  /** Lido pelo leitor de tela. Padrão: o texto `loading` do idioma. */
  label?: string;
  className?: string;
};

/** Oito cortinas verdes sobre o preto, abrindo de cima para baixo: carga inicial, momento de marca. */
export function TailorBlinds({ children, loop = false, label, className }: TailorBlindsProps) {
  const { messages } = useTailorLocale();
  return (
    <div role="status" aria-label={label ?? messages.loading} className={cn('tailor-blinds', loop && 'tailor-blinds--loop', className)}>
      {children}
      <span className="tailor-blinds__curtains" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 0.05).toFixed(2)}s` }} />)}
      </span>
    </div>
  );
}

export type TailorRefreshOverlayProps = {
  /** `true` enquanto o dado já exibido é atualizado. */
  active: boolean;
  /** Rótulo em overline abaixo do spinner. Padrão: o texto `loading` do idioma. */
  label?: string;
  children: React.ReactNode;
  className?: string;
};

/** Refresh de dado já na tela: véu de 75% com blur sobre o conteúdo, spinner e rótulo. O conteúdo fica, só não recebe clique. */
export function TailorRefreshOverlay({ active, label, children, className }: TailorRefreshOverlayProps) {
  const { messages } = useTailorLocale();
  return (
    <div className={cn('relative', className)} aria-busy={active}>
      {children}
      {active && (
        <div className="tailor-refresh-overlay" role="status">
          <span className="tailor-spinner size-6 border-2" aria-hidden="true" />
          <span className="tailor-overline">{label ?? messages.loading}</span>
        </div>
      )}
    </div>
  );
}
