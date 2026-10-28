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
  TailorMarca,
  TailorMobileBar,
  TailorPageHeader,
  TailorTabela,
  somar,
  type TailorTabelaColuna,
  temaDoWhitelabel,
  type WhitelabelDoCliente,
  TailorSidebar,
  TailorUserMenu,
  type TailorSidebarGrupo,
} from '../src';
import { Simulador } from './Simulador';
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

// Cliente fictício, no formato de account_info.whitelabel do Mongo.
const MARCAS: Record<string, { rotulo: string; wl: WhitelabelDoCliente | null }> = {
  tailor: { rotulo: 'Tailor (padrão)', wl: null },
  vermelha: {
    rotulo: 'Construtora Exemplo',
    wl: {
      colors: { primary: '#C8102E', text: '#1A1A1A', text_muted: '#5C5C5C', border: '#E3D9D9', dark: { primary: '#FF5A6E', text: '#FFFFFF' } },
      fonts: { heading: 'Montserrat', body: 'Montserrat', heading_weight: 700, heading_case: 'uppercase' },
      shape: { radius: '6px' },
    },
  },
  amarela: {
    rotulo: 'Imobiliária Exemplo',
    wl: { colors: { primary: '#FFD71D', text: '#111111' }, fonts: { heading: 'Raleway', heading_weight: 300 } },
  },
  cadastro: {
    rotulo: 'Cadastro sem marca (#007bff)',
    wl: { colors: { primary: '#007bff', secondary: '#6c757d', background: '#ffffff', text: '#000000' } },
  },
};

type Corretor = { id: string; nome: string; equipe: string; leads: number; visitas: number; vendas: number; receita: number; conversao: number; ultima: string };
const CORRETORES: Corretor[] = [
  ['Ana Souza', 'Centro', 128, 41, 9, 4120000, '2026-10-27'], ['Bruno Lima', 'Zona Sul', 96, 22, 4, 1980000, '2026-10-25'],
  ['Carla Dias', 'Centro', 143, 52, 11, 5230000, '2026-10-28'], ['Diego Alves', 'Litoral', 61, 9, 1, 420000, '2026-10-12'],
  ['Elisa Rocha', 'Zona Sul', 88, 30, 6, 2770000, '2026-10-26'], ['Fábio Nunes', 'Litoral', 72, 18, 3, 1310000, '2026-10-21'],
  ['Gabi Torres', 'Centro', 110, 37, 7, 3390000, '2026-10-28'], ['Hugo Melo', 'Zona Sul', 54, 11, 0, 0, '2026-09-30'],
].map(([nome, equipe, leads, visitas, vendas, receita, ultima], i) => ({
  id: `C-${1040 + i}`, nome, equipe, leads, visitas, vendas, receita, conversao: (vendas as number) / (leads as number), ultima,
} as Corretor));

const COLUNAS: Array<TailorTabelaColuna<Corretor>> = [
  { chave: 'id', titulo: 'ID', tipo: 'id', largura: '90px' },
  { chave: 'nome', titulo: 'Corretor', ordenavel: true },
  { chave: 'equipe', titulo: 'Equipe', ordenavel: true },
  { chave: 'leads', titulo: 'Leads', tipo: 'numero', ordenavel: true, total: somar((c: Corretor) => c.leads) },
  { chave: 'vendas', titulo: 'Vendas', tipo: 'numero', ordenavel: true, total: somar((c: Corretor) => c.vendas) },
  { chave: 'receita', titulo: 'Receita', tipo: 'moeda', ordenavel: true, total: somar((c: Corretor) => c.receita) },
  { chave: 'conversao', titulo: 'Conversão', tipo: 'percentual', ordenavel: true,
    total: (ls: Corretor[]) => ls.reduce((s, c) => s + c.vendas, 0) / ls.reduce((s, c) => s + c.leads, 0) },
  { chave: 'ultima', titulo: 'Última venda', tipo: 'data', ordenavel: true },
];

