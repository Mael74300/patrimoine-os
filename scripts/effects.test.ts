import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Garde-fou : un effet React écrit `useEffect(() => expression)` renvoie la valeur de l'expression.
 * Si elle n'est pas une fonction (ex. la promesse de window.scrollTo dans Chrome/Edge récents),
 * React plante au démontage. Les effets doivent donc toujours avoir un corps entre accolades.
 */
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f: string) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) && !f.endsWith('.test.ts') ? [p] : [];
  });
}

describe('effets React', () => {
  it('aucun effet sans accolades', () => {
    const offenders = files('src').filter((f) => /use(Layout)?Effect\(\(\) => [^{]/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
