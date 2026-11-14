import { Link } from 'react-router-dom';
import { keepNumbersTogether } from '../lib/nbsp';

/** Une ligne d'une carte : un libellé et un extrait mot pour mot du texte du guide « choisir son enveloppe ». */
export type EnvelopeRow = { label: string; text: string };
export type EnvelopeCard = { name: string; to: string; paragraph: number; use: string; rows: EnvelopeRow[] };

/**
 * Les quatre enveloppes de la section « Les grandes différences » : l'usage courant (« pour … ») puis trois repères
 * (versements, retraits, impôts) en mots simples. Chaque extrait est repris du paragraphe correspondant (testé).
 */
export const ENVELOPE_CARDS: EnvelopeCard[] = [
  { name: 'PEA', to: '/encyclopedie/pea', paragraph: 0, use: 'pour garder longtemps des actions d’entreprises européennes', rows: [
    { label: 'Versements', text: 'jusqu’à 150 000 €' },
    { label: 'Retraits', text: 'un retrait avant 5 ans ferme en principe le plan' },
    { label: 'Impôts', text: 'après 5 ans, pas d’impôt sur le revenu sur les gains (prélèvements sociaux dus)' },
  ] },
  { name: 'Assurance-vie', to: '/encyclopedie/assurance-vie', paragraph: 1, use: 'pour diversifier son épargne et la transmettre', rows: [
    { label: 'Versements', text: 'aucun plafond' },
    { label: 'Retraits', text: 'possibles, en tout ou en partie (on parle de « rachat ») ; les gains retirés sont imposables' },
    { label: 'Impôts', text: 'après 8 ans, abattement annuel de 4 600 € (9 200 € pour un couple) sur les gains ; prélèvements sociaux dus' },
  ] },
  { name: 'PER', to: '/encyclopedie/per', paragraph: 2, use: 'pour préparer sa retraite en réduisant ses impôts, surtout dans une tranche d’imposition élevée', rows: [
    { label: 'Versements', text: 'aucun plafond, mais la déduction fiscale est plafonnée' },
    { label: 'Retraits', text: 'argent bloqué jusqu’à la retraite, sauf déblocage anticipé (achat de la résidence principale, « accident de la vie »)' },
    { label: 'Impôts', text: 'versements déductibles du revenu imposable avant 70 ans ; ce qui a été déduit est imposé à la sortie' },
  ] },
  { name: 'Compte-titres', to: '/encyclopedie/compte-titres', paragraph: 3, use: 'pour placer sans plafond, partout dans le monde, avec une fiscalité standard', rows: [
    { label: 'Versements', text: 'aucune limite' },
    { label: 'Retraits', text: 'aucune limite' },
    { label: 'Impôts', text: 'prélèvement forfaitaire unique (PFU, ou « flat tax ») de 31,4 % en 2026 (12,8 % d’impôt et 18,6 % de prélèvements sociaux)' },
  ] },
];

/** Le paragraphe du guide qui correspond à une carte (même texte, pour la recherche et les lecteurs sans mise en forme). */
export const envelopeParagraph = (c: EnvelopeCard) =>
  `${c.name} : ${c.use}. ${c.rows.map((r) => `${r.label} : ${r.text}.`).join(' ')}`;

/** Majuscule initiale, nombres collés à leur unité (« 150 000 € » ne se coupe pas). */
const cap = (s: string) => keepNumbersTogether(s.charAt(0).toUpperCase() + s.slice(1));

/** Comparaison des enveloppes en quatre cartes, à la place de quatre paragraphes denses. */
export function EnvelopeCards() {
  return (
    <ul className="env-cards">
      {ENVELOPE_CARDS.map((c) => (
        <li key={c.name} className="env-card">
          <h3><Link to={c.to}>{c.name}</Link></h3>
          <p className="env-card-use">{cap(c.use)}</p>
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
