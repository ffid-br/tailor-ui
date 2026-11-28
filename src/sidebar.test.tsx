import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { TailorSidebar, TailorUserMenu, type TailorSidebarGrupo } from './index';

const Icone = ({ className }: { className?: string }) => <svg data-testid="icone" className={className} />;

const grupos: TailorSidebarGrupo[] = [
  {
    rotulo: 'Geral',
    itens: [
      { id: 'inicio', rotulo: 'Início', icone: Icone, href: '/', ativo: true },
      { id: 'msg', rotulo: 'Mensagens', icone: Icone, href: '/mensagens', badge: 3 },
      { id: 'erros', rotulo: 'Erros', icone: Icone, href: '/erros', badge: 120, badgeTom: 'alerta' },
    ],
  },
  {
    rotulo: 'Relatórios',
    itens: [
      {
        id: 'painel',
        rotulo: 'Painel',
        icone: Icone,
        filhos: [
          { id: 'vendas', rotulo: 'Vendas', icone: Icone, href: '/painel/vendas' },
          { id: 'leads', rotulo: 'Leads', icone: Icone, href: '/painel/leads' },
        ],
      },
    ],
  },
];

// A barra fixa e a gaveta usam a mesma lista; nos testes só a barra está montada.
const barra = () => within(screen.getByRole('complementary'));

