import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ADVERSE, adverseScenario, amortize, fmtEur, fmtPct, rentalAnalysis, rentalBalance, rentalProjection, type RentalBalance, type RentalInput, type TaxRegime } from '../lib/finance';
import { rentalCashflowSub, rentalTakeaway } from '../lib/takeaways';
import { Crumbs, Disclaimer, Fold, SimFaq, Takeaway, Kpi, LineChart, NumberField, PageHead, SavedSims, ChoiceField, usePersistentState, JumpToResults } from '../components/ui';

export const RENTAL_DEFAULTS: RentalInput = {
  price: 150000, notaryRate: 0.08, works: 10000, furniture: 0,
  monthlyRent: 750, vacancyMonths: 1, propertyTax: 900, coOwnership: 600, insurancePno: 150,
  managementRate: 0, maintenanceRate: 0.05,
  downPayment: 22000, loanRate: 0.035, loanYears: 20, loanInsuranceRate: 0.003,
  regime: 'micro-foncier', marginalRate: 0.3, socialRate: 0.172, microAllowance: 0.3, annualDepreciation: 4000,
  appreciation: 0.01, indexation: 0.015, horizon: 20,
};

// Ordre d'affichage en deux colonnes : location nue sur la première ligne, location meublée sur la deuxième.
export const REGIMES: { v: TaxRegime; label: string; detail?: string; allowance?: number }[] = [
  { v: 'micro-foncier', label: 'Micro-foncier', detail: 'location nue, abattement 30 %', allowance: 0.3 },
  { v: 'reel-foncier', label: 'Régime réel', detail: 'location nue' },
  { v: 'micro-bic', label: 'Micro-BIC', detail: 'location meublée, abattement 50 %', allowance: 0.5 },
  { v: 'reel-bic', label: 'LMNP au réel', detail: 'location meublée' },
  { v: 'aucune', label: 'Ne pas estimer l’impôt' },
];

export const TMI_OPTIONS = [0, 0.11, 0.3, 0.41, 0.45].map((v) => ({ v, label: `${Math.round(v * 100)} %` }));
export const PS_OPTIONS = [
  { v: 0.172, label: '17,2 %', detail: 'revenus fonciers' },
  { v: 0.186, label: '18,6 %', detail: 'taux général des revenus du patrimoine ; à confirmer pour le meublé' },
];

/** Bilan d'un scénario : deux barres à la même échelle, « sorti de votre poche » et « détenu à la fin ». */
function BalanceGroup({ title, b, scale }: { title: string; b: RentalBalance; scale: number }) {
  const w = (n: number) => `${scale > 0 ? (Math.max(0, n) / scale) * 100 : 0}%`;
  // Écart calculé sur les montants arrondis affichés, pour que la soustraction tombe juste à l'euro près.
  const diff = Math.round(b.got) - Math.round(b.putIn);
  return (
    <li className="rb-group">
      <h3 className="rb-title">{title}</h3>
      <div className="fb-row">
        <div className="fb-head"><span className="fb-name">Sorti de votre poche</span><span className="fb-value">{fmtEur(b.putIn)}</span></div>
        <div className="fb-track" aria-hidden="true">
          <span className="rb-down" style={{ width: w(b.downPayment) }} />
          <span className="rb-top" style={{ width: w(b.topUps) }} />
        </div>
      </div>
      <div className="fb-row">
        <div className="fb-head"><span className="fb-name">Détenu à la fin</span><span className="fb-value">{fmtEur(b.got)}</span></div>
        <div className="fb-track" aria-hidden="true">
          <span className="rb-eq" style={{ width: w(b.netEquity) }} />
          <span className="rb-cash" style={{ width: w(b.received) }} />
        </div>
      </div>
      <p className={'rb-diff ' + (diff >= 0 ? 'pos' : 'neg')}>
        {diff >= 0
          ? <>Écart : <strong>+{fmtEur(diff)}</strong> en votre faveur</>
          : <>Écart : <strong>{fmtEur(diff)}</strong>, vous auriez sorti plus que ce que vous détenez</>}
      </p>
    </li>
  );
}

