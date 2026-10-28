import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  allocateEnvelopes, fmtEur, fmtNum, fmtPct, monthlySavingNeeded, monthsCovered, precautionPath,
  PROFILE_MONTHS, type PrecautionInput, type PrecautionProfile,
} from '../lib/finance';
import { LIVRETS, LIVRETS_AS_OF, LIVRETS_PERIOD } from '../data/livrets';
import { Crumbs, Disclaimer, SimFaq, Kpi, LineChart, NumberField, PageHead, SavedSims, SelectField, Sources, usePersistentState } from '../components/ui';

type State = PrecautionInput & { profile: PrecautionProfile; lep: 'oui' | 'non'; deadline: number };

const DEFAULTS: State = {
  profile: 'stable', monthlyExpenses: 2000, months: PROFILE_MONTHS.stable.months, extraReserve: 1000,
  currentSavings: 2500, monthlySaving: 250, annualRate: 0.017, lep: 'non', deadline: 24,
};

const fmtMonths = (m: number | null) => {
  if (m === null) return 'non atteint en 50 ans';
  if (m === 0) return 'déjà atteint';
  const y = Math.floor(m / 12);
  const r = m % 12;
  return [y ? `${y} an${y > 1 ? 's' : ''}` : '', r ? `${r} mois` : ''].filter(Boolean).join(' et ');
};

