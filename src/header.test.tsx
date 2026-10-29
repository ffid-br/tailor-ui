import { fireEvent, render, screen } from '@testing-library/react';
import { TailorBrand, TailorPageHeader, themeFromWhitelabel, themeToVars } from './index';

describe('TailorPageHeader', () => {
  it('título em h1, trilha com a página atual e links pelo roteador do app', () => {
    render(
      <TailorPageHeader
        title="Leads"
        eyebrow="CRM"
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Leads' }]}
        renderLink={({ children, ...p }) => <a data-router {...p}>{children}</a>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Leads' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('data-router');
    expect(screen.getByText('Leads', { selector: '[aria-current="page"]' })).toBeInTheDocument();
    expect(screen.getByText('CRM')).toBeInTheDocument();
  });

  it('back sem href vira botão; lateral só aparece com stats ou actions', () => {
    const back = vi.fn();
    const { container } = render(<TailorPageHeader title="Lead" back={{ label: 'Voltar', onClick: back }} />);
    fireEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(back).toHaveBeenCalled();
    expect(container.querySelector('.tailor-ph__aside')).toBeNull();
  });
});

describe('TailorBrand', () => {
  it('vira variáveis CSS e ignora o que não foi passado', () => {
    expect(themeToVars({ primary: '#E30613', headingCase: 'uppercase', text: '' })).toEqual({
      '--tailor-brand-primary': '#E30613',
      '--tailor-brand-heading-case': 'uppercase',
    });
  });

  it('claro e escuro num <style> com seletor próprio', () => {
    const { container } = render(<TailorBrand theme={{ headingFont: 'Montserrat' }} dark={{ text: '#FFFFFF' }}><span /></TailorBrand>);
    const css = container.querySelector('style')!.textContent!;
    expect(css).toContain('--tailor-brand-heading-font:Montserrat');
    expect(css).toMatch(/:where\(\.dark,\[data-theme="dark"\]\) \[data-tailor-brand=.*--tailor-brand-text:#FFFFFF/);
  });
});

describe('themeFromWhitelabel', () => {
  it('ignora o azul padrão do cadastro e valor que não é hex', () => {
    const { theme } = themeFromWhitelabel({ colors: { primary: '#007bff', secondary: '#6c757d', background: '#ffffff', text: 'preto' } });
    expect(themeToVars(theme)).toEqual({});
  });

  it('primária clara não vira texto: o destaque em texto usa a cor de texto', () => {
    const { theme } = themeFromWhitelabel({ colors: { primary: '#FFD71D', text: '#111111', background: '#ffffff' }, fonts: { heading: 'Montserrat', heading_case: 'uppercase' } });
    expect(theme.primary).toBe('#FFD71D');
    expect(theme.primaryText).toBe('#111111');
    expect(theme.headingFont).toBe('"Montserrat", var(--tailor-font)');
    expect(theme.headingCase).toBe('uppercase');
  });

  it('primária escura com contraste vira texto também; dark gera tema escuro', () => {
    const { theme, dark } = themeFromWhitelabel({ colors: { primary: '#002a57', dark: { primary: '#4da3ff', text: '#ffffff' } } });
    expect(theme.primaryText).toBe('#002a57');
    expect(theme.onPrimary).toBe('#FFFFFF');
    expect(dark?.primaryText).toBe('#4da3ff');
  });
});
