/** localStorage que não quebra em modo privado ou com storage bloqueado: só não lembra. */
export const lerStorage = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };
export const gravarStorage = (k: string, v: string | null) => {
  try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* sem storage: só não lembra */ }
};
