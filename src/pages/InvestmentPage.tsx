import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { config } from '../config';
import { categoryById } from '../data/categories';
import { investmentBySlug } from '../data/investments';
import { relatedSimulators, simsForInvestment } from '../lib/relatedSims';
import { AdSlot, CheckedText, Crumbs, Dots, Fold, PageHead, Sources } from '../components/ui';
import NotFound from './NotFound';
import { fmtDate } from './Guides';

export default function InvestmentPage() {
  const { slug = '' } = useParams();
  const inv = investmentBySlug[slug];
  if (!inv) return <NotFound />;
  const cat = categoryById[inv.category];
  const aff = config.affiliates[inv.slug];
  const [stale, setStale] = useState(false);
  useEffect(() => {
    setStale(new Date().toISOString().slice(0, 10) >= inv.review.nextReview);
  }, [inv.review.nextReview]);

  return (
    <>
      <Crumbs items={[{ to: '/encyclopedie', label: 'Encyclopédie' }, { to: `/encyclopedie?cat=${cat.id}`, label: cat.name }, { label: inv.name }]} />
      <div className="fiche">
        <article className="prose">
          <PageHead eyebrow={cat.name} title={inv.name}>{inv.summary}</PageHead>

          <div className="panel fiche-brief">
            <div className="meters">
              <Dots level={inv.risk} kind="risk" label="Risque" />
              <Dots level={inv.liquidity} kind="liq" label="Liquidité" />
              <Dots level={inv.effort} label="Effort" />
            </div>
            <p className="small" style={{ margin: '10px 0 0' }}>
              <strong>Horizon :</strong> {inv.horizon}. <strong>Capital :</strong> {inv.minCapital.text}{' '}
              {!inv.minCapital.verified && <span className="badge-unverified">à vérifier</span>}
            </p>
            <div className="btn-row" style={{ marginTop: 12 }}>
              <Link className="btn small" to={`/comparateur?ids=${[inv.slug, ...inv.alternatives.slice(0, 2)].join(',')}`}>Comparer</Link>
              <Link className="btn small secondary" to="/simulateurs">Simuler</Link>
            </div>
            <p className="small muted" style={{ margin: '8px 0 0' }}>Échelles de 1 à 5 attribuées par la rédaction à titre indicatif.</p>
          </div>

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

          <h2>Suivi de vérification</h2>
          {stale && <p className="notice small">La date de révision prévue est dépassée : certaines informations ont pu changer. Vérifiez-les auprès des sources officielles.</p>}
          <dl className="facts">
            <dt>Dernière vérification</dt><dd>{fmtDate(inv.review.verifiedOn)}</dd>
            <dt>Fiscalité considérée valable au</dt><dd>{fmtDate(inv.review.taxValidAsOf)}</dd>
            <dt>Prochaine révision prévue</dt><dd>{fmtDate(inv.review.nextReview)}</dd>
          </dl>
          <Fold title="Données et hypothèses utilisées">
            {inv.review.data.length > 0 && (<><h3>Données utilisées</h3><ul>{inv.review.data.map((d) => <li key={d}>{d}</li>)}</ul></>)}
            <h3>Hypothèses</h3>
            <ul>{inv.review.assumptions.map((d) => <li key={d}>{d}</li>)}</ul>
          </Fold>
          {aff && (
            <p className="small">
              <span className="tag">Lien commercial</span> Le site peut percevoir une commission si vous utilisez ce lien, sans effet sur le contenu de la fiche :{' '}
              <a href={aff.url} rel="sponsored noopener noreferrer" target="_blank">{aff.label}</a>
            </p>
          )}

          {relatedSimulators(simsForInvestment[inv.slug]).length > 0 && (<>
            <h2>Simulateurs liés</h2>
            <ul>
              {relatedSimulators(simsForInvestment[inv.slug]).map((sim) => (
                <li key={sim.slug}><Link to={`/simulateurs/${sim.slug}`}>{sim.title}</Link> — {sim.excerpt}</li>
              ))}
            </ul>
          </>)}

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