export default function SimImmobilier() {
  const [s, setS, up] = usePersistentState<RentalInput>('immobilier', RENTAL_DEFAULTS);
  const r = useMemo(() => rentalAnalysis(s), [s]);
  const loan = useMemo(() => amortize({ principal: r.loanAmount, annualRate: s.loanRate, years: s.loanYears, insuranceRate: s.loanInsuranceRate }), [r.loanAmount, s]);
  const proj = useMemo(() => rentalProjection(s), [s]);
  const bad = useMemo(() => adverseScenario(s), [s]);
  const badSnap = useMemo(() => rentalAnalysis(bad), [bad]);
  const badProj = useMemo(() => rentalProjection(bad), [bad]);
  const y1 = proj[0];
  const end = proj[proj.length - 1];
  const badEnd = badProj[badProj.length - 1];
  const isMicro = s.regime === 'micro-foncier' || s.regime === 'micro-bic';
  const bal = useMemo(() => rentalBalance(s, proj), [s, proj]);
  const badBal = useMemo(() => rentalBalance(bad, badProj), [bad, badProj]);
  const balScale = Math.max(bal.putIn, bal.got, badBal.putIn, badBal.got, 0);
  const anyReceived = bal.received > 0 || badBal.received > 0;
  const anyTopUps = bal.topUps > 0 || badBal.topUps > 0;

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Immobilier locatif' }]} />
      <PageHead eyebrow="Calculateur" title="Calculateur immobilier locatif">
        Combien coûte le crédit, ce que rapporte le loyer et ce qu'il reste à votre charge chaque mois, avec un scénario défavorable.
        Calculs avant impôt et estimations après impôt sont présentés séparément.
      </PageHead>
      <div className="sim">
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Votre projet</legend>
            <NumberField label="Prix du bien" unit="€" value={s.price} onChange={up('price')} min={0} step={5000} sliderMax={1000000} />
            <NumberField label="Apport" unit="€" value={s.downPayment} onChange={up('downPayment')} min={0} step={1000} sliderMax={300000} hint="La somme que vous payez de votre poche ; le reste est emprunté." />
            <NumberField label="Taux du crédit (hors assurance)" unit="%" percent value={s.loanRate} onChange={up('loanRate')} step={0.05} min={0} max={15} sliderMax={8} hint="Le taux figure dans l'offre de votre banque ; la valeur proposée n'est qu'un exemple." />
            <NumberField label="Durée du crédit" unit="ans" value={s.loanYears} onChange={up('loanYears')} min={0} max={30} sliderMax={30} />
            <NumberField label="Loyer mensuel hors charges" unit="€" value={s.monthlyRent} onChange={up('monthlyRent')} min={0} step={25} sliderMax={3000} />
          </fieldset>
          <details className="fold advanced">
            <summary>Réglages avancés (facultatif)</summary>
            <div className="advanced-body">
              <p className="small muted">Déjà remplis avec des valeurs d'exemple. Si vous ne savez pas, laissez-les telles quelles.</p>
              <fieldset>
                <legend>Acquisition</legend>
                <NumberField label="Frais d'acquisition" unit="%" percent value={s.notaryRate} onChange={up('notaryRate')} step={0.5} min={0} max={20} hint="Ordre de grandeur : 6 à 8 % du prix dans l’ancien, 2 à 3,5 % dans le neuf (La finance pour tous, juillet 2026)." />
                <NumberField label="Travaux" unit="€" value={s.works} onChange={up('works')} min={0} step={1000} />
                <NumberField label="Mobilier" unit="€" value={s.furniture} onChange={up('furniture')} min={0} step={500} />
                <NumberField label="Assurance emprunteur" unit="%" percent value={s.loanInsuranceRate} onChange={up('loanInsuranceRate')} step={0.05} min={0} max={2} hint="Taux annuel sur le capital emprunté." />
              </fieldset>
              <fieldset>
                <legend>Location et charges</legend>
                <NumberField label="Vacance locative" unit="mois/an" value={s.vacancyMonths} onChange={up('vacancyMonths')} min={0} max={12} step={0.5} hint="Mois par an sans locataire." />
                <NumberField label="Charges non récupérables" unit="€/an" value={s.coOwnership} onChange={up('coOwnership')} min={0} step={50} />
                <NumberField label="Assurance propriétaire non occupant" unit="€/an" value={s.insurancePno} onChange={up('insurancePno')} min={0} step={10} />
                <NumberField label="Taxe foncière" unit="€/an" value={s.propertyTax} onChange={up('propertyTax')} min={0} step={50} />
                <NumberField label="Entretien" unit="% loyers" percent value={s.maintenanceRate} onChange={up('maintenanceRate')} step={0.5} min={0} max={20} />
                <NumberField label="Frais de gestion" unit="% loyers" percent value={s.managementRate} onChange={up('managementRate')} step={0.5} min={0} max={15} />
              </fieldset>
              <fieldset>
                <legend>Fiscalité (estimation)</legend>
                <ChoiceField label="Régime" value={s.regime} options={REGIMES} columns={2} onChange={(v) => setS((x) => ({ ...x, regime: v, microAllowance: REGIMES.find((g) => g.v === v)?.allowance ?? x.microAllowance }))} />
                <ChoiceField label="Tranche marginale d'imposition" value={s.marginalRate} options={TMI_OPTIONS} onChange={up('marginalRate')} compact />
                <ChoiceField label="Prélèvements sociaux" value={s.socialRate} options={PS_OPTIONS} columns={1} onChange={up('socialRate')} />
                {isMicro && <NumberField label="Abattement forfaitaire" unit="%" percent value={s.microAllowance} onChange={up('microAllowance')} step={1} min={0} max={100} />}
                {s.regime === 'reel-bic' && (
                  <NumberField label="Amortissement annuel estimé" unit="€" value={s.annualDepreciation} onChange={up('annualDepreciation')} min={0} step={250}
                    hint="À établir avec un expert-comptable (bâti, mobilier, travaux)." />
                )}
              </fieldset>
              <fieldset>
                <legend>Projection</legend>
                <NumberField label="Évolution annuelle du prix du bien" unit="%" percent value={s.appreciation} onChange={up('appreciation')} step={0.25} min={-10} max={10} hint="Hypothèse, non une prévision." />
                <NumberField label="Indexation des loyers et charges" unit="%" percent value={s.indexation} onChange={up('indexation')} step={0.25} min={-5} max={10} />
                <NumberField label="Horizon" unit="ans" value={s.horizon} onChange={up('horizon')} min={1} max={40} />
              </fieldset>
            </div>
          </details>
          <button type="button" className="btn small secondary" onClick={() => setS(RENTAL_DEFAULTS)}>Réinitialiser</button>
          <JumpToResults />
        </form>

        <section id="resultats" aria-label="Résultats" tabIndex={-1}>
          <div className="section-label">Avant impôt · première année</div>
          <div className="kpis">
            <Kpi label="Mensualité" value={fmtEur(r.monthlyLoan)} sub="assurance comprise" />
            <Kpi label="Coût total du crédit" value={fmtEur(loan.totalCost)} sub={`dont ${fmtEur(loan.totalInterest)} d'intérêts`} />
            <Kpi label="Rendement brut" value={fmtPct(r.grossYield)} sub="loyers d’une année rapportés au prix d’achat" />
            <Kpi label="Rendement net de charges" value={fmtPct(r.netYield)} sub="loyers après charges, sur le coût total frais compris" />
            <Kpi label="Solde mensuel (cash-flow)" value={fmtEur(r.monthlyCashflow)} tone={r.monthlyCashflow >= 0 ? 'pos' : 'neg'} sub={rentalCashflowSub(r.monthlyCashflow, false)} />
          </div>

          <div className="section-label">Estimation après impôt · première année</div>
          <div className="kpis">
            <Kpi label="Impôt estimé, année 1" value={fmtEur(y1?.tax ?? 0)} sub={s.regime === 'aucune' ? 'non estimé' : `régime : ${REGIMES.find((g) => g.v === s.regime)?.label ?? ''}`} />
            <Kpi label="Solde mensuel après impôt, année 1" value={fmtEur((y1?.cashflowAfterTax ?? 0) / 12)} tone={(y1?.cashflowAfterTax ?? 0) >= 0 ? 'pos' : 'neg'} sub={rentalCashflowSub((y1?.cashflowAfterTax ?? 0) / 12, true)} />
          </div>
          <Takeaway>{rentalTakeaway({ totalCost: r.totalCost, netYield: r.netYield, monthlyCashflow: r.monthlyCashflow, monthlyCashflowAfterTax: s.regime === 'aucune' || !y1 ? null : y1.cashflowAfterTax / 12, horizon: s.horizon, netEquity: end?.netEquity ?? 0, putIn: bal.putIn })}</Takeaway>
          {s.regime === 'micro-foncier' && r.annualRentCollected > 15000 && (
            <p className="notice small">Avec plus de 15 000 € de revenus fonciers bruts par an, le micro-foncier n'est pas applicable : choisissez le régime réel.</p>
          )}

          <h2>{`Bilan à ${s.horizon}\u00a0ans : ce que vous mettez, ce que vous gardez`}</h2>
          <p className="fb-intro">
            Barres à la même échelle. Le scénario défavorable suppose moins de loyers, plus de charges et un prix qui monte moins (détail plus bas).
          </p>
          <figure className="fb">
            <ul className="fb-legend" aria-hidden="true">
              <li><i className="rb-down" />Apport</li>
              {anyTopUps && <li><i className="rb-top" />{s.regime === 'aucune' ? 'Compléments mensuels (impôt non estimé)' : 'Compléments mensuels, impôt compris'}</li>}
              <li><i className="rb-eq" />Patrimoine net : bien moins crédit restant</li>
              {anyReceived && <li><i className="rb-cash" />Loyers en trop encaissés</li>}
            </ul>
            <ul className="fb-list rb-list">
              <BalanceGroup title="Scénario central" b={bal} scale={balScale} />
              <BalanceGroup title="Scénario défavorable" b={badBal} scale={balScale} />
            </ul>
          </figure>
          <p className="muted small">
            Sans les frais de revente ni l’impôt sur la plus-value, et sans compter ce que cet argent aurait pu rapporter placé ailleurs :
            le <Link to="/simulateurs/etf-immobilier">comparateur ETF / immobilier</Link> en tient compte. Estimation, si prix et loyers évoluent comme saisi.
          </p>

          <h2>Scénario défavorable</h2>
          <p className="muted">
            Appliqué à votre saisie : {ADVERSE.extraVacancyMonths}&nbsp;mois de vacance en plus par an, loyer réduit de {Math.round((1 - ADVERSE.rentFactor) * 100)} %,
            taxe foncière et charges majorées de {Math.round((ADVERSE.chargesFactor - 1) * 100)} %, évolution du prix du bien diminuée de {Math.abs(ADVERSE.appreciationDelta * 100)} points par an.
          </p>
          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead><tr><th><span className="sr-only">Indicateur</span></th><th className="r">Central</th><th className="r">Défavorable</th></tr></thead>
              <tbody>
                <tr><td>Rendement net de charges</td><td className="r">{fmtPct(r.netYield)}</td><td className="r">{fmtPct(badSnap.netYield)}</td></tr>
                <tr><td>Solde mensuel avant impôt</td><td className="r">{fmtEur(r.monthlyCashflow)}</td><td className="r">{fmtEur(badSnap.monthlyCashflow)}</td></tr>
                <tr><td>Solde mensuel après impôt (estimation, année 1)</td><td className="r">{fmtEur((y1?.cashflowAfterTax ?? 0) / 12)}</td><td className="r">{fmtEur((badProj[0]?.cashflowAfterTax ?? 0) / 12)}</td></tr>
              </tbody>
            </table>
          </div>

          <Fold title="Évolution année par année">
          <div className="panel rb-chart">
            <LineChart
              title="Patrimoine net immobilier et capital restant dû"
            showTitle
              xLabels={[0, ...proj.map((p) => p.year)].map((y) => `An ${y}`)}
              format={fmtEur}
              series={[
                { name: 'Patrimoine net (central)', color: 'var(--chart-1)', values: [s.price - r.loanAmount, ...proj.map((p) => p.netEquity)] },
                { name: 'Patrimoine net (défavorable)', color: 'var(--chart-3)', values: [bad.price - badSnap.loanAmount, ...badProj.map((p) => p.netEquity)], dashed: true },
                { name: 'Capital restant dû', color: 'var(--chart-4)', values: [r.loanAmount, ...proj.map((p) => p.remaining)] },
                { name: 'Soldes mensuels cumulés après impôt', color: 'var(--chart-2)', values: [0, ...proj.map((p) => p.cumulativeCashflowAfterTax)] },
              ]}
            />
          </div>

          <div className="table-wrap" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Année</th><th className="r">Loyers</th><th className="r">Charges</th><th className="r">Intérêts + ass.</th><th className="r">Capital remb.</th>
                  <th className="r">Solde avant impôt</th><th className="r">Impôt estimé</th><th className="r">Solde après impôt</th><th className="r">Restant dû</th><th className="r">Patrimoine net</th>
                </tr>
              </thead>
              <tbody>
                {proj.map((p) => (
                  <tr key={p.year}>
                    <td>{p.year}</td>
                    <td className="r">{fmtEur(p.rents)}</td>
                    <td className="r">{fmtEur(p.charges)}</td>
                    <td className="r">{fmtEur(p.interest + p.insurance)}</td>
                    <td className="r">{fmtEur(p.principalPaid)}</td>
                    <td className={'r ' + (p.cashflowBeforeTax < 0 ? 'neg' : 'pos')}>{fmtEur(p.cashflowBeforeTax)}</td>
                    <td className="r">{fmtEur(p.tax)}</td>
                    <td className={'r ' + (p.cashflowAfterTax < 0 ? 'neg' : 'pos')}>{fmtEur(p.cashflowAfterTax)}</td>
                    <td className="r">{fmtEur(p.remaining)}</td>
                    <td className="r">{fmtEur(p.netEquity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </Fold>
          <p className="notice info small" style={{ marginTop: 16 }}>
            Estimation fiscale simplifiée : impôt = base imposable × (tranche marginale + prélèvements sociaux). Au réel, un déficit est reporté sur les
            revenus locatifs suivants ; son imputation sur le revenu global n'est pas modélisée. Voir aussi les fiches{' '}
            <Link to="/encyclopedie/location-nue">location nue</Link> et <Link to="/encyclopedie/lmnp">LMNP</Link>.
          </p>
          <SavedSims simKey="immobilier" current={s} onLoad={(d) => setS({ ...RENTAL_DEFAULTS, ...d })} />
          <SimFaq slug="immobilier" />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
        </section>
      </div>
    </>
  );
}
