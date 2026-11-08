import { TailorButton } from './TailorButton';

export type TailorActionSpec = { label: string; onClick?: () => void; href?: string };

/** Ação como botão (`onClick`) ou como link com cara de botão (`href`). Uso interno de Empty e Insight. */
export function TailorAction({ action, variant = 'primary', size = 'md' }: { action: TailorActionSpec; variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' }) {
  if (action.href) {
    return <a href={action.href} onClick={action.onClick} className={`tailor-btn tailor-btn--${variant} tailor-btn--${size}`}>{action.label}</a>;
  }
  return <TailorButton variant={variant} size={size} onClick={action.onClick}>{action.label}</TailorButton>;
}
