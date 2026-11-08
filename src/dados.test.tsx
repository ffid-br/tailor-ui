import { fireEvent, render, screen } from '@testing-library/react';
import {
  TailorEmpty, TailorInsight, TailorMonogram, TailorStat, TailorStatGroup,
  contrast, monogramInitials, monogramTone, statDelta, MONOGRAM_TONES,
} from './index';
import css from './styles/tokens.css?raw';
import styleCss from './styles/style.css?raw';

describe('statDelta', () => {
  it('calcula a variação e a direção', () => {
    expect(statDelta(120, 100)).toEqual({ ratio: 0.2, direction: 'up' });
    expect(statDelta(75, 100)).toEqual({ ratio: -0.25, direction: 'down' });
    expect(statDelta(100, 100)?.direction).toBe('flat');
    expect(statDelta(100, -50)?.direction).toBe('up');
  });
  it('sem base não há percentual', () => {
    expect(statDelta(10, 0)).toBeNull();
    expect(statDelta(10, NaN)).toBeNull();
  });
});

describe('TailorStat', () => {
  it('formata, mostra a variação com seta, sinal e texto para leitor de tela', () => {
    render(<TailorStat label="Respostas" value={1200} previous={1000} meaning="de cada 10 que leram, 3 responderam" />);
    expect(screen.getByText('1.200')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText(/Subiu 20% em relação ao período anterior, o que é bom/)).toBeInTheDocument();
    expect(screen.getByText('Antes: 1.000')).toBeInTheDocument();
    expect(screen.getByText('de cada 10 que leram, 3 responderam')).toBeInTheDocument();
  });

  it('goodWhen define a cor: custo que sobe é ruim, custo que cai é bom', () => {
    const { container, rerender } = render(<TailorStat label="Custo por lead" value={12} previous={10} goodWhen="down" format="currency" />);
    expect(container.querySelector('.tailor-stat__delta')).toHaveClass('tailor-stat__delta--bad');
    expect(screen.getByText(/o que é ruim/)).toBeInTheDocument();
    rerender(<TailorStat label="Custo por lead" value={8} previous={10} goodWhen="down" format="currency" />);
    expect(container.querySelector('.tailor-stat__delta')).toHaveClass('tailor-stat__delta--good');
    expect(screen.getByText('R$ 8,00')).toBeInTheDocument();
  });

  it('estável fica neutro; delta explícito vence previous; sem base não mostra variação', () => {
    const { container, rerender } = render(<TailorStat label="X" value={5} previous={5} />);
    expect(container.querySelector('.tailor-stat__delta')).toHaveClass('tailor-stat__delta--neutral');
    expect(screen.getByText(/Ficou estável/)).toBeInTheDocument();
    rerender(<TailorStat label="X" value={5} previous={5} delta={-0.1} />);
    expect(screen.getByText('-10%')).toBeInTheDocument();
    rerender(<TailorStat label="X" value={5} previous={0} />);
    expect(container.querySelector('.tailor-stat__delta')).toBeNull();
  });

  it('meta mostra o avanço', () => {
    render(<TailorStat label="Vendas" value={50} goal={200} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(screen.getByText('Meta 200 · 25%')).toBeInTheDocument();
  });

  it('loading usa o esqueleto; href vira link; onClick vira botão', () => {
    const { rerender } = render(<TailorStat label="Leads" value={3} loading />);
    expect(screen.getByRole('status')).toHaveTextContent('Leads: carregando');
    expect(screen.queryByText('3')).toBeNull();
    rerender(<TailorStat label="Leads" value={3} href="/leads" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/leads');
    const onClick = vi.fn();
    rerender(<TailorStat label="Leads" value={3} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('compact e inline escondem o que sobra; o grupo agrupa', () => {
    render(
      <TailorStatGroup label="Resumo">
        <TailorStat label="A" value={1} variant="compact" hint="dica" />
        <TailorStat label="B" value={2} variant="inline" hint="dica" />
      </TailorStatGroup>,
    );
    expect(screen.getByRole('group', { name: 'Resumo' })).toBeInTheDocument();
    expect(screen.getByText('dica')).toBeInTheDocument();
  });
});

describe('TailorMonogram', () => {
  it('iniciais: duas letras, ignora de/da/do', () => {
    expect(monogramInitials('Maria da Silva')).toBe('MS');
    expect(monogramInitials('João de Souza Lima')).toBe('JL');
    expect(monogramInitials('bruna')).toBe('BR');
    expect(monogramInitials('Ana')).toBe('AN');
    expect(monogramInitials('  ')).toBe('?');
    expect(monogramInitials('Érica do Prado')).toBe('ÉP');
  });

  it('mesmo id, mesma cor; ids diferentes espalham pela paleta', () => {
    expect(monogramTone('abc-123')).toBe(monogramTone('abc-123'));
    const tons = new Set(Array.from({ length: 200 }, (_, i) => monogramTone(`id-${i}`)));
    expect(tons.size).toBe(MONOGRAM_TONES);
    const { container } = render(<><TailorMonogram id="x1" name="Ana Paula" /><TailorMonogram id="x1" name="Outro Nome" /></>);
    const [a, b] = Array.from(container.querySelectorAll('.tailor-monogram'));
    expect(a.className.match(/tone-\d/)![0]).toBe(b.className.match(/tone-\d/)![0]);
  });

  it('foto vence; se falhar, volta para as iniciais', () => {
    const { container } = render(<TailorMonogram id="1" name="Ana Paula" src="/a.png" />);
    const img = container.querySelector('img')!;
    expect(screen.getByRole('img', { name: 'Ana Paula' })).toBeInTheDocument();
    fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('AP')).toBeInTheDocument();
  });

  it('todos os pares da paleta têm contraste AA nos dois temas', () => {
    const [claro, escuro] = [css.match(/:root \{\s*(--tailor-mono-0-bg[^}]+)\}/)![1], css.match(/\[data-theme="dark"\]\) \{\s*(--tailor-mono-0-bg[^}]+)\}/)![1]];
    for (const bloco of [claro, escuro]) {
      for (let i = 0; i < MONOGRAM_TONES; i++) {
        const bg = bloco.match(new RegExp(`--tailor-mono-${i}-bg: (#[0-9A-F]{6})`))![1];
        const fg = bloco.match(new RegExp(`--tailor-mono-${i}-fg: (#[0-9A-F]{6})`))![1];
        expect(contrast(bg, fg), `${i} ${bg}/${fg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe('TailorEmpty', () => {
  it('mostra título, descrição e as duas ações (botão e link)', () => {
    const onClick = vi.fn();
    render(<TailorEmpty title="Nenhuma campanha ainda" description="Crie a primeira." action={{ label: 'Criar campanha', onClick }} secondaryAction={{ label: 'Ver exemplo', href: '/exemplo' }} />);
    expect(screen.getByText('Nenhuma campanha ainda')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Criar campanha' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'Ver exemplo' })).toHaveAttribute('href', '/exemplo');
  });
  it('sem ação não desenha botões; ilustração própria troca a marca', () => {
    const { container } = render(<TailorEmpty title="Vazio" illustration={<i data-testid="ilu" />} />);
    expect(screen.getByTestId('ilu')).toBeInTheDocument();
    expect(container.querySelector('.tailor-empty__actions')).toBeNull();
  });
});

describe('TailorInsight', () => {
  it('ready: marca IA, mostra conclusão, motivo, fontes, confiança e próxima ação', () => {
    const go = vi.fn();
    render(<TailorInsight status="ready" takeaway="Responderam mais." why="A mensagem ficou mais curta." sources={['Campanhas de outubro', 'Funil Vendas']} confidence="media" generatedAt="2026-11-08T10:30:00Z" nextAction={{ label: 'Repetir a mensagem', onClick: go }} />);
    expect(screen.getByText('Gerado por IA')).toBeInTheDocument();
    expect(screen.getByText('Responderam mais.')).toBeInTheDocument();
    expect(screen.getByText('A mensagem ficou mais curta.')).toBeInTheDocument();
    expect(screen.getByText('Fontes: Campanhas de outubro, Funil Vendas')).toBeInTheDocument();
    expect(screen.getByText('Confiança média')).toBeInTheDocument();
    const proxima = screen.getByRole('button', { name: 'Repetir a mensagem' });
    expect(proxima).toHaveClass('tailor-btn--secondary');
    expect(proxima).not.toHaveClass('tailor-btn--primary');
    fireEvent.click(proxima);
    expect(go).toHaveBeenCalled();
  });

  it('refresh e feedback chamam os callbacks e marcam o voto', () => {
    const onRefresh = vi.fn(); const onFeedback = vi.fn();
    render(<TailorInsight status="ready" takeaway="Ok." onRefresh={onRefresh} onFeedback={onFeedback} />);
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sim' }));
    expect(onRefresh).toHaveBeenCalled();
    expect(onFeedback).toHaveBeenCalledWith('up');
    expect(screen.getByRole('button', { name: 'Sim' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Não' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('loading ocupa a vez, sem conclusão', () => {
    render(<TailorInsight status="loading" takeaway="não aparece" />);
    expect(screen.getByText('Gerado por IA')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Gerando a leitura');
    expect(screen.queryByText('não aparece')).toBeNull();
  });

  it('error diz o que fazer e oferece tentar de novo', () => {
    const onRefresh = vi.fn();
    render(<TailorInsight status="error" onRefresh={onRefresh} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Seus números continuam corretos');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onRefresh).toHaveBeenCalled();
  });

  it('empty explica que faltam dados', () => {
    render(<TailorInsight status="empty" />);
    expect(screen.getByText('Ainda não há dados suficientes para uma leitura.')).toBeInTheDocument();
  });
});

describe('TailorStatGroup bordered', () => {
  it('o primeiro item tem o mesmo padding e a mesma borda dos outros (a regra do primeiro filho não vale para bordered)', () => {
    const { container } = render(
      <TailorStatGroup bordered label="Resumo">
        <TailorStat label="A" value={1} /><TailorStat label="B" value={2} />
      </TailorStatGroup>,
    );
    const itens = Array.from(container.querySelector('.tailor-stat-group')!.children);
    expect(itens[0].className).toBe(itens[1].className);
    expect(container.querySelector('.tailor-stat-group')).toHaveClass('tailor-stat-group--bordered');
    const regrasPrimeiro = styleCss.match(/[^{}]*:first-child[^{}]*\{[^}]*\}/g)!.filter((r) => r.includes('.tailor-stat-group'));
    expect(regrasPrimeiro.length).toBeGreaterThan(0);
    for (const r of regrasPrimeiro) expect(r).toContain(':not(.tailor-stat-group--bordered)');
  });
});
