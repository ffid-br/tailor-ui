import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../cn';
import { appPorChave } from '../apps';
import { TailorAppIcon } from './TailorAppIcon';
import { TailorHandoffSaida } from './TailorHandoff';
import { TailorSkeleton } from './TailorSkeleton';

export type TailorAppLauncherProps = {
  /** Os apps da conta (`/clients/uses`): a chave do produto (`gpt`, `ffid.ai.studio`...) e a URL. Duas chaves do mesmo app viram um item só. */
  /** `nome` vale só para app fora do registro do tailor-ui (ex.: "Tailor Sac"); app registrado usa o nome do registro. */
  apps: { chave: string; url: string; nome?: string }[];
  /** O app em que o usuário está (id ou chave de produto). Aparece marcado e não é link. */
  atual: string;
  /** A lista ainda chega: o painel mostra o esqueleto no lugar dos apps. */
  carregando?: boolean;
  /** Chamada no clique com a URL do app: devolve a URL com o token de SSO. Sem ela, o link abre a URL como está. */
  montarUrl?: (url: string) => Promise<string> | string;
  /** Onde o painel abre em relação ao botão: `baixo-fim` (padrão, alinhado à direita), `baixo-inicio` ou `direita` (botão em barra lateral). */
  posicao?: 'baixo-fim' | 'baixo-inicio' | 'direita';
  className?: string;
};

const LARGURA = 288; // 18 pontos de 16: cabe em 320 px com a margem lateral de 16
const MARGEM = 16;
const GAP = 8;

const Grade = () => (
  <svg viewBox="0 0 8 8" width="20" height="20" aria-hidden="true" fill="currentColor" shapeRendering="crispEdges">
    {[0, 3, 6].flatMap((y) => [0, 3, 6].map((x) => <rect key={`${x}${y}`} x={x} y={y} width="2" height="2" />))}
  </svg>
);

type Item = { chave: string; url: string; id: string | undefined; nome: string; atual: boolean };

/**
 * Seletor de apps da conta: botão de grade e painel com o ícone e o nome de cada app
 * (do `TAILOR_APPS`). O app atual vem marcado; os outros abrem em outra aba, com SSO
 * se o app passar `montarUrl`. Fecha com Esc, clique fora ou ao sair o foco.
 */
