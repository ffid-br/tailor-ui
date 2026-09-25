import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import logoBranco from '../assets/tailor-logo-branco.png';

const EASE = [0.16, 1, 0.3, 1] as const;
// Tempos em potências de φ: 0,236 · 0,382 · 0,618 · 1 · 1,618 · 2,618.
const PHI = { a: 0.236, b: 0.382, c: 0.618, d: 1, e: 1.618, f: 2.618 };
// Arestas acumuladas: o quadrado do ponto (8px) duplica em Fibonacci.
const ARESTAS = [8, 16, 24, 40, 64, 104, 168, 272, 440];
const QUADRANTES = [1, -1].flatMap((sx) => [1, -1].map((sy) => ({ sx, sy })));

export type CinematicIntroProps = {
  /** Chamado ao fim da abertura, no "Pular" ou de imediato com menos movimento. */
  onComplete: () => void;
  overline?: string;
  slogan?: string;
  skipLabel?: string;
  /** Nome do produto abaixo da marca (ex.: "Pilot"). Omitido: só a marca. */
  produto?: string;
  /** Logo branca no lugar do wordmark Tailor.ia (whitelabel). */
  logo?: string;
  /** Duração da barra de progresso, em segundos. Padrão: φ³ (4,236s). */
  duration?: number;
};

/**
 * Abertura na identidade Tailor: a expansão a partir da origem. O ponto verde
 * aparece, a malha nasce dele em Fibonacci e a marca entra depois. Preto,
 * branco e um verde; sem glow, sem blur, sem bounce. Use dentro de
 * `<AnimatePresence>` para o fade de saída.
 */
export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onComplete,
  overline = 'Alfaiataria digital',
  slogan = 'Tecnologia sob medida para a sua operação',
  skipLabel = 'Pular',
  produto,
  logo = logoBranco,
  duration = 4.236,
}) => {
  const reduzir = useReducedMotion();

  // Quem pediu menos movimento não assiste à abertura.
  useEffect(() => {
    if (reduzir) onComplete();
  }, [reduzir, onComplete]);

  if (reduzir) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: PHI.c, ease: EASE }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black font-tailor text-white"
    >
      {/* A malha: quatro quadrantes espelhados a partir do ponto áureo da tela (38,2% do topo). */}
      <svg aria-hidden="true" className="absolute left-1/2 top-[38.2%] h-[200vmax] w-[200vmax] -translate-x-1/2 -translate-y-1/2 stroke-white/15" viewBox="-440 -440 880 880">
        {QUADRANTES.map(({ sx, sy }, q) =>
          ARESTAS.map((p, i) => (
            <React.Fragment key={`${q}-${p}`}>
              <motion.line
                x1={0} y1={sy * p} x2={sx * 440} y2={sy * p} strokeWidth={0.6}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: PHI.c + i * PHI.a * PHI.b, duration: PHI.e, ease: EASE }}
              />
              <motion.line
                x1={sx * p} y1={0} x2={sx * p} y2={sy * 440} strokeWidth={0.6}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: PHI.c + i * PHI.a * PHI.b, duration: PHI.e, ease: EASE }}
              />
            </React.Fragment>
          ))
        )}
        {/* O ponto: aparece primeiro e cede o centro para a marca, que já traz o verde no ".ia". */}
        <motion.rect
          x={-4} y={-4} width={8} height={8} className="fill-tailor-green stroke-none"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 1, 1, 1.6], opacity: [1, 1, 1, 0] }}
          transition={{ delay: PHI.a, duration: PHI.e, times: [0, PHI.b, PHI.c + PHI.a, 1], ease: EASE }}
        />
      </svg>

      <motion.div
        aria-hidden="true"
        className="tailor-intro__vinheta absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: PHI.e - PHI.a, duration: PHI.c, ease: EASE }}
      />

      <div className="absolute left-1/2 top-[38.2%] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center px-[21px] text-center">
        <motion.img
          src={logo}
          alt="Tailor.ia"
          className="h-[68px] w-auto sm:h-[110px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: PHI.e - PHI.a, duration: PHI.d, ease: EASE }}
        />
        {produto && (
          <motion.p
            className="mt-[13px] text-[26px] font-semibold leading-none text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: PHI.e, duration: PHI.c, ease: EASE }}
          >
            {produto}
          </motion.p>
        )}
        <motion.p
          className="mt-[55px] flex items-center gap-[8px] text-[11px] font-medium uppercase tracking-[0.14em] text-tailor-green"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: PHI.f - PHI.b, duration: PHI.c, ease: EASE }}
        >
          <span className="inline-block h-2 w-2 bg-tailor-green" aria-hidden="true" /> {overline}
        </motion.p>
        <motion.p
          className="mt-[13px] max-w-[377px] text-base leading-[1.618] text-white/75 sm:max-w-[610px] sm:text-[26px] sm:leading-[1.382]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: PHI.f, duration: PHI.c, ease: EASE }}
        >
          {slogan}
        </motion.p>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="absolute bottom-[34px] right-[34px] border border-white/30 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white hover:text-black focus:outline-none focus-visible:ring-[3px] focus-visible:ring-tailor-green/60"
      >
        {skipLabel}
      </button>

      {/* Barra de progresso: linear, como o manual pede para progresso. */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-1 origin-left bg-tailor-green"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration, ease: 'linear' }}
        onAnimationComplete={() => setTimeout(onComplete, PHI.b * 1000)}
      />
    </motion.div>
  );
};
