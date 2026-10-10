import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categories } from '../data/categories';
import { AS_OF, investments } from '../data/investments';
import { fmtEur, projectGrowth } from '../lib/finance';
import { LineChart, PageHead } from '../components/ui';

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
  const last = example[example.length - 1];

  return (
    <>
      <section className="hero">
        <div>
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
            <input type="search" placeholder="Rechercher : PEA, SCPI, crédit, livret…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher sur le site" />
            <button className="btn" type="submit">Rechercher</button>
          </form>
          <div className="btn-row">
            <Link className="btn secondary" to="/encyclopedie">Encyclopédie</Link>
            <Link className="btn secondary" to="/simulateurs">Simulateurs</Link>
            <Link className="btn secondary" to="/comparateur">Comparateur</Link>
          </div>
        </div>
        <div className="panel">
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

      <h2>Comment fonctionne le site</h2>
      <ol className="steps">
        <li><strong>Comprendre</strong><br /><span className="muted">Chaque fiche explique un investissement : fonctionnement, risques, frais, fiscalité datée et sources.</span></li>
        <li><strong>Comparer</strong><br /><span className="muted">Mettez plusieurs placements côte à côte selon le risque, la liquidité, l'horizon et l'effort demandé.</span></li>
        <li><strong>Simuler</strong><br /><span className="muted">Les calculs s'exécutent dans votre navigateur. Aucune inscription, aucune donnée envoyée.</span></li>
      </ol>

      <h2>Les familles d'investissement</h2>
      <div className="cat-grid">
        {categories.map((c) => (
          <Link key={c.id} to={`/encyclopedie?cat=${c.id}`}>
            <strong>{c.name}</strong>
            <span>{c.short}</span>
            <em>{counts[c.id] ? `${counts[c.id]} fiche${counts[c.id] > 1 ? 's' : ''}` : 'Fiches en préparation'}</em>
          </Link>
        ))}
      </div>

      <h2>Sources officielles</h2>
      <p className="muted">
        Les informations réglementaires de ce site sont datées (dernière vérification : {AS_OF}) et renvoient aux sources institutionnelles.
        Les points non confirmés sont signalés « à vérifier ».
      </p>
      <div className="grid cols-4">
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
