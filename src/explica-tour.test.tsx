import { render, screen, fireEvent } from '@testing-library/react';
import { TailorExplain, TailorGlossary, TailorTour, TailorResult, resetTour } from './index';

beforeEach(() => { localStorage.clear(); });

describe('TailorExplain', () => {
  it('abre por padrão, recolhe e lembra', () => {
    const { unmount } = render(<TailorExplain storageKey="leads" items={[{ label: 'Novo', text: 'Chegou hoje' }]}>Aqui você vê os leads.</TailorExplain>);
    const botao = screen.getByRole('button', { name: 'Como ler esta tela' });
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Aqui você vê os leads.')).toBeInTheDocument();
    expect(screen.getByText('Chegou hoje')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(screen.queryByText('Aqui você vê os leads.')).toBeNull();
    expect(localStorage.getItem('tailor-explain:leads')).toBe('closed');
    unmount();
    render(<TailorExplain storageKey="leads">Aqui você vê os leads.</TailorExplain>);
    expect(screen.getByRole('button', { name: 'Como ler esta tela' })).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Como ler esta tela' }));
    expect(screen.getByText('Aqui você vê os leads.')).toBeInTheDocument();
    expect(localStorage.getItem('tailor-explain:leads')).toBe('open');
  });

  it('respeita defaultOpen=false e funciona com storage bloqueado', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('bloqueado'); });
    render(<TailorExplain storageKey="x" defaultOpen={false} title="O que é isto">Texto</TailorExplain>);
    const b = screen.getByRole('button', { name: 'O que é isto' });
    expect(b).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(b);
    expect(screen.getByText('Texto')).toBeInTheDocument();
    spy.mockRestore(); set.mockRestore();
  });
});

describe('TailorGlossary', () => {
  it('liga o termo à definição e abre/fecha por teclado e toque', () => {
    render(<p>O <TailorGlossary term="SLA">Prazo combinado para responder.</TailorGlossary> vence hoje.</p>);
    const termo = screen.getByRole('button', { name: 'SLA' });
    const tip = screen.getByRole('tooltip', { hidden: true });
    expect(termo.getAttribute('aria-describedby')).toBe(tip.id);
    expect(tip).toHaveAttribute('data-open', 'false');
    fireEvent.click(termo); // Enter/Espaço/toque disparam click
    expect(tip).toHaveAttribute('data-open', 'true');
    fireEvent.keyDown(termo, { key: 'Escape' });
    expect(tip).toHaveAttribute('data-open', 'false');
    fireEvent.click(termo);
    fireEvent.blur(termo);
    expect(tip).toHaveAttribute('data-open', 'false');
    fireEvent.mouseEnter(termo.parentElement!);
    expect(tip).toHaveAttribute('data-open', 'true');
    fireEvent.pointerDown(document.body);
    expect(tip).toHaveAttribute('data-open', 'false');
  });
});

describe('TailorTour', () => {
  const steps = [
    { target: 'a', title: 'Primeiro', text: 'Texto A' },
    { target: 'ausente', title: 'Fantasma', text: 'Não existe' },
    { target: 'b', title: 'Segundo', text: 'Texto B' },
  ];
  const tela = () => render(<><button data-tour="a">A</button><button data-tour="b">B</button></>);

  it('anda, volta, pula passo sem elemento e conclui lembrando', () => {
    tela();
    const fim = vi.fn();
    const { unmount } = render(<TailorTour steps={steps} storageKey="crm" onClose={fim} />);
    expect(screen.getByRole('dialog', { name: 'Primeiro' })).toBeInTheDocument();
    expect(screen.getByText('Passo 1 de 2')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('dialog', { name: 'Segundo' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(screen.getByRole('dialog', { name: 'Primeiro' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(fim).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem('tailor-tour:crm')).toBe('done');
    unmount();
    render(<TailorTour steps={steps} storageKey="crm" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    resetTour('crm');
    expect(localStorage.getItem('tailor-tour:crm')).toBeNull();
  });

  it('pular por botão e por Esc chama onSkip e lembra; foco volta a quem tinha', () => {
    tela();
    const antes = screen.getByText('A');
    antes.focus();
    const pular = vi.fn();
    render(<TailorTour steps={steps} storageKey="x" onSkip={pular} />);
    expect(screen.getByRole('dialog')).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Pular tutorial' }));
    expect(pular).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('tailor-tour:x')).toBe('done');
    expect(antes).toHaveFocus();
    localStorage.clear();
    const { rerender } = render(<TailorTour steps={steps} open={false} storageKey="y" onSkip={pular} />);
    rerender(<TailorTour steps={steps} open storageKey="y" onSkip={pular} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(pular).toHaveBeenCalledTimes(2);
  });

  it('prende o Tab no balão', () => {
    tela();
    render(<TailorTour steps={steps} />);
    screen.getByRole('button', { name: 'Pular tutorial' }).focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
  });

  it('não abre com open=false nem sem elementos', () => {
    tela();
    const { rerender } = render(<TailorTour steps={steps} open={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<TailorTour steps={[{ target: 'nada', title: 'x', text: 'y' }]} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('com menos movimento rola sem animar', () => {
    window.__reduzir = true;
    const rolar = vi.fn();
    Element.prototype.scrollIntoView = rolar;
    tela();
    render(<TailorTour steps={steps} />);
    expect(rolar).toHaveBeenCalledWith({ block: 'center', behavior: 'auto' });
    window.__reduzir = false;
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });
});

describe('TailorResult celebrate', () => {
  it('sucesso com celebrate ganha a variante e as faíscas; sem celebrate, nada muda', () => {
    const { container, rerender } = render(<TailorResult status="success" title="Pronto" />);
    expect(container.querySelector('.tailor-result--celebrate')).toBeNull();
    expect(container.querySelector('.tailor-result__burst')).toBeNull();
    rerender(<TailorResult status="success" title="Pronto" celebrate />);
    expect(container.querySelector('.tailor-result--celebrate')).not.toBeNull();
    expect(container.querySelectorAll('.tailor-result__spark')).toHaveLength(8);
    rerender(<TailorResult status="error" title="Falhou" celebrate />);
    expect(container.querySelector('.tailor-result--celebrate')).toBeNull();
  });

  it('com menos movimento não renderiza faíscas', () => {
    window.__reduzir = true;
    const { container } = render(<TailorResult status="success" title="Pronto" celebrate />);
    expect(container.querySelector('.tailor-result--celebrate')).not.toBeNull();
    expect(container.querySelector('.tailor-result__burst')).toBeNull();
    window.__reduzir = false;
  });
});
