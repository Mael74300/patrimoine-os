import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fmtEur, fmtEur2, fmtMonths, fmtNum, fmtPct, fmtPts, inFine, loanDuration, loanDurationBars, renegotiation, type LoanDurationRow, renegotiationBars, taeg, taegByFees, taegByInsurance } from '../lib/finance';
import { loanDurationTakeaway, taegTakeaway, inFineTakeaway, renegoTakeaway } from '../lib/takeaways';
import { comparerCreditsFaq } from '../data/simFaq';
import { Crumbs, Disclaimer, Fold, SimFaq, Takeaway, Kpi, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults } from '../components/ui';

// Exemples fictifs : toutes les valeurs par défaut sont des hypothèses à remplacer par les vôtres.

const TABS = [
  { id: 'duree', label: 'Quelle durée ?' },
  { id: 'taeg', label: 'Quel TAEG ?' },
  { id: 'infine', label: 'In fine ou amortissable' },
  { id: 'renegocier', label: 'Renégocier mon prêt' },
] as const;
type TabId = (typeof TABS)[number]['id'];

function Layout({ form, children, reset }: { form: ReactNode; children: ReactNode; reset: () => void }) {
  return (
    <div className="sim" style={{ marginTop: 16 }}>
      <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
        {form}
        <button type="button" className="btn small secondary" onClick={reset}>Réinitialiser</button>
        <JumpToResults />
      </form>
      <section id="resultats" aria-label="Résultats" tabIndex={-1}>{children}</section>
    </div>
  );
}

/* ---------- Durée du crédit : mensualité et coût total */
type DureeState = { principal: number; annualRate: number; insuranceRate: number };
const DUREE: DureeState = { principal: 200000, annualRate: 0.03, insuranceRate: 0.003 };
const DURATIONS = [10, 15, 20, 25, 30];

/** Pour chaque durée, deux barres : la mensualité (plus courte quand on allonge) et le coût total (plus long), chacune sur sa propre échelle. */
function DurationBars({ rows }: { rows: LoanDurationRow[] }) {
  const bars = loanDurationBars(rows);
  if (!rows.some((r) => r.monthlyTotal > 0)) return null;
  const hasInsurance = rows.some((r) => r.totalCost - r.totalInterest > 0.5);
  return (
    <>
      <h2>Mensualité et coût selon la durée</h2>
      <figure className="fb ld">
        <ul className="fb-legend" aria-hidden="true">
          <li><i className="ld-month" />Mensualité{hasInsurance ? ', assurance comprise' : ''}</li>
          <li><i className="rb-int" />Intérêts</li>
          {hasInsurance && <li><i className="ld-ins" />Assurance</li>}
        </ul>
        <ul className="fb-list">
          {rows.map((r, i) => (
            <li className="fb-row ld-row" key={r.years}>
              <span className="fb-name ld-years">{r.years}&nbsp;ans</span>
              <div className="ld-line">
                <div className="fb-track" aria-hidden="true"><span className="ld-month" style={{ width: `${bars[i].monthly}%` }} /></div>
                <span className="ld-value"><strong>{fmtEur(r.monthlyTotal)}</strong> par mois</span>
              </div>
              <div className="ld-line">
                <div className="fb-track" aria-hidden="true">
                  <span className="rb-int" style={{ width: `${bars[i].interest}%` }} />
                  {bars[i].insurance > 0 && <span className="ld-ins" style={{ width: `${bars[i].insurance}%` }} />}
                </div>
                <span className="ld-value"><strong>{fmtEur(r.totalCost)}</strong> de coût</span>
              </div>
            </li>
          ))}
        </ul>
        <figcaption className="fb-sub ld-caption">
          Barre foncée : ce que vous payez chaque mois. Barre plus claire : ce que le crédit coûte en plus du capital emprunté{hasInsurance ? ' (intérêts et assurance)' : ' (intérêts)'}.
          Plus le crédit est long, plus le capital est remboursé lentement : les intérêts courent plus longtemps. Montants par défaut fictifs ; calcul détaillé sur la page <Link to="/methodologie">Méthode</Link>.
        </figcaption>
      </figure>
    </>
  );
}

