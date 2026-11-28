import React, { useEffect, useId, useRef } from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';

// Seis lugares fixos em volta do centro (viewBox 600×600), na ordem em que acendem.
const LUGARES = [
  { x: 170, y: 120 }, { x: 430, y: 120 },
  { x: 90, y: 300 }, { x: 510, y: 300 },
  { x: 170, y: 480 }, { x: 430, y: 480 },
];
const NOS_PADRAO = ['WhatsApp', 'Agente de Pré-vendas', 'CRM', 'Agenda', 'Tailor.ia BI', 'MCP'];

export type TailorConfirmationProps = {
  /** `true` abre em tela cheia e toca a sequência; `false` fecha. */
  open: boolean;
  /** A frase final, acesa letra a letra (ex.: "Maria, recebemos sua inscrição."). */
  title: string;
  /** Linha curta acima do título, com o ponto verde (ex.: "Inscrição recebida"). */
  overline?: string;
  /** Texto abaixo do título: o que acontece agora. */
  description?: React.ReactNode;
  /** Até seis nomes para os nós da rede. Padrão: os produtos que passam a cuidar do lead. */
  nodes?: string[];
  /** O que o console narra enquanto a rede se desenha, uma linha por passo. A última sai em verde. */
  steps?: string[];
  /** Botões abaixo do texto, antes do botão de fechar (ex.: "Salvar na agenda"). */
  actions?: React.ReactNode;
  /** Chamado no botão de fechar e no Esc. */
  onClose: () => void;
  /** Texto do botão de fechar. Padrão: "Fechar" no idioma do app. */
  closeLabel?: string;
  className?: string;
};

/**
 * Confirmação de tela cheia para o fim de um cadastro ou inscrição: quem enviou
 * "entra" na rede de agentes. Uma varredura passa, o ponto verde abre em anéis,
 * a rede se desenha do centro até os nós enquanto o console narra o caminho, e
 * tudo recua para mostrar a frase final com o nome da pessoa.
 *
 * É um `<dialog>` nativo aberto com `showModal`: foco preso e Esc fecha. Com
 * `prefers-reduced-motion`, abre direto no estado final, sem animação.
 * Para o fim de um modal comum, use `TailorResult`.
 */
export function TailorConfirmation({ open, title, overline, description, nodes = NOS_PADRAO, steps = [], actions, onClose, closeLabel, className }: TailorConfirmationProps) {
  const { messages } = useTailorLocale();
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      // Navegador sem showModal: abre como dialog comum em vez de ficar invisível.
      if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    }
    if (!open && d.open) {
      if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
    }
  }, [open]);

  const nos = nodes.slice(0, LUGARES.length).map((nome, i) => ({ nome, ...LUGARES[i] }));
  // O console dita o ritmo: a rede recua quando a última linha termina de aparecer.
  const recuo = Math.max(2.1, 0.9 + steps.length * 0.6);

  return (
    <dialog
      ref={ref}
      // Esc: o pai decide (onClose) e o `open` manda. Ouvir o evento `close` do dialog chamava onClose
      // duas vezes ao fechar pelo botão, e deixar o Esc fechar sozinho descasava do `open`.
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      aria-labelledby={open ? idTitulo : undefined}
      className={cn('tailor-confirmation', className)}
      style={{ '--tailor-confirmation-t': `${recuo}s` } as React.CSSProperties}
    >
      {open && (
        <div className="tailor-confirmation__stage">
          <div className="tailor-confirmation__grid" aria-hidden="true" />
          <div className="tailor-confirmation__scan" aria-hidden="true" />

          {/* Rede: o centro é quem enviou; as linhas vão até os nós que passam a cuidar dele. */}
          <div className="tailor-confirmation__net" aria-hidden="true">
            <svg viewBox="0 0 600 600">
              {[0, 0.25, 0.5].map((d) => (
                <circle key={d} className="tailor-confirmation__ring" cx="300" cy="300" r="60" style={{ animationDelay: `${0.35 + d}s` }} />
              ))}
              {nos.map((n, i) => (
                <path key={n.nome} className="tailor-confirmation__line" pathLength={1} d={`M300 300 H${(300 + n.x) / 2} V${n.y} H${n.x}`} style={{ animationDelay: `${0.9 + i * 0.18}s` }} />
              ))}
              {nos.map((n, i) => (
                <g key={n.nome} className="tailor-confirmation__node" style={{ animationDelay: `${1.4 + i * 0.18}s` }}>
                  <rect className="tailor-confirmation__node-box" x={n.x - 9} y={n.y - 9} width="18" height="18" />
                  <rect className="tailor-confirmation__node-dot" x={n.x - 4} y={n.y - 4} width="8" height="8" />
                  <text x={n.x} y={n.y + (n.y < 300 ? -22 : 34)} textAnchor="middle">{n.nome}</text>
                </g>
              ))}
              <rect className="tailor-confirmation__center" x="288" y="288" width="24" height="24" />
            </svg>
          </div>

          {steps.length > 0 && (
            <div className="tailor-confirmation__console" aria-hidden="true">
              {steps.map((l, i) => (
                <div key={l} className={cn('tailor-confirmation__step', i === steps.length - 1 && 'tailor-confirmation__step--last')} style={{ animationDelay: `${0.9 + i * 0.6}s` }}>
                  <span>{String(i + 1).padStart(2, '0')} › </span>{l}
                </div>
              ))}
            </div>
          )}

          <div className="tailor-confirmation__final">
            <div>
              {overline && <p className="tailor-confirmation__overline"><span aria-hidden="true" />{overline}</p>}
              <h2 id={idTitulo} className="tailor-confirmation__title" aria-label={title}>
                {/* Palavra inteira num bloco sem quebra; as letras acendem uma a uma. */}
                {title.split(' ').map((palavra, w, todas) => {
                  const antes = todas.slice(0, w).join(' ').length + (w ? 1 : 0);
                  return (
                    <span key={w} aria-hidden="true">
                      <span className="tailor-confirmation__word">
                        {palavra.split('').map((c, i) => (
                          <span key={i} className="tailor-confirmation__letter" style={{ animationDelay: `${recuo + 0.6 + (antes + i) * 0.03}s` }}>{c}</span>
                        ))}
                      </span>
                      {w < todas.length - 1 && ' '}
                    </span>
                  );
                })}
              </h2>
              {description && <div className="tailor-confirmation__description">{description}</div>}
              <div className="tailor-confirmation__actions">
                {actions}
                <button type="button" className="tailor-confirmation__close" onClick={onClose} autoFocus>{closeLabel ?? messages.close}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
