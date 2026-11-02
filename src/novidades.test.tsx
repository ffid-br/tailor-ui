import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TailorNovidades, useNovidades, type TailorNovidade } from './index';

const lista = (n: number): TailorNovidade[] =>
  Array.from({ length: n }, (_, i) => ({ id: `2026-10-${String(30 - i).padStart(2, '0')}`, data: `2026-10-${String(30 - i).padStart(2, '0')}`, titulo: `Mudança ${i + 1}`, itens: [`Item ${i + 1}`], tela: i === 0 ? 'Campanhas' : undefined }));

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('TailorNovidades', () => {
  it('conta não vistas (9+) e abrir marca vistas', () => {
    render(<TailorNovidades novidades={lista(12)} chave="crm" usuario="u1" />);
    const gatilho = screen.getByRole('button', { name: /Novidades/ });
    expect(gatilho).toHaveTextContent('9+');
    fireEvent.click(gatilho);
    expect(localStorage.getItem('tailor-novidades:crm:u1')).toBe('2026-10-30');
    expect(gatilho).not.toHaveTextContent('9+');
  });

  it('duas instâncias ficam em sincronia', () => {
    render(<><TailorNovidades novidades={lista(3)} chave="crm" rotulo="A" /><TailorNovidades novidades={lista(3)} chave="crm" rotulo="B" /></>);
    fireEvent.click(screen.getByRole('button', { name: /^A/ }));
    expect(screen.getByRole('button', { name: /^B/ })).not.toHaveTextContent('3');
  });

  it('quem nunca viu conta só os últimos 30 dias', () => {
    const velhas = [...lista(2), { id: '2026-09-01', data: '2026-09-01', titulo: 'Antiga', itens: ['x'] }];
    render(<TailorNovidades novidades={velhas} chave="crm" />);
    expect(screen.getByRole('button', { name: /Novidades/ })).toHaveTextContent('2');
  });

  it('conta só as entradas acima da última vista', () => {
    localStorage.setItem('tailor-novidades:crm:anon', '2026-10-28');
    render(<TailorNovidades novidades={lista(5)} chave="crm" />);
    expect(screen.getByRole('button', { name: /Novidades/ })).toHaveTextContent('2');
  });

  it('mostra o limite e "Ver anteriores" expande; data longa e tela aparecem', () => {
    render(<TailorNovidades novidades={lista(7)} chave="crm" limite={3} />);
    fireEvent.click(screen.getByRole('button', { name: /Novidades/ }));
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByText('30 de outubro de 2026')).toBeInTheDocument();
    expect(screen.getByText('Campanhas')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver anteriores' }));
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(7);
    expect(screen.queryByRole('button', { name: 'Ver anteriores' })).toBeNull();
  });

  it('Esc fecha e o foco volta ao gatilho; abrir põe o foco no fechar', () => {
    render(<TailorNovidades novidades={lista(2)} chave="crm" />);
    const gatilho = screen.getByRole('button', { name: /Novidades/ });
    gatilho.focus();
    fireEvent.click(gatilho);
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(gatilho).toHaveFocus();
  });

  it('Tab e Shift+Tab ciclam dentro do modal', () => {
    render(<TailorNovidades novidades={lista(7)} chave="crm" limite={2} />);
    fireEvent.click(screen.getByRole('button', { name: /Novidades/ }));
    const fechar = screen.getByRole('button', { name: 'Fechar' });
    const mais = screen.getByRole('button', { name: 'Ver anteriores' });
    mais.focus();
    expect(fireEvent.keyDown(mais, { key: 'Tab' })).toBe(false);
    expect(fechar).toHaveFocus();
    expect(fireEvent.keyDown(fechar, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(mais).toHaveFocus();
  });

  it('funciona com storage bloqueado', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('x'); });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('x'); });
    function T() { const { naoVistas, marcarVistas } = useNovidades(lista(3), { chave: 'a' }); return <button onClick={marcarVistas}>n{naoVistas}</button>; }
    render(<T />);
    fireEvent.click(screen.getByRole('button', { name: 'n3' }));
    expect(screen.getByRole('button', { name: 'n0' })).toBeInTheDocument();
    get.mockRestore(); set.mockRestore();
  });
});
