import { act, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TAILOR_APPS, appIconSvg, appPorChave, tailorTitle, TailorAppIcon, TailorHandoff, TailorHandoffSaida, handoffPendente } from './index';

// Vite lê os SVGs como texto; o tsconfig não carrega os tipos do Vite.
const SVGS = (import.meta as unknown as { glob: (p: string, o: object) => Record<string, string> }).glob('./assets/apps/*.svg', { query: '?raw', import: 'default', eager: true });

describe('registro de apps', () => {
  it('os SVGs de src/assets/apps estão em dia com o registro (npm run icones)', () => {
    expect(Object.keys(SVGS).map((k) => k.split('/').pop()).sort()).toEqual(Object.values(TAILOR_APPS).map((a) => a.favicon).sort());
    Object.values(TAILOR_APPS).forEach((a) => expect(SVGS[`./assets/apps/${a.favicon}`]).toBe(appIconSvg(a)));
  });

  it('nenhum par de apps repete letra nem a combinação de cores', () => {
    const apps = Object.values(TAILOR_APPS);
    expect(new Set(apps.map((a) => a.letra)).size).toBe(apps.length);
    expect(new Set(apps.map((a) => a.glifo.join())).size).toBe(apps.length);
    expect(new Set(apps.map((a) => [a.tile, a.tinta, a.ponto].join())).size).toBe(apps.length);
  });

  it('resolve chave de produto e monta o título', () => {
    expect(appPorChave('gpt')?.id).toBe('genius');
    expect(appPorChave('pilot')?.nome).toBe('Pilot');
    expect(appPorChave('hma')?.nome).toBe('Omnichannel');
    expect(appPorChave('sac')).toBeUndefined();
    expect(tailorTitle('pilot', 'Campanhas')).toBe('Campanhas | Pilot | Tailor.ia');
    expect(tailorTitle('accounts')).toBe('Accounts | Tailor.ia');
  });
});

describe('TailorAppIcon', () => {
  it('mostra o ícone pelo nome do app e ignora chave desconhecida', () => {
    const { container } = render(<><TailorAppIcon app="gpt" /><TailorAppIcon app="sac" /></>);
    expect(screen.getByAltText('Gestão')).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });
});

describe('handoffPendente', () => {
  it('detecta os parâmetros de SSO', () => {
    expect(handoffPendente('?ffid_jwt=a')).toBe(true);
    expect(handoffPendente('?access_token=a&refresh_token=b')).toBe(true);
    expect(handoffPendente('?next=/x')).toBe(false);
    expect(handoffPendente('')).toBe(false);
  });
});

describe('TailorHandoff', () => {
  afterEach(() => vi.useRealTimers());

  it('mostra "Abrindo <app>" com o esqueleto do app e some quando inativo', async () => {
    const { container, rerender } = render(<TailorHandoff app="pilot" ativo />);
    expect(screen.getByText('Abrindo Pilot')).toBeInTheDocument();
    expect(container.querySelector('[data-tailor-handoff-sidebar]')).toHaveClass('w-72');
    expect(container.querySelector('[data-tailor-handoff-header]')).toBeInTheDocument();
    expect(screen.queryByText('Entrar de novo')).toBeNull();
    rerender(<TailorHandoff app="pilot" ativo={false} sidebar="recolhida" />);
    await waitFor(() => expect(container.querySelector('[data-tailor-handoff]')).toBeNull());
  });

  it('sidebar recolhida usa 80px e "nenhuma" tira a barra', () => {
    const { container, rerender } = render(<TailorHandoff app="crm" ativo sidebar="recolhida" />);
    expect(container.querySelector('[data-tailor-handoff-sidebar]')).toHaveClass('w-20');
    rerender(<TailorHandoff app="crm" ativo sidebar="nenhuma" />);
    expect(container.querySelector('[data-tailor-handoff-sidebar]')).toBeNull();
  });

  it('white label: logo do cliente no lugar da marca e do ícone Tailor', () => {
    const { container } = render(
      <TailorHandoff app="genius" ativo logo="/len.png" logoDark="/len-dark.png" rotulo="Abrindo LEN" />,
    );
    expect(screen.getByText('Abrindo LEN')).toBeInTheDocument();
    const srcs = Array.from(container.querySelectorAll('img')).map((i) => i.getAttribute('src'));
    expect(srcs).toContain('/len.png');
    expect(srcs).toContain('/len-dark.png');
    expect(container.querySelector('[data-tailor-handoff] svg[aria-label="Gestão"]')).toBeNull();
  });

  it('passado o limite, avisa e oferece "Entrar de novo"', () => {
    vi.useFakeTimers();
    const retry = vi.fn();
    render(<TailorHandoff app="bi" ativo timeoutMs={1000} onTentarDeNovo={retry} />);
    expect(screen.queryByText('Entrar de novo')).toBeNull();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('Está demorando mais que o normal.')).toBeInTheDocument();
    screen.getByText('Entrar de novo').click();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('token recusado troca o loader pela ação', () => {
    render(<TailorHandoff app="nr1" ativo falhou onTentarDeNovo={() => {}} />);
    expect(screen.getByText('Não foi possível entrar')).toBeInTheDocument();
    expect(screen.getByText('Entrar de novo')).toBeInTheDocument();
    expect(screen.queryByText('Validando acesso')).toBeNull();
  });

  it('a saída mostra "Abrindo Studio" só quando ativa', () => {
    const { rerender } = render(<TailorHandoffSaida app="crm" ativo />);
    expect(screen.getAllByText('Abrindo Studio').length).toBeGreaterThan(0);
    rerender(<TailorHandoffSaida app="crm" ativo={false} />);
    expect(screen.queryByText('Abrindo Studio')).toBeNull();
  });

  it('a saída aceita rótulo e nomeia accounts/pilot pelo registro', () => {
    const { rerender } = render(<TailorHandoffSaida app="accounts" ativo rotulo="Indo para o Accounts" />);
    expect(screen.getAllByText('Indo para o Accounts').length).toBeGreaterThan(0);
    rerender(<TailorHandoffSaida app="pilot" ativo />);
    expect(screen.getAllByText('Abrindo Pilot').length).toBeGreaterThan(0);
    expect(TAILOR_APPS.crm.nome).toBe('Studio');
    expect(TAILOR_APPS.crm.letra).toBe('R');
  });
});