function Duree() {
  const [s, setS, up] = usePersistentState<DureeState>('duree-credit', DUREE);
  const rows = loanDuration({ ...s, durations: DURATIONS });
  const shortest = rows[0];
  const longest = rows[rows.length - 1];
  return (
    <>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez (taux fixe, assurance calculée sur le capital initial), sans chiffre réglementaire. Pour le détail
        d’un crédit, voir le <Link to="/simulateurs/credit">calculateur de crédit</Link>.
      </p>
      <Layout
        reset={() => setS(DUREE)}
        form={(
          <fieldset>
            <legend>Votre crédit</legend>
            <NumberField label="Capital emprunté" unit="€" value={s.principal} onChange={up('principal')} min={0} max={5000000} step={1000} />
            <NumberField label="Taux nominal annuel" unit="%" percent value={s.annualRate} onChange={up('annualRate')} step={0.05} min={0} max={20} />
            <NumberField label="Assurance emprunteur" unit="%" percent value={s.insuranceRate} onChange={up('insuranceRate')} step={0.05} min={0} max={2} />
          </fieldset>
        )}
      >
        <div className="kpis">
          <Kpi label={`Mensualité sur ${shortest.years}\u00a0ans`} value={fmtEur2(shortest.monthlyTotal)} sub="assurance comprise" />
          <Kpi label={`Mensualité sur ${longest.years}\u00a0ans`} value={fmtEur2(longest.monthlyTotal)} sub="assurance comprise" />
          <Kpi label={`Coût total sur ${shortest.years}\u00a0ans`} value={fmtEur(shortest.totalCost)} sub="intérêts + assurance" />
          <Kpi label={`Coût total sur ${longest.years}\u00a0ans`} value={fmtEur(longest.totalCost)} sub={`${fmtEur(longest.totalCost - shortest.totalCost)} de plus`} />
        </div>
        <Takeaway>{loanDurationTakeaway({ principal: s.principal, shortYears: shortest.years, longYears: longest.years, shortMonthly: shortest.monthlyTotal, longMonthly: longest.monthlyTotal, shortCost: shortest.totalCost, longCost: longest.totalCost })}</Takeaway>
        <DurationBars rows={rows} />
        <Fold title="Voir le détail en tableau (mensualité hors assurance, intérêts)">
          <div className="table-wrap stack-wrap">
            <table className="stack-table">
              <caption className="sr-only">Mensualité, intérêts et coût total selon la durée du crédit</caption>
              <thead><tr><th>Durée</th><th className="r">Mensualité (hors assurance)</th><th className="r">Mensualité (assurance comprise)</th><th className="r">Intérêts</th><th className="r">Coût total</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.years}>
                    <td className="st-name">{r.years}&nbsp;ans</td>
                    <td data-label="Mensualité (hors assurance)" className="r">{fmtEur2(r.monthlyPayment)}</td>
                    <td data-label="Mensualité (assurance comprise)" className="r">{fmtEur2(r.monthlyTotal)}</td>
                    <td data-label="Intérêts" className="r">{fmtEur(r.totalInterest)}</td>
                    <td data-label="Coût total" className="r">{fmtEur(r.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fold>
        <SavedSims simKey="duree-credit" current={s} onLoad={(d) => setS({ ...DUREE, ...d })} />
      </Layout>
    </>
  );
}

/* ---------- TAEG : taux, assurance et frais */
type TaegState = { principal: number; annualRate: number; years: number; insuranceRate: number; fees: number };
const TAEG: TaegState = { principal: 200000, annualRate: 0.036, years: 20, insuranceRate: 0.003, fees: 2500 };

function Taeg() {
  const [s, setS, up] = usePersistentState<TaegState>('taeg', TAEG);
  const r = taeg(s);
  const byFees = taegByFees(s, [0, 1000, 2500, 5000]);
  const byIns = taegByInsurance(s, [0, 0.001, 0.003, 0.005]);
  return (
    <>
      <p className="notice" role="note">
        Le TAEG calculé ici est une estimation pédagogique à partir des éléments saisis (échéances constantes, frais payés à la signature, assurance sur le capital initial).
        Seul le TAEG figurant sur l’offre de prêt de la banque fait foi. Pour l’échéancier complet, voir le <Link to="/simulateurs/credit">calculateur de crédit</Link>
        {' '}; pour vérifier que la mensualité reste supportable, le <Link to="/simulateurs/endettement">taux d’endettement</Link>.
      </p>
      <Layout
        reset={() => setS(TAEG)}
        form={(
          <fieldset>
            <legend>L’offre de prêt</legend>
            <NumberField label="Capital emprunté" unit="€" value={s.principal} onChange={up('principal')} min={0} step={5000} />
            <NumberField label="Taux nominal annuel" unit="%" percent value={s.annualRate} onChange={up('annualRate')} min={0} max={20} step={0.05} />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={0} max={50} step={1} />
            <NumberField label="Assurance emprunteur (taux annuel sur le capital initial)" unit="%" percent value={s.insuranceRate} onChange={up('insuranceRate')} min={0} max={10} step={0.05} />
            <NumberField label="Frais de dossier, garantie et autres frais payés au départ" unit="€" value={s.fees} onChange={up('fees')} min={0} step={100} />
          </fieldset>
        )}
      >
        <div className="kpis">
          <Kpi label="TAEG estimé" value={fmtPct(r.taeg)} sub={`contre ${fmtPct(s.annualRate)} de taux nominal (écart de ${fmtPts(r.gap)})`} />
          <Kpi label="Mensualité assurance comprise" value={fmtEur(r.monthlyTotal)} sub={`dont ${fmtEur(r.monthlyInsurance)} d’assurance, sur ${r.months}\u00a0mois`} />
          <Kpi label="Coût total du crédit" value={fmtEur(r.totalCost)} sub={`intérêts ${fmtEur(r.totalInterest)} + assurance ${fmtEur(r.totalInsurance)} + frais ${fmtEur(Math.min(s.fees, s.principal))}`} />
        </div>
        <Takeaway>{taegTakeaway({ principal: s.principal, nominal: s.annualRate, taeg: r.taeg, totalCost: r.totalCost })}</Takeaway>
        <h2>Effet des frais payés au départ</h2>
        <div className="table-wrap" tabIndex={0}>
          <table>
            <thead><tr><th scope="col">Frais au départ</th><th scope="col" className="r">TAEG</th></tr></thead>
            <tbody>
              {byFees.map((d) => (
                <tr key={d.fees}><th scope="row">{fmtEur(d.fees)}</th><td className="r">{fmtPct(d.taeg)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>Effet de l’assurance</h2>
        <div className="table-wrap" tabIndex={0}>
          <table>
            <thead><tr><th scope="col">Assurance (taux annuel)</th><th scope="col" className="r">TAEG</th></tr></thead>
            <tbody>
              {byIns.map((d) => (
                <tr key={d.insuranceRate}><th scope="row">{fmtPct(d.insuranceRate)}</th><td className="r">{fmtPct(d.taeg)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          Le TAEG est exprimé en taux annuel effectif : il se compare directement d’une offre à l’autre, à durée comparable. Les exemples ci-dessus sont fictifs.
          Pour juger de l’intérêt de rembourser un crédit plutôt que d’investir, voir <Link to="/simulateurs/rembourser-ou-investir">rembourser ou investir</Link>.
        </p>
        <SavedSims simKey="taeg" current={s} onLoad={(d) => setS({ ...TAEG, ...d })} />
      </Layout>
    </>
  );
}

/* ---------- Crédit in fine ou amortissable */
type InFineState = { principal: number; annualRate: number; years: number; insuranceRate: number; savingsReturn: number };
const IN_FINE: InFineState = { principal: 200000, annualRate: 0.03, years: 20, insuranceRate: 0.003, savingsReturn: 0.02 };

function InFine() {
  const [s, setS, up] = usePersistentState<InFineState>('credit-in-fine', IN_FINE);
  const r = inFine(s);
  return (
    <>
      <p className="notice" role="note">
        Dans un crédit in fine, on ne paie que les intérêts pendant la durée et on rembourse le capital d’un coup à la fin, avec une épargne constituée à côté.
        Calcul fondé uniquement sur les hypothèses que vous saisissez (taux fixe, assurance sur le capital initial, rendement net constant de l’épargne), sans chiffre
        réglementaire ni fiscalité. Pour un crédit classique, voir le <Link to="/simulateurs/credit">calculateur de crédit</Link>.
      </p>
      <Layout
        reset={() => setS(IN_FINE)}
        form={(
          <>
            <fieldset>
              <legend>Le crédit</legend>
              <NumberField label="Capital emprunté" unit="€" value={s.principal} onChange={up('principal')} min={0} max={5000000} step={1000} />
              <NumberField label="Taux nominal annuel" unit="%" percent value={s.annualRate} onChange={up('annualRate')} step={0.05} min={0} max={20} />
              <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={50} step={1} />
              <NumberField label="Assurance emprunteur" unit="%" percent value={s.insuranceRate} onChange={up('insuranceRate')} step={0.05} min={0} max={2} />
            </fieldset>
            <fieldset>
              <legend>L’épargne qui reconstitue le capital</legend>
              <NumberField label="Rendement annuel net supposé" unit="%" percent value={s.savingsReturn} onChange={up('savingsReturn')} step={0.1} min={-50} max={100} />
            </fieldset>
          </>
        )}
      >
        <div className="kpis">
          <Kpi label="Sortie mensuelle, amortissable" value={fmtEur2(r.amortizingMonthlyTotal)} sub="mensualité + assurance" />
          <Kpi label="Sortie mensuelle, in fine" value={fmtEur2(r.inFineMonthlyTotal)} sub={`dont ${fmtEur2(r.monthlySaving)} d’épargne`} />
          <Kpi label="Coût net, amortissable" value={fmtEur(r.amortizingCost)} sub="intérêts + assurance" />
          <Kpi label="Coût net, in fine" value={fmtEur(r.inFineNetCost)} sub={r.netCostGap >= 0 ? `${fmtEur(r.netCostGap)} de plus` : `${fmtEur(-r.netCostGap)} de moins`} />
        </div>
        <Takeaway>{inFineTakeaway({ principal: s.principal, years: s.years, savingsReturn: s.savingsReturn, annualRate: s.annualRate, amortizingMonthly: r.amortizingMonthlyTotal, inFineMonthly: r.inFineMonthlyTotal, monthlySaving: r.monthlySaving, netCostGap: r.netCostGap })}</Takeaway>
        <h2>Comparaison sur {r.months / 12}&nbsp;ans</h2>
        <div className="table-wrap" tabIndex={0}>
          <table>
            <thead><tr><th>Poste</th><th className="r">Amortissable</th><th className="r">In fine</th></tr></thead>
            <tbody>
              <tr><td>Intérêts + assurance</td><td className="r">{fmtEur(r.amortizingCost)}</td><td className="r">{fmtEur(r.inFineCost)}</td></tr>
              <tr><td>Moins les gains de l’épargne</td><td className="r">—</td><td className="r">− {fmtEur(r.savingsGain)}</td></tr>
              <tr><td>Coût net</td><td className="r">{fmtEur(r.amortizingCost)}</td><td className="r">{fmtEur(r.inFineNetCost)}</td></tr>
            </tbody>
          </table>
        </div>
        <p className="muted small">
          En in fine, le capital dû ne baisse jamais : chaque mois, vous payez les intérêts sur la totalité de la somme empruntée, et vous mettez de côté le montant qui, avec ses gains,
          reconstitue le capital à la fin. Si l’épargne rapporte moins que le taux du crédit, l’in fine coûte plus cher ; sinon, il coûte moins, sans garantie de rendement.
          Les montants par défaut sont fictifs ; le détail du calcul est sur la page <Link to="/methodologie">Méthode</Link>.
        </p>
        <SavedSims simKey="credit-in-fine" current={s} onLoad={(d) => setS({ ...IN_FINE, ...d })} />
      </Layout>
    </>
  );
}

/* ---------- Renégocier ou racheter son crédit */
/** Deux barres sur la même échelle : ce qu'il reste à payer en gardant le prêt, ou en renégociant (nouveaux intérêts + frais). L'écart est le gain net. */
function RenegoBars({ r, fees }: { r: ReturnType<typeof renegotiation>; fees: number }) {
  const b = renegotiationBars(r, fees);
  if (b.current === 0 && b.newInterest === 0 && b.fees === 0) return null;
  const costNew = r.newInterest + Math.max(0, fees);
  const win = r.netGain > 0.5;
  const lose = r.netGain < -0.5;
  return (
    <>
      <h2>Ce qu’il reste à payer</h2>
      <figure className="fb rb">
        <ul className="fb-legend" aria-hidden="true">
          <li><i className="rb-int" />Intérêts</li>
          {fees > 0.5 && <li><i className="rb-fees" />Frais de l’opération</li>}
          {win && <li><i className="rb-saved" />Économisé</li>}
        </ul>
        <ul className="fb-list">
          <li className="fb-row">
            <div className="fb-head"><span className="fb-name">Garder le prêt actuel</span><span className="fb-value">{fmtEur(r.currentRemainingInterest)}</span></div>
            <div className="fb-track" aria-hidden="true"><span className="rb-int" style={{ width: `${b.current}%` }} /></div>
            <p className="fb-sub">intérêts restants jusqu’à la fin</p>
          </li>
          <li className="fb-row">
            <div className="fb-head"><span className="fb-name">Renégocier</span><span className="fb-value">{fmtEur(costNew)}</span></div>
            <div className="fb-track" aria-hidden="true">
              <span className="rb-int" style={{ width: `${b.newInterest}%` }} />
              {b.fees > 0 && <span className="rb-fees" style={{ width: `${b.fees}%` }} />}
              {b.saved > 0 && <span className="rb-saved" style={{ width: `${b.saved}%` }} />}
            </div>
            <p className="fb-sub">nouveaux intérêts {fmtEur(r.newInterest)}{fees > 0.5 ? ` + frais ${fmtEur(fees)}` : ''}</p>
          </li>
        </ul>
        <figcaption className={'rb-total' + (lose ? ' rb-lose' : '')}>
          {win && <>Écart : <strong>{fmtEur(r.netGain)}</strong> de moins à payer en renégociant, c’est le gain net.</>}
          {lose && <>Écart : <strong>{fmtEur(-r.netGain)}</strong> de plus à payer en renégociant : l’opération coûte plus qu’elle ne rapporte.</>}
          {!win && !lose && <>Les deux options coûtent à peu près la même chose : aucun gain net.</>}
        </figcaption>
      </figure>
    </>
  );
}
type RenegoState = { remaining: number; currentRate: number; currentYearsLeft: number; newRate: number; newYears: number; fees: number };
const RENEGO: RenegoState = { remaining: 150000, currentRate: 4.5, currentYearsLeft: 20, newRate: 3.5, newYears: 20, fees: 3000 };

function Renegocier() {
  const [s, setS, up] = usePersistentState<RenegoState>('renegociation', RENEGO);
  const r = renegotiation({ ...s, currentRate: s.currentRate / 100, newRate: s.newRate / 100 });
  return (
    <>
      <p className="notice" role="note">
        Les frais (dossier, garantie, indemnités éventuelles) sont à relever sur vos documents et sur l’offre reçue. L’assurance n’est pas incluse.
        Voir aussi le <Link to="/simulateurs/credit">simulateur de crédit</Link>.
      </p>
      <Layout
        reset={() => setS(RENEGO)}
        form={(
          <>
            <fieldset>
              <legend>Prêt actuel</legend>
              <NumberField label="Capital restant dû" unit="€" value={s.remaining} onChange={up('remaining')} min={0} step={1000} />
              <NumberField label="Taux nominal actuel" unit="%" value={s.currentRate} onChange={up('currentRate')} min={0} max={20} step={0.05} />
              <NumberField label="Durée restante" unit="ans" value={s.currentYearsLeft} onChange={up('currentYearsLeft')} min={0} max={50} step={1} />
            </fieldset>
            <fieldset>
              <legend>Nouveau prêt</legend>
              <NumberField label="Nouveau taux nominal" unit="%" value={s.newRate} onChange={up('newRate')} min={0} max={20} step={0.05} />
              <NumberField label="Durée du nouveau prêt" unit="ans" value={s.newYears} onChange={up('newYears')} min={0} max={50} step={1} />
              <NumberField label="Frais ponctuels de l’opération" unit="€" value={s.fees} onChange={up('fees')} min={0} step={100} />
            </fieldset>
          </>
        )}
      >
        <div className="kpis">
          <Kpi label="Mensualité actuelle" value={fmtEur(r.currentMonthly)} sub="hors assurance" />
          <Kpi label="Nouvelle mensualité" value={fmtEur(r.newMonthly)} sub={`${r.monthlyGain >= 0 ? 'économie' : 'surcoût'} de ${fmtEur(Math.abs(r.monthlyGain))} par mois`} />
          <Kpi label="Gain net sur le coût total" value={fmtEur(r.netGain)} sub="intérêts évités moins frais" />
          <Kpi label="Point mort" value={r.breakEvenMonths === null ? 'aucun' : fmtMonths(r.breakEvenMonths)} sub={r.breakEvenMonths === null ? 'la mensualité ne baisse pas' : 'd’économie de mensualité pour couvrir les frais'} />
        </div>
        <Takeaway>{renegoTakeaway({ monthlyGain: r.monthlyGain, netGain: r.netGain, breakEvenMonths: r.breakEvenMonths, longer: r.longer, fees: s.fees })}</Takeaway>
        {r.longer && (
          <p className="notice" role="note">Le nouveau prêt dure plus longtemps que le prêt actuel : la mensualité peut baisser tout en augmentant le coût total. Lisez le gain net, pas seulement la mensualité.</p>
        )}
        <RenegoBars r={r} fees={s.fees} />
        <p className="muted small">
          Le point mort est le temps qu’il faut pour que la baisse de mensualité rembourse les frais. Si vous pensez revendre le bien ou solder le prêt avant, l’opération ne se rentabilise pas.
          Les exemples ci-dessus sont fictifs ; le détail du calcul est sur la page <Link to="/methodologie">Méthode</Link>.
        </p>
        <SavedSims simKey="renegociation" current={s} onLoad={(d) => setS({ ...RENEGO, ...d })} />
      </Layout>
    </>
  );
}

const PANELS: Record<TabId, () => ReactNode> = { duree: Duree, taeg: Taeg, infine: InFine, renegocier: Renegocier };

export default function SimComparerCredits() {
  const [tab, setTab] = useState<TabId>('duree');
  const { hash } = useLocation();
  const navigate = useNavigate();
  // L'onglet suit l'ancre de l'adresse (#taeg…), lue après l'hydratation pour garder le HTML pré-rendu identique.
  useEffect(() => {
    const wanted = TABS.find((t) => '#' + t.id === hash);
    if (wanted) setTab(wanted.id);
  }, [hash]);
  const Panel = PANELS[tab];
  const choose = (id: TabId) => {
    setTab(id);
    navigate({ hash: id }, { replace: true });
  };

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Comparer des crédits' }]} />
      <PageHead eyebrow="Simulateur" title="Comparer des crédits : durée, TAEG, in fine, renégociation">
        Choisissez la question que vous vous posez : la durée qui convient, le coût réel d’une offre (TAEG), un crédit in fine face à un crédit classique, ou l’intérêt de renégocier un prêt en cours.
      </PageHead>
      <div className="tabs" role="tablist" aria-label="Question à étudier" style={{ marginTop: 24 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="panneau-calcul"
            className={tab === t.id ? 'on' : ''}
            onClick={() => choose(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="panneau-calcul" aria-labelledby={`tab-${tab}`}>
        <Panel />
      </div>
      <Disclaimer kind={tab === 'infine' ? 'rendement' : 'credit'} />
      <SimFaq slug="comparer-des-credits" items={comparerCreditsFaq[tab]} />
    </>
  );
}
