import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PontoMalha } from './PontoMalha';

/*
 * Transição login → app. O login marca a entrada pendente (sessionStorage) ao
 * enviar e desmarca no erro; o app logado consome a marca. Sem login (reload,
 * link direto), vale a primeira visita da aba.
 */
export const ENTRADA_PENDENTE = 'tailor_entrada_pendente';
const ENTRADA_VISTA = 'tailor_entrada_vista';
const EASE = [0.65, 0, 0.35, 1] as const;

/** Marca que o próximo app logado deve tocar a entrada. Chame no submit do login. */
export function marcarEntradaPendente() {
  try {
    sessionStorage.setItem(ENTRADA_PENDENTE, '1');
  } catch {
    // sem storage: sem transição
  }
}

/** Desfaz a marca. Chame quando o login falhar. */
export function limparEntradaPendente() {
  try {
    sessionStorage.removeItem(ENTRADA_PENDENTE);
  } catch {
    // sem storage: nada a limpar
  }
}

const deveEntrar = (): boolean => {
  try {
    return sessionStorage.getItem(ENTRADA_PENDENTE) === '1' || sessionStorage.getItem(ENTRADA_VISTA) !== '1';
  } catch {
    return false;
  }
};

export type EntrarOverlayProps = {
  /** Enquanto `true`, o preto cobre a tela a partir do botão; ao virar `false`, recolhe. */
  ativo: boolean;
  /** Elemento de onde o círculo nasce (o botão "Entrar"). Sem ele, o centro da tela. */
  origemRef?: React.RefObject<HTMLElement | null>;
};

/**
 * "Entrar": um círculo preto cresce do botão enquanto autentica, com o ponto
 * piscando dentro, e continua na `EntradaApp` do app logado. Deu erro, recolhe.
 */
export function EntrarOverlay({ ativo, origemRef }: EntrarOverlayProps) {
  const reduzir = useReducedMotion();
  const r = ativo ? origemRef?.current?.getBoundingClientRect() : undefined;
  const origem = r ? `${r.left + r.width / 2}px ${r.top + r.height / 2}px` : '50% 50%';
  return (
    <AnimatePresence>
      {ativo && (
        <motion.div
          key="tailor-entrar"
          aria-hidden="true"
          data-tailor-entrar=""
          className="pointer-events-none fixed inset-0 z-[95] bg-black"
          initial={{ clipPath: `circle(0% at ${origem})` }}
          animate={{ clipPath: `circle(150% at ${origem})` }}
          exit={{ clipPath: `circle(0% at ${origem})` }}
          transition={{ duration: reduzir ? 0 : 0.618, ease: EASE }}
        >
          <PontoMalha malha={!reduzir} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Revelação do app logado, uma vez por login (ou por aba): 1,618s de preto com
 * o ponto piscando e 0,618s recolhendo de baixo para cima. Durante a entrada,
 * `<html data-entrada>` anima os filhos do contêiner com
 * `data-tailor-entrada-alvo`. Quem pediu menos movimento vai direto ao app.
 * Monte uma vez no layout logado.
 */
export function EntradaApp() {
  const reduzir = useReducedMotion();
  const [ativa] = useState(deveEntrar);
  const [visivel, setVisivel] = useState(ativa && !reduzir);

  useEffect(() => {
    if (!ativa) return;
    try {
      sessionStorage.removeItem(ENTRADA_PENDENTE);
      sessionStorage.setItem(ENTRADA_VISTA, '1');
    } catch {
      // sem storage: a transição pode se repetir, sem prejuízo
    }
    if (reduzir) {
      setVisivel(false);
      return;
    }
    const raiz = document.documentElement;
    raiz.dataset.entrada = '1';
    const t = window.setTimeout(() => delete raiz.dataset.entrada, 3618);
    return () => {
      window.clearTimeout(t);
      delete raiz.dataset.entrada;
    };
  }, [ativa, reduzir]);

  if (!visivel) return null;

  return (
    <motion.div
      aria-hidden="true"
      data-tailor-entrada=""
      className="pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center bg-black"
      initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      transition={{ delay: 1.618, duration: 0.618, ease: EASE }}
      onAnimationComplete={() => setVisivel(false)}
    >
      {/* Continua o preto do login: o mesmo ponto e a mesma malha. */}
      <PontoMalha />
    </motion.div>
  );
}
