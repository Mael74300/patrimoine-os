import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { guideBySlug, guideGroups, guides, otherGuides } from '../data/guides';
import { investmentBySlug } from '../data/investments';
import { guideBlurb } from '../lib/guideBlurbs';
import { simBlurb } from '../lib/simThemes';
import { guideSimulators } from '../lib/relatedSims';
import { NetWorthCalculator } from '../components/NetWorthCalculator';
import { Crumbs, FaqSection, MobileFold, PageHead, Sources } from '../components/ui';
import { EnvelopeCards } from '../components/EnvelopeCards';
import { LivretsTable } from '../components/LivretsTable';
import { RiskMap } from '../components/RiskMap';
import { GuideGroupIcon } from '../components/Icons';
import { SchemaEnveloppe, SchemaRendement, SchemaEscalier, SchemaDiversification, SchemaDiversificationPrincipe, SchemaInflation, SchemaInterets, SchemaMensualite, SchemaEndettement, SchemaLeviers, SchemaPatrimoineNet, SchemaRembourser, SchemaImmoEtf, SchemaRegle72, SchemaEpargneMois, SchemaFrais, SchemaFamillesFrais, SchemaPetitsVersements, SchemaPrecaution, SchemaPtz, SchemaCashflow } from '../components/schemas/guides';
import { SchemaPea, SchemaQuinzaines, SchemaLevier } from '../components/schemas/communs';
import { annotateJargon, splitLead, type JargonSegment } from '../lib/jargon';
import { JargonText } from '../components/Jargon';
import NotFound from './NotFound';
import { fmtDate } from '../lib/dates';

/** Guide « Par où commencer » : pour chaque étape, la page du site qui permet d'aller plus loin (aucun chiffre). */
export const etapesSuite: { to: string; label: string }[] = [
  { to: '/simulateurs/budget', label: 'Calculer mon budget et mon taux d’épargne' },
  { to: '/guides/combien-epargne-de-precaution', label: 'Combien mettre de côté ?' },
  { to: '/guides/rembourser-credit-par-anticipation-ou-investir', label: 'Rembourser un crédit ou investir ?' },
  { to: '/guides/choisir-son-enveloppe', label: 'PEA, assurance-vie, PER : comment choisir ?' },
  { to: '/guides/epargne-limitee', label: 'Investir quand on épargne peu' },
];

export { fmtDate } from '../lib/dates';

