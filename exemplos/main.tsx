import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence } from 'framer-motion';
import {
  AgenteMascote,
  CinematicIntro,
  EntrarOverlay,
  EquipeDock,
  PontoMalha,
  TailorBrandMark,
  TailorLoader,
  TailorMobileBar,
  TailorSidebar,
  TailorUserMenu,
  type TailorSidebarGrupo,
} from '../src';
import './exemplos.css';

// Ícones de linha mínimos, só para a página não depender do lucide-react.
const icone = (d: string) => ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const Circulo = icone('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z');
const Quadrado = icone('M4 4h16v16H4z');
const Pessoa = icone('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0');
const Menu = icone('M4 6h16M4 12h16M4 18h16');
const Sair = icone('M9 21H5V3h4M16 17l5-5-5-5M21 12H9');

function Exemplo({ titulo, codigo, children, escuro }: { titulo: string; codigo: string; children: React.ReactNode; escuro?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="border-b border-neutral-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-800">{titulo}</div>
      <div className={escuro ? 'bg-black p-6' : 'bg-white p-6 dark:bg-neutral-950'}>{children}</div>
      <pre className="overflow-x-auto bg-neutral-50 p-4 text-[13px] leading-relaxed text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
        <code>{codigo.trim()}</code>
      </pre>
    </div>
  );
}

function Secao({ id, titulo, descricao, children }: { id: string; titulo: string; descricao: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-black dark:text-white">{titulo}</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{descricao}</p>
      </div>
      {children}
    </section>
  );
}

const SECOES = [
  { id: 'loader', rotulo: 'TailorLoader', icone: Circulo },
  { id: 'intro', rotulo: 'CinematicIntro', icone: Quadrado },
  { id: 'ponto', rotulo: 'PontoMalha', icone: Circulo },
  { id: 'marca', rotulo: 'TailorBrandMark', icone: Quadrado },
  { id: 'mascote', rotulo: 'AgenteMascote', icone: Pessoa, badge: 3 },
  { id: 'equipe', rotulo: 'EquipeDock', icone: Pessoa },
  { id: 'sidebar', rotulo: 'TailorSidebar', icone: Menu },
  { id: 'entrada', rotulo: 'Login → app', icone: Sair },
];

