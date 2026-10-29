import { useEffect, useState } from 'react';
import { cn } from '../cn';

export type TailorTypewriterProps = {
  /** Frases em ciclo: escreve, espera, apaga, escreve a próxima. Uma frase só repete. */
  texts: string[];
  /** Escreve a primeira e para (o cursor some). Para títulos de aviso. */
  once?: boolean;
  /** Chamado quando `once` termina de escrever. */
  onDone?: () => void;
  className?: string;
};

const ESCREVE_MS = 55;
const APAGA_MS = 21;
const ESPERA_MS = 1618;

const semMovimento = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * O ponto da marca como cursor: escreve a frase, pisca, apaga e escreve a
 * próxima. O leitor de tela recebe a frase inteira, não letra por letra; quem
 * pediu menos movimento vê a frase pronta.
 */
export function TailorTypewriter({ texts, once = false, onDone, className }: TailorTypewriterProps) {
  const parado = semMovimento();
  const [i, setI] = useState(0);
  const [n, setN] = useState(parado ? (texts[0]?.length ?? 0) : 0);
  const [apagando, setApagando] = useState(false);
  const texto = texts[i % Math.max(texts.length, 1)] ?? '';
  const terminou = once && n >= texto.length;

  useEffect(() => {
    if (parado) { if (once) onDone?.(); return; }
    if (terminou) { onDone?.(); return; }
    let t: ReturnType<typeof setTimeout>;
    if (!apagando) {
      t = n < texto.length ? setTimeout(() => setN(n + 1), ESCREVE_MS) : setTimeout(() => setApagando(true), ESPERA_MS);
    } else if (n > 0) {
      t = setTimeout(() => setN(n - 1), APAGA_MS);
    } else {
      t = setTimeout(() => { setApagando(false); setI((v) => v + 1); }, ESCREVE_MS * 4);
    }
    return () => clearTimeout(t);
    // onDone fica fora: trocar a função não reinicia a escrita.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, apagando, texto, terminou, parado, once]);

  return (
    <span className={cn('tailor-typewriter', className)}>
      <span className="tailor-typewriter__sr">{texto}</span>
      <span aria-hidden="true">
        {texto.slice(0, n)}
        {!terminou && !(parado && once) && <span className="tailor-typewriter__cursor tailor-ponto-pisca" />}
      </span>
    </span>
  );
}
