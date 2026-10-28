import { Link } from 'react-router-dom';
import { renegotiation, fmtEur, fmtNum } from '../lib/finance';
import { Crumbs, Disclaimer, SimFaq, Kpi, NumberField, PageHead, SavedSims, usePersistentState } from '../components/ui';

type State = { remaining: number; currentRate: number; currentYearsLeft: number; newRate: number; newYears: number; fees: number };

// Exemple fictif : toutes les valeurs sont des hypothèses à remplacer par les vôtres.
const DEFAULTS: State = { remaining: 150000, currentRate: 4.5, currentYearsLeft: 20, newRate: 3.5, newYears: 20, fees: 3000 };

export default function SimRenegociation() {
  const [s, setS, up] = usePersistentState<State>('renegociation', DEFAULTS);
  const r = renegotiation({ ...s, currentRate: s.currentRate / 100, newRate: s.newRate / 100 });

  return (
    <>
      <Crumbs items={[{ to: '/simulateurs', label: 'Simulateurs' }, { label: 'Renégocier son crédit' }]} />
      <PageHead eyebrow="Simulateur" title="Renégocier ou racheter son crédit : gain net et point mort">
        Comparez le coût restant de votre prêt actuel avec celui d’un nouveau prêt sur le capital restant dû, frais compris : économie de mensualité, gain net et nombre de mois pour amortir les frais.
      </PageHead>
      <p className="notice" role="note">
        Calcul fondé uniquement sur les hypothèses que vous saisissez, sans chiffre réglementaire : les frais (dossier, garantie, indemnités éventuelles) sont à relever sur vos documents et sur l’offre reçue. L’assurance n’est pas incluse.
        Voir aussi le <Link to="/simulateurs/credit">simulateur de crédit</Link> et le <Link to="/simulateurs/taeg">calcul du TAEG</Link>.
      </p>
      <div className="sim" style={{ marginTop: 24 }}>
        <form className="panel sim-form" onSubmit={(e) => e.preventDefault()}>
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
          <button type="button" className="btn small secondary" onClick={() => setS(DEFAULTS)}>Réinitialiser</button>
        </form>
        <section aria-label="Résultats">
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
          <SavedSims simKey="renegociation" current={s} onLoad={(d) => setS({ ...DEFAULTS, ...d })} />
          <div style={{ marginTop: 16 }}><Disclaimer /></div>
          <SimFaq slug="renegocier-son-credit-gain-et-point-mort" />
        </section>
      </div>
    </>
  );
}
