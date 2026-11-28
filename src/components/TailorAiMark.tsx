export interface TailorAiMarkProps {
  /** Texto ao lado do ponto. Padrão: "Gerado por IA". */
  label?: string;
  /** Só o ponto e "IA" (para linha de tabela, chip, botão). O texto completo vai para o leitor de tela e o title. */
  compact?: boolean;
  className?: string;
}

/**
 * Marca de conteúdo feito por IA. O ponto verde é o mesmo do logotipo, o que antecede o "ia":
 * o momento em que a inteligência assume. Sem emoji e sem brilho.
 */
export function TailorAiMark({ label = 'Gerado por IA', compact = false, className }: TailorAiMarkProps) {
  const classe = ['tailor-ai-mark', compact && 'tailor-ai-mark--compact', className].filter(Boolean).join(' ');
  return (
    <span className={classe} title={compact ? label : undefined} role={compact ? 'img' : undefined} aria-label={compact ? label : undefined}>
      <span className="tailor-ai-mark__dot" aria-hidden="true" />
      {compact ? <span aria-hidden="true">IA</span> : label}
    </span>
  );
}
