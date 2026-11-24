import { cn } from '../cn';
import { MascoteVetor, type ChaveDoAgenteVetor } from './MascoteVetor';

export type EquipeCarregandoProps = {
  /** Quem salta, na ordem da onda. Padrão: Vigia, Agenda e Diretor. */
  agentes?: ChaveDoAgenteVetor[];
  /** Largura de cada mascote, em px. Padrão: 36. */
  tamanho?: number;
  /** Rótulo acessível. Padrão: "Carregando". */
  rotulo?: string;
  className?: string;
};

/**
 * Loading com a equipe: os agentes saltam em onda, um depois do outro, e
 * seguem olhando o cursor. Desenho aprovado em
 * https://claude.ai/artifact/XD7ydPPaFgmvA9ogM59bfV. Com menos movimento, ficam parados.
 */
export function EquipeCarregando({ agentes = ['vigia', 'agenda', 'diretor'], tamanho = 36, rotulo = 'Carregando', className }: EquipeCarregandoProps) {
  return (
    <span role="status" aria-label={rotulo} className={cn('tailor-equipe-carregando inline-flex items-end gap-2', className)}>
      {agentes.map((a, i) => (
        <span key={`${a}-${i}`} className="tailor-mv tailor-equipe-carregando__agente" style={{ animationDelay: `${i * 0.12}s` }}>
          <MascoteVetor agente={a} pose="parado" tamanho={tamanho} />
        </span>
      ))}
    </span>
  );
}
