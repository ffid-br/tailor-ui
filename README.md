# @ffid-br/tailor-ui

Primitivos de marca da Tailor.ia em React: a fita métrica de carregamento, a abertura cinematográfica, o ponto com a malha Fibonacci, a transição login → app, o lockup do produto e a barra lateral padrão dos apps. Antes, cada app mantinha uma cópia desses componentes. Agora todos vêm deste pacote.

## Instalação

```bash
npm install @ffid-br/tailor-ui
```

Dependências de pares (peer): `react`, `react-dom` e `framer-motion` (10, 11 ou 12). Na prática o framer-motion 10+ exige React 18.

## Configuração no app (Tailwind v4)

No CSS de entrada do app, logo depois de `@import "tailwindcss";`:

```css
@import "tailwindcss";
@import "@ffid-br/tailor-ui/theme.css";   /* tokens: tailor-green, tailor-ink, font-tailor... */
@import "@ffid-br/tailor-ui/style.css";   /* animações: fita, ponto, entrada */
@source "../node_modules/@ffid-br/tailor-ui/dist";
```

- `theme.css` é um bloco `@theme` que cria as classes nomeadas (`bg-tailor-green`, `text-tailor-ink`, `fill-tailor-green`, `font-tailor`, `font-tailor-num`). Se o app já define esses tokens, pode pular esta linha.
- `style.css` traz só os tokens como variáveis CSS (`--tailor-green`...) e os keyframes dos componentes, todos respeitando `prefers-reduced-motion`.
- `@source` faz o Tailwind do app ler as classes usadas nos componentes. O caminho é relativo ao arquivo CSS: ajuste se ele não estiver em `src/`.

A fonte Raleway (e a Roboto, para números) é carregada pelo app.

## Componentes

### `TailorLoader`

```tsx
<TailorLoader />                                        {/* inline: "Tirando as medidas..." */}
<TailorLoader variant="overlay" label="Entrando" />     {/* tela inteira, bloqueia a interação */}
<TailorLoader variant="compact" label="Salvando" />     {/* uma linha, para botão ou célula */}
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
      overline="Alfaiataria digital"
      slogan="Tecnologia sob medida para a sua operação"
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

Lockup: wordmark com 21px de arte e o nome do produto em 18px semibold (tailor-ink no claro, branco no escuro). As logos padrão já vêm embutidas no pacote, então nada precisa ser copiado para o `public/`.

```tsx
<TailorBrandMark produto="Conta" />
<TailorBrandMark produto="Conta" compact />             {/* barra recolhida: só a palavra */}
<TailorBrandMark produto="Conta" onDark />              {/* menu sempre preto, independe do tema */}
<TailorBrandMark produto="Pilot" logoClaro={cliente.logo} logoEscuro={cliente.logoBranca} />
```

`logoTailor` e `logoTailorBranco` também são exportados (data URI) para outros usos.

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

Cores só por tokens nomeados (`tailor-green`, `tailor-ink`, `black`, `white`, `neutral-*`). Nada de `[#hex]`.

## Desenvolvimento

```bash
npm install
npm test         # vitest + testing-library
npm run build    # dist/: index.es.js, index.umd.js, types/, style.css, theme.css, logos
```


## Mudanças

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