export function GuideList() {
  return (
    <>
      <PageHead eyebrow="Guides" title="Guides pédagogiques" art="guides">Des explications courtes pour comprendre les mécanismes avant de choisir.</PageHead>
      <nav className="guide-jump" aria-label="Aller à une rubrique">
        {guideGroups.map((grp) => <a key={grp.title} href={`#grp-${grp.slugs[0]}`}>{grp.title}</a>)}
      </nav>
      <div className="guide-groups">
      {guideGroups.map((grp, gi) => (
        <section key={grp.title} aria-labelledby={`grp-${grp.slugs[0]}`} className="guide-group">
          <h2 id={`grp-${grp.slugs[0]}`} className="theme-title" style={{ margin: 0 }}><GuideGroupIcon index={gi} size={28} />{grp.title}</h2>
          <p className="small muted" style={{ margin: '4px 0 8px' }}>{grp.intro}</p>
          <ul className="inv-list inv-list--compact">
            {grp.slugs.map((slug) => guideBySlug[slug]).map((g) => (
              <li key={g.slug}>
                <Link className="inv-row" to={`/guides/${g.slug}`}>
                  <div><h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: 'var(--primary)' }}>{g.title}</h3><p>{guideBlurb(g.slug)}<span className="guide-min-inline"> · {g.readingMinutes} min</span></p></div>
                  <span className="small muted guide-min">{g.readingMinutes} min</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      </div>
    </>
  );
}

/** Point de liste d'un guide : l'amorce avant « : » en gras, pour parcourir la liste d'un coup d'œil. */
function PointText({ segs }: { segs: JargonSegment[] }) {
  const parts = splitLead(segs);
  if (!parts) return <JargonText segs={segs} />;
  return <><strong><JargonText segs={parts.lead} /></strong><JargonText segs={parts.rest} /></>;
}

/** Identifiant d’ancre stable d’une rubrique de guide (sans accents). */
export function sectionId(heading: string): string {
  return 'rub-' + heading.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function GuidePage() {
  const { slug = '' } = useParams();
  const g = guideBySlug[slug];
  if (!g) return <NotFound />;
  const others = otherGuides(g.slug);
  // Le simulateur ouvert par le bouton principal n’est pas répété dans « Simulateurs liés ».
  const sims = guideSimulators(g.slug, g.cta?.to);
  // Jargon expliqué sur place : première apparition de chaque notion du glossaire dans le guide.
  // Une rubrique remplacée par des cartes (enveloppes) n'affiche pas ses paragraphes : ils ne comptent pas.
  const cardsInstead = (s: { heading: string }) => g.slug === 'choisir-son-enveloppe' && s.heading === 'Les grandes différences';
  const jargon = annotateJargon(g.sections.flatMap((s) => (cardsInstead(s) ? s.body.map(() => '') : s.body)), { path: `/guides/${g.slug}`, title: g.title });
  const jargonStart = g.sections.map((_, i) => g.sections.slice(0, i).reduce((n, s) => n + s.body.length, 0));
  return (
    <article>
      <Crumbs items={[{ to: '/', label: 'Accueil' }, { to: '/guides', label: 'Guides' }, { label: g.title }]} />
      <div className="guide-layout">
      <div className="prose">
        <PageHead eyebrow={`Guide · ${g.readingMinutes} min de lecture`} title={g.title}>{g.summary}</PageHead>
        <p className="small muted">Mis à jour le {fmtDate(g.updatedOn)}</p>
        {g.slug === 'par-ou-commencer' && <SchemaEscalier steps={g.sections.map((s) => s.heading)} targets={g.sections.map((s) => sectionId(s.heading))} title="Les cinq étapes pour construire son patrimoine, dans l’ordre" />}
        {g.sections.map((s, i) => (
          <section key={s.heading}>
            <h2 id={sectionId(s.heading)}>{g.slug === 'par-ou-commencer' ? `${i + 1}. ${s.heading}` : s.heading}</h2>
            {s.points && !cardsInstead(s) && (
              <ul className="guide-points">{s.body.map((p, k) => <li key={p}><PointText segs={jargon[jargonStart[i] + k]} /></li>)}</ul>
            )}
            {cardsInstead(s) ? <EnvelopeCards /> : !s.points && s.body.map((p, k) => (
              <Fragment key={p}>
                <p><JargonText segs={jargon[jargonStart[i] + k]} /></p>
                {g.slug === 'investir-a-credit' && s.heading === 'Un exemple fictif' && (k === 0 ? <SchemaMensualite /> : <SchemaLevier />)}
                {g.slug === 'combien-epargne-de-precaution' && s.heading === 'Où placer cette réserve' && k === 0 && <LivretsTable />}
                {g.slug === 'comparer-les-frais' && s.heading === 'Les familles de frais' && k === 0 && <SchemaFamillesFrais />}
              </Fragment>
            ))}
            {g.slug === 'taux-endettement-capacite-emprunt' && s.heading === 'Le repère de 35 %' && <SchemaEndettement />}
            {g.slug === 'taux-endettement-capacite-emprunt' && s.heading.startsWith('Que faire si') && <SchemaLeviers />}
            {g.slug === 'rembourser-credit-par-anticipation-ou-investir' && s.heading === 'Un exemple fictif chiffré' && <SchemaRembourser />}
            {g.slug === 'immobilier-ou-etf' && s.heading.startsWith('La méthode') && <SchemaImmoEtf />}
            {g.slug === 'regle-de-72-doubler-son-capital' && s.heading.startsWith('Jusqu’où') && <SchemaRegle72 />}
            {g.slug === 'combien-epargner-par-mois-objectif' && s.heading.startsWith('La durée') && <SchemaEpargneMois />}
            {g.slug === 'epargne-limitee' && s.heading.startsWith('Commencer petit') && <SchemaPetitsVersements />}
            {g.slug === 'combien-epargne-de-precaution' && s.heading.startsWith('Aucune règle') && <SchemaPrecaution />}
            {g.slug === 'comparer-les-frais' && s.heading.startsWith('L’effet') && <SchemaFrais />}
            {g.slug === 'patrimoine-net' && s.heading === 'La définition' && <SchemaPatrimoineNet />}
            {g.slug === 'types-investissements' && s.heading === 'Le classement' && <RiskMap />}
            {(g.slug === 'types-investissements' || g.slug === 'choisir-son-enveloppe') && s.heading.startsWith('Placement et enveloppe') && <SchemaEnveloppe />}
            {g.slug === 'fonctionnement-pea' && s.heading === 'Retraits et fiscalité' && <SchemaPea />}
            {g.slug === 'livret-a-calcul-interets-quinzaines' && s.heading === 'Des intérêts calculés par quinzaines' && <SchemaQuinzaines />}
            {g.slug === 'rentabilite-locative' && s.heading === 'Le rendement net de charges' && <SchemaRendement />}
            {g.slug === 'rentabilite-locative' && s.heading.startsWith('Le cash-flow') && <SchemaCashflow />}
            {g.slug === 'interets-composes' && i === 0 && <SchemaInterets />}
            {g.slug === 'inflation-pouvoir-d-achat-epargne' && s.heading === 'Un exemple fictif chiffré' && <SchemaInflation />}
            {g.slug === 'diversification-placements' && s.heading === 'Le principe' && <SchemaDiversificationPrincipe />}
            {g.slug === 'diversification-placements' && s.heading === 'Un exemple fictif chiffré' && <SchemaDiversification />}
            {g.slug === 'pret-a-taux-zero-ptz' && s.heading === 'Comment il se rembourse' && <SchemaPtz />}
            {g.slug === 'par-ou-commencer' && etapesSuite[i] && <p className="step-more"><Link to={etapesSuite[i].to}>{etapesSuite[i].label}</Link></p>}
          </section>
        ))}
        <FaqSection items={g.faq ?? []} />
      </div>
      {g.sections.length > 2 && (
        <nav className="guide-toc" aria-label="Sur cette page">
          <p className="guide-toc-title">Sur cette page</p>
          <ol>{g.sections.map((s) => <li key={s.heading}><a href={`#${sectionId(s.heading)}`}>{s.heading}</a></li>)}</ol>
        </nav>
      )}
      </div>
      {g.widget === 'patrimoine-net' && (<><h2>Calculer votre patrimoine net</h2><NetWorthCalculator /></>)}
      <div className="prose">
        {g.cta && <p style={{ marginTop: 24 }}><Link className="btn" to={g.cta.to}>{g.cta.label}</Link></p>}
        {g.slug !== 'choisir-son-enveloppe' && (<>
          <h2>Pour aller plus loin</h2>
          {/* Le classement du guide Types d’investissements renvoie déjà vers chaque fiche. */}
          {g.slug !== 'types-investissements' && (<>
          <h3 className="next-sub">Fiches liées</h3>
          {/* « Par où commencer » : chaque étape a déjà son lien ; les fiches sont listées sans résumé pour garder la page courte. */}
          <ul className={g.slug === 'par-ou-commencer' ? 'next-list next-list-compact' : 'next-list'}>
            {g.related.filter((r) => investmentBySlug[r]).map((r) => (
              <li key={r}><Link to={`/encyclopedie/${r}`}>{investmentBySlug[r].name}</Link>{g.slug !== 'par-ou-commencer' && <span>{investmentBySlug[r].summary}</span>}</li>
            ))}
          </ul>
          </>)}
        </>)}
        {g.slug !== 'par-ou-commencer' && sims.length > 0 && (<>
          <h3 className="next-sub">Simulateurs liés</h3>
          <ul className="next-list">
            {sims.map((sim) => (
              <li key={sim.slug}><Link to={`/simulateurs/${sim.slug}`}>{sim.title}</Link><span>{simBlurb(sim.slug)}</span></li>
            ))}
          </ul>
        </>)}
        <h2>Sources</h2>
        <Sources list={g.sources} />
        {g.slug !== 'par-ou-commencer' && (<>
          <MobileFold label="Autres guides" hint={others.map((o) => o.title).join(' · ')}>
            <ul className="next-list next-list-compact">{others.map((o) => <li key={o.slug}><Link to={`/guides/${o.slug}`}>{o.title}</Link></li>)}</ul>
          </MobileFold>
        </>)}
      </div>
    </article>
  );
}
