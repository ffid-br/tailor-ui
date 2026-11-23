import React, { useState } from 'react';
import { cn } from '../cn';
import { TailorButton } from './TailorButton';
import { TailorSkeleton } from './TailorSkeleton';
import { TailorTable } from './TailorTable';

export type CreditBalance = {
  month: string; quota: number; used: number; remaining: number;
  overage_credits: number; overage_brl: number; overage_price: number; percent_used: number;
  source: 'default' | 'contract'; legacy: string[]; resets_on: string;
};
export type CreditItem = { created_at: string; type: string; service: string | null; credits: number; client_id: string; chat_id?: string | null };
export type CreditStatementData = {
  balance: CreditBalance;
  by_service: { service: string | null; credits: number }[];
  by_day: { day: string; credits: number }[];
  by_account: { client_id: string; credits: number }[];
  by_person: { user_id: string; credits: number }[];
  items: CreditItem[];
};

export interface TailorCreditStatementProps {
  data: CreditStatementData | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Mês do extrato, `AAAA-MM`. Com `onMonthChange`, aparece o seletor (atual + 5 anteriores). */
  month?: string;
  onMonthChange?: (month: string) => void;
  personLabel?: (userId: string) => string;
  accountLabel?: (clientId: string) => string;
  /** Visão FFID (custo, margem), abaixo do saldo. */
  adminExtras?: React.ReactNode;
  className?: string;
}

/** Slug do serviço (API em inglês) para o texto da tela. Slug novo sem rótulo aparece como veio. */
const SERVICO: Record<string, string> = {
  outbound_call: 'Ligação de saída',
  inbound_call: 'Ligação de entrada',
  call_summary: 'Resumo da ligação',
  agent_review: 'Revisão do agente',
  web_meeting: 'Reunião online',
  voice_generator: 'Gerador de Voz',
  assistant: 'Tailor.ia Assistente',
};
const servico = (s: string | null) => (s ? SERVICO[s] ?? s : 'Outro');

/** Contrato antigo para o texto da tela: o cliente não lê slug. */
const LEGADO: Record<string, string> = { 'tailor-voice': 'Tailor.ia Voz', voice_ia: 'Gerador de Voz', 'tailor-assistente': 'Tailor.ia Assistente' };

type Aba = 'service' | 'day' | 'account' | 'person' | 'detail';
const ABAS: [Aba, string][] = [['service', 'Por serviço'], ['day', 'Por dia'], ['account', 'Por conta'], ['person', 'Por pessoa'], ['detail', 'Detalhe']];

const num = (n: number) => n.toLocaleString('pt-BR');
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const p2 = (n: number) => String(n).padStart(2, '0');
const diaMes = (iso: string) => { const m = /^\d{4}-(\d{2})-(\d{2})/.exec(iso); return m ? `${m[2]}/${m[1]}` : iso; };
const quando = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${p2(d.getDate())}/${p2(d.getMonth() + 1)} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
};

function ultimosMeses(): { value: string; label: string }[] {
  const hoje = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    return { value: `${d.getFullYear()}-${p2(d.getMonth() + 1)}`, label: `${p2(d.getMonth() + 1)}/${d.getFullYear()}` };
  });
}

