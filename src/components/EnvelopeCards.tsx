import { Link } from 'react-router-dom';

/** Une ligne d'une carte : un libellé et un extrait mot pour mot du texte du guide « choisir son enveloppe ». */
export type EnvelopeRow = { label: string; text: string };
export type EnvelopeCard = { name: string; to: string; paragraph: number; rows: EnvelopeRow[] };

/** Les quatre enveloppes de la section « Les grandes différences » : chaque extrait est repris du paragraphe correspondant (testé). */
export const ENVELOPE_CARDS: EnvelopeCard[] = [
  { name: 'PEA', to: '/encyclopedie/pea', paragraph: 0, rows: [
    { label: 'Plafond', text: 'plafond de 150 000 €' },
    { label: 'Disponibilité', text: 'un retrait avant 5 ans entraîne en principe la clôture du plan' },
    { label: 'Fiscalité', text: 'après 5 ans, gains exonérés d’impôt sur le revenu (prélèvements sociaux dus)' },
  ] },
  { name: 'Assurance-vie', to: '/encyclopedie/assurance-vie', paragraph: 1, rows: [
    { label: 'Plafond', text: 'aucun plafond de versement' },
    { label: 'Disponibilité', text: 'rachat possible, les gains retirés étant imposables' },
    { label: 'Fiscalité', text: 'après 8 ans, abattement annuel de 4 600 € (9 200 € pour un couple) sur les gains' },
  ] },
  { name: 'PER', to: '/encyclopedie/per', paragraph: 2, rows: [
    { label: 'Plafond', text: 'déduction limitée par un plafond personnel' },
    { label: 'Disponibilité', text: 'épargne en principe bloquée jusqu’à la retraite, sauf cas de déblocage anticipé' },
    { label: 'Fiscalité', text: 'versements déductibles du revenu imposable avant 70 ans' },
  ] },
  { name: 'Compte-titres', to: '/encyclopedie/compte-titres', paragraph: 3, rows: [
    { label: 'Plafond', text: 'aucune limite de versement' },
    { label: 'Disponibilité', text: 'aucune limite de retrait' },
    { label: 'Fiscalité', text: 'PFU de 31,4 % en 2026 (12,8 % d’impôt et 18,6 % de prélèvements sociaux)' },
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
