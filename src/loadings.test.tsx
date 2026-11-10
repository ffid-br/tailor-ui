import { render, screen } from '@testing-library/react';
import { TailorSpinner, TailorDots, TailorProgress, TailorBlinds, TailorRefreshOverlay } from './index';

describe('loadings do brand guide', () => {
  it('spinner e dots expõem status com rótulo', () => {
    render(<><TailorSpinner size="xl" /><TailorDots label="Digitando" /></>);
    expect(screen.getByRole('status', { name: 'Carregando' })).toHaveClass('size-14');
    expect(screen.getByRole('status', { name: 'Digitando' }).querySelectorAll('i')).toHaveLength(3);
  });

  it('progress: com valor é determinada e limita 0 a 100; sem valor é indeterminada', () => {
    const { rerender } = render(<TailorProgress value={140} label="Importando" />);
    const bar = screen.getByRole('progressbar', { name: 'Importando' });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar.querySelector('span')).toHaveStyle({ width: '100%' });
    rerender(<TailorProgress label="Importando" />);
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveClass('tailor-progress--indeterminate');
  });

  it('blinds tem 8 cortinas com stagger e o conteúdo por trás', () => {
    render(<TailorBlinds loop><span>Tailor.ia</span></TailorBlinds>);
    const cortinas = screen.getByRole('status').querySelectorAll('.tailor-blinds__curtains i');
    expect(cortinas).toHaveLength(8);
    expect(cortinas[7]).toHaveStyle({ animationDelay: '0.35s' });
    expect(screen.getByText('Tailor.ia')).toBeInTheDocument();
  });

  it('overlay cobre o conteúdo só quando ativo, sem tirá-lo da tela', () => {
    const { rerender, container } = render(<TailorRefreshOverlay active={false}><p>Tabela</p></TailorRefreshOverlay>);
    expect(screen.queryByRole('status')).toBeNull();
    rerender(<TailorRefreshOverlay active label="Atualizando"><p>Tabela</p></TailorRefreshOverlay>);
    expect(screen.getByRole('status')).toHaveTextContent('Atualizando');
    expect(screen.getByText('Tabela')).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });
});
