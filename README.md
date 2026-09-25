# @ffid-br/tailor-ui

Primitivos de marca da Tailor.ia em React: a fita métrica de carregamento, a abertura cinematográfica, o ponto com a malha Fibonacci, a transição login → app e o lockup do produto. Antes, cada app mantinha uma cópia desses componentes. Agora todos vêm deste pacote.

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
