import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Página de exemplos: monta os componentes direto de `src/` com o Tailwind
// configurado como num app consumidor (ver README, "Configuração no app").
// `base` relativo para servir em ffid-br.github.io/tailor-ui/ sem fixar o caminho.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
