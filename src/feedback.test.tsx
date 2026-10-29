import { act, render, screen, fireEvent } from '@testing-library/react';
import { TailorToaster, TailorResult, TailorTypewriter, TailorSkeleton, toast } from './index';

describe('TailorToaster', () => {
  it('mostra sucesso como status e erro como alert; fecha no botão', () => {
    render(<TailorToaster />);
    act(() => { toast.success('Salvo', { description: 'Contato atualizado' }); toast.error('Falhou'); });
    expect(screen.getByRole('status')).toHaveTextContent('SalvoContato atualizado');
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar aviso' })[0]);
    expect(screen.queryByText('Salvo')).toBeNull();
  });

  it('some sozinho depois da duração', () => {
    vi.useFakeTimers();
    render(<TailorToaster />);
    act(() => { toast.info('Sincronizando', { duration: 1000 }); });
    expect(screen.getByText('Sincronizando')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.queryByText('Sincronizando')).toBeNull();
    vi.useRealTimers();
  });
});

describe('TailorSkeleton', () => {
  it('anuncia o carregamento e monta a tabela com cabeçalho', () => {
    const { container } = render(<TailorSkeleton shape="table" columns={3} lines={2} />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(container.querySelectorAll('.tailor-skeleton__row')).toHaveLength(3);
    expect(container.querySelectorAll('.tailor-skeleton__bar')).toHaveLength(9);
  });
});

describe('TailorTypewriter', () => {
  it('escreve letra a letra, mas o leitor de tela recebe a frase inteira', () => {
    vi.useFakeTimers();
    const terminou = vi.fn();
    const { container } = render(<TailorTypewriter texts={['Oi']} once onDone={terminou} />);
    expect(container.querySelector('.tailor-typewriter__sr')).toHaveTextContent('Oi');
    act(() => { vi.advanceTimersByTime(60); });
    act(() => { vi.advanceTimersByTime(60); });
    act(() => { vi.advanceTimersByTime(10); });
    expect(terminou).toHaveBeenCalled();
    expect(container.querySelector('.tailor-typewriter__cursor')).toBeNull();
    vi.useRealTimers();
  });
});

describe('TailorResult', () => {
  it('sucesso fecha sozinho; erro espera e mostra as ações', () => {
    vi.useFakeTimers();
    const fechar = vi.fn();
    const { rerender } = render(<TailorResult status="success" title="Salvo" onClose={fechar} />);
    expect(screen.getByRole('status')).toHaveTextContent('Salvo');
    act(() => { vi.advanceTimersByTime(2400); });
    act(() => { vi.advanceTimersByTime(700); });
    expect(fechar).toHaveBeenCalledTimes(1);
    rerender(<TailorResult status="error" title="Falhou" onClose={fechar} actions={<button>Tentar de novo</button>} />);
    act(() => { vi.advanceTimersByTime(10000); });
    expect(fechar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
