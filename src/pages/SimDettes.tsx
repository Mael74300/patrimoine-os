import { Link } from 'react-router-dom';
import { comparePayoff, fmtEur, fmtMonths, fmtPct, payoffTimeline, type Debt, type PayoffBar } from '../lib/finance';
import { debtsTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice } from '../components/ui';

type State = {
  b1: number; r1: number; m1: number;
  b2: number; r2: number; m2: number;
  b3: number; r3: number; m3: number;
  extra: number;
};

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { b1: 2000, r1: 0.2, m1: 60, b2: 6000, r2: 0.05, m2: 150, b3: 1000, r3: 0.03, m3: 50, extra: 100 };

const fmtDuration = (months: number | null) => (months === null ? 'plus de 50\u00a0ans' : fmtMonths(months));

const DEBT_TONES = ['pt-1', 'pt-2', 'pt-3'];

/** Frise : une barre par dette, du mois 1 au mois où elle est soldée, dans l’ordre de remboursement. */
function PayoffTrack({ title, hint, bars, debts }: { title: string; hint: string; bars: PayoffBar[]; debts: Debt[] }) {
  return (
    <div className="pt-group">
      <h3 className="pt-title">{title} <span>· {hint}</span></h3>
      <ol className="pt-list">
        {bars.map((b) => {
          const d = debts[b.index];
          const when = b.months === null ? 'pas soldée en 50\u00a0ans' : fmtMonths(b.months);
          return (
            <li key={b.index} className="pt-row">
              <div className="pt-head">
                <span className="pt-name"><i className={'pt-dot ' + DEBT_TONES[b.index]} aria-hidden="true" />{d.name}<span className="pt-meta"> · {fmtEur(d.balance)} à {fmtPct(d.rate)}</span></span>
                <span className="pt-when">{when}</span>
              </div>
              <div className="pt-track" aria-hidden="true">
                <span className={'pt-bar ' + (b.months === null ? 'pt-open' : DEBT_TONES[b.index])} style={{ width: `${Math.max(b.width, 2)}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function SimDettes() {
  const [s, setS, up] = usePersistentState<State>('dettes', DEFAULTS);
  const debts: Debt[] = [
    { name: 'Dette 1', balance: s.b1, rate: s.r1, minPayment: s.m1 },
    { name: 'Dette 2', balance: s.b2, rate: s.r2, minPayment: s.m2 },
    { name: 'Dette 3', balance: s.b3, rate: s.r3, minPayment: s.m3 },
  ];
  const c = comparePayoff(debts, s.extra);
  const t = payoffTimeline(debts, c);
  const rows = [
    { label: 'Sans versement en plus', r: c.minimum },
    { label: 'Avalanche', r: c.avalanche },
    { label: 'Boule de neige', r: c.snowball },
  ];

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Rembourser plusieurs dettes' }]} />
      <PageHead eyebrow="Simulateur" title="Rembourser plusieurs dettes : avalanche ou boule de neige">
        Compare deux ordres de remboursement pour un même budget : le taux le plus élevé d’abord (avalanche) ou le plus petit solde d’abord (boule de neige).
      </PageHead>
      <SimNotice>
        Résultat entièrement fondé sur les soldes, taux et mensualités que vous saisissez ; aucun chiffre réglementaire. Vérifiez sur vos contrats les éventuelles indemnités de
        remboursement anticipé. Pour le détail d’un prêt, voir le <Link to="/simulateurs/credit">calculateur de crédit</Link> ; pour votre capacité de remboursement,
        le <Link to="/simulateurs/budget">budget</Link> et le <Link to="/simulateurs/endettement">taux d’endettement</Link>.
      </SimNotice>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Dette 1</legend>
            <NumberField label="Solde restant dû (dette 1)" unit="€" value={s.b1} onChange={up('b1')} min={0} step={100} />
            <NumberField label="Taux annuel (dette 1)" unit="%" percent value={s.r1} onChange={up('r1')} min={0} max={100} step={0.1} />
            <NumberField label="Mensualité minimale (dette 1)" unit="€" value={s.m1} onChange={up('m1')} min={0} step={10} />
          </fieldset>
          <fieldset>
            <legend>Dette 2</legend>
            <NumberField label="Solde restant dû (dette 2)" unit="€" value={s.b2} onChange={up('b2')} min={0} step={100} />
            <NumberField label="Taux annuel (dette 2)" unit="%" percent value={s.r2} onChange={up('r2')} min={0} max={100} step={0.1} />
            <NumberField label="Mensualité minimale (dette 2)" unit="€" value={s.m2} onChange={up('m2')} min={0} step={10} />
          </fieldset>
          <fieldset>
            <legend>Dette 3</legend>
            <NumberField label="Solde restant dû (dette 3)" unit="€" value={s.b3} onChange={up('b3')} min={0} step={100} />
            <NumberField label="Taux annuel (dette 3)" unit="%" percent value={s.r3} onChange={up('r3')} min={0} max={100} step={0.1} />
            <NumberField label="Mensualité minimale (dette 3)" unit="€" value={s.m3} onChange={up('m3')} min={0} step={10} />
          </fieldset>
          <fieldset>
            <legend>Budget</legend>
            <NumberField label="Versement supplémentaire par mois" unit="€" value={s.extra} onChange={up('extra')} min={0} step={10} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Durée avec l’avalanche" value={fmtDuration(c.avalanche.months)} sub={`intérêts ${fmtEur(c.avalanche.totalInterest)}`} />
            <Kpi label="Durée avec la boule de neige" value={fmtDuration(c.snowball.months)} sub={`intérêts ${fmtEur(c.snowball.totalInterest)}`} />
            <Kpi
              label="Intérêts évités par l’avalanche"
              value={c.interestSavedByAvalanche === null ? '—' : fmtEur(c.interestSavedByAvalanche)}
              sub="par rapport à la boule de neige, même budget"
            />
          </div>
          <Takeaway>{debtsTakeaway({ extra: s.extra, minimum: c.minimum, avalanche: c.avalanche, snowball: c.snowball, interestSavedByAvalanche: c.interestSavedByAvalanche })}</Takeaway>
          <h2>Comparaison des trois approches</h2>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th scope="col">Approche</th><th scope="col" className="r">Durée</th><th scope="col" className="r">Intérêts</th><th scope="col" className="r">Total payé</th></tr></thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.label}><th scope="row">{x.label}</th><td className="r">{fmtDuration(x.r.months)}</td><td className="r">{fmtEur(x.r.totalInterest)}</td><td className="r">{fmtEur(x.r.totalPaid)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>Quand chaque dette est soldée</h2>
          <p className="pt-intro">Chaque barre s’arrête le mois où la dette est entièrement remboursée.</p>
          <figure className="pt">
            <PayoffTrack title="Avalanche" hint="taux le plus élevé d’abord" bars={t.avalanche} debts={debts} />
            <PayoffTrack title="Boule de neige" hint="plus petit solde d’abord" bars={t.snowball} debts={debts} />
          </figure>
          <p className="muted small">
            Même budget pour les deux méthodes (détails dans les questions fréquentes). Une mensualité inférieure aux intérêts du mois ne solde jamais la dette.
            Les exemples ci-dessus sont fictifs. Voir aussi <Link to="/simulateurs/rembourser-ou-investir">rembourser ou investir</Link>.
          </p>
          <SavedSims simKey="dettes" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="dettes" />
        </section>
      </div>
    </>
  );
}
