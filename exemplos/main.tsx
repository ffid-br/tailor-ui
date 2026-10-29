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
  TailorSkeleton,
  TailorToaster,
  toast,
  TailorTypewriter,
  TailorResult,
  TailorBrand,
  TailorMobileBar,
  TailorPageHeader,
  TailorTable,
  sumBy,
  type TailorTableColumn,
  themeFromWhitelabel,
  type TailorWhitelabel,
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
const MARCAS: Record<string, { rotulo: string; wl: TailorWhitelabel | null }> = {
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

const COLUNAS: Array<TailorTableColumn<Corretor>> = [
  { key: 'id', header: 'ID', type: 'id', width: '90px' },
  { key: 'nome', header: 'Corretor', sortable: true },
  { key: 'equipe', header: 'Equipe', sortable: true },
  { key: 'leads', header: 'Leads', type: 'number', sortable: true, total: sumBy((c: Corretor) => c.leads) },
  { key: 'vendas', header: 'Vendas', type: 'number', sortable: true, total: sumBy((c: Corretor) => c.vendas) },
  { key: 'receita', header: 'Receita', type: 'currency', sortable: true, total: sumBy((c: Corretor) => c.receita) },
  { key: 'conversao', header: 'Conversão', type: 'percent', sortable: true,
    total: (ls: Corretor[]) => ls.reduce((s, c) => s + c.vendas, 0) / ls.reduce((s, c) => s + c.leads, 0) },
  { key: 'ultima', header: 'Última venda', type: 'date', sortable: true },
];

function CabecalhoComMarca() {
  const [marca, setMarca] = useState('vermelha');
  const { theme, dark } = themeFromWhitelabel(MARCAS[marca].wl);
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
      <TailorBrand theme={theme} dark={dark}>
        <TailorPageHeader
          eyebrow="Comercial"
          title="Leads"
          description="Quem chegou esta semana e o que falta para cada um avançar."
          breadcrumbs={[{ label: 'Início', href: '#cabecalho' }, { label: 'Comercial', href: '#cabecalho' }, { label: 'Leads' }]}
          badge={<span className="border border-current px-2 py-0.5 text-xs">Beta</span>}
          stats={[{ label: 'novos', value: 128 }, { label: 'sem resposta', value: 17 }]}
          actions={<button type="button" className="h-10 bg-black px-4 text-sm font-medium text-white dark:bg-white dark:text-black">Novo lead</button>}
        />
        <div className="mt-6">
          <TailorTable caption="Desempenho por corretor" columns={COLUNAS} rows={CORRETORES} rowKey={(c) => c.id}
            defaultSort={{ key: 'receita', direction: 'desc' }} pageSize={5} />
        </div>
      </TailorBrand>
    </div>
  );
}

/** Carrega 2,6s e mostra o sucesso; o botão repete. */
function SucessoDemo() {
  const [rodada, setRodada] = useState(0);
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    setPronto(false);
    const t = setTimeout(() => setPronto(true), 2618);
    return () => clearTimeout(t);
  }, [rodada]);
  return (
    <div className="grid gap-4">
      <TailorLoader key={`a${rodada}${pronto}`} success={pronto} label={pronto ? 'Relatório pronto' : 'Gerando relatório'} noPadding />
      <TailorLoader key={`b${rodada}${pronto}`} variant="compact" success={pronto} label={pronto ? 'Salvo' : 'Salvando'} />
      <button type="button" className="self-start border border-black px-3 py-2 text-xs font-medium dark:border-white" onClick={() => setRodada((r) => r + 1)}>Repetir</button>
    </div>
  );
}

/** Salvar: loader no botão, depois o sucesso no lugar do formulário e o aviso. */
function FormularioDemo() {
  const [fase, setFase] = useState<'editando' | 'salvando' | 'salvo'>('editando');
  const [nome, setNome] = useState('Maria Souza');
  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    setFase('salvando');
    setTimeout(() => { setFase('salvo'); toast.success('Contato salvo', { description: nome }); }, 1618);
  };
  if (fase === 'salvo') {
    return (
      <div className="grid justify-items-center gap-4">
        <TailorLoader success label="Contato salvo" detail={nome} noPadding />
        <button type="button" className="border border-black px-3 py-2 text-xs font-medium dark:border-white" onClick={() => setFase('editando')}>Editar de novo</button>
      </div>
    );
  }
  return (
    <form onSubmit={salvar} className="grid max-w-sm gap-3">
      <label className="grid gap-2 text-[13px] font-medium">
        Nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} disabled={fase === 'salvando'}
          className="h-10 border border-neutral-400 bg-transparent px-3 text-sm font-normal focus:border-black focus:outline-none dark:focus:border-white" />
      </label>
      <button type="submit" disabled={fase === 'salvando'}
        className="flex h-10 items-center justify-center bg-tailor-green px-4 text-sm font-medium text-black disabled:cursor-wait">
        {fase === 'salvando' ? <TailorLoader variant="compact" label="Salvando" className="text-black dark:text-black [--tailor-loader-dot:#000]" /> : 'Salvar'}
      </button>
    </form>
  );
}

