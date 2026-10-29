import React, { useEffect, useRef } from 'react';

/**
 * Mascotes em vetor (estilo companheiro): olhos seguem o cursor e piscam; a
 * expressão fica só nos olhos, sem boca nem braços, e nada espetado na cabeça.
 * Desenho aprovado em https://claude.ai/artifact/Nqoe5LcSgi9mP5WBRM6SYE
 * Cores por variável: `--tailor-mv-corpo` e `--tailor-mv-olho` (ver `superficie`).
 */

const CORPO = 'var(--tailor-mv-corpo, var(--tailor-black))';
const OLHO = 'var(--tailor-mv-olho, var(--tailor-white))';
const VERDE = 'var(--tailor-green)';
/** Só o gorro do Natal: vermelho da paleta de apoio, com aba e pompom brancos. */
const VERMELHO = 'var(--tailor-mv-vermelho, #FF0040)';
const BRANCO = 'var(--tailor-white)';

type Agente = {
  /** Topo da cabeça, onde o acessório assenta. */
  topo: number;
  /** Lado direito do corpo e altura onde o objeto encosta. */
  apoio: [number, number];
  olhos: { l: number; r: number; y: number };
  lente?: boolean;
  corpo: React.ReactNode;
  verde: React.ReactNode;
};

const AGENTES = {
  desk: {
    topo: 70, apoio: [165, 128], olhos: { l: 88, r: 132, y: 116 },
    corpo: <rect x="55" y="70" width="110" height="110" rx="48" fill={CORPO} />,
    // mordomo: gravata-borboleta
    verde: <>
      <path d="M110 168 L94 159 V177 Z M110 168 L126 159 V177 Z" fill={VERDE} stroke={VERDE} strokeWidth="3" strokeLinejoin="round" />
      <rect x="105" y="163" width="10" height="10" rx="2" fill={VERDE} />
    </>,
  },
  pergunte: {
    topo: 60, apoio: [175, 118], olhos: { l: 88, r: 132, y: 102 },
    corpo: <>
      <rect x="45" y="60" width="130" height="100" rx="36" fill={CORPO} />
      <path d="M68 150 L58 184 L100 156 Z" fill={CORPO} stroke={CORPO} strokeWidth="4" strokeLinejoin="round" />
    </>,
    verde: <circle cx="166" cy="64" r="10" fill={VERDE} />,
  },
  pm: {
    topo: 72, apoio: [170, 136], olhos: { l: 90, r: 130, y: 122 },
    corpo: <rect x="50" y="72" width="120" height="108" rx="26" fill={CORPO} />,
    verde: <path d="M50 98 Q50 72 76 72 H144 Q170 72 170 98 Z" fill={VERDE} />,
  },
  diretor: {
    topo: 52, apoio: [158, 130], olhos: { l: 92, r: 128, y: 100 }, lente: true,
    corpo: <rect x="62" y="52" width="96" height="128" rx="44" fill={CORPO} />,
    verde: <path d="M104 142 H116 L113 149 L120 172 L110 180 L100 172 L107 149 Z" fill={VERDE} />,
  },
  sdr: {
    topo: 56, apoio: [170, 132], olhos: { l: 90, r: 132, y: 112 },
    corpo: <>
      <rect x="52" y="66" width="116" height="114" rx="44" fill={CORPO} />
      <path d="M50 112 A60 60 0 0 1 170 112" fill="none" stroke={CORPO} strokeWidth="7" />
      <rect x="42" y="98" width="16" height="30" rx="6" fill={CORPO} />
      <rect x="162" y="98" width="16" height="30" rx="6" fill={CORPO} />
      <path d="M60 126 Q66 156 88 156" fill="none" stroke={OLHO} strokeWidth="4" strokeLinecap="round" />
    </>,
    verde: <circle cx="92" cy="156" r="7" fill={VERDE} />,
  },
  cred: {
    topo: 78, apoio: [180, 132], olhos: { l: 96, r: 140, y: 112 },
    corpo: <rect x="40" y="78" width="140" height="96" rx="22" fill={CORPO} />,
    verde: <>
      <rect x="54" y="134" width="28" height="22" rx="4" fill={VERDE} />
      <path d="M54 145 H82 M68 134 V156" stroke={CORPO} strokeWidth="2" />
    </>,
  },
  score: {
    topo: 72, apoio: [162, 132], olhos: { l: 90, r: 130, y: 106 },
    corpo: <circle cx="110" cy="128" r="56" fill={CORPO} />,
    verde: <>
      <path d="M92 172 A18 18 0 0 1 128 172" fill="none" stroke={VERDE} strokeWidth="6" strokeLinecap="round" />
      <path d="M110 172 L121 160" stroke={OLHO} strokeWidth="3" strokeLinecap="round" />
    </>,
  },
  pilot: {
    topo: 42, apoio: [162, 130], olhos: { l: 92, r: 128, y: 114 },
    corpo: <>
      <rect x="58" y="70" width="104" height="110" rx="40" fill={CORPO} />
      <path d="M54 78 Q58 44 110 42 Q162 44 166 78 Z" fill={CORPO} />
      <path d="M48 78 H172 Q172 88 162 88 H58 Q48 88 48 78 Z" fill={OLHO} stroke={CORPO} strokeWidth="3" />
    </>,
    verde: <circle cx="110" cy="60" r="8" fill={VERDE} />,
  },
  flow: {
    topo: 68, apoio: [164, 130], olhos: { l: 90, r: 130, y: 108 },
    corpo: <rect x="56" y="68" width="108" height="112" rx="30" fill={CORPO} />,
    verde: <>
      <path d="M84 164 H98 V152 H122 V164 H136" fill="none" stroke={VERDE} strokeWidth="4" />
      <rect x="76" y="159" width="10" height="10" fill={VERDE} />
      <rect x="134" y="159" width="10" height="10" fill={VERDE} />
    </>,
  },
  bi: {
    topo: 62, apoio: [176, 118], olhos: { l: 84, r: 124, y: 100 },
    corpo: <>
      <rect x="44" y="62" width="132" height="100" rx="16" fill={CORPO} />
      <rect x="98" y="158" width="24" height="16" fill={CORPO} />
      <rect x="76" y="172" width="68" height="8" rx="4" fill={CORPO} />
    </>,
    verde: <g fill={VERDE}>
      <rect x="144" y="132" width="7" height="16" />
      <rect x="154" y="122" width="7" height="26" />
      <rect x="164" y="110" width="7" height="38" />
    </g>,
  },
  rh: {
    topo: 68, apoio: [162, 132], olhos: { l: 90, r: 130, y: 112 },
    corpo: <rect x="56" y="68" width="108" height="112" rx="54" fill={CORPO} />,
    verde: <path d="M110 178 C94 168 95 157 103 157 C107 157 110 161 110 161 C110 161 113 157 117 157 C125 157 126 168 110 178 Z" fill={VERDE} />,
  },
  cs: {
    topo: 64, apoio: [166, 130], olhos: { l: 90, r: 130, y: 108 },
    corpo: <rect x="54" y="64" width="112" height="116" rx="42" fill={CORPO} />,
    // sucesso do cliente: balão de conversa com o check, a conversa que resolve
    verde: <>
      <path d="M94 146 H126 Q131 146 131 151 V163 Q131 168 126 168 H106 L98 175 V168 H94 Q89 168 89 163 V151 Q89 146 94 146 Z" fill={VERDE} />
      <path d="M102 157 L108 162 L119 151" fill="none" stroke={CORPO} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  },
} satisfies Record<string, Agente>;

