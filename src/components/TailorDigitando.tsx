import { useEffect, useState } from 'react';
import { cn } from '../cn';

export type TailorDigitandoProps = {
  /** Frases em ciclo: escreve, espera, apaga, escreve a próxima. Uma frase só repete. */
  textos: string[];
  /** Escreve a primeira e para (o cursor some). Para títulos de aviso. */
  umaVez?: boolean;
  /** Chamado quando `umaVez` termina de escrever. */
  aoTerminar?: () => void;
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
export function TailorDigitando({ textos, umaVez = false, aoTerminar, className }: TailorDigitandoProps) {
  const parado = semMovimento();
  const [i, setI] = useState(0);
  const [n, setN] = useState(parado ? (textos[0]?.length ?? 0) : 0);
  const [apagando, setApagando] = useState(false);
  const texto = textos[i % Math.max(textos.length, 1)] ?? '';
  const terminou = umaVez && n >= texto.length;

  useEffect(() => {
    if (parado) { if (umaVez) aoTerminar?.(); return; }
    if (terminou) { aoTerminar?.(); return; }
    let t: ReturnType<typeof setTimeout>;
    if (!apagando) {
      t = n < texto.length ? setTimeout(() => setN(n + 1), ESCREVE_MS) : setTimeout(() => setApagando(true), ESPERA_MS);
    } else if (n > 0) {
      t = setTimeout(() => setN(n - 1), APAGA_MS);
    } else {
      t = setTimeout(() => { setApagando(false); setI((v) => v + 1); }, ESCREVE_MS * 4);
    }
    return () => clearTimeout(t);
    // aoTerminar fica fora: trocar a função não reinicia a escrita.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, apagando, texto, terminou, parado, umaVez]);

  return (
    <span className={cn('tailor-digitando', className)}>
      <span className="tailor-digitando__leitor">{texto}</span>
      <span aria-hidden="true">
        {texto.slice(0, n)}
        {!terminou && !(parado && umaVez) && <span className="tailor-digitando__cursor tailor-ponto-pisca" />}
      </span>
    </span>
  );
}
