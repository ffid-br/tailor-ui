import { fireEvent, render, screen } from '@testing-library/react';
import { TailorCreditStatement, type CreditStatementData } from './index';

const base: CreditStatementData = {
  balance: { month: '2026-11', quota: 10000, used: 6760, remaining: 3240, overage_credits: 0, overage_brl: 0, overage_price: 0.1, percent_used: 67.6, source: 'default', legacy: [], resets_on: '2026-12-01' },
  by_service: [{ service: 'assistant', credits: 5200 }],
  by_day: [{ day: '2026-11-20', credits: 900 }],
  by_account: [{ client_id: 'c1', credits: 6760 }],
  by_person: [],
  items: [{ created_at: '2026-11-21T14:30:00', type: 'usage', service: 'assistant', credits: 12, client_id: 'c1' }],
};
const com = (b: Partial<CreditStatementData['balance']>): CreditStatementData => ({ ...base, balance: { ...base.balance, ...b } });

describe('TailorCreditStatement', () => {
  it('mostra o saldo e a data de volta', () => {
    render(<TailorCreditStatement data={base} />);
    expect(screen.getByText('3.240 de 10.000 créditos')).toBeInTheDocument();
    expect(screen.getByText('6.760 usados · volta ao cheio em 01/12')).toBeInTheDocument();
  });
  it('avisa do excedente com R$ formatado', () => {
    render(<TailorCreditStatement data={com({ remaining: 0, overage_credits: 500, overage_brl: 50 })} />);
    expect(screen.getByText(/500 créditos a mais, R\$\s50,00 na fatura/)).toBeInTheDocument();
  });
  it('avisa do contrato antigo', () => {
    render(<TailorCreditStatement data={com({ legacy: ['voice_ia', 'plano-x'] })} />);
    expect(screen.getByText(/Contrato antigo cobre Gerador de Voz, plano-x/)).toBeInTheDocument();
  });
  it('aba Detalhe mostra a tabela e Por pessoa vazio explica', () => {
    render(<TailorCreditStatement data={base} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Por pessoa' }));
    expect(screen.getByText('Só o Tailor.ia Assistente mostra quem usou.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Detalhe' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  it('carregando não mostra dados', () => {
    render(<TailorCreditStatement data={base} loading />);
    expect(screen.queryByText(/créditos/)).not.toBeInTheDocument();
  });
  it('erro chama onRetry', () => {
    const onRetry = vi.fn();
    render(<TailorCreditStatement data={null} error="Falhou" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('contrato da API em inglês (QD-0591)', () => {
  it('serviço vira texto, pessoa unknown vira Sem pessoa', () => {
    const d: CreditStatementData = { ...base, by_service: [{ service: 'outbound_call', credits: 115 }, { service: null, credits: 1 }], by_person: [{ user_id: 'unknown', credits: 3 }] };
    render(<TailorCreditStatement data={d} />);
    expect(screen.getByText('Ligação de saída')).toBeInTheDocument();
    expect(screen.getByText('Outro')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Por pessoa' }));
    expect(screen.getByText('Sem pessoa')).toBeInTheDocument();
  });
});
