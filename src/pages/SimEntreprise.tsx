import { useMemo, useState } from 'react';
import { businessTakeaway, businessZeroValueNote } from '../lib/takeaways';
import { BUSINESS_SCENARIOS, IS_RATES, fmtEur, fmtPct, lowestCash, projectBusiness, type BusinessInput } from '../lib/finance';
import { fmtDate } from '../lib/dates';
import { ChoiceField, Crumbs, Disclaimer, Fold, MobileFold, SimFaq, Takeaway, Kpi, LineChart, NumberField, PageHead, SavedSims, Tabs, usePersistentState, JumpToResults } from '../components/ui';

const DEFAULTS: BusinessInput = {
  revenueY1: 120000, revenueGrowth: 0.1, grossMarginRate: 0.6, fixedCosts: 30000, fixedCostsGrowth: 0.02,
  founderPay: 24000, socialRate: 0.45, corporateTaxRate: IS_RATES.normal, smallBusinessRate: true, receivableDays: 30,
  initialCash: 15000, initialInvestment: 10000, valuationMultiple: 5, years: 5,
};

const KEYS = ['pessimiste', 'central', 'optimiste'] as const;
const LABELS = ['Pessimiste', 'Central', 'Optimiste'];
const COLORS = ['var(--chart-3)', 'var(--chart-1)', 'var(--chart-2)'];

