/**
 * Point d'entrée unique des schémas, icônes et en-têtes (utilisé par les tests).
 * Les pages n'importent pas ce fichier : elles importent directement le module de schémas dont elles ont besoin
 * (`schemas/fiches`, `schemas/guides`, `schemas/communs` ou un schéma isolé), pour ne télécharger que ceux-là.
 */
export * from './schemas/outils';
export * from './schemas/communs';
export * from './schemas/fiches';
export * from './schemas/guides';
export * from './schemas/SchemaSeparer';
export * from './schemas/SchemaVerification';
export * from './schemas/SchemaCapitalVise';
export * from './schemas/SchemaMois';
export * from './schemas/SchemaRetraits';
export { HeaderArt, HomeArt, type HeaderArtName } from './HeaderArt';
export { SituationIcon, FamilyIcon, SimThemeIcon, GuideGroupIcon, type SituationIconName } from './Icons';
