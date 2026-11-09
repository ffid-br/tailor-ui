# @ffid-br/tailor-ui

Primitivos de marca da Tailor.ia em React: o loader com o ponto verde e a malha Fibonacci, a abertura cinematográfica, o ponto com a malha Fibonacci, a transição login → app, o lockup do produto e a barra lateral padrão dos apps. Antes, cada app mantinha uma cópia desses componentes. Agora todos vêm deste pacote.

## Instalação

```bash
npm install @ffid-br/tailor-ui
```

Dependências de pares (peer): `react`, `react-dom` e `framer-motion` (10, 11 ou 12). Na prática o framer-motion 10+ exige React 18.

## Configuração no app (Tailwind v4)

No CSS de entrada do app, logo depois de `@import "tailwindcss";`:

```css
@import "tailwindcss";
@import "@ffid-br/tailor-ui/theme.css";   /* tokens: tailor-green, tailor-green-ink, tailor-border, font-tailor... */
@import "@ffid-br/tailor-ui/style.css";   /* animações: loader, ponto, entrada */
@source "../node_modules/@ffid-br/tailor-ui/dist";
```

- `theme.css` é um bloco `@theme` que cria as classes nomeadas (`bg-tailor-green`, `text-tailor-green-ink`, `fill-tailor-green`, `font-tailor`, `font-tailor-num`). Se o app já define esses tokens, pode pular esta linha.
- `style.css` traz só os tokens como variáveis CSS (`--tailor-green`...) e os keyframes dos componentes, todos respeitando `prefers-reduced-motion`.
- `@source` faz o Tailwind do app ler as classes usadas nos componentes. O caminho é relativo ao arquivo CSS: ajuste se ele não estiver em `src/`.

A fonte Raleway (e a Roboto, para números) é carregada pelo app.

## Componentes

### `TailorLoader`

```tsx
<TailorLoader />                                        {/* inline: "Carregando..." */}
<TailorLoader variant="overlay" label="Entrando" />     {/* tela inteira, bloqueia a interação */}
<TailorLoader variant="compact" label="Salvando" />     {/* uma linha, para botão ou célula */}
<TailorLoader sucesso label="Relatório pronto" />     {/* depois de carregar: malha verde e check */}
<TailorLoader detail="3 de 5 contas" />
```

Sempre expõe `role="status"` com o rótulo.

### `CinematicIntro`

```tsx
<AnimatePresence>
  {mostrarIntro && (
    <CinematicIntro
      onComplete={() => setMostrarIntro(false)}
      produto="Pilot"             // opcional, aparece abaixo da marca
      slogan="Sua operação em outro nível"
      skipLabel="Pular"
    />
  )}
</AnimatePresence>
```

Se o usuário pediu menos movimento, chama `onComplete` na hora e não renderiza nada. `logo` troca o wordmark (whitelabel).

### `PontoMalha`

O ponto verde piscando com a malha Fibonacci. Ocupa o contêiner posicionado mais próximo e o fundo preto fica por conta de quem usa. `malha={false}` mostra só o ponto.

```tsx
<div className="relative h-[377px] bg-black"><PontoMalha /></div>
```

### `TailorBrandMark`

Lockup: wordmark com 21px de arte e o nome do produto em 18px semibold (tailor-green-ink no claro, branco no escuro). As logos padrão já vêm embutidas no pacote, então nada precisa ser copiado para o `public/`.

```tsx
<TailorBrandMark produto="Conta" />
<TailorBrandMark produto="Conta" compact />             {/* barra recolhida: só a palavra */}
<TailorBrandMark produto="Conta" onDark />              {/* menu sempre preto, independe do tema */}
<TailorBrandMark produto="Pilot" logoClaro={cliente.logo} logoEscuro={cliente.logoBranca} />
```

`logoTailor` e `logoTailorBranco` também são exportados (data URI) para outros usos.

### `AgenteMascote`

```tsx
<AgenteMascote agente="desk" nome="Alfred" estado="esperando" selo={4} />
<AgenteMascote agente="pm" nome="PM" estado="desligado" mostrarEstado celula={6} />
```

Personagem 8x8 de cada agente (`desk`, `pergunte`, `pm`, `diretor`), com um único ponto verde. `estado`: `analisando`, `esperando`, `feito` (padrão), `subiu`, `desligado`. O estado vai no rótulo acessível e, com `mostrarEstado`, aparece como ponto quadrado + texto. `celula` é o lado de cada quadradinho em px (padrão 4). Anima em degraus; com menos movimento, para.

#### Estilo vetor

```tsx
<AgenteMascote agente="desk" nome="Alfred" estilo="vetor" estado="parado" tamanho={96} />
<AgenteMascote agente="sdr" nome="SDR" estado="falando" fala="Achei 3 leads quentes." tamanho={96} />
<AgenteMascote agente="pm" nome="PM" estilo="vetor" estado="parado" expressao="bravo" />
<AgenteMascote agente="pilot" nome="Pilot" estado="analisando" tema="natal" />
```

