import { render, screen } from '@testing-library/react';
import { TailorLoader, TailorBrandMark, EntradaApp, marcarEntradaPendente, limparEntradaPendente, ENTRADA_PENDENTE } from './index';

beforeEach(() => {
  sessionStorage.clear();
  delete document.documentElement.dataset.entrada;
});

describe('TailorLoader', () => {
  it.each(['inline', 'overlay', 'compact'] as const)('variante %s expõe role=status com o rótulo', (variant) => {
    render(<TailorLoader variant={variant} label="Carregando contas" />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando contas');
  });

  it('usa o rótulo padrão e mostra o detalhe', () => {
    render(<TailorLoader detail="3 de 5" />);
    expect(screen.getByRole('status')).toHaveTextContent('Tirando as medidas');
    expect(screen.getByText('3 de 5')).toBeInTheDocument();
  });
});

describe('EntradaApp', () => {
  it('com entrada pendente, mostra o preto, marca <html data-entrada> e consome a marca', () => {
    sessionStorage.setItem('tailor_entrada_vista', '1');
    marcarEntradaPendente();
    const { container } = render(<EntradaApp />);
    expect(container.querySelector('[data-tailor-entrada]')).toBeInTheDocument();
    expect(document.documentElement.dataset.entrada).toBe('1');
    expect(sessionStorage.getItem(ENTRADA_PENDENTE)).toBeNull();
  });

  it('sem marca e com a aba já vista, não aparece', () => {
    sessionStorage.setItem('tailor_entrada_vista', '1');
    const { container } = render(<EntradaApp />);
    expect(container.querySelector('[data-tailor-entrada]')).toBeNull();
    expect(document.documentElement.dataset.entrada).toBeUndefined();
  });

  it('limparEntradaPendente desfaz a marca', () => {
    marcarEntradaPendente();
    limparEntradaPendente();
    expect(sessionStorage.getItem(ENTRADA_PENDENTE)).toBeNull();
  });
});

describe('TailorBrandMark', () => {
  it('usa o wordmark embutido por padrão', () => {
    const { container } = render(<TailorBrandMark produto="Conta" />);
    expect(container.firstChild).toHaveAttribute('aria-label', 'Tailor.ia Conta');
    expect(container.querySelector('img')?.getAttribute('src')).toMatch(/tailor-logo\.png|^data:image\/png/);
  });

  it('usa a logo do cliente quando informada', () => {
    const { container } = render(<TailorBrandMark produto="Pilot" logoClaro="/cliente.png" logoEscuro="/cliente-branco.png" />);
    const srcs = Array.from(container.querySelectorAll('img')).map((i) => i.getAttribute('src'));
    expect(srcs).toEqual(['/cliente.png', '/cliente-branco.png']);
    expect(container.firstChild).toHaveAttribute('aria-label', 'Pilot');
  });

  it('compacto mostra só a palavra', () => {
    const { container } = render(<TailorBrandMark produto="Genius" compact />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('Genius')).toBeInTheDocument();
  });
});
