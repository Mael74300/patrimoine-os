import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categories } from '../data/categories';
import { AS_OF, investments } from '../data/investments';
import { fmtEur, projectGrowth } from '../lib/finance';
import { guides } from '../data/guides';
import { simulators } from '../lib/search';
import { featuredSims, simBySlug } from '../lib/simThemes';
import { LineChart, MobileFold, PageHead } from '../components/ui';
import { FamilyIcon, SituationIcon, type SituationIconName } from '../components/Illustrations';

const situations: { icon: SituationIconName; title: string; text: string; cta: string; to: string }[] = [
  { icon: 'pousse', title: 'Je débute', text: 'Un premier salaire, par où commencer ?', cta: 'Le guide pour démarrer', to: '/guides/par-ou-commencer' },
  { icon: 'pieces', title: "J'ai déjà de l'épargne", text: 'Livrets, PEA, assurance-vie, PER : que choisir ?', cta: 'Comparer les enveloppes', to: '/guides/choisir-son-enveloppe' },
  { icon: 'maison', title: 'Je veux acheter', text: 'Ce que la banque regarde avant de prêter.', cta: 'Le taux d’endettement', to: '/guides/taux-endettement-capacite-emprunt' },
  { icon: 'soleil', title: 'Je prépare ma retraite', text: 'Combien de temps mon capital peut-il durer ?', cta: 'Tester mon capital', to: '/simulateurs/retraits-reguliers-duree-du-capital' },
];

export default function Home() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const example = useMemo(
    () => projectGrowth({ initial: 5000, monthly: 200, annualReturn: 0.05, annualFees: 0.005, years: 25, inflation: 0.02 }),
    [],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    investments.forEach((i) => (c[i.category] = (c[i.category] ?? 0) + 1));
    return c;
  }, []);
  const familyCount = categories.filter((c) => counts[c.id]).length;
  const last = example[example.length - 1];

  return (
    <>
      <div className="home-top">
      <section className="hero">
        <div className="hero-main">
          <PageHead eyebrow="Patrimoine OS" title="Toutes les stratégies pour construire votre patrimoine, au même endroit.">
            Explorez les investissements, comparez les possibilités et simulez votre avenir financier.
          </PageHead>
          <form
            className="search-box"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              nav(`/recherche?q=${encodeURIComponent(q)}`);
            }}
          >
            <input type="search" placeholder="PEA, SCPI, crédit…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher sur le site" />
            <button className="btn" type="submit">Rechercher</button>
          </form>
          <div className="btn-row">
            <Link className="btn secondary" to="/encyclopedie">Encyclopédie</Link>
            <Link className="btn secondary" to="/simulateurs">Simulateurs</Link>
            <Link className="btn secondary" to="/comparateur">Comparateur</Link>
          </div>
        </div>
        <div className="panel hero-example">
          <div className="eyebrow" style={{ color: 'var(--warn)' }}>Exemple fictif</div>
          <p className="small" style={{ marginBottom: 8 }}>
            5 000 € de départ, puis 200 € par mois pendant 25 ans, avec une <strong>hypothèse</strong> de 5 % par an, 0,5 % de frais et 2 % d'inflation.
          </p>
          <LineChart
            title="Exemple fictif de projection sur 25 ans"
            height={220}
            xLabels={example.map((p) => `An ${p.year}`)}
            format={fmtEur}
            series={[
              { name: 'Valeur projetée', color: 'var(--chart-1)', values: example.map((p) => p.value) },
              { name: "En euros d'aujourd'hui", color: 'var(--chart-2)', values: example.map((p) => p.realValue), dashed: true },
              { name: 'Versements', color: 'var(--chart-3)', values: example.map((p) => p.contributed) },
            ]}
          />
          <p className="small muted" style={{ margin: '8px 0 0' }}>
            Valeur finale projetée : {fmtEur(last.value)} pour {fmtEur(last.contributed)} versés. Ce n'est ni une prévision ni une promesse.{' '}
            <Link to="/simulateurs/patrimoine">Faire ma simulation</Link>
          </p>
        </div>
      </section>

      <h2>Par où commencer ?</h2>
      <ul className="situations">
        {situations.map((s) => (
          <li key={s.to}>
            <Link to={s.to}>
              <SituationIcon name={s.icon} />
              <strong>{s.title}</strong>
              <span>{s.text}</span>
              <em>{s.cta}</em>
            </Link>
          </li>
        ))}
      </ul>
      </div>

      <div className="split" style={{ marginTop: 8 }}>
        <section>
          <h2>Simulateurs les plus utiles</h2>
          <ul className="inv-list">
            {featuredSims.map(simBySlug).map((s) => (
              <li key={s.slug}><Link className="inv-row" to={`/simulateurs/${s.slug}`}><div><h3>{s.title}</h3><p>{s.excerpt}</p></div></Link></li>
            ))}
          </ul>
          <p className="link-block"><Link to="/simulateurs">Voir les {simulators.length} simulateurs, classés par thème</Link></p>
        </section>
        <section>
          <h2>Guides essentiels</h2>
          <ul className="inv-list">
            {guides.slice(0, 6).map((g) => (
              <li key={g.slug}><Link className="inv-row" to={`/guides/${g.slug}`}><div><h3>{g.title}</h3><p>{g.summary}</p></div></Link></li>
            ))}
          </ul>
          <p className="link-block"><Link to="/guides">Voir les {guides.length} guides</Link></p>
        </section>
      </div>

      <h2>Les familles d'investissement</h2>
      <MobileFold label={`Voir les ${familyCount} familles`}>
        <div className="cat-grid cat-grid-home">
          {categories.filter((c) => counts[c.id]).map((c) => (
            <Link key={c.id} to={`/encyclopedie?cat=${c.id}`}>
              <FamilyIcon id={c.id} />
              <strong>{c.name}</strong>
              <span>{c.short}</span>
              <em>{`${counts[c.id]} fiche${counts[c.id] > 1 ? 's' : ''}`}</em>
            </Link>
          ))}
        </div>
      </MobileFold>

      <h2>Sources officielles</h2>
      <p className="muted">Informations datées (dernière vérification : {AS_OF}), avec renvoi aux sources institutionnelles ; les points non confirmés sont signalés « à vérifier ».</p>
      <div className="grid cols-4 src-grid">
        {[
          ['Service-Public.fr', 'https://www.service-public.fr', 'Droits et démarches des particuliers'],
          ['impots.gouv.fr', 'https://www.impots.gouv.fr/particulier', 'Fiscalité des revenus et du patrimoine'],
          ['AMF', 'https://www.amf-france.org/fr/espace-epargnants', 'Protection des épargnants, listes noires'],
          ['Banque de France', 'https://www.banque-france.fr', 'Épargne réglementée, crédit'],
        ].map(([n, u, d]) => (
          <a key={u} className="panel" href={u} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong style={{ color: 'var(--primary)' }}>{n}</strong>
            <div className="small muted">{d}</div>
          </a>
        ))}
      </div>
    </>
  );
}