O companheiro animado: olha o cursor, pisca e muda de movimento por estado. Expressão só nos olhos, sem boca nem braços.

- Agentes: `desk`, `pergunte`, `pm`, `diretor` (também em pixel) e `sdr`, `cred`, `score`, `pilot`, `flow`, `bi`, `rh`, `cs` (só vetor: saem em vetor mesmo sem `estilo`).
- Estados: os cinco do pixel e mais `parado`, `cumprimentando`, `falando`, `erro`. No vetor, `analisando` pensa, `feito` fala, `subiu` comemora, `desligado` dorme.
- `expressao`: `neutro`, `feliz`, `piscando`, `surpreso`, `bravo`, `triste`, `desconfiado`, `sonolento`, `tonto`. Sem ela, vale o olhar do estado.
- `tema` veste acessório + objeto: `natal`, `pascoa`, `aniversario`, `halloween`, `copa`, `galaxia`, `premiacao`. Ou solto: `acessorio` (`gorro`, `orelhas`, `festa`, `bruxa`, `bone`, `capacete`, `coroa`) e `objeto` (`presente`, `ovo`, `bolo`, `abobora`, `bola`, `sabre`, `trofeu`).
- `fala` aparece num balão preto (a partir de 48px) e entra no rótulo acessível.
- `tamanho` é a largura em px (padrão `celula * 8`). `superficie`: `auto` segue o `dark:` do app; `clara`/`escura` travam.

### `EquipeDock`

```tsx
<EquipeDock agentes={[
  { chave: 'desk', nome: 'Alfred', estado: 'esperando', selo: 4, conteudo: <FeedDoDesk /> },
  { chave: 'pergunte', nome: 'Pergunte' },   // sem conteúdo: "Em breve."
]} />
```

Botão fixo no canto com o mascote do primeiro agente e a soma dos selos. Abre um painel com uma aba por agente. `estilo="vetor"` vale para todos os mascotes do dock.

Equipe trabalhando: quem está na ativa (`analisando`, `falando`, `esperando`, `erro`) aparece no botão ao lado do principal, até três e depois `+N`. Ex.: o assistente do CRM como primeiro agente e os especialistas que ele acionou.

### `TailorSidebar`

Barra lateral padrão do accounts, CRM, BI e Pilot. **Uma lista de itens desenha as duas formas**: a barra fixa a partir do breakpoint (expandida com 288px ou recolhida em trilho de 80px, só ícones) e a gaveta no celular. O app não mantém mais uma nav para o `<aside>` e outra para o drawer.

- Estrutura: marca + recolher (55px) · seletor de contas + apps · grupos · `rodape` · "Powered by" opcional.
- Item com 34px de altura (44px na gaveta, alvo de toque), ícone de linha 18px (traço 1,5), texto 14px. Ativo: fundo `neutral-100`, barra verde de 2px à esquerda e texto preto; no escuro, `white/10` e texto branco. Ícone não ganha cor.
- Badge: chip quadrado preto (branco no escuro) com números tabulares; `badgeTom: 'alerta'` pinta de vermelho. Acima de 99 vira `99+`. No trilho vira um ponto e a contagem vai para o `aria-label`.
- `filhos`: o item pai vira um botão que abre e fecha a lista (abre sozinho se um filho está ativo). Quer link para a página do pai? Ponha um filho "Visão geral". No trilho, clicar no pai expande a barra.
- `superficie`: `auto` (branco no claro, `neutral-950` no escuro), `clara` ou `escura` (preto fixo, para o admin do accounts).
- A barra fixa usa `max-lg:hidden!` e a gaveta/barra do celular `lg:hidden!` (ou `md`, via `breakpoint`). O `!` é de propósito: o CSS do account-selector-component carrega depois do app e o `.flex` dele venceria um `hidden` comum.
- O `<aside>` é `sticky top-0 h-screen`: funciona num layout `flex` com a página ao lado. Quem usa `fixed` + `ml-72` passa a posição por `className`.
- Acessibilidade: `<nav aria-label>`, `aria-current="page"` no ativo, `title` + `aria-label` no trilho, anel de foco `tailor-green/60`, `motion-reduce`. A gaveta é um `role="dialog"`: prende o foco, fecha no Esc, no fundo (preto 55%) e ao navegar, e devolve o foco a quem abriu.

