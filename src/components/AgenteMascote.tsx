import { cn } from '../cn';
import {
  MascoteVetor,
  type AcessorioDoMascote,
  type ChaveDoAgenteVetor,
  type ExpressaoDoMascote,
  type ObjetoDoMascote,
  type PoseDoMascote,
  type TemaDoMascote,
} from './MascoteVetor';

/**
 * Mapas 8x8 dos agentes (QD-0426, estilo Dots). `k` tinta, `e` olho (pisca),
 * `g` o único verde do personagem (pulsa), `.` vazio. Desenho aprovado em
 * https://claude.ai/artifact/HoWCZX7aFiKPEqwhXyzm5k
 */
const MAPAS = {
  desk:     ['...gg...', '...kk...', '.kkkkkk.', '.ke..ek.', 'kk....kk', '.k.kk.k.', '.kkkkkk.', '........'],
  pergunte: ['.......g', 'kkkkkkk.', 'k.....k.', 'k.e.e.k.', 'k.....k.', 'kkkkkkk.', '.kk.....', '.k......'],
  pm:       ['..gggg..', 'kkkkkkkk', 'k......k', 'k.e..e.k', 'k......k', 'k.kkkk.k', 'k......k', 'kkkkkkkk'],
  diretor:  ['.kkkkkk.', '.k....k.', 'kkkkkkkk', '.kk..kk.', '.k....k.', '.k.kk.k.', '.kkkkkk.', '...gg...'],
} as const;
/** Desligado: o Desk de olhos fechados, em cinza. */
const DORMINDO = ['...kk...', '...kk...', '.kkkkkk.', '.k....k.', 'kkk..kkk', '.k....k.', '.kkkkkk.', '........'];

/** Agentes com desenho em pixel. Os demais só existem em vetor. */
export type ChaveDoMascote = keyof typeof MAPAS;
export type ChaveDoAgente = ChaveDoAgenteVetor;
export type EstadoDoMascote =
  | 'analisando' | 'esperando' | 'feito' | 'subiu' | 'desligado'
  | 'parado' | 'cumprimentando' | 'falando' | 'erro';

/** Texto do estado: a cor nunca fala sozinha. */
export const ROTULO_DO_ESTADO: Record<EstadoDoMascote, string> = {
  analisando: 'Analisando',
  esperando: 'Esperando você',
  feito: 'Feito e avisado',
  subiu: 'Subiu de nível',
  desligado: 'Desligado',
  parado: 'Disponível',
  cumprimentando: 'Cumprimentando',
  falando: 'Falando',
  erro: 'Precisa de ajuda',
};

/** Como cada estado aparece no vetor. */
const POSE: Record<EstadoDoMascote, PoseDoMascote> = {
  analisando: 'pensando', esperando: 'esperando', feito: 'falando', subiu: 'comemorando', desligado: 'dormindo',
  parado: 'parado', cumprimentando: 'cumprimentando', falando: 'falando', erro: 'erro',
};

/** O vetor pinta por variável; `auto` segue o `dark:` do app. */
const SUPERFICIE = {
  auto: '[--tailor-mv-corpo:var(--tailor-black)] [--tailor-mv-olho:var(--tailor-white)] dark:[--tailor-mv-corpo:var(--tailor-white)] dark:[--tailor-mv-olho:var(--tailor-black)]',
  clara: '[--tailor-mv-corpo:var(--tailor-black)] [--tailor-mv-olho:var(--tailor-white)]',
  escura: '[--tailor-mv-corpo:var(--tailor-white)] [--tailor-mv-olho:var(--tailor-black)]',
};

const CLASSE_DO_PIXEL: Record<string, string> = {
  k: 'tailor-mascote__tinta',
  e: 'tailor-mascote__tinta tailor-mascote__olho',
  g: 'tailor-mascote__verde',
};

export type AgenteMascoteProps = {
  agente: ChaveDoAgente;
  /** Nome exibido (a conta pode renomear). Vai no rótulo acessível. */
  nome: string;
  estado?: EstadoDoMascote;
  /** Quantas coisas esperam a pessoa. Só aparece acima de zero. */
  selo?: number;
  /** Lado de cada quadradinho, em px. Padrão: 4 (32px no total). No vetor, a largura padrão é `celula * 8`. */
  celula?: number;
  /** Mostra o ponto e o texto do estado ao lado. */
  mostrarEstado?: boolean;
  /** `pixel` (padrão) é a grade 8x8; `vetor` é o companheiro animado. Agentes sem mapa 8x8 saem sempre em vetor. */
  estilo?: 'pixel' | 'vetor';
  /** Vetor: largura em px. */
  tamanho?: number;
  /** Vetor: olhar no lugar do padrão do estado. */
  expressao?: ExpressaoDoMascote;
  /** Vetor: acessório + objeto de uma data (`natal`, `pascoa`...). */
  tema?: TemaDoMascote;
  acessorio?: AcessorioDoMascote;
  objeto?: ObjetoDoMascote;
  /** Vetor: frase no balão. Também entra no rótulo acessível. */
  fala?: string;
  /** Vetor: `auto` segue o tema do app; `clara`/`escura` travam (ex.: painel sempre branco). */
  superficie?: keyof typeof SUPERFICIE;
  className?: string;
};

/**
 * O personagem do agente, com o estado em ponto + texto. Em pixel, anima em
 * degraus; em vetor, olha o cursor e muda de olhar e movimento por estado.
 * Com menos movimento, para.
 */
export function AgenteMascote({
  agente, nome, estado = 'feito', selo = 0, celula = 4, mostrarEstado = false,
  estilo = 'pixel', tamanho, expressao, tema, acessorio, objeto, fala, superficie = 'auto', className,
}: AgenteMascoteProps) {
  const vetor = estilo === 'vetor' || !(agente in MAPAS);
  const rotulo = ROTULO_DO_ESTADO[estado];
  const mapa = estado === 'desligado' ? DORMINDO : MAPAS[agente as ChaveDoMascote];
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        role="img"
        aria-label={`${nome}: ${rotulo}${selo > 0 ? `, ${selo} pendentes` : ''}${vetor && fala ? `. ${fala}` : ''}`}
        className={cn(
          'relative inline-block',
          vetor ? cn('tailor-mv', `tailor-mv--${POSE[estado]}`, SUPERFICIE[superficie]) : cn('tailor-mascote', `tailor-mascote--${estado}`),
        )}
        style={vetor ? undefined : { ['--tailor-celula' as string]: `${celula}px` }}
      >
        {vetor ? (
          <MascoteVetor agente={agente} pose={POSE[estado]} expressao={expressao} tema={tema}
            acessorio={acessorio} objeto={objeto} fala={fala} tamanho={tamanho ?? celula * 8} />
        ) : (
          <span className="tailor-mascote__corpo grid grid-cols-8" aria-hidden="true">
            {mapa.join('').split('').map((c, i) => (
              <span key={i} className={cn('tailor-mascote__pixel', CLASSE_DO_PIXEL[c])} />
            ))}
          </span>
        )}
        {selo > 0 && (
          <span className="tailor-mascote__selo absolute -right-2 -top-2 font-tailor-num" aria-hidden="true">
            {selo > 99 ? '99+' : selo}
          </span>
        )}
      </span>
      {mostrarEstado && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <span className={cn('tailor-estado__ponto', `tailor-estado__ponto--${estado}`)} aria-hidden="true" />
          {rotulo}
        </span>
      )}
    </span>
  );
}