function Barras({ rows, empty }: { rows: { key: string; label: string; credits: number }[]; empty: string }) {
  if (!rows.length) return <p className="tailor-credit__empty">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.credits), 1);
  return (
    <ul className="tailor-credit__bars">
      {rows.map((r) => (
        <li key={r.key} className="tailor-credit__bar-row">
          <span className="tailor-credit__bar-label">{r.label}</span>
          <span className="tailor-credit__bar-track"><span style={{ width: `${(r.credits / max) * 100}%` }} /></span>
          <span className="tailor-credit__bar-value">{num(r.credits)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Extrato de créditos de IA do mês: saldo, uso por serviço, dia, conta e pessoa, e o detalhe. Só apresentação. */
export function TailorCreditStatement({
  data, loading = false, error, onRetry, month, onMonthChange, personLabel, accountLabel, adminExtras, className,
}: TailorCreditStatementProps) {
  const [aba, setAba] = useState<Aba>('service');
  const idPessoa = (id: string) => (id === 'unknown' ? 'Sem pessoa' : personLabel ? personLabel(id) : id);
  const idConta = accountLabel ?? ((id: string) => id);
  const seletor = onMonthChange ? (
    <label className="tailor-credit__month">
      <span>Mês</span>
      <select value={month ?? ultimosMeses()[0].value} onChange={(e) => onMonthChange(e.target.value)}>
        {ultimosMeses().map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
    </label>
  ) : null;

  let corpo: React.ReactNode;
  if (error) {
    corpo = (
      <div className="tailor-credit__error" role="alert">
        <p>{error}</p>
        {onRetry && <TailorButton variant="secondary" onClick={onRetry}>Tentar de novo</TailorButton>}
      </div>
    );
  } else if (loading || !data) {
    corpo = loading ? <TailorSkeleton shape="block" label="Carregando o extrato" /> : null;
  } else {
    const b = data.balance;
    const vazio = 'Nenhum uso neste mês';
    corpo = (
      <>
        <section className="tailor-credit__balance" aria-label="Saldo do mês">
          <p className="tailor-credit__big">{`${num(b.remaining)} de ${num(b.quota)} créditos`}</p>
          {b.source === 'contract' && <span className="tailor-credit__tag">saldo combinado</span>}
          <div className="tailor-credit__meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(b.percent_used))} aria-label="Uso do mês">
            <span style={{ width: `${Math.min(100, b.percent_used)}%` }} />
            <i className="tailor-credit__mark" aria-hidden="true" />
          </div>
          <p className="tailor-credit__sub">{`${num(b.used)} usados · volta ao cheio em ${diaMes(b.resets_on)}`}</p>
          {b.overage_credits > 0 && (
            <p className="tailor-credit__warn" role="status">{`Saldo do mês acabou: ${num(b.overage_credits)} créditos a mais, ${brl(b.overage_brl)} na fatura`}</p>
          )}
          {b.legacy.length > 0 && (
            <p className="tailor-credit__warn" role="status">{`Contrato antigo cobre ${b.legacy.map((l) => LEGADO[l] ?? l).join(', ')}: esse uso segue no contrato, o resto consome créditos`}</p>
          )}
        </section>
        {adminExtras}
        <div className="tailor-credit__tabs" role="tablist" aria-label="Detalhar o uso">
          {ABAS.map(([k, t]) => (
            <button key={k} type="button" role="tab" id={`tcs-tab-${k}`} aria-selected={aba === k} aria-controls="tcs-panel" className="tailor-credit__tab" onClick={() => setAba(k)}>{t}</button>
          ))}
        </div>
        <div role="tabpanel" id="tcs-panel" aria-labelledby={`tcs-tab-${aba}`}>
          {aba === 'service' && <Barras empty={vazio} rows={data.by_service.map((r) => ({ key: r.service ?? 'other', label: servico(r.service), credits: r.credits }))} />}
          {aba === 'day' && <Barras empty={vazio} rows={data.by_day.map((r) => ({ key: r.day, label: diaMes(r.day), credits: r.credits }))} />}
          {aba === 'account' && <Barras empty={vazio} rows={data.by_account.map((r) => ({ key: r.client_id, label: idConta(r.client_id), credits: r.credits }))} />}
          {aba === 'person' && <Barras empty="Só o Tailor.ia Assistente mostra quem usou." rows={data.by_person.map((r) => ({ key: r.user_id, label: idPessoa(r.user_id), credits: r.credits }))} />}
          {aba === 'detail' && (
            <TailorTable<CreditItem>
              caption="Detalhe do uso de créditos"
              rows={data.items}
              rowKey={(r, i) => `${r.created_at}-${i}`}
              empty={vazio}
              pageSize={20}
              columns={[
                { key: 'created_at', header: 'Quando', cell: (r) => quando(r.created_at) },
                { key: 'service', header: 'Serviço', cell: (r) => servico(r.service) },
                { key: 'client_id', header: 'Conta', cell: (r) => idConta(r.client_id) },
                { key: 'credits', header: 'Créditos', type: 'number', align: 'right' },
              ]}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <div className={cn('tailor-credit', className)}>
      {seletor}
      {corpo}
    </div>
  );
}
