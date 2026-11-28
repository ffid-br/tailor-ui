import React, { useId, useRef, useState } from 'react';
import { cn } from '../cn';
import { AgenteMascote, type ChaveDoAgente, type EstadoDoMascote } from './AgenteMascote';

export type AgenteDaEquipe = {
  chave: ChaveDoAgente;
  nome: string;
  estado?: EstadoDoMascote;
  selo?: number;
  /** O que a aba mostra (feed, pergunta...). Sem conteúdo, a aba diz "Em breve". */
  conteudo?: React.ReactNode;
};

export type EquipeDockProps = {
  /** O primeiro é o que aparece no botão flutuante. */
  agentes: AgenteDaEquipe[];
  abertoInicial?: boolean;
  /** Título do painel. Padrão: "Equipe". */
  titulo?: string;
  /** `pixel` (padrão) ou `vetor`, para todos os mascotes do dock. */
  estilo?: 'pixel' | 'vetor';
  className?: string;
};

/** Estados em que o agente está na ativa: aparecem junto do principal no botão. */
const NA_ATIVA: EstadoDoMascote[] = ['analisando', 'falando', 'esperando', 'erro'];

/**
 * A equipe de agentes num canto da tela: botão com o mascote principal e o selo
 * de pendências somado; abre um painel com uma aba por agente. Setas trocam de aba e Esc fecha.
 * Fica fixo no canto de baixo à direita: deixe folga no fim da página (ou mude a posição por
 * `className`) para ele não cobrir o último conteúdo.
 */
export function EquipeDock({ agentes, abertoInicial = false, titulo = 'Equipe', estilo = 'pixel', className }: EquipeDockProps) {
  const [aberto, setAberto] = useState(abertoInicial);
  const [aba, setAba] = useState(0);
  const id = useId();
  const botao = useRef<HTMLButtonElement>(null);
  if (!agentes.length) return null;
  const principal = agentes[0];
  const total = agentes.reduce((s, a) => s + (a.selo ?? 0), 0);
  const atual = agentes[Math.min(aba, agentes.length - 1)];
  // Equipe trabalhando: o principal (ex.: o assistente do CRM) com quem ele acionou ao lado.
  const ativos = agentes.slice(1).filter((a) => a.estado && NA_ATIVA.includes(a.estado));

  // Abas pelo teclado (padrão de abas da WAI-ARIA): setas, Home e End trocam a aba e levam o foco junto.
  const naAba = (e: React.KeyboardEvent) => {
    const passo = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key];
    const destino = e.key === 'Home' ? 0 : e.key === 'End' ? agentes.length - 1 : passo ? (aba + passo + agentes.length) % agentes.length : null;
    if (destino === null) return;
    e.preventDefault();
    setAba(destino);
    document.getElementById(`${id}-aba-${destino}`)?.focus();
  };
  // Esc fecha o painel e devolve o foco ao botão.
  const noDock = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape' || !aberto) return;
    e.stopPropagation();
    setAberto(false);
    botao.current?.focus();
  };

  return (
    <div onKeyDown={noDock} className={cn('fixed bottom-4 right-4 z-[var(--tailor-z-sticky)] flex flex-col items-end gap-2 font-tailor', className)}>
      {aberto && (
        <section id={`${id}-painel`} aria-label={titulo}
          className="flex max-h-[70vh] w-[min(360px,calc(100vw-32px))] flex-col border border-black bg-white text-black">
          {/* Grade que quebra em linhas: com muitos agentes as abas não saem do painel. */}
          <div role="tablist" aria-label={titulo} onKeyDown={naAba} className="grid shrink-0 grid-cols-[repeat(auto-fit,minmax(56px,1fr))] border-b border-black">
            {agentes.map((a, i) => (
              <button key={a.chave} type="button" role="tab" id={`${id}-aba-${i}`}
                aria-selected={i === aba} aria-controls={`${id}-conteudo`} tabIndex={i === aba ? 0 : -1}
                onClick={() => setAba(i)}
                className={cn('flex min-w-0 flex-col items-center gap-1 px-2 py-2 text-xs font-medium', i === aba ? 'bg-black text-white' : 'hover:bg-black/5')}>
                <AgenteMascote agente={a.chave} nome={a.nome} estado={a.estado} selo={a.selo} celula={3} tamanho={32}
                  estilo={estilo} superficie={i === aba ? 'escura' : 'clara'} />
                <span className="max-w-full truncate">{a.nome}</span>
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`${id}-conteudo`} aria-labelledby={`${id}-aba-${aba}`} className="flex-1 overflow-y-auto p-4 text-sm">
            <AgenteMascote agente={atual.chave} nome={atual.nome} estado={atual.estado} mostrarEstado className="mb-3"
              estilo={estilo} superficie="clara" />
            {atual.conteudo ?? <p className="text-black/60">Em breve.</p>}
          </div>
        </section>
      )}
      <button ref={botao} type="button" onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto} aria-controls={`${id}-painel`}
        aria-label={`${aberto ? 'Fechar' : 'Abrir'} ${titulo.toLowerCase()}${total > 0 ? `, ${total} pendentes` : ''}${ativos.length ? `, ${ativos.length + 1} trabalhando` : ''}`}
        className="flex h-14 min-w-14 items-center justify-center gap-1 border border-black bg-white px-3 hover:bg-black/5">
        <AgenteMascote agente={principal.chave} nome={principal.nome} estado={principal.estado} selo={total} celula={4}
          estilo={estilo} superficie="clara" />
        {ativos.slice(0, 3).map((a) => (
          <AgenteMascote key={a.chave} agente={a.chave} nome={a.nome} estado={a.estado} celula={3}
            estilo={estilo} superficie="clara" className="-ml-1" />
        ))}
        {ativos.length > 3 && <span className="font-tailor-num text-xs font-medium" aria-hidden="true">+{ativos.length - 3}</span>}
      </button>
    </div>
  );
}
