import React, { createContext, useContext, useMemo } from 'react';

/** Textos que os componentes mostram. Troque um por um em `messages`, ou o idioma inteiro em `locale`. */
export type TailorMessages = {
  loading: string;
  done: string;
  empty: string;
  total: string;
  pagination: string;
  page: (page: number, totalPages: number) => string;
  rows: (count: string) => string;
  previous: string;
  next: string;
  breadcrumb: string;
  dismiss: string;
  skip: string;
  required: string;
};

const PT_BR: TailorMessages = {
  loading: 'Carregando',
  done: 'Pronto',
  empty: 'Nenhum registro no período.',
  total: 'Total',
  pagination: 'Paginação',
  page: (p, t) => `Página ${p} de ${t}`,
  rows: (n) => `${n} registros`,
  previous: 'Anterior',
  next: 'Próxima',
  breadcrumb: 'Trilha',
  dismiss: 'Fechar aviso',
  skip: 'Pular',
  required: 'obrigatório',
};

const EN: TailorMessages = {
  loading: 'Loading',
  done: 'Done',
  empty: 'No records for this period.',
  total: 'Total',
  pagination: 'Pagination',
  page: (p, t) => `Page ${p} of ${t}`,
  rows: (n) => `${n} records`,
  previous: 'Previous',
  next: 'Next',
  breadcrumb: 'Breadcrumb',
  dismiss: 'Dismiss',
  skip: 'Skip',
  required: 'required',
};

export const TAILOR_MESSAGES: Record<string, TailorMessages> = { 'pt-BR': PT_BR, en: EN };

export type TailorLocale = {
  /** BCP 47. Formata números e datas; escolhe os textos (`pt-BR` e `en` inclusos; outro idioma cai no `en`). */
  locale: string;
  /** ISO 4217 para colunas `currency`. */
  currency: string;
  messages: TailorMessages;
};

const PADRAO: TailorLocale = { locale: 'pt-BR', currency: 'BRL', messages: PT_BR };
const Contexto = createContext<TailorLocale>(PADRAO);

export type TailorLocaleProviderProps = {
  locale?: string;
  currency?: string;
  /** Sobrescreve textos do idioma escolhido. */
  messages?: Partial<TailorMessages>;
  children: React.ReactNode;
};

/** Idioma, moeda e textos dos componentes. Sem provider: pt-BR e BRL. */
export function TailorLocaleProvider({ locale = 'pt-BR', currency = 'BRL', messages, children }: TailorLocaleProviderProps) {
  const valor = useMemo<TailorLocale>(() => {
    const base = TAILOR_MESSAGES[locale] ?? TAILOR_MESSAGES[locale.split('-')[0]] ?? EN;
    return { locale, currency, messages: { ...base, ...messages } };
  }, [locale, currency, messages]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export const useTailorLocale = () => useContext(Contexto);
