import { describe, expect, it } from 'vitest';
// @ts-expect-error module JavaScript sans types
import { checkPrFacts } from './check-pr-facts.mjs';

const ok = `## Changements
- x

## Vérification des informations
- Livret A 1,70 % du 1er août 2026 au 31 janvier 2027 — https://www.service-public.fr/particuliers/vosdroits/F2365 — consulté le 2026-10-27

## Vérifications
- tests`;

describe('contrôle d’exactitude des pull requests', () => {
  it('accepte une information sourcée et datée', () => expect(checkPrFacts(ok)).toEqual([]));
  it('accepte une date écrite en toutes lettres', () =>
    expect(checkPrFacts('## Vérification des informations\n- Plafond 22 950 € — https://www.service-public.fr — consulté le 27 octobre 2026')).toEqual([]));
  it('accepte la déclaration d’absence d’information factuelle', () =>
    expect(checkPrFacts('## Vérification des informations\nAucune information factuelle ajoutée ni modifiée.')).toEqual([]));
  it('refuse une description sans section', () => expect(checkPrFacts('## Changements\n- x')).toHaveLength(1));
  it('refuse une section vide', () => expect(checkPrFacts('## Vérification des informations\n\n## Vérifications')).toHaveLength(1));
  it('refuse une information sans source ni date', () =>
    expect(checkPrFacts('## Vérification des informations\n- Taux du LEP 2,50 %')).toHaveLength(2));
  it('refuse une source non https', () =>
    expect(checkPrFacts('## Vérification des informations\n- Taux — http://exemple.fr — 2026-10-27')).toHaveLength(1));
  it('description absente', () => expect(checkPrFacts(undefined)).toHaveLength(1));
});
