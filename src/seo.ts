import { categories } from './data/categories';
import { glossary } from './data/glossary';
import { guides } from './data/guides';
import { investments, VERIFIED_ON } from './data/investments';
import { simulators } from './lib/search';

export type PageMeta = { path: string; title: string; description: string; jsonLd?: object[]; noindex?: boolean };

const SITE = 'Patrimoine OS';
/** Premier titre qui tient en 70 caractères (au-delà, les moteurs le tronquent). */
const fit = (...candidates: string[]) => candidates.find((c) => c.length <= 70) ?? candidates[candidates.length - 1];

const fit170 = (...candidates: string[]) => candidates.find((c) => c.length <= 170) ?? candidates[candidates.length - 1];

const ORG = { '@type': 'Organization', name: SITE };

const crumbs = (siteUrl: string, items: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: siteUrl + path })),
});

/** Métadonnées de chaque page pré-rendue. Les chemins finissent par « / » (convention de GitHub Pages). */
export function pagesMeta(siteUrl: string): PageMeta[] {
  const pages: PageMeta[] = [
    {
      path: '/',
      title: `${SITE} — Encyclopédie et simulateurs patrimoniaux gratuits`,
      description: 'Toutes les stratégies pour construire votre patrimoine : encyclopédie des investissements, comparateurs et simulateurs gratuits, sans inscription.',
      jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE, url: siteUrl + '/', inLanguage: 'fr-FR' }],
    },
    { path: '/encyclopedie/', title: `Encyclopédie des investissements | ${SITE}`, description: `${investments.length} fiches sur les placements accessibles aux particuliers : fonctionnement, risques, frais, fiscalité datée et sources officielles.` },
    { path: '/simulateurs/', title: `Simulateurs financiers gratuits | ${SITE}`, description: 'Simulateurs de patrimoine, crédit, immobilier locatif, entreprise, indépendance financière et épargne de précaution, calculés dans votre navigateur.' },
    { path: '/comparateur/', title: `Comparateur de placements | ${SITE}`, description: 'Comparez jusqu’à trois placements : risque, liquidité, horizon, frais, fiscalité, puis projection selon vos hypothèses.' },
    { path: '/entrepreneuriat/', title: `Créer de la richesse par l’entreprise | ${SITE}`, description: 'Créer, développer ou racheter une entreprise : les voies possibles, leurs risques et les ressources publiques gratuites.' },
    { path: '/guides/', title: `Guides pédagogiques sur l’investissement | ${SITE}`, description: 'Guides pour comprendre le patrimoine net, la rentabilité locative, le PEA, les frais, le crédit et l’effet de levier.' },
    { path: '/glossaire/', title: `Glossaire de la finance personnelle | ${SITE}`, description: 'Les notions clés du patrimoine expliquées simplement : intérêts composés, frais courants, allocation, liquidité, taux d’épargne, avec des liens vers les simulateurs.',
      // Mêmes termes et définitions que ceux affichés sur la page : aucune information ajoutée.
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          name: 'Glossaire de la finance personnelle',
          url: siteUrl + '/glossaire/',
          inLanguage: 'fr-FR',
          hasDefinedTerm: [...glossary]
            .sort((a, b) => a.term.localeCompare(b.term, 'fr'))
            .map((t) => ({ '@type': 'DefinedTerm', name: t.term, description: t.definition, inDefinedTermSet: siteUrl + '/glossaire/' })),
        },
        crumbs(siteUrl, [['Accueil', '/'], ['Glossaire', '/glossaire/']]),
      ],
    },
    { path: '/methodologie/', title: `Méthode, formules et sources | ${SITE}`, description: 'Sources officielles, dates de vérification, formules de calcul et processus de mise à jour de Patrimoine OS.' },
    { path: '/confidentialite/', title: `Politique de confidentialité | ${SITE}`, description: 'Aucun cookie, aucun compte, mesure d’audience anonyme : vos calculs restent dans votre navigateur.' },
    { path: '/recherche/', title: `Recherche | ${SITE}`, description: 'Rechercher une fiche, un guide ou un simulateur.', noindex: true },
    { path: '/mentions-legales/', title: `Mentions légales | ${SITE}`, description: 'Éditeur, hébergeur et nature des informations publiées sur Patrimoine OS.' },
  ];
  for (const s of simulators) {
    pages.push({
      path: `/simulateurs/${s.slug}/`,
      title: fit(`${s.title} | ${SITE}`, s.title),
      description: fit170(`${s.excerpt} Gratuit, sans inscription, calculé dans votre navigateur.`, `${s.excerpt} Gratuit, sans inscription.`),
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'WebApplication', name: s.title, applicationCategory: 'FinanceApplication', operatingSystem: 'Navigateur web', isAccessibleForFree: true, inLanguage: 'fr-FR', url: `${siteUrl}/simulateurs/${s.slug}/` },
        crumbs(siteUrl, [['Accueil', '/'], ['Simulateurs', '/simulateurs/'], [s.title, `/simulateurs/${s.slug}/`]]),
      ],
    });
  }
  for (const i of investments) {
    const cat = categories.find((c) => c.id === i.category)!;
    pages.push({
      path: `/encyclopedie/${i.slug}/`,
      title: fit(`${i.name} : fonctionnement, risques, frais et fiscalité | ${SITE}`, `${i.name} : risques, frais, fiscalité | ${SITE}`, `${i.name} : risques, frais, fiscalité`, `${i.name} | ${SITE}`, i.name),
      description: i.summary,
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'Article', headline: i.name, description: i.summary, inLanguage: 'fr-FR', dateModified: i.review.verifiedOn, author: ORG, publisher: ORG },
        crumbs(siteUrl, [['Accueil', '/'], ['Encyclopédie', '/encyclopedie/'], [cat.name, '/encyclopedie/'], [i.name, `/encyclopedie/${i.slug}/`]]),
      ],
    });
  }
  for (const g of guides) {
    pages.push({
      path: `/guides/${g.slug}/`,
      title: fit(`${g.title} | ${SITE}`, g.title),
      description: g.summary,
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.summary, inLanguage: 'fr-FR', dateModified: g.updatedOn, author: ORG, publisher: ORG },
        crumbs(siteUrl, [['Accueil', '/'], ['Guides', '/guides/'], [g.title, `/guides/${g.slug}/`]]),
        ...(g.faq?.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'fr-FR', mainEntity: g.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : []),
      ],
    });
  }
  return pages;
}

export const lastModified = VERIFIED_ON;
