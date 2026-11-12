import { fmtEur, netWorth, type NetWorthItem } from '../lib/finance';
import { netWorthTakeaway, debtShareLabel } from '../lib/takeaways';
import { NW_DEFAULT } from '../lib/illustrationData';
import { Takeaway, usePersistentState } from './ui';

/**
 * Calculateur du guide « Comment calculer son patrimoine net ».
 * Mêmes mots que le schéma du guide (ce que l’on possède, ce que l’on doit) et même exemple fictif au départ.
 */
export function NetWorthCalculator() {
  const [st, setSt] = usePersistentState('patrimoine-net', NW_DEFAULT);
  const r = netWorth(st.items);
  const setItem = (id: string, patch: Partial<NetWorthItem>) => setSt((x) => ({ items: x.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const add = (kind: NetWorthItem['kind']) => setSt((x) => ({ items: [...x.items, { id: kind[0] + Date.now(), label: '', amount: 0, kind }] }));
  const isDefault = JSON.stringify(st.items) === JSON.stringify(NW_DEFAULT.items);
  const block = (kind: NetWorthItem['kind'], title: string, hint: string, addLabel: string, placeholder: string) => (
    <div className="nw-block">
      <h3 className="nw-title">{title}</h3>
      <p className="nw-hint">{hint}</p>
      {st.items.filter((i) => i.kind === kind).map((i) => (
        <div key={i.id} className="nw-row">
          <input type="text" className="nw-label" aria-label={`Nom de la ligne (${title.toLowerCase()})`} placeholder={placeholder} value={i.label} onChange={(e) => setItem(i.id, { label: e.target.value })} />
          <div className="input-unit">
            <input type="number" inputMode="decimal" aria-label={`Montant en euros : ${i.label || placeholder}`} min={0} step={1000} value={i.amount} onChange={(e) => setItem(i.id, { amount: Math.max(0, +e.target.value || 0) })} />
            <span aria-hidden="true">€</span>
          </div>
          <button type="button" className="nw-del" aria-label={`Supprimer la ligne ${i.label || placeholder}`} onClick={() => setSt((x) => ({ items: x.items.filter((y) => y.id !== i.id) }))}>×</button>
        </div>
      ))}
      <button type="button" className="btn small secondary" onClick={() => add(kind)}>+ {addLabel}</button>
    </div>
  );
  return (
    <div className="panel nw-panel">
      <div className="split">
        {block('actif', 'Ce que vous possédez', 'À la valeur actuelle, pas au prix d’achat.', 'Ajouter un bien ou une épargne', 'Nom (ex. : voiture)')}
        {block('dette', 'Ce que vous devez', 'Le capital restant dû, pas la somme des mensualités.', 'Ajouter une dette', 'Nom (ex. : crédit auto)')}
      </div>
      <div className="kpis nw-kpis">
        <div className="kpi"><div className="k-label">Ce que vous possédez</div><div className="k-value">{fmtEur(r.assets)}</div></div>
        <div className="kpi"><div className="k-label">Ce que vous devez</div><div className="k-value">{fmtEur(r.debts)}</div>{debtShareLabel({ assets: r.assets, debts: r.debts }) && <div className="k-sub">{debtShareLabel({ assets: r.assets, debts: r.debts })}</div>}</div>
        <div className={'kpi ' + (r.net >= 0 ? 'pos' : 'neg')}><div className="k-label">Patrimoine net</div><div className="k-value">{fmtEur(r.net)}</div></div>
      </div>
      <Takeaway>{netWorthTakeaway(r)}</Takeaway>
      <p className="small muted nw-note">
        {isDefault ? 'Exemple fictif du schéma : remplacez-le par vos montants (gardés dans ce navigateur).' : 'Vos montants restent dans ce navigateur.'}
        {!isDefault && <> <button type="button" className="linklike" onClick={() => setSt({ items: NW_DEFAULT.items })}>Revenir à l’exemple</button></>}
      </p>
    </div>
  );
}
