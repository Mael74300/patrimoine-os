import { Link } from 'react-router-dom';
import { LIVRETS, LIVRETS_AS_OF, LIVRETS_PERIOD } from '../data/livrets';
import { fmtEur, fmtPct } from '../lib/finance';

/**
 * Les trois livrets réglementés dans l'ordre de remplissage habituel (du mieux rémunéré au moins rémunéré),
 * avec leur taux et leur plafond de dépôt. Chiffres tirés de `src/data/livrets.ts` : une seule source pour
 * le guide, le simulateur d'épargne de précaution et les fiches.
 */
export function LivretsTable() {
  return (
    <div className="table-wrap facts-table">
      <table>
        <caption>Les trois livrets, dans l’ordre où on les remplit</caption>
        <thead><tr><th scope="col">Livret</th><th scope="col" className="r">Taux</th><th scope="col" className="r">Plafond</th></tr></thead>
        <tbody>
          {LIVRETS.map((l, i) => (
            <tr key={l.id}>
              <th scope="row">
                {i + 1}. <Link to={`/encyclopedie/${l.slug}`}>{l.id === 'lep' ? 'LEP' : l.id === 'livretA' ? 'Livret A' : 'LDDS'}</Link>
                {l.id === 'lep' && <span className="facts-table-note">sous conditions de revenus</span>}
              </th>
              <td className="r">{fmtPct(l.rate)}</td>
              <td className="r">{fmtEur(l.cap)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="facts-table-foot">Taux annuels au {LIVRETS_AS_OF}, fixés pour la période {LIVRETS_PERIOD} ; ils changent à chaque révision. Plafond : le montant maximum que l’on peut y verser.</p>
    </div>
  );
}
