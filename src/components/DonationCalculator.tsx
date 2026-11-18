import { useEffect, useRef } from 'react';
import { DONATION_ABATTEMENTS } from '../data/donationAbattements';
import { estimerDonation } from '../lib/calc/donation';
import { fmtEur } from '../lib/calc/format';
import { DONATION_DON_ARGENT } from './schemas/fiches';
import { ChoiceField, NumberField, Takeaway, usePersistentState } from './ui';

type Lien = 'enfant' | 'petit-enfant';

const abattementDe = (lien: Lien) => DONATION_ABATTEMENTS.find((a) => a.lien === (lien === 'enfant' ? 'Enfant' : 'Petit-enfant'))!.montant;

/** Valeurs de départ : celles de l'exemple chiffré de la fiche (appartement de 200 000 € donné à un enfant). */
export const DONATION_CALC_DEFAULT = { montant: 200_000, lien: 'enfant' as Lien, donFamilial: 'non' as 'oui' | 'non' };

/** Phrase « Concrètement » du calcul de la fiche Donation. */
export function donationTakeaway(montant: number, lien: Lien, donFamilial: boolean): string {
  const r = estimerDonation(montant, abattementDe(lien), donFamilial ? DONATION_DON_ARGENT : 0);
  const qui = lien === 'enfant' ? 'votre enfant' : 'votre petit-enfant';
  if (r.montant <= 0) return '';
  if (r.droits === 0) {
    const reste = abattementDe(lien) - r.abattement;
    return `${qui[0].toUpperCase()}${qui.slice(1)} reçoit les ${fmtEur(r.montant)} sans droits à payer.`
      + (reste > 0 ? ` Il vous reste ${fmtEur(reste)} d’abattement pour d’autres dons à cette personne dans les 15 ans.` : '');
  }
  const pct = Math.round(r.tauxMoyen * 1000) / 10;
  return `Sur ${fmtEur(r.montant)} donnés à ${qui}, ${fmtEur(r.sansDroits)} passent sans droits ; les ${fmtEur(r.taxable)} restants sont taxés au barème : ${fmtEur(r.droits)} de droits, soit environ ${pct.toLocaleString('fr-FR')} % de la somme donnée.`;
}

/**
 * Calcul des droits de la fiche Donation, replié sous l'exemple chiffré : mêmes règles et mêmes montants que la fiche
 * (abattements du tableau « En pratique », don familial d'argent, barème en ligne directe). Le bouton « Simuler » de
 * la fiche y mène et l'ouvre.
 */
export function DonationCalculator() {
  const [st, , set] = usePersistentState('donation', DONATION_CALC_DEFAULT);
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const open = () => { if (window.location.hash === '#calcul-donation' && ref.current) ref.current.open = true; };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);
  const fam = st.donFamilial === 'oui';
  const r = estimerDonation(st.montant, abattementDe(st.lien), fam ? DONATION_DON_ARGENT : 0);
  return (
    <details className="fold don-calc" id="calcul-donation" ref={ref}>
      <summary>Calculer avec vos montants</summary>
      <div className="don-calc-body">
        <div className="don-calc-form">
          <NumberField label="Montant donné" value={st.montant} onChange={set('montant')} unit="€" step={5000} min={0} />
          <ChoiceField label="Qui reçoit ?" value={st.lien} onChange={set('lien')} compact
            options={[{ v: 'enfant', label: 'Enfant' }, { v: 'petit-enfant', label: 'Petit-enfant' }]} />
          <ChoiceField label="Don familial d’argent en plus ?" value={st.donFamilial} onChange={set('donFamilial')} compact
            hint={`Oui seulement pour une somme d’argent, si vous avez moins de 80 ans et que la personne est majeure : ${fmtEur(DONATION_DON_ARGENT)} de plus sans droits.`}
            options={[{ v: 'non', label: 'Non' }, { v: 'oui', label: 'Oui' }]} />
        </div>
        <div className="kpis don-calc-kpis">
          <div className="kpi pos"><div className="k-label">Reçu sans droits</div><div className="k-value">{fmtEur(r.sansDroits)}</div></div>
          <div className="kpi"><div className="k-label">Taxé au barème</div><div className="k-value">{fmtEur(r.taxable)}</div></div>
          <div className={'kpi' + (r.droits > 0 ? ' neg' : '')}><div className="k-label">Droits à payer</div><div className="k-value">{fmtEur(r.droits)}</div></div>
        </div>
        <Takeaway>{donationTakeaway(st.montant, st.lien, fam)}</Takeaway>
        <p className="small muted don-calc-note">
          Estimation pour un premier don de cette personne depuis 15 ans, d’un seul donateur : chaque donateur (chaque parent, par exemple) a son propre abattement.
          Hors frais de notaire et cas particuliers (handicap, dons antérieurs). Seul le notaire ou l’administration fiscale fait foi.
        </p>
      </div>
    </details>
  );
}
