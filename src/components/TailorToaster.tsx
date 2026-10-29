import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useTailorLocale } from '../i18n';
import { TailorTypewriter } from './TailorTypewriter';

export type TailorToastType = 'success' | 'error' | 'info';
export type TailorToastOptions = { description?: React.ReactNode; /** ms. Padrão: 4000; erro, 8000. */ duration?: number };
type Toast = { id: number; type: TailorToastType; title: React.ReactNode; description?: React.ReactNode; duration: number };

// Fila global: `toast` funciona fora de componente (depois de um fetch, num handler).
let fila: Toast[] = [];
let seq = 0;
const ouvintes = new Set<() => void>();
const emitir = () => ouvintes.forEach((f) => f());
const assinar = (f: () => void) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; };
const ler = () => fila;

function adicionar(type: TailorToastType, title: React.ReactNode, options: TailorToastOptions = {}) {
  const id = ++seq;
  fila = [...fila, { id, type, title, description: options.description, duration: options.duration ?? (type === 'error' ? 8000 : 4000) }];
  emitir();
  return id;
}

/** `toast.success('Saved')`. Precisa de um `<TailorToaster />` montado no app. Devolve o id, para `toast.dismiss`. */
export const toast = {
  success: (title: React.ReactNode, options?: TailorToastOptions) => adicionar('success', title, options),
  error: (title: React.ReactNode, options?: TailorToastOptions) => adicionar('error', title, options),
  info: (title: React.ReactNode, options?: TailorToastOptions) => adicionar('info', title, options),
  dismiss: (id: number) => {
    fila = fila.filter((t) => t.id !== id);
    emitir();
  },
};

const Icone: React.FC<{ type: TailorToastType; escrito: boolean }> = ({ type, escrito }) => (
  <svg className="tailor-toast__icon" viewBox="-12 -12 24 24" aria-hidden="true">
    {(!escrito || type === 'info') && <rect className="tailor-ponto-pisca" x={-4} y={-4} width={8} height={8} />}
    {escrito && type === 'success' && <polyline className="tailor-loader__check" points="-11,0 -4,7 11,-8" pathLength={1} fill="none" strokeWidth={4} strokeLinecap="square" />}
    {escrito && type === 'error' && <path className="tailor-loader__check" d="M-8 -8L8 8M8 -8L-8 8" pathLength={1} fill="none" strokeWidth={4} strokeLinecap="square" />}
  </svg>
);

function ItemToast({ item }: { item: Toast }) {
  const { messages } = useTailorLocale();
  const [escrito, setEscrito] = useState(typeof item.title !== 'string');
  useEffect(() => {
    const t = setTimeout(() => toast.dismiss(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item]);
  return (
    <div role={item.type === 'error' ? 'alert' : 'status'} className={`tailor-toast tailor-toast--${item.type}`}
      style={{ '--tailor-toast-duration': `${item.duration}ms` } as React.CSSProperties}>
      <Icone type={item.type} escrito={escrito} />
      <div className="tailor-toast__text">
        <p className="tailor-toast__title">
          {typeof item.title === 'string'
            ? <TailorTypewriter texts={[item.title]} once onDone={() => setEscrito(true)} />
            : item.title}
        </p>
        {item.description && <p className="tailor-toast__description">{item.description}</p>}
      </div>
      <button type="button" className="tailor-toast__close" aria-label={messages.dismiss} onClick={() => toast.dismiss(item.id)}>×</button>
      <span className="tailor-toast__timer" aria-hidden="true" />
    </div>
  );
}

/**
 * Os avisos (toasts) da marca: caixa preta com a borda da cor do tipo; o ponto
 * escreve o título e vira check (ou X); barra do tempo restante. Monte uma vez,
 * perto da raiz do app.
 */
export function TailorToaster() {
  const lista = useSyncExternalStore(assinar, ler, ler);
  return (
    <div className="tailor-toaster">
      {lista.map((t) => <ItemToast key={t.id} item={t} />)}
    </div>
  );
}