export type ChaveDoAgenteVetor = keyof typeof AGENTES;

type ModoDoOlho = 'aberto' | 'grande' | 'feliz' | 'fechado' | 'x' | 'bravo' | 'triste' | 'meio';

/** Expressão só nos olhos: formato, pálpebra e pupila, por lado. */
const EXPRESSOES = {
  neutro: ['aberto', 'aberto'],
  feliz: ['feliz', 'feliz'],
  piscando: ['aberto', 'feliz'],
  surpreso: ['grande', 'grande'],
  bravo: ['bravo', 'bravo'],
  triste: ['triste', 'triste'],
  desconfiado: ['meio', 'meio'],
  sonolento: ['fechado', 'fechado'],
  tonto: ['x', 'x'],
} satisfies Record<string, [ModoDoOlho, ModoDoOlho]>;

export type ExpressaoDoMascote = keyof typeof EXPRESSOES;

/** Pose do vetor: o movimento, o olhar padrão e os enfeites de cada estado. */
export type PoseDoMascote = 'parado' | 'cumprimentando' | 'pensando' | 'falando' | 'esperando' | 'comemorando' | 'erro' | 'dormindo';
const OLHAR_DA_POSE: Record<PoseDoMascote, ExpressaoDoMascote> = {
  parado: 'neutro', cumprimentando: 'piscando', pensando: 'desconfiado', falando: 'neutro',
  esperando: 'surpreso', comemorando: 'feliz', erro: 'triste', dormindo: 'sonolento',
};

