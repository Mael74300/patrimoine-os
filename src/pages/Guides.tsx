import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { guideBySlug, guideGroups, guides, otherGuides } from '../data/guides';
import { investmentBySlug } from '../data/investments';
import { guideBlurb } from '../lib/guideBlurbs';
import { simBlurb } from '../lib/simThemes';
import { guideComparatorLink, guideSimulators, guidesForGuide } from '../lib/relatedSims';
import { interleave, splitNext } from '../lib/nextLinks';
import { NextList, NextMore, type NextItem } from '../components/NextList';
import { NetWorthCalculator } from '../components/NetWorthCalculator';
import { Crumbs, FaqSection, MobileFold, PageHead, Sources } from '../components/ui';
import { ENVELOPE_CARDS, EnvelopeCards } from '../components/EnvelopeCards';
import { LivretsTable } from '../components/LivretsTable';
import { RiskMap } from '../components/RiskMap';
import { GuideGroupIcon } from '../components/Icons';
import { SchemaEnveloppe, SchemaHorlogesEnveloppes, SchemaRendement, SchemaEscalier, SchemaDiversification, SchemaDiversificationPrincipe, SchemaInflation, SchemaInterets, SchemaMensualite, SchemaEndettement, SchemaLeviers, SchemaPatrimoineNet, SchemaRembourser, SchemaImmoEtf, SchemaRegle72, SchemaEpargneMois, SchemaHorizons, SchemaFrais, SchemaFraisCumul, SchemaFamillesFrais, SchemaAdditionFrais, SchemaPetitsVersements, SchemaPrecaution, SchemaPtz, SchemaCashflow } from '../components/schemas/guides';
import { SchemaPea, SchemaQuinzaines, SchemaLevier } from '../components/schemas/communs';
import { annotateJargon, splitLead, type JargonSegment } from '../lib/jargon';
import { JargonText } from '../components/Jargon';
import NotFound from './NotFound';
import { fmtDate } from '../lib/dates';
import { sectionId } from '../lib/toc';
import { PageToc } from '../components/PageToc';

/** Guide « Par où commencer » : pour chaque étape, la page du site qui permet d'aller plus loin (aucun chiffre). */
export const etapesSuite: { to: string; label: string }[] = [
  { to: '/simulateurs/budget', label: 'Calculer mon budget et mon taux d’épargne' },
  { to: '/guides/combien-epargne-de-precaution', label: 'Combien mettre de côté ?' },
  { to: '/guides/rembourser-credit-par-anticipation-ou-investir', label: 'Rembourser un crédit ou investir ?' },
  { to: '/guides/choisir-son-enveloppe', label: 'PEA, assurance-vie, PER : comment choisir ?' },
  { to: '/guides/epargne-limitee', label: 'Investir quand on épargne peu' },
];

