import { Link } from 'react-router-dom';
import { capacityAtHcsf, debtRatio, fmtEur, fmtPct, HCSF } from '../lib/finance';
import { debtRatioTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, NumberField, PageHead, SavedSims, Sources, usePersistentState } from '../components/ui';

type State = { income: number; existingPayments: number; newPayment: number; livingCosts: number; householdSize: number; rate: number; years: number; insuranceRate: number };

const DEFAULTS: State = { income: 4000, existingPayments: 300, newPayment: 1000, livingCosts: 1500, householdSize: 2, rate: 0.036, years: 20, insuranceRate: 0.003 };

export default function SimEndettement() {
  const [s, setS, up] = usePersistentState<State>('endettement', DEFAULTS);
  const r = debtRatio(s);
  const cap = capacityAtHcsf(s.income, s.existingPayments, s.rate, s.years, s.insuranceRate);
  const pct = `${HCSF.maxRatio * 100} %`;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Taux d’endettement' }]} />
      <PageHead eyebrow="Simulateur" title="Taux d’endettement et reste à vivre">
        Quelle part de vos revenus part dans les crédits, que reste-t-il pour vivre, et jusqu’à quel montant le repère de {pct} est-il respecté ?
      </PageHead>
      <p className="notice" role="note">
        Le repère de {pct} (assurance comprise, {HCSF.maxYears} ans au plus) est une recommandation du HCSF appliquée par les banques avec une marge de
        dérogation, pas une garantie d’accord ni une capacité d’emprunt personnalisée. Pour la mensualité d’un projet précis, voir le
        {' '}<Link to="/simulateurs/credit">calculateur de crédit</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Situation du foyer</legend>
            <NumberField label="Revenus nets mensuels" unit="€" value={s.income} onChange={up('income')} min={0} step={100} />
            <NumberField label="Mensualités de crédits en cours" unit="€" value={s.existingPayments} onChange={up('existingPayments')} min={0} step={50} />
            <NumberField label="Autres charges courantes mensuelles" unit="€" value={s.livingCosts} onChange={up('livingCosts')} min={0} step={50} hint="Logement hors crédit, énergie, transports, alimentation…" />
            <NumberField label="Personnes dans le foyer" unit="" value={s.householdSize} onChange={up('householdSize')} min={1} max={20} step={1} />
          </fieldset>
          <fieldset>
            <legend>Nouveau crédit</legend>
            <NumberField label="Mensualité, assurance comprise" unit="€" value={s.newPayment} onChange={up('newPayment')} min={0} step={50} />
            <NumberField label="Taux nominal (pour la capacité)" unit="%" percent value={s.rate} onChange={up('rate')} min={0} max={20} step={0.1} hint="Hypothèse modifiable." />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={40} step={1} />
            <NumberField label="Assurance emprunteur (sur capital initial)" unit="%" percent value={s.insuranceRate} onChange={up('insuranceRate')} min={0} max={2} step={0.05} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Taux d’endettement après le projet" value={fmtPct(r.ratioAfter)} sub={r.withinHcsf ? `sous le repère de ${pct}` : `au-dessus du repère de ${pct}`} tone={r.withinHcsf ? undefined : 'neg'} />
            <Kpi label="Reste à vivre par mois" value={fmtEur(r.remainingAfter)} sub={`soit ${fmtEur(r.remainingPerPerson)} par personne`} tone={r.remainingAfter < 0 ? 'neg' : undefined} />
            <Kpi label={`Mensualité maximale à ${pct}`} value={fmtEur(r.maxNewPayment)} sub={`taux actuel hors projet : ${fmtPct(r.ratioBefore)}`} />
          </div>
          <Takeaway>{debtRatioTakeaway({ income: s.income, ratioAfter: r.ratioAfter, remainingAfter: r.remainingAfter, withinRef: r.withinHcsf, refLabel: pct })}</Takeaway>
          <h2>Repères</h2>
          <div className="table-wrap">
            <table>
              <tbody>
                <tr><th scope="row">Revenu net minimal pour la mensualité saisie</th><td className="r">{fmtEur(r.minIncome)}</td></tr>
                <tr><th scope="row">Capital empruntable à {pct} (taux, durée et assurance ci-contre)</th><td className="r">{fmtEur(cap)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Taux d’endettement = (crédits en cours + nouvelle mensualité) / revenus nets. Le reste à vivre dépend de vos charges réelles ; il n’existe pas de seuil
            officiel unique, et les banques apprécient aussi l’apport, la stabilité des revenus et l’épargne. Pour constituer une réserve avant d’emprunter, voir le
            {' '}<Link to="/simulateurs/epargne-de-precaution">simulateur d’épargne de précaution</Link> ; pour répartir votre budget, le <Link to="/simulateurs/budget">simulateur de budget</Link>.
            Repère vérifié le {HCSF.verifiedOn}.
          </p>
          <h2>Source</h2>
          <Sources list={[{ ...HCSF.source, official: true }]} />
          <SavedSims simKey="endettement" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <SimFaq slug="endettement" />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
        </section>
      </div>
    </>
  );
}