describe('TailorSidebar', () => {
  it('desenha grupos e itens; o ativo tem aria-current e a barra verde', () => {
    render(<TailorSidebar produto="Conta" grupos={grupos} />);
    expect(barra().getByText('Geral')).toBeInTheDocument();
    expect(barra().getByText('Relatórios')).toBeInTheDocument();
    const ativo = barra().getByRole('link', { name: 'Início' });
    expect(ativo).toHaveAttribute('aria-current', 'page');
    expect(ativo.className).toContain('border-tailor-green');
    const outro = barra().getByRole('link', { name: /Mensagens/ });
    expect(outro).not.toHaveAttribute('aria-current');
    expect(outro.className).not.toContain('border-tailor-green');
  });

  it('mostra badges, com 99+ acima de 99 e vermelho só no alerta', () => {
    render(<TailorSidebar produto="Conta" grupos={grupos} />);
    const tres = barra().getByText('3');
    expect(tres.className).not.toContain('bg-red-600');
    expect(barra().getByText('99+').className).toContain('bg-red-600');
  });

  it('recolhido: sem rótulos visíveis, com aria-label e title', () => {
    render(<TailorSidebar produto="Conta" grupos={grupos} recolhido onRecolher={() => {}} />);
    expect(barra().queryByText('Início')).toBeNull();
    expect(barra().queryByText('Geral')).toBeNull();
    const link = barra().getByRole('link', { name: 'Início' });
    expect(link).toHaveAttribute('title', 'Início');
    expect(barra().getByRole('link', { name: 'Mensagens (3)' })).toHaveAttribute('title', 'Mensagens (3)');
    expect(barra().getByText('3')).toBeInTheDocument();
    expect(barra().getByText('99+').className).toContain('bg-red-600');
    expect(barra().getByRole('button', { name: 'Expandir barra lateral' })).toBeInTheDocument();
  });

  it('usa o renderLink do app', () => {
    render(
      <TailorSidebar
        produto="Conta"
        grupos={grupos}
        renderLink={(item, props) => <a data-roteador={item.id} {...props} />}
      />,
    );
    expect(barra().getByRole('link', { name: 'Início' })).toHaveAttribute('data-roteador', 'inicio');
  });

  it('filhos abrem e fecham pelo item pai', () => {
    render(<TailorSidebar produto="Conta" grupos={grupos} />);
    const pai = barra().getByRole('button', { name: 'Painel' });
    expect(pai).toHaveAttribute('aria-expanded', 'false');
    expect(barra().queryByRole('link', { name: 'Vendas' })).toBeNull();
    fireEvent.click(pai);
    expect(pai).toHaveAttribute('aria-expanded', 'true');
    expect(barra().getByRole('link', { name: 'Vendas' })).toBeInTheDocument();
    fireEvent.click(pai);
    expect(barra().queryByRole('link', { name: 'Vendas' })).toBeNull();
  });

  it('grupo com filho ativo já abre aberto', () => {
    const comAtivo: TailorSidebarGrupo[] = [
      { itens: [{ id: 'p', rotulo: 'Painel', icone: Icone, filhos: [{ id: 'v', rotulo: 'Vendas', icone: Icone, href: '/v', ativo: true }] }] },
    ];
    render(<TailorSidebar produto="Conta" grupos={comAtivo} />);
    expect(barra().getByRole('link', { name: 'Vendas' })).toHaveAttribute('aria-current', 'page');
  });

  it('gaveta: mesma lista, fecha no Esc e ao navegar', () => {
    function App() {
      const [aberto, setAberto] = useState(true);
      return (
        <>
          <button onClick={() => setAberto(true)}>abrir</button>
          <TailorSidebar produto="Conta" grupos={grupos} aberto={aberto} onFechar={() => setAberto(false)} />
        </>
      );
    }
    render(<App />);
    const gaveta = screen.getByRole('dialog');
    expect(within(gaveta).getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page');
    expect(gaveta).toHaveFocus();
    fireEvent.keyDown(gaveta, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByText('abrir'));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: /Mensagens/ }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('poweredBy só aparece quando pedido', () => {
    const { rerender } = render(<TailorSidebar produto="Conta" grupos={grupos} />);
    expect(screen.queryByText('Powered by')).toBeNull();
    rerender(<TailorSidebar produto="Conta" grupos={grupos} poweredBy />);
    expect(screen.getByText('Powered by')).toBeInTheDocument();
  });
});

describe('TailorUserMenu', () => {
  it('abre, executa a ação e fecha no Esc', () => {
    const sair = vi.fn();
    render(
      <TailorSidebar
        produto="Conta"
        grupos={[]}
        rodape={<TailorUserMenu nome="Ana Souza" detalhe="ana@ffid.com.br" acoes={[{ rotulo: 'Sair', onSelect: sair, tom: 'perigo' }]} />}
      />,
    );
    const botao = barra().getByRole('button', { name: /Ana Souza/ });
    fireEvent.click(botao);
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(botao, { key: 'Escape' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(botao);
    fireEvent.click(barra().getByRole('button', { name: 'Sair' }));
    expect(sair).toHaveBeenCalled();
    expect(barra().queryByRole('button', { name: 'Sair' })).toBeNull();
  });

  it('recolhido: painel fica acima do conteúdo e o title some com o menu aberto', () => {
    render(
      <TailorSidebar
        produto="Conta"
        grupos={[]}
        recolhido
        rodape={<TailorUserMenu nome="Ana Souza" acoes={[{ rotulo: 'Sair', tom: 'perigo' }]} />}
      />,
    );
    // sticky cria contexto de empilhamento: sem z-index o conteúdo da página cobre o painel.
    expect(screen.getByRole('complementary')).toHaveClass('z-[var(--tailor-z-sticky)]');
    const botao = barra().getByRole('button', { name: 'Menu de Ana Souza' });
    expect(botao).toHaveAttribute('title', 'Ana Souza');
    fireEvent.click(botao);
    expect(botao).not.toHaveAttribute('title');
  });
});

describe('correções da sidebar', () => {
  const menu = (extra = {}) => (
    <TailorSidebar
      produto="Conta"
      grupos={[]}
      rodape={
        <TailorUserMenu nome="Ana" acoes={[{ rotulo: 'A', onSelect: () => {} }, { rotulo: 'B', onSelect: () => {} }, { rotulo: 'C', onSelect: () => {} }]} {...extra}>
          <input aria-label="campo" />
        </TailorUserMenu>
      }
    />
  );

  it('menu do usuário: setas não são roubadas de um input do children', () => {
    render(menu());
    fireEvent.click(barra().getByRole('button', { name: /Ana/ }));
    const ev = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    barra().getByLabelText('campo').dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('menu do usuário: ArrowUp no botão vai ao último, ArrowDown ao primeiro', () => {
    render(menu());
    const botao = barra().getByRole('button', { name: /Ana/ });
    fireEvent.click(botao);
    botao.focus();
    fireEvent.keyDown(botao, { key: 'ArrowUp' });
    expect(barra().getByRole('button', { name: 'C' })).toHaveFocus();
    botao.focus();
    fireEvent.keyDown(botao, { key: 'ArrowDown' });
    expect(barra().getByLabelText('campo')).toHaveFocus();
  });

  it('gaveta: Shift+Tab no painel vai ao último focável e Tab ao primeiro', () => {
    render(<TailorSidebar produto="Conta" grupos={grupos} aberto onFechar={() => {}} />);
    const gaveta = screen.getByRole('dialog');
    const focaveis = Array.from(gaveta.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
    expect(gaveta).toHaveFocus();
    fireEvent.keyDown(gaveta, { key: 'Tab', shiftKey: true });
    expect(focaveis[focaveis.length - 1]).toHaveFocus();
    gaveta.focus();
    fireEvent.keyDown(gaveta, { key: 'Tab' });
    expect(focaveis[0]).toHaveFocus();
  });

  it('gaveta: passar do breakpoint fecha e solta a rolagem', () => {
    let ouvinte: ((e: { matches: boolean }) => void) | undefined;
    const original = window.matchMedia;
    const consultas: string[] = [];
    window.matchMedia = ((q: string) => {
      consultas.push(q);
      return { matches: false, addEventListener: (_: string, f: typeof ouvinte) => (ouvinte = f), removeEventListener: () => (ouvinte = undefined) };
    }) as unknown as typeof window.matchMedia;
    const fechar = vi.fn();
    const { unmount } = render(<TailorSidebar produto="Conta" grupos={grupos} aberto onFechar={fechar} breakpoint="md" />);
    expect(consultas).toContain('(min-width: 768px)');
    expect(document.body.style.overflow).toBe('hidden');
    ouvinte!({ matches: true });
    expect(fechar).toHaveBeenCalled();
    unmount();
    expect(ouvinte).toBeUndefined();
    expect(document.body.style.overflow).not.toBe('hidden');
    window.matchMedia = original;
  });

  it('menu do usuário: ação com href usa o renderLink e fecha a gaveta', () => {
    const fechar = vi.fn();
    render(
      <TailorSidebar
        produto="Conta"
        grupos={[]}
        aberto
        onFechar={fechar}
        renderLink={(item, props) => <a data-roteador={item.id} {...props} />}
        rodape={<TailorUserMenu nome="Ana" acoes={[{ rotulo: 'Perfil', href: '/perfil' }]} />}
      />,
    );
    const gaveta = within(screen.getByRole('dialog'));
    fireEvent.click(gaveta.getByRole('button', { name: /Ana/ }));
    const link = gaveta.getByRole('link', { name: 'Perfil' });
    expect(link).toHaveAttribute('data-roteador', 'Perfil');
    fireEvent.click(link);
    expect(fechar).toHaveBeenCalled();
  });

  it('grupo: id dos filhos é único entre barra e gaveta e aria-controls só com grupo aberto', () => {
    render(<TailorSidebar produto="Conta" grupos={grupos} aberto onFechar={() => {}} />);
    const pais = screen.getAllByRole('button', { name: 'Painel' });
    expect(pais).toHaveLength(2);
    pais.forEach((p) => expect(p).not.toHaveAttribute('aria-controls'));
    pais.forEach((p) => fireEvent.click(p));
    const ids = pais.map((p) => p.getAttribute('aria-controls')!);
    expect(ids[0]).not.toBe(ids[1]);
    ids.forEach((id) => expect(document.querySelectorAll(`[id="${id}"]`)).toHaveLength(1));
  });
});