```tsx
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle, LayoutDashboard, LogOut, UserCog } from 'lucide-react';
import { TailorSidebar, TailorMobileBar, TailorUserMenu, type TailorSidebarGrupo } from '@ffid-br/tailor-ui';

function Layout() {
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(false);
  const [recolhido, setRecolhido] = useState(() => localStorage.getItem('sidebar_collapsed') === '1');
  const recolher = (v: boolean) => { setRecolhido(v); localStorage.setItem('sidebar_collapsed', v ? '1' : '0'); };

  const grupos: TailorSidebarGrupo[] = [
    {
      rotulo: 'Geral',
      itens: [
        { id: 'inicio', rotulo: 'Início', icone: Home, href: '/', ativo: pathname === '/' },
        { id: 'msg', rotulo: 'Mensagens', icone: MessageCircle, href: '/mensagens', ativo: pathname.startsWith('/mensagens'), badge: pendentes },
        {
          id: 'painel', rotulo: 'Painel', icone: LayoutDashboard,
          filhos: [{ id: 'painel-geral', rotulo: 'Visão geral', icone: LayoutDashboard, href: '/painel', ativo: pathname === '/painel' }],
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen">
      <TailorSidebar
        produto="Conta"
        logoClaro={logos?.claro}             // whitelabel: substitui o wordmark...
        logoEscuro={logos?.escuro}
        poweredBy={Boolean(logos)}           // ...e aí o "Powered by Tailor.ia" aparece
        superficie={pathname.startsWith('/admin') ? 'escura' : 'auto'}
        grupos={grupos}
        accountSelector={<AccountSelector {...} />}
        apps={<AppLauncher />}
        recolhido={recolhido}
        onRecolher={recolher}
        aberto={aberto}
        onFechar={() => setAberto(false)}
        renderLink={(item, props) => <NavLink to={item.href!} {...props} />}
        rodape={
          <TailorUserMenu
            nome={usuario.nome}
            detalhe={usuario.email}
            papel="Administrador"
            avatarUrl={usuario.avatar}
            acoes={[
              { rotulo: 'Meu perfil', icone: UserCog, href: '/perfil' },
              { rotulo: 'Sair', icone: LogOut, tom: 'perigo', onSelect: sair },
            ]}
          >
            <ThemeToggle />                  {/* conteúdo livre: tema, notificações push */}
          </TailorUserMenu>
        }
      />
      <div className="min-w-0 flex-1">
        <TailorMobileBar produto="Conta" onAbrirMenu={() => setAberto(true)} menuAberto={aberto} apps={<AppLauncher />} />
        <main>...</main>
      </div>
    </div>
  );
}
```

Notas para quem migra:

- `renderLink` recebe `className`, `children`, `aria-current`, `onClick` (fecha a gaveta) e, no trilho, `title`/`aria-label`. Repasse tudo. `ativo` continua vindo do app (ele sabe a regra de rota, ex.: `startsWith`). Sem `renderLink`, sai um `<a href>`.
- Item sem `href` e com `onSelect` vira botão de ação. `desabilitado` mostra o item apagado e sem clique (o "Em breve" do Pilot).
- Casos especiais (a sub-nav do Orchestrator, o aviso de status) entram como `grupos` próprios ou como `children`, montados com `SidebarGroup` e `SidebarItem`, que também são exportados.
- `marca` troca o lockup inteiro (ex.: logo do cliente com link para o início). `marcaRecolhida` aparece no trilho, acima do botão de expandir.
- Sem `onRecolher`, o botão de recolher não aparece.
- As classes novas estão no `dist`, então o `@source` da configuração já as cobre.

### `TailorPageHeader` e a marca do cliente

```tsx
import { TailorBrand, TailorPageHeader, themeFromWhitelabel } from '@ffid-br/tailor-ui';

const { theme, dark } = themeFromWhitelabel(client.account_info?.whitelabel);

<TailorBrand theme={theme} dark={dark}>
  <TailorPageHeader
    eyebrow="Comercial"
    title="Leads"
    description="Quem chegou esta semana e o que falta para cada um avançar."
    breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Leads' }]}
    back={{ label: 'Voltar', onClick: () => navigate(-1) }}
    badge={<Badge>Beta</Badge>}
    stats={[{ label: 'Novos', value: 128 }, { label: 'Sem resposta', value: 17, tone: 'danger' }]}
    actions={<Button>Novo lead</Button>}
    renderLink={({ href, ...p }) => <NavLink to={href} {...p} />}
  >
    <Tabs />                                {/* abaixo, na largura toda */}
  </TailorPageHeader>
</TailorBrand>
```

O visual vem só de variáveis CSS. Sem tema, vale o padrão Tailor; com tema, o cabeçalho veste a marca do cliente.

- `--tailor-brand-*` (todas as peças que aceitam marca): `primary`, `primary-text`, `text`, `text-muted`, `border`, `background`, `heading-font`, `body-font`, `heading-weight`, `heading-case`, `radius`. Os padrões ficam em `:where()`, então qualquer CSS do app sobrescreve.
- `--tailor-header-*` (só o cabeçalho): `background`, `padding`, `rule`, `title-size`.
- `TailorBrand` aplica um `TailorTheme` (e o `dark`, sob `.dark` ou `[data-theme="dark"]`) sem mexer no layout.
- `themeFromWhitelabel` traduz `account_info.whitelabel` do Mongo. Ignora o azul padrão do cadastro (`#007bff`, que 107 clientes têm sem ter escolhido) e o que não for hex. A primária só vira cor de texto com contraste AA sobre o fundo. Lê também os campos propostos `colors.text_muted`, `colors.border`, `colors.dark.*`, `fonts.heading/body/heading_weight/heading_case` e `shape.radius`.
- A fonte do cliente é carregada pelo app (ex.: link do Google Fonts).

### `TailorTable`

