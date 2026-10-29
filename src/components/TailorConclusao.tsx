import React, { useEffect, useState } from 'react';
import { cn } from '../cn';
import { TailorDigitando } from './TailorDigitando';

export type TailorConclusaoProps = {
  tipo: 'sucesso' | 'erro';
  /** Escrito pelo ponto, letra a letra. */
  titulo: string;
  detalhe?: React.ReactNode;
  /** ms até recolher e chamar `aoFechar`. Padrão: 2400 no sucesso; no erro não fecha sozinho. `false` desliga. */
  fecharEm?: number | false;
  /** Chamado depois que o painel recolhe no ponto: feche o modal aqui. */
  aoFechar?: () => void;
  /** Botões abaixo do texto (ex.: "Tentar de novo" no erro). */
  acoes?: React.ReactNode;
  className?: string;
};

/**
 * O fim de um modal ou formulário: a cor do resultado varre o painel inteiro,
 * o ícone se desenha, o título é escrito; depois tudo recolhe no ponto e
 * `aoFechar` fecha o modal. Cobre o pai, que precisa de `position: relative`.
 */
export function TailorConclusao({ tipo, titulo, detalhe, fecharEm, aoFechar, acoes, className }: TailorConclusaoProps) {
  const [saindo, setSaindo] = useState(false);
  const espera = fecharEm ?? (tipo === 'sucesso' ? 2400 : false);

  useEffect(() => {
    if (espera === false) return;
    const t = setTimeout(() => setSaindo(true), espera);
    return () => clearTimeout(t);
  }, [espera]);

  // Sem animação (menos movimento, ou jsdom), o animationend não vem: fecha no tempo.
  useEffect(() => {
    if (!saindo) return;
    const t = setTimeout(() => aoFechar?.(), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saindo]);

  return (
    <div
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={cn('tailor-conclusao', `tailor-conclusao--${tipo}`, saindo && 'tailor-conclusao--saindo', className)}
    >
      <svg className="tailor-conclusao__icone" viewBox="-12 -12 24 24" aria-hidden="true">
        {tipo === 'sucesso'
          ? <polyline className="tailor-loader__check" points="-11,0 -4,7 11,-8" pathLength={1} fill="none" strokeWidth={3} strokeLinecap="square" />
          : <path className="tailor-loader__check" d="M-8 -8L8 8M8 -8L-8 8" pathLength={1} fill="none" strokeWidth={3} strokeLinecap="square" />}
      </svg>
      <p className="tailor-conclusao__titulo"><TailorDigitando textos={[titulo]} umaVez /></p>
      {detalhe && <div className="tailor-conclusao__detalhe">{detalhe}</div>}
      {acoes && <div className="tailor-conclusao__acoes">{acoes}</div>}
    </div>
  );
}
