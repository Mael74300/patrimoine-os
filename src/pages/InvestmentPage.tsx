import { Link, useParams } from 'react-router-dom';
import { config } from '../config';
import { categoryById } from '../data/categories';
import { investmentBySlug } from '../data/investments';
import { AdSlot, CheckedText, Crumbs, Dots, PageHead, Sources } from '../components/ui';
import NotFound from './NotFound';

export default function InvestmentPage() {
  const { slug = '' } = useParams();
  const inv = investmentBySlug[slug];
  if (!inv) return <NotFound />;
  const cat = categoryById[inv.category];
  const aff = config.affiliates[inv.slug];

  return (
    <>
      <Crumbs items={[{ to: '/encyclopedie', label: 'Encyclopédie' }, { to: `/encyclopedie?cat=${cat.id}`, label: cat.name }, { label: inv.name }]} />
      <div className="fiche">
        <article className="prose">
          <PageHead eyebrow={cat.name} title={inv.name}>{inv.summary}</PageHead>

          <h2>Définition</h2>
          <p>{inv.definition}</p>
          <h2>Fonctionnement</h2>
          <p>{inv.howItWorks}</p>
          <h2>Comment investir</h2>
          <ul>{inv.howToInvest.map((s) => <li key={s}>{s}</li>)}</ul>

          <h2>Frais</h2>
          <CheckedText c={inv.fees} />
          <h2>Fiscalité française</h2>
          <CheckedText c={inv.tax} />

          <h2>Avantages et inconvénients</h2>
          <div className="proscons">
            <div className="panel"><h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Avantages</h3><ul>{inv.pros.map((p) => <li key={p}>{p}</li>)}</ul></div>
            <div className="panel"><h3 style={{ marginTop: 0, color: 'var(--danger)' }}>Inconvénients</h3><ul>{inv.cons.map((p) => <li key={p}>{p}</li>)}</ul></div>
          </div>

          <h2>Temps et compétences</h2>
          <p>{inv.timeSkills}</p>
          <h2>Exemple chiffré</h2>
          <p className="notice info">{inv.example}</p>

          <AdSlot id={`fiche-${inv.slug}`} />

          <h2>Sources</h2>
          <Sources list={inv.sources} />
          {aff && (
            <p className="small">
              Lien partenaire (le site peut percevoir une commission) : <a href={aff.url} rel="sponsored noopener noreferrer" target="_blank">{aff.label}</a>
            </p>
          )}

          <h2>Alternatives comparables</h2>
          <ul>
            {inv.alternatives.filter((a) => investmentBySlug[a]).map((a) => (
              <li key={a}><Link to={`/encyclopedie/${a}`}>{investmentBySlug[a].name}</Link> — {investmentBySlug[a].summary}</li>
            ))}
          </ul>
        </article>

        <aside>
          <div className="panel">
            <strong>En bref</strong>
            <div className="meters" style={{ marginTop: 12 }}>
              <Dots level={inv.risk} kind="risk" label="Risque" />
              <Dots level={inv.liquidity} kind="liq" label="Liquidité" />
              <Dots level={inv.effort} label="Effort" />
            </div>
            <dl className="facts">
              <dt>Horizon</dt><dd>{inv.horizon}</dd>
              <dt>Capital nécessaire</dt>
              <dd>{inv.minCapital.text} {!inv.minCapital.verified && <span className="badge-unverified">à vérifier</span>}</dd>
              <dt>Mots-clés</dt>
              <dd>{inv.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</dd>
            </dl>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <Link className="btn small" to={`/comparateur?ids=${[inv.slug, ...inv.alternatives.slice(0, 2)].join(',')}`}>Comparer</Link>
              <Link className="btn small secondary" to="/simulateurs">Simuler</Link>
            </div>
            <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
              Échelles de 1 à 5 attribuées par la rédaction à titre indicatif.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