```tsx
import { TailorTable, sumBy, type TailorTableColumn } from '@ffid-br/tailor-ui';

const columns: TailorTableColumn<Agent>[] = [
  { key: 'id', header: 'ID', type: 'id' },
  { key: 'name', header: 'Corretor', sortable: true },
  { key: 'leads', header: 'Leads', type: 'number', sortable: true, total: sumBy((a) => a.leads) },
  { key: 'revenue', header: 'Receita', type: 'currency', sortable: true, total: sumBy((a) => a.revenue) },
  { key: 'conversion', header: 'Conversão', type: 'percent' },
  { key: 'status', header: 'Status', cell: (a) => <Badge>{a.status}</Badge> },
];

<TailorTable caption="Desempenho por corretor" columns={columns} rows={agents}
  rowKey={(a) => a.id} defaultSort={{ key: 'revenue', direction: 'desc' }} pageSize={20} />
```

Tabela de relatório. `type` formata e alinha: `number`, `currency` e `percent` (recebe fração: 0,125 = 12,5%) vão à direita com números tabulares; `date` no formato do idioma; `id` em mono; vazio vira traço.

- Ordenação: sozinha no navegador (`defaultSort`), ou controlada pelo servidor com `sort` + `onSortChange`. `aria-sort` no cabeçalho.
- Paginação: `pageSize` (navegador) ou `pagination={{ page, totalPages, onPageChange, totalRows }}` (servidor).
- `total` por coluna monta a linha de total, calculada sobre todas as linhas, não só a página. `sumBy` ajuda.
- `loading` mostra o esqueleto da tabela; `empty` troca o texto de vazio; `onRowClick` deixa a linha clicável (Enter também); `stickyHeader` prende o cabeçalho.
- `renderExpanded(row)` abre um detalhe embaixo da linha, na largura da tabela (formulário, mensagem). O app controla o que está aberto: devolva `null` para a linha fechada.
- Visual por `--tailor-brand-*` e `--tailor-table-*` (`font`, `padding`, `header-padding`, `header`, `sticky-top`, `top`, `background`).

### `TailorStat`, `TailorStatGroup`

```tsx
<TailorStatGroup label="Resumo da semana">
  <TailorStat label="Respostas" value={312} previous={260} meaning="de cada 10 que leram, 3 responderam" />
  <TailorStat label="Custo por lead" value={18.4} format="currency" previous={15} goodWhen="down" />
  <TailorStat label="Vendas" value={42} goal={60} href="/vendas" />
</TailorStatGroup>
```

Props: `label`, `value`, `format` (`number` | `currency` | `percent` | `text`), `previous` ou `delta` (fração), `goal`, `meaning`, `goodWhen` (`up` padrão | `down`), `hint`, `loading`, `variant` (`default` | `compact` | `inline`), `onClick`/`href`. A variação sai de `previous` com seta, sinal e texto para leitor de tela; a cor segue `goodWhen`. `statDelta(valor, anterior)` expõe a conta. O grupo (`minWidth`, `bordered`) quebra de linha sozinho, sem cartões.

### `TailorEmpty`

```tsx
<TailorEmpty title="Nenhuma campanha ainda" description="Crie a primeira."
  action={{ label: 'Criar campanha', onClick: criar }} secondaryAction={{ label: 'Ver exemplo', href: '/exemplo' }} />
```

`action` e `secondaryAction` aceitam `onClick` ou `href`. `illustration` troca a marca discreta padrão.

### `TailorMonogram`

```tsx
<TailorMonogram id={user.id} name="Maria da Silva" size="md" src={user.photo} />
```

Duas letras (primeira e última palavra, sem de/da/do). A cor vem de um hash estável do `id` sobre 8 pares `--tailor-mono-N-bg/fg` com contraste AA, nos dois temas: o mesmo `id` tem a mesma cor em todo app. `src` vence as iniciais e, se falhar, elas voltam.

### `TailorInsight`

```tsx
<TailorInsight status="ready" takeaway="As respostas subiram 20%." why="A mensagem nova é mais curta."
  nextAction={{ label: 'Repetir a mensagem', onClick: repetir }} sources={['Campanhas de outubro']}
  confidence="alta" generatedAt={new Date()} onRefresh={atualizar} onFeedback={(v) => salvar(v)} />
```

Só a interface da leitura da IA; o texto vem do app. `status`: `loading` (máquina de escrever + esqueleto), `ready`, `error` (diz o que fazer; `onRefresh` vira "Tentar de novo") e `empty`. Sempre marcada "Gerado por IA", com fontes e confiança em texto.

## Idioma e moeda

Os textos dos componentes ("Carregando", "Página 1 de 2", "Próxima") e a formatação de número, moeda e data seguem o `TailorLocaleProvider`. Sem ele: pt-BR e BRL.

```tsx
<TailorLocaleProvider locale="en" currency="USD">
  <App />
</TailorLocaleProvider>

// trocar um texto só
<TailorLocaleProvider locale="pt-BR" messages={{ empty: 'Nada por aqui.' }}>
```