// « Par où commencer » : les fiches du guide rattachées à l’étape qui les cite, plutôt qu’en liste à part en bas de page.
// Libellés courts, pour que les pastilles tiennent sur une ligne à 375 px ; le nom complet est sur la fiche.
export const etapesFiches: { slug: string; label: string }[][] = [
  [],
  [{ slug: 'lep', label: 'LEP' }, { slug: 'livret-a', label: 'Livret A et LDDS' }],
  [],
  [{ slug: 'pea', label: 'PEA' }, { slug: 'assurance-vie', label: 'Assurance-vie' }, { slug: 'pee', label: 'PEE' }],
  [{ slug: 'etf-monde', label: 'ETF actions diversifiés' }],
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

export { sectionId } from '../lib/toc';

/** Rubrique après laquelle s'affiche le bouton principal du guide : `cta.after` si indiqué, sinon la dernière rubrique. */
export function guideCtaIndex(g: { sections: { heading: string }[]; cta?: { after?: string } }): number {
  const i = g.cta?.after ? g.sections.findIndex((s) => s.heading === g.cta?.after) : -1;
  return i >= 0 ? i : g.sections.length - 1;
}

export function GuidePage() {
  const { slug = '' } = useParams();
  const g = guideBySlug[slug];
  if (!g) return <NotFound />;
  // Le simulateur ouvert par le bouton principal n’est pas répété dans « Simulateurs liés ».
  const sims = guideSimulators(g.slug, g.cta?.to);
  // Jargon expliqué sur place : première apparition de chaque notion du glossaire dans le guide.
  // Les paragraphes remplacés par les cartes des enveloppes ne s'affichent pas : ils ne comptent pas. Ceux qui suivent s'affichent sous les cartes.
  const cardsInstead = (s: { heading: string }) => g.slug === 'choisir-son-enveloppe' && s.heading === 'Les grandes différences';
  const asCard = (s: { heading: string }, k: number) => cardsInstead(s) && k < ENVELOPE_CARDS.length;
  const jargon = annotateJargon(g.sections.flatMap((s) => s.body.map((p, k) => (asCard(s, k) ? '' : p))), { path: `/guides/${g.slug}`, title: g.title });
  const jargonStart = g.sections.map((_, i) => g.sections.slice(0, i).reduce((n, s) => n + s.body.length, 0));
  /* « Pour aller plus loin » : une seule grille, simulateurs d'abord (comme en bas des fiches) ; chaque carte dit ce qu'elle est.
     Au-delà de NEXT_VISIBLE cartes, la suite est repliée pour ne pas repousser les sources (chantier 143).
     Le classement du guide Types d'investissements et les cartes du guide Choisir son enveloppe renvoient déjà vers chaque fiche. */
  const simItems: NextItem[] = sims.map((sim) => ({ kind: 'Simulateur', to: `/simulateurs/${sim.slug}`, title: sim.title, blurb: simBlurb(sim.slug) }));
  /* Guide d'entrée « Types d'investissements » : la suite du parcours (guides suivants, comparateur) passe avant le simulateur (chantier 200). */
  const guideItems: NextItem[] = (guidesForGuide[g.slug] ?? []).filter((x) => guideBySlug[x])
    .map((x) => ({ kind: 'Guide', to: `/guides/${x}`, title: guideBySlug[x].title, blurb: guideBlurb(x) }));
  // Comparateur préréglé sur les placements du guide, avant les simulateurs (chantiers 200 et 201).
  const comparator = guideComparatorLink(g.slug);
  const toolItems: NextItem[] = comparator ? [{ kind: 'Outil', ...comparator }, ...simItems] : simItems;
  const leadItems = interleave(guideItems, toolItems);
  // « Autres guides » ne répète pas un guide déjà proposé en carte juste au-dessus.
  const others = otherGuides(g.slug, 3, guidesForGuide[g.slug] ?? []);
  const ficheItems: NextItem[] = g.slug === 'types-investissements' || g.slug === 'choisir-son-enveloppe' ? []
    : g.related.filter((r) => investmentBySlug[r]).map((r) => ({ kind: 'Fiche', to: `/encyclopedie/${r}`, title: investmentBySlug[r].name, blurb: investmentBySlug[r].summary }));
  const hasNext = g.slug !== 'par-ou-commencer' && leadItems.length + ficheItems.length > 0;
  // Sommaire : les rubriques du guide, puis les questions, les suites et les sources (repères pour vérifier).
  // Parcours de lecture du guide (page « Guides ») : son nom et son icône dans le sur-titre ; la durée de lecture suit la date de mise à jour.
  // Action principale (chantier 156) : juste après la rubrique qui en parle, et non plus après les questions fréquentes.
  const ctaIndex = guideCtaIndex(g);
  const groupIndex = guideGroups.findIndex((grp) => grp.slugs.includes(g.slug));
  const toc = [
    ...g.sections.map((s) => ({ id: sectionId(s.heading), label: s.heading })),
    ...(g.faq?.length ? [{ id: 'rub-questions-frequentes', label: 'Questions fréquentes' }] : []),
    ...(hasNext ? [{ id: 'rub-pour-aller-plus-loin', label: 'Pour aller plus loin' }] : []),
    { id: 'rub-sources', label: 'Sources' },
  ];
  return (
    <article>
      <Crumbs items={[{ to: '/', label: 'Accueil' }, { to: '/guides', label: 'Guides' }, { label: g.title }]} />
      <div className="guide-layout">
      <div className="prose">
        <PageHead eyebrow={groupIndex >= 0 ? guideGroups[groupIndex].title : 'Guide'} icon={groupIndex >= 0 ? <GuideGroupIcon index={groupIndex} size={20} /> : undefined} title={g.title}>{g.summary}</PageHead>
        <p className="small muted">Mis à jour le {fmtDate(g.updatedOn)} · {g.readingMinutes}&nbsp;min de lecture</p>
        {g.slug === 'par-ou-commencer' && <SchemaEscalier steps={g.sections.map((s) => s.heading)} targets={g.sections.map((s) => sectionId(s.heading))} title="Les cinq étapes pour construire son patrimoine, dans l’ordre" />}
        {g.sections.map((s, i) => (
          <section key={s.heading}>
            <h2 id={sectionId(s.heading)}>{g.slug === 'par-ou-commencer' ? `${i + 1}. ${s.heading}` : s.heading}</h2>
            {s.points && !cardsInstead(s) && (
              <ul className="guide-points">{s.body.map((p, k) => <li key={p}><PointText segs={jargon[jargonStart[i] + k]} /></li>)}</ul>
            )}
            {cardsInstead(s) && <EnvelopeCards />}
            {!s.points && s.body.map((p, k) => !asCard(s, k) && (
              <Fragment key={p}>
                {/* Un paragraphe « Concrètement, … » traduit l'exemple en effet pour le lecteur : encadré comme la synthèse des simulateurs. */}
                <p className={p.startsWith('Concrètement') ? 'takeaway' : undefined}><JargonText segs={jargon[jargonStart[i] + k]} /></p>
                {g.slug === 'investir-a-credit' && s.heading === 'Un exemple fictif' && k === 0 && <SchemaMensualite />}
                {g.slug === 'investir-a-credit' && s.heading === 'Un exemple fictif' && k === 1 && <SchemaLevier brief />}
                {g.slug === 'combien-epargne-de-precaution' && s.heading === 'Où placer cette réserve' && k === 0 && <LivretsTable />}
                {g.slug === 'choisir-son-enveloppe' && s.heading === 'Comment les combiner' && k === 0 && <SchemaHorlogesEnveloppes />}
                {g.slug === 'comparer-les-frais' && s.heading === 'Les familles de frais' && k === 0 && <SchemaFamillesFrais />}
                {g.slug === 'comparer-les-frais' && s.heading === 'Additionner pour comparer' && k === 0 && <SchemaAdditionFrais />}
                {g.slug === 'interets-composes' && s.heading === 'L’effet des frais' && k === 1 && <SchemaFraisCumul />}
              </Fragment>
            ))}
            {g.slug === 'taux-endettement-capacite-emprunt' && s.heading === 'Le repère de 35 %' && <SchemaEndettement />}
            {g.slug === 'taux-endettement-capacite-emprunt' && s.heading.startsWith('Que faire si') && <SchemaLeviers />}
            {g.slug === 'rembourser-credit-par-anticipation-ou-investir' && s.heading === 'Un exemple fictif chiffré' && <SchemaRembourser />}
            {g.slug === 'immobilier-ou-etf' && s.heading.startsWith('La méthode') && <SchemaImmoEtf />}
            {g.slug === 'regle-de-72-doubler-son-capital' && s.heading.startsWith('Jusqu’où') && <SchemaRegle72 />}
            {g.slug === 'combien-epargner-par-mois-objectif' && s.heading.startsWith('La durée') && <SchemaEpargneMois />}
            {g.slug === 'combien-epargner-par-mois-objectif' && s.heading.startsWith('Où placer') && <SchemaHorizons />}
            {g.slug === 'epargne-limitee' && s.heading.startsWith('Commencer petit') && <SchemaPetitsVersements />}
            {g.slug === 'combien-epargne-de-precaution' && s.heading.startsWith('Aucune règle') && <SchemaPrecaution />}
            {g.slug === 'comparer-les-frais' && s.heading.startsWith('L’effet') && <SchemaFrais />}
            {g.slug === 'patrimoine-net' && s.heading === 'La définition' && <SchemaPatrimoineNet />}
            {g.slug === 'types-investissements' && s.heading === 'Le classement' && <RiskMap />}
            {/* Le schéma « placement et enveloppe » n'est dessiné qu'une fois, dans le guide qui compare les enveloppes ; Types d'investissements y renvoie. */}
            {g.slug === 'choisir-son-enveloppe' && s.heading.startsWith('Placement et enveloppe') && <SchemaEnveloppe />}
            {g.slug === 'fonctionnement-pea' && s.heading === 'Retraits et fiscalité' && <SchemaPea />}
            {g.slug === 'livret-a-calcul-interets-quinzaines' && s.heading === 'Des intérêts calculés par quinzaines' && <SchemaQuinzaines />}
            {g.slug === 'rentabilite-locative' && s.heading === 'Le rendement net de charges' && <SchemaRendement />}
            {g.slug === 'rentabilite-locative' && s.heading.startsWith('Le cash-flow') && <SchemaCashflow />}
            {g.slug === 'interets-composes' && i === 0 && <SchemaInterets />}
            {g.slug === 'inflation-pouvoir-d-achat-epargne' && s.heading === 'Un exemple fictif chiffré' && <SchemaInflation />}
            {g.slug === 'diversification-placements' && s.heading === 'Le principe' && <SchemaDiversificationPrincipe />}
            {g.slug === 'diversification-placements' && s.heading === 'Un exemple fictif chiffré' && <SchemaDiversification />}
            {g.slug === 'pret-a-taux-zero-ptz' && s.heading === 'Comment il se rembourse' && <SchemaPtz />}
            {g.slug === 'par-ou-commencer' && etapesSuite[i] && (
              <p className="step-more">
                <Link to={etapesSuite[i].to}>{etapesSuite[i].label}</Link>
                {etapesFiches[i].filter((f) => investmentBySlug[f.slug]).map((f) => (
                  <Link key={f.slug} className="step-fiche" to={`/encyclopedie/${f.slug}`}><span className="step-kind">Fiche</span> {f.label}</Link>
                ))}
              </p>
            )}
            {g.cta && !g.widget && i === ctaIndex && <p className="guide-cta"><Link className="btn" to={g.cta.to}>{g.cta.label}</Link></p>}
          </section>
        ))}
        <FaqSection items={g.faq ?? []} />
      </div>
      <PageToc className="guide-toc" items={toc} />
      </div>
      {g.widget === 'patrimoine-net' && (<><h2>Calculer votre patrimoine net</h2><NetWorthCalculator /></>)}
      <div className="prose">
        {/* Guide avec un outil intégré : l'action principale vient après l'outil. */}
        {g.cta && g.widget && <p className="guide-cta"><Link className="btn" to={g.cta.to}>{g.cta.label}</Link></p>}
        {hasNext && (() => {
          const [shown, rest] = splitNext(leadItems, ficheItems);
          return (<>
            <h2 id="rub-pour-aller-plus-loin">Pour aller plus loin</h2>
            <NextList items={shown} />
            <NextMore items={rest} />
          </>);
        })()}
        <h2 id="rub-sources">Sources</h2>
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
