import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fmtEur, fmtEur2, fmtNum, fmtPct, inFine, loanDuration, renegotiation, taeg, taegByFees, taegByInsurance } from '../lib/finance';
import { comparerCreditsFaq } from '../data/simFaq';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

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
      </form>
      <section aria-label="Résultats">{children}</section>
    </div>
  );
}

/* ---------- Durée du crédit : mensualité et coût total */
type DureeState = { principal: number; annualRate: number; insuranceRate: number };
const DUREE: DureeState = { principal: 200000, annualRate: 0.03, insuranceRate: 0.003 };
const DURATIONS = [10, 15, 20, 25, 30];

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
          <Kpi label={`Mensualité sur ${shortest.years} ans`} value={fmtEur2(shortest.monthlyTotal)} sub="assurance comprise" />
          <Kpi label={`Mensualité sur ${longest.years} ans`} value={fmtEur2(longest.monthlyTotal)} sub="assurance comprise" />
          <Kpi label={`Coût total sur ${shortest.years} ans`} value={fmtEur(shortest.totalCost)} sub="intérêts + assurance" />
          <Kpi label={`Coût total sur ${longest.years} ans`} value={fmtEur(longest.totalCost)} sub={`${fmtEur(longest.totalCost - shortest.totalCost)} de plus`} />
        </div>
        <h2>Comparaison par durée</h2>
        <div className="table-wrap" tabIndex={0}>
          <table>
            <thead><tr><th>Durée</th><th className="r">Mensualité (hors assurance)</th><th className="r">Mensualité (assurance comprise)</th><th className="r">Intérêts</th><th className="r">Coût total</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.years}>
                  <td>{r.years} ans</td>
                  <td className="r">{fmtEur2(r.monthlyPayment)}</td>
                  <td className="r">{fmtEur2(r.monthlyTotal)}</td>
                  <td className="r">{fmtEur(r.totalInterest)}</td>
                  <td className="r">{fmtEur(r.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          Mensualité = capital × (taux / 12) ÷ (1 − (1 + taux / 12)^(−mois)) ; coût total = intérêts + assurance. Une durée plus longue réduit la mensualité mais augmente le coût total.
          Les montants par défaut sont fictifs.
        </p>
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
          <Kpi label="TAEG estimé" value={fmtPct(r.taeg)} sub={`contre ${fmtPct(s.annualRate)} de taux nominal (écart ${fmtPct(r.gap)})`} />
          <Kpi label="Mensualité assurance comprise" value={fmtEur(r.monthlyTotal)} sub={`dont ${fmtEur(r.monthlyInsurance)} d’assurance, sur ${r.months} mois`} />
          <Kpi label="Coût total du crédit" value={fmtEur(r.totalCost)} sub={`intérêts ${fmtEur(r.totalInterest)} + assurance ${fmtEur(r.totalInsurance)} + frais ${fmtEur(Math.min(s.fees, s.principal))}`} />
        </div>
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
        <h2>Comparaison sur {r.months / 12} ans</h2>
        <div className="table-wrap" tabIndex={0}>
          <table>
            <thead><tr><th>Poste</th><th className="r">Amortissable</th><th className="r">In fine</th></tr></thead>
            <tbody>
              <tr><td>Intérêts + assurance</td><td className="r">{fmtEur(r.amortizingCost)}</td><td className="r">{fmtEur(r.inFineCost)}</td></tr>
              <tr><td>Gains de l’épargne</td><td className="r">—</td><td className="r">− {fmtEur(r.savingsGain)}</td></tr>
              <tr><td>Coût net</td><td className="r">{fmtEur(r.amortizingCost)}</td><td className="r">{fmtEur(r.inFineNetCost)}</td></tr>
            </tbody>
          </table>
        </div>
        <p className="muted small">
          In fine : intérêts mensuels = capital × taux / 12 ; épargne mensuelle = capital × r ÷ ((1 + r)^mois − 1), avec r le taux mensuel équivalent du rendement net. Si l’épargne rapporte moins
          que le taux du crédit, l’in fine coûte plus cher ; sinon, il coûte moins, sans garantie de rendement. Les montants par défaut sont fictifs.
        </p>
        <SavedSims simKey="credit-in-fine" current={s} onLoad={(d) => setS({ ...IN_FINE, ...d })} />
      </Layout>
    </>
  );
}

/* ---------- Renégocier ou racheter son crédit */
type RenegoState = { remaining: number; currentRate: number; currentYearsLeft: number; newRate: number; newYears: number; fees: number };
const RENEGO: RenegoState = { remaining: 150000, currentRate: 4.5, currentYearsLeft: 20, newRate: 3.5, newYears: 20, fees: 3000 };

function Renegocier() {
  const [s, setS, up] = usePersistentState<RenegoState>('renegociation', RENEGO);
  const r = renegotiation({ ...s, currentRate: s.currentRate / 100, newRate: s.newRate / 100 });
  return (
    <>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire : les frais (dossier, garantie, indemnités éventuelles) sont à relever sur vos documents et sur l’offre reçue. L’assurance n’est pas incluse.
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
          <Kpi label="Point mort" value={r.breakEvenMonths === null ? 'aucun' : `${fmtNum(r.breakEvenMonths)} mois`} sub={r.breakEvenMonths === null ? 'la mensualité ne baisse pas' : 'd’économie de mensualité pour couvrir les frais'} />
        </div>
        {r.longer && (
          <p className="notice" role="note">Le nouveau prêt dure plus longtemps que le prêt actuel : la mensualité peut baisser tout en augmentant le coût total. Lisez le gain net, pas seulement la mensualité.</p>
        )}
        <p className="muted small">
          Intérêts restants du prêt actuel : {fmtEur(r.currentRemainingInterest)} ; intérêts du nouveau prêt : {fmtEur(r.newInterest)}. Gain net = intérêts restants actuels − intérêts du nouveau prêt − frais.
          Le point mort divise les frais par l’économie mensuelle ; s’il dépasse le temps pendant lequel vous comptez garder le prêt (revente, remboursement anticipé), l’opération ne se rentabilise pas. Les exemples ci-dessus sont fictifs.
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
      <div style={{ marginTop: 16 }}><Disclaimer /></div>
      <SimFaq slug="comparer-des-credits" items={comparerCreditsFaq[tab]} />
    </>
  );
}
