import { describe, expect, it } from 'vitest';
import { espacesInsecables } from './lib/typo';

const N = ' ';

describe('espacesInsecables', () => {
  it('rend insécable l’espace avant ? ! ; : »', () => {
    expect(espacesInsecables('Pas sûr ? Oui ! Voir : ceci ; cela »')).toBe(`Pas sûr${N}? Oui${N}! Voir${N}: ceci${N}; cela${N}»`);
  });
  it('rend insécable l’espace après « et entre un chiffre et % ou €', () => {
    expect(espacesInsecables('« bonjour » 3 % de 20 €')).toBe(`«${N}bonjour${N}» 3${N}% de 20${N}€`);
  });
  it('remplace l’apostrophe droite entre deux lettres par l’apostrophe typographique', () => {
    expect(espacesInsecables("l'entreprise d'aujourd'hui")).toBe('l’entreprise d’aujourd’hui');
  });
  it('laisse les apostrophes qui ne sont pas entre deux lettres', () => {
    expect(espacesInsecables("'cité' et 5'30 et x'")).toBe("'cité' et 5'30 et x'");
  });
  it('ne touche pas un texte sans ces cas', () => {
    expect(espacesInsecables('Livret A, 1 000 euros')).toBe('Livret A, 1 000 euros');
  });
});