Vêm `pt-BR` e `en`; outro idioma usa os textos em inglês e formata números e datas no próprio idioma.

## Retorno padrão: esqueleto, loader, sucesso e avisos

Um jeito só em todo app:

| Momento | Use |
|---|---|
| Tela ou bloco chegando | `<TailorSkeleton />` com `shape` `text`, `table`, `cards` ou `block` |
| Carregamento sem forma conhecida | `<TailorLoader />` |
| Campo obrigatório vazio ou inválido | `<TailorField label="Nome" required error="Preencha o nome."><input /></TailorField>`: borda e ponto vermelhos, mensagem ligada ao campo |
| Botão | `<TailorButton loading={saving} loadingText="Salvando" done={saved}>Salvar</TailorButton>` |
| Ícone girando num botão | `{saving ? <TailorLoader variant="dot" label="Salvando" /> : <SaveIcon />}` |
| Botão salvando | `<TailorLoader variant="compact" label="Salvando" />` dentro do botão |
| Formulário salvo | `<TailorLoader success label="Contato salvo" />` no lugar do formulário + `toast.success(...)` |
| Modal concluído (ou falhou) | `<TailorResult status="success" title="Contato salvo" onClose={close} />` dentro do painel (`position: relative`) |
| Relatório de parceiro carregando | `<TailorLoader logo={...} logoDark={...} progress={p} steps={[...]} messages={[...]} />` |
| Retorno de ação em qualquer tela | `toast.success`, `toast.error`, `toast.info` |

```tsx
// uma vez, perto da raiz
<TailorToaster />

// em qualquer lugar, até fora de componente
toast.success('Contato salvo', { description: 'Maria Souza entrou no funil Vendas' });
toast.error('Não deu para salvar', { description: 'Sem conexão. Tente de novo.' }); // fica 8s, role="alert"
```

`<TailorTypewriter texts={[...]} />` é o efeito do ponto escrevendo, solto, para usar onde quiser.

Num botão da cor da marca, troque a cor do ponto do loader: `className="[--tailor-loader-dot:#000]"`.

## Explicar a tela: TailorExplain, TailorGlossary e TailorTour

```tsx
<TailorPageHeader title="Leads" description="Quem chegou esta semana." />
<TailorExplain storageKey="leads" items={[{ label: 'Novo', text: 'Chegou nas últimas 24 horas.' }]}>
  Aqui você acompanha cada lead até virar cliente.
</TailorExplain>

<p>O <TailorGlossary term="SLA">Prazo combinado para responder.</TailorGlossary> vence hoje.</p>

<button data-tour="novo-lead">Novo lead</button>
<TailorTour storageKey="leads" steps={[{ target: 'novo-lead', title: 'Novo lead', text: 'Comece por aqui.' }]} />
```

- `TailorExplain`: `title` (padrão "Como ler esta tela"), `children` ou `items` (`{ label, text }[]`), `storageKey` (lembra aberto/recolhido), `defaultOpen` (true). Fica abaixo do `TailorPageHeader`.
- `TailorGlossary`: `term`, `children` (a definição). Abre por mouse, toque ou Enter/Espaço; Esc fecha; o balão não empurra o texto.
- `TailorTour`: `steps` (`{ target, title, text }`; `target` é o valor de `data-tour` ou um seletor CSS), `open` (true), `storageKey` (conclusão ou pulo lembrados), `onClose`, `onSkip`. Passo sem elemento na tela é pulado; `resetTour(storageKey)` deixa refazer. Sem animação com `prefers-reduced-motion`.
- `TailorResult celebrate`: no sucesso, painel Ink com check Lime e uma rajada curta de faíscas; parada com `prefers-reduced-motion`.

## Ícones dos apps e entrada entre apps

Cada app tem um ícone (o favicon) e um nome, num registro só (`TAILOR_APPS`): `accounts` (Accounts, C), `crm` (Studio, R), `pilot` (Pilot, M), `bi` (BI, B), `genius` (Genius, G) e `nr1` (NR1, N). A diferença é a letra primeiro e a cor depois, na grade 8x8 com o ponto verde logo depois da letra; em 16px nenhum par se confunde. O mesmo registro alimenta o launcher, a barra lateral e a transição.

```tsx
import { TailorAppIcon, appPorChave, tailorTitle } from '@ffid-br/tailor-ui';

<TailorAppIcon app="pilot" size={34} />          {/* também aceita a chave do /clients/uses: "gpt", "ffid.ai.studio" */}
appPorChave('gpt')?.nome;                         // "Genius"
document.title = tailorTitle('pilot', 'Campanhas'); // "Campanhas | Pilot | Tailor.ia"
```

**Título da aba:** `<Página> | <App> | Tailor.ia` (sem página: `<App> | Tailor.ia`). Com várias abas o navegador corta o título e sobra o começo: quem separa um app do outro é o ícone, não o texto.

**Favicon no `index.html`** (copie do pacote para o `public/` ou importe pelo bundler):

```html
<link rel="icon" type="image/svg+xml" href="/icons/apps/pilot.svg" />
```