function App() {
  const [hash, setHash] = useState(location.hash.slice(1) || 'loader');
  const [aberto, setAberto] = useState(false);
  const [recolhido, setRecolhido] = useState(false);
  const [escuro, setEscuro] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [intro, setIntro] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const aoMudar = () => setHash(location.hash.slice(1));
    addEventListener('hashchange', aoMudar);
    return () => removeEventListener('hashchange', aoMudar);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', escuro);
  }, [escuro]);
  useEffect(() => {
    if (!overlay) return;
    const t = setTimeout(() => setOverlay(false), 2000);
    return () => clearTimeout(t);
  }, [overlay]);
  useEffect(() => {
    if (!entrando) return;
    const t = setTimeout(() => setEntrando(false), 2000);
    return () => clearTimeout(t);
  }, [entrando]);

  const grupos: TailorSidebarGrupo[] = [
    { rotulo: 'Componentes', itens: SECOES.map((s) => ({ ...s, href: `#${s.id}`, ativo: hash === s.id })) },
  ];

  const botao = 'rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black';

  return (
    <div className="flex min-h-screen bg-white font-tailor text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <TailorSidebar
        produto="UI"
        grupos={grupos}
        recolhido={recolhido}
        onRecolher={setRecolhido}
        aberto={aberto}
        onFechar={() => setAberto(false)}
        rodape={
          <TailorUserMenu
            nome="Pessoa Exemplo"
            detalhe="exemplo@tailor.ia"
            papel="Administrador"
            acoes={[{ rotulo: 'Sair', icone: Sair, tom: 'perigo', onSelect: () => {} }]}
          >
            <button type="button" className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-white/10" onClick={() => setEscuro(!escuro)}>
              Tema {escuro ? 'claro' : 'escuro'}
            </button>
          </TailorUserMenu>
        }
      />

      <div className="min-w-0 flex-1">
        <TailorMobileBar produto="UI" onAbrirMenu={() => setAberto(true)} menuAberto={aberto} />
        <main className="mx-auto max-w-4xl space-y-16 px-4 py-10 sm:px-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-black dark:text-white">@ffid-br/tailor-ui</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Cada componente renderizado ao vivo, com o código para copiar. Esta página usa a própria <code>TailorSidebar</code> como navegação.
            </p>
            <button type="button" className={botao} onClick={() => setEscuro(!escuro)}>
              Tema {escuro ? 'claro' : 'escuro'}
            </button>
          </header>

          <Secao id="loader" titulo="TailorLoader" descricao="Carregamento com o ponto verde e a malha Fibonacci. Sempre expõe role=&quot;status&quot;.">
            <Exemplo titulo="inline (padrão)" codigo={`<TailorLoader detail="3 de 5 contas" />`}>
              <TailorLoader detail="3 de 5 contas" />
            </Exemplo>
            <Exemplo titulo="compact" codigo={`<TailorLoader variant="compact" label="Salvando" />`}>
              <TailorLoader variant="compact" label="Salvando" />
            </Exemplo>
            <Exemplo titulo="caixa" codigo={`<TailorLoader variant="caixa" label="Buscando conversas" />`}>
              <TailorLoader variant="caixa" label="Buscando conversas" />
            </Exemplo>
            <Exemplo titulo="overlay" codigo={`<TailorLoader variant="overlay" label="Entrando" />`}>
              <button type="button" className={botao} onClick={() => setOverlay(true)}>Mostrar por 2s</button>
              {overlay && <TailorLoader variant="overlay" label="Entrando" />}
            </Exemplo>
          </Secao>

          <Secao id="intro" titulo="CinematicIntro" descricao="Abertura de tela cheia. Com menos movimento, chama onComplete na hora.">
            <Exemplo
              titulo="abertura"
              codigo={`
<AnimatePresence>
  {mostrarIntro && (
    <CinematicIntro
      onComplete={() => setMostrarIntro(false)}
      produto="Pilot"
      overline="Alfaiataria digital"
      slogan="Tecnologia sob medida para a sua operação"
      skipLabel="Pular"
    />
  )}
</AnimatePresence>`}
            >
              <button type="button" className={botao} onClick={() => setIntro(true)}>Tocar a abertura</button>
              <AnimatePresence>
                {intro && (
                  <CinematicIntro
                    onComplete={() => setIntro(false)}
                    produto="Pilot"
                    overline="Alfaiataria digital"
                    slogan="Tecnologia sob medida para a sua operação"
                    skipLabel="Pular"
                  />
                )}
              </AnimatePresence>
            </Exemplo>
          </Secao>

          <Secao id="ponto" titulo="PontoMalha" descricao="Ocupa o contêiner posicionado mais próximo. O fundo preto é de quem usa.">
            <Exemplo titulo="com malha" codigo={`<div className="relative h-[233px] overflow-hidden bg-black"><PontoMalha /></div>`}>
              <div className="relative h-[233px] overflow-hidden bg-black"><PontoMalha /></div>
            </Exemplo>
            <Exemplo titulo="só o ponto" codigo={`<div className="relative h-[89px] bg-black"><PontoMalha malha={false} /></div>`}>
              <div className="relative h-[89px] bg-black"><PontoMalha malha={false} /></div>
            </Exemplo>
          </Secao>

          <Secao id="marca" titulo="TailorBrandMark" descricao="Lockup do produto. As logos padrão já vêm embutidas.">
            <Exemplo titulo="padrão e compacto" codigo={`<TailorBrandMark produto="Conta" />\n<TailorBrandMark produto="Conta" compact />`}>
              <div className="flex flex-wrap items-center gap-8">
                <TailorBrandMark produto="Conta" />
                <TailorBrandMark produto="Conta" compact />
              </div>
            </Exemplo>
            <Exemplo titulo="sobre fundo escuro" escuro codigo={`<TailorBrandMark produto="Pilot" onDark />`}>
              <TailorBrandMark produto="Pilot" onDark />
            </Exemplo>
          </Secao>

          <Secao id="mascote" titulo="AgenteMascote" descricao="Personagem 8x8 de cada agente. O estado vai no rótulo acessível.">
            <Exemplo
              titulo="agentes e estados"
              codigo={`
<AgenteMascote agente="desk" nome="Alfred" estado="esperando" selo={4} mostrarEstado />
<AgenteMascote agente="pergunte" nome="Pergunte" estado="analisando" mostrarEstado />
<AgenteMascote agente="pm" nome="PM" estado="desligado" mostrarEstado />
<AgenteMascote agente="diretor" nome="Diretor" estado="subiu" mostrarEstado celula={6} />`}
            >
              <div className="flex flex-wrap items-center gap-8">
                <AgenteMascote agente="desk" nome="Alfred" estado="esperando" selo={4} mostrarEstado />
                <AgenteMascote agente="pergunte" nome="Pergunte" estado="analisando" mostrarEstado />
                <AgenteMascote agente="pm" nome="PM" estado="desligado" mostrarEstado />
                <AgenteMascote agente="diretor" nome="Diretor" estado="subiu" mostrarEstado celula={6} />
              </div>
            </Exemplo>
          </Secao>

          <Secao id="equipe" titulo="EquipeDock" descricao="Botão fixo no canto inferior da tela (veja ali embaixo) com a soma dos selos.">
            <Exemplo
              titulo="painel da equipe"
              codigo={`
<EquipeDock agentes={[
  { chave: 'desk', nome: 'Alfred', estado: 'esperando', selo: 4, conteudo: <p>Feed do desk</p> },
  { chave: 'pergunte', nome: 'Pergunte' },   // sem conteúdo: "Em breve."
]} />`}
            >
              <p className="text-sm text-neutral-600 dark:text-neutral-400">O dock desta página está no canto da tela.</p>
            </Exemplo>
          </Secao>

          <Secao id="sidebar" titulo="TailorSidebar" descricao="A navegação desta página. Recolha pelo botão ao lado da marca ou estreite a janela para ver a gaveta.">
            <Exemplo
              titulo="esta página"
              codigo={`
<TailorSidebar
  produto="UI"
  grupos={[{ rotulo: 'Componentes', itens: [
    { id: 'loader', rotulo: 'TailorLoader', icone: Circulo, href: '#loader', ativo: hash === 'loader' },
    { id: 'mascote', rotulo: 'AgenteMascote', icone: Pessoa, href: '#mascote', badge: 3 },
  ] }]}
  recolhido={recolhido}
  onRecolher={setRecolhido}
  aberto={aberto}
  onFechar={() => setAberto(false)}
  rodape={<TailorUserMenu nome="Pessoa Exemplo" detalhe="exemplo@tailor.ia" acoes={[...]} />}
/>
<TailorMobileBar produto="UI" onAbrirMenu={() => setAberto(true)} menuAberto={aberto} />`}
            >
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Exemplo completo com react-router no README.</p>
            </Exemplo>
          </Secao>

          <Secao id="entrada" titulo="Login → app" descricao="O preto cresce do botão enquanto autentica. Deu erro, recolhe.">
            <Exemplo
              titulo="EntrarOverlay"
              codigo={`
<EntrarOverlay ativo={entrando} origemRef={botaoRef} />
<button ref={botaoRef} type="submit">Entrar</button>`}
            >
              <EntrarOverlay ativo={entrando} origemRef={botaoRef} />
              <button ref={botaoRef} type="button" className={botao} onClick={() => setEntrando(true)}>Entrar (simula 2s)</button>
            </Exemplo>
          </Secao>
        </main>
      </div>

      <EquipeDock
        agentes={[
          { chave: 'desk', nome: 'Alfred', estado: 'esperando', selo: 4, conteudo: <p className="p-4 text-sm">Feed do desk</p> },
          { chave: 'pergunte', nome: 'Pergunte' },
        ]}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
