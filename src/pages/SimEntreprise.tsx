import { useMemo, useState } from 'react';
import { BUSINESS_SCENARIOS, fmtEur, fmtPct, lowestCash, projectBusiness, type BusinessInput } from '../lib/finance';
import { Crumbs, Disclaimer, Fold, SimFaq, Kpi, LineChart, NumberField, PageHead, SavedSims, Tabs, usePersistentState } from '../components/ui';

const DEFAULTS: BusinessInput = {
  revenueY1: 120000, revenueGrowth: 0.1, grossMarginRate: 0.6, fixedCosts: 30000, fixedCostsGrowth: 0.02,
  founderPay: 24000, socialRate: 0.45, corporateTaxRate: 0.25, receivableDays: 30,
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

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Entreprise' }]} />
      <PageHead eyebrow="Calculateur" title="Calculateur entrepreneurial">
        Chiffre d'affaires, marge, charges, rémunération, trésorerie et valorisation sur plusieurs années, en trois scénarios.
      </PageHead>

      <div className="grid cols-4" role="note" style={{ marginBottom: 24 }}>
        {[
          ["Chiffre d'affaires", 'Le total des ventes. Ce n’est pas ce que vous gagnez.'],
          ['Résultat', 'Ce qui reste après charges, rémunération et impôt sur les sociétés.'],
          ['Trésorerie', 'L’argent réellement disponible. Elle baisse quand les clients paient en retard.'],
          ["Valeur de l'entreprise", 'Une estimation de prix de cession. Ce n’est ni un revenu ni de la trésorerie.'],
        ].map(([t, d]) => (
          <div key={t} className="panel small"><strong>{t}</strong><div className="muted">{d}</div></div>
        ))}
      </div>

      <div className="sim">
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Activité</legend>
            <NumberField label="Chiffre d'affaires, année 1" unit="€" value={s.revenueY1} onChange={up('revenueY1')} min={0} step={5000} />
            <NumberField label="Croissance annuelle du CA" unit="%" percent value={s.revenueGrowth} onChange={up('revenueGrowth')} step={1} min={-50} max={300} />
            <NumberField label="Marge brute" unit="% du CA" percent value={s.grossMarginRate} onChange={up('grossMarginRate')} step={1} min={0} max={100} hint="CA moins achats et coûts directs." />
          </fieldset>
          <fieldset>
            <legend>Charges et rémunération</legend>
            <NumberField label="Charges fixes annuelles" unit="€" value={s.fixedCosts} onChange={up('fixedCosts')} min={0} step={1000} />
            <NumberField label="Évolution des charges fixes" unit="%/an" percent value={s.fixedCostsGrowth} onChange={up('fixedCostsGrowth')} step={0.5} min={-20} max={50} />
            <NumberField label="Rémunération nette du dirigeant" unit="€/an" value={s.founderPay} onChange={up('founderPay')} min={0} step={1000} />
            <NumberField label="Charges sociales" unit="% du net" percent value={s.socialRate} onChange={up('socialRate')} step={1} min={0} max={150} hint="Varie fortement selon le statut : à vérifier avec l'URSSAF." />
            <NumberField label="Impôt sur les sociétés" unit="%" percent value={s.corporateTaxRate} onChange={up('corporateTaxRate')} step={1} min={0} max={50} hint="Taux normal 25 % ; un taux réduit existe sous conditions pour les PME (à vérifier)." />
          </fieldset>
          <fieldset>
            <legend>Trésorerie et valorisation</legend>
            <NumberField label="Trésorerie de départ" unit="€" value={s.initialCash} onChange={up('initialCash')} step={1000} />
            <NumberField label="Investissement initial" unit="€" value={s.initialInvestment} onChange={up('initialInvestment')} min={0} step={1000} />
            <NumberField label="Délai de paiement clients" unit="jours" value={s.receivableDays} onChange={up('receivableDays')} min={0} max={180} />
            <NumberField label="Multiple de valorisation" unit="× résultat" value={s.valuationMultiple} onChange={up('valuationMultiple')} min={0} max={30} step={0.5} hint="Hypothèse : les multiples varient beaucoup selon le secteur et la taille." />
            <NumberField label="Durée" unit="ans" value={s.years} onChange={up('years')} min={1} max={15} />
          </fieldset>
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>

        <section aria-label="Résultats">
          <h2 style={{ marginTop: 0 }}>Trois scénarios à {s.years} ans</h2>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th>Scénario</th><th className="r">CA final</th><th className="r">Résultat net final</th><th className="r">Trésorerie finale</th><th className="r">Trésorerie la plus basse</th><th className="r">Valeur estimée</th></tr></thead>
              <tbody>
                {runs.map((r, i) => {
                  const l = r[r.length - 1];
                  const low = lowestCash(r, start);
                  return (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap' }}><span style={{ color: COLORS[i] }}>●</span> {LABELS[i]}</td>
                      <td className="r">{fmtEur(l?.revenue ?? 0)}</td>
                      <td className={'r ' + ((l?.netResult ?? 0) < 0 ? 'neg' : '')}>{fmtEur(l?.netResult ?? 0)}</td>
                      <td className={'r ' + ((l?.cash ?? 0) < 0 ? 'neg' : '')}>{fmtEur(l?.cash ?? 0)}</td>
                      <td className={'r ' + (low < 0 ? 'neg' : '')}>{fmtEur(low)}</td>
                      <td className="r">{fmtEur(l?.valuation ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="small muted">
            Pessimiste : CA de départ −20 %, croissance −5 points, marge −5 points. Optimiste : CA +15 %, croissance +5 points, marge +3 points.
            Une trésorerie négative signale un besoin de financement.
          </p>
          <div className="panel">
            <LineChart
              title="Trésorerie selon les scénarios"
              xLabels={Array.from({ length: s.years + 1 }, (_, y) => `An ${y}`)}
              format={fmtEur}
              series={runs.map((r, i) => ({ name: LABELS[i], color: COLORS[i], values: [start, ...r.map((y) => y.cash)] }))}
            />
          </div>

          <h2>Détail par année</h2>
          <Tabs label="Scénario détaillé" items={LABELS} active={tab} onSelect={setTab} />
          {last && (
            <div className="kpis">
              <Kpi label="Marge brute finale" value={fmtEur(last.grossMargin)} sub={fmtPct(last.revenue ? last.grossMargin / last.revenue : 0) + ' du CA'} />
              <Kpi label="Coût de la rémunération" value={fmtEur(last.payrollCost)} sub="net + charges sociales" />
              <Kpi label="Impôt sur les sociétés" value={fmtEur(last.corporateTax)} />
            </div>
          )}
          <Fold title="Tableau détaillé année par année">
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead>
                <tr><th>Année</th><th className="r">CA</th><th className="r">Marge brute</th><th className="r">Charges fixes</th><th className="r">Rémunération chargée</th><th className="r">Résultat avant IS</th><th className="r">IS</th><th className="r">Résultat net</th><th className="r">Besoin en fonds de roulement</th><th className="r">Flux de trésorerie</th><th className="r">Trésorerie</th><th className="r">Valeur estimée</th></tr>
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
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="entreprise" />
        </section>
      </div>
    </>
  );
}