/** Desenhados com o topo da cabeça em (0, 0). Só em tinta (exceto o gorro): o verde é do agente. */
const ACESSORIOS = {
  gorro: <>
    <path d="M-36 2 L36 2 L36 -10 Q0 -60 -36 -10 Z" fill={VERMELHO} />
    <path d="M-36 2 Q-30 -36 6 -46 Q30 -50 40 -24" fill={VERMELHO} stroke={VERMELHO} strokeWidth="2" />
    <rect x="-42" y="-6" width="84" height="14" rx="7" fill={BRANCO} stroke={CORPO} strokeWidth="3" />
    <circle cx="40" cy="-24" r="9" fill={BRANCO} stroke={CORPO} strokeWidth="3" />
  </>,
  orelhas: <>
    {[-1, 1].map((l) => (
      <g key={l} transform={`rotate(${12 * l} ${22 * l} 0)`}>
        <ellipse cx={22 * l} cy="-30" rx="11" ry="32" fill={CORPO} />
        <ellipse cx={22 * l} cy="-30" rx="4.5" ry="21" fill={OLHO} />
      </g>
    ))}
  </>,
  festa: <>
    <path d="M-22 4 L22 4 L2 -50 Z" fill={OLHO} stroke={CORPO} strokeWidth="4" strokeLinejoin="round" />
    <path d="M-12 -14 L14 -8 M-4 -34 L10 -30" stroke={CORPO} strokeWidth="4" />
    <circle cx="2" cy="-52" r="6" fill={CORPO} />
  </>,
  bruxa: <>
    <path d="M-26 0 L26 0 L12 -50 L40 -62 L2 -58 Z" fill={CORPO} stroke={CORPO} strokeWidth="3" strokeLinejoin="round" />
    <rect x="-24" y="-12" width="48" height="8" fill={OLHO} />
    <ellipse cx="0" cy="2" rx="52" ry="8" fill={CORPO} />
  </>,
  bone: <>
    <path d="M-36 6 Q-36 -30 0 -30 Q36 -30 36 6 Z" fill={OLHO} stroke={CORPO} strokeWidth="4" />
    <path d="M30 2 H64 Q68 9 58 10 H30 Z" fill={OLHO} stroke={CORPO} strokeWidth="4" strokeLinejoin="round" />
  </>,
  capacete: <>
    <path d="M-62 40 A62 62 0 0 1 62 40" fill="none" stroke={CORPO} strokeWidth="4" strokeLinecap="round" />
    <path d="M-40 -14 A48 48 0 0 1 -14 -30" fill="none" stroke={CORPO} strokeWidth="4" strokeLinecap="round" />
  </>,
  coroa: <path d="M-32 6 L-32 -24 L-16 -8 L0 -32 L16 -8 L32 -24 L32 6 Z" fill={OLHO} stroke={CORPO} strokeWidth="4" strokeLinejoin="round" />,
};

export type AcessorioDoMascote = keyof typeof ACESSORIOS;

