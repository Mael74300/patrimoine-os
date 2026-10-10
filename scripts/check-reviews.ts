/**
 * Signale les fiches à réviser : date de révision dépassée ou proche (30 jours),
 * et éléments encore marqués « à vérifier ». Écrit monitoring/reviews-report.md.
 */
import { writeFile } from 'node:fs/promises';
import { investments } from '../src/data/investments';
import { dueReviews } from './lib/watch';

const today = process.env.TODAY ?? new Date().toISOString().slice(0, 10);
const { overdue, upcoming } = dueReviews(investments, today);
const unverified = investments.filter((i) => !i.tax.verified || !i.fees.verified || !i.minCapital.verified);

const lines: string[] = [];
if (overdue.length || upcoming.length) {
  lines.push(`# Fiches à réviser (${today})`, '');
  if (overdue.length) lines.push('## Révision dépassée', '', ...overdue.map((i) => `- [ ] **${i.name}** (\`${i.slug}\`) — prévue le ${i.review.nextReview}`), '');
  if (upcoming.length) lines.push('## Révision dans les 30 jours', '', ...upcoming.map((i) => `- [ ] ${i.name} (\`${i.slug}\`) — prévue le ${i.review.nextReview}`), '');
  lines.push(
    '## Éléments encore marqués « à vérifier »',
    '',
    ...unverified.map((i) => `- ${i.name} : ${[!i.tax.verified && 'fiscalité', !i.fees.verified && 'frais', !i.minCapital.verified && 'capital'].filter(Boolean).join(', ')}`),
    '',
    'Après vérification : mettre à jour la fiche dans `src/data/investments.ts`, sa date `verifiedOn`, puis `nextReview`.',
  );
}
await writeFile(new URL('../monitoring/reviews-report.md', import.meta.url), lines.join('\n'));
console.log(lines.length ? lines.join('\n') : `Aucune fiche à réviser au ${today}.`);
