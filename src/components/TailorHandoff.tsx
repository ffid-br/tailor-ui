import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../cn';
import { useReducedMotion } from '../reducedMotion';
import { appPorChave } from '../apps';
import { TailorAppIcon } from './TailorAppIcon';
import { TailorBrandMark } from './TailorBrandMark';
import { TailorLoader } from './TailorLoader';
import { TailorButton } from './TailorButton';

/*
 * Passagem de um app para outro com token na URL (SSO). Enquanto o destino valida
 * o token, esta tela cobre a viewport com a MESMA geometria do app (barra lateral
 * de 288px com a marca no topo, barra de 55px no celular), então quando ela some
 * nada pula: o app já está embaixo, no lugar.
 */

/** Os parâmetros que o launcher põe na URL do destino. */
const PARAMS_DE_TOKEN = ['ffid_jwt', 'access_token', 'refresh_token'];

/**
 * Há token de SSO na URL? Use no estado inicial (`useState(handoffPendente)`) para
 * que o primeiro quadro já seja a transição, nunca o login nem o app sem sessão.
 */
export function handoffPendente(search: string = typeof window === 'undefined' ? '' : window.location.search): boolean {
  const p = new URLSearchParams(search);
  return PARAMS_DE_TOKEN.some((k) => p.has(k));
}

export type TailorHandoffProps = {
  /** O app que está abrindo (id ou chave de produto): dá nome e ícone. */
  app: string;
  /** `true` enquanto o token é validado. Ao virar `false`, a tela some em fade. */
  ativo: boolean;
  /** A validação recusou o token: troca o loader pela ação "Entrar de novo". */
  falhou?: boolean;
  /** Chamado em "Entrar de novo". Sem ele, o botão não aparece. */
  onTentarDeNovo?: () => void;
  /** Depois deste tempo sem resposta, avisa que está demorando e oferece a ação. Padrão: 13000. */
  timeoutMs?: number;
  /** Título. Padrão: "Abrindo <nome do app>". */
  rotulo?: string;
  /** Barra lateral do app destino: `expandida` (288px), `recolhida` (80px) ou `nenhuma`. */
  sidebar?: 'expandida' | 'recolhida' | 'nenhuma';
  /** Breakpoint em que a barra vira a barra de 55px do celular (o mesmo da `TailorSidebar`). */
  breakpoint?: 'md' | 'lg';
  className?: string;
};

// Classes literais: o Tailwind do app só gera o que encontra escrito por inteiro.
const SO_DESKTOP = { md: 'max-md:hidden!', lg: 'max-lg:hidden!' } as const;
const SO_MOBILE = { md: 'md:hidden!', lg: 'lg:hidden!' } as const;

/**
 * Tela de entrada entre apps: ícone, "Abrindo Marketing" e o loader da marca sobre o
 * esqueleto do app. Dá o primeiro quadro sem login e sem pulo, some em fade quando
 * `ativo` vira `false` e, se o token não serve (ou a espera passa do limite), oferece
 * "Entrar de novo". Quem pediu menos movimento não vê o fade.
 */
export const TailorHandoff: React.FC<TailorHandoffProps> = ({
  app,
  ativo,
  falhou = false,
  onTentarDeNovo,
  timeoutMs = 13000,
  rotulo,
  sidebar = 'expandida',
  breakpoint = 'lg',
  className,
}) => {
  const reduzir = useReducedMotion();
  const meta = appPorChave(app);
  const nome = meta?.nome ?? app;
  const [demorou, setDemorou] = useState(false);

  useEffect(() => {
    if (!ativo || falhou) return;
    setDemorou(false);
    const t = window.setTimeout(() => setDemorou(true), timeoutMs);
    return () => window.clearTimeout(t);
  }, [ativo, falhou, timeoutMs]);

  const problema = falhou || demorou;
  const titulo = falhou ? 'Não foi possível entrar' : (rotulo ?? `Abrindo ${nome}`);
  const apoio = falhou ? 'Sua sessão expirou ou o acesso foi recusado.' : demorou ? 'Está demorando mais que o normal.' : undefined;

  return (
    <AnimatePresence>
      {(ativo || falhou) && (
        <motion.div
          key="tailor-handoff"
          role="status"
          aria-live="polite"
          aria-busy={!falhou}
          data-tailor-handoff=""
          className={cn('fixed inset-0 z-[1000] flex bg-white dark:bg-neutral-950', className)}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduzir ? 0 : 0.233, ease: [0.4, 0, 1, 1] }}
        >
          {sidebar !== 'nenhuma' && (
            <aside
              aria-hidden="true"
              data-tailor-handoff-sidebar=""
              className={cn(
                'flex h-full shrink-0 flex-col border-r border-neutral-200 dark:border-white/10',
                SO_DESKTOP[breakpoint],
                sidebar === 'recolhida' ? 'w-20' : 'w-72',
              )}
            >
              <div className={cn('flex h-[55px] shrink-0 items-center border-b border-neutral-200 dark:border-white/10', sidebar === 'recolhida' ? 'justify-center' : 'pl-[21px]')}>
                <TailorBrandMark produto={nome} compact={sidebar === 'recolhida'} />
              </div>
            </aside>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <header
              aria-hidden="true"
              data-tailor-handoff-header=""
              className={cn('h-[55px] shrink-0 items-center border-b border-neutral-200 pl-[21px] dark:border-white/10', 'flex', SO_MOBILE[breakpoint])}
            >
              <TailorBrandMark produto={nome} />
            </header>
            <div className="flex flex-1 flex-col items-center justify-center gap-[21px] px-[21px] text-center">
              <TailorAppIcon app={app} size={55} />
              <div className="flex flex-col items-center gap-[8px]">
                <h2 className="font-tailor text-xl font-medium text-black dark:text-white">{titulo}</h2>
                {apoio && <p className="max-w-[34ch] font-tailor text-sm text-neutral-600 dark:text-neutral-400">{apoio}</p>}
              </div>
              {!falhou && <TailorLoader variant="compact" label="Validando acesso" />}
              {problema && onTentarDeNovo && (
                <TailorButton variant={falhou ? 'primary' : 'secondary'} onClick={onTentarDeNovo}>
                  Entrar de novo
                </TailorButton>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export type TailorHandoffSaidaProps = {
  /** O app que vai abrir (id ou chave de produto). */
  app: string;
  /** Mostre quando o clique no link para outro app acontece; esconda ao voltar o foco. */
  ativo: boolean;
  className?: string;
};

/** Avisinho no app de origem, no canto: "Abrindo CRM". O clique foi ouvido enquanto a outra aba carrega. */
export const TailorHandoffSaida: React.FC<TailorHandoffSaidaProps> = ({ app, ativo, className }) => {
  const nome = appPorChave(app)?.nome ?? app;
  if (!ativo) return null;
  return (
    <div
      role="status"
      data-tailor-handoff-saida=""
      className={cn('fixed bottom-[21px] right-[21px] z-[130] flex items-center gap-[13px] bg-black py-[8px] pl-[8px] pr-[16px] font-tailor text-sm text-white', className)}
    >
      <TailorAppIcon app={app} size={21} />
      <span>Abrindo {nome}</span>
      <TailorLoader variant="dot" label={`Abrindo ${nome}`} className="text-tailor-green" />
    </div>
  );
};
