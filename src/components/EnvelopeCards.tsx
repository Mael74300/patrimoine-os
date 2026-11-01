import { Link } from 'react-router-dom';

/** Une ligne d'une carte : un libellé et un extrait mot pour mot du texte du guide « choisir son enveloppe ». */
export type EnvelopeRow = { label: string; text: string };
export type EnvelopeCard = { name: string; to: string; paragraph: number; rows: EnvelopeRow[] };

/** Les quatre enveloppes de la section « Les grandes différences » : chaque extrait est repris du paragraphe correspondant (testé). */
export const ENVELOPE_CARDS: EnvelopeCard[] = [
  { name: 'PEA', to: '/encyclopedie/pea', paragraph: 0, rows: [
    { label: 'Placements', text: 'actions européennes' },
    { label: 'Plafond', text: 'plafond de 150 000 €' },
    { label: 'Fiscalité', text: 'exonération d’impôt sur le revenu après 5 ans (prélèvements sociaux dus)' },
  ] },
  { name: 'Assurance-vie', to: '/encyclopedie/assurance-vie', paragraph: 1, rows: [
    { label: 'Placements', text: 'supports variés' },
    { label: 'Fiscalité', text: 'fiscalité allégée après 8 ans' },
    { label: 'Transmission', text: 'avantages successoraux' },
  ] },
  { name: 'PER', to: '/encyclopedie/per', paragraph: 2, rows: [
    { label: 'Fiscalité', text: 'versements déductibles' },
    { label: 'Disponibilité', text: 'argent bloqué jusqu’à la retraite, sauf exceptions' },
  ] },
  { name: 'Compte-titres', to: '/encyclopedie/compte-titres', paragraph: 3, rows: [
    { label: 'Plafond', text: 'aucune limite' },
    { label: 'Fiscalité', text: 'fiscalité standard (PFU de 31,4 % en 2026)' },
  ] },
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Comparaison des enveloppes en quatre cartes, à la place de quatre paragraphes denses. */
export function EnvelopeCards() {
  return (
    <ul className="env-cards">
      {ENVELOPE_CARDS.map((c) => (
        <li key={c.name} className="env-card">
          <h3><Link to={c.to}>{c.name}</Link></h3>
          <dl>
            {c.rows.map((r) => (
              <div key={r.label}><dt>{r.label}</dt><dd>{cap(r.text)}</dd></div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}
