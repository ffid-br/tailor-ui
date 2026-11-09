import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TailorAppLauncher, tailorTitle } from './index';

const APPS = [
  { chave: 'accounts', url: 'https://accounts.test' },
  { chave: 'pilot', url: 'https://pilot.test' },
  { chave: 'gpt', url: 'https://genius.test' },
  { chave: 'ffid.ai.studio', url: 'https://crm.test' },
  { chave: 'crm', url: 'https://crm.test' },
  { chave: 'hma', url: 'https://hma.test' },
];
const abrir = () => fireEvent.click(screen.getByRole('button', { name: 'Apps Tailor' }));

describe('TailorAppLauncher', () => {
  it('lista os apps pelo registro, junta chaves do mesmo app e marca o atual sem link', () => {
    render(<TailorAppLauncher apps={APPS} atual="pilot" />);
    abrir();
    expect(screen.getAllByText('Studio')).toHaveLength(1);
    expect(screen.getByText('Gestão')).toBeInTheDocument();
    expect(screen.getByText('Você está aqui')).toBeInTheDocument();
    expect(screen.getByText('Pilot').closest('a')).toBeNull();
    expect(screen.getByText('Pilot').closest('[aria-current="page"]')).not.toBeNull();
    expect(screen.getByText('Accounts').closest('a')).toHaveAttribute('href', 'https://accounts.test');
  });

  it('app sem registro usa a inicial', () => {
    render(<TailorAppLauncher apps={APPS} atual="bi" />);
    abrir();
    const item = screen.getByText('Hma');
    expect(item.closest('a')).toHaveAttribute('href', 'https://hma.test');
    expect(screen.getByText('H')).toBeInTheDocument();
  });

  it('app sem registro usa o nome informado; app registrado ignora', () => {
    render(
      <TailorAppLauncher
        apps={[{ chave: 'sac', url: 'https://sac.test', nome: 'Tailor Sac' }, { chave: 'pilot', url: 'https://pilot.test', nome: 'Marketing' }]}
        atual="bi"
      />,
    );
    abrir();
    expect(screen.getByText('Tailor Sac').closest('a')).toHaveAttribute('href', 'https://sac.test');
    expect(screen.getByText('Pilot')).toBeInTheDocument();
    expect(screen.queryByText('Marketing')).toBeNull();
  });

  it('chama montarUrl no clique, abre a aba na hora e troca a location', async () => {
    const aba = { opener: 'x', location: { href: '' } };
    const open = vi.spyOn(window, 'open').mockReturnValue(aba as unknown as Window);
    const montarUrl = vi.fn().mockResolvedValue('https://pilot.test/?ffid_jwt=t');
    render(<TailorAppLauncher apps={APPS} atual="accounts" montarUrl={montarUrl} />);
    abrir();
    fireEvent.click(screen.getByText('Pilot'));
    expect(open).toHaveBeenCalledWith('about:blank', '_blank');
    expect(aba.opener).toBeNull();
    expect(montarUrl).toHaveBeenCalledWith('https://pilot.test');
    expect(screen.getByText('Abrindo Pilot')).toBeInTheDocument();
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
    fireEvent.click(screen.getByText('Pilot'));
    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://pilot.test?t=1'));
    Object.defineProperty(window, 'location', { value: original, configurable: true });
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
