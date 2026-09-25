import React from 'react';
import { motion } from 'framer-motion';

const ARESTAS = [8, 16, 24, 40, 64, 104, 168, 272, 440];
const EASE = [0.16, 1, 0.3, 1] as const;
const QUADRANTES = [1, -1].flatMap((sx) => [1, -1].map((sy) => ({ sx, sy })));

export type PontoMalhaProps = {
  /** Desenha a malha Fibonacci nascendo do ponto. Padrão: true. */
  malha?: boolean;
};

/**
 * O ponto verde piscando no centro do preto, com a malha Fibonacci nascendo
 * dele (a mesma da intro). Ocupa o contêiner posicionado mais próximo
 * (`absolute inset-0`); o fundo preto é de quem o usa.
 */
export function PontoMalha({ malha = true }: PontoMalhaProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {malha && (
        <svg className="absolute left-1/2 top-1/2 h-[200vmax] w-[200vmax] -translate-x-1/2 -translate-y-1/2 stroke-white/10" viewBox="-440 -440 880 880">
          {QUADRANTES.map(({ sx, sy }, q) =>
            ARESTAS.map((p, i) => (
              <React.Fragment key={`${q}-${p}`}>
                <motion.line x1={0} y1={sy * p} x2={sx * 440} y2={sy * p} strokeWidth={0.6}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1 + i * 0.05, duration: 1.2, ease: EASE }} />
                <motion.line x1={sx * p} y1={0} x2={sx * p} y2={sy * 440} strokeWidth={0.6}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1 + i * 0.05, duration: 1.2, ease: EASE }} />
              </React.Fragment>
            ))
          )}
        </svg>
      )}
      <span className="tailor-ponto-pisca relative block h-[13px] w-[13px] bg-tailor-green" />
    </div>
  );
}
