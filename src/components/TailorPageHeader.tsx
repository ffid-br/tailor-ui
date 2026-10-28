import React from 'react';
import { cn } from '../cn';

export type TailorPageHeaderLink = {
  href: string;
  className: string;
  children: React.ReactNode;
  'aria-current'?: 'page';
};

export type TailorPageHeaderProps = {
  /** ReactNode para permitir um acento dentro do título. */
  titulo: React.ReactNode;
  /** Uma frase: o que se faz nesta tela. */
  descricao?: React.ReactNode;
  /** Seção ou contexto, com o ponto da marca. Sem ele, não aparece. */
  sobretitulo?: string;
  /** Trilha de navegação; o último item é a página atual. */
  trilha?: Array<{ rotulo: string; href?: string }>;
  /** Link ou ação de voltar, acima de tudo. */
  voltar?: { rotulo: string; href?: string; onClick?: () => void };
  /** Ao lado do título: status, plano, contagem. */
  etiqueta?: React.ReactNode;
  /** Números do topo, quando ajudam a decidir o que fazer aqui. */
  indicadores?: Array<{ rotulo: string; valor: React.ReactNode }>;
  /** Botões e busca, à direita. */
  acoes?: React.ReactNode;
  /** Abaixo, na largura toda: abas, filtros, barra de busca. */
  children?: React.ReactNode;
  /** Link do roteador do app (ex.: `NavLink`). Repasse todas as props. Sem ele, sai um `<a href>`. */
  renderLink?: (props: TailorPageHeaderLink) => React.ReactNode;
  className?: string;
};

const linkPadrao = ({ children, ...props }: TailorPageHeaderLink) => <a {...props}>{children}</a>;

/**
 * O cabeçalho de página. Visual só por variáveis `--tailor-marca-*` e
 * `--tailor-cabecalho-*` (ver `TailorMarca`), para vestir a marca do cliente:
 * cor de destaque, fontes, peso e caixa do título, cantos, fundo.
 * Padrão Tailor: sem card nem sombra, régua de 1px embaixo, título 26 → 42.
 */
export function TailorPageHeader({
  titulo, descricao, sobretitulo, trilha, voltar, etiqueta, indicadores, acoes, children,
  renderLink = linkPadrao, className,
}: TailorPageHeaderProps) {
  const temLateral = Boolean(indicadores?.length || acoes);
  return (
    <header className={cn('tailor-ph', className)}>
      <div className="tailor-ph__linha">
        <div className="tailor-ph__principal">
          {voltar && (voltar.href
            ? renderLink({ href: voltar.href, className: 'tailor-ph__voltar', children: <><span aria-hidden="true">←</span> {voltar.rotulo}</> })
            : (
              <button type="button" className="tailor-ph__voltar" onClick={voltar.onClick}>
                <span aria-hidden="true">←</span> {voltar.rotulo}
              </button>
            ))}

          {trilha && trilha.length > 0 && (
            <nav aria-label="Trilha" className="tailor-ph__trilha">
              <ol>
                {trilha.map((item, i) => {
                  const atual = i === trilha.length - 1;
                  return (
                    <li key={`${i}-${item.rotulo}`}>
                      {i > 0 && <span className="tailor-ph__separador" aria-hidden="true">/</span>}
                      {atual || !item.href
                        ? <span aria-current={atual ? 'page' : undefined}>{item.rotulo}</span>
                        : renderLink({ href: item.href, className: 'tailor-ph__trilha-link', children: item.rotulo })}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          {sobretitulo && (
            <p className="tailor-ph__sobretitulo">
              <span className="tailor-ph__ponto" aria-hidden="true" />
              {sobretitulo}
            </p>
          )}

          <div className="tailor-ph__titulo-linha">
            <h1 className="tailor-ph__titulo">{titulo}</h1>
            {etiqueta}
          </div>

          {descricao && <p className="tailor-ph__descricao">{descricao}</p>}
        </div>

        {temLateral && (
          <div className="tailor-ph__lateral">
            {indicadores?.map((ind) => (
              <div key={ind.rotulo} className="tailor-ph__indicador">
                <span className="tailor-ph__indicador-valor">{ind.valor}</span>
                <span className="tailor-ph__indicador-rotulo">{ind.rotulo}</span>
              </div>
            ))}
            {acoes}
          </div>
        )}
      </div>
      {children && <div className="tailor-ph__extra">{children}</div>}
    </header>
  );
}
