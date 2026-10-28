import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { guides } from '../data/guides';
import { investments } from '../data/investments';
import { simulators } from '../lib/search';
import { Crumbs, PageHead } from '../components/ui';

export default function PlanDuSite() {
  const fiches = [...investments].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  return (
    <div className="prose">
      <Crumbs items={[{ to: '/', label: 'Accueil' }, { label: 'Plan du site' }]} />
      <PageHead eyebrow="Navigation" title="Plan du site">
        Toutes les pages du site sur une seule page : {fiches.length} fiches, {guides.length} guides et {simulators.length} simulateurs.
      </PageHead>

      <h2>Pages principales</h2>
      <ul>
        <li><Link to="/encyclopedie">Encyclopédie des investissements</Link></li>
        <li><Link to="/simulateurs">Simulateurs</Link></li>
        <li><Link to="/comparateur">Comparateur de placements</Link></li>
        <li><Link to="/guides">Guides</Link></li>
        <li><Link to="/glossaire">Glossaire</Link></li>
        <li><Link to="/entrepreneuriat">Entrepreneuriat</Link></li>
        <li><Link to="/methodologie">Méthode, formules et sources</Link></li>
      </ul>

      <h2>Simulateurs</h2>
      <ul>
        {simulators.map((s) => <li key={s.slug}><Link to={`/simulateurs/${s.slug}`}>{s.title}</Link></li>)}
      </ul>

      <h2>Guides</h2>
      <ul>
        {guides.map((g) => <li key={g.slug}><Link to={`/guides/${g.slug}`}>{g.title}</Link></li>)}
      </ul>

      <h2>Fiches de l’encyclopédie</h2>
      {categories.map((c) => {
        const list = fiches.filter((i) => i.category === c.id);
        if (!list.length) return null;
        return (
          <section key={c.id}>
            <h3>{c.name}</h3>
            <ul>{list.map((i) => <li key={i.slug}><Link to={`/encyclopedie/${i.slug}`}>{i.name}</Link></li>)}</ul>
          </section>
        );
      })}

      <h2>Informations légales</h2>
      <ul>
        <li><Link to="/confidentialite">Politique de confidentialité</Link></li>
        <li><Link to="/mentions-legales">Mentions légales</Link></li>
      </ul>
    </div>
  );
}
