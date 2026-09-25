import React from 'react';
import { cn } from '../cn';
import logoPadraoClaro from '../assets/tailor-logo.png';
import logoPadraoEscuro from '../assets/tailor-logo-branco.png';

export type TailorBrandMarkProps = {
  /** Nome do produto ao lado do wordmark (ex.: "Conta", "Pilot", "Genius"). */
  produto: string;
  /** Barra recolhida: só a palavra — o wordmark reduzido vira borrão. */
  compact?: boolean;
  /**
   * Superfície escura que NÃO segue o tema (ex.: menu sempre preto). Sem isso,
   * a troca claro/escuro segue a variante `dark:` do app.
   */
  onDark?: boolean;
  /** Logo para fundo claro (whitelabel). Padrão: wordmark Tailor.ia. */
  logoClaro?: string;
  /** Logo para fundo escuro (whitelabel). Padrão: wordmark Tailor.ia branco. */
  logoEscuro?: string;
  className?: string;
};

/**
 * Lockup dos apps Tailor: wordmark com 21px de arte + nome do produto em 18px
 * semibold (tailor-ink no claro, branco no escuro). As logos padrão vêm
 * embutidas no pacote; passe `logoClaro`/`logoEscuro` para a marca do cliente.
 */
export const TailorBrandMark: React.FC<TailorBrandMarkProps> = ({
  produto,
  compact = false,
  onDark = false,
  logoClaro,
  logoEscuro,
  className,
}) => {
  const personalizada = Boolean(logoClaro || logoEscuro);
  const claro = logoClaro ?? logoEscuro ?? logoPadraoClaro;
  const escuro = logoEscuro ?? logoClaro ?? logoPadraoEscuro;
  const palavra = (
    <span
      className={cn(
        'font-tailor font-semibold leading-none tracking-tight',
        compact ? 'text-sm' : 'text-lg',
        onDark ? 'text-white' : 'text-tailor-ink dark:text-white',
      )}
    >
      {produto}
    </span>
  );
  if (compact) return <span className={cn('inline-flex items-center', className)}>{palavra}</span>;
  const img = 'h-[21px] w-auto max-w-[144px] object-contain';
  return (
    <span className={cn('inline-flex items-center gap-2', className)} aria-label={personalizada ? produto : `Tailor.ia ${produto}`}>
      {onDark ? (
        <img src={escuro} alt="" className={img} />
      ) : (
        <>
          <img src={claro} alt="" className={cn(img, 'dark:hidden')} />
          <img src={escuro} alt="" className={cn(img, 'hidden dark:block')} />
        </>
      )}
      {palavra}
    </span>
  );
};
