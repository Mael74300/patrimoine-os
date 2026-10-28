import { Link } from 'react-router-dom';
import { doubling, fmtEur, fmtNum, fmtPct } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { initial: number; annualReturn: number; inflation: number; multiple: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { initial: 10000, annualReturn: 6, inflation: 2, multiple: 2 };

const years = (n: number | null) => (n === null ? 'jamais' : `${fmtNum(n)} ans`);

export default function SimDoubler() {
  const [s, setS, up] = usePersistentState<State>('doubler', DEFAULTS);
  const r = doubling({ initial: s.initial, annualReturn: s.annualReturn / 100, inflation: s.inflation / 100, multiple: s.multiple });

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Doubler son capital' }]} />
      <PageHead eyebrow="Simulateur" title="En combien de temps un capital double-t-il ? Règle de 72 et calcul exact">
        Durée nécessaire pour doubler (ou multiplier) un capital placé sans nouveau versement, au rendement que vous supposez, comparée à la règle de 72, avec et sans inflation.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire ni prévision. Le rendement est supposé constant, avant frais et impôts.
        Voir aussi les <Link to="/simulateurs/patrimoine">projections de patrimoine</Link> et l’<Link to="/simulateurs/inflation">effet de l’inflation</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
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
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
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
          <SavedSims simKey="doubler" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="doubler-son-capital-regle-de-72" />
        </section>
      </div>
    </>
  );
}