export default function SimPrecaution() {
  const [s, setS, up] = usePersistentState<State>('precaution', DEFAULTS);
  const path = useMemo(() => precautionPath(s), [s]);
  const target = path.target;
  const covered = monthsCovered(s.currentSavings, s.monthlyExpenses);
  const gap = Math.max(0, target - s.currentSavings);
  const need = monthlySavingNeeded(target, s.currentSavings, s.deadline, s.annualRate);
  const envelopes = useMemo(() => LIVRETS.filter((l) => s.lep === 'oui' || l.id !== 'lep'), [s.lep]);
  const alloc = useMemo(() => allocateEnvelopes(target, envelopes), [target, envelopes]);
  const chart = path.series.length > 1 ? path.series : [path.series[0], { ...path.series[0], month: 1 }];
  const step = Math.max(1, Math.ceil(chart.length / 60));
  const points = chart.filter((_, i) => i % step === 0 || i === chart.length - 1);

  const setProfile = (p: PrecautionProfile) => setS((x) => ({ ...x, profile: p, months: PROFILE_MONTHS[p].months }));

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Épargne de précaution' }]} />
      <PageHead eyebrow="Simulateur" title="Simulateur d'épargne de précaution">
        Estimez la réserve à garder disponible pour un imprévu, le temps pour la constituer et sa répartition possible sur les livrets réglementés.
      </PageHead>
      <p className="notice" role="note">
        Aucune règle officielle ne fixe le montant d'une épargne de précaution. Les durées proposées (3, 6 ou 9 mois de dépenses) sont des repères
        pédagogiques courants, à adapter à votre situation : stabilité des revenus, personnes à charge, état du logement et de la voiture, couverture santé.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Montant visé</legend>
            <SelectField
              label="Situation professionnelle"
              value={s.profile}
              onChange={setProfile}
              options={(Object.keys(PROFILE_MONTHS) as PrecautionProfile[]).map((k) => ({ v: k, label: PROFILE_MONTHS[k].label }))}
              hint="Propose un nombre de mois, modifiable ci-dessous."
            />
            <NumberField label="Dépenses mensuelles incompressibles" unit="€" value={s.monthlyExpenses} onChange={up('monthlyExpenses')} min={0} step={100} hint="Logement, alimentation, énergie, transport, assurances, remboursements de crédit." />
            <NumberField label="Nombre de mois à couvrir" unit="mois" value={s.months} onChange={up('months')} min={0} max={24} step={1} />
            <NumberField label="Réserve pour dépenses prévisibles" unit="€" value={s.extraReserve} onChange={up('extraReserve')} min={0} step={500} hint="Franchise d'assurance, réparation, remplacement d'un appareil…" />
          </fieldset>
          <fieldset>
            <legend>Constitution</legend>
            <NumberField label="Épargne disponible aujourd'hui" unit="€" value={s.currentSavings} onChange={up('currentSavings')} min={0} step={500} hint="Sommes mobilisables sans délai ni perte." />
            <NumberField label="Versement mensuel" unit="€" value={s.monthlySaving} onChange={up('monthlySaving')} min={0} step={50} />
            <NumberField label="Taux de rémunération" unit="%" percent value={s.annualRate} onChange={up('annualRate')} min={0} max={10} step={0.1} hint={`Livret A et LDDS : ${fmtPct(LIVRETS[1].rate)} ${LIVRETS_PERIOD}.`} />
            <NumberField label="Délai souhaité" unit="mois" value={s.deadline} onChange={up('deadline')} min={1} max={120} step={1} />
            <SelectField
              label="Éligible au LEP"
              value={s.lep}
              onChange={up('lep')}
              options={[{ v: 'non', label: 'Non ou je ne sais pas' }, { v: 'oui', label: 'Oui' }]}
              hint="Selon le revenu fiscal de référence : vérifiez le plafond de l'année sur Service-Public.fr."
            />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
          <div className="kpis">
            <Kpi label="Montant visé" value={fmtEur(target)} sub={`${fmtNum(s.months)} mois × ${fmtEur(s.monthlyExpenses)} + ${fmtEur(s.extraReserve)}`} />
            <Kpi
              label="Couverture actuelle"
              value={Number.isFinite(covered) ? `${fmtNum(Math.floor(covered * 10) / 10)} mois` : '—'}
              sub={gap > 0 ? `il manque ${fmtEur(gap)}` : 'objectif atteint'}
              tone={gap > 0 ? undefined : 'pos'}
            />
            <Kpi label="Délai avec votre versement" value={fmtMonths(path.reachedAt)} sub={`${fmtEur(s.monthlySaving)} par mois`} />
            <Kpi label={`Versement pour y arriver en ${fmtNum(s.deadline)} mois`} value={fmtEur(Math.ceil(need))} sub="par mois, intérêts compris" />
          </div>

          <h2>Constitution de la réserve</h2>
          <p className="muted small">
            Intérêts au taux mensuel équivalent, versement en fin de mois. Approximation : les livrets réglementés calculent les intérêts par quinzaine
            et les versent une fois par an, au 31 décembre.
          </p>
          <div className="panel">
            <LineChart
              title="Épargne de précaution accumulée"
              xLabels={points.map((p) => `Mois ${p.month}`)}
              format={fmtEur}
              series={[
                { name: 'Épargne accumulée', color: 'var(--chart-1)', values: points.map((p) => p.balance) },
                { name: 'Montant visé', color: 'var(--chart-3)', values: points.map(() => target) },
              ]}
            />
          </div>

          <h2>Une répartition possible du montant visé</h2>
          <p className="muted small">
            Remplissage du livret le mieux rémunéré vers le moins rémunéré, dans la limite des plafonds de versement (un livret de chaque type par personne).
            Taux {LIVRETS_PERIOD}, vérifiés au {LIVRETS_AS_OF}.
          </p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Support</th><th className="r">Taux</th><th className="r">Plafond</th><th className="r">Montant</th><th className="r">Intérêts sur un an</th></tr></thead>
              <tbody>
                {envelopes.map((l, i) => (
                  <tr key={l.id}>
                    <td><Link to={`/encyclopedie/${l.slug}`}>{l.name}</Link></td>
                    <td className="r">{fmtPct(l.rate)}</td>
                    <td className="r">{fmtEur(l.cap)}</td>
                    <td className="r">{fmtEur(alloc.allocations[i].amount)}</td>
                    <td className="r">{fmtEur(alloc.allocations[i].interest)}</td>
                  </tr>
                ))}
                {alloc.overflow > 0 && (
                  <tr>
                    <td>Au-delà des plafonds</td>
                    <td className="r">—</td>
                    <td className="r">—</td>
                    <td className="r">{fmtEur(alloc.overflow)}</td>
                    <td className="r">non estimé</td>
                  </tr>
                )}
                <tr style={{ fontWeight: 600 }}>
                  <td>Total</td>
                  <td className="r">{fmtPct(alloc.blendedRate)}</td>
                  <td className="r"></td>
                  <td className="r">{fmtEur(target)}</td>
                  <td className="r">{fmtEur(alloc.interest)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Les intérêts des livrets réglementés sont exonérés d'impôt sur le revenu et de prélèvements sociaux. Au-delà des plafonds, d'autres livrets
            bancaires existent, généralement imposables. Un taux réglementé peut changer au 1er février et au 1er août.
          </p>
          <h2>Sources</h2>
          <Sources list={LIVRETS.map((l) => ({ ...l.source, official: true }))} />
          <SavedSims simKey="precaution" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <SimFaq slug="epargne-de-precaution" />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
        </section>
      </div>
    </>
  );
}
