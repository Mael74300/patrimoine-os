import { describe, expect, it } from 'vitest';
import { estimerDonation } from './donation';
import { DONATION_ABATTEMENTS } from '../../data/donationAbattements';
import { DONATION_DON_ARGENT } from '../../components/schemas/fiches';
import { DONATION_CALC_DEFAULT, donationTakeaway } from '../../components/DonationCalculator';
import { investmentBySlug } from '../../data/investments';

const enfant = DONATION_ABATTEMENTS.find((a) => a.lien === 'Enfant')!.montant;
const petitEnfant = DONATION_ABATTEMENTS.find((a) => a.lien === 'Petit-enfant')!.montant;
const plain = (s: string) => s.replace(/[  ]/g, ' ');

describe('Calcul des droits de la fiche Donation', () => {
  it('reprend les exemples de Service-Public (F14203, F36656)', () => {
    // 200 000 € d'un parent à son enfant : 100 000 € taxés, 18 194 € de droits.
    const a = estimerDonation(200_000, enfant, 0);
    expect(a).toMatchObject({ abattement: 100_000, sansDroits: 100_000, taxable: 100_000, droits: 18_194 });
    // 100 000 € d'un grand-parent : 68 135 € taxés après l'abattement de 31 865 €.
    expect(estimerDonation(100_000, petitEnfant, 0).taxable).toBe(68_135);
    // Parent de moins de 80 ans, enfant majeur, somme d'argent : 131 865 € sans droits.
    const b = estimerDonation(131_865, enfant, DONATION_DON_ARGENT);
    expect(b).toMatchObject({ donFamilial: 31_865, abattement: 100_000, taxable: 0, droits: 0 });
  });
  it('gère les petits montants, le zéro et les valeurs négatives', () => {
    expect(estimerDonation(20_000, enfant, DONATION_DON_ARGENT)).toMatchObject({ donFamilial: 20_000, abattement: 0, droits: 0 });
    expect(estimerDonation(0, enfant, 0)).toMatchObject({ droits: 0, tauxMoyen: 0 });
    expect(estimerDonation(-5, enfant, 0)).toMatchObject({ montant: 0, droits: 0 });
  });
  it('la valeur de départ est celle de l’exemple chiffré de la fiche, au même montant de droits', () => {
    expect(DONATION_CALC_DEFAULT.montant).toBe(200_000);
    const ex = plain(investmentBySlug['donation']!.example);
    const r = estimerDonation(DONATION_CALC_DEFAULT.montant, enfant, 0);
    expect(ex).toContain(`${r.droits.toLocaleString('fr-FR').replace(/[  ]/g, ' ')} €`);
  });
  it('« Concrètement » dit les droits ou l’abattement restant', () => {
    expect(plain(donationTakeaway(200_000, 'enfant', false))).toContain('18 194 € de droits, soit environ 9,1 % de la somme donnée');
    expect(plain(donationTakeaway(60_000, 'enfant', false))).toContain('Il vous reste 40 000 € d’abattement');
    expect(donationTakeaway(0, 'enfant', false)).toBe('');
  });
});