/** Desenhados com o canto de apoio em (0, 0), encostados no lado direito do corpo. */
const OBJETOS = {
  presente: <>
    <rect x="-6" y="-2" width="40" height="34" fill={OLHO} stroke={CORPO} strokeWidth="4" />
    <path d="M14 -2 V32" stroke={CORPO} strokeWidth="4" />
    <path d="M14 -2 Q2 -18 -2 -6 Z M14 -2 Q26 -18 30 -6 Z" fill={VERDE} stroke={CORPO} strokeWidth="3" strokeLinejoin="round" />
  </>,
  ovo: <>
    <ellipse cx="14" cy="10" rx="17" ry="22" fill={OLHO} stroke={CORPO} strokeWidth="4" />
    <path d="M-1 8 L5 2 L11 8 L17 2 L23 8 L29 2" fill="none" stroke={VERDE} strokeWidth="4" strokeLinejoin="round" />
  </>,
  bolo: <>
    <rect x="-8" y="2" width="44" height="28" fill={OLHO} stroke={CORPO} strokeWidth="4" />
    <path d="M-8 12 H36" stroke={CORPO} strokeWidth="4" />
    <rect x="11" y="-14" width="6" height="16" fill={CORPO} />
    <path d="M14 -28 Q20 -20 14 -16 Q8 -20 14 -28 Z" fill={VERDE} />
  </>,
  abobora: <>
    <ellipse cx="14" cy="12" rx="22" ry="18" fill={OLHO} stroke={CORPO} strokeWidth="4" />
    <path d="M14 -6 V30 M2 -2 Q-4 12 2 27 M26 -2 Q32 12 26 27" fill="none" stroke={CORPO} strokeWidth="3" />
    <path d="M14 -6 Q16 -16 24 -18" fill="none" stroke={VERDE} strokeWidth="5" strokeLinecap="round" />
  </>,
  bola: <>
    <circle cx="14" cy="10" r="20" fill={OLHO} stroke={CORPO} strokeWidth="4" />
    <path d="M14 2 L22 8 L19 17 L9 17 L6 8 Z" fill={VERDE} stroke={CORPO} strokeWidth="3" strokeLinejoin="round" />
  </>,
  sabre: <>
    <path d="M6 -4 L34 -70" stroke={VERDE} strokeWidth="8" strokeLinecap="round" />
    <rect x="-2" y="-6" width="12" height="26" rx="2" fill={CORPO} transform="rotate(23 4 7)" />
  </>,
  trofeu: <>
    <path d="M-2 -10 H30 V4 Q30 20 14 22 Q-2 20 -2 4 Z" fill={OLHO} stroke={CORPO} strokeWidth="4" strokeLinejoin="round" />
    <path d="M14 22 V30 M4 32 H24" stroke={CORPO} strokeWidth="4" strokeLinecap="round" />
    <circle cx="14" cy="4" r="5" fill={VERDE} />
  </>,
};

export type ObjetoDoMascote = keyof typeof OBJETOS;

/** Tema = acessório + objeto num nome só. */
const TEMAS = {
  natal: ['gorro', 'presente'],
  pascoa: ['orelhas', 'ovo'],
  aniversario: ['festa', 'bolo'],
  halloween: ['bruxa', 'abobora'],
  copa: ['bone', 'bola'],
  galaxia: ['capacete', 'sabre'],
  premiacao: ['coroa', 'trofeu'],
} satisfies Record<string, [AcessorioDoMascote, ObjetoDoMascote]>;

export type TemaDoMascote = keyof typeof TEMAS;

function Olho({ x, y, modo, lado, lente }: { x: number; y: number; modo: ModoDoOlho; lado: 1 | -1; lente?: boolean }) {
  const linha = (d: string) => <path d={d} fill="none" stroke={OLHO} strokeWidth="5" strokeLinecap="round" />;
  const grande = modo === 'grande';
  // pálpebra: um corte na cor do corpo por cima do olho, inclinado para dentro (bravo) ou para fora (triste)
  const corte = ({ bravo: [y - 12, y - 1], triste: [y - 1, y - 12], meio: [y - 2, y - 2] } as Partial<Record<ModoDoOlho, number[]>>)[modo];
  const fora = x - 18 * lado, dentro = x + 18 * lado, topo = y - 22;
  return (
    <>
      {modo === 'feliz' ? linha(`M${x - 10} ${y + 4} Q${x} ${y - 10} ${x + 10} ${y + 4}`)
        : modo === 'fechado' ? linha(`M${x - 10} ${y} Q${x} ${y + 8} ${x + 10} ${y}`)
        : modo === 'x' ? linha(`M${x - 8} ${y - 8} L${x + 8} ${y + 8} M${x + 8} ${y - 8} L${x - 8} ${y + 8}`)
        : <>
          {lente
            ? <rect x={x - 13} y={y - (grande ? 11 : 9)} width="26" height={grande ? 22 : 18} rx="6" fill={OLHO} />
            : <circle cx={x} cy={y} r={grande ? 17 : 14} fill={OLHO} />}
          <circle className="tailor-mv__pupila" cx={x} cy={y + 1} r={grande ? 4.5 : lente ? 5 : 6.5} fill={CORPO} />
          {corte && <path d={`M${fora} ${topo} L${dentro} ${topo} L${dentro} ${corte[1]} L${fora} ${corte[0]} Z`} fill={CORPO} />}
        </>}
      {lente && <rect x={x - 16} y={y - 12} width="32" height="24" rx="8" fill="none" stroke={OLHO} strokeWidth="3" />}
    </>
  );
}

