import React from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';

export type TailorPageHeaderLink = {
  href: string;
  className: string;
  children: React.ReactNode;
  'aria-current'?: 'page';
};

export type TailorPageHeaderProps = {
  /** ReactNode para permitir um acento dentro do título. */
  title: React.ReactNode;
  /** Uma frase: o que se faz nesta tela. */
  description?: React.ReactNode;
  /** Seção ou contexto, com o ponto da marca. Sem ele, não aparece. */
  eyebrow?: string;
  /** Trilha de navegação; o último item é a página atual. */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Link ou ação de voltar, acima de tudo. */
  back?: { label: string; href?: string; onClick?: () => void };
  /** Ao lado do título: status, plano, contagem. */
  badge?: React.ReactNode;
  /** Números do topo, quando ajudam a decidir o que fazer aqui. */
  stats?: Array<{ label: string; value: React.ReactNode }>;
  /** Botões e busca, à direita. */
  actions?: React.ReactNode;
  /** Abaixo, na largura toda: abas, filtros, barra de busca. */
  children?: React.ReactNode;
  /** Link do roteador do app (ex.: `NavLink`). Repasse todas as props. Sem ele, sai um `<a href>`. */
  renderLink?: (props: TailorPageHeaderLink) => React.ReactNode;
  className?: string;
};

const linkPadrao = ({ children, ...props }: TailorPageHeaderLink) => <a {...props}>{children}</a>;

/**
 * O cabeçalho de página. Visual só por variáveis `--tailor-brand-*` e
 * `--tailor-header-*` (ver `TailorBrand`), para vestir a marca do cliente:
 * cor de destaque, fontes, peso e caixa do título, cantos, fundo.
 * Padrão Tailor: sem card nem sombra, régua de 1px embaixo, título 26 → 42.
 */
export function TailorPageHeader({
  title, description, eyebrow, breadcrumbs, back, badge, stats, actions, children,
  renderLink = linkPadrao, className,
}: TailorPageHeaderProps) {
  const { messages } = useTailorLocale();
  const temLateral = Boolean(stats?.length || actions);
  return (
    <header className={cn('tailor-ph', className)}>
      <div className="tailor-ph__row">
        <div className="tailor-ph__main">
          {back && (back.href
            ? renderLink({ href: back.href, className: 'tailor-ph__back', children: <><span aria-hidden="true">←</span> {back.label}</> })
            : (
              <button type="button" className="tailor-ph__back" onClick={back.onClick}>
                <span aria-hidden="true">←</span> {back.label}
              </button>
            ))}

          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label={messages.breadcrumb} className="tailor-ph__breadcrumbs">
              <ol>
                {breadcrumbs.map((item, i) => {
                  const atual = i === breadcrumbs.length - 1;
                  return (
                    <li key={`${i}-${item.label}`}>
                      {i > 0 && <span className="tailor-ph__separator" aria-hidden="true">/</span>}
                      {atual || !item.href
                        ? <span aria-current={atual ? 'page' : undefined}>{item.label}</span>
                        : renderLink({ href: item.href, className: 'tailor-ph__breadcrumb-link', children: item.label })}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          {eyebrow && (
            <p className="tailor-ph__eyebrow">
              <span className="tailor-ph__dot" aria-hidden="true" />
              {eyebrow}
            </p>
          )}

          <div className="tailor-ph__title-row">
            <h1 className="tailor-ph__title">{title}</h1>
            {badge}
          </div>

          {description && <p className="tailor-ph__description">{description}</p>}
        </div>

        {temLateral && (
          <div className="tailor-ph__aside">
            {stats?.map((st) => (
              <div key={st.label} className="tailor-ph__stat">
                <span className="tailor-ph__stat-value">{st.value}</span>
                <span className="tailor-ph__stat-label">{st.label}</span>
              </div>
            ))}
            {actions}
          </div>
        )}
      </div>
      {children && <div className="tailor-ph__below">{children}</div>}
    </header>
  );
}
