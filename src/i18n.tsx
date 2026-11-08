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
  news: string;
  newsSubtitle: string;
  seePrevious: string;
  close: string;
  unseen: (count: string) => string;
  howToRead: string;
  gotIt: string;
  nextStep: string;
  step: (step: number, total: number) => string;
  skipTour: string;
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
  news: 'Novidades',
  newsSubtitle: 'O que mudou.',
  seePrevious: 'Ver anteriores',
  close: 'Fechar',
  unseen: (n) => `${n} novas`,
  howToRead: 'Como ler esta tela',
  gotIt: 'Entendi',
  nextStep: 'Próximo',
  step: (s, t) => `Passo ${s} de ${t}`,
  skipTour: 'Pular tutorial',
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
  news: "What's new",
  newsSubtitle: 'What changed.',
  seePrevious: 'See earlier',
  close: 'Close',
  unseen: (n) => `${n} new`,
  howToRead: 'How to read this screen',
  gotIt: 'Got it',
  nextStep: 'Next',
  step: (s, t) => `Step ${s} of ${t}`,
  skipTour: 'Skip tour',
};

const ES: TailorMessages = {
  loading: 'Cargando',
  done: 'Listo',
  empty: 'Ningún registro en el período.',
  total: 'Total',
  pagination: 'Paginación',
  page: (p, t) => `Página ${p} de ${t}`,
  rows: (n) => `${n} registros`,
  previous: 'Anterior',
  next: 'Siguiente',
  breadcrumb: 'Ruta',
  dismiss: 'Cerrar aviso',
  skip: 'Omitir',
  required: 'obligatorio',
  news: 'Novedades',
  newsSubtitle: 'Qué cambió.',
  seePrevious: 'Ver anteriores',
  close: 'Cerrar',
  unseen: (n) => `${n} nuevas`,
  howToRead: 'Cómo leer esta pantalla',
  gotIt: 'Entendido',
  nextStep: 'Siguiente',
  step: (s, t) => `Paso ${s} de ${t}`,
  skipTour: 'Omitir tutorial',
};

export const TAILOR_MESSAGES: Record<string, TailorMessages> = { 'pt-BR': PT_BR, en: EN, es: ES };

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
