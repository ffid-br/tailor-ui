import React, { useId } from 'react';

/**
 * A marca do cliente em variáveis CSS. Os componentes que leem `--tailor-marca-*`
 * (por enquanto o `TailorPageHeader`) trocam de cor, fonte e cantos sem mudar uma
 * linha de componente. Sem tema, valem os padrões Tailor do `style.css`.
 */
export type TailorTema = {
  /** Cor de destaque: o ponto do sobretítulo, a barra de foco. */
  primaria?: string;
  /** Destaque como texto sobre o fundo (precisa de contraste; no Tailor é o verde-ink). */
  primariaTexto?: string;
  texto?: string;
  textoSuave?: string;
  borda?: string;
  /** Fundo do cabeçalho. Padrão: transparente (o cabeçalho é o começo da página). */
  fundo?: string;
  fonteTitulo?: string;
  fonteTexto?: string;
  pesoTitulo?: string | number;
  /** `uppercase` para marcas que pedem título em caixa alta. */
  caixaTitulo?: 'none' | 'uppercase';
  /** Cantos dos elementos com caixa (etiqueta, botão voltar). Tailor: 0. */
  raio?: string;
};

const VARIAVEL: Record<keyof TailorTema, string> = {
  primaria: '--tailor-marca-primaria',
  primariaTexto: '--tailor-marca-primaria-texto',
  texto: '--tailor-marca-texto',
  textoSuave: '--tailor-marca-texto-suave',
  borda: '--tailor-marca-borda',
  fundo: '--tailor-marca-fundo',
  fonteTitulo: '--tailor-marca-fonte-titulo',
  fonteTexto: '--tailor-marca-fonte-texto',
  pesoTitulo: '--tailor-marca-peso-titulo',
  caixaTitulo: '--tailor-marca-caixa-titulo',
  raio: '--tailor-marca-raio',
};

/** O tema como objeto de variáveis, para `style` ou para montar um CSS do cliente. */
export function temaParaVariaveis(tema: TailorTema): Record<string, string> {
  const vars: Record<string, string> = {};
  (Object.keys(tema) as Array<keyof TailorTema>).forEach((k) => {
    const v = tema[k];
    if (v !== undefined && v !== '') vars[VARIAVEL[k]] = String(v);
  });
  return vars;
}

const bloco = (vars: Record<string, string>) =>
  Object.entries(vars).map(([k, v]) => `${k}:${v.replace(/[;{}<]/g, '')}`).join(';');

export type TailorMarcaProps = {
  tema: TailorTema;
  /** Ajustes do tema escuro (`.dark` ou `[data-theme="dark"]` num ancestral). */
  escuro?: TailorTema;
  children: React.ReactNode;
};

/**
 * Aplica o tema a tudo que estiver dentro, sem mexer no layout (`display: contents`).
 * As variáveis vão num `<style>` com seletor próprio, e não em `style`, para o
 * tema escuro conseguir sobrescrever as do claro.
 */
export function TailorMarca({ tema, escuro, children }: TailorMarcaProps) {
  const id = useId();
  const sel = `[data-tailor-marca="${id}"]`;
  const css = `${sel}{${bloco(temaParaVariaveis(tema))}}`
    + (escuro ? `:where(.dark,[data-theme="dark"]) ${sel}${sel}{${bloco(temaParaVariaveis(escuro))}}` : '');
  return (
    <div className="tailor-marca" data-tailor-marca={id}>
      <style>{css}</style>
      {children}
    </div>
  );
}

/**
 * `account_info.whitelabel` do cliente (Mongo `clients`). Os campos além de
 * `colors.primary/secondary/background/text` e `logos.*` são a proposta para
 * completar a marca; enquanto não existirem, ficam os padrões Tailor.
 */
export type WhitelabelDoCliente = {
  colors?: {
    primary?: string; secondary?: string; background?: string; text?: string;
    text_muted?: string; border?: string;
    dark?: { primary?: string; background?: string; text?: string; text_muted?: string; border?: string };
  };
  fonts?: { heading?: string; body?: string; heading_weight?: number | string; heading_case?: 'none' | 'uppercase' };
  shape?: { radius?: string };
  logos?: { rectangular_light?: string; rectangular_dark?: string; square_light?: string; square_dark?: string };
};

/** Cores que o cadastro grava quando ninguém escolheu nada (padrão do Bootstrap). */
const PADRAO_DO_CADASTRO = ['#007bff', '#6c757d'];
const hex = (v?: string) => (v && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim()) ? v.trim() : undefined);
const cor = (v?: string) => {
  const h = hex(v);
  return h && !PADRAO_DO_CADASTRO.includes(h.toLowerCase()) ? h : undefined;
};

function luminancia(h: string) {
  const n = h.length === 4 ? h.slice(1).split('').map((c) => c + c).join('') : h.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/** Razão de contraste WCAG entre duas cores hex. */
export function contraste(a: string, b: string) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Traduz o whitelabel do Mongo para o tema. Ignora o azul padrão do cadastro e
 * valores que não são hex. A primária só vira cor de texto se tiver contraste
 * AA sobre o fundo; senão o texto de destaque usa a cor de texto da marca.
 */
export function temaDoWhitelabel(wl?: WhitelabelDoCliente | null): { tema: TailorTema; escuro?: TailorTema } {
  const c = wl?.colors ?? {};
  const fundo = hex(c.background) ?? '#FFFFFF';
  const primaria = cor(c.primary);
  const texto = hex(c.text);
  const tema: TailorTema = {
    primaria,
    primariaTexto: primaria && contraste(primaria, fundo) >= 4.5 ? primaria : texto,
    texto,
    textoSuave: hex(c.text_muted),
    borda: hex(c.border),
    fonteTitulo: wl?.fonts?.heading ? `"${wl.fonts.heading}", var(--tailor-font)` : undefined,
    fonteTexto: wl?.fonts?.body ? `"${wl.fonts.body}", var(--tailor-font)` : undefined,
    pesoTitulo: wl?.fonts?.heading_weight,
    caixaTitulo: wl?.fonts?.heading_case,
    raio: wl?.shape?.radius,
  };
  const d = c.dark;
  if (!d) return { tema };
  const fundoEscuro = hex(d.background) ?? '#000000';
  const primariaEscura = cor(d.primary) ?? primaria;
  return {
    tema,
    escuro: {
      primaria: primariaEscura,
      primariaTexto: primariaEscura && contraste(primariaEscura, fundoEscuro) >= 4.5 ? primariaEscura : hex(d.text),
      texto: hex(d.text),
      textoSuave: hex(d.text_muted),
      borda: hex(d.border),
    },
  };
}
