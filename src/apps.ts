/*
 * Registro dos apps Tailor: nome, ícone e título de aba num lugar só. O launcher,
 * a barra lateral, o favicon e a transição de entrada leem daqui, então "Pilot"
 * é "Pilot" (e o mesmo ícone) em todo canto.
 *
 * Sem imports de propósito: o `scripts/gerar-icones-apps.ts` roda este arquivo
 * direto no Node para gerar os SVGs de `src/assets/apps/`.
 */

export type TailorAppId = 'accounts' | 'crm' | 'pilot' | 'bi' | 'genius' | 'nr1';

export type TailorApp = {
  id: TailorAppId;
  /** Nome curto na interface e na aba: "Accounts", "Studio". */
  nome: string;
  /** Chaves de produto que o `/clients/uses` e os launchers usam para este app. */
  chaves: string[];
  /** Arquivo em `@ffid-br/tailor-ui/icons/apps/`. */
  favicon: string;
  /** Letra do ícone (a diferença principal na aba de 16px). */
  letra: string;
  /** Glifo 5x5 em células de ponto ('#' = cheio). */
  glifo: string[];
  /** Fundo, letra e ponto do ícone (paleta do manual). */
  tile: string;
  tinta: string;
  ponto: string;
};

const PRETO = '#000000';
const BRANCO = '#FFFFFF';
const VERDE = '#90F208';
const VERDE_INK = '#3C6600';
const CINZA_ESCURO = '#333333';
const CINZA = '#666666';

const L = {
  C: ['.####', '#....', '#....', '#....', '.####'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  B: ['####.', '#...#', '####.', '#...#', '####.'],
  G: ['.####', '#....', '#.###', '#...#', '.####'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
};

// Letra primeiro, cor depois: seis fundos e seis letras, nenhum par se confunde em 16px.
export const TAILOR_APPS: Record<TailorAppId, TailorApp> = {
  accounts: { id: 'accounts', nome: 'Accounts', chaves: ['accounts'], favicon: 'accounts.svg', letra: 'C', glifo: L.C, tile: PRETO, tinta: BRANCO, ponto: VERDE },
  crm: { id: 'crm', nome: 'Studio', chaves: ['crm', 'ffid.ai.studio'], favicon: 'crm.svg', letra: 'R', glifo: L.R, tile: VERDE, tinta: PRETO, ponto: PRETO },
  pilot: { id: 'pilot', nome: 'Pilot', chaves: ['pilot'], favicon: 'pilot.svg', letra: 'M', glifo: L.M, tile: VERDE_INK, tinta: BRANCO, ponto: VERDE },
  bi: { id: 'bi', nome: 'BI', chaves: ['bi'], favicon: 'bi.svg', letra: 'B', glifo: L.B, tile: CINZA_ESCURO, tinta: BRANCO, ponto: VERDE },
  genius: { id: 'genius', nome: 'Genius', chaves: ['gpt', 'genius'], favicon: 'genius.svg', letra: 'G', glifo: L.G, tile: PRETO, tinta: VERDE, ponto: BRANCO },
  nr1: { id: 'nr1', nome: 'NR1', chaves: ['nr1'], favicon: 'nr1.svg', letra: 'N', glifo: L.N, tile: CINZA, tinta: BRANCO, ponto: VERDE },
};

/** O app de uma chave de produto (`gpt`, `pilot`, `ffid.ai.studio`...) ou do próprio id. `undefined` se não for um app Tailor. */
export function appPorChave(chave: string): TailorApp | undefined {
  const k = chave.toLowerCase();
  return Object.values(TAILOR_APPS).find((a) => a.id === k || a.chaves.includes(k));
}

/** Título da aba: "<Página> | <App> | Tailor.ia". Sem página: "<App> | Tailor.ia". */
export function tailorTitle(app: TailorAppId | TailorApp, pagina?: string): string {
  const a = typeof app === 'string' ? TAILOR_APPS[app] : app;
  return [pagina?.trim(), a.nome, 'Tailor.ia'].filter(Boolean).join(' | ');
}

/**
 * O SVG do ícone na grade 8x8 (viewBox 32): glifo 5x5 em (1,1) e o ponto na célula
 * (6,6), logo depois da letra, como o ponto do logotipo. Cantos retos, sem curva.
 */
export function appIconSvg(app: TailorAppId | TailorApp): string {
  const a = typeof app === 'string' ? TAILOR_APPS[app] : app;
  const celulas = a.glifo.flatMap((linha, y) => [...linha].flatMap((c, x) => (c === '#' ? [`M${(x + 1) * 4} ${(y + 1) * 4}h4v4h-4z`] : [])));
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges" role="img" aria-label="${a.nome}">`,
    `<rect width="32" height="32" fill="${a.tile}"/>`,
    `<path d="${celulas.join('')}" fill="${a.tinta}"/>`,
    `<rect x="24" y="24" width="4" height="4" fill="${a.ponto}"/>`,
    `</svg>`,
    '',
  ].join('\n');
}