/** Arte de parceiro fictícia, para o exemplo de loader com marca. */
const LOGO_PARCEIRO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="233" height="55" viewBox="0 0 233 55"><rect width="55" height="55" fill="#0040FF"/><text x="68" y="36" font-family="Arial" font-size="22" font-weight="700" fill="#0040FF">Imobiliária Sol</text></svg>');

/** Progresso que avança sozinho e recomeça. */
function ProgressoDemo() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setP((v) => (v >= 100 ? 0 : v + 4)), 300);
    return () => clearInterval(t);
  }, []);
  return (
    <TailorLoader logo={LOGO_PARCEIRO} label="Carregando funil" progress={p} noPadding
      steps={['Conectando ao servidor', 'Buscando leads', 'Organizando métricas', 'Montando gráficos']}
      messages={['Cruzando origens e etapas', 'Separando quem respondeu', 'Quase lá']} />
  );
}

/** Modal que termina em sucesso ou erro, recolhe no ponto e fecha. */
function ModalDemo() {
  const [aberto, setAberto] = useState(false);
  const [fase, setFase] = useState<'editando' | 'salvando' | 'sucesso' | 'erro'>('editando');
  const salvar = (falhar: boolean) => {
    setFase('salvando');
    setTimeout(() => setFase(falhar ? 'erro' : 'sucesso'), 1236);
  };
  const fechar = () => { setAberto(false); setFase('editando'); };
  return (
    <>
      <button type="button" className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black" onClick={() => setAberto(true)}>Abrir modal</button>
      {aberto && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 p-4">
          <div role="dialog" aria-modal="true" aria-label="Novo contato" className="relative w-full max-w-md overflow-hidden bg-white p-6 text-black dark:bg-neutral-950 dark:text-white">
            <h3 className="text-xl font-medium">Novo contato</h3>
            <label className="mt-4 grid gap-2 text-[13px] font-medium">
              Nome
              <input defaultValue="Maria Souza" className="h-10 border border-neutral-400 bg-transparent px-3 text-sm font-normal" />
            </label>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className="h-10 border border-black px-4 text-sm dark:border-white" onClick={fechar}>Cancelar</button>
              <button type="button" className="h-10 border border-black px-4 text-sm dark:border-white" disabled={fase === 'salvando'} onClick={() => salvar(true)}>Salvar com erro</button>
              <button type="button" className="flex h-10 items-center bg-tailor-green px-4 text-sm font-medium text-black" disabled={fase === 'salvando'} onClick={() => salvar(false)}>
                {fase === 'salvando' ? <TailorLoader variant="compact" label="Salvando" className="text-black dark:text-black [--tailor-loader-dot:#000]" /> : 'Salvar'}
              </button>
            </div>
            {fase === 'sucesso' && <TailorResult status="success" title="Contato salvo" description="Maria Souza entrou no funil Vendas" onClose={fechar} />}
            {fase === 'erro' && (
              <TailorResult status="error" title="Não deu para salvar" description="Sem conexão. Nada foi perdido."
                actions={<>
                  <button type="button" className="h-10 border border-white px-4 text-sm" onClick={() => setFase('editando')}>Voltar ao formulário</button>
                  <button type="button" className="h-10 bg-white px-4 text-sm font-medium text-black" onClick={() => salvar(false)}>Tentar de novo</button>
                </>} />
            )}
          </div>
        </div>
      )}
    </>
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
  { id: 'tabela', rotulo: 'TailorTable', icone: Quadrado },
  { id: 'loader', rotulo: 'TailorLoader', icone: Circulo },
  { id: 'feedback', rotulo: 'Avisos e esqueleto', icone: Circulo },
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
const { theme, dark } = themeFromWhitelabel(cliente.account_info.whitelabel);

<TailorBrand theme={theme} dark={dark}>
  <TailorPageHeader
    eyebrow="Comercial"
    title="Leads"
    description="Quem chegou esta semana e o que falta para cada um avançar."
    breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Comercial', href: '/comercial' }, { label: 'Leads' }]}
    stats={[{ label: 'novos', value: 128 }, { label: 'sem resposta', value: 17 }]}
    actions={<Botao>Novo lead</Botao>}
    renderLink={({ href, ...p }) => <NavLink to={href} {...p} />}
  />
</TailorBrand>`}
            >
              <CabecalhoComMarca />
            </Exemplo>
          </Secao>

          <Secao id="tabela" titulo="TailorTable" descricao="Tabela de relatório: formata por tipo, ordena, pagina, soma o total e veste a marca do cliente (veja acima, junto do cabeçalho).">
            <Exemplo
              titulo="relatório"
              codigo={`
const columns: TailorTableColumn<Corretor>[] = [
  { key: 'id', header: 'ID', type: 'id' },
  { key: 'nome', header: 'Corretor', sortable: true },
  { key: 'leads', header: 'Leads', type: 'number', sortable: true, total: sumBy((c) => c.leads) },
  { key: 'receita', header: 'Receita', type: 'currency', sortable: true, total: sumBy((c) => c.receita) },
  { key: 'conversao', header: 'Conversão', type: 'percent' },   // fração: 0,125 = 12,5%
  { key: 'ultima', header: 'Última venda', type: 'date' },
  { key: 'status', header: 'Status', cell: (c) => <Badge>{c.status}</Badge> },
];

<TailorTable
  caption="Desempenho por corretor"
  columns={columns}
  rows={agents}
  rowKey={(c) => c.id}
  defaultSort={{ key: 'receita', direction: 'desc' }}
  pageSize={20}                 // ou pagination={{ page, totalPages, onPageChange, totalRows }} (servidor)
  loading={isLoading}
  onRowClick={(c) => navigate(\`/corretores/\${c.id}\`)}
/>`}
            >
              <TailorTable caption="Desempenho por corretor (sem marca)" columns={COLUNAS} rows={CORRETORES} rowKey={(c) => c.id}
                defaultSort={{ key: 'leads', direction: 'desc' }} pageSize={4} stickyHeader />
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
            <Exemplo titulo="parceiro, progresso e mensagens" codigo={`<TailorLoader\n  logo={whitelabel.logos.rectangular_light}\n  logoDark={whitelabel.logos.rectangular_dark}\n  label="Carregando funil"\n  progress={progress}\n  steps={['Conectando ao servidor', 'Buscando leads', 'Organizando métricas', 'Montando gráficos']}\n  messages={['Cruzando origens e etapas', 'Separando quem respondeu', 'Quase lá']}\n/>`}>
              <ProgressoDemo />
            </Exemplo>
            <Exemplo titulo="sucesso" codigo={`<TailorLoader success label="Relatório pronto" />\n<TailorLoader variant="compact" success label="Salvo" />`}>
              <SucessoDemo />
            </Exemplo>
            <Exemplo titulo="overlay" codigo={`<TailorLoader variant="overlay" label="Entrando" />`}>
              <button type="button" className={botao} onClick={() => setOverlay(true)}>Mostrar por 2s</button>
              {overlay && <TailorLoader variant="overlay" label="Entrando" />}
            </Exemplo>
          </Secao>

          <Secao id="feedback" titulo="Avisos, esqueleto e formulário" descricao="O mesmo retorno em todo app: esqueleto enquanto chega, loader no botão, sucesso que se vê de longe.">
            <Exemplo titulo="TailorToaster + toast" codigo={`// uma vez, perto da raiz\n<TailorToaster />\n\n// em qualquer lugar, até fora de componente\ntoast.success('Contato salvo', { description: 'Maria Souza entrou no funil Vendas' });\ntoast.error('Não deu para salvar', { description: 'Sem conexão. Tente de novo.' });\ntoast.info('Sincronizando contatos');`}>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={botao} onClick={() => toast.success('Contato salvo', { description: 'Maria Souza entrou no funil Vendas' })}>Sucesso</button>
                <button type="button" className={botao} onClick={() => toast.error('Não deu para salvar', { description: 'Sem conexão. Tente de novo.' })}>Erro</button>
                <button type="button" className={botao} onClick={() => toast.info('Sincronizando contatos')}>Info</button>
              </div>
            </Exemplo>
            <Exemplo titulo="modal concluído (TailorResult)" codigo={`<div className="relative ...">   {/* o painel do modal */}\n  ...formulário...\n  {ok && <TailorResult status="success" title="Contato salvo" description="Maria Souza" onClose={fechar} />}\n  {erro && <TailorResult status="error" title="Não deu para salvar" actions={<button>Tentar de novo</button>} />}\n</div>`}>
              <ModalDemo />
            </Exemplo>
            <Exemplo titulo="TailorTypewriter" codigo={`<TailorTypewriter texts={['Cruzando origens e etapas', 'Separando quem respondeu', 'Quase lá']} />`}>
              <p className="text-2xl font-medium"><TailorTypewriter texts={['Cruzando origens e etapas', 'Separando quem respondeu', 'Quase lá']} /></p>
            </Exemplo>
            <Exemplo titulo="formulário" codigo={`<button disabled={salvando}>\n  {salvando ? <TailorLoader variant="compact" label="Salvando" /> : 'Salvar'}\n</button>\n\n// deu certo: o formulário vira o sucesso, e o aviso confirma\n{salvo && <TailorLoader success label="Contato salvo" detail="Maria Souza" />}`}>
              <FormularioDemo />
            </Exemplo>
            <Exemplo titulo="TailorSkeleton" codigo={`<TailorSkeleton />                          {/* texto */}\n<TailorSkeleton shape="cards" lines={3} />\n<TailorSkeleton shape="table" columns={4} />\n<TailorSkeleton shape="block" height="144px" />\n<TailorTable loading ... />            {/* já usa o esqueleto */}`}>
              <div className="grid gap-8">
                <TailorSkeleton />
                <TailorSkeleton shape="cards" lines={3} />
                <TailorSkeleton shape="table" columns={4} lines={4} />
                <TailorSkeleton shape="block" />
              </div>
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

      <TailorToaster />
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
