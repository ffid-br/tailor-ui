import { useState } from 'react';
import { cn } from '../cn';

export type TailorMonogramProps = {
  /** Define a cor: o mesmo `id` tem a mesma cor em qualquer tela. */
  id: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  /** Foto. Quando existe (e carrega), vence as iniciais. */
  src?: string;
  className?: string;
};

/** Quantidade de cores da paleta (`--tailor-mono-N-*` no style.css). */
export const MONOGRAM_TONES = 8;

const PARTICULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du']);

/** Duas letras: primeira e última palavra do nome, sem "de/da/do". Uma palavra só dá as duas primeiras letras. */
export function monogramInitials(name: string): string {
  const palavras = name.trim().split(/\s+/).filter((p) => p && !PARTICULAS.has(p.toLowerCase()));
  const base = palavras.length ? palavras : name.trim().split(/\s+/).filter(Boolean);
  if (!base.length) return '?';
  const letras = (p: string) => Array.from(p.replace(/[^\p{L}\p{N}]/gu, ''));
  const primeira = letras(base[0]);
  const par = base.length > 1 ? [primeira[0], letras(base[base.length - 1])[0]] : primeira.slice(0, 2);
  return (par.filter(Boolean).join('') || '?').toLocaleUpperCase('pt-BR');
}

/** Índice estável (0 a 7) do `id`: hash FNV-1a, o mesmo em qualquer máquina. */
export function monogramTone(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 0x01000193);
  return (h >>> 0) % MONOGRAM_TONES;
}

/** Iniciais num quadrado de cor estável por `id`; com foto, mostra a foto. */
export function TailorMonogram({ id, name, size = 'md', src, className }: TailorMonogramProps) {
  const [falhou, setFalhou] = useState(false);
  const foto = src && !falhou;
  return (
    <span
      role="img"
      aria-label={name}
      className={cn('tailor-monogram', `tailor-monogram--${size}`, !foto && `tailor-monogram--tone-${monogramTone(id)}`, className)}
    >
      {foto
        ? <img src={src} alt="" className="tailor-monogram__img" onError={() => setFalhou(true)} />
        : <span aria-hidden="true">{monogramInitials(name)}</span>}
    </span>
  );
}
