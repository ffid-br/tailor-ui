import { fireEvent, render, screen } from '@testing-library/react';
import { TailorMarca, TailorPageHeader, temaDoWhitelabel, temaParaVariaveis } from './index';

describe('TailorPageHeader', () => {
  it('título em h1, trilha com a página atual e links pelo roteador do app', () => {
    render(
      <TailorPageHeader
        titulo="Leads"
        sobretitulo="CRM"
        trilha={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Leads' }]}
        renderLink={({ children, ...p }) => <a data-roteador {...p}>{children}</a>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Leads' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('data-roteador');
    expect(screen.getByText('Leads', { selector: '[aria-current="page"]' })).toBeInTheDocument();
    expect(screen.getByText('CRM')).toBeInTheDocument();
  });

  it('voltar sem href vira botão; lateral só aparece com indicadores ou ações', () => {
    const voltar = vi.fn();
    const { container } = render(<TailorPageHeader titulo="Lead" voltar={{ rotulo: 'Voltar', onClick: voltar }} />);
    fireEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(voltar).toHaveBeenCalled();
    expect(container.querySelector('.tailor-ph__lateral')).toBeNull();
  });
});

describe('TailorMarca', () => {
  it('vira variáveis CSS e ignora o que não foi passado', () => {
    expect(temaParaVariaveis({ primaria: '#E30613', caixaTitulo: 'uppercase', texto: '' })).toEqual({
      '--tailor-marca-primaria': '#E30613',
      '--tailor-marca-caixa-titulo': 'uppercase',
    });
  });

  it('claro e escuro num <style> com seletor próprio', () => {
    const { container } = render(<TailorMarca tema={{ fonteTitulo: 'Montserrat' }} escuro={{ texto: '#FFFFFF' }}><span /></TailorMarca>);
    const css = container.querySelector('style')!.textContent!;
    expect(css).toContain('--tailor-marca-fonte-titulo:Montserrat');
    expect(css).toMatch(/:where\(\.dark,\[data-theme="dark"\]\) \[data-tailor-marca=.*--tailor-marca-texto:#FFFFFF/);
  });
});

describe('temaDoWhitelabel', () => {
  it('ignora o azul padrão do cadastro e valor que não é hex', () => {
    const { tema } = temaDoWhitelabel({ colors: { primary: '#007bff', secondary: '#6c757d', background: '#ffffff', text: 'preto' } });
    expect(temaParaVariaveis(tema)).toEqual({});
  });

  it('primária clara não vira texto: o destaque em texto usa a cor de texto', () => {
    const { tema } = temaDoWhitelabel({ colors: { primary: '#FFD71D', text: '#111111', background: '#ffffff' }, fonts: { heading: 'Montserrat', heading_case: 'uppercase' } });
    expect(tema.primaria).toBe('#FFD71D');
    expect(tema.primariaTexto).toBe('#111111');
    expect(tema.fonteTitulo).toBe('"Montserrat", var(--tailor-font)');
    expect(tema.caixaTitulo).toBe('uppercase');
  });

  it('primária escura com contraste vira texto também; dark gera tema escuro', () => {
    const { tema, escuro } = temaDoWhitelabel({ colors: { primary: '#002a57', dark: { primary: '#4da3ff', text: '#ffffff' } } });
    expect(tema.primariaTexto).toBe('#002a57');
    expect(escuro?.primariaTexto).toBe('#4da3ff');
  });
});
