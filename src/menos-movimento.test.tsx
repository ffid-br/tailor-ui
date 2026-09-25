import { render } from '@testing-library/react';
import { CinematicIntro, EntradaApp, ENTRADA_PENDENTE } from './index';

// Arquivo à parte: o framer-motion lê a preferência uma vez por módulo.
window.__reduzir = true;

describe('menos movimento', () => {
  it('EntradaApp não mostra o preto nem anima, mas consome a marca', () => {
    sessionStorage.setItem(ENTRADA_PENDENTE, '1');
    const { container } = render(<EntradaApp />);
    expect(container.querySelector('[data-tailor-entrada]')).toBeNull();
    expect(document.documentElement.dataset.entrada).toBeUndefined();
    expect(sessionStorage.getItem(ENTRADA_PENDENTE)).toBeNull();
  });

  it('CinematicIntro pula direto para onComplete', () => {
    const onComplete = vi.fn();
    const { container } = render(<CinematicIntro onComplete={onComplete} />);
    expect(container).toBeEmptyDOMElement();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
