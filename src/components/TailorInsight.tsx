import React, { useState } from 'react';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';
import { TailorAction, type TailorActionSpec } from './TailorAction';
import { TailorSkeleton } from './TailorSkeleton';
import { TailorTypewriter } from './TailorTypewriter';

export type TailorInsightProps = {
  status: 'loading' | 'ready' | 'error' | 'empty';
  /** A conclusão em uma ou duas frases. No `error` e no `empty`, troca o texto padrão. */
  takeaway?: string;
  /** Por que a IA concluiu isso, em português simples. */
  why?: string;
  /** O próximo passo sugerido. */
  nextAction?: TailorActionSpec;
  /** De onde vieram os números ("Campanhas de outubro", "Funil Vendas"). */
  sources?: string[];
  confidence?: 'alta' | 'media' | 'baixa';
  generatedAt?: Date | string | number;
  /** Mostra "Atualizar" (no erro, "Tentar de novo"). */
  onRefresh?: () => void;
  /** Mostra "Ajudou?" com sim e não. */
  onFeedback?: (vote: 'up' | 'down') => void;
  className?: string;
};

const CONFIANCA = { alta: 'Confiança alta', media: 'Confiança média', baixa: 'Confiança baixa' } as const;

/**
 * A leitura da IA sobre a tela, em texto: conclusão, motivo e próximo passo.
 * Sempre marcada "Gerado por IA" (sem emoji) e com as fontes à vista. Só a
 * interface: quem gera o texto é o app.
 */
export function TailorInsight({ status, takeaway, why, nextAction, sources, confidence, generatedAt, onRefresh, onFeedback, className }: TailorInsightProps) {
  const { locale } = useTailorLocale();
  const [voto, setVoto] = useState<'up' | 'down' | null>(null);
  const quando = generatedAt === undefined ? null : new Date(generatedAt);
  const quandoOk = quando && !Number.isNaN(quando.getTime());

  const cabecalho = (
    <div className="tailor-insight__meta">
      <span className="tailor-insight__ai">Gerado por IA</span>
      {status === 'ready' && confidence && <span>{CONFIANCA[confidence]}</span>}
      {status === 'ready' && quandoOk && <time dateTime={quando.toISOString()}>{new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(quando)}</time>}
    </div>
  );

  let corpo: React.ReactNode;
  if (status === 'loading') {
    corpo = (
      <>
        <p className="tailor-insight__takeaway"><TailorTypewriter texts={['Lendo os números desta tela', 'Procurando o que mudou']} /></p>
        <TailorSkeleton shape="text" lines={2} label="Gerando a leitura" />
      </>
    );
  } else if (status === 'error') {
    corpo = (
      <>
        <p className="tailor-insight__takeaway">{takeaway ?? 'Não deu para gerar a leitura agora.'}</p>
        <p className="tailor-insight__why">Seus números continuam corretos. Tente de novo em instantes; se o problema voltar, avise o suporte.</p>
        {onRefresh && <div className="tailor-insight__actions"><TailorAction action={{ label: 'Tentar de novo', onClick: onRefresh }} variant="secondary" size="sm" /></div>}
      </>
    );
  } else if (status === 'empty') {
    corpo = (
      <>
        <p className="tailor-insight__takeaway">{takeaway ?? 'Ainda não há dados suficientes para uma leitura.'}</p>
        <p className="tailor-insight__why">Quando houver movimento neste período, a leitura aparece aqui.</p>
      </>
    );
  } else {
    corpo = (
      <>
        <p className="tailor-insight__takeaway">{takeaway}</p>
        {why && <p className="tailor-insight__why">{why}</p>}
        {nextAction && <div className="tailor-insight__actions"><TailorAction action={nextAction} variant="primary" size="sm" /></div>}
        {sources && sources.length > 0 && <p className="tailor-insight__sources">Fontes: {sources.join(', ')}</p>}
        {(onRefresh || onFeedback) && (
          <div className="tailor-insight__foot">
            {onRefresh && <button type="button" className="tailor-insight__link" onClick={onRefresh}>Atualizar</button>}
            {onFeedback && (
              <span className="tailor-insight__feedback" role="group" aria-label="Esta leitura ajudou?">
                <span>Ajudou?</span>
                {(['up', 'down'] as const).map((v) => (
                  <button key={v} type="button" className="tailor-insight__link" aria-pressed={voto === v} onClick={() => { setVoto(v); onFeedback(v); }}>
                    {v === 'up' ? 'Sim' : 'Não'}
                  </button>
                ))}
              </span>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <section
      aria-label="Leitura gerada por IA"
      aria-busy={status === 'loading' || undefined}
      role={status === 'error' ? 'alert' : undefined}
      className={cn('tailor-insight', `tailor-insight--${status}`, className)}
    >
      {cabecalho}
      {corpo}
    </section>
  );
}
