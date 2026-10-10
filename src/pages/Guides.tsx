import { Link, useParams } from 'react-router-dom';
import { guideBySlug, guides } from '../data/guides';
import { investmentBySlug } from '../data/investments';
import { Crumbs, PageHead, Sources } from '../components/ui';
import NotFound from './NotFound';

export function GuideList() {
  return (
    <>
      <PageHead eyebrow="Guides" title="Guides pédagogiques">Des explications courtes pour comprendre les mécanismes avant de choisir.</PageHead>
      <ul className="inv-list">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link className="inv-row" to={`/guides/${g.slug}`}>
              <div><h3>{g.title}</h3><p>{g.summary}</p></div>
              <span className="small muted">{g.readingMinutes} min de lecture</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function GuidePage() {
  const { slug = '' } = useParams();
  const g = guideBySlug[slug];
  if (!g) return <NotFound />;
  return (
    <article className="prose">
      <Crumbs items={[{ to: '/guides', label: 'Guides' }, { label: g.title }]} />
      <PageHead eyebrow={`Guide · ${g.readingMinutes} min`} title={g.title}>{g.summary}</PageHead>
      {g.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.body.map((p) => <p key={p}>{p}</p>)}
        </section>
      ))}
      <h2>Pour aller plus loin</h2>
      <ul>
        {g.related.filter((r) => investmentBySlug[r]).map((r) => (
          <li key={r}><Link to={`/encyclopedie/${r}`}>{investmentBySlug[r].name}</Link></li>
        ))}
      </ul>
      <h2>Sources</h2>
      <Sources list={g.sources} />
    </article>
  );
}