Os arquivos saem em `@ffid-br/tailor-ui/icons/apps/<app>.svg`. Mudou o desenho em `src/apps.ts`? Rode `npm run icones` e commite os SVGs (um teste confere que estão em dia).

### `TailorHandoff`: entrar em outro app com token na URL

Cobre a viewport enquanto o destino valida o `ffid_jwt`, com a geometria do app (barra lateral de 288px com a marca no topo, barra de 55px no celular). Quando some, o app já está embaixo no mesmo lugar: nada pula. Menos movimento: sem fade.

```tsx
import { TailorHandoff, handoffPendente } from '@ffid-br/tailor-ui';

// handoffPendente() no estado inicial: o primeiro quadro já é a transição, sem login nem app vazio.
const [validando, setValidando] = useState(handoffPendente);
const [recusou, setRecusou] = useState(false);

<TailorHandoff app="pilot" ativo={validando} falhou={recusou} onTentarDeNovo={() => (location.href = '/login')} />
```

- `falhou`: troca o loader por "Não foi possível entrar" e a ação "Entrar de novo".
- `timeoutMs` (13000): sem resposta nesse tempo, avisa que está demorando e oferece a mesma ação.
- `sidebar`: `expandida` (padrão), `recolhida` ou `nenhuma`; `breakpoint`: `lg` (padrão) ou `md`, o mesmo da `TailorSidebar`.
- `TailorHandoffSaida app="crm" ativo`: avisinho "Abrindo Studio" no canto (`rotulo` troca o texto) do app de origem, para o clique no launcher.

## Receita: transição login → app

1. **No login**: marque a entrada ao enviar, desmarque se der erro e mostre o preto crescendo do botão.

```tsx
import { EntrarOverlay, marcarEntradaPendente, limparEntradaPendente } from '@ffid-br/tailor-ui';

const botaoRef = useRef<HTMLButtonElement>(null);

async function entrar(e: React.FormEvent) {
  e.preventDefault();
  setEntrando(true);
  marcarEntradaPendente();
  try {
    await login(email, senha);
    navigate('/');              // o preto continua na EntradaApp
  } catch {
    limparEntradaPendente();
    setEntrando(false);         // o círculo recolhe
  }
}

return (
  <>
    <EntrarOverlay ativo={entrando} origemRef={botaoRef} />
    <form onSubmit={entrar}>
      ...
      <button ref={botaoRef} type="submit">Entrar</button>
    </form>
  </>
);
```

2. **No layout logado**: monte a `EntradaApp` uma vez e marque o contêiner cujos filhos devem entrar em sequência.

```tsx
import { EntradaApp } from '@ffid-br/tailor-ui';

<>
  <EntradaApp />
  <main>
    <div data-tailor-entrada-alvo className="grid ...">
      <Card /> <Card /> <Card />
    </div>
  </main>
</>
```

A `EntradaApp` aparece quando há entrada pendente (`sessionStorage['tailor_entrada_pendente']`) ou na primeira visita da aba. São 1,618s de preto com o ponto piscando e 0,618s recolhendo de baixo para cima. Durante esse tempo, `<html data-entrada>` faz os filhos de `[data-tailor-entrada-alvo]` subirem 21px, um depois do outro. Com menos movimento, o app aparece direto.

## Por que não embutimos Tailwind

