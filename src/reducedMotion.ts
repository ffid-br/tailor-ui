import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';
const agora = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;

/** Lê a preferência "menos movimento" na hora (para decidir, por exemplo, o tipo de rolagem). */
export const prefersReducedMotion = agora;

/** A preferência "menos movimento" do sistema, acompanhando mudanças. */
export function useReducedMotion() {
  const [reduzir, setReduzir] = useState(agora);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(QUERY);
    const on = () => setReduzir(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduzir;
}
