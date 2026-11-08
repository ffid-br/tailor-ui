import style_ from './styles/style.css?raw';
import tokens_ from './styles/tokens.css?raw';
import theme_ from './styles/theme.css?raw';
import { describe, expect, it } from 'vitest';

const ler = (f: string) => ({ 'style.css': style_, 'tokens.css': tokens_, 'theme.css': theme_ })[f]!;
const semComentario = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('marca: CSS dos componentes', () => {
  const style = semComentario(ler('style.css'));

  it('não tem hex cru: cor só por token (os valores moram em tokens.css)', () => {
    expect(style.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  });

  it('não usa peso 700 ou maior (manual: até 600)', () => {
    expect(style.match(/font-weight:\s*[7-9]00\b/g) ?? []).toEqual([]);
    expect(style.match(/font:\s*[7-9]00\b/g) ?? []).toEqual([]);
  });

  it('não tem sombra decorativa: box-shadow só como anel de foco ou recorte do tour', () => {
    const sombras = style.match(/box-shadow:[^;}]*/g) ?? [];
    for (const s of sombras) expect(s).toMatch(/0 0 0 (3|4|9999)px|inset 0 0 0 4px/);
  });
});

describe('marca: tokens', () => {
  const tokens = ler('tokens.css');
  const theme = ler('theme.css');

  it('traz a borda e o verde-ink da skill', () => {
    expect(tokens).toMatch(/--tailor-border:\s*#D9D9D9/);
    expect(tokens).toMatch(/--tailor-green-ink:\s*#3C6600/);
    expect(theme).toMatch(/--color-tailor-green-ink:\s*#3C6600/);
  });

  it('tailor-ink é só alias deprecado do verde-ink', () => {
    expect(tokens).toMatch(/--tailor-ink:\s*var\(--tailor-green-ink\)/);
    expect(theme).toMatch(/--color-tailor-ink:\s*var\(--color-tailor-green-ink\)/);
  });

  it('não tem peso 700 nem raio', () => {
    expect(tokens + theme).not.toMatch(/font-weight[^;]*:\s*[7-9]00/);
    expect(tokens).toMatch(/--tailor-radius:\s*0;/);
  });
});

describe('marca: sincronia com a skill', () => {
  it('tem os tokens novos da skill e não tem danger-strong', () => {
    const t = ler('tokens.css');
    expect(t).toMatch(/--tailor-tracking-label:\s*0\.14em/);
    expect(t).toMatch(/--tailor-danger-hover:\s*#D6003A/);
    expect(t).toMatch(/--tailor-black-hover:\s*#333333/);
    expect(t).toMatch(/--tailor-danger-on-dark:\s*#FF5C82/);
    expect(t).toMatch(/--tailor-fg-inverse-secondary:\s*#CFCFCF/);
    expect(t).toMatch(/--tailor-text-kpi-app:\s*500 34px/);
    expect(t + ler('style.css') + ler('theme.css')).not.toContain('danger-strong');
  });
});
