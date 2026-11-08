// Gera src/assets/apps/<app>.svg a partir de src/apps.ts. Rode: npm run icones
import { writeFileSync } from 'node:fs';
import { TAILOR_APPS, appIconSvg } from '../src/apps.ts';

for (const app of Object.values(TAILOR_APPS)) {
  writeFileSync(new URL(`../src/assets/apps/${app.favicon}`, import.meta.url), appIconSvg(app));
}
console.log(`${Object.keys(TAILOR_APPS).length} ícones gerados`);
