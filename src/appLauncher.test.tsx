import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TailorAppLauncher, tailorTitle } from './index';

const APPS = [
  { chave: 'accounts', url: 'https://accounts.test' },
  { chave: 'pilot', url: 'https://pilot.test' },
  { chave: 'gpt', url: 'https://genius.test' },
  { chave: 'ffid.ai.studio', url: 'https://crm.test' },
  { chave: 'crm', url: 'https://crm.test' },
  { chave: 'vitoria', url: 'https://vitoria.test' },
];
const abrir = () => fireEvent.click(screen.getByRole('button', { name: 'Apps Tailor' }));

describe('TailorAppLauncher', () => {
  it('lista os apps pelo registro, junta chaves do mesmo app e marca o atual sem link', () => {
    render(<TailorAppLauncher apps={APPS} atual="pilot" />);
    abrir();
    expect(screen.getAllByText('Relacionamento')).toHaveLength(1);
    expect(screen.getByText('Gestão')).toBeInTheDocument();
    expect(screen.getByText('Você está aqui')).toBeInTheDocument();
    expect(screen.getByText('Marketing').closest('a')).toBeNull();
    expect(screen.getByText('Marketing').closest('[aria-current="page"]')).not.toBeNull();
    expect(screen.getByText('Accounts').closest('a')).toHaveAttribute('href', 'https://accounts.test');
  });

  it('hma aparece como Omnichannel', () => {
    render(<TailorAppLauncher apps={[{ chave: 'hma', url: 'https://new.test' }]} atual="pilot" />);
    abrir();
    expect(screen.getByText('Omnichannel').closest('a')).toHaveAttribute('href', 'https://new.test');
  });

  it('app sem registro usa a inicial', () => {
    render(<TailorAppLauncher apps={APPS} atual="bi" />);
    abrir();
    const item = screen.getByText('Vitoria');
    expect(item.closest('a')).toHaveAttribute('href', 'https://vitoria.test');
    expect(screen.getByText('V')).toBeInTheDocument();
  });

  it('app sem registro usa o nome informado; app registrado ignora', () => {
    render(
      <TailorAppLauncher
        apps={[{ chave: 'sac', url: 'https://sac.test', nome: 'Tailor Sac' }, { chave: 'pilot', url: 'https://pilot.test', nome: 'Nome antigo' }]}
        atual="bi"
      />,
    );
    abrir();
    expect(screen.getByText('Tailor Sac').closest('a')).toHaveAttribute('href', 'https://sac.test');
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.queryByText('Nome antigo')).toBeNull();
  });

  it('chama montarUrl no clique, abre a aba na hora e troca a location', async () => {
    const aba = { opener: 'x', location: { href: '' } };
    const open = vi.spyOn(window, 'open').mockReturnValue(aba as unknown as Window);
    const montarUrl = vi.fn().mockResolvedValue('https://pilot.test/?ffid_jwt=t');
    render(<TailorAppLauncher apps={APPS} atual="accounts" montarUrl={montarUrl} />);
    abrir();
    fireEvent.click(screen.getByText('Marketing'));
    expect(open).toHaveBeenCalledWith('about:blank', '_blank');
    expect(aba.opener).toBeNull();
    expect(montarUrl).toHaveBeenCalledWith('https://pilot.test');
    expect(screen.getByText('Abrindo Marketing')).toBeInTheDocument();
    await waitFor(() => expect(aba.location.href).toBe('https://pilot.test/?ffid_jwt=t'));
    open.mockRestore();
  });

  it('sem aba (popup bloqueado) usa location.assign', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const assign = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', { value: { ...original, assign }, configurable: true });
    render(<TailorAppLauncher apps={APPS} atual="accounts" montarUrl={(u) => `${u}?t=1`} />);
    abrir();
    fireEvent.click(screen.getByText('Marketing'));
    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://pilot.test?t=1'));
    Object.defineProperty(window, 'location', { value: original, configurable: true });
  });

  it('montarUrl que nunca resolve: passado o prazo de 8 s a aba recebe a URL sem token e o aviso some', async () => {
    vi.useFakeTimers();
    try {
      const aba = { opener: 'x', location: { href: '' }, close: vi.fn() };
      const open = vi.spyOn(window, 'open').mockReturnValue(aba as unknown as Window);
      render(<TailorAppLauncher apps={APPS} atual="accounts" montarUrl={() => new Promise<string>(() => {})} />);
      abrir();
      fireEvent.click(screen.getByText('Marketing'));
      expect(screen.getByText('Abrindo Marketing')).toBeInTheDocument();
      await vi.advanceTimersByTimeAsync(8000);
      expect(aba.location.href).toBe('https://pilot.test');
      expect(screen.queryByText('Abrindo Marketing')).toBeNull();
      open.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it('montarUrl que devolve javascript: cai para a URL do item, nunca a javascript:', async () => {
    const aba = { opener: 'x', location: { href: '' }, close: vi.fn() };
    const open = vi.spyOn(window, 'open').mockReturnValue(aba as unknown as Window);
    render(<TailorAppLauncher apps={APPS} atual="accounts" montarUrl={() => 'javascript:alert(1)'} />);
    abrir();
    fireEvent.click(screen.getByText('Marketing'));
    await waitFor(() => expect(aba.location.href).toBe('https://pilot.test'));
    open.mockRestore();
  });

  it('item com url javascript: não vira link e, com montarUrl, fecha a aba em branco sem navegar', async () => {
    const apps = [{ chave: 'pilot', url: 'javascript:alert(1)' }];
    const { unmount } = render(<TailorAppLauncher apps={apps} atual="accounts" />);
    abrir();
    expect(screen.getByText('Marketing').closest('a')).not.toHaveAttribute('href');
    unmount();

    const aba = { opener: 'x', location: { href: '' }, close: vi.fn() };
    const open = vi.spyOn(window, 'open').mockReturnValue(aba as unknown as Window);
    render(<TailorAppLauncher apps={apps} atual="accounts" montarUrl={(u) => u} />);
    abrir();
    fireEvent.click(screen.getByText('Marketing'));
    await waitFor(() => expect(aba.close).toHaveBeenCalled());
    expect(aba.location.href).toBe('');
    expect(screen.queryByText('Abrindo Marketing')).toBeNull();
    open.mockRestore();
  });

  it('Esc fecha e devolve o foco ao botão; carregando mostra o esqueleto; sem apps não renderiza', () => {
    const { container, rerender } = render(<TailorAppLauncher apps={APPS} atual="pilot" />);
    abrir();
    expect(screen.getByRole('group', { name: 'Apps Tailor' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('group'), { key: 'Escape' });
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.getByRole('button', { name: 'Apps Tailor' })).toHaveFocus();
    rerender(<TailorAppLauncher apps={[]} atual="pilot" carregando />);
    abrir();
    expect(screen.getByRole('group')).toHaveAttribute('aria-busy', 'true');
    rerender(<TailorAppLauncher apps={[]} atual="pilot" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('o nome do Genius é Gestão no título da aba', () => {
    expect(tailorTitle('genius', 'Chat')).toBe('Chat | Gestão | Tailor.ia');
  });
});
