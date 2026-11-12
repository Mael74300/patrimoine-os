import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { config } from '../config';
import { categoryById } from '../data/categories';
import { investmentBySlug } from '../data/investments';
import { needsCheck } from '../data/types';
import { relatedSimulators, simsForInvestment } from '../lib/relatedSims';
import { AdSlot, CheckedText, Crumbs, Dots, Fold, MetersLegend, PageHead, Sources } from '../components/ui';
import { simBlurb } from '../lib/simThemes';
import { DONATION_ABATTEMENTS, fmtEuros } from '../data/donationAbattements';
import { SchemaActions, SchemaForet, SchemaDonation, SchemaAssuranceVie, SchemaCapitalInvestissement, SchemaCrowdfunding, SchemaCrypto, SchemaCto, SchemaEtf, SchemaFonciereCotee, SchemaLmnp, SchemaLocationNue, SchemaObligation, SchemaOr, SchemaPea, SchemaLep, SchemaPel, SchemaPer, SchemaQuinzaines, SchemaScpi, SchemaUniteDeCompte, SchemaFondsEuros, SchemaLevier, SchemaCompteATerme, SchemaAssuranceVieDeces, SchemaCpf, SchemaObjetsArt, SchemaCreationEntreprise, SchemaRepriseEntreprise, SchemaActiviteNumerique } from '../components/Illustrations';
import NotFound from './NotFound';
import { fmtDate } from '../lib/dates';
import { guideBySlug } from '../data/guides';
import { linkOnly } from '../lib/jargon';
import { annotateFiche } from '../lib/ficheText';
import { JargonText } from '../components/Jargon';

/** Guide qui détaille une notion de la fiche (lien « Pour aller plus loin »). */
const FICHE_GUIDE: Record<string, string> = {
  'livret-a': 'livret-a-calcul-interets-quinzaines',
  pea: 'fonctionnement-pea',
};

