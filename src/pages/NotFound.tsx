import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHead } from '../components/ui';

const suites = [
  { to: '/guides/par-ou-commencer', title: 'Je débute', text: 'Le guide « par où commencer ».' },
  { to: '/simulateurs', title: 'Simulateurs', text: 'Testez vos chiffres : épargne, crédit, retraite, budget.' },
  { to: '/encyclopedie', title: 'Encyclopédie', text: 'Une fiche claire par placement.' },
  { to: '/plan-du-site', title: 'Plan du site', text: 'Toutes les pages, par rubrique.' },
] as const;

export default function NotFound() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  return (
    <>
      <PageHead title="Page introuvable">Cette page n'existe pas ou a été déplacée. Cherchez ce qui vous intéresse, ou reprenez par l'une de ces pages.</PageHead>
      <form
        className="search-box search-box-page"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          nav(`/recherche?q=${encodeURIComponent(q)}`);
        }}
      >
        <input type="search" placeholder="PEA, SCPI, crédit…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher sur le site" />
        <button className="btn" type="submit">Rechercher</button>
      </form>
      <h2>Où aller ensuite ?</h2>
      <ul className="not-found-links">
        {suites.map((s) => (
          <li key={s.to}>
            <Link to={s.to}>
              <strong>{s.title}</strong>
              <span>{s.text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p><Link className="btn" to="/">Retour à l'accueil</Link></p>
    </>
  );
}
