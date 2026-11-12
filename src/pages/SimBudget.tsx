import { Link } from 'react-router-dom';
import { analyzeBudget, BUDGET_BENCHMARK, budgetBarSegments, catchUp, fmtEur, fmtNum, fmtPct, monthsOfIncomeSavedPerYear, projectBudgetSaving } from '../lib/finance';
import { budgetGapPhrase, budgetTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, NumberField, PageHead, SavedSims, usePersistentState, JumpToResults, SimNotice } from '../components/ui';

function BudgetBars({ b }: { b: ReturnType<typeof analyzeBudget> }) {
  const mine = budgetBarSegments(b);
  if (mine.length === 0) return null;
  const bench = budgetBarSegments({ income: 1, needs: BUDGET_BENCHMARK.needs, wants: BUDGET_BENCHMARK.wants, saving: BUDGET_BENCHMARK.saving });
  const desc = mine.map((x) => `${x.label} ${fmtPct(x.width / 100)}`).join(', ');
  const Bar = ({ segs, label, aria }: { segs: typeof mine; label: string; aria: string }) => (
    <div className="bb-row">
      <div className="bb-label">{label}</div>
      <div className="bb-bar" role="img" aria-label={aria}>
        {segs.map((x) => (
          <span key={x.key} className={'bb-seg bb-' + x.key} style={{ width: `${x.width}%` }}>
            {x.width >= 12 ? fmtPct(x.width / 100) : ''}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <figure className="bb">
      <Bar segs={mine} label="Votre budget" aria={`Votre budget : ${desc}`} />
      <Bar segs={bench} label="Repère" aria="Repère : besoins 50 %, envies 30 %, épargne 20 %" />
      <figcaption className="bb-legend">
        <span><i className="bb-dot bb-needs" />Besoins</span>
        <span><i className="bb-dot bb-wants" />Envies</span>
        <span><i className="bb-dot bb-saving" />Épargne</span>
        {mine.some((x) => x.key === 'free') && <span><i className="bb-dot bb-free" />Non affecté</span>}
      </figcaption>
    </figure>
  );
}

type State = { netIncome: number; needs: number; wants: number; saving: number; targetRate: number; projReturn: number; projYears: number };

const DEFAULTS: State = { netIncome: 2500, needs: 1400, wants: 650, saving: 250, targetRate: 0.2, projReturn: 0.03, projYears: 10 };

export default function SimBudget() {
  const [s, setS, up] = usePersistentState<State>('budget', DEFAULTS);
  const b = analyzeBudget(s);
  const c = catchUp(s, s.targetRate);
  const proj = projectBudgetSaving(b.saving, s.projReturn, s.projYears);
  const rows = [
    { key: 'needs', label: 'Besoins', hint: 'dépenses contraintes', amount: b.needs, share: b.shares.needs, bench: BUDGET_BENCHMARK.needs, gap: b.gaps.needs },
    { key: 'wants', label: 'Envies', hint: 'confort, loisirs', amount: b.wants, share: b.shares.wants, bench: BUDGET_BENCHMARK.wants, gap: b.gaps.wants },
    { key: 'saving', label: 'Épargne', hint: 'mise de côté', amount: b.saving, share: b.shares.saving, bench: BUDGET_BENCHMARK.saving, gap: b.gaps.saving },
  ];

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Budget et taux d’épargne' }]} />
      <PageHead eyebrow="Simulateur" title="Budget mensuel et taux d'épargne">
        Calculez la part de votre revenu consacrée aux besoins, aux envies et à l'épargne, puis l'effort nécessaire pour atteindre un taux d'épargne visé.
      </PageHead>
      <SimNotice>
        La répartition 50 / 30 / 20 (besoins, envies, épargne) est un repère pédagogique courant, pas une règle officielle. Selon le logement, la région
        et la composition du foyer, les besoins peuvent dépasser 50 % du revenu : le repère sert à situer votre budget, pas à le juger.
      </SimNotice>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Budget mensuel du foyer</legend>
            <NumberField label="Revenu net mensuel" unit="€" value={s.netIncome} onChange={up('netIncome')} min={0} step={100} sliderMax={8000} hint="Après impôt sur le revenu prélevé à la source, toutes sources comprises." />
            <NumberField label="Besoins" unit="€" value={s.needs} onChange={up('needs')} min={0} step={50} sliderMax={5000} hint="Logement, énergie, alimentation, transport, assurances, remboursements de crédit." />
            <NumberField label="Envies" unit="€" value={s.wants} onChange={up('wants')} min={0} step={50} sliderMax={3000} hint="Loisirs, restaurants, abonnements, voyages, achats de confort." />
            <NumberField label="Épargne mensuelle" unit="€" value={s.saving} onChange={up('saving')} min={0} step={50} sliderMax={2000} />
          </fieldset>
          <details className="fold advanced">
            <summary>Réglages avancés (facultatif)</summary>
            <div className="advanced-body">
              <NumberField label="Taux d'épargne visé" unit="%" percent value={s.targetRate} onChange={up('targetRate')} min={0} max={100} step={1} hint="20 % est le repère du 50 / 30 / 20." />
              <NumberField label="Rendement net supposé de l'épargne" unit="%" percent value={s.projReturn} onChange={up('projReturn')} min={-10} max={20} step={0.5} hint="Hypothèse, jamais une garantie. 0 % = simple somme des versements." />
              <NumberField label="Durée de la projection" unit="ans" value={s.projYears} onChange={up('projYears')} min={1} max={50} step={1} />
            </div>
          </details>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Taux d'épargne actuel" value={fmtPct(b.savingRate)} sub={`${fmtNum(monthsOfIncomeSavedPerYear(b.savingRate))}\u00a0mois de revenu épargnés par an`} />
            <Kpi
              label="Revenu non affecté"
              value={fmtEur(b.unallocated)}
              sub={b.unallocated < 0 ? 'vos postes dépassent le revenu' : 'ni dépensé ni épargné'}
              tone={b.unallocated < 0 ? 'neg' : undefined}
            />
            <Kpi label={`Effort pour ${fmtPct(s.targetRate)}`} value={fmtEur(c.missing)} sub="à trouver chaque mois" tone={c.missing === 0 ? 'pos' : undefined} />
          </div>
          <Takeaway>{budgetTakeaway({ income: b.income, shares: b.shares, unallocated: b.unallocated, targetRate: s.targetRate, missing: c.missing })}</Takeaway>

          <h2>Votre budget face au repère 50 / 30 / 20</h2>
          <BudgetBars b={b} />
          <ul className="bb-list" aria-label="Chaque poste du budget comparé au repère 50 / 30 / 20">
            {rows.map((r) => (
              <li key={r.key}>
                <i className={'bb-dot bb-' + r.key} aria-hidden="true" />
                <span>
                  <strong>{r.label}</strong> <span className="muted">({r.hint})</span> : <strong>{fmtEur(r.amount)}</strong> par mois, soit {fmtPct(r.share)} du revenu.
                  <span className="bb-gap">{budgetGapPhrase(r.gap, r.bench).replace(/^./, (ch) => ch.toUpperCase())}.</span>
                </span>
              </li>
            ))}
          </ul>

          <h2>Atteindre {fmtPct(s.targetRate)} d'épargne</h2>
          {c.missing === 0 ? (
            <p>Votre taux d'épargne atteint déjà le taux visé.</p>
          ) : (
            <ul>
              <li>Il manque <strong>{fmtEur(c.missing)}</strong> par mois.</li>
              <li>Revenu non affecté à réorienter : {fmtEur(c.fromUnallocated)}.</li>
              <li>À dégager sur les envies : {fmtEur(c.fromWants)}.</li>
              {c.uncovered > 0 && <li>Reste non couvert : <strong>{fmtEur(c.uncovered)}</strong> — il faudrait agir sur les besoins ou sur le revenu, ou viser un taux plus réaliste.</li>}
            </ul>
          )}
          <h2>Que devient cette épargne en {s.projYears}&nbsp;ans ?</h2>
          <p>
            En épargnant {fmtEur(b.saving)} par mois à {fmtPct(s.projReturn)} net par an : <strong>{fmtEur(proj.finalValue)}</strong>, dont {fmtEur(proj.contributed)} versés
            et {fmtEur(proj.gains)} de gains supposés. Pour affiner (inflation, frais, paliers), utilisez le <Link to="/simulateurs/patrimoine">simulateur de patrimoine</Link> ;
            pour la réserve disponible en priorité, voir l'<Link to="/simulateurs/epargne-de-precaution">épargne de précaution</Link> ; pour l'effet des frais, <Link to="/simulateurs/frais">l'impact des frais</Link>.
          </p>
          <p className="muted small">Estimation purement arithmétique à partir de vos saisies ; elle ne tient compte ni des imprévus ni de l'évolution de vos revenus.</p>
          <SavedSims simKey="budget" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="budget" />
        </section>
      </div>
    </>
  );
}