function CabecalhoComMarca() {
  const [marca, setMarca] = useState('vermelha');
  const { tema, escuro } = temaDoWhitelabel(MARCAS[marca].wl);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {Object.entries(MARCAS).map(([k, m]) => (
          <button key={k} type="button" aria-pressed={k === marca} onClick={() => setMarca(k)}
            className={'min-h-8 border px-2.5 text-xs font-medium ' + (k === marca ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700')}>
            {m.rotulo}
          </button>
        ))}
      </div>
      <TailorMarca tema={tema} escuro={escuro}>
        <TailorPageHeader
          sobretitulo="Comercial"
          titulo="Leads"
          descricao="Quem chegou esta semana e o que falta para cada um avançar."
          trilha={[{ rotulo: 'Início', href: '#cabecalho' }, { rotulo: 'Comercial', href: '#cabecalho' }, { rotulo: 'Leads' }]}
          etiqueta={<span className="border border-current px-2 py-0.5 text-xs">Beta</span>}
          indicadores={[{ rotulo: 'novos', valor: 128 }, { rotulo: 'sem resposta', valor: 17 }]}
          acoes={<button type="button" className="h-10 bg-black px-4 text-sm font-medium text-white dark:bg-white dark:text-black">Novo lead</button>}
        />
        <div className="mt-6">
          <TailorTabela legenda="Desempenho por corretor" colunas={COLUNAS} linhas={CORRETORES} chaveDaLinha={(c) => c.id}
            ordemInicial={{ chave: 'receita', direcao: 'desc' }} porPagina={5} />
        </div>
      </TailorMarca>
    </div>
  );
}

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
  { id: 'cabecalho', rotulo: 'TailorPageHeader', icone: Quadrado },
  { id: 'tabela', rotulo: 'TailorTabela', icone: Quadrado },
  { id: 'loader', rotulo: 'TailorLoader', icone: Circulo },
  { id: 'intro', rotulo: 'CinematicIntro', icone: Quadrado },
  { id: 'ponto', rotulo: 'PontoMalha', icone: Circulo },
  { id: 'marca', rotulo: 'TailorBrandMark', icone: Quadrado },
  { id: 'mascote', rotulo: 'AgenteMascote', icone: Pessoa, badge: 3 },
  { id: 'vetor', rotulo: 'Mascote vetor', icone: Pessoa },
  { id: 'simulador', rotulo: 'Simulador de mascotes', icone: Quadrado },
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
  // Ao voltar do simulador as seções nascem depois do salto do navegador: rola de novo.
  useEffect(() => {
    if (hash === 'simulador') scrollTo(0, 0);
    else document.getElementById(hash)?.scrollIntoView();
  }, [hash]);
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
        {hash === 'simulador' ? (
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-black dark:text-white">Simulador de mascotes</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Monte qualquer mascote com o componente de verdade e copie o código. Link direto: <code>#simulador</code>.
            </p>
          </header>
          <Simulador />
        </main>
        ) : (
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

          <Secao id="cabecalho" titulo="TailorPageHeader" descricao="Cabeçalho de página que veste a marca do cliente: cores, fontes, caixa do título e cantos vêm do whitelabel do Mongo.">
            <Exemplo
              titulo="marca do cliente"
              codigo={`
const { tema, escuro } = temaDoWhitelabel(cliente.account_info.whitelabel);

<TailorMarca tema={tema} escuro={escuro}>
  <TailorPageHeader
    sobretitulo="Comercial"
    titulo="Leads"
    descricao="Quem chegou esta semana e o que falta para cada um avançar."
    trilha={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Comercial', href: '/comercial' }, { rotulo: 'Leads' }]}
    indicadores={[{ rotulo: 'novos', valor: 128 }, { rotulo: 'sem resposta', valor: 17 }]}
    acoes={<Botao>Novo lead</Botao>}
    renderLink={({ href, ...p }) => <NavLink to={href} {...p} />}
  />
</TailorMarca>`}
            >
              <CabecalhoComMarca />
            </Exemplo>
          </Secao>

          <Secao id="tabela" titulo="TailorTabela" descricao="Tabela de relatório: formata por tipo, ordena, pagina, soma o total e veste a marca do cliente (veja acima, junto do cabeçalho).">
            <Exemplo
              titulo="relatório"
              codigo={`
const colunas: TailorTabelaColuna<Corretor>[] = [
  { chave: 'id', titulo: 'ID', tipo: 'id' },
  { chave: 'nome', titulo: 'Corretor', ordenavel: true },
  { chave: 'leads', titulo: 'Leads', tipo: 'numero', ordenavel: true, total: somar((c) => c.leads) },
  { chave: 'receita', titulo: 'Receita', tipo: 'moeda', ordenavel: true, total: somar((c) => c.receita) },
  { chave: 'conversao', titulo: 'Conversão', tipo: 'percentual' },   // fração: 0,125 = 12,5%
  { chave: 'ultima', titulo: 'Última venda', tipo: 'data' },
  { chave: 'status', titulo: 'Status', celula: (c) => <Badge>{c.status}</Badge> },
];

<TailorTabela
  legenda="Desempenho por corretor"
  colunas={colunas}
  linhas={corretores}
  chaveDaLinha={(c) => c.id}
  ordemInicial={{ chave: 'receita', direcao: 'desc' }}
  porPagina={20}                 // ou paginacao={{ pagina, totalPaginas, aoMudar, totalRegistros }} (servidor)
  carregando={isLoading}
  aoClicarLinha={(c) => navigate(\`/corretores/\${c.id}\`)}
/>`}
            >
              <TailorTabela legenda="Desempenho por corretor (sem marca)" colunas={COLUNAS} linhas={CORRETORES} chaveDaLinha={(c) => c.id}
                ordemInicial={{ chave: 'leads', direcao: 'desc' }} porPagina={4} cabecalhoFixo />
            </Exemplo>
          </Secao>

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
      slogan="Sua operação em outro nível"
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
                    slogan="Sua operação em outro nível"
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

          <Secao id="vetor" titulo="AgenteMascote vetor" descricao="O companheiro animado: olha o cursor, pisca e muda de movimento por estado. Expressão só nos olhos.">
            <Exemplo
              titulo="estados"
              codigo={`
<AgenteMascote agente="desk" nome="Alfred" estilo="vetor" tamanho={96} estado="parado" />
<AgenteMascote agente="sdr" nome="SDR" estado="falando" fala="Achei 3 leads quentes." tamanho={96} />
<AgenteMascote agente="cred" nome="Cred" estado="analisando" tamanho={96} />
<AgenteMascote agente="score" nome="Score" estado="subiu" tamanho={96} />
<AgenteMascote agente="bi" nome="BI" estado="desligado" tamanho={96} />`}
            >
              <div className="flex flex-wrap items-end gap-10 pt-16">
                <AgenteMascote agente="desk" nome="Alfred" estilo="vetor" tamanho={96} estado="parado" mostrarEstado />
                <AgenteMascote agente="sdr" nome="SDR" estado="falando" fala="Achei 3 leads quentes." tamanho={96} mostrarEstado />
                <AgenteMascote agente="cred" nome="Cred" estado="analisando" tamanho={96} mostrarEstado />
                <AgenteMascote agente="score" nome="Score" estado="subiu" tamanho={96} mostrarEstado />
                <AgenteMascote agente="bi" nome="BI" estado="desligado" tamanho={96} mostrarEstado />
              </div>
            </Exemplo>
            <Exemplo
              titulo="equipe"
              codigo={`{(['desk', 'pergunte', 'pm', 'diretor', 'sdr', 'cred', 'score', 'pilot', 'flow', 'bi', 'rh'] as const).map((a) => (
  <AgenteMascote key={a} agente={a} nome={a} estilo="vetor" estado="parado" tamanho={64} />
))}`}
            >
              <div className="flex flex-wrap items-end gap-6">
                {(['desk', 'pergunte', 'pm', 'diretor', 'sdr', 'cred', 'score', 'pilot', 'flow', 'bi', 'rh'] as const).map((a) => (
                  <AgenteMascote key={a} agente={a} nome={a} estilo="vetor" estado="parado" tamanho={64} />
                ))}
              </div>
            </Exemplo>
            <Exemplo
              titulo="olhares e temas"
              codigo={`
<AgenteMascote agente="pm" nome="PM" estilo="vetor" estado="parado" expressao="bravo" tamanho={72} />
<AgenteMascote agente="rh" nome="RH" estado="parado" expressao="feliz" tamanho={72} />
<AgenteMascote agente="pilot" nome="Pilot" estado="parado" tema="natal" tamanho={72} />
<AgenteMascote agente="flow" nome="Flow" estado="parado" tema="pascoa" tamanho={72} />
<AgenteMascote agente="diretor" nome="Diretor" estilo="vetor" estado="parado" tema="galaxia" tamanho={72} />`}
            >
              <div className="flex flex-wrap items-end gap-10 pt-10">
                <AgenteMascote agente="pm" nome="PM" estilo="vetor" estado="parado" expressao="bravo" tamanho={72} />
                <AgenteMascote agente="rh" nome="RH" estado="parado" expressao="feliz" tamanho={72} />
                <AgenteMascote agente="pilot" nome="Pilot" estado="parado" tema="natal" tamanho={72} />
                <AgenteMascote agente="flow" nome="Flow" estado="parado" tema="pascoa" tamanho={72} />
                <AgenteMascote agente="diretor" nome="Diretor" estilo="vetor" estado="parado" tema="galaxia" tamanho={72} />
              </div>
            </Exemplo>
          </Secao>

          <Secao id="equipe" titulo="EquipeDock" descricao="Botão fixo no canto da tela (veja ali embaixo). Quando a equipe trabalha, quem está na ativa aparece junto do principal.">
            <Exemplo
              titulo="painel da equipe"
              codigo={`
<EquipeDock estilo="vetor" agentes={[
  { chave: 'desk', nome: 'Alfred', estado: 'analisando', selo: 4, conteudo: <p>Feed do desk</p> },
  { chave: 'sdr', nome: 'SDR', estado: 'falando' },      // na ativa: aparece no botão
  { chave: 'cred', nome: 'Cred', estado: 'analisando' },
  { chave: 'bi', nome: 'BI', estado: 'desligado' },       // sem conteúdo: "Em breve."
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
        )}
      </div>

      <EquipeDock
        estilo="vetor"
        agentes={[
          { chave: 'desk', nome: 'Alfred', estado: 'analisando', selo: 4, conteudo: <p className="text-sm">Feed do desk</p> },
          { chave: 'sdr', nome: 'SDR', estado: 'falando' },
          { chave: 'cred', nome: 'Cred', estado: 'analisando' },
          { chave: 'bi', nome: 'BI', estado: 'desligado' },
        ]}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
