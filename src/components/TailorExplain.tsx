import React, { useId, useState } from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';
import { gravarStorage, lerStorage } from '../storage';

export type TailorExplainProps = {
  /** Cabeçalho do bloco. Padrão: "Como ler esta tela". */
  title?: string;
  /** Texto livre. Use `items` para o formato "termo: explicação". */
  children?: React.ReactNode;
  /** Lista de "o que é cada coisa". */
  items?: Array<{ label: string; text: React.ReactNode }>;
  /** Lembra no navegador se a pessoa recolheu (`tailor-explain:<storageKey>`). Sem ele, não lembra. */
  storageKey?: string;
  /** Aberto na primeira visita. Padrão: true. */
  defaultOpen?: boolean;
  className?: string;
};

/**
 * "O que é esta tela": explicação curta, em linguagem simples, que a pessoa recolhe
 * e não volta sozinha. Pensado para ficar logo abaixo do `TailorPageHeader`.
 */
export function TailorExplain({ title, children, items, storageKey, defaultOpen = true, className }: TailorExplainProps) {
  const { messages } = useTailorLocale();
  const id = useId();
  const chave = storageKey ? `tailor-explain:${storageKey}` : null;
  const [aberto, setAberto] = useState(() => {
    const salvo = chave ? lerStorage(chave) : null;
    return salvo === 'closed' ? false : salvo === 'open' ? true : defaultOpen;
  });

  const alternar = () => {
    const novo = !aberto;
    setAberto(novo);
    if (chave) gravarStorage(chave, novo ? 'open' : 'closed');
  };

  return (
    <section className={cn('tailor-explain', aberto && 'tailor-explain--open', className)}>
      <button type="button" className="tailor-explain__toggle" aria-expanded={aberto} aria-controls={id} onClick={alternar}>
        <span className="tailor-explain__chevron" aria-hidden="true" />
        {title ?? messages.howToRead}
      </button>
      {aberto && (
        <div id={id} className="tailor-explain__body">
          {children}
          {items && items.length > 0 && (
            <dl className="tailor-explain__items">
              {items.map((it, i) => (
                <div key={`${i}-${it.label}`}>
                  <dt>{it.label}</dt>
                  <dd>{it.text}</dd>
                </div>
              ))}
            </dl>
          )}
          <button type="button" className="tailor-explain__done" onClick={alternar}>{messages.gotIt}</button>
        </div>
      )}
    </section>
  );
}