O `style.css` deste pacote não traz preflight nem utilitários do Tailwind, e isso é proposital. No `account-selector-component` o CSS publicado levava um build inteiro do Tailwind. Esse CSS carregava depois do CSS do app, então os utilitários do pacote venciam os responsivos do host (`.hidden` derrubava `lg:flex`), redefiniam tokens e o preflight resetava a página (ver [ffid-br/account-selector-component#2](https://github.com/ffid-br/account-selector-component/issues/2)). Aqui os componentes só usam classes, e quem gera o CSS delas é o Tailwind do próprio app, via `@source`. Assim existe uma única versão do Tailwind na página.

Cores só por tokens nomeados (`tailor-green`, `tailor-green-ink`, `black`, `white`, `neutral-*`). Nada de `[#hex]`.

## Desenvolvimento

```bash
npm install
npm test         # vitest + testing-library
npm run exemplos # página com todos os componentes ao vivo + código (exemplos/)
npm run build    # dist/: index.es.js, index.umd.js, types/, style.css, theme.css, logos
```

Página pública: https://ffid-br.github.io/tailor-ui/ (publicada pelo workflow `exemplos.yml` a cada push na `main`).


## Novidades (changelog do app)

```tsx
const NOVIDADES: TailorNovidade[] = [ // mais recente primeiro
  { id: '2026-11-02', data: '2026-11-02', tela: 'Campanhas', titulo: 'Filtro por período', itens: ['Escolha o intervalo no topo.'] },
];

<TailorNovidades novidades={NOVIDADES} chave="crm" usuario={user.id} />
```

Gatilho com contador verde das não vistas (9+); abrir marca como visto (localStorage `tailor-novidades:<chave>:<usuario>`). Para botão próprio: `useNovidades` (`{ naoVistas, marcarVistas }`) + `TailorNovidadesDialog` (`aberto`, `onFechar`, `novidades`, `limite = 5`). Substitui os avisos "O que mudou" nas telas.

## Mudanças

### 0.16.0

Espaçamento na escala da marca (4/8/16/24/40/64/104 px, `--tailor-space-*`). **Mudança visual intencional.** Empilha no 0.15.0.

- `padding`, `margin` e `gap` dos componentes saem da sequência crua (3/5/8/13/21/34/55/89) e passam a usar os tokens: 3 e 5 viram 4, 13 vira 16, 21 vira 24, 34 vira 40, 55 vira 64, 89 vira 104.
- Botão: padding md 24 (era 21), sm 16 (era 13), lg 40 (era 34). Campo: padding 16 (era 13). Cabeçalho de página, tabela, toaster, novidades, tour e sidebar acompanham.
- Classes Tailwind `p-[21px]` e similares nos componentes viram `p-tailor-md` (vêm do `theme.css`, que o app já importa).
- Botão de ícone já era 32/40/48 e o campo já usa padding 16 (não existe `sm` no campo); conferido contra a skill.
- Alturas, larguras e tamanhos de ícone não mudaram.

### 0.15.0

Tokens da marca (fonte: skill `tailor-brand-manual`). Aditivo e compatível.

- Novo `@ffid-br/tailor-ui/tokens.css` (também importado por `style.css`): cores (marca, cinzas, apoio, tints de estado, semânticos, foco, scrim), tipografia (escala, pesos 300 a 600), espaçamento 4/8/16/24/40/64/104/168, raio 0, curvas e durações, camadas `--tailor-z-*`. Tema escuro em `.dark`, `[data-theme="dark"]` e `.tailor-dark`.
- `theme.css` (Tailwind v4) ganha os mesmos tokens: `bg-tailor-green-press`, `text-tailor-green-ink`, `border-tailor-border`, `text-tailor-h2`, `p-tailor-md`, `ease-tailor-out`, etc.
- Novo `--tailor-green-ink` / `--color-tailor-green-ink` (#3C6600). **`tailor-ink` continua funcionando, mas está deprecado: significa verde escuro. Para preto use `tailor-black`.**
- Borda padrão passa de `#E5E5E5` para `#D9D9D9` (`--tailor-border`).
- Sem hex solto no CSS dos componentes; sem peso 700; sem sombra decorativa no `TailorTour` (ganha borda de 1 px).
- Foco único em todos os componentes: linha de 1 px e anel de 3 px em `--tailor-focus-ring`.
- Botão primário: hover em `--tailor-green-hover` (cor do cliente continua escurecendo a própria primária).
- `TailorTable`: célula vazia mostra `-`, não travessão.
- `TailorNovidadesDialog`: fundo em `--tailor-scrim` (55%).
- `TailorToaster`: continua no topo (direita no desktop, largura total no celular), agora com camada `--tailor-z-toast` (130, acima de modal e menu) e largura máxima de 420 px.
- Camadas dos componentes agora vêm da escala `--tailor-z-*`.
- `TailorStatGroup` `bordered`: o primeiro item perdia padding e borda esquerdos (a regra do primeiro filho vencia); agora todos iguais em grade e em coluna única.
- `TailorInsight`: `nextAction` vira botão secundário (a página já tem o primário).
- Tokens sincronizados com a skill atualizada: `--tailor-tracking-label` 0.14em (usado no overline e no cabeçalho de tabela), `--tailor-danger-hover`, `--tailor-black-hover`, `--tailor-fg-inverse-secondary`, `--tailor-danger-on-dark`, `--tailor-text-kpi` e `--tailor-text-kpi-app` (o `TailorStat` usa o kpi-app, 34 px).
- Teste de marca (`src/marca.test.ts`): falha com hex fora de `tokens.css`, `font-weight` 700 ou sombra decorativa.

### 0.14.0

- `TailorStat` e `TailorStatGroup`: número com variação, meta e significado.
- `TailorEmpty`, `TailorMonogram` (cor estável por id) e `TailorInsight` (leitura da IA).
- `TailorExplain`, `TailorGlossary`, `TailorTour` (e `resetTour`): explicar a tela, termos técnicos e tour guiado (QD-0528).
- `TailorResult`: prop `celebrate` para momentos de "concluído".
- Textos novos em pt-BR, en e es: `howToRead`, `gotIt`, `nextStep`, `step`, `skipTour`.

### 0.13.1

- Quem nunca abriu as Novidades conta só as dos últimos 30 dias.
- Dois botões na mesma tela (barra do celular e lateral) atualizam o contador juntos.

## 0.13.0
- `TailorNovidades`, `TailorNovidadesDialog` e `useNovidades`: changelog compartilhado dos apps. Textos em pt-BR, en e es (novo idioma `es` nos textos dos componentes).


### 0.10.0
- `TailorPageHeader`: os `stats` saem do lado do título e ganham uma faixa própria, abaixo dele. Cada número tem rótulo em cima, valor grande embaixo e um fio à esquerda. `tone` (`danger`, `warning`, `success`) pinta o fio e o número; `hint` vira o title. Algarismos alinhados (`lining-nums`), para o Raleway não desalinhar "598". A lateral fica só para `actions`.

### 0.8.0
- `TailorButton`: botão da marca (`primary`, `secondary`, `ghost`, `dark`, `danger`; `sm`/`md`/`lg`; só ícone). `loading` troca o ícone pelo ponto correndo e bloqueia o clique; `done` mostra o check. O primário segue `--tailor-brand-primary` e o texto `--tailor-brand-on-primary` (o `themeFromWhitelabel` escolhe preto ou branco pelo contraste).

### 0.7.1
- `TailorLoader variant="dot"`: só o ponto, do tamanho do ícone (1em), para trocar spinners dentro de botões. O rótulo vai para o leitor de tela.

### 0.7.0
API em inglês, pensando na internacionalização. O que saiu na 0.6.0 mudou de nome sem alias (nenhum app usava ainda); o que os apps já usam ganhou nome em inglês e o antigo segue funcionando até a 1.0.
- `TailorLocaleProvider`: idioma, moeda e textos dos componentes (`pt-BR` e `en`).
- `TailorTable`: tabela de relatório com formatação por tipo, ordenação, paginação, linha de total e marca do cliente.
- `TailorSkeleton`: esqueleto de texto, bloco, tabela e cartões com a linha verde varrendo.
- `TailorToaster` + `toast.success/error/info`: avisos da marca; o ponto escreve o título e vira check ou X.
- `TailorResult`: fim de modal ou formulário. O ponto do botão (`origin`) cresce até cobrir o painel com a cor do resultado, o título é escrito, e tudo recolhe no ponto antes de `onClose`.
- `TailorField`: rótulo, campo e mensagem; com `error`, borda e ponto vermelhos, um empurrão curto e `aria-invalid`/`aria-describedby`.
- `TailorTypewriter`: o ponto da marca como cursor; escreve, apaga e escreve a próxima frase.
- `TailorLoader`: o ponto corre uma espiral Fibonacci com rastro verde; `success`, `logo`/`logoDark`, `progress`, `steps`, `messages`; `variant="box"` e `noPadding` (os antigos `caixa` e `semRespiro` seguem valendo).
- 0.6.0 renomeada: `TailorMarca` → `TailorBrand`, `temaDoWhitelabel` → `themeFromWhitelabel`, `temaParaVariaveis` → `themeToVars`, `contraste` → `contrast`; props do `TailorPageHeader` em inglês; variáveis `--tailor-marca-*` → `--tailor-brand-*`, `--tailor-cabecalho-*` → `--tailor-header-*`.
- `CinematicIntro`: `overline` e `slogan` sem texto padrão.

### 0.6.0
- `TailorPageHeader`, `TailorMarca`, `temaDoWhitelabel`: cabeçalho de página que veste a marca do cliente por variáveis CSS. Segue `--color-tailor-green`/`-ink` do app quando definidos.
- Simulador de mascotes na página de exemplos (`#simulador`).

### 0.5.0
- `AgenteMascote` `estilo="vetor"`: 11 agentes, olhar que segue o cursor, 9 expressões nos olhos, temas de datas, acessórios, objetos e balão de fala. Estados novos: `parado`, `cumprimentando`, `falando`, `erro`.
- `EquipeDock`: prop `estilo` e equipe trabalhando no botão.
- Página de exemplos publicada em https://ffid-br.github.io/tailor-ui/.

### 0.4.0
- `AgenteMascote` e `EquipeDock`: mascotes 8x8 dos agentes e o painel da equipe (QD-0426).

### 0.2.0
- `TailorSidebar`: barra lateral padrão (marca, seletor de contas + apps, grupos, badges, subitens, trilho recolhido, gaveta no celular com a mesma lista, superfície `auto`/`clara`/`escura`, `renderLink` para o roteador).
- `TailorUserMenu`: menu do usuário para o rodapé, com conteúdo livre (tema) e ações.
- `TailorMobileBar`: barra do topo no celular (hambúrguer, marca, apps).
- `SidebarGroup` e `SidebarItem` exportados para montar navs especiais.

### 0.1.2
- `EntradaApp` toca sempre depois de um login e só depois de um login (marca pendente). Saiu o disparo na primeira visita da aba: reload e link direto entram sem o preto. A `CinematicIntro` segue sendo uma vez só, por cookie no app.

### 0.1.1
- A entrada em sequência (`data-tailor-entrada-alvo`) começa em 1,5s, enquanto o preto da `EntradaApp` recolhe. Na 0.1.0 os blocos terminavam de entrar ainda cobertos. Quem sobrescreveu `animation-delay` no app pode tirar a sobrescrita.
- `TailorLoader`: variante `caixa` (régua numa caixa de 377px com fundo e borda, para chat e painéis estreitos) e prop `semRespiro`.
- `TailorBrandMark`: prop `superficie` (`auto` | `clara` | `escura`) para travar a versão da marca sem depender do `dark:` do app.
