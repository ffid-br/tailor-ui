import { act, render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { CinematicIntro, TailorButton, TailorConfirmation, TailorField, TailorLocaleProvider, TailorMonogram, TailorToaster, TailorResult, TailorTypewriter, TailorSkeleton, toast, useTailorLocale } from './index';

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

describe('TailorConfirmation', () => {
  it('fechado não mostra nada; aberto traz o título, os nós, os passos e fecha no botão', () => {
    const fechar = vi.fn();
    const { rerender, container } = render(<TailorConfirmation open={false} title="Maria, recebemos." onClose={fechar} />);
    expect(container.querySelector('.tailor-confirmation__stage')).toBeNull();
    rerender(
      <TailorConfirmation open title="Maria, recebemos." overline="Inscrição recebida" description="A confirmação chega pelo WhatsApp."
        nodes={['WhatsApp', 'CRM', 'Agenda', 'BI', 'MCP', 'Pré-vendas', 'sobra']} steps={['recebido', 'conferido']} actions={<a href="#agenda">Salvar na agenda</a>} onClose={fechar} />,
    );
    // jsdom não abre <dialog>: o conteúdo é conferido pelo DOM, sem depender de papel acessível.
    expect(container.querySelector('h2')).toHaveAttribute('aria-label', 'Maria, recebemos.');
    expect(container.querySelectorAll('.tailor-confirmation__letter')).toHaveLength('Maria,recebemos.'.length);
    expect(container.querySelectorAll('.tailor-confirmation__node')).toHaveLength(6);
    expect(container.querySelectorAll('.tailor-confirmation__step')).toHaveLength(2);
    expect(container.querySelector('.tailor-confirmation__step--last')).toHaveTextContent('02 › conferido');
    expect(container).toHaveTextContent('Inscrição recebida');
    expect(container).toHaveTextContent('Salvar na agenda');
    // 2 passos: 0,9 + 2 × 0,6 = 2,1 s até a rede recuar.
    expect((container.querySelector('dialog') as HTMLElement).style.getPropertyValue('--tailor-confirmation-t')).toBe('2.1s');
    fireEvent.click(container.querySelector('.tailor-confirmation__close')!);
    expect(fechar).toHaveBeenCalledTimes(1);
  });
});

describe('correções da validação geral', () => {
  it('TailorButton em loading não envia o formulário', () => {
    const enviar = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { rerender } = render(<form onSubmit={enviar}><TailorButton type="submit">Salvar</TailorButton></form>);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(enviar).toHaveBeenCalledTimes(1);
    rerender(<form onSubmit={enviar}><TailorButton type="submit" loading>Salvar</TailorButton></form>);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(enviar).toHaveBeenCalledTimes(1);
  });

  it('TailorConfirmation chama onClose uma vez no botão e uma no Esc, sem repetir', () => {
    const fechou = vi.fn();
    function Caso() {
      const [aberto, setAberto] = useState(true);
      return <TailorConfirmation open={aberto} title="Pronto." onClose={() => { fechou(); setAberto(false); }} />;
    }
    const { container } = render(<Caso />);
    fireEvent.click(container.querySelector('.tailor-confirmation__close')!);
    expect(fechou).toHaveBeenCalledTimes(1);
    // o evento `close` que o dialog solta depois não pode chamar de novo
    fireEvent(container.querySelector('dialog')!, new Event('close'));
    expect(fechou).toHaveBeenCalledTimes(1);
    const esc = render(<TailorConfirmation open title="Pronto." onClose={fechou} />);
    fireEvent(esc.container.querySelector('dialog')!, new Event('cancel', { cancelable: true }));
    expect(fechou).toHaveBeenCalledTimes(2);
  });

  it('TailorConfirmation: duas instâncias não repetem o id do título', () => {
    const { container } = render(<><TailorConfirmation open title="Um." onClose={() => {}} /><TailorConfirmation open title="Dois." onClose={() => {}} /></>);
    const ids = Array.from(container.querySelectorAll('h2'), (h) => h.id);
    expect(new Set(ids).size).toBe(2);
    container.querySelectorAll('dialog').forEach((d, i) => expect(d).toHaveAttribute('aria-labelledby', ids[i]));
  });

  it('CinematicIntro chama onComplete uma vez só, mesmo com "Pular" e o fim da barra', () => {
    vi.useFakeTimers();
    const fim = vi.fn();
    const { unmount } = render(<CinematicIntro onComplete={fim} skipLabel="Pular" duration={0.01} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(fim).toHaveBeenCalledTimes(1);
    unmount();
    vi.useRealTimers();
  });

  it('aviso não some com o mouse em cima e some depois que o mouse sai', () => {
    vi.useFakeTimers();
    render(<TailorToaster />);
    // a fila é global: acha o aviso pelo texto, não pelo papel (pode haver outros de testes anteriores)
    act(() => { toast.error('Falhou ao salvar o contato', { duration: 1000 }); });
    const aviso = screen.getByText('Falhou ao salvar o contato').closest('.tailor-toast') as HTMLElement;
    act(() => { vi.advanceTimersByTime(600); });
    fireEvent.mouseEnter(aviso);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.queryByText('Falhou ao salvar o contato')).not.toBeNull();
    fireEvent.mouseLeave(aviso);
    act(() => { vi.advanceTimersByTime(399); });
    expect(screen.queryByText('Falhou ao salvar o contato')).not.toBeNull();
    act(() => { vi.advanceTimersByTime(2); });
    expect(screen.queryByText('Falhou ao salvar o contato')).toBeNull();
    vi.useRealTimers();
  });

  it('TailorMonogram tenta a foto nova depois de uma que falhou', () => {
    const { container, rerender } = render(<TailorMonogram id="1" name="Maria Souza" src="/quebrada.jpg" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    rerender(<TailorMonogram id="1" name="Maria Souza" src="/boa.jpg" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/boa.jpg');
  });

  it('idioma "pt" e "pt-PT" ficam em português; texto undefined não apaga o padrão', () => {
    const Fechar = () => <span>{useTailorLocale().messages.close}</span>;
    const { rerender } = render(<TailorLocaleProvider locale="pt-PT"><Fechar /></TailorLocaleProvider>);
    expect(screen.getByText('Fechar')).toBeInTheDocument();
    rerender(<TailorLocaleProvider locale="pt" messages={{ close: undefined }}><Fechar /></TailorLocaleProvider>);
    expect(screen.getByText('Fechar')).toBeInTheDocument();
    rerender(<TailorLocaleProvider locale="fr"><Fechar /></TailorLocaleProvider>);
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});

describe('TailorField', () => {
  it('liga rótulo e erro ao controle e marca aria-invalid', () => {
    const { rerender } = render(<TailorField label="Nome" required><input /></TailorField>);
    const input = screen.getByRole('textbox', { name: /Nome/ });
    expect(input).toBeRequired();
    expect(input).not.toHaveAttribute('aria-invalid');
    rerender(<TailorField label="Nome" required error="Preencha o nome."><input /></TailorField>);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Preencha o nome.');
  });
});

describe('TailorButton', () => {
  it('carregando: ocupado, sem clique, texto de carregando', () => {
    const clique = vi.fn();
    const { rerender } = render(<TailorButton onClick={clique}>Salvar</TailorButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(clique).toHaveBeenCalledTimes(1);
    rerender(<TailorButton onClick={clique} loading loadingText="Salvando">Salvar</TailorButton>);
    const b = screen.getByRole('button', { name: 'Salvando' });
    expect(b).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(b);
    expect(clique).toHaveBeenCalledTimes(1);
  });

  it('só ícone vira quadrado e usa o aria-label', () => {
    render(<TailorButton aria-label="Fechar" icon={<svg />} variant="ghost" />);
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveClass('tailor-btn--icon-only');
  });
});
