import React, { forwardRef } from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';

export type TailorButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** `primary`: a ação da vista (uma por tela). `secondary`: contorno. `ghost`: sem borda. `dark`: preto. `danger`: excluir. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Ícone à esquerda. Sem `children`, o botão vira quadrado (passe `aria-label`). */
  icon?: React.ReactNode;
  /** Trocando o ícone pelo ponto correndo; o botão fica ocupado (`aria-busy`) e não aceita clique. */
  loading?: boolean;
  /** Texto enquanto carrega ("Salvando"). Sem ele, o texto não muda. */
  loadingText?: React.ReactNode;
  /** Mostra o check no lugar do ícone (ex.: "Salvo" por um instante). */
  done?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
};

/**
 * Botão da marca: cantos retos, um primário por vista. Carregando, o ícone vira
 * o ponto correndo (o mesmo do `TailorLoader`); concluído, vira o check. Use o
 * `ref` como `origin` do `TailorResult` para o resultado nascer do botão.
 * A cor do primário segue `--tailor-brand-primary` (a marca do cliente).
 */
export const TailorButton = forwardRef<HTMLButtonElement, TailorButtonProps>(function TailorButton(
  { variant = 'primary', size = 'md', icon, loading = false, loadingText, done = false, fullWidth, children, className, disabled, type = 'button', onClick, ...rest },
  ref,
) {
  const { messages } = useTailorLocale();
  const soIcone = !children && !loadingText;
  const marca = loading ? (
    <span className="tailor-btn__dot" aria-hidden="true"><span /></span>
  ) : done ? (
    <svg className="tailor-btn__check" viewBox="-12 -12 24 24" aria-hidden="true">
      <polyline className="tailor-loader__check" points="-11,0 -4,7 11,-8" pathLength={1} fill="none" strokeWidth={4} strokeLinecap="square" />
    </svg>
  ) : icon ? (
    <span className="tailor-btn__icon" aria-hidden="true">{icon}</span>
  ) : null;
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={loading ? undefined : onClick}
      className={cn(
        'tailor-btn', `tailor-btn--${variant}`, `tailor-btn--${size}`,
        soIcone && 'tailor-btn--icon-only', fullWidth && 'tailor-btn--full', loading && 'tailor-btn--loading', className,
      )}
      {...rest}
    >
      {marca}
      {loading && loadingText ? loadingText : children}
      {loading && soIcone && <span className="tailor-btn__sr">{messages.loading}</span>}
    </button>
  );
});
