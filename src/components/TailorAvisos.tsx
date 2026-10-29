import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { TailorDigitando } from './TailorDigitando';

export type TipoDoAviso = 'sucesso' | 'erro' | 'info';
export type OpcoesDoAviso = { detalhe?: React.ReactNode; /** ms. Padrão: 4000; erro, 8000. */ duracao?: number };
type Aviso = { id: number; tipo: TipoDoAviso; titulo: React.ReactNode; detalhe?: React.ReactNode; duracao: number };

// Fila global: `avisar` funciona fora de componente (depois de um fetch, num handler).
let avisos: Aviso[] = [];
let seq = 0;
const ouvintes = new Set<() => void>();
const emitir = () => ouvintes.forEach((f) => f());
const assinar = (f: () => void) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; };
const ler = () => avisos;

function adicionar(tipo: TipoDoAviso, titulo: React.ReactNode, opcoes: OpcoesDoAviso = {}) {
  const id = ++seq;
  avisos = [...avisos, { id, tipo, titulo, detalhe: opcoes.detalhe, duracao: opcoes.duracao ?? (tipo === 'erro' ? 8000 : 4000) }];
  emitir();
  return id;
}

export function fecharAviso(id: number) {
  avisos = avisos.filter((a) => a.id !== id);
  emitir();
}

/** `avisar.sucesso('Salvo')`. Precisa de um `<TailorAvisos />` montado no app. Devolve o id, para `fecharAviso`. */
export const avisar = {
  sucesso: (titulo: React.ReactNode, opcoes?: OpcoesDoAviso) => adicionar('sucesso', titulo, opcoes),
  erro: (titulo: React.ReactNode, opcoes?: OpcoesDoAviso) => adicionar('erro', titulo, opcoes),
  info: (titulo: React.ReactNode, opcoes?: OpcoesDoAviso) => adicionar('info', titulo, opcoes),
};

const Icone: React.FC<{ tipo: TipoDoAviso; escrito: boolean }> = ({ tipo, escrito }) => (
  <svg className="tailor-aviso__icone" viewBox="-12 -12 24 24" aria-hidden="true">
    {(!escrito || tipo === 'info') && <rect className="tailor-ponto-pisca" x={-4} y={-4} width={8} height={8} />}
    {escrito && tipo === 'sucesso' && <polyline className="tailor-loader__check" points="-11,0 -4,7 11,-8" pathLength={1} fill="none" strokeWidth={4} strokeLinecap="square" />}
    {escrito && tipo === 'erro' && <path className="tailor-loader__check" d="M-8 -8L8 8M8 -8L-8 8" pathLength={1} fill="none" strokeWidth={4} strokeLinecap="square" />}
  </svg>
);

function ItemAviso({ aviso }: { aviso: Aviso }) {
  const [escrito, setEscrito] = useState(typeof aviso.titulo !== 'string');
  useEffect(() => {
    const t = setTimeout(() => fecharAviso(aviso.id), aviso.duracao);
    return () => clearTimeout(t);
  }, [aviso]);
  return (
    <div role={aviso.tipo === 'erro' ? 'alert' : 'status'} className={`tailor-aviso tailor-aviso--${aviso.tipo}`}
      style={{ '--tailor-aviso-duracao': `${aviso.duracao}ms` } as React.CSSProperties}>
      <Icone tipo={aviso.tipo} escrito={escrito} />
      <div className="tailor-aviso__texto">
        <p className="tailor-aviso__titulo">
          {typeof aviso.titulo === 'string'
            ? <TailorDigitando textos={[aviso.titulo]} umaVez aoTerminar={() => setEscrito(true)} />
            : aviso.titulo}
        </p>
        {aviso.detalhe && <p className="tailor-aviso__detalhe">{aviso.detalhe}</p>}
      </div>
      <button type="button" className="tailor-aviso__fechar" aria-label="Fechar aviso" onClick={() => fecharAviso(aviso.id)}>×</button>
      <span className="tailor-aviso__tempo" aria-hidden="true" />
    </div>
  );
}

/**
 * Os avisos (toasts) da marca: caixa preta com a borda da cor do tipo; o ponto
 * escreve o título e vira check (ou X); barra do tempo restante. Monte uma vez,
 * perto da raiz do app.
 */
export function TailorAvisos() {
  const lista = useSyncExternalStore(assinar, ler, ler);
  return (
    <div className="tailor-avisos">
      {lista.map((a) => <ItemAviso key={a.id} aviso={a} />)}
    </div>
  );
}
