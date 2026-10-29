import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { doubling, presentValue, requiredReturn, timeToTarget, fmtEur, fmtNum, fmtPct } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

// Exemples fictifs : toutes les valeurs par défaut sont des hypothèses à remplacer par les vôtres.

const TABS = [
  { id: 'placer', label: 'Combien placer aujourd’hui ?' },
  { id: 'duree', label: 'En combien de temps ?' },
  { id: 'rendement', label: 'Quel rendement ?' },
  { id: 'doubler', label: 'Doubler son capital' },
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

const PANELS: Record<TabId, () => ReactNode> = { placer: Placer, duree: Duree, rendement: Rendement, doubler: Doubler };

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
        Choisissez la valeur que vous cherchez : la somme à placer aujourd’hui, la durée pour atteindre un capital, le rendement nécessaire, ou le temps pour doubler un capital (règle de 72).
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire ni prévision. Le rendement est supposé constant, avant frais, impôts et inflation, et n’est jamais garanti.
        Voir aussi les <Link to="/simulateurs/patrimoine">projections de patrimoine</Link>, l’<Link to="/simulateurs/inflation">effet de l’inflation</Link> et le <Link to="/simulateurs/objectif-epargne">versement à prévoir pour un objectif</Link>.
      </p>
      <div className="tabs" role="tablist" aria-label="Valeur à chercher" style={{ marginTop: 24 }}>
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
      <SimFaq slug="interets-composes" />
    </>
  );
}