export type MascoteVetorProps = {
  agente: ChaveDoAgenteVetor;
  pose: PoseDoMascote;
  expressao?: ExpressaoDoMascote;
  tema?: TemaDoMascote;
  acessorio?: AcessorioDoMascote;
  objeto?: ObjetoDoMascote;
  fala?: string;
  /** Abaixo de 48px o balão some (no dock, por exemplo); a fala segue no rótulo acessível. */
  tamanho: number;
};

/** Só o desenho; rótulo acessível, selo e estado ficam no `AgenteMascote`. */
export function MascoteVetor({ agente, pose, expressao, tema, acessorio, objeto, fala, tamanho }: MascoteVetorProps) {
  const a: Agente = AGENTES[agente];
  const [olhoE, olhoD] = EXPRESSOES[expressao ?? OLHAR_DA_POSE[pose]];
  const aces = acessorio ?? (tema && TEMAS[tema][0]);
  const obj = objeto ?? (tema && TEMAS[tema][1]);
  const ref = useRef<SVGSVGElement>(null);

  // O olhar segue o cursor: só variáveis CSS, sem re-render.
  useEffect(() => {
    const svg = ref.current;
    if (!svg || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let quadro = 0;
    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const r = svg.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.45);
        const d = Math.hypot(dx, dy) || 1, k = (Math.min(1, d / 300) * 5) / d;
        svg.style.setProperty('--tailor-mv-x', `${dx * k}px`);
        svg.style.setProperty('--tailor-mv-y', `${dy * k}px`);
      });
    };
    addEventListener('pointermove', mover);
    return () => { removeEventListener('pointermove', mover); cancelAnimationFrame(quadro); };
  }, []);

  return (
    <>
      {tamanho < 48 ? null : pose === 'pensando' ? (
        <span className="tailor-mv__balao tailor-mv__pontos" aria-hidden="true"><span /><span /><span /></span>
      ) : fala && pose !== 'dormindo' ? (
        <span className="tailor-mv__balao" aria-hidden="true">{fala}</span>
      ) : null}
      <svg ref={ref} viewBox="0 -40 220 240" width={tamanho} height={(tamanho * 240) / 220} className="block overflow-visible" aria-hidden="true">
        <g className="tailor-mv__corpo">
          {a.corpo}
          <g className="tailor-mv__verde">{a.verde}</g>
          <g className="tailor-mv__olhos">
            <Olho x={a.olhos.l} y={a.olhos.y} modo={olhoE} lado={1} lente={a.lente} />
            <Olho x={a.olhos.r} y={a.olhos.y} modo={olhoD} lado={-1} lente={a.lente} />
            {a.lente && <path d={`M${a.olhos.l + 16} ${a.olhos.y - 2} H${a.olhos.r - 16}`} stroke={OLHO} strokeWidth="3" />}
          </g>
          {aces && <g transform={`translate(110 ${a.topo + 2})`}>{ACESSORIOS[aces]}</g>}
          {obj && <g transform={`translate(${a.apoio[0] + 8} ${a.apoio[1] + 14})`}>{OBJETOS[obj]}</g>}
        </g>
        {pose === 'comemorando' && (
          <g className="tailor-mv__confete">
            {[[40, 20, 0], [70, 0, 0.5], [150, 10, 0.2], [180, 30, 0.9], [100, -10, 1.2], [200, 0, 0.7]].map(([x, y, d], i) => (
              <rect key={i} x={x} y={y} width="8" height="8" fill={i % 2 ? VERDE : CORPO} style={{ animationDelay: `${d}s` }} />
            ))}
          </g>
        )}
        {pose === 'dormindo' && (
          <g className="tailor-mv__zzz">
            {[0, 1, 2].map((i) => (
              <text key={i} x={150 + i * 6} y={a.topo - 4} fill={CORPO} style={{ animationDelay: `${i}s` }}>z</text>
            ))}
          </g>
        )}
      </svg>
    </>
  );
}
