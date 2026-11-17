import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  allocateEnvelopes, fmtEur, fmtMonths, fmtNum, fmtPct, monthlySavingNeeded, monthsCovered, precautionPath,
  PROFILE_MONTHS, precautionSegments, type PrecautionInput, type PrecautionSegment, type PrecautionProfile,
} from '../lib/finance';
import { LIVRETS, LIVRETS_AS_OF, LIVRETS_PERIOD } from '../data/livrets';
import { precautionPlacementTakeaway, precautionTakeaway, precautionTargetSub } from '../lib/takeaways';
import { Crumbs, Disclaimer, SimFaq, Takeaway, Kpi, NumberField, PageHead, SavedSims, ChoiceField, Fold, Sources, usePersistentState, JumpToResults, CoverageGauge, SimNotice } from '../components/ui';

type State = PrecautionInput & { profile: PrecautionProfile; lep: 'oui' | 'non'; deadline: number };

const DEFAULTS: State = {
  profile: 'stable', monthlyExpenses: 2000, months: PROFILE_MONTHS.stable.months, extraReserve: 1000,
  currentSavings: 2500, monthlySaving: 250, annualRate: 0.017, lep: 'non', deadline: 24,
};

const SEG_CLASS: Record<PrecautionSegment['key'], string> = { start: 'pf-initial', deposits: 'pf-monthly', interest: 'pf-gain' };

const fmtDelay = (m: number | null) => (m === null ? 'non atteint en 50\u00a0ans' : m === 0 ? 'déjà atteint' : fmtMonths(m));

