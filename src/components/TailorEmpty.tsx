import React from 'react';
import { cn } from '../cn';
import { TailorAction, type TailorActionSpec } from './TailorAction';

export type TailorEmptyProps = {
  /** Diz o que falta e já aponta o caminho ("Nenhuma campanha ainda"). */
  title: string;
  description?: React.ReactNode;
  /** A ação principal: um botão (`onClick`) ou um link (`href`). */
  action?: TailorActionSpec;
  secondaryAction?: TailorActionSpec;
  /** Troca a marca discreta padrão por uma ilustração sua. */
  illustration?: React.ReactNode;
  className?: string;
};

/** Estado vazio que convida a agir: marca discreta, o que falta, e o próximo passo. */
export function TailorEmpty({ title, description, action, secondaryAction, illustration, className }: TailorEmptyProps) {
  return (
    <div className={cn('tailor-empty', className)}>
      <div className="tailor-empty__art" aria-hidden="true">
        {illustration ?? (
          <svg viewBox="0 0 55 55" width="55" height="55" fill="none">
            <rect x="1" y="1" width="53" height="53" stroke="currentColor" strokeWidth="1" />
            <rect x="21" y="21" width="13" height="13" className="tailor-empty__dot" />
          </svg>
        )}
      </div>
      <p className="tailor-empty__title">{title}</p>
      {description && <div className="tailor-empty__description">{description}</div>}
      {(action || secondaryAction) && (
        <div className="tailor-empty__actions">
          {action && <TailorAction action={action} variant="primary" />}
          {secondaryAction && <TailorAction action={secondaryAction} variant="ghost" />}
        </div>
      )}
    </div>
  );
}