export default function SimEntreprise() {
  const [s, setS, up] = usePersistentState<BusinessInput>('entreprise', DEFAULTS);
  const [tab, setTab] = useState(1);
  const runs = useMemo(() => KEYS.map((k) => projectBusiness(s, BUSINESS_SCENARIOS[k])), [s]);
  const rows = runs[tab];
  const start = s.initialCash - s.initialInvestment;
  const last = rows[rows.length - 1];
  const finals = runs.map((r) => r[r.length - 1]);
  const scenarioRows: { label: string; hint?: string; values: number[]; signed?: boolean }[] = [
    { label: 'Chiffre d’affaires final', values: finals.map((l) => l?.revenue ?? 0) },
    { label: 'Résultat net final', hint: 'après impôt', values: finals.map((l) => l?.netResult ?? 0), signed: true },
    { label: 'Trésorerie finale', values: finals.map((l) => l?.cash ?? 0), signed: true },
    { label: 'Trésorerie la plus basse', hint: 'sous 0\u00a0€ : à financer', values: runs.map((r) => lowestCash(r, start)), signed: true },
    { label: 'Valeur estimée', hint: `${String(s.valuationMultiple).replace('.', ',')}\u00a0× le résultat net`, values: finals.map((l) => l?.valuation ?? 0) },
  ];
  // Montants très longs (plus de 10 caractères) : sur mobile, une ligne par scénario plutôt que trois colonnes trop étroites
  const longValues = scenarioRows.some((r) => r.values.some((v) => fmtEur(v).length > 10));
  // Taux appliqués la dernière année : le taux réduit ne touche que les premiers 42 500 € de bénéfice
  const reducedApplies = !!last && s.smallBusinessRate === true && last.revenue <= IS_RATES.maxTurnover && last.corporateTax > 0;
  const taxSub = !last || last.corporateTax <= 0
    ? 'aucun bénéfice imposable'
    : reducedApplies
      ? last.corporateTax > IS_RATES.reducedCap * IS_RATES.reduced + 0.005
        ? `${fmtPct(IS_RATES.reduced)} jusqu’à ${fmtEur(IS_RATES.reducedCap)}, ${fmtPct(s.corporateTaxRate)} au-delà`
        : `taux réduit de ${fmtPct(IS_RATES.reduced)}`
      : `taux de ${fmtPct(s.corporateTaxRate)}`;
  const zeroValue = businessZeroValueNote({ multiple: s.valuationMultiple, scenarios: runs.map((r, i) => ({ label: LABELS[i], netResultLast: r[r.length - 1]?.netResult ?? 0 })) });

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Entreprise' }]} />
      <PageHead eyebrow="Calculateur" title="Calculateur entrepreneurial">
        Ventes, charges, rémunération, trésorerie et valeur de l’entreprise sur plusieurs années, en trois scénarios. Quatre réglages suffisent : les autres sont facultatifs.
      </PageHead>

      <div style={{ marginBottom: 24 }}>
      <MobileFold label="Quatre mots à connaître">
      <div className="grid cols-4" role="note">
        {[
          ["Chiffre d'affaires", 'Le total des ventes. Ce n’est pas ce que vous gagnez.'],
          ['Résultat', 'Ce qui reste après charges, rémunération et impôt sur les sociétés.'],
          ['Trésorerie', 'L’argent réellement disponible. Elle baisse quand les clients paient en retard.'],
          ["Valeur de l'entreprise", 'Une estimation de prix de cession. Ce n’est ni un revenu ni de la trésorerie.'],
        ].map(([t, d]) => (
          <div key={t} className="panel small"><strong>{t}</strong><div className="muted">{d}</div></div>
        ))}
      </div>
      </MobileFold>
      </div>

      <div className="sim">
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>L'essentiel : 4 réglages</legend>
            <NumberField label="Chiffre d'affaires, année 1" unit="€" value={s.revenueY1} onChange={up('revenueY1')} min={0} step={5000} sliderMax={1000000} hint="Le total des ventes prévues la première année." />
            <NumberField label="Marge brute" unit="% des ventes" percent value={s.grossMarginRate} onChange={up('grossMarginRate')} step={1} min={0} max={100} sliderMax={100} hint="Ventes moins achats et coûts directs." />
            <NumberField label="Charges fixes annuelles" unit="€" value={s.fixedCosts} onChange={up('fixedCosts')} min={0} step={1000} sliderMax={300000} hint="Loyer, abonnements, assurances… ce que vous payez même sans vente." />
            <NumberField label="Rémunération nette du dirigeant" unit="€/an" value={s.founderPay} onChange={up('founderPay')} min={0} step={1000} sliderMax={120000} />
          </fieldset>
          <details className="fold advanced">
            <summary>Réglages avancés (facultatif)</summary>
            <div className="advanced-body">
              <p className="small muted">Déjà remplis avec des valeurs d'exemple. Si vous ne savez pas, laissez-les telles quelles.</p>
              <fieldset>
                <legend>Croissance et trésorerie de départ</legend>
                <NumberField label="Croissance annuelle des ventes" unit="%" percent value={s.revenueGrowth} onChange={up('revenueGrowth')} step={1} min={-50} max={300} hint="De combien les ventes augmentent chaque année." />
                <NumberField label="Trésorerie de départ" unit="€" value={s.initialCash} onChange={up('initialCash')} step={1000} hint="L'argent disponible au lancement." />
              </fieldset>
              <fieldset>
                <legend>Charges et impôt</legend>
                <NumberField label="Évolution des charges fixes" unit="%/an" percent value={s.fixedCostsGrowth} onChange={up('fixedCostsGrowth')} step={0.5} min={-20} max={50} />
                <NumberField label="Charges sociales" unit="% du net" percent value={s.socialRate} onChange={up('socialRate')} step={1} min={0} max={150} hint="Varie fortement selon le statut : à vérifier avec l'URSSAF." />
                <ChoiceField label="Impôt sur les sociétés" value={s.smallBusinessRate ? 1 : 0} onChange={(v) => up('smallBusinessRate')(v === 1)} columns={2}
                  options={[
                    { v: 1, label: 'Taux réduit PME', detail: `${fmtPct(IS_RATES.reduced)} jusqu’à ${fmtEur(IS_RATES.reducedCap)}` },
                    { v: 0, label: 'Taux normal', detail: 'sur tout le bénéfice' },
                  ]}
                  hint={`Taux réduit si le chiffre d’affaires ne dépasse pas 10\u00a0millions d’euros et si le capital, entièrement libéré, est détenu à 75\u00a0% au moins par des personnes physiques (impots.gouv.fr, vérifié le ${fmtDate(IS_RATES.verifiedOn)}).`} />
                <NumberField label="Taux normal de l’impôt sur les sociétés" unit="%" percent value={s.corporateTaxRate} onChange={up('corporateTaxRate')} step={1} min={0} max={50} hint={`Taux en vigueur : ${fmtPct(IS_RATES.normal)}. Avec le taux réduit, il ne touche que le bénéfice au-delà de ${fmtEur(IS_RATES.reducedCap)}.`} />
              </fieldset>
              <fieldset>
                <legend>Trésorerie et valorisation</legend>
                <NumberField label="Investissement initial" unit="€" value={s.initialInvestment} onChange={up('initialInvestment')} min={0} step={1000} hint="Matériel, aménagement… dépensé au départ." />
                <NumberField label="Délai de paiement clients" unit="jours" value={s.receivableDays} onChange={up('receivableDays')} min={0} max={180} hint="Plus vos clients paient tard, moins vous avez de trésorerie." />
                <NumberField label="Multiple de valorisation" unit="× résultat" value={s.valuationMultiple} onChange={up('valuationMultiple')} min={0} max={30} step={0.5} hint="Hypothèse : les multiples varient beaucoup selon le secteur et la taille." />
                <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={15} />
              </fieldset>
            </div>
          </details>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>

        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <h2 style={{ marginTop: 0 }}>Trois scénarios à {s.years}&nbsp;ans</h2>
          <div className="table-wrap scn-wrap">
            <table className={'scn-table' + (longValues ? ' scn-long' : '')}>
              <caption className="sr-only">Résultats des trois scénarios à {s.years}&nbsp;ans, un indicateur par ligne</caption>
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Indicateur</span></th>
                  {LABELS.map((l, i) => (
                    <th key={l} scope="col" className="r"><span aria-hidden="true" className="scn-dot" style={{ background: COLORS[i] }} />{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenarioRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}{row.hint && <span className="scn-hint">{row.hint}</span>}</th>
                    {row.values.map((v, i) => (
                      <td key={i} data-label={LABELS[i]} className={'r ' + (row.signed && v < 0 ? 'neg' : '')}>{fmtEur(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Takeaway>{businessTakeaway({ central: runs[1], pessimistic: runs[0], start })}</Takeaway>
          <p className="small muted">
            Pessimiste : ventes de départ −20 %, croissance −5 points, marge −5 points. Optimiste : ventes +15 %, croissance +5 points, marge +3 points.
            {zeroValue && <> {zeroValue}</>}
          </p>
          <div className="panel">
            <LineChart
              title="Trésorerie selon les scénarios"
            showTitle
              xLabels={Array.from({ length: s.years + 1 }, (_, y) => `An ${y}`)}
              format={fmtEur}
              series={runs.map((r, i) => ({ name: LABELS[i], color: COLORS[i], values: [start, ...r.map((y) => y.cash)] }))}
            />
          </div>

          <h2>Détail par année</h2>
          <Tabs label="Scénario détaillé" items={LABELS} active={tab} onSelect={setTab} />
          {last && (
            <div className="kpis">
              <Kpi label="Marge brute finale" value={fmtEur(last.grossMargin)} sub={fmtPct(last.revenue ? last.grossMargin / last.revenue : 0) + ' du chiffre d’affaires'} />
              <Kpi label="Coût de la rémunération" value={fmtEur(last.payrollCost)} sub="net + charges sociales" />
              <Kpi label="Impôt sur les sociétés" value={fmtEur(last.corporateTax)} sub={taxSub} />
            </div>
          )}
          <Fold title="Tableau détaillé année par année">
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead>
                <tr><th>Année</th><th className="r">Chiffre d’affaires</th><th className="r">Marge brute</th><th className="r">Charges fixes</th><th className="r">Rémunération et charges sociales</th><th className="r">Résultat avant impôt</th><th className="r">Impôt sur les sociétés</th><th className="r">Résultat net</th><th className="r">Besoin en fonds de roulement</th><th className="r">Flux de trésorerie</th><th className="r">Trésorerie</th><th className="r">Valeur estimée</th></tr>
              </thead>
              <tbody>
                {rows.map((y) => (
                  <tr key={y.year}>
                    <td>{y.year}</td>
                    <td className="r">{fmtEur(y.revenue)}</td>
                    <td className="r">{fmtEur(y.grossMargin)}</td>
                    <td className="r">{fmtEur(y.fixedCosts)}</td>
                    <td className="r">{fmtEur(y.payrollCost)}</td>
                    <td className={'r ' + (y.operatingResult < 0 ? 'neg' : '')}>{fmtEur(y.operatingResult)}</td>
                    <td className="r">{fmtEur(y.corporateTax)}</td>
                    <td className={'r ' + (y.netResult < 0 ? 'neg' : '')}>{fmtEur(y.netResult)}</td>
                    <td className="r">{fmtEur(y.workingCapital)}</td>
                    <td className={'r ' + (y.cashFlow < 0 ? 'neg' : 'pos')}>{fmtEur(y.cashFlow)}</td>
                    <td className={'r ' + (y.cash < 0 ? 'neg' : '')}>{fmtEur(y.cash)}</td>
                    <td className="r">{fmtEur(y.valuation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Simplifications : pas d'amortissements comptables ni d'emprunt ; les pertes sont reportées sur les bénéfices suivants ; le besoin en fonds de
            roulement ne tient compte que des délais clients. La valeur estimée n'est pas une offre de rachat.
          </p>
          </Fold>
          <SavedSims simKey="entreprise" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
        </section>
      </div>
      <Disclaimer kind="entreprise" />
      <SimFaq slug="entreprise" />
    </>
  );
}
