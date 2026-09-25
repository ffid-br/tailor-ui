import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../cn';
import { TailorBrandMark } from './TailorBrandMark';
import { logoTailor, logoTailorBranco } from '../logos';

/*
 * Barra lateral padrão dos apps Tailor (accounts, CRM, BI, Pilot).
 *
 * Uma lista de itens, um componente, dois formatos: a barra fixa (expandida ou
 * recolhida em trilho) a partir do breakpoint e a gaveta no celular. Antes cada
 * app mantinha duas navs, a do <aside> e a do drawer, e elas divergiam.
 *
 * Visibilidade responsiva sempre com `!` (`max-lg:hidden!`): o CSS publicado do
 * account-selector-component carrega depois do app e o `.flex` dele venceria o
 * `hidden` do host.
 */

export type SuperficieSidebar = 'auto' | 'clara' | 'escura';
export type BreakpointSidebar = 'md' | 'lg';

export type TailorSidebarItem = {
  id: string;
  rotulo: string;
  /** Ícone de linha (lucide, heroicons outline). Recebe só `className`. */
  icone: React.ComponentType<{ className?: string }>;
  href?: string;
  ativo?: boolean;
  /** Contagem ou marcador curto. `0` e `''` não aparecem. */
  badge?: number | string;
  /** `alerta` pinta o chip de vermelho. Padrão: neutro (preto/branco). */
  badgeTom?: 'neutro' | 'alerta';
  /** Subitens. O item pai vira um botão que abre e fecha a lista. */
  filhos?: TailorSidebarItem[];
  /** Chamado no clique. Sem `href`, o item vira um botão de ação. */
  onSelect?: () => void;
  /** Item visível mas inativo (ex.: "Em breve"). */
  desabilitado?: boolean;
};

export type TailorSidebarGrupo = { rotulo?: string; itens: TailorSidebarItem[] };

export type TailorSidebarLinkProps = {
  href?: string;
  className: string;
  children: ReactNode;
  'aria-current'?: 'page';
  'aria-label'?: string;
  title?: string;
  onClick: () => void;
};

/** Troca o `<a>` padrão pelo link do roteador (NavLink/Link do React Router). */
export type TailorSidebarRenderLink = (item: TailorSidebarItem, props: TailorSidebarLinkProps) => ReactNode;

type Tom = {
  fundo: string;
  borda: string;
  texto: string;
  forte: string;
  fraco: string;
  hover: string;
  ativo: string;
  chip: string;
  ponto: string;
  avatar: string;
  perigo: string;
};

// Um tom por superfície. `auto` segue o `dark:` do app; `escura` é o preto fixo
// do admin do accounts, que não muda com o tema.
const TONS: Record<SuperficieSidebar, Tom> = {
  auto: {
    fundo: 'bg-white dark:bg-neutral-950',
    borda: 'border-neutral-200 dark:border-white/10',
    texto: 'text-neutral-700 dark:text-neutral-300',
    forte: 'text-black dark:text-white',
    fraco: 'text-neutral-500 dark:text-neutral-400',
    hover: 'hover:bg-neutral-50 hover:text-black dark:hover:bg-white/5 dark:hover:text-white',
    ativo: 'bg-neutral-100 text-black dark:bg-white/10 dark:text-white',
    chip: 'bg-neutral-900 text-white dark:bg-white dark:text-black',
    ponto: 'bg-neutral-900 dark:bg-white',
    avatar: 'bg-black text-tailor-green dark:bg-white/10',
    perigo: 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10',
  },
  clara: {
    fundo: 'bg-white',
    borda: 'border-neutral-200',
    texto: 'text-neutral-700',
    forte: 'text-black',
    fraco: 'text-neutral-500',
    hover: 'hover:bg-neutral-50 hover:text-black',
    ativo: 'bg-neutral-100 text-black',
    chip: 'bg-neutral-900 text-white',
    ponto: 'bg-neutral-900',
    avatar: 'bg-black text-tailor-green',
    perigo: 'text-red-600 hover:bg-red-50',
  },
  escura: {
    fundo: 'bg-black',
    borda: 'border-white/10',
    texto: 'text-neutral-300',
    forte: 'text-white',
    fraco: 'text-neutral-400',
    hover: 'hover:bg-white/5 hover:text-white',
    ativo: 'bg-white/10 text-white',
    chip: 'bg-white text-black',
    ponto: 'bg-white',
    avatar: 'bg-white/10 text-tailor-green',
    perigo: 'text-red-400 hover:bg-red-500/10',
  },
};