export const TailorAppLauncher: React.FC<TailorAppLauncherProps> = ({ apps, atual, carregando = false, montarUrl, posicao = 'baixo-fim', className }) => {
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const painelId = useId();

  const idAtual = appPorChave(atual)?.id ?? atual.toLowerCase();
  const itens: Item[] = [];
  for (const a of apps) {
    const meta = appPorChave(a.chave);
    const id = meta?.id ?? a.chave.toLowerCase();
    if (itens.some((i) => (i.id ?? i.chave.toLowerCase()) === id)) continue;
    // App sem registro: a chave capitalizada e a inicial no lugar do ícone.
    itens.push({ chave: a.chave, url: a.url, id: meta?.id, nome: meta?.nome ?? a.nome ?? a.chave.charAt(0).toUpperCase() + a.chave.slice(1), atual: id === idAtual });
  }

  const fechar = useCallback((devolverFoco = false) => {
    setAberto(false);
    if (devolverFoco) botao.current?.focus();
  }, []);

  // Posição fixa calculada do botão: o painel escapa de pais com overflow (barra lateral) e não sai da tela.
  useLayoutEffect(() => {
    if (!aberto || !botao.current) return;
    const r = botao.current.getBoundingClientRect();
    const largura = Math.min(LARGURA, window.innerWidth - 2 * MARGEM);
    const alvo = posicao === 'direita' ? r.right + GAP : posicao === 'baixo-inicio' ? r.left : r.right - largura;
    const top = posicao === 'direita' ? r.top : r.bottom + GAP;
    setPos({ top, left: Math.max(MARGEM, Math.min(alvo, window.innerWidth - largura - MARGEM)) });
  }, [aberto, posicao]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: Event) => {
      if (!raiz.current?.contains(e.target as Node)) fechar();
    };
    // Clique fora e foco que sai (Tab) fecham; o foco sair do painel por clique dentro não.
    document.addEventListener('pointerdown', fora);
    document.addEventListener('focusin', fora);
    (painel.current?.querySelector<HTMLElement>('a[href]') ?? painel.current)?.focus();
    return () => {
      document.removeEventListener('pointerdown', fora);
      document.removeEventListener('focusin', fora);
    };
  }, [aberto, fechar]);

  if (!carregando && itens.length === 0) return null;

  const abrir = async (e: React.MouseEvent<HTMLAnchorElement>, item: Item) => {
    fechar();
    if (!montarUrl || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    // A aba abre já no clique (gesto do usuário): depois do await o navegador a trataria como popup.
    const aba = window.open('about:blank', '_blank');
    if (aba) aba.opener = null;
    setSaindo(item.chave);
    let destino = item.url;
    try {
      destino = await montarUrl(item.url);
    } catch {
      // Sem o token o destino pede login, mas o usuário chega lá.
    }
    if (aba) aba.location.href = destino;
    else window.location.assign(destino);
    setSaindo(null);
  };

  const sair = saindo ? itens.find((i) => i.chave === saindo) : undefined;

  return (
    <div
      ref={raiz}
      className={cn('relative inline-flex font-tailor', className)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && aberto) {
          e.stopPropagation();
          fechar(true);
        }
      }}
    >
      <button
        ref={botao}
        type="button"
        aria-label="Apps Tailor"
        aria-expanded={aberto}
        aria-controls={aberto ? painelId : undefined}
        title="Apps Tailor"
        onClick={() => setAberto((v) => !v)}
        className="inline-flex size-[44px] items-center justify-center text-neutral-600 transition-colors duration-[var(--tailor-dur-fast)] hover:bg-tailor-gray-100 hover:text-black motion-reduce:transition-none md:size-[40px] dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <Grade />
      </button>

      {aberto && (
        <div
          ref={painel}
          id={painelId}
          role="group"
          aria-label="Apps Tailor"
          aria-busy={carregando || undefined}
          tabIndex={-1}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: `min(${LARGURA}px, calc(100vw - ${2 * MARGEM}px))` }}
          className="z-[var(--tailor-z-drawer)] max-h-[calc(100vh-32px)] overflow-y-auto border border-tailor-border bg-white p-tailor-xs text-black outline-none dark:border-white/10 dark:bg-neutral-950 dark:text-white"
        >
          <p className="px-tailor-xs pb-tailor-xs pt-tailor-half text-tailor-overline font-medium uppercase tracking-[0.14em] text-neutral-600 dark:text-neutral-400">Apps Tailor</p>
          {carregando ? (
            <TailorSkeleton shape="text" lines={3} />
          ) : (
            <ul className="m-0 list-none p-0">
              {itens.map((item) => {
                const corpo = (
                  <>
                    {item.id ? (
                      <TailorAppIcon app={item.id} size={34} />
                    ) : (
                      <span aria-hidden="true" className="flex size-[34px] shrink-0 items-center justify-center bg-tailor-gray-100 text-tailor-label font-medium text-black dark:bg-white/10 dark:text-white">
                        {item.nome.charAt(0)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-tailor-body font-medium">{item.nome}</span>
                      {item.atual && (
                        <span className="flex items-center gap-tailor-half text-tailor-body-sm text-neutral-600 dark:text-neutral-400">
                          <span aria-hidden="true" className="size-[6px] bg-tailor-green" />
                          Você está aqui
                        </span>
                      )}
                    </span>
                  </>
                );
                const caixa = 'flex min-h-[48px] items-center gap-tailor-sm border-l-2 px-tailor-xs py-tailor-half';
                return (
                  <li key={item.chave}>
                    {item.atual ? (
                      <div aria-current="page" className={cn(caixa, 'border-tailor-green bg-tailor-gray-100 dark:bg-white/10')}>
                        {corpo}
                      </div>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => void abrir(e, item)}
                        className={cn(caixa, 'border-transparent text-inherit no-underline transition-colors duration-[var(--tailor-dur-fast)] hover:bg-tailor-gray-100 motion-reduce:transition-none dark:hover:bg-white/10')}
                      >
                        {corpo}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
      {sair && <TailorHandoffSaida app={sair.id ?? sair.chave} ativo />}
    </div>
  );
};
