import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../cn';
import { TailorTypewriter } from './TailorTypewriter';

export type TailorResultProps = {
  status: 'success' | 'error';
  /** No sucesso, escrito pelo ponto letra a letra; no erro, aparece inteiro. */
  title: string;
  description?: React.ReactNode;
  /**
   * O botão que disparou a ação. O painel nasce do ponto no centro dele e
   * recolhe de volta para lá. Sem ele, o ponto fica no centro do painel.
   */
  origin?: React.RefObject<HTMLElement | null>;
  /** ms até recolher e chamar `onClose`. Padrão: 1600 no sucesso; no erro não fecha sozinho. `false` desliga. */
  closeAfter?: number | false;
  /** Chamado depois que o painel recolhe no ponto: feche o modal aqui. */
  onClose?: () => void;
  /** Botões abaixo do texto (ex.: "Tentar de novo" no erro). */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * O fim de um modal ou formulário. O ponto do botão cresce até cobrir o painel
 * com a cor do resultado, o ícone se desenha e o título aparece (escrito no
 * sucesso, de uma vez no erro, que precisa ser lido já). Depois tudo recolhe no
 * mesmo ponto e `onClose` fecha o modal. Cobre o pai, que precisa de
 * `position: relative`.
 */
export function TailorResult({ status, title, description, origin, closeAfter, onClose, actions, className }: TailorResultProps) {
  const [saindo, setSaindo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const espera = closeAfter ?? (status === 'success' ? 1600 : false);

  // Onde o ponto nasce: o centro do botão, em coordenadas do painel.
  useLayoutEffect(() => {
    const el = ref.current;
    const o = origin?.current;
    if (!el || !o) return;
    const r = el.getBoundingClientRect();
    const b = o.getBoundingClientRect();
    el.style.setProperty('--tailor-result-x', `${b.left + b.width / 2 - r.left}px`);
    el.style.setProperty('--tailor-result-y', `${b.top + b.height / 2 - r.top}px`);
  }, [origin]);

  useEffect(() => {
    if (espera === false) return;
    const t = setTimeout(() => setSaindo(true), espera);
    return () => clearTimeout(t);
  }, [espera]);

  // A saída dura 0,618s; fecha no tempo (sem depender de animationend, que não vem com menos movimento).
  useEffect(() => {
    if (!saindo) return;
    const t = setTimeout(() => onClose?.(), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saindo]);

  return (
    <div
      ref={ref}
      role={status === 'error' ? 'alert' : 'status'}
      className={cn('tailor-result', `tailor-result--${status}`, saindo && 'tailor-result--leaving', className)}
    >
      <svg className="tailor-result__icon" viewBox="-12 -12 24 24" aria-hidden="true">
        {status === 'success'
          ? <polyline className="tailor-loader__check" points="-11,0 -4,7 11,-8" pathLength={1} fill="none" strokeWidth={3} strokeLinecap="square" />
          : <path className="tailor-loader__check" d="M-8 -8L8 8M8 -8L-8 8" pathLength={1} fill="none" strokeWidth={3} strokeLinecap="square" />}
      </svg>
      <p className="tailor-result__title">{status === 'success' ? <TailorTypewriter texts={[title]} once /> : title}</p>
      {description && <div className="tailor-result__description">{description}</div>}
      {actions && <div className="tailor-result__actions">{actions}</div>}
    </div>
  );
}
