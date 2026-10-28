import { act, render, screen, fireEvent } from '@testing-library/react';
import { TailorAvisos, TailorEsqueleto, avisar } from './index';

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
