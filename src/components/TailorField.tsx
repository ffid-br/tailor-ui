import React, { useId } from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';

export type TailorFieldProps = {
  label: React.ReactNode;
  /** Mensagem de erro. Com ela, o campo fica vermelho e a mensagem aparece abaixo, com o ponto. */
  error?: React.ReactNode;
  /** Ajuda abaixo do campo, quando não há erro. */
  hint?: React.ReactNode;
  /** Marca o campo como obrigatório (no rótulo e no `required` do controle). */
  required?: boolean;
  /** Um `input`, `select` ou `textarea` (ou componente que repasse as props). Recebe id, aria e a classe do campo. */
  children: React.ReactElement;
  className?: string;
};

/**
 * Rótulo, controle e mensagem num lugar só. O erro aparece de uma vez (precisa
 * ser lido já): borda vermelha, fundo levemente tingido e a mensagem com o
 * ponto vermelho, ligada ao controle por `aria-describedby`.
 */
export function TailorField({ label, error, hint, required, children, className }: TailorFieldProps) {
  const id = useId();
  const { messages } = useTailorLocale();
  const controleId = (children.props as { id?: string }).id ?? `${id}-campo`;
  const mensagemId = `${id}-mensagem`;
  const temErro = error !== undefined && error !== null && error !== false && error !== '';
  const props = children.props as { className?: string; required?: boolean };
  return (
    <div className={cn('tailor-field', temErro && 'tailor-field--error', className)}>
      <label className="tailor-field__label" htmlFor={controleId}>
        {label}
        {required && <span className="tailor-field__required">{messages.required}</span>}
      </label>
      {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: controleId,
        required: props.required ?? required,
        'aria-invalid': temErro || undefined,
        'aria-describedby': temErro || hint ? mensagemId : undefined,
        className: cn('tailor-field__control', props.className),
      })}
      {temErro ? (
        <p id={mensagemId} className="tailor-field__error">
          <span className="tailor-field__dot" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={mensagemId} className="tailor-field__hint">{hint}</p>
      ) : null}
    </div>
  );
}