/** Une carte longue (plus de 280 caractères) à côté d'une carte au moins deux fois plus courte laisserait un grand vide : on les empile. */
const unbalanced = (a: string, b: string) => Math.max(a.length, b.length) > 280 && Math.min(a.length, b.length) * 2 < Math.max(a.length, b.length);

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
  // Jargon expliqué sur place : première apparition de chaque notion du glossaire, dans l'ordre de lecture.
  // Toutes les rubriques comptent (Frais, Fiscalité, Avantages et Inconvénients compris) : six notions au plus par fiche.
  const j = annotateFiche(inv);
  const [jDef] = j.definition;
  const [jHow] = j.howItWorks;
  const jSteps = j.steps;

  return (
    <>
      <Crumbs items={[
        { to: '/encyclopedie', label: 'Encyclopédie' },
        ...(cat.name === inv.name ? [] : [{ to: `/encyclopedie?cat=${cat.id}`, label: cat.name }]),
        { label: inv.name },
      ]} />
      <div className="fiche">
        <article className="prose">
          <PageHead eyebrow={cat.name} title={inv.name}>{inv.summary}</PageHead>

          <div className="panel fiche-brief">
            <div className="meters">
              <Dots level={inv.risk} kind="risk" label="Risque" />
              <Dots level={inv.liquidity} kind="liq" label="Liquidité" />
              <Dots level={inv.effort} label="Effort" />
            </div>
            <MetersLegend />
            <p className="small fiche-facts" style={{ margin: '10px 0 0' }}>
              <span><strong>Horizon :</strong> {inv.horizon}.</span>{' '}
              <span><strong>Capital :</strong> {inv.minCapital.text}{' '}
              {needsCheck(inv.minCapital) && <span className="badge-unverified">à vérifier</span>}</span>
            </p>
            <div className="btn-row" style={{ marginTop: 12 }}>
              <Link className="btn small" to={`/comparateur?ids=${[inv.slug, ...inv.alternatives.slice(0, 2)].join(',')}`}>Comparer</Link>
              <Link className="btn small secondary" to="/simulateurs">Simuler</Link>
            </div>
            <p className="small muted" style={{ margin: '8px 0 0' }}>Échelles de 1 à 5 attribuées par la rédaction à titre indicatif.</p>
          </div>

          <h2>Définition</h2>
          <p><JargonText segs={jDef} /></p>
          <h2>Fonctionnement</h2>
          <p><JargonText segs={jHow} /></p>
          {FICHE_GUIDE[inv.slug] && guideBySlug[FICHE_GUIDE[inv.slug]] && (
            <p className="small">
              <strong>Pour aller plus loin :</strong>{' '}
              <Link to={`/guides/${FICHE_GUIDE[inv.slug]}`}>{guideBySlug[FICHE_GUIDE[inv.slug]].title}</Link>
            </p>
          )}
          {inv.slug === 'scpi' && <SchemaScpi />}
          {inv.slug === 'objets-d-art-collection' && <SchemaObjetsArt />}
          {inv.slug === 'groupements-forestiers' && <SchemaForet />}
          {inv.slug === 'foncieres-cotees' && <SchemaFonciereCotee />}
          {inv.slug === 'obligations' && <SchemaObligation />}
          {inv.slug === 'assurance-vie' && <SchemaAssuranceVie />}
          {inv.slug === 'assurance-vie' && <SchemaAssuranceVieDeces />}
          {inv.slug === 'crowdfunding' && <SchemaCrowdfunding />}
          {inv.slug === 'private-equity' && <SchemaCapitalInvestissement />}
          {inv.slug === 'per' && <SchemaPer />}
          {inv.slug === 'lmnp' && <SchemaLmnp />}
          {inv.slug === 'location-nue' && <SchemaLocationNue />}
          {inv.slug === 'etf-monde' && <SchemaEtf />}
          {inv.slug === 'cryptomonnaies' && <SchemaCrypto />}
          {inv.slug === 'compte-titres' && <SchemaCto />}
          {inv.slug === 'actions-individuelles' && <SchemaActions />}
          {inv.slug === 'donation' && <SchemaDonation />}
          {inv.slug === 'or' && <SchemaOr />}
          {inv.slug === 'livret-a' && <SchemaQuinzaines />}
          {inv.slug === 'pea' && <SchemaPea />}
          {inv.slug === 'pel' && <SchemaPel />}
          {inv.slug === 'lep' && <SchemaLep />}
          {inv.slug === 'unites-de-compte' && <SchemaUniteDeCompte />}
          {inv.slug === 'fonds-euros' && <SchemaFondsEuros />}
          {inv.slug === 'capital-humain' && <SchemaCpf />}
          {inv.slug === 'creation-entreprise' && <SchemaCreationEntreprise />}
          {inv.slug === 'reprise-entreprise' && <SchemaRepriseEntreprise />}
          {inv.slug === 'activite-numerique' && <SchemaActiviteNumerique />}
          {inv.slug === 'compte-a-terme' && <SchemaCompteATerme />}
          {inv.slug === 'credit-immobilier' && <SchemaLevier />}
          <h2>Comment investir</h2>
          <ul>{inv.howToInvest.map((s, i) => <li key={s}><JargonText segs={jSteps[i]} /></li>)}</ul>

          <h2>En pratique</h2>
          {inv.slug === 'donation' && (
            <div className="table-wrap facts-table">
              <table>
                <caption>Montant donné sans impôt, par donateur et par bénéficiaire (renouvelable tous les 15 ans)</caption>
                <thead><tr><th scope="col">Lien avec le donateur</th><th scope="col">Abattement</th></tr></thead>
                <tbody>
                  {DONATION_ABATTEMENTS.map((a) => <tr key={a.lien}><th scope="row">{a.lien}</th><td>{fmtEuros(a.montant)}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
          <div className={`facts-grid${unbalanced(inv.fees.text, inv.tax.text) ? ' facts-stack' : ''}`}>
            <div className="panel"><h3>Frais</h3><CheckedText c={inv.fees} split path={`/encyclopedie/${inv.slug}`} segs={j.fees} /></div>
            <div className="panel"><h3>Fiscalité française</h3><CheckedText c={inv.tax} split path={`/encyclopedie/${inv.slug}`} segs={j.tax} /></div>
            <p className="facts-wide"><strong>Temps et compétences :</strong> {inv.timeSkills}</p>
          </div>

          <h2>Avantages et inconvénients</h2>
          <div className="proscons">
            <div className="panel pros"><h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Avantages</h3><ul>{inv.pros.map((p, k) => <li key={p}><JargonText segs={j.pros[k]} /></li>)}</ul></div>
            <div className="panel cons"><h3 style={{ marginTop: 0, color: 'var(--danger)' }}>Inconvénients</h3><ul>{inv.cons.map((p, k) => <li key={p}><JargonText segs={j.cons[k]} /></li>)}</ul></div>
          </div>

          <h2>Exemple chiffré</h2>
          <p className="notice info"><JargonText segs={linkOnly(inv.example, `/encyclopedie/${inv.slug}`)} /></p>

          <AdSlot id={`fiche-${inv.slug}`} />

          <h2>Sources et vérification</h2>
          <Sources list={inv.sources} />
          {stale && <p className="notice small">La date de révision prévue est dépassée : certaines informations ont pu changer. Vérifiez-les auprès des sources officielles.</p>}
          <p className="verif-line">Dernière vérification : <strong>{fmtDate(inv.review.verifiedOn)}</strong> · prochaine révision prévue : <strong>{fmtDate(inv.review.nextReview)}</strong></p>
          <Fold title="Détail du suivi, données et hypothèses">
            <dl className="facts">
              <dt>Fiscalité considérée valable au</dt><dd>{fmtDate(inv.review.taxValidAsOf)}</dd>
            </dl>
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
            <ul className="next-list">
              {relatedSimulators(simsForInvestment[inv.slug]).map((sim) => (
                <li key={sim.slug}><Link to={`/simulateurs/${sim.slug}`}>{sim.title}</Link><span>{simBlurb(sim.slug)}</span></li>
              ))}
            </ul>
          </>)}

          <h2>Alternatives comparables</h2>
          <ul className="next-list">
            {inv.alternatives.filter((a) => investmentBySlug[a]).map((a) => (
              <li key={a}><Link to={`/encyclopedie/${a}`}>{investmentBySlug[a].name}</Link><span>{investmentBySlug[a].summary}</span></li>
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
            <MetersLegend />
            <dl className="facts">
              <dt>Horizon</dt><dd>{inv.horizon}</dd>
              <dt>Capital nécessaire</dt>
              <dd>{inv.minCapital.text} {needsCheck(inv.minCapital) && <span className="badge-unverified">à vérifier</span>}</dd>
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
