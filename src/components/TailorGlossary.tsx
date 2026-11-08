import React, { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../cn';

export type TailorGlossaryProps = {
  /** A palavra como aparece no texto. */
  term: React.ReactNode;
  /** A explicação, em uma ou duas frases. */
  children: React.ReactNode;
  className?: string;
};

/**
 * Termo técnico dentro de uma frase, com a explicação num balão. Abre ao passar o mouse,
 * ao tocar ou com Enter/Espaço; Esc, tocar fora ou sair do termo fecha. O balão fica fora
 * do fluxo (position: absolute), então o texto em volta não se mexe.
 */
export function TailorGlossary({ term, children, className }: TailorGlossaryProps) {
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: Event) => { if (!ref.current?.contains(e.target as Node)) setAberto(false); };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [aberto]);

  return (
    <span
      ref={ref}
      className={cn('tailor-glossary', className)}
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
    >
      <button
        type="button"
        className="tailor-glossary__term"
        aria-describedby={id}
        aria-expanded={aberto}
        onClick={() => setAberto((a) => !a)}
        onBlur={() => setAberto(false)}
        onKeyDown={(e) => { if (e.key === 'Escape' && aberto) { e.stopPropagation(); setAberto(false); } }}
      >
        {term}
      </button>
      <span id={id} role="tooltip" className="tailor-glossary__tip" data-open={aberto ? 'true' : 'false'}>{children}</span>
    </span>
  );
}
