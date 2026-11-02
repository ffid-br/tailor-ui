import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { useTailorLocale } from '../i18n';

export type TailorNovidade = {
  id: string;
  /** YYYY-MM-DD */
  data: string;
  titulo: string;
  itens: string[];
  /** Tela a que a mudança se refere (ex.: "Campanhas"). */
  tela?: string;
};

const chaveDe = (chave: string, usuario?: string) => `tailor-novidades:${chave}:${usuario || 'anon'}`;
const ler = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };

/**
 * Quantas novidades (lista com a mais recente primeiro) são mais novas que a última vista.
 * Nunca viu: todas. Guarda o id mais recente visto no localStorage; storage bloqueado só não lembra.
 */
export function useNovidades(novidades: TailorNovidade[], { chave, usuario }: { chave: string; usuario?: string }) {
  const k = chaveDe(chave, usuario);
  const [visto, setVisto] = useState<string | null>(() => ler(k));
  useEffect(() => { setVisto(ler(k)); }, [k]);
  const i = visto ? novidades.findIndex((n) => n.id === visto) : -1;
  // id fora da lista (entrada removida): ids começam pela data, então compara como texto.
  const naoVistas = !visto ? novidades.length : i === -1 ? novidades.filter((n) => n.id > visto).length : i;
  const marcarVistas = useCallback(() => {
    const id = novidades[0]?.id;
    if (!id) return;
    setVisto(id);
    try { localStorage.setItem(k, id); } catch { /* sem storage: só não lembra */ }
  }, [k, novidades]);
  return { naoVistas, marcarVistas };
}

export type TailorNovidadesDialogProps = {
  aberto: boolean;
  onFechar: () => void;
  /** Mais recente primeiro. */
  novidades: TailorNovidade[];
  /** Quantas aparecem de início; o resto fica atrás de "Ver anteriores". Padrão: 5. */
  limite?: number;
  titulo?: string;
  subtitulo?: string;
};

/** Modal com o changelog do app. Esc, clique fora e o botão fechar devolvem o foco a quem abriu. */
export function TailorNovidadesDialog({ aberto, onFechar, novidades, limite = 5, titulo, subtitulo }: TailorNovidadesDialogProps) {
  const { messages, locale } = useTailorLocale();
  const [todas, setTodas] = useState(false);
  const fechar = useRef<HTMLButtonElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const onFecharRef = useRef(onFechar);
  onFecharRef.current = onFechar;

  useEffect(() => {
    if (!aberto) return;
    const gatilho = document.activeElement as HTMLElement | null;
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onFecharRef.current();
      if (e.key !== 'Tab') return;
      const foco = caixa.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!foco?.length) return;
      const primeiro = foco[0], ultimo = foco[foco.length - 1], atual = document.activeElement;
      if (!caixa.current?.contains(atual)) { e.preventDefault(); primeiro.focus(); }
      else if (e.shiftKey && atual === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && atual === ultimo) { e.preventDefault(); primeiro.focus(); }
    };
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('keydown', tecla); gatilho?.focus?.(); setTodas(false); };
  }, [aberto]);

  if (!aberto || typeof document === 'undefined') return null;
  const visiveis = todas ? novidades : novidades.slice(0, limite);
  const sub = subtitulo ?? messages.newsSubtitle;
  const data = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  return createPortal(
    <div className="tailor-nov__overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div ref={caixa} className="tailor-nov" role="dialog" aria-modal="true" aria-labelledby="tailor-nov-titulo">
        <header className="tailor-nov__head">
          <div>
            <h2 id="tailor-nov-titulo" className="tailor-nov__title">{titulo ?? messages.news}</h2>
            {sub && <p className="tailor-nov__sub">{sub}</p>}
          </div>
          <button ref={fechar} type="button" className="tailor-nov__close" aria-label={messages.close} onClick={onFechar}>
            <svg viewBox="-12 -12 24 24" width={16} height={16} aria-hidden="true"><path d="M-8 -8L8 8M8 -8L-8 8" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" /></svg>
          </button>
        </header>
        <div className="tailor-nov__body">
          {visiveis.map((n) => (
            <section key={n.id} className="tailor-nov__entry">
              <p className="tailor-nov__meta">
                <time dateTime={n.data}>{data(n.data)}</time>
                {n.tela && <span className="tailor-nov__tela">{n.tela}</span>}
              </p>
              <h3 className="tailor-nov__entry-title">{n.titulo}</h3>
              <ul className="tailor-nov__list">{n.itens.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          ))}
          {!todas && novidades.length > limite && (
            <button type="button" className="tailor-nov__more" onClick={() => setTodas(true)}>{messages.seePrevious}</button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export type TailorNovidadesProps = {
  novidades: TailorNovidade[];
  /** Identifica o app no localStorage (ex.: "crm"). */
  chave: string;
  usuario?: string;
  limite?: number;
  /** Texto do gatilho. Padrão: "Novidades". */
  rotulo?: string;
  className?: string;
};

/** Gatilho compacto + modal. Contador verde com as não vistas (9+); abrir marca tudo como visto. */
export function TailorNovidades({ novidades, chave, usuario, limite, rotulo, className }: TailorNovidadesProps) {
  const { messages } = useTailorLocale();
  const { naoVistas, marcarVistas } = useNovidades(novidades, { chave, usuario });
  const [aberto, setAberto] = useState(false);
  const texto = rotulo ?? messages.news;
  return (
    <>
      <button type="button" className={cn('tailor-nov__trigger', className)} onClick={() => { setAberto(true); marcarVistas(); }}>
        <span className="tailor-nov__dot" aria-hidden="true" />
        {texto}
        {naoVistas > 0 && (
          <span className="tailor-nov__count" aria-label={messages.unseen(String(naoVistas))}>{naoVistas > 9 ? '9+' : naoVistas}</span>
        )}
      </button>
      <TailorNovidadesDialog aberto={aberto} onFechar={() => setAberto(false)} novidades={novidades} limite={limite} titulo={texto} />
    </>
  );
}
