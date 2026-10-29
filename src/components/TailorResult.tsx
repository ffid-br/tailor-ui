import React, { useEffect, useState } from 'react';
import { cn } from '../cn';
import { TailorTypewriter } from './TailorTypewriter';

export type TailorResultProps = {
  status: 'success' | 'error';
  /** Escrito pelo ponto, letra a letra. */
  title: string;
  description?: React.ReactNode;
  /** ms até recolher e chamar `onClose`. Padrão: 2400 no sucesso; no erro não fecha sozinho. `false` desliga. */
  closeAfter?: number | false;
  /** Chamado depois que o painel recolhe no ponto: feche o modal aqui. */
  onClose?: () => void;
  /** Botões abaixo do texto (ex.: "Tentar de novo" no erro). */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * O fim de um modal ou formulário: a cor do resultado varre o painel inteiro,
 * o ícone se desenha, o título é escrito; depois tudo recolhe no ponto e
 * `onClose` fecha o modal. Cobre o pai, que precisa de `position: relative`.
 */
export function TailorResult({ status, title, description, closeAfter, onClose, actions, className }: TailorResultProps) {
  const [saindo, setSaindo] = useState(false);
  const espera = closeAfter ?? (status === 'success' ? 2400 : false);

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
      role={status === 'error' ? 'alert' : 'status'}
      className={cn('tailor-result', `tailor-result--${status}`, saindo && 'tailor-result--leaving', className)}
    >
      <svg className="tailor-result__icon" viewBox="-12 -12 24 24" aria-hidden="true">
        {status === 'success'
          ? <polyline className="tailor-loader__check" points="-11,0 -4,7 11,-8" pathLength={1} fill="none" strokeWidth={3} strokeLinecap="square" />
          : <path className="tailor-loader__check" d="M-8 -8L8 8M8 -8L-8 8" pathLength={1} fill="none" strokeWidth={3} strokeLinecap="square" />}
      </svg>
      <p className="tailor-result__title"><TailorTypewriter texts={[title]} once /></p>
      {description && <div className="tailor-result__description">{description}</div>}
      {actions && <div className="tailor-result__actions">{actions}</div>}
    </div>
  );
}
