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
});
