import { useState } from 'react';
import {
  AgenteMascote,
  ROTULO_DO_ESTADO,
  type AcessorioDoMascote,
  type AgenteMascoteProps,
  type ChaveDoAgente,
  type EstadoDoMascote,
  type ExpressaoDoMascote,
  type ObjetoDoMascote,
  type TemaDoMascote,
} from '../src';

// Listas da página; os tipos garantem que só entram valores que o componente aceita.
const AGENTES: Record<ChaveDoAgente, string> = {
  desk: 'Alfred', pergunte: 'Pergunte', pm: 'PM', diretor: 'Diretor', sdr: 'SDR', cred: 'Cred',
  score: 'Score', pilot: 'Pilot', flow: 'Flow', bi: 'BI', rh: 'RH',
};
const ESTADOS = Object.keys(ROTULO_DO_ESTADO) as EstadoDoMascote[];
const EXPRESSOES: ExpressaoDoMascote[] = ['neutro', 'feliz', 'piscando', 'surpreso', 'bravo', 'triste', 'desconfiado', 'sonolento', 'tonto'];
const TEMAS: TemaDoMascote[] = ['natal', 'pascoa', 'aniversario', 'halloween', 'copa', 'galaxia', 'premiacao'];
const ACESSORIOS: AcessorioDoMascote[] = ['gorro', 'orelhas', 'festa', 'bruxa', 'bone', 'capacete', 'coroa'];
const OBJETOS: ObjetoDoMascote[] = ['presente', 'ovo', 'bolo', 'abobora', 'bola', 'sabre', 'trofeu'];

type Escolha = {
  agente: ChaveDoAgente; nome: string; estilo: 'pixel' | 'vetor'; estado: EstadoDoMascote;
  expressao: ExpressaoDoMascote | ''; tema: TemaDoMascote | ''; acessorio: AcessorioDoMascote | '';
  objeto: ObjetoDoMascote | ''; fala: string; tamanho: number; selo: number; mostrarEstado: boolean;
  superficie: 'auto' | 'clara' | 'escura';
};

const INICIAL: Escolha = {
  agente: 'desk', nome: 'Alfred', estilo: 'vetor', estado: 'cumprimentando', expressao: '', tema: '', acessorio: '',
  objeto: '', fala: 'Oi! Sou o Alfred.', tamanho: 160, selo: 0, mostrarEstado: true, superficie: 'auto',
};

const SO_PIXEL = ['desk', 'pergunte', 'pm', 'diretor'];

