import type { ComponentType } from 'react';

/**
 * Pages chargées à la demande : un fichier JavaScript par page (les parties communes sont mutualisées par Vite).
 * Au pré-rendu (SSR), les pages sont importées directement : le HTML statique contient donc tout le contenu.
 * Dans le navigateur, la page de l'adresse courante est chargée avant l'hydratation (voir main.tsx), pour que
 * le HTML pré-rendu soit conservé tel quel.
 */
type PageModule = Record<string, ComponentType>;
export type LazyPage = ComponentType & { preload: () => Promise<unknown> };

const loaders = import.meta.glob<PageModule>('./pages/*.tsx');
/** Pages déjà chargées : renseigné par entry-server.tsx pour le pré-rendu, vide dans le navigateur. */
export const eager: Record<string, PageModule> = {};

function lazyPage(file: string, name = 'default'): LazyPage {
  const key = `./pages/${file}.tsx`;
  let Loaded: ComponentType | undefined;
  let pending: Promise<unknown> | undefined;
  const preload = () =>
    (pending ??= loaders[key]().then((m) => {
      Loaded = m[name];
    }));
  const Page = Object.assign(() => {
    Loaded ??= eager[key]?.[name];
    if (!Loaded) throw preload(); // Suspense affiche le repli pendant le chargement
    return <Loaded />;
  }, { preload }) as LazyPage;
  return Page;
}

export const ROUTES: { path: string; Component: LazyPage }[] = [
  { path: '/', Component: lazyPage('Home') },
  { path: '/recherche', Component: lazyPage('SearchPage') },
  { path: '/encyclopedie', Component: lazyPage('Encyclopedia') },
  { path: '/encyclopedie/:slug', Component: lazyPage('InvestmentPage') },
  { path: '/comparateur', Component: lazyPage('Compare') },
  { path: '/simulateurs', Component: lazyPage('Simulators') },
  { path: '/simulateurs/patrimoine', Component: lazyPage('SimPatrimoine') },
  { path: '/simulateurs/immobilier', Component: lazyPage('SimImmobilier') },
  { path: '/simulateurs/credit', Component: lazyPage('SimCredit') },
  { path: '/simulateurs/portefeuille', Component: lazyPage('SimPortefeuille') },
  { path: '/simulateurs/etf-immobilier', Component: lazyPage('SimEtfImmobilier') },
  { path: '/simulateurs/entreprise', Component: lazyPage('SimEntreprise') },
  { path: '/simulateurs/independance-financiere', Component: lazyPage('SimIndependance') },
  { path: '/simulateurs/epargne-de-precaution', Component: lazyPage('SimPrecaution') },
  { path: '/simulateurs/budget', Component: lazyPage('SimBudget') },
  { path: '/simulateurs/frais', Component: lazyPage('SimFrais') },
  { path: '/simulateurs/rembourser-ou-investir', Component: lazyPage('SimRembourser') },
  { path: '/simulateurs/inflation', Component: lazyPage('SimInflation') },
  { path: '/simulateurs/endettement', Component: lazyPage('SimEndettement') },
  { path: '/simulateurs/objectif-epargne', Component: lazyPage('SimObjectif') },
  { path: '/simulateurs/taeg', Component: lazyPage('SimTaeg') },
  { path: '/simulateurs/louer-ou-acheter', Component: lazyPage('SimLouerAcheter') },
  { path: '/simulateurs/dettes', Component: lazyPage('SimDettes') },
  { path: '/simulateurs/investir-d-un-coup-ou-progressivement', Component: lazyPage('SimEtalement') },
  { path: '/simulateurs/retraits-reguliers-duree-du-capital', Component: lazyPage('SimRetraits') },
  { path: '/simulateurs/rendement-reel-de-mon-placement', Component: lazyPage('SimRendement') },
  { path: '/simulateurs/cout-d-attendre-pour-epargner', Component: lazyPage('SimAttendre') },
  { path: '/simulateurs/doubler-son-capital-regle-de-72', Component: lazyPage('SimDoubler') },
  { path: '/simulateurs/augmenter-son-epargne-chaque-annee', Component: lazyPage('SimProgressif') },
  { path: '/simulateurs/interets-simples-ou-composes', Component: lazyPage('SimSimpleComposes') },
  { path: '/simulateurs/renegocier-son-credit-gain-et-point-mort', Component: lazyPage('SimRenegociation') },
  { path: '/simulateurs/duree-pour-atteindre-un-capital', Component: lazyPage('SimDuree') },
  { path: '/simulateurs/convertir-un-taux-annuel-en-taux-mensuel', Component: lazyPage('SimTaux') },
  { path: '/simulateurs/duree-du-credit-mensualite-et-cout-total', Component: lazyPage('SimDureeCredit') },
  { path: '/simulateurs/credit-in-fine-ou-amortissable', Component: lazyPage('SimInFine') },
  { path: '/simulateurs/rendement-necessaire-pour-atteindre-un-objectif', Component: lazyPage('SimRendementRequis') },
  { path: '/simulateurs/capital-a-placer-aujourd-hui', Component: lazyPage('SimCapitalAPlacer') },
  { path: '/glossaire', Component: lazyPage('Glossaire') },
  { path: '/plan-du-site', Component: lazyPage('PlanDuSite') },
  { path: '/confidentialite', Component: lazyPage('Legal', 'Confidentialite') },
  { path: '/mentions-legales', Component: lazyPage('Legal', 'MentionsLegales') },
  { path: '/entrepreneuriat', Component: lazyPage('Entrepreneuriat') },
  { path: '/guides', Component: lazyPage('Guides', 'GuideList') },
  { path: '/guides/:slug', Component: lazyPage('Guides', 'GuidePage') },
  { path: '/methodologie', Component: lazyPage('Methodologie') },
  { path: '*', Component: lazyPage('NotFound') },
];

