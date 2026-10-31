import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { investments } from '../data/investments';
import { fmtEur, projectGrowth } from '../lib/finance';
import { guides } from '../data/guides';
import { simulators } from '../lib/search';
import { config } from '../config';
import { LineChart } from '../components/ui';
import { SituationIcon, type SituationIconName } from '../components/Illustrations';

const situations: { icon: SituationIconName; title: string; text: string; cta: string; to: string }[] = [
  { icon: 'pousse', title: 'Je débute', text: 'Un premier salaire, par où commencer ?', cta: 'Le guide pour démarrer', to: '/guides/par-ou-commencer' },
  { icon: 'pieces', title: "J'ai déjà de l'épargne", text: 'Livrets, PEA, assurance-vie, PER : que choisir ?', cta: 'Comparer les enveloppes', to: '/guides/choisir-son-enveloppe' },
  { icon: 'maison', title: 'Je veux acheter', text: 'Ce que la banque regarde avant de prêter.', cta: 'Le taux d’endettement', to: '/guides/taux-endettement-capacite-emprunt' },
  { icon: 'soleil', title: 'Je prépare ma retraite', text: 'Combien de temps mon capital peut-il durer ?', cta: 'Tester mon capital', to: '/simulateurs/retraits-reguliers-duree-du-capital' },
];

const tiles = [
  { to: '/encyclopedie', title: 'Encyclopédie', text: 'Une fiche claire par placement : fonctionnement, risques, fiscalité.', icon: 'book' },
  { to: '/simulateurs', title: 'Simulateurs', text: 'Testez vos chiffres : épargne, crédit, retraite, budget.', icon: 'calc' },
  { to: '/guides', title: 'Guides', text: 'Les bases expliquées simplement, étape par étape.', icon: 'map' },
] as const;

function TileIcon({ name }: { name: (typeof tiles)[number]['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg className="tile-icon" width="40" height="40" viewBox="0 0 32 32" aria-hidden="true" {...common}>
      {name === 'book' && (<><path d="M6 6h8a3 3 0 0 1 3 3v17a2.5 2.5 0 0 0-2.5-2.5H6z" /><path d="M26 6h-8a3 3 0 0 0-3 3v17a2.5 2.5 0 0 1 2.5-2.5H26z" /></>)}
      {name === 'calc' && (<><rect x="7" y="4" width="18" height="24" rx="3" /><path d="M11 9h10M11 15h2M16 15h2M21 15h0M11 20h2M16 20h2M21 20h0" /></>)}
      {name === 'map' && (<><path d="M5 8l7-3 8 3 7-3v19l-7 3-8-3-7 3z" /><path d="M12 5v19M20 8v19" /></>)}
    </svg>
  );
}

export default function Home() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  useEffect(() => {
    document.title = `${config.siteName} — Encyclopédie et simulateurs patrimoniaux gratuits`;
  }, []);
  const example = useMemo(
    () => projectGrowth({ initial: 5000, monthly: 200, annualReturn: 0.05, annualFees: 0.005, years: 25, inflation: 0.02 }),
    [],
  );
  const last = example[example.length - 1];
  const counts = [investments.length, simulators.length, guides.length];

  return (
    <>
      <section className="home-hero">
        <div className="eyebrow">Patrimoine OS</div>
        <h1>Comprendre et construire votre patrimoine, simplement.</h1>
        <p className="lede">Des guides clairs, des fiches par placement et des simulateurs gratuits. Sans inscription, sans cookie.</p>
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

      <h2>Explorer le site</h2>
      <ul className="tiles">
        {tiles.map((t, i) => (
          <li key={t.to}>
            <Link to={t.to}>
              <TileIcon name={t.icon} />
              <strong>{t.title}</strong>
              <span>{t.text}</span>
              <em>{counts[i]} {i === 0 ? 'fiches' : i === 1 ? 'simulateurs' : 'guides'}</em>
            </Link>
          </li>
        ))}
      </ul>

      <section className="home-example panel">
        <div>
          <div className="eyebrow eyebrow-warn">Exemple fictif</div>
          <h2 className="plain">Ce que peut donner l'épargne régulière</h2>
          <p>
            5 000 € de départ, puis 200 € par mois pendant 25 ans, avec une <strong>hypothèse</strong> de 5 % par an, 0,5 % de frais et 2 % d'inflation :
            {' '}{fmtEur(last.value)} pour {fmtEur(last.contributed)} versés. Ce n'est ni une prévision ni une promesse.
          </p>
          <Link className="btn" to="/simulateurs/patrimoine">Faire ma simulation</Link>
        </div>
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
      </section>

    </>
  );
}
