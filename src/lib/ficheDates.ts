import type { Investment } from '../data/types';
import { laterRubricUpdate } from './dates';

/** Rubriques datées d'une fiche, avec le nom affiché au lecteur. */
const rubrics = (inv: Investment) => [
  { label: 'frais', checked: inv.fees },
  { label: 'fiscalité', checked: inv.tax },
  { label: 'capital nécessaire', checked: inv.minCapital },
];

/** Rubriques revérifiées après la relecture complète de la fiche (null si aucune). */
export const ficheRubricUpdate = (inv: Investment) => laterRubricUpdate(inv.review.verifiedOn, rubrics(inv));

/** Date de dernière modification réelle d'une fiche : relecture complète ou rubrique revérifiée depuis. */
export const ficheLastUpdate = (inv: Investment) => ficheRubricUpdate(inv)?.date ?? inv.review.verifiedOn;
