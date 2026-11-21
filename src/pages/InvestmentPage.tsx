import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { config } from '../config';
import { categoryById } from '../data/categories';
import { investmentBySlug } from '../data/investments';
import { guidesForInvestment, relatedSimulators, simsForInvestment, simulateTarget } from '../lib/relatedSims';
import { FamilyIcon } from '../components/Icons';
import { AdSlot, CapitalFact, CheckedText, Crumbs, Fold, MeterRows, MetersLegend, PageHead, Sources } from '../components/ui';
import { simBlurb } from '../lib/simThemes';
import { interleave, splitNext } from '../lib/nextLinks';
import { NextList, NextMore, type NextItem } from '../components/NextList';
import { DONATION_ABATTEMENTS, fmtEuros } from '../data/donationAbattements';
import { SchemaActions, SchemaForet, SchemaDonation, SchemaDonationBilan, SchemaAssuranceVie, SchemaCapitalInvestissement, SchemaPrivateEquityBilan, SchemaCrowdfunding, SchemaCrypto, SchemaCryptoBilan, SchemaCto, SchemaEtf, SchemaFonciereCotee, SchemaFonciereBilan, SchemaLmnp, SchemaLocationNue, SchemaObligation, SchemaObligationBilan, SchemaEtfBilan, SchemaAssuranceVieBilan, SchemaOr, SchemaOrBilan, SchemaLep, SchemaPel, SchemaPer, SchemaPerBilan, SchemaScpi, SchemaScpiBilan, SchemaCrowdfundingBilan, SchemaMicroBilan, SchemaUniteDeCompte, SchemaFondsEuros, SchemaCompteATerme, SchemaAssuranceVieDeces, SchemaCpf, SchemaObjetsArt, SchemaObjetsArtBilan, SchemaCreationEntreprise, SchemaRepriseEntreprise, SchemaRepriseBilan, SchemaLivretBilan, SchemaActiviteNumerique, SchemaPee, SchemaPeeBilan, SchemaLevierBilan, SchemaPeaBilan, SchemaForetBilan, SchemaFraisBilan } from '../components/schemas/fiches';
import { SchemaPea, SchemaQuinzaines } from '../components/schemas/communs';
import NotFound from './NotFound';
import { DonationCalculator } from '../components/DonationCalculator';
import { fmtDate } from '../lib/dates';
import { ficheRubricUpdate } from '../lib/ficheDates';
import { guideBySlug } from '../data/guides';
import { linkOnly } from '../lib/jargon';
import { annotateFiche } from '../lib/ficheText';
import { JargonText } from '../components/Jargon';
import { PageToc } from '../components/PageToc';
import { sectionId } from '../lib/toc';

/** Une carte longue (plus de 280 caractères) à côté d'une carte au moins deux fois plus courte laisserait un grand vide : on les empile. */
const unbalanced = (a: string, b: string) => Math.max(a.length, b.length) > 280 && Math.min(a.length, b.length) * 2 < Math.max(a.length, b.length);

