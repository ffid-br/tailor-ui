import { cn } from '../cn';

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

export type ChaveDoMascote = keyof typeof MAPAS;
export type EstadoDoMascote = 'analisando' | 'esperando' | 'feito' | 'subiu' | 'desligado';

/** Texto do estado: a cor nunca fala sozinha. */
export const ROTULO_DO_ESTADO: Record<EstadoDoMascote, string> = {
  analisando: 'Analisando',
  esperando: 'Esperando você',
  feito: 'Feito e avisado',
  subiu: 'Subiu de nível',
  desligado: 'Desligado',
};

const CLASSE_DO_PIXEL: Record<string, string> = {
  k: 'tailor-mascote__tinta',
  e: 'tailor-mascote__tinta tailor-mascote__olho',
  g: 'tailor-mascote__verde',
};

export type AgenteMascoteProps = {
  agente: ChaveDoMascote;
  /** Nome exibido (a conta pode renomear). Vai no rótulo acessível. */
  nome: string;
  estado?: EstadoDoMascote;
  /** Quantas coisas esperam a pessoa. Só aparece acima de zero. */
  selo?: number;
  /** Lado de cada quadradinho, em px. Padrão: 4 (32px no total). */
  celula?: number;
  /** Mostra o ponto e o texto do estado ao lado. */
  mostrarEstado?: boolean;
  className?: string;
};

/**
 * O personagem do agente na grade 8x8 da marca, com o estado em ponto + texto.
 * Animação em degraus (bob, piscar, pulso do verde); com menos movimento, para.
 */
export function AgenteMascote({
  agente, nome, estado = 'feito', selo = 0, celula = 4, mostrarEstado = false, className,
}: AgenteMascoteProps) {
  const mapa = estado === 'desligado' ? DORMINDO : MAPAS[agente];
  const rotulo = ROTULO_DO_ESTADO[estado];
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        role="img"
        aria-label={`${nome}: ${rotulo}${selo > 0 ? `, ${selo} pendentes` : ''}`}
        className={cn('tailor-mascote relative inline-block', `tailor-mascote--${estado}`)}
        style={{ ['--tailor-celula' as string]: `${celula}px` }}
      >
        <span className="tailor-mascote__corpo grid grid-cols-8" aria-hidden="true">
          {mapa.join('').split('').map((c, i) => (
            <span key={i} className={cn('tailor-mascote__pixel', CLASSE_DO_PIXEL[c])} />
          ))}
        </span>
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