export default function SimPrecaution() {
  const [s, setS, up] = usePersistentState<State>('precaution', DEFAULTS);
  const path = useMemo(() => precautionPath(s), [s]);
  const target = path.target;
  const covered = monthsCovered(s.currentSavings, s.monthlyExpenses);
  const gap = Math.max(0, target - s.currentSavings);
  const need = monthlySavingNeeded(target, s.currentSavings, s.deadline, s.annualRate);
  const envelopes = useMemo(() => LIVRETS.filter((l) => s.lep === 'oui' || l.id !== 'lep'), [s.lep]);
  const alloc = useMemo(() => allocateEnvelopes(target, envelopes), [target, envelopes]);
  const bar = useMemo(() => precautionSegments(s), [s]);
  const rows = envelopes.map((l, i) => ({ l, a: alloc.allocations[i] }));
  const used = rows.filter((r) => r.a.amount > 0);
  const unused = rows.filter((r) => !(r.a.amount > 0));
  const interestPart = bar?.segments.find((x) => x.key === 'interest');
  const interestShare = bar ? (interestPart ? interestPart.amount / bar.balance : 0) : null;
  const placement = precautionPlacementTakeaway({
    yearlyInterest: alloc.interest, blendedRate: alloc.blendedRate, overflow: alloc.overflow,
    buildInterest: interestPart?.amount ?? null, buildMonths: bar?.month ?? null,
  });
  const segHint: Record<PrecautionSegment['key'], string> = {
    start: ', déjà de côté',
    deposits: bar ? ` (${fmtEur(s.monthlySaving)} par mois pendant ${fmtMonths(bar.month)})` : '',
    interest: ` à ${fmtPct(s.annualRate)} par an`,
  };

  const setProfile = (p: PrecautionProfile) => setS((x) => ({ ...x, profile: p, months: PROFILE_MONTHS[p].months }));

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Épargne de précaution' }]} />
      <PageHead eyebrow="Simulateur" title="Simulateur d'épargne de précaution">
        Estimez la réserve à garder disponible pour un imprévu, le temps pour la constituer et sa répartition possible sur les livrets réglementés.
      </PageHead>
      <SimNotice>
        Aucune règle officielle ne fixe le montant d'une épargne de précaution. Les durées proposées (3, 6 ou 9 mois de dépenses) sont des repères
        pédagogiques courants, à adapter à votre situation : stabilité des revenus, personnes à charge, état du logement et de la voiture, couverture santé.
      </SimNotice>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre situation</legend>
            <ChoiceField
              label="Situation professionnelle"
              value={s.profile}
              onChange={setProfile}
              options={(Object.keys(PROFILE_MONTHS) as PrecautionProfile[]).map((k) => ({
                v: k, label: PROFILE_MONTHS[k].label, detail: `${PROFILE_MONTHS[k].examples} · ${fmtNum(PROFILE_MONTHS[k].months)}\u00a0mois`,
              }))}
              hint="Repère en mois de dépenses, modifiable dans les réglages avancés."
            />
            <NumberField label="Dépenses mensuelles incompressibles" unit="€" value={s.monthlyExpenses} onChange={up('monthlyExpenses')} min={0} step={100} sliderMax={6000} hint="Logement, alimentation, énergie, transport, assurances, remboursements de crédit." />
            <NumberField label="Épargne disponible aujourd'hui" unit="€" value={s.currentSavings} onChange={up('currentSavings')} min={0} step={500} sliderMax={50000} hint="Sommes mobilisables sans délai ni perte." />
            <NumberField label="Versement mensuel" unit="€" value={s.monthlySaving} onChange={up('monthlySaving')} min={0} step={50} sliderMax={2000} />
            <NumberField label="Délai souhaité" unit="mois" value={s.deadline} onChange={up('deadline')} min={1} max={120} step={1} sliderMax={60} />
          </fieldset>
          <details className="fold advanced">
            <summary>Réglages avancés (facultatif)</summary>
            <div className="advanced-body">
              <p className="small muted">Déjà remplis avec des valeurs d'exemple. Si vous ne savez pas, laissez-les telles quelles.</p>
              <NumberField label="Nombre de mois à couvrir" unit="mois" value={s.months} onChange={up('months')} min={0} max={24} step={1} />
              <NumberField label="Réserve pour dépenses prévisibles" unit="€" value={s.extraReserve} onChange={up('extraReserve')} min={0} step={500} hint="Franchise d'assurance, réparation, remplacement d'un appareil…" />
              <NumberField label="Taux de rémunération" unit="%" percent value={s.annualRate} onChange={up('annualRate')} min={0} max={10} step={0.1} hint={`Livret A et LDDS : ${fmtPct(LIVRETS[1].rate)} ${LIVRETS_PERIOD}.`} />
              <ChoiceField
                label="Éligible au LEP"
                value={s.lep}
                onChange={up('lep')}
                options={[{ v: 'non', label: 'Non ou je ne sais pas' }, { v: 'oui', label: 'Oui' }]}
                hint="Selon le revenu fiscal de référence : en métropole en 2026, 23 028 € pour 1 part, 35 326 € pour 2 parts (Service-Public.fr, révisé chaque année)."
              />
            </div>
          </details>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>
        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="kpis">
            <Kpi label="Montant visé" value={fmtEur(target)} sub={precautionTargetSub(s.months, s.extraReserve)} />
            <Kpi
              label="Couverture actuelle"
              value={Number.isFinite(covered) ? `${fmtNum(Math.floor(covered * 10) / 10)}\u00a0mois` : '—'}
              sub={gap > 0 ? `il manque ${fmtEur(gap)}` : 'objectif atteint'}
              tone={gap > 0 ? undefined : 'pos'}
            />
            <Kpi label="Délai avec votre versement" value={fmtDelay(path.reachedAt)} sub={`${fmtEur(s.monthlySaving)} par mois`} />
            <Kpi label={`Versement pour y arriver en ${fmtNum(s.deadline)}\u00a0mois`} value={fmtEur(Math.ceil(need))} sub="par mois, intérêts compris" />
          </div>
          <CoverageGauge savings={s.currentSavings} target={target} label="Épargne actuelle" />
          <Takeaway>{precautionTakeaway({ target, savings: s.currentSavings, monthlySaving: s.monthlySaving, reachedAt: path.reachedAt })}</Takeaway>

          {bar && (
            <>
              <h2>D’où viendra la réserve</h2>
              <figure className="bb">
                <div className="bb-bar" role="img" aria-label={bar.segments.map((x) => `${x.label} ${fmtEur(x.amount)}`).join(', ')}>
                  {bar.segments.map((x) => <span key={x.key} className={'bb-seg ' + SEG_CLASS[x.key]} style={{ width: `${x.width}%` }} />)}
                </div>
              </figure>
              <ul className="pf-legend" aria-label="Détail de la barre">
                {bar.segments.map((x) => (
                  <li key={x.key}>
                    <i className={'bb-dot ' + SEG_CLASS[x.key]} aria-hidden="true" />
                    <span><strong>{x.label}</strong> : {fmtEur(x.amount)}{segHint[x.key]}</span>
                  </li>
                ))}
              </ul>
              {interestShare !== null && interestShare < 0.2 && (
                <p className="pf-why">
                  <strong>Les intérêts pèsent peu</strong> ({fmtEur(interestPart?.amount ?? 0)} sur {fmtEur(bar.balance)}) : c’est surtout votre épargne qui la constitue.
                  Son rôle est d’être disponible tout de suite, pas de rapporter.
                </p>
              )}
              <p className="muted small">
                Calcul simplifié, avec des intérêts ajoutés chaque mois. Les livrets, eux, les comptent par quinzaine
                et les versent au 31 décembre (<Link to="/guides/livret-a-calcul-interets-quinzaines">comment ça marche</Link>).
              </p>
            </>
          )}

          <h2>Où placer le montant visé</h2>
          <p className="muted small">
            On remplit d’abord le livret le mieux rémunéré jusqu’à son plafond (la somme maximale que l’on peut y verser), puis le suivant ;
            un seul livret de chaque type par personne. Taux {LIVRETS_PERIOD}, vérifiés au {LIVRETS_AS_OF}.
          </p>
          <ul className="env-list">
            {used.map(({ l, a }) => {
              const pct = l.cap > 0 ? Math.min(100, (a.amount / l.cap) * 100) : 0;
              return (
                <li key={l.id} className="env-item">
                  <div className="env-head">
                    <Link to={`/encyclopedie/${l.slug}`}>{l.name}</Link>
                    <span className="env-rate">≈ {fmtEur(a.interest)} d’intérêts par an</span>
                  </div>
                  <div className="gauge-bar" role="img" aria-label={`${fmtEur(a.amount)} placés sur un plafond de ${fmtEur(l.cap)}${pct >= 100 ? ', livret rempli' : ''}`}>
                    <span className={'gauge-fill' + (pct >= 100 ? ' done' : '')} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="gauge-scale" aria-hidden="true">
                    <span><strong>{fmtEur(a.amount)}</strong> placés à {fmtPct(l.rate)}</span>
                    <span>{pct >= 100 ? 'plafond atteint' : `plafond ${fmtEur(l.cap)}`}</span>
                  </div>
                </li>
              );
            })}
            {alloc.overflow > 0 && (
              <li className="env-item env-over">
                <div className="env-head"><span>Au-delà des plafonds</span></div>
                <div className="env-figs">
                  <span><strong>{fmtEur(alloc.overflow)}</strong> sur d’autres livrets bancaires, généralement imposables (intérêts non estimés)</span>
                </div>
              </li>
            )}
          </ul>
          {unused.length > 0 && (
            <p className="small muted">
              Pas utilisé ici : {unused.map(({ l }) => `${l.name} (plafond ${fmtEur(l.cap)})`).join(', ')}. Le montant visé tient {used.length > 1 ? 'dans les livrets' : 'dans le livret'} ci-dessus.
            </p>
          )}
          {placement && <p className="pf-why">{placement}</p>}
          <ul className="table-notes">
            <li><strong>Sans impôt :</strong> les intérêts de ces livrets sont exonérés d’impôt sur le revenu et de prélèvements sociaux.</li>
            <li><strong>Taux révisables :</strong> un taux réglementé peut changer au 1er février et au 1er août.</li>
          </ul>
          <Fold title="Sources des taux et des plafonds">
            <Sources list={LIVRETS.map((l) => ({ ...l.source, official: true }))} />
          </Fold>
          <SavedSims simKey="precaution" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <SimFaq slug="epargne-de-precaution" />
          <Disclaimer kind="reserve" />
        </section>
      </div>
    </>
  );
}
