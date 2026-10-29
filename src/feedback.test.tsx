import { act, render, screen, fireEvent } from '@testing-library/react';
import { TailorAvisos, TailorConclusao, TailorDigitando, TailorEsqueleto, avisar } from './index';

describe('TailorAvisos', () => {
  it('mostra sucesso como status e erro como alert; fecha no botão', () => {
    render(<TailorAvisos />);
    act(() => { avisar.sucesso('Salvo', { detalhe: 'Contato atualizado' }); avisar.erro('Falhou'); });
    expect(screen.getByRole('status')).toHaveTextContent('SalvoContato atualizado');
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar aviso' })[0]);
    expect(screen.queryByText('Salvo')).toBeNull();
  });

  it('some sozinho depois da duração', () => {
    vi.useFakeTimers();
    render(<TailorAvisos />);
    act(() => { avisar.info('Sincronizando', { duracao: 1000 }); });
    expect(screen.getByText('Sincronizando')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.queryByText('Sincronizando')).toBeNull();
    vi.useRealTimers();
  });
});

describe('TailorEsqueleto', () => {
  it('anuncia o carregamento e monta a tabela com cabeçalho', () => {
    const { container } = render(<TailorEsqueleto forma="tabela" colunas={3} linhas={2} />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(container.querySelectorAll('.tailor-esq__linha')).toHaveLength(3);
    expect(container.querySelectorAll('.tailor-esq__barra')).toHaveLength(9);
  });
});

describe('TailorDigitando', () => {
  it('escreve letra a letra, mas o leitor de tela recebe a frase inteira', () => {
    vi.useFakeTimers();
    const terminou = vi.fn();
    const { container } = render(<TailorDigitando textos={['Oi']} umaVez aoTerminar={terminou} />);
    expect(container.querySelector('.tailor-digitando__leitor')).toHaveTextContent('Oi');
    act(() => { vi.advanceTimersByTime(60); });
    act(() => { vi.advanceTimersByTime(60); });
    act(() => { vi.advanceTimersByTime(10); });
    expect(terminou).toHaveBeenCalled();
    expect(container.querySelector('.tailor-digitando__cursor')).toBeNull();
    vi.useRealTimers();
  });
});

describe('TailorConclusao', () => {
  it('sucesso fecha sozinho; erro espera e mostra as ações', () => {
    vi.useFakeTimers();
    const fechar = vi.fn();
    const { rerender } = render(<TailorConclusao tipo="sucesso" titulo="Salvo" aoFechar={fechar} />);
    expect(screen.getByRole('status')).toHaveTextContent('Salvo');
    act(() => { vi.advanceTimersByTime(2400); });
    act(() => { vi.advanceTimersByTime(700); });
    expect(fechar).toHaveBeenCalledTimes(1);
    rerender(<TailorConclusao tipo="erro" titulo="Falhou" aoFechar={fechar} acoes={<button>Tentar de novo</button>} />);
    act(() => { vi.advanceTimersByTime(10000); });
    expect(fechar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
