import React from 'react';
import { cn } from '../cn';

export type TailorEsqueletoProps = {
  /** `texto`: parágrafo. `bloco`: um retângulo (gráfico, imagem). `tabela`: linhas e colunas. `cartoes`: indicadores lado a lado. */
  forma?: 'texto' | 'bloco' | 'tabela' | 'cartoes';
  /** Linhas do texto ou da tabela, ou quantidade de cartões. */
  linhas?: number;
  /** Colunas da tabela. */
  colunas?: number;
  /** Altura do `bloco`. Padrão: 144px. */
  altura?: string;
  /** Lido pelo leitor de tela. Padrão: "Carregando". */
  rotulo?: string;
  className?: string;
};

// Larguras na proporção áurea, para o texto falso não parecer régua.
const LARGURAS = ['100%', '89%', '61.8%'];

/**
 * O lugar do conteúdo enquanto ele chega: barras cinza retas e a linha verde
 * varrendo de cima a baixo. Sem gradiente nem cantos (manual da marca).
 */
export function TailorEsqueleto({ forma = 'texto', linhas, colunas = 4, altura = '144px', rotulo = 'Carregando', className }: TailorEsqueletoProps) {
  const barra = (largura: string, key: React.Key, extra?: string) => (
    <span key={key} className={cn('tailor-esq__barra', extra)} style={{ width: largura }} />
  );
  let corpo: React.ReactNode;
  if (forma === 'bloco') corpo = <span className="tailor-esq__barra" style={{ height: altura }} />;
  else if (forma === 'tabela') {
    corpo = Array.from({ length: (linhas ?? 5) + 1 }, (_, l) => (
      <span key={l} className={cn('tailor-esq__linha', l === 0 && 'tailor-esq__linha--cabecalho')} style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}>
        {Array.from({ length: colunas }, (_, c) => barra(l === 0 ? '55%' : LARGURAS[(l + c) % 3], c))}
      </span>
    ));
  } else if (forma === 'cartoes') {
    corpo = (
      <span className="tailor-esq__cartoes">
        {Array.from({ length: linhas ?? 3 }, (_, i) => (
          <span key={i} className="tailor-esq__cartao">
            {barra('34%', 'r', 'tailor-esq__barra--fina')}
            {barra('61.8%', 'v', 'tailor-esq__barra--grossa')}
            {barra('89%', 'd', 'tailor-esq__barra--fina')}
          </span>
        ))}
      </span>
    );
  } else {
    const n = linhas ?? 3;
    corpo = Array.from({ length: n }, (_, i) => barra(i === n - 1 ? '61.8%' : LARGURAS[i % 2], i));
  }
  return (
    <div role="status" aria-busy="true" className={cn('tailor-esq', className)}>
      <span className="tailor-esq__rotulo">{rotulo}</span>
      {corpo}
    </div>
  );
}
