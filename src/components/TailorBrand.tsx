import React, { useId } from 'react';

/**
 * A marca do cliente em variáveis CSS. Os componentes que leem `--tailor-brand-*`
 * (`TailorPageHeader`, `TailorTable`, avisos) trocam de cor, fonte e cantos sem mudar uma
 * linha de componente. Sem tema, valem os padrões Tailor do `style.css`.
 */
export type TailorTheme = {
  /** Cor de destaque: o ponto do sobretítulo, a barra de foco. */
  primary?: string;
  /** Destaque como texto sobre o fundo (precisa de contraste; no Tailor é o verde-ink). */
  primaryText?: string;
  text?: string;
  textMuted?: string;
  border?: string;
  /** Fundo do cabeçalho. Padrão: transparente (o cabeçalho é o começo da página). */
  background?: string;
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string | number;
  /** `uppercase` para marcas que pedem título em caixa alta. */
  headingCase?: 'none' | 'uppercase';
  /** Cantos dos elementos com caixa (etiqueta, botão voltar). Tailor: 0. */
  radius?: string;
};

const VARIAVEL: Record<keyof TailorTheme, string> = {
  primary: '--tailor-brand-primary',
  primaryText: '--tailor-brand-primary-text',
  text: '--tailor-brand-text',
  textMuted: '--tailor-brand-text-muted',
  border: '--tailor-brand-border',
  background: '--tailor-brand-background',
  headingFont: '--tailor-brand-heading-font',
  bodyFont: '--tailor-brand-body-font',
  headingWeight: '--tailor-brand-heading-weight',
  headingCase: '--tailor-brand-heading-case',
  radius: '--tailor-brand-radius',
};

/** O tema como objeto de variáveis, para `style` ou para montar um CSS do cliente. */
export function themeToVars(theme: TailorTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  (Object.keys(theme) as Array<keyof TailorTheme>).forEach((k) => {
    const v = theme[k];
    if (v !== undefined && v !== '') vars[VARIAVEL[k]] = String(v);
  });
  return vars;
}

const bloco = (vars: Record<string, string>) =>
  Object.entries(vars).map(([k, v]) => `${k}:${v.replace(/[;{}<]/g, '')}`).join(';');

export type TailorBrandProps = {
  theme: TailorTheme;
  /** Ajustes do tema escuro (`.dark` ou `[data-theme="dark"]` num ancestral). */
  dark?: TailorTheme;
  children: React.ReactNode;
};

/**
 * Aplica o tema a tudo que estiver dentro, sem mexer no layout (`display: contents`).
 * As variáveis vão num `<style>` com seletor próprio, e não em `style`, para o
 * tema escuro conseguir sobrescrever as do claro.
 */
export function TailorBrand({ theme, dark, children }: TailorBrandProps) {
  const id = useId();
  const sel = `[data-tailor-brand="${id}"]`;
  const css = `${sel}{${bloco(themeToVars(theme))}}`
    + (dark ? `:where(.dark,[data-theme="dark"]) ${sel}${sel}{${bloco(themeToVars(dark))}}` : '');
  return (
    <div className="tailor-brand" data-tailor-brand={id}>
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
export type TailorWhitelabel = {
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
export function contrast(a: string, b: string) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Traduz o whitelabel do Mongo para o tema. Ignora o azul padrão do cadastro e
 * valores que não são hex. A primária só vira cor de texto se tiver contraste
 * AA sobre o fundo; senão o texto de destaque usa a cor de texto da marca.
 */
export function themeFromWhitelabel(wl?: TailorWhitelabel | null): { theme: TailorTheme; dark?: TailorTheme } {
  const c = wl?.colors ?? {};
  const fundo = hex(c.background) ?? '#FFFFFF';
  const primaria = cor(c.primary);
  const texto = hex(c.text);
  const theme: TailorTheme = {
    primary: primaria,
    primaryText: primaria && contrast(primaria, fundo) >= 4.5 ? primaria : texto,
    text: texto,
    textMuted: hex(c.text_muted),
    border: hex(c.border),
    headingFont: wl?.fonts?.heading ? `"${wl.fonts.heading}", var(--tailor-font)` : undefined,
    bodyFont: wl?.fonts?.body ? `"${wl.fonts.body}", var(--tailor-font)` : undefined,
    headingWeight: wl?.fonts?.heading_weight,
    headingCase: wl?.fonts?.heading_case,
    radius: wl?.shape?.radius,
  };
  const d = c.dark;
  if (!d) return { theme };
  const fundoEscuro = hex(d.background) ?? '#000000';
  const primariaEscura = cor(d.primary) ?? primaria;
  return {
    theme,
    dark: {
      primary: primariaEscura,
      primaryText: primariaEscura && contrast(primariaEscura, fundoEscuro) >= 4.5 ? primariaEscura : hex(d.text),
      text: hex(d.text),
      textMuted: hex(d.text_muted),
      border: hex(d.border),
    },
  };
}
