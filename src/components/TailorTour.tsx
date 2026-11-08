import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';
import { prefersReducedMotion } from '../reducedMotion';
import { gravarStorage, lerStorage } from '../storage';

export type TailorTourStep = {
  /** Valor do atributo `data-tour` do elemento, ou um seletor CSS (começando por `#`, `.` ou `[`). */
  target: string;
  title: string;
  text: React.ReactNode;
};

export type TailorTourProps = {
  steps: TailorTourStep[];
  /** Padrão: true. Com `storageKey`, só abre se a pessoa ainda não concluiu nem pulou. */
  open?: boolean;
  /** Lembra no navegador que o tour acabou (`tailor-tour:<storageKey>`), seja concluindo ou pulando. */
  storageKey?: string;
  /** "Entendi" no último passo. */
  onClose?: () => void;
  /** Pular, X e Esc. Sem ele, valem como `onClose`. */
  onSkip?: () => void;
};

/** Esquece que o tour foi visto, para a pessoa poder refazê-lo (ex.: botão "Ver o tour de novo"). */
export const resetTour = (storageKey: string) => gravarStorage(`tailor-tour:${storageKey}`, null);

const PAD = 6;
const CARD_W = 340;
const find = (t: string) => document.querySelector(/^[#.[]/.test(t) ? t : `[data-tour="${t}"]`);

/**
 * Tour guiado: escurece a tela, recorta o elemento da vez e explica numa frase. Passo cujo
 * elemento não está na tela é pulado. Esc pula; as setas andam. É um diálogo modal: prende o
 * Tab no balão e devolve o foco a quem o tinha. Com "menos movimento", rola e recorta sem animar.
 */
export function TailorTour({ steps, open = true, storageKey, onClose, onSkip }: TailorTourProps) {
  const { messages } = useTailorLocale();
  const titleId = useId();
  const chave = storageKey ? `tailor-tour:${storageKey}` : null;
  const [list, setList] = useState<TailorTourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  // Ao abrir: congela os passos cujo elemento existe agora (o roteiro serve para telas com e sem cada recurso).
  useEffect(() => {
    if (!open || (chave && lerStorage(chave))) { setList([]); return; }
    setList(stepsRef.current.filter((s) => find(s.target)));
    setIndex(0);
  }, [open, chave]);

  const step = list[index];
  const ativo = open && Boolean(step);
  const last = index === list.length - 1;

  const finish = useCallback((cb?: () => void) => {
    if (chave) gravarStorage(chave, 'done');
    setList([]);
    cb?.();
  }, [chave]);
  const close = () => finish(onClose);
  const skip = () => finish(onSkip ?? onClose);
  const skipRef = useRef(skip);
  skipRef.current = skip;

  const measure = useCallback(() => {
    const el = step && find(step.target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useLayoutEffect(() => {
    if (!ativo || !step) return;
    find(step.target)?.scrollIntoView?.({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    measure();
    const t = setTimeout(measure, prefersReducedMotion() ? 0 : 350);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [ativo, step, measure]);

  // Guarda quem tinha o foco ao abrir e devolve ao fechar.
  useEffect(() => {
    if (!ativo) return;
    const before = document.activeElement as HTMLElement | null;
    return () => { before?.focus?.(); };
  }, [ativo]);

  useEffect(() => { if (ativo) cardRef.current?.focus(); }, [ativo, index]);

  useEffect(() => {
    if (!ativo) return;
    const onKey = (e: KeyboardEvent) => {
      const card = cardRef.current;
      if (e.key === 'Tab' && card) {
        const items = Array.from(card.querySelectorAll<HTMLElement>('button:not([disabled])'));
        if (!items.length) return;
        const first = items[0];
        const lastItem = items[items.length - 1];
        const inside = card.contains(document.activeElement);
        if (e.shiftKey && (!inside || document.activeElement === first || document.activeElement === card)) { e.preventDefault(); lastItem.focus(); }
        else if (!e.shiftKey && (!inside || document.activeElement === lastItem)) { e.preventDefault(); first.focus(); }
        return;
      }
      if (e.key === 'Escape') skipRef.current();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, list.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ativo, list.length]);

  if (!ativo || !step) return null;

  // Balão abaixo do elemento; se não couber, acima. Nunca fora da tela.
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const below = rect ? rect.bottom + PAD + 12 : vh / 2;
  const top = rect && below + 220 > vh ? Math.max(12, rect.top - PAD - 12 - 220) : below;
  const left = rect ? Math.min(Math.max(12, rect.left), vw - CARD_W - 12) : (vw - CARD_W) / 2;

  return createPortal(
    <div className="tailor-tour" aria-live="polite">
      {rect
        ? <div aria-hidden="true" className="tailor-tour__spot" style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }} />
        : <div aria-hidden="true" className="tailor-tour__veil" />}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn('tailor-tour__card')}
        style={{ top, left, width: Math.min(CARD_W, vw - 24) }}
      >
        <div className="tailor-tour__head">
          <h2 id={titleId} className="tailor-tour__title">{step.title}</h2>
          <button type="button" className="tailor-tour__x" aria-label={messages.close} onClick={skip}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
          </button>
        </div>
        <div className="tailor-tour__text">{step.text}</div>
        <div className="tailor-tour__foot">
          <span className="tailor-tour__count">{messages.step(index + 1, list.length)}</span>
          <div className="tailor-tour__nav">
            {index > 0 && <button type="button" className="tailor-tour__btn" onClick={() => setIndex(index - 1)}>{messages.previous}</button>}
            {last
              ? <button type="button" className="tailor-tour__btn tailor-tour__btn--primary" onClick={close}>{messages.gotIt}</button>
              : <button type="button" className="tailor-tour__btn tailor-tour__btn--primary" onClick={() => setIndex(index + 1)}>{messages.nextStep}</button>}
          </div>
        </div>
        {!last && <button type="button" className="tailor-tour__skip" onClick={skip}>{messages.skipTour}</button>}
      </div>
    </div>,
    document.body,
  );
}