/** Bouton « Simuler » : lien vers le simulateur principal, ou ancre native (défilement et ouverture) vers un calcul intégré à la fiche. */
function SimButton({ sim }: { sim: { to: string; title?: string } }) {
  const label = sim.title ? `Simuler : ${sim.title}` : undefined;
  if (sim.to.startsWith('#')) return <a className="btn small secondary" href={sim.to} aria-label={label}>Simuler</a>;
  return <Link className="btn small secondary" to={sim.to} aria-label={label}>Simuler</Link>;
}

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
  // « Simuler » ouvre directement le simulateur principal du placement (le catalogue seulement à défaut).
  const sim = simulateTarget(inv.slug);
  const sims = relatedSimulators(simsForInvestment[inv.slug]);
  const guidesLies = (guidesForInvestment[inv.slug] ?? []).filter((g) => guideBySlug[g]);
  const [jDef] = j.definition;
  const [jHow] = j.howItWorks;
  const jSteps = j.steps;
  const later = ficheRubricUpdate(inv);
  // Simulateurs et guides alternés : les deux premières cartes sont le simulateur principal et le guide qui explique.
  const outils: NextItem[] = interleave(
    sims.map((s) => ({ kind: 'Simulateur', to: `/simulateurs/${s.slug}`, title: s.title, blurb: simBlurb(s.slug) })),
    guidesLies.map((g) => ({ kind: 'Guide', to: `/guides/${g}`, title: guideBySlug[g].title })),
  );
  const fiches: NextItem[] = inv.alternatives.filter((a) => investmentBySlug[a])
    .map((a) => ({ kind: 'Placement comparable', to: `/encyclopedie/${a}`, title: investmentBySlug[a].name, blurb: investmentBySlug[a].summary }));
  const hasNext = outils.length + fiches.length > 0;
  const compareTo = `/comparateur?ids=${[inv.slug, ...inv.alternatives.slice(0, 2)].join(',')}`;
  const howToTitle = inv.howToTitle ?? 'Comment investir';
  const howToId = sectionId(howToTitle);
  // Sommaire de la colonne de droite (grand écran) : mêmes intitulés que les titres de la fiche.
  const toc = [
    { id: 'rub-definition', label: 'Définition' },
    { id: 'rub-fonctionnement', label: 'Fonctionnement' },
    { id: howToId, label: howToTitle },
    { id: 'rub-en-pratique', label: 'En pratique : frais et fiscalité' },
    { id: 'rub-avantages-et-inconvenients', label: 'Avantages et inconvénients' },
    { id: 'rub-exemple-chiffre', label: 'Exemple chiffré' },
    ...(hasNext ? [{ id: 'rub-pour-aller-plus-loin', label: 'Pour aller plus loin' }] : []),
    { id: 'rub-sources-et-verification', label: 'Sources et vérification' },
  ];

  return (
    <>
      <Crumbs items={[
        { to: '/encyclopedie', label: 'Encyclopédie' },
        ...(cat.name === inv.name ? [] : [{ to: `/encyclopedie?cat=${cat.id}`, label: cat.name }]),
        { label: inv.name },
      ]} />
      <div className="fiche">
        <article className="prose">
          <PageHead eyebrow={cat.name} icon={<FamilyIcon id={cat.id} size={20} />} title={inv.name}>{inv.summary}</PageHead>

          <div className="panel fiche-brief">
            <MeterRows risk={inv.risk} liquidity={inv.liquidity} effort={inv.effort} effortNote={inv.timeSkills} />
            <MetersLegend />
            <p className="small fiche-facts" style={{ margin: '10px 0 0' }}>
              <span><strong>Horizon :</strong> {inv.horizon}.</span>{' '}
              <span><strong>Capital :</strong> <CapitalFact c={inv.minCapital} /></span>
            </p>
            <div className="btn-row" style={{ marginTop: 12 }}>
              <Link className="btn small" to={compareTo}>Comparer</Link>
              <SimButton sim={sim} />
            </div>
          </div>

          <h2 id="rub-definition">Définition</h2>
          <p><JargonText segs={jDef} /></p>
          <h2 id="rub-fonctionnement">Fonctionnement</h2>
          <p><JargonText segs={jHow} /></p>
          {inv.slug === 'scpi' && <SchemaScpi />}
          {inv.slug === 'objets-d-art-collection' && <SchemaObjetsArt />}
          {inv.slug === 'groupements-forestiers' && <SchemaForet />}
          {inv.slug === 'foncieres-cotees' && <SchemaFonciereCotee />}
          {inv.slug === 'obligations' && <SchemaObligation />}
          {inv.slug === 'assurance-vie' && (
            <div className="fig-pair">
              <SchemaAssuranceVie />
              <SchemaAssuranceVieDeces />
            </div>
          )}
          {inv.slug === 'crowdfunding' && <SchemaCrowdfunding />}
          {inv.slug === 'private-equity' && <SchemaCapitalInvestissement />}
          {inv.slug === 'per' && <SchemaPer />}
          {inv.slug === 'pee' && <SchemaPee />}
          {inv.slug === 'lmnp' && <SchemaLmnp />}
          {inv.slug === 'location-nue' && <SchemaLocationNue />}
          {inv.slug === 'etf-monde' && <SchemaEtf />}
          {inv.slug === 'cryptomonnaies' && <SchemaCrypto />}
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
          <h2 id={howToId}>{howToTitle}</h2>
          <ul>{inv.howToInvest.map((s, i) => <li key={s}><JargonText segs={jSteps[i]} /></li>)}</ul>

          <h2 id="rub-en-pratique">En pratique</h2>
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
          </div>

          <h2 id="rub-avantages-et-inconvenients">Avantages et inconvénients</h2>
          <div className="proscons">
            <div className="panel pros"><h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Avantages</h3><ul>{inv.pros.map((p, k) => <li key={p}><JargonText segs={j.pros[k]} /></li>)}</ul></div>
            <div className="panel cons"><h3 style={{ marginTop: 0, color: 'var(--danger)' }}>Inconvénients</h3><ul>{inv.cons.map((p, k) => <li key={p}><JargonText segs={j.cons[k]} /></li>)}</ul></div>
          </div>

          <h2 id="rub-exemple-chiffre">Exemple chiffré</h2>
          {(() => {
            const ex = <JargonText segs={linkOnly(inv.example, `/encyclopedie/${inv.slug}`)} />;
            if (inv.slug === 'per') return <SchemaPerBilan>{ex}</SchemaPerBilan>;
            if (inv.slug === 'crowdfunding') return <SchemaCrowdfundingBilan>{ex}</SchemaCrowdfundingBilan>;
            if (inv.slug === 'scpi') return <SchemaScpiBilan>{ex}</SchemaScpiBilan>;
            if (inv.slug === 'location-nue' || inv.slug === 'lmnp') return <SchemaMicroBilan kind={inv.slug}>{ex}</SchemaMicroBilan>;
            if (inv.slug === 'donation') return <><SchemaDonationBilan>{ex}</SchemaDonationBilan><DonationCalculator /></>;
            if (inv.slug === 'credit-immobilier') return <SchemaLevierBilan>{ex}</SchemaLevierBilan>;
            if (inv.slug === 'obligations') return <SchemaObligationBilan>{ex}</SchemaObligationBilan>;
            if (inv.slug === 'etf-monde') return <SchemaEtfBilan>{ex}</SchemaEtfBilan>;
            if (inv.slug === 'assurance-vie') return <SchemaAssuranceVieBilan>{ex}</SchemaAssuranceVieBilan>;
            if (inv.slug === 'actions-individuelles') return <SchemaActions>{ex}</SchemaActions>;
            if (inv.slug === 'pea') return <SchemaPeaBilan>{ex}</SchemaPeaBilan>;
            if (inv.slug === 'compte-titres') return <SchemaCto>{ex}</SchemaCto>;
            if (inv.slug === 'or') return <SchemaOrBilan>{ex}</SchemaOrBilan>;
            if (inv.slug === 'cryptomonnaies') return <SchemaCryptoBilan>{ex}</SchemaCryptoBilan>;
            if (inv.slug === 'foncieres-cotees') return <SchemaFonciereBilan>{ex}</SchemaFonciereBilan>;
            if (inv.slug === 'private-equity') return <SchemaPrivateEquityBilan>{ex}</SchemaPrivateEquityBilan>;
            if (inv.slug === 'objets-d-art-collection') return <SchemaObjetsArtBilan>{ex}</SchemaObjetsArtBilan>;
            if (inv.slug === 'pee') return <SchemaPeeBilan>{ex}</SchemaPeeBilan>;
            if (inv.slug === 'fonds-euros' || inv.slug === 'unites-de-compte') return <SchemaFraisBilan kind={inv.slug}>{ex}</SchemaFraisBilan>;
            if (inv.slug === 'groupements-forestiers') return <SchemaForetBilan>{ex}</SchemaForetBilan>;
            if (inv.slug === 'reprise-entreprise') return <SchemaRepriseBilan>{ex}</SchemaRepriseBilan>;
            if (inv.slug === 'compte-a-terme' || inv.slug === 'pel' || inv.slug === 'lep') return <SchemaLivretBilan kind={inv.slug}>{ex}</SchemaLivretBilan>;
            return <p className="notice info">{ex}</p>;
          })()}

          <AdSlot id={`fiche-${inv.slug}`} />

          {/* Suites logiques avant les sources, comme sur les guides : une seule grille étiquetée (simulateur, guide,
              fiche d'un placement comparable). Au-delà de NEXT_VISIBLE cartes, la suite est repliée pour ne pas
              repousser les sources (chantier 144, même règle que les guides). */}
          {hasNext && (() => {
            const [shown, rest] = splitNext(outils, fiches);
            return (<>
              <h2 id="rub-pour-aller-plus-loin">Pour aller plus loin</h2>
              <NextList items={shown} />
              <NextMore items={rest} />
            </>);
          })()}

          <h2 id="rub-sources-et-verification">Sources et vérification</h2>
          <Sources list={inv.sources} />
          {stale && <p className="notice small">La date de révision prévue est dépassée : certaines informations ont pu changer. Vérifiez-les auprès des sources officielles.</p>}
          {/* Une rubrique revérifiée après la relecture complète porte sa propre date : la ligne le dit, au lieu d'afficher une « dernière vérification » plus ancienne qu'elle. */}
          <p className="verif-line">
            {later ? (
              <>Dernière vérification : <strong>{fmtDate(later.date)}</strong> ({later.labels.join(' et ')}) · relecture complète : <strong>{fmtDate(inv.review.verifiedOn)}</strong></>
            ) : (
              <>Dernière vérification : <strong>{fmtDate(inv.review.verifiedOn)}</strong></>
            )}
            {' '}· prochaine révision : <strong>{fmtDate(inv.review.nextReview)}</strong>
          </p>
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

        </article>

        <aside>
          <div className="panel">
            <strong>En bref</strong>
            <MeterRows risk={inv.risk} liquidity={inv.liquidity} effort={inv.effort} effortNote={inv.timeSkills} />
            <MetersLegend />
            <dl className="facts">
              <dt>Horizon</dt><dd>{inv.horizon}</dd>
              <dt>Capital nécessaire</dt>
              <dd><CapitalFact c={inv.minCapital} /></dd>
              <dt>Mots-clés</dt>
              <dd>{inv.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</dd>
            </dl>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <Link className="btn small" to={compareTo}>Comparer</Link>
              <SimButton sim={sim} />
            </div>
          </div>
          {/* Le sommaire suit la lecture (« En bref » défile) : les boutons Comparer et Simuler y sont repris pour rester à portée de main. */}
          <PageToc className="panel fiche-toc" items={toc}>
            <div className="btn-row">
              <Link className="btn small" to={compareTo}>Comparer</Link>
              <SimButton sim={sim} />
            </div>
          </PageToc>
        </aside>
      </div>
    </>
  );
}