// Classes literais: o Tailwind do app só gera o que encontra escrito por inteiro.
const SO_DESKTOP: Record<BreakpointSidebar, string> = { md: 'max-md:hidden!', lg: 'max-lg:hidden!' };
const SO_MOBILE: Record<BreakpointSidebar, string> = { md: 'md:hidden!', lg: 'lg:hidden!' };

const FOCO = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tailor-green/60';
const FOCAVEIS = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

const Svg = ({ d, className }: { d: string[]; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
    className={className}
  >
    {d.map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
);
const ICONE_CHEVRON = ['m6 9 6 6 6-6'];
const ICONE_RECOLHER = ['M3 3h18v18H3z', 'M9 3v18', 'm16 15-3-3 3-3'];
const ICONE_EXPANDIR = ['M3 3h18v18H3z', 'M9 3v18', 'm14 9 3 3-3 3'];
const ICONE_FECHAR = ['M18 6 6 18', 'M6 6l12 12'];
const ICONE_MENU = ['M4 7h16', 'M4 12h16', 'M4 17h16'];

const linkPadrao: TailorSidebarRenderLink = (_item, { href, ...props }) => <a href={href} {...props} />;

type Contexto = {
  tom: Tom;
  recolhido: boolean;
  gaveta: boolean;
  renderLink: TailorSidebarRenderLink;
  aoNavegar?: () => void;
  onRecolher?: (recolhido: boolean) => void;
};

const SidebarContexto = createContext<Contexto>({
  tom: TONS.auto,
  recolhido: false,
  gaveta: false,
  renderLink: linkPadrao,
});

const contemAtivo = (item: TailorSidebarItem): boolean => Boolean(item.ativo) || Boolean(item.filhos?.some(contemAtivo));
const temBadge = (badge: TailorSidebarItem['badge']) => badge !== undefined && badge !== 0 && badge !== '';
const textoBadge = (badge: TailorSidebarItem['badge']) => (typeof badge === 'number' && badge > 99 ? '99+' : String(badge));

export type SidebarItemProps = { item: TailorSidebarItem; nivel?: number };

/** Um item da nav. Exportado para quem monta grupos à mão (ex.: sub-nav do Orchestrator). */
export const SidebarItem: React.FC<SidebarItemProps> = ({ item, nivel = 0 }) => {
  const { tom, recolhido, gaveta, renderLink, aoNavegar, onRecolher } = useContext(SidebarContexto);
  const temFilhos = Boolean(item.filhos?.length);
  const filhoAtivo = temFilhos && item.filhos!.some(contemAtivo);
  const [aberto, setAberto] = useState(filhoAtivo);
  useEffect(() => {
    if (filhoAtivo) setAberto(true);
  }, [filhoAtivo]);

  const Icone = item.icone;
  // No trilho os filhos não aparecem, então o pai responde por eles.
  const ativo = Boolean(item.ativo) || (recolhido && filhoAtivo);
  const badge = temBadge(item.badge);
  const alerta = item.badgeTom === 'alerta';
  const nome = badge ? `${item.rotulo} (${textoBadge(item.badge)})` : item.rotulo;

  const classe = cn(
    'group relative flex w-full items-center border-l-2 text-left font-tailor text-sm transition-colors motion-reduce:transition-none',
    gaveta ? 'h-11' : 'h-[34px]',
    FOCO,
    recolhido ? 'justify-center px-0' : cn('gap-[13px] pr-[13px]', nivel > 0 ? 'pl-[34px]' : 'pl-[13px]'),
    item.desabilitado
      ? cn('cursor-not-allowed border-transparent font-medium opacity-60', tom.fraco)
      : ativo
        ? cn('border-tailor-green font-semibold', tom.ativo)
        : cn('border-transparent font-medium', filhoAtivo ? tom.forte : tom.texto, tom.hover),
  );

  const conteudo = (
    <>
      <span aria-hidden="true" className="inline-flex shrink-0">
        <Icone className="size-[18px] stroke-[1.5]" />
      </span>
      {recolhido ? (
        badge && <span aria-hidden="true" className={cn('absolute left-1/2 top-[5px] ml-[6px] size-[8px]', alerta ? 'bg-red-600' : tom.ponto)} />
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
          {badge && (
            <span
              className={cn(
                'inline-flex h-[21px] min-w-[21px] shrink-0 items-center justify-center px-[5px] font-tailor-num text-[11px] font-medium leading-none tabular-nums',
                alerta ? 'bg-red-600 text-white' : tom.chip,
              )}
            >
              {textoBadge(item.badge)}
            </span>
          )}
          {temFilhos && (
            <Svg d={ICONE_CHEVRON} className={cn('size-[13px] shrink-0 transition-transform motion-reduce:transition-none', tom.fraco, aberto && 'rotate-180')} />
          )}
        </>
      )}
    </>
  );

  const rotuloTrilho = recolhido ? { 'aria-label': nome, title: nome } : {};
  const selecionar = () => {
    item.onSelect?.();
    aoNavegar?.();
  };
  const idFilhos = `tailor-sidebar-${item.id}-filhos`;

  let elemento: ReactNode;
  if (item.desabilitado) {
    elemento = (
      <span aria-disabled="true" className={classe} {...rotuloTrilho}>
        {conteudo}
      </span>
    );
  } else if (temFilhos) {
    elemento = (
      <button
        type="button"
        className={classe}
        aria-expanded={recolhido ? undefined : aberto}
        aria-controls={recolhido ? undefined : idFilhos}
        onClick={() => {
          // No trilho não há onde abrir a lista: expande a barra e abre o grupo.
          if (recolhido) {
            onRecolher?.(false);
            setAberto(true);
          } else setAberto((a) => !a);
        }}
        {...rotuloTrilho}
      >
        {conteudo}
      </button>
    );
  } else if (item.href) {
    elemento = renderLink(item, {
      href: item.href,
      className: classe,
      children: conteudo,
      'aria-current': item.ativo ? 'page' : undefined,
      onClick: selecionar,
      ...rotuloTrilho,
    });
  } else {
    elemento = (
      <button type="button" className={classe} onClick={selecionar} {...rotuloTrilho}>
        {conteudo}
      </button>
    );
  }

  return (
    <li>
      {elemento}
      {temFilhos && !recolhido && aberto && (
        <ul id={idFilhos} className="mt-[2px] space-y-[2px]">
          {item.filhos!.map((filho) => (
            <SidebarItem key={filho.id} item={filho} nivel={nivel + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

export type SidebarGroupProps = {
  rotulo?: string;
  itens?: TailorSidebarItem[];
  /** `<SidebarItem>`s ou `<li>` próprios, depois dos `itens`. */
  children?: ReactNode;
};

/** Grupo com rótulo de 11px. No trilho o rótulo sai e o espaço entre grupos fica. */
export const SidebarGroup: React.FC<SidebarGroupProps> = ({ rotulo, itens = [], children }) => {
  const { tom, recolhido } = useContext(SidebarContexto);
  return (
    <div>
      {rotulo && !recolhido && <p className={cn('px-[13px] pb-[8px] font-tailor text-[11px] font-medium', tom.fraco)}>{rotulo}</p>}
      <ul aria-label={rotulo} className="space-y-[2px]">
        {itens.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
        {children}
      </ul>
    </div>
  );
};

export type TailorSidebarProps = {
  /** Nome do produto no lockup ("Conta", "Studio", "BI", "Pilot"). */
  produto: string;
  /** Logo do cliente (whitelabel) no lugar do wordmark. */
  logoClaro?: string;
  logoEscuro?: string;
  /** Substitui o lockup inteiro (ex.: logo do cliente com link para o início). */
  marca?: ReactNode;
  /** Marca no trilho recolhido, acima do botão de expandir. Padrão: nenhuma. */
  marcaRecolhida?: ReactNode;
  grupos: TailorSidebarGrupo[];
  /** Seletor de contas. Ocupa a linha; some no trilho. */
  accountSelector?: ReactNode;
  /** Seletor de apps, à direita do seletor de contas (centralizado no trilho). */
  apps?: ReactNode;
  /** Conteúdo extra no fim da nav (grupos montados à mão, aviso de status). */
  children?: ReactNode;
  /** Rodapé fixo: em geral o `TailorUserMenu`. */
  rodape?: ReactNode;
  /** "Powered by Tailor.ia". Ligue só quando a logo do cliente substitui o wordmark. */
  poweredBy?: boolean;
  superficie?: SuperficieSidebar;
  /** Trilho de 80px, só ícones. Controlado pelo app (ele guarda a preferência). */
  recolhido?: boolean;
  /** Sem isto, o botão de recolher não aparece. */
  onRecolher?: (recolhido: boolean) => void;
  /** Gaveta do celular aberta. Abaixo do breakpoint a barra fixa some. */
  aberto?: boolean;
  onFechar?: () => void;
  /** Onde a barra fixa vira gaveta. Padrão `lg` (1024px). */
  breakpoint?: BreakpointSidebar;
  renderLink?: TailorSidebarRenderLink;
  /** Nome da navegação para leitores de tela. */
  ariaLabel?: string;
  /** Classes extras no `<aside>` (ex.: `fixed inset-y-0` em vez de `sticky`). */
  className?: string;
};

/**
 * Barra lateral padrão: marca + recolher, seletor de contas + apps, grupos de
 * itens, rodapé. O mesmo `grupos` desenha a barra fixa e a gaveta do celular.
 */
export const TailorSidebar: React.FC<TailorSidebarProps> = ({
  produto,
  logoClaro,
  logoEscuro,
  marca,
  marcaRecolhida,
  grupos,
  accountSelector,
  apps,
  children,
  rodape,
  poweredBy = false,
  superficie = 'auto',
  recolhido = false,
  onRecolher,
  aberto = false,
  onFechar,
  breakpoint = 'lg',
  renderLink = linkPadrao,
  ariaLabel = 'Navegação principal',
  className,
}) => {
  const tom = TONS[superficie];
  const painelRef = useRef<HTMLDivElement>(null);

  // Gaveta: foco entra no painel (no próprio diálogo, para o anel não piscar no
  // "Fechar"), rolagem da página trava, foco volta ao sair.
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    painelRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [aberto]);

  const prenderFoco = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onFechar?.();
      return;
    }
    if (e.key !== 'Tab' || !painelRef.current) return;
    const focaveis = Array.from(painelRef.current.querySelectorAll<HTMLElement>(FOCAVEIS));
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  };

  const botaoIcone = cn('inline-flex size-[34px] shrink-0 items-center justify-center transition-colors motion-reduce:transition-none', tom.fraco, tom.hover, FOCO);

  // Função, não componente: um componente declarado aqui dentro remontaria a
  // cada render e fecharia os grupos abertos.
  const painel = (gaveta: boolean) => {
    const r = !gaveta && recolhido;
    const mostraLinha = r ? Boolean(apps) : Boolean(accountSelector || apps);
    const logoPowered = (classe: string) =>
      superficie === 'escura' ? (
        <img src={logoTailorBranco} alt="Tailor.ia" className={classe} />
      ) : superficie === 'clara' ? (
        <img src={logoTailor} alt="Tailor.ia" className={classe} />
      ) : (
        <>
          <img src={logoTailor} alt="Tailor.ia" className={cn(classe, 'dark:hidden')} />
          <img src={logoTailorBranco} alt="" className={cn(classe, 'hidden dark:block')} />
        </>
      );
    return (
      <SidebarContexto.Provider value={{ tom, recolhido: r, gaveta, renderLink, aoNavegar: gaveta ? onFechar : undefined, onRecolher }}>
        <div className={cn('flex h-full min-h-0 flex-col', tom.fundo)}>
          <div
            className={cn(
              'flex shrink-0 border-b',
              tom.borda,
              r ? 'flex-col items-center justify-center gap-[8px] py-[10px]' : 'h-[55px] items-center justify-between gap-[8px] pl-[21px] pr-[13px]',
            )}
          >
            {r ? marcaRecolhida : (marca ?? <TailorBrandMark produto={produto} superficie={superficie} logoClaro={logoClaro} logoEscuro={logoEscuro} />)}
            {gaveta ? (
              <button type="button" onClick={onFechar} className={botaoIcone} aria-label="Fechar menu">
                <Svg d={ICONE_FECHAR} className="size-5" />
              </button>
            ) : (
              onRecolher && (
                <button
                  type="button"
                  onClick={() => onRecolher(!recolhido)}
                  className={botaoIcone}
                  aria-label={recolhido ? 'Expandir barra lateral' : 'Recolher barra lateral'}
                  title={recolhido ? 'Expandir' : 'Recolher'}
                >
                  <Svg d={recolhido ? ICONE_EXPANDIR : ICONE_RECOLHER} className="size-[18px]" />
                </button>
              )
            )}
          </div>

          {mostraLinha && (
            <div className={cn('flex shrink-0 items-center gap-[8px] border-b py-[13px]', tom.borda, r ? 'justify-center' : 'px-[13px]')}>
              {!r && accountSelector && <div className="min-w-0 flex-1">{accountSelector}</div>}
              {apps && <div className="flex shrink-0 items-center">{apps}</div>}
            </div>
          )}

          <nav aria-label={ariaLabel} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[8px] py-[21px]">
            <div className="flex flex-col gap-[21px]">
              {grupos.map((grupo, i) => (
                <SidebarGroup key={grupo.rotulo ?? i} rotulo={grupo.rotulo} itens={grupo.itens} />
              ))}
              {children}
            </div>
          </nav>

          {rodape && <div className={cn('shrink-0 border-t', tom.borda)}>{rodape}</div>}

          {poweredBy && (
            <p className={cn('flex h-[34px] shrink-0 items-center justify-center gap-[8px] border-t font-tailor text-[11px]', tom.borda, tom.fraco)}>
              {!r && <span>Powered by</span>}
              {logoPowered('h-[13px] w-auto')}
            </p>
          )}
        </div>
      </SidebarContexto.Provider>
    );
  };

  return (
    <>
      <aside
        className={cn(
          'sticky top-0 flex h-screen shrink-0 flex-col border-r transition-[width] duration-200 ease-out motion-reduce:transition-none',
          SO_DESKTOP[breakpoint],
          tom.borda,
          recolhido ? 'w-20' : 'w-72',
          className,
        )}
      >
        {painel(false)}
      </aside>

      {aberto && (
        <div className={cn('fixed inset-0 z-50 flex', SO_MOBILE[breakpoint])}>
          <div aria-hidden="true" className="absolute inset-0 bg-black/55" onClick={onFechar} />
          <div
            ref={painelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            tabIndex={-1}
            onKeyDown={prenderFoco}
            className={cn('relative flex outline-none h-full w-72 max-w-[calc(100vw-55px)] flex-col border-r', tom.borda)}
          >
            {painel(true)}
          </div>
        </div>
      )}
    </>
  );
};

export type TailorUserMenuAcao = {
  rotulo: string;
  icone?: React.ComponentType<{ className?: string }>;
  href?: string;
  onSelect?: () => void;
  /** `perigo` para "Sair". */
  tom?: 'perigo';
};

export type TailorUserMenuProps = {
  nome: string;
  /** Linha de baixo: e-mail. */
  detalhe?: string;
  /** Papel na conta ("Administrador"), mostrado no painel. */
  papel?: string;
  avatarUrl?: string;
  acoes?: TailorUserMenuAcao[];
  /** Conteúdo livre no painel, antes das ações (tema, notificações push). */
  children?: ReactNode;
};

/**
 * Menu do usuário para o `rodape` da `TailorSidebar`. Botão que abre um painel
 * (padrão disclosure: aceita conteúdo livre, como o seletor de tema). Esc e
 * clique fora fecham; setas percorrem os itens.
 */
export const TailorUserMenu: React.FC<TailorUserMenuProps> = ({ nome, detalhe, papel, avatarUrl, acoes = [], children }) => {
  const { tom, recolhido } = useContext(SidebarContexto);
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, [aberto]);

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && aberto) {
      // Para aqui: na gaveta, o Esc de fora fecharia a gaveta inteira.
      e.stopPropagation();
      setAberto(false);
      botao.current?.focus();
      return;
    }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && aberto && painel.current) {
      e.preventDefault();
      const itens = Array.from(painel.current.querySelectorAll<HTMLElement>(FOCAVEIS));
      if (!itens.length) return;
      const atual = itens.indexOf(document.activeElement as HTMLElement);
      const passo = e.key === 'ArrowDown' ? 1 : -1;
      itens[(atual + passo + itens.length) % itens.length].focus();
    }
  };

  const avatar = (
    <span className={cn('inline-flex size-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full font-tailor text-sm font-semibold', tom.avatar)}>
      {avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : (nome.trim().charAt(0) || '?').toUpperCase()}
    </span>
  );

  const classeAcao = (perigo: boolean) =>
    cn('flex h-[34px] w-full items-center gap-[13px] px-[13px] text-left font-tailor text-sm font-medium transition-colors motion-reduce:transition-none', FOCO, perigo ? tom.perigo : cn(tom.texto, tom.hover));

  return (
    <div ref={raiz} className="relative" onKeyDown={teclas}>
      <button
        ref={botao}
        type="button"
        aria-expanded={aberto}
        aria-label={recolhido ? `Menu de ${nome}` : undefined}
        title={recolhido ? nome : undefined}
        onClick={() => setAberto((a) => !a)}
        className={cn('flex w-full items-center gap-[13px] py-[13px] text-left transition-colors motion-reduce:transition-none', tom.hover, FOCO, recolhido ? 'justify-center px-0' : 'px-[21px]')}
      >
        {avatar}
        {!recolhido && (
          <>
            <span className="min-w-0 flex-1">
              <span className={cn('block truncate font-tailor text-sm font-semibold leading-tight', tom.forte)}>{nome}</span>
              {detalhe && <span className={cn('mt-[2px] block truncate font-tailor text-[11px] leading-tight', tom.fraco)}>{detalhe}</span>}
            </span>
            <Svg d={ICONE_CHEVRON} className={cn('size-[13px] shrink-0 transition-transform motion-reduce:transition-none', tom.fraco, !aberto && 'rotate-180')} />
          </>
        )}
      </button>

      {aberto && (
        <div
          ref={painel}
          className={cn(
            'absolute z-50 border py-[8px]',
            tom.fundo,
            tom.borda,
            recolhido ? 'bottom-0 left-full ml-[8px] w-[233px]' : 'bottom-full left-[8px] right-[8px] mb-[8px]',
          )}
        >
          {(recolhido || papel) && (
            <div className={cn('border-b px-[13px] pb-[8px] font-tailor', tom.borda)}>
              {recolhido && <p className={cn('truncate text-sm font-semibold', tom.forte)}>{nome}</p>}
              {recolhido && detalhe && <p className={cn('truncate text-[11px]', tom.fraco)}>{detalhe}</p>}
              {papel && <p className={cn('text-[11px]', tom.fraco, recolhido && 'mt-[5px]')}>{papel}</p>}
            </div>
          )}
          {children && <div className={cn('border-b px-[13px] py-[8px]', tom.borda)}>{children}</div>}
          {acoes.length > 0 && (
            <div className="pt-[8px]">
              {acoes.map((acao) => {
                const Icone = acao.icone;
                const miolo = (
                  <>
                    {Icone && (
                      <span aria-hidden="true" className="inline-flex shrink-0">
                        <Icone className="size-4 stroke-[1.5]" />
                      </span>
                    )}
                    {acao.rotulo}
                  </>
                );
                const fechar = () => {
                  setAberto(false);
                  acao.onSelect?.();
                };
                return acao.href ? (
                  <a key={acao.rotulo} href={acao.href} onClick={fechar} className={classeAcao(acao.tom === 'perigo')}>
                    {miolo}
                  </a>
                ) : (
                  <button key={acao.rotulo} type="button" onClick={fechar} className={classeAcao(acao.tom === 'perigo')}>
                    {miolo}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export type TailorMobileBarProps = {
  /** Abre a gaveta: ligue no `aberto` da `TailorSidebar`. */
  onAbrirMenu: () => void;
  /** Gaveta aberta, para o `aria-expanded` do hambúrguer. */
  menuAberto?: boolean;
  produto: string;
  logoClaro?: string;
  logoEscuro?: string;
  marca?: ReactNode;
  apps?: ReactNode;
  /** À direita dos apps (sino, avatar). */
  direita?: ReactNode;
  superficie?: SuperficieSidebar;
  /** Mesmo breakpoint da `TailorSidebar`. A barra some a partir dele. */
  breakpoint?: BreakpointSidebar;
  className?: string;
};

/** Barra do topo no celular: hambúrguer, marca, apps. A nav fica toda na gaveta. */
export const TailorMobileBar: React.FC<TailorMobileBarProps> = ({
  onAbrirMenu,
  menuAberto,
  produto,
  logoClaro,
  logoEscuro,
  marca,
  apps,
  direita,
  superficie = 'auto',
  breakpoint = 'lg',
  className,
}) => {
  const tom = TONS[superficie];
  return (
    <header className={cn('sticky top-0 z-40 flex h-[55px] items-center gap-[8px] border-b pl-[5px] pr-[13px]', SO_MOBILE[breakpoint], tom.fundo, tom.borda, className)}>
      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menu"
        aria-expanded={menuAberto}
        className={cn('inline-flex size-11 shrink-0 items-center justify-center transition-colors motion-reduce:transition-none', tom.texto, tom.hover, FOCO)}
      >
        <Svg d={ICONE_MENU} className="size-5" />
      </button>
      <div className="flex min-w-0 flex-1 items-center">
        {marca ?? <TailorBrandMark produto={produto} superficie={superficie} logoClaro={logoClaro} logoEscuro={logoEscuro} />}
      </div>
      {apps}
      {direita}
    </header>
  );
};
