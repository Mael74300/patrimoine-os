import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categories } from '../data/categories';
import { guideBySlug, guideGroups, guides, otherGuides } from '../data/guides';
import { investmentBySlug, investments } from '../data/investments';
import { relatedSimulators, simsForGuide } from '../lib/relatedSims';
import { fmtEur, fmtPct, netWorth, type NetWorthItem } from '../lib/finance';
import { Crumbs, MobileFold, PageHead, Sources, usePersistentState } from '../components/ui';
import { GuideGroupIcon, SchemaEnveloppe, SchemaPea, SchemaEscalier, SchemaDiversification, SchemaInflation, SchemaLevier, SchemaInterets, SchemaMensualite } from '../components/Illustrations';
import NotFound from './NotFound';

const fmtDate = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export { fmtDate };

export function GuideList() {
  return (
    <>
      <PageHead eyebrow="Guides" title="Guides pédagogiques">Des explications courtes pour comprendre les mécanismes avant de choisir.</PageHead>
      <div className="guide-groups">
      {guideGroups.map((grp, gi) => (
        <section key={grp.title} aria-labelledby={`grp-${grp.slugs[0]}`} style={{ marginTop: 28 }}>
          <h2 id={`grp-${grp.slugs[0]}`} className="theme-title" style={{ margin: 0 }}><GuideGroupIcon index={gi} size={28} />{grp.title}</h2>
          <p className="small muted" style={{ margin: '4px 0 8px' }}>{grp.intro}</p>
          <ul className="inv-list inv-list--compact">
            {grp.slugs.map((slug) => guideBySlug[slug]).map((g) => (
              <li key={g.slug}>
                <Link className="inv-row" to={`/guides/${g.slug}`}>
                  <div><h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: 'var(--primary)' }}>{g.title}</h3><p>{g.summary}</p></div>
                  <span className="small muted">{g.readingMinutes} min</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      </div>
    </>
  );
}

function Catalogue() {
  return (
    <div className="grid cols-2" style={{ marginTop: 8 }}>
      {categories.map((c) => {
        const list = investments.filter((i) => i.category === c.id);
        return (
          <div key={c.id} className="panel">
            <h3 style={{ margin: 0 }}><Link to={`/encyclopedie?cat=${c.id}`}>{c.name}</Link></h3>
            <p className="small muted" style={{ margin: '4px 0 6px' }}>{c.short}</p>
            {list.length ? (
              <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
                {list.map((i) => <li key={i.slug}><Link to={`/encyclopedie/${i.slug}`}>{i.name}</Link></li>)}
              </ul>
            ) : <p className="small muted" style={{ margin: 0 }}>Fiches en préparation.</p>}
          </div>
        );
      })}
    </div>
  );
}

const NW_DEFAULT: { items: NetWorthItem[] } = {
  items: [
    { id: 'a1', label: 'Comptes et livrets', amount: 12000, kind: 'actif' },
    { id: 'a2', label: 'Placements (PEA, assurance-vie…)', amount: 25000, kind: 'actif' },
    { id: 'a3', label: 'Résidence principale (valeur estimée)', amount: 250000, kind: 'actif' },
    { id: 'd1', label: 'Crédit immobilier (capital restant dû)', amount: 180000, kind: 'dette' },
  ],
};

function NetWorthCalculator() {
  const [st, setSt] = usePersistentState('patrimoine-net', NW_DEFAULT);
  const r = netWorth(st.items);
  const setItem = (id: string, patch: Partial<NetWorthItem>) => setSt((x) => ({ items: x.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const add = (kind: NetWorthItem['kind']) => setSt((x) => ({ items: [...x.items, { id: kind[0] + Date.now(), label: kind === 'actif' ? 'Autre actif' : 'Autre dette', amount: 0, kind }] }));
  const block = (kind: NetWorthItem['kind'], title: string) => (
    <div>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {st.items.filter((i) => i.kind === kind).map((i) => (
        <div key={i.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr) auto', gap: 6, marginBottom: 6 }}>
          <input type="text" aria-label="Libellé" value={i.label} onChange={(e) => setItem(i.id, { label: e.target.value })} />
          <input type="number" aria-label={`Montant ${i.label}`} min={0} value={i.amount} onChange={(e) => setItem(i.id, { amount: Math.max(0, +e.target.value || 0) })} />
          <button type="button" className="btn small secondary" aria-label={`Supprimer ${i.label}`} onClick={() => setSt((x) => ({ items: x.items.filter((y) => y.id !== i.id) }))}>×</button>
        </div>
      ))}
      <button type="button" className="btn small secondary" onClick={() => add(kind)}>Ajouter</button>
    </div>
  );
  return (
    <div className="panel" style={{ marginTop: 8 }}>
      <div className="split">
        {block('actif', 'Actifs')}
        {block('dette', 'Dettes')}
      </div>
      <div className="kpis" style={{ marginTop: 16, marginBottom: 0 }}>
        <div className="kpi"><div className="k-label">Total des actifs</div><div className="k-value">{fmtEur(r.assets)}</div></div>
        <div className="kpi"><div className="k-label">Total des dettes</div><div className="k-value">{fmtEur(r.debts)}</div><div className="k-sub">{fmtPct(r.debtRatio)} des actifs</div></div>
        <div className={'kpi ' + (r.net >= 0 ? 'pos' : 'neg')}><div className="k-label">Patrimoine net</div><div className="k-value">{fmtEur(r.net)}</div></div>
      </div>
      <p className="small muted" style={{ margin: '12px 0 0' }}>Exemple pré-rempli fictif. Vos montants restent dans ce navigateur.</p>
    </div>
  );
}

export function GuidePage() {
  const { slug = '' } = useParams();
  const g = guideBySlug[slug];
  if (!g) return <NotFound />;
  const others = otherGuides(g.slug);
  return (
    <article>
      <Crumbs items={[{ to: '/', label: 'Accueil' }, { to: '/guides', label: 'Guides' }, { label: g.title }]} />
      <div className="prose">
        <PageHead eyebrow={`Guide · ${g.readingMinutes} min de lecture`} title={g.title}>{g.summary}</PageHead>
        <p className="small muted">Mis à jour le {fmtDate(g.updatedOn)}</p>
        {g.slug === 'par-ou-commencer' && <SchemaEscalier steps={g.sections.map((s) => s.heading)} title="Les cinq étapes pour construire son patrimoine, dans l’ordre" />}
        {g.sections.map((s, i) => (
          <section key={s.heading}>
            <h2>{g.slug === 'par-ou-commencer' ? `${i + 1}. ${s.heading}` : s.heading}</h2>
            {s.body.map((p, k) => (
              <Fragment key={p}>
                <p>{p}</p>
                {g.slug === 'investir-a-credit' && s.heading === 'Un exemple fictif' && (k === 0 ? <SchemaMensualite /> : <SchemaLevier />)}
              </Fragment>
            ))}
            {g.slug === 'types-investissements' && s.heading.startsWith('Placement et enveloppe') && <SchemaEnveloppe />}
            {g.slug === 'fonctionnement-pea' && s.heading === 'Retraits et fiscalité' && <SchemaPea />}
            {g.slug === 'interets-composes' && i === 0 && <SchemaInterets />}
            {g.slug === 'inflation-pouvoir-d-achat-epargne' && s.heading === 'Un exemple fictif chiffré' && <SchemaInflation />}
            {g.slug === 'diversification-placements' && s.heading === 'Un exemple fictif chiffré' && <SchemaDiversification />}
          </section>
        ))}
        {g.faq?.length ? (
          <section>
            <h2>Questions fréquentes</h2>
            {g.faq.map((f) => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </section>
        ) : null}
      </div>
      {g.widget === 'catalogue' && <MobileFold label={`Voir les ${categories.length} familles et leurs fiches`}><Catalogue /></MobileFold>}
      {g.widget === 'patrimoine-net' && (<><h2>Calculer votre patrimoine net</h2><NetWorthCalculator /></>)}
      <div className="prose">
        {g.cta && <p style={{ marginTop: 24 }}><Link className="btn" to={g.cta.to}>{g.cta.label}</Link></p>}
        <h2>Fiches liées</h2>
        <ul>
          {g.related.filter((r) => investmentBySlug[r]).map((r) => (
            <li key={r}><Link to={`/encyclopedie/${r}`}>{investmentBySlug[r].name}</Link> — {investmentBySlug[r].summary}</li>
          ))}
        </ul>
        {relatedSimulators(simsForGuide[g.slug]).length > 0 && (<>
          <h2>Simulateurs liés</h2>
          <ul>
            {relatedSimulators(simsForGuide[g.slug]).map((sim) => (
              <li key={sim.slug}><Link to={`/simulateurs/${sim.slug}`}>{sim.title}</Link> — {sim.excerpt}</li>
            ))}
          </ul>
        </>)}
        <h2>Sources</h2>
        <Sources list={g.sources} />
        <h2>Autres guides</h2>
        <ul>{others.map((o) => <li key={o.slug}><Link to={`/guides/${o.slug}`}>{o.title}</Link></li>)}</ul>
      </div>
    </article>
  );
}
