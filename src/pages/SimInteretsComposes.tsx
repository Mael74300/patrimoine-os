import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { delayCost, doubling, presentValue, rateConversion, requiredReturn, simpleVsCompound, stepUp, timeToTarget, fmtEur, fmtNum, fmtPct } from '../lib/finance';
import { interetsComposesFaq } from '../data/simFaq';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, SelectField, usePersistentState } from '../components/ui';

// Exemples fictifs : toutes les valeurs par défaut sont des hypothèses à remplacer par les vôtres.

const TABS = [
  { id: 'placer', label: 'Combien placer aujourd’hui ?' },
  { id: 'duree', label: 'En combien de temps ?' },
  { id: 'rendement', label: 'Quel rendement ?' },
  { id: 'doubler', label: 'Doubler son capital' },
  { id: 'simple', label: 'Simples ou composés ?' },
  { id: 'attendre', label: 'Coût d’attendre' },
  { id: 'progressif', label: 'Épargne qui augmente' },
  { id: 'taux', label: 'Taux annuel → mensuel' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const years = (n: number | null) => (n === null ? 'jamais' : `${fmtNum(n)} ans`);

function fmtDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mois`;
  return m === 0 ? `${y} an${y > 1 ? 's' : ''}` : `${y} an${y > 1 ? 's' : ''} et ${m} mois`;
}

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

/* ---------- Combien placer aujourd'hui pour atteindre un capital ? */
type PlacerState = { target: number; years: number; ratePct: number; monthly: number };
const PLACER: PlacerState = { target: 30000, years: 10, ratePct: 4, monthly: 100 };

function Placer() {
  const [s, setS, up] = usePersistentState<PlacerState>('capital-a-placer', PLACER);
  const r = presentValue({ target: s.target, years: s.years, annualRate: s.ratePct / 100, monthly: s.monthly });
  return (
    <Layout
      reset={() => setS(PLACER)}
      form={(
        <fieldset>
          <legend>Votre objectif</legend>
          <NumberField label="Capital visé" unit="€" value={s.target} onChange={up('target')} min={0} step={1000} />
          <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={100} step={1} />
          <NumberField label="Rendement annuel supposé" unit="%" value={s.ratePct} onChange={up('ratePct')} min={-50} max={100} step={0.5} />
          <NumberField label="Versement mensuel prévu" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
        </fieldset>
      )}
    >
      <div className="kpis">
        <Kpi label="Capital à placer aujourd’hui" value={fmtEur(r.initial)} sub={r.noInitialNeeded ? 'vos versements mensuels suffisent' : 'somme unique, placée dès maintenant'} />
        <Kpi label="Total versé" value={fmtEur(r.contributed)} sub="capital à placer et versements mensuels" />
        <Kpi label="Gain dans cette hypothèse" value={fmtEur(r.gain)} sub="objectif moins total versé" />
      </div>
      <p className="muted small">
        Avec r = (1 + R)^(1/12) − 1 et n le nombre de mois : capital à placer = (capital visé − versement × ((1 + r)^n − 1) / r) / (1 + r)^n, et jamais moins de 0 €.
        Les montants par défaut sont fictifs.
      </p>
      <SavedSims simKey="capital-a-placer" current={s} onLoad={(d) => setS({ ...PLACER, ...d })} />
    </Layout>
  );
}

/* ---------- En combien de temps atteindre un capital ? */
type DureeState = { initial: number; monthly: number; annualRate: number; target: number };
const DUREE: DureeState = { initial: 2000, monthly: 300, annualRate: 4, target: 30000 };

function Duree() {
  const [s, setS, up] = usePersistentState<DureeState>('duree-objectif', DUREE);
  const r = timeToTarget({ initial: s.initial, monthly: s.monthly, annualRate: s.annualRate / 100, target: s.target });
  const saved = r.reached && r.monthsWithoutReturn !== null ? r.monthsWithoutReturn - (r.months ?? 0) : null;
  return (
    <Layout
      reset={() => setS(DUREE)}
      form={(
        <fieldset>
          <legend>Votre épargne</legend>
          <NumberField label="Capital de départ" unit="€" value={s.initial} onChange={up('initial')} min={0} step={500} />
          <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
          <NumberField label="Rendement annuel supposé" unit="%" value={s.annualRate} onChange={up('annualRate')} min={-50} max={50} step={0.5} />
          <NumberField label="Capital visé" unit="€" value={s.target} onChange={up('target')} min={0} step={1000} />
        </fieldset>
      )}
    >
      {r.reached ? (
        <div className="kpis">
          <Kpi label="Durée nécessaire" value={fmtDuration(r.months ?? 0)} sub={`soit ${(r.years ?? 0).toFixed(1).replace('.', ',')} an(s)`} />
          <Kpi label="Total versé" value={fmtEur(r.contributed)} sub="capital de départ compris" />
          <Kpi label="Intérêts" value={fmtEur(r.interest)} sub={`${fmtPct(r.interestShare)} du capital à l’arrivée`} />
          <Kpi label="Gain de temps grâce au rendement" value={saved === null ? '—' : fmtDuration(saved)} sub={r.monthsWithoutReturn === null ? '' : `contre ${fmtDuration(r.monthsWithoutReturn)} sans rendement`} />
        </div>
      ) : (
        <p className="notice" role="status">Avec ces hypothèses, le capital visé n’est pas atteint en 100 ans : augmentez le versement mensuel, le rendement supposé ou baissez l’objectif.</p>
      )}
      <p className="muted small">
        Chaque mois : capital = capital × (1 + rendement mensuel équivalent) + versement (en fin de mois), jusqu’à atteindre le capital visé (100 ans au plus).
        Les montants par défaut sont fictifs.
      </p>
      <SavedSims simKey="duree-objectif" current={s} onLoad={(d) => setS({ ...DUREE, ...d })} />
    </Layout>
  );
}

/* ---------- Quel rendement pour atteindre un objectif ? */
type RendementState = { initial: number; monthly: number; years: number; target: number };
const RENDEMENT: RendementState = { initial: 5000, monthly: 200, years: 15, target: 60000 };

function Rendement() {
  const [s, setS, up] = usePersistentState<RendementState>('rendement-requis', RENDEMENT);
  const r = requiredReturn(s);
  return (
    <Layout
      reset={() => setS(RENDEMENT)}
      form={(
        <fieldset>
          <legend>Votre objectif</legend>
          <NumberField label="Capital de départ" unit="€" value={s.initial} onChange={up('initial')} min={0} step={500} />
          <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
          <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={100} step={1} />
          <NumberField label="Capital visé" unit="€" value={s.target} onChange={up('target')} min={0} step={1000} />
        </fieldset>
      )}
    >
      {r.annualRate === null ? (
        <p className="notice" role="status">Même à 100 % par an, ces hypothèses n’atteignent pas le capital visé : augmentez le versement, allongez la durée ou baissez l’objectif.</p>
      ) : (
        <div className="kpis">
          <Kpi label="Rendement annuel nécessaire" value={fmtPct(r.annualRate)} sub={r.alreadyReached ? 'les versements suffisent sans rendement' : 'constant, avant frais, impôts et inflation'} />
          <Kpi label="Total versé" value={fmtEur(r.contributed)} sub="capital de départ compris" />
          <Kpi label="Part à obtenir par le rendement" value={fmtEur(Math.max(0, s.target - r.withoutReturn))} sub="écart entre l’objectif et les versements seuls" />
        </div>
      )}
      <p className="muted small">
        On cherche le rendement annuel R tel que, chaque mois : capital = capital × (1 + r) + versement (fin de mois), avec r = (1 + R)^(1/12) − 1, jusqu’à égaler le capital visé.
        Les montants par défaut sont fictifs.
      </p>
      <SavedSims simKey="rendement-requis" current={s} onLoad={(d) => setS({ ...RENDEMENT, ...d })} />
    </Layout>
  );
}

/* ---------- Doubler son capital : règle de 72 */
type DoublerState = { initial: number; annualReturn: number; inflation: number; multiple: number };
const DOUBLER: DoublerState = { initial: 10000, annualReturn: 6, inflation: 2, multiple: 2 };

function Doubler() {
  const [s, setS, up] = usePersistentState<DoublerState>('doubler', DOUBLER);
  const r = doubling({ initial: s.initial, annualReturn: s.annualReturn / 100, inflation: s.inflation / 100, multiple: s.multiple });
  return (
    <Layout
      reset={() => setS(DOUBLER)}
      form={(
        <>
          <fieldset>
            <legend>Votre capital</legend>
            <NumberField label="Capital de départ" unit="€" value={s.initial} onChange={up('initial')} min={0} step={500} />
            <NumberField label="Multiple visé (2 = doubler)" unit="×" value={s.multiple} onChange={up('multiple')} min={1} max={1000} step={0.5} />
          </fieldset>
          <fieldset>
            <legend>Hypothèses</legend>
            <NumberField label="Rendement annuel supposé" unit="%" value={s.annualReturn} onChange={up('annualReturn')} min={-50} max={50} step={0.5} />
            <NumberField label="Inflation annuelle supposée" unit="%" value={s.inflation} onChange={up('inflation')} min={-10} max={50} step={0.5} />
          </fieldset>
        </>
      )}
    >
      <div className="kpis">
        <Kpi label="Durée exacte" value={years(r.exactYears)} sub={`pour passer à ${fmtEur(r.target)}`} />
        <Kpi label="Règle de 72" value={years(r.rule72Years)} sub={r.rule72Gap === null ? 'rendement positif requis' : `écart de ${fmtNum(Math.abs(r.rule72Gap))} an${Math.abs(r.rule72Gap) >= 2 ? 's' : ''} avec le calcul exact`} />
        <Kpi label="Rendement réel" value={fmtPct(r.realReturn)} sub="par an, après inflation supposée" />
        <Kpi label="Durée en pouvoir d’achat" value={years(r.realYears)} sub="pour multiplier la valeur réelle du capital" />
      </div>
      <p className="muted small">
        Durée exacte = ln(multiple) / ln(1 + rendement). La règle de 72 divise 72 par le rendement en % : c’est une approximation de tête, proche du résultat pour des rendements de quelques pour cent, moins précise aux taux très faibles ou très élevés.
        Si le rendement n’est pas positif, le capital n’atteint jamais le multiple. Les exemples ci-dessus sont fictifs.
      </p>
      <SavedSims simKey="doubler" current={s} onLoad={(d) => setS({ ...DOUBLER, ...d })} />
    </Layout>
  );
}

const PERIODS = [
  { v: 12, label: 'Mensuelle (12 par an)' },
  { v: 4, label: 'Trimestrielle (4 par an)' },
  { v: 2, label: 'Semestrielle (2 par an)' },
];

const p4 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const fmtRate = (x: number) => (Number.isFinite(x) ? `${p4.format(x * 100)} %` : '—');

/* ---------- Intérêts simples ou composés */
type SimpleState = { initial: number; annualRate: number; years: number };
const SIMPLE: SimpleState = { initial: 10000, annualRate: 5, years: 20 };

function Simple() {
  const [s, setS, up] = usePersistentState<SimpleState>('simple-compose', SIMPLE);
  const r = simpleVsCompound({ initial: s.initial, annualRate: s.annualRate / 100, years: s.years });
  const step = Math.max(1, Math.ceil((r.rows.length - 1) / 10));
  const shown = r.rows.filter((row) => row.year % step === 0 || row.year === r.rows.length - 1);
  return (
    <Layout
      reset={() => setS(SIMPLE)}
      form={(
        <>
      <fieldset>
        <legend>Votre placement</legend>
        <NumberField label="Capital de départ" unit="€" value={s.initial} onChange={up('initial')} min={0} step={500} />
        <NumberField label="Taux annuel supposé" unit="%" value={s.annualRate} onChange={up('annualRate')} min={-50} max={50} step={0.5} />
        <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={0} max={100} step={1} />
      </fieldset>
        </>
      )}
    >
      <div className="kpis">
        <Kpi label="Capital en intérêts simples" value={fmtEur(r.simpleFinal)} sub={`dont ${fmtEur(r.simpleInterest)} d’intérêts`} />
        <Kpi label="Capital en intérêts composés" value={fmtEur(r.compoundFinal)} sub={`dont ${fmtEur(r.compoundInterest)} d’intérêts`} />
        <Kpi label="Écart en faveur des composés" value={fmtEur(r.gap)} sub="intérêts composés − intérêts simples" />
        <Kpi label="Rapport composé / simple" value={`× ${fmtNum(r.ratio)}`} sub="sur le capital final" />
      </div>
      <div className="table-wrap" tabIndex={0} style={{ marginTop: 16 }}><table>
        <thead><tr><th>Année</th><th className="r">Intérêts simples</th><th className="r">Intérêts composés</th><th className="r">Écart</th></tr></thead>
        <tbody>
          {shown.map((row) => (
            <tr key={row.year}><td>{row.year}</td><td className="r">{fmtEur(row.simple)}</td><td className="r">{fmtEur(row.compound)}</td><td className="r">{fmtEur(row.gap)}</td></tr>
          ))}
        </tbody>
      </table></div>
      <p className="muted small">
        Intérêts simples : capital × (1 + taux × années). Intérêts composés : capital × (1 + taux)^années. Les deux coïncident la première année ; l’écart croît ensuite de plus en plus vite.
        Les exemples ci-dessus sont fictifs.
      </p>
      <SavedSims simKey="simple-compose" current={s} onLoad={(d) => setS({ ...SIMPLE, ...d })} />
    </Layout>
  );
}

/* ---------- Coût d’attendre pour épargner */
type AttendreState = { monthly: number; annualReturn: number; years: number; delayYears: number };
const ATTENDRE: AttendreState = { monthly: 200, annualReturn: 5, years: 25, delayYears: 5 };

function Attendre() {
  const [s, setS, up] = usePersistentState<AttendreState>('attendre', ATTENDRE);
  const r = delayCost({ monthly: s.monthly, annualReturn: s.annualReturn / 100, years: s.years, delayYears: s.delayYears });
  return (
    <Layout
      reset={() => setS(ATTENDRE)}
      form={(
        <>
      <fieldset>
        <legend>Votre épargne</legend>
        <NumberField label="Versement mensuel" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={50} />
        <NumberField label="Rendement annuel supposé" unit="%" value={s.annualReturn} onChange={up('annualReturn')} min={-50} max={50} step={0.5} />
      </fieldset>
      <fieldset>
        <legend>Calendrier</legend>
        <NumberField label="Horizon d’arrivée" unit="ans" value={s.years} onChange={up('years')} min={1} max={80} step={1} />
        <NumberField label="Délai avant de commencer" unit="ans" value={s.delayYears} onChange={up('delayYears')} min={0} max={80} step={0.5} />
      </fieldset>
        </>
      )}
    >
      <div className="kpis">
        <Kpi label="Capital en commençant tout de suite" value={fmtEur(r.startNow)} sub={`${fmtEur(r.investedNow)} versés`} />
        <Kpi label="Capital en commençant après le délai" value={fmtEur(r.startLater)} sub={`${fmtEur(r.investedLater)} versés`} />
        <Kpi label="Coût de l’attente" value={fmtEur(r.cost)} sub="capital en moins à l’arrivée" />
        <Kpi label="Versement pour rattraper" value={r.catchUpMonthly === null ? '—' : fmtEur(r.catchUpMonthly)} sub="par mois après le délai, pour le même capital" />
      </div>
      <p className="muted small">
        Les versements ont lieu en fin de mois. Attendre fait perdre les versements des mois d’attente et les intérêts qu’ils auraient produits jusqu’à l’arrivée : plus le délai est long par rapport à l’horizon, plus l’écart est grand.
        Si le délai atteint l’horizon, aucun versement n’est possible et le rattrapage n’est pas défini. Les exemples ci-dessus sont fictifs.
      </p>
      <SavedSims simKey="attendre" current={s} onLoad={(d) => setS({ ...ATTENDRE, ...d })} />
    </Layout>
  );
}

/* ---------- Augmenter son épargne chaque année */
type ProgressifState = { monthly: number; annualIncrease: number; annualReturn: number; years: number };
const PROGRESSIF: ProgressifState = { monthly: 200, annualIncrease: 3, annualReturn: 5, years: 25 };

function Progressif() {
  const [s, setS, up] = usePersistentState<ProgressifState>('progressif', PROGRESSIF);
  const r = stepUp({ monthly: s.monthly, annualIncrease: s.annualIncrease / 100, annualReturn: s.annualReturn / 100, years: s.years });
  return (
    <Layout
      reset={() => setS(PROGRESSIF)}
      form={(
        <>
      <fieldset>
        <legend>Votre épargne</legend>
        <NumberField label="Versement mensuel la première année" unit="€" value={s.monthly} onChange={up('monthly')} min={0} step={25} />
        <NumberField label="Hausse annuelle du versement" unit="%" value={s.annualIncrease} onChange={up('annualIncrease')} min={-50} max={100} step={0.5} />
        <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={0} max={80} step={1} />
      </fieldset>
      <fieldset>
        <legend>Hypothèse</legend>
        <NumberField label="Rendement annuel supposé" unit="%" value={s.annualReturn} onChange={up('annualReturn')} min={-50} max={50} step={0.5} />
      </fieldset>
        </>
      )}
    >
      <div className="kpis">
        <Kpi label="Capital, versement constant" value={fmtEur(r.flatCapital)} sub={`pour ${fmtEur(r.flatInvested)} versés`} />
        <Kpi label="Capital, versement qui augmente" value={fmtEur(r.steppedCapital)} sub={`pour ${fmtEur(r.steppedInvested)} versés`} />
        <Kpi label="Capital en plus" value={fmtEur(r.extraCapital)} sub="par rapport au versement constant" />
        <Kpi label="Dernier versement mensuel" value={fmtEur(r.lastMonthly)} sub={`équivalent à ${fmtEur(r.equivalentFlatMonthly)} constants par mois`} />
      </div>
      <p className="muted small">
        Le versement est multiplié par (1 + hausse) au début de chaque année à partir de la deuxième ; les versements ont lieu en fin de mois. Le « versement constant équivalent » est la mensualité fixe qui donnerait le même capital final.
        Les exemples ci-dessus sont fictifs.
      </p>
      <SavedSims simKey="progressif" current={s} onLoad={(d) => setS({ ...PROGRESSIF, ...d })} />
    </Layout>
  );
}

/* ---------- Convertir un taux annuel en taux mensuel */
type TauxState = { annualRate: number; periods: number };
const TAUX: TauxState = { annualRate: 5, periods: 12 };

function Taux() {
  const [s, setS, up] = usePersistentState<TauxState>('conversion-taux', TAUX);
  const r = rateConversion({ annualRate: s.annualRate / 100, periods: s.periods });
  const label = s.periods === 12 ? 'mensuel' : s.periods === 4 ? 'trimestriel' : s.periods === 2 ? 'semestriel' : 'par période';
  return (
    <Layout
      reset={() => setS(TAUX)}
      form={(
        <>
      <fieldset>
        <legend>Votre taux</legend>
        <NumberField label="Taux annuel effectif" unit="%" value={s.annualRate} onChange={up('annualRate')} min={-50} max={100} step={0.1} />
        <SelectField label="Période visée" value={s.periods} options={PERIODS} onChange={up('periods')} />
      </fieldset>
        </>
      )}
    >
      <div className="kpis">
        <Kpi label={`Taux ${label} équivalent`} value={fmtRate(r.equivalentRate)} sub="capitalisé sur l’année, redonne exactement le taux annuel" />
        <Kpi label={`Taux ${label} proportionnel`} value={fmtRate(r.proportionalRate)} sub="taux annuel divisé par le nombre de périodes" />
        <Kpi label="Taux annuel nominal équivalent" value={fmtRate(r.nominalRate)} sub="taux équivalent × nombre de périodes" />
        <Kpi label="Taux annuel réel du taux proportionnel" value={fmtRate(r.effectiveFromProportional)} sub={`écart de ${fmtRate(r.gap)} avec le taux saisi`} />
      </div>
      <p className="muted small">
        Taux équivalent = (1 + taux annuel)^(1 / n) − 1 ; taux proportionnel = taux annuel / n ; taux annuel du taux proportionnel = (1 + taux / n)^n − 1.
        Les montants par défaut sont fictifs.
      </p>
      <SavedSims simKey="conversion-taux" current={s} onLoad={(d) => setS({ ...TAUX, ...d })} />
    </Layout>
  );
}

const PANELS: Record<TabId, () => ReactNode> = { placer: Placer, duree: Duree, rendement: Rendement, doubler: Doubler, simple: Simple, attendre: Attendre, progressif: Progressif, taux: Taux };

export default function SimInteretsComposes() {
  const [tab, setTab] = useState<TabId>('placer');
  const { hash } = useLocation();
  const navigate = useNavigate();
  // L'onglet suit l'ancre de l'adresse (#duree…), lue après l'hydratation pour garder le HTML pré-rendu identique.
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
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Intérêts composés' }]} />
      <PageHead eyebrow="Simulateur" title="Intérêts composés : combien placer, en quel temps, à quel rendement ?">
        Huit calculs autour d’une même idée : l’argent placé rapporte des intérêts, qui rapportent eux-mêmes des intérêts. Choisissez votre question dans les onglets.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire ni prévision. Le rendement est supposé constant, avant frais, impôts et inflation, et n’est jamais garanti.
        Voir aussi les <Link to="/simulateurs/patrimoine">projections de patrimoine</Link>, l’<Link to="/simulateurs/inflation">effet de l’inflation</Link> et le <Link to="/simulateurs/objectif-epargne">versement à prévoir pour un objectif</Link>.
      </p>
      <div className="tabs" role="tablist" aria-label="Calcul à choisir" style={{ marginTop: 24 }}>
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
      <SimFaq slug="interets-composes" items={interetsComposesFaq[tab]} />
    </>
  );
}