function Opcoes<T extends string | number>({ rotulo, valor, opcoes, aoEscolher, texto = String }: {
  rotulo: string; valor: T; opcoes: T[]; aoEscolher: (v: T) => void; texto?: (v: T) => string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-[13px] font-medium">{rotulo}</legend>
      <div className="flex flex-wrap gap-1">
        {opcoes.map((o) => (
          <button key={String(o)} type="button" aria-pressed={o === valor} onClick={() => aoEscolher(o)}
            className={
              'min-h-8 border px-2.5 text-xs font-medium ' +
              (o === valor
                ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-neutral-300 hover:border-black dark:border-neutral-700 dark:hover:border-white')
            }>
            {texto(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function codigo(e: Escolha) {
  const p: string[] = [`agente="${e.agente}"`, `nome="${e.nome}"`];
  if (e.estilo === 'vetor' && SO_PIXEL.includes(e.agente)) p.push('estilo="vetor"');
  p.push(`estado="${e.estado}"`);
  if (e.estilo === 'vetor') {
    if (e.expressao) p.push(`expressao="${e.expressao}"`);
    if (e.tema) p.push(`tema="${e.tema}"`);
    if (e.acessorio) p.push(`acessorio="${e.acessorio}"`);
    if (e.objeto) p.push(`objeto="${e.objeto}"`);
    if (e.fala) p.push(`fala="${e.fala}"`);
    p.push(`tamanho={${e.tamanho}}`);
    if (e.superficie !== 'auto') p.push(`superficie="${e.superficie}"`);
  }
  if (e.selo) p.push(`selo={${e.selo}}`);
  if (e.mostrarEstado) p.push('mostrarEstado');
  return `<AgenteMascote\n  ${p.join('\n  ')}\n/>`;
}

/** Monta qualquer mascote com o componente de verdade e devolve o código. */
export function Simulador() {
  const [e, setE] = useState<Escolha>(INICIAL);
  const [copiado, setCopiado] = useState(false);
  const muda = (parcial: Partial<Escolha>) => setE((v) => ({ ...v, ...parcial }));
  const vetor = e.estilo === 'vetor' || !SO_PIXEL.includes(e.agente);
  const props: AgenteMascoteProps = {
    agente: e.agente, nome: e.nome, estado: e.estado, estilo: e.estilo, selo: e.selo, mostrarEstado: e.mostrarEstado,
    tamanho: e.tamanho, superficie: e.superficie, celula: Math.max(3, Math.round(e.tamanho / 16)),
    expressao: e.expressao || undefined, tema: e.tema || undefined, acessorio: e.acessorio || undefined,
    objeto: e.objeto || undefined, fala: e.fala || undefined,
  };
  const fundo = e.superficie === 'escura' ? 'bg-black text-white' : e.superficie === 'clara' ? 'bg-white text-black' : 'bg-neutral-50 dark:bg-neutral-900';

  return (
    <div className="grid border border-neutral-200 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] dark:border-neutral-800">
      <div className="flex min-w-0 flex-col">
        <div className={`flex min-h-[420px] flex-1 items-center justify-center px-6 pb-8 pt-28 ${fundo}`}>
          <AgenteMascote {...props} />
        </div>
        <pre className="overflow-x-auto border-t border-neutral-200 p-4 text-[13px] leading-relaxed dark:border-neutral-800"><code>{codigo(e)}</code></pre>
        <button type="button" className="m-4 mt-0 self-start border border-black px-3 py-2 text-xs font-medium dark:border-white"
          onClick={() => navigator.clipboard.writeText(codigo(e)).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1600); }).catch(() => {})}>
          {copiado ? 'Copiado' : 'Copiar código'}
        </button>
      </div>

      <div className="grid min-w-0 content-start gap-5 border-t border-neutral-200 p-6 lg:border-l lg:border-t-0 dark:border-neutral-800">
        <Opcoes rotulo="Agente" valor={e.agente} opcoes={Object.keys(AGENTES) as ChaveDoAgente[]} texto={(a) => AGENTES[a]}
          aoEscolher={(agente) => muda({ agente, nome: AGENTES[agente], fala: e.fala.startsWith('Oi! Sou o') ? `Oi! Sou o ${AGENTES[agente]}.` : e.fala })} />
        <Opcoes rotulo="Estilo" valor={vetor ? 'vetor' : 'pixel'} opcoes={SO_PIXEL.includes(e.agente) ? ['vetor', 'pixel'] : ['vetor']}
          aoEscolher={(estilo) => muda({ estilo: estilo as Escolha['estilo'] })} />
        <Opcoes rotulo="Estado" valor={e.estado} opcoes={ESTADOS} texto={(s) => ROTULO_DO_ESTADO[s]} aoEscolher={(estado) => muda({ estado })} />
        {vetor && <>
          <Opcoes rotulo="Olhar" valor={e.expressao} opcoes={['', ...EXPRESSOES]} texto={(x) => x || 'Do estado'} aoEscolher={(expressao) => muda({ expressao })} />
          <Opcoes rotulo="Tema" valor={e.tema} opcoes={['', ...TEMAS]} texto={(x) => x || 'Nenhum'} aoEscolher={(tema) => muda({ tema, acessorio: '', objeto: '' })} />
          <Opcoes rotulo="Acessório" valor={e.acessorio} opcoes={['', ...ACESSORIOS]} texto={(x) => x || 'Nenhum'} aoEscolher={(acessorio) => muda({ acessorio, tema: '' })} />
          <Opcoes rotulo="Objeto" valor={e.objeto} opcoes={['', ...OBJETOS]} texto={(x) => x || 'Nenhum'} aoEscolher={(objeto) => muda({ objeto, tema: '' })} />
          <label className="grid gap-2 text-[13px] font-medium">
            Fala no balão
            <input id="sim-fala" value={e.fala} onChange={(ev) => muda({ fala: ev.target.value })} placeholder="Sem balão"
              className="h-10 border border-neutral-400 bg-transparent px-3 text-sm font-normal focus:border-black focus:outline-none focus:ring-3 focus:ring-tailor-green/60 dark:focus:border-white" />
          </label>
          <Opcoes rotulo="Superfície" valor={e.superficie} opcoes={['auto', 'clara', 'escura']} aoEscolher={(superficie) => muda({ superficie: superficie as Escolha['superficie'] })} />
        </>}
        <Opcoes rotulo="Tamanho" valor={e.tamanho} opcoes={[32, 64, 96, 160, 240]} texto={(t) => `${t}px`} aoEscolher={(tamanho) => muda({ tamanho })} />
        <Opcoes rotulo="Selo" valor={e.selo} opcoes={[0, 3, 12, 120]} texto={(n) => (n ? String(n) : 'Sem selo')} aoEscolher={(selo) => muda({ selo })} />
        <Opcoes rotulo="Mostrar estado" valor={e.mostrarEstado ? 'sim' : 'não'} opcoes={['sim', 'não']} aoEscolher={(v) => muda({ mostrarEstado: v === 'sim' })} />
      </div>
    </div>
  );
}
