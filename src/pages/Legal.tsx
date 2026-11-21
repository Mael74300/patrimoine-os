import { useState } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../config';
import { buildExport, clearAll, parseImport, readAll, writeAll } from '../lib/storage';
import { PageHead } from '../components/ui';
import { ProseWithToc, TocH2, tocItems } from '../components/PageToc';

function LocalDataTools({ onClear }: { onClear: () => void }) {
  const [message, setMessage] = useState('');
  function download() {
    const entries = readAll();
    if (Object.keys(entries).length === 0) {
      setMessage("Aucune donnée locale à exporter : enregistrez d'abord une simulation.");
      return;
    }
    const blob = new Blob([JSON.stringify(buildExport(entries), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patrimoine-os-donnees-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage(`${Object.keys(entries).length} élément(s) exporté(s) dans un fichier de votre appareil.`);
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    const result = parseImport(await file.text());
    if (!result.ok) {
      setMessage(`Import refusé : ${result.error}`);
      return;
    }
    const n = writeAll(result.data);
    setMessage(`${n} élément(s) importé(s). Rechargez la page d'un simulateur pour les retrouver.`);
  }
  return (
    <>
      <p>
        Pour les retrouver sur un autre appareil, exportez-les dans un fichier, puis importez-le là-bas : rien n'est envoyé. L'import
        complète ou remplace vos données locales actuelles. Vous pouvez aussi tout effacer à tout moment.
      </p>
      <div className="btn-row">
        <button className="btn secondary" onClick={download}>Exporter mes données</button>
        <label className="btn secondary" style={{ cursor: 'pointer' }}>
          Importer un fichier
          <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        <button className="btn secondary" onClick={onClear}>Effacer mes données locales</button>
      </div>
      {message && <p role="status" className="small" style={{ marginTop: 8 }}>{message}</p>}
    </>
  );
}

/** Rubriques de la politique de confidentialité ; « Mesure d'audience » seulement si la mesure est activée. */
export function confidentialiteRubriques(audience: boolean): string[] {
  return [
    'En bref', 'Stockage local',
    ...(audience ? ["Mesure d'audience"] : []), 'Hébergement et sites tiers', 'Vos droits',
  ];
}

export const MENTIONS_RUBRIQUES = ['Éditeur', 'Hébergeur', 'Nature du contenu', 'Liens commerciaux', 'Propriété intellectuelle'];

export function Confidentialite() {
  const [cleared, setCleared] = useState(false);
  return (
    <ProseWithToc items={tocItems(confidentialiteRubriques(Boolean(config.analytics.goatcounter)))}>
      <PageHead eyebrow="RGPD" title="Politique de confidentialité">
        Ni compte, ni cookie : les montants que vous saisissez ne quittent pas votre appareil.
      </PageHead>

      <TocH2>En bref</TocH2>
      <div className="proscons">
        <div className="panel cons">
          <h3>Jamais demandé ni déposé</h3>
          <ul>
            <li>Aucun compte ni adresse électronique</li>
            <li>Aucune coordonnée bancaire ni mot de passe</li>
            <li>Aucun cookie ni traceur publicitaire</li>
          </ul>
        </div>
        <div className="panel pros">
          <h3>Ce qui reste chez vous</h3>
          <ul>
            <li>Les calculs : faits entièrement dans votre navigateur</li>
            <li>Vos montants : transmis à personne, pas même à l’éditeur</li>
            <li>Vos saisies : aucun formulaire ne les envoie à un serveur</li>
          </ul>
        </div>
      </div>

      <TocH2>Stockage local</TocH2>
      <p>
        Vos dernières saisies et les simulations que vous enregistrez sont gardées dans le stockage local de votre navigateur (localStorage),
        pour vous éviter de tout ressaisir. Elles restent sur cet appareil : jamais envoyées, ni synchronisées entre vos appareils, ni utilisées
        pour vous suivre ou mesurer l'audience.
      </p>
      <LocalDataTools onClear={() => { clearAll(); setCleared(true); }} />
      {cleared && <p role="status" className="small" style={{ marginTop: 8 }}>Données locales effacées.</p>}

      {config.analytics.goatcounter && (
        <>
          <TocH2>{"Mesure d'audience"}</TocH2>
          <p>
            Pour savoir quelles pages sont utiles, le site compte les pages vues avec{' '}
            <a href="https://www.goatcounter.com" target="_blank" rel="noopener noreferrer">GoatCounter</a>, un outil open source qui
            n'utilise pas de cookie et n'enregistre rien dans votre navigateur. Pour chaque page vue, il reçoit l'adresse de la page, le site
            d'où vous venez, le type de navigateur et d'appareil, la taille d'écran et un pays approximatif. Il n'est pas conçu pour vous identifier
            et ne conserve pas de données personnelles de façon durable. Les statistiques ne servent qu'à améliorer le site ; elles ne sont ni
            revendues ni utilisées pour de la publicité. Les montants saisis dans les simulateurs ne sont jamais transmis.
          </p>
          <p>
            Vous pouvez empêcher ce comptage avec un bloqueur de contenu : le site fonctionne de la même façon. Détails dans la{' '}
            <a href="https://www.goatcounter.com/help/privacy" target="_blank" rel="noopener noreferrer">politique de confidentialité de GoatCounter</a>.
          </p>
        </>
      )}

      <TocH2>Hébergement et sites tiers</TocH2>
      <p>
        Le site est hébergé par GitHub Pages. Comme tout hébergeur, GitHub peut enregistrer des données techniques de connexion, notamment
        l'adresse IP, à des fins de sécurité et de fonctionnement, et peut les traiter aux États-Unis. Ce traitement relève de GitHub :
        consultez sa <a href={config.legal.hostPrivacyUrl} target="_blank" rel="noopener noreferrer">déclaration de confidentialité</a>.
        Les liens vers d'autres sites, comme les sources officielles, ouvrent des sites tiers, soumis à leurs propres politiques.
      </p>

      <TocH2>Vos droits</TocH2>
      <p>
        L'éditeur ne détenant aucune donnée personnelle vous concernant, il n'en a aucune à vous communiquer ou à effacer. Pour toute question :
        {' '}{config.legal.contact}. Vous pouvez aussi saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
      </p>
      <p className="small muted">Version du 10 octobre 2026, mise à jour pour la mesure d'audience. Si d'autres services tiers (publicité, par exemple) étaient ajoutés, cette page serait mise à jour et un consentement serait demandé lorsque la loi l'exige, avant tout dépôt de traceur.</p>
    </ProseWithToc>
  );
}

export function MentionsLegales() {
  return (
    <ProseWithToc items={tocItems(MENTIONS_RUBRIQUES)}>
      <PageHead eyebrow="Informations légales" title="Mentions légales" />
      <TocH2>Éditeur</TocH2>
      <p>{config.legal.publisher}<br />Directeur ou directrice de la publication : {config.legal.publicationDirector}<br />Contact : {config.legal.contact}</p>
      <TocH2>Hébergeur</TocH2>
      <p>{config.legal.host}</p>
      <TocH2>Nature du contenu</TocH2>
      <p>
        Les informations publiées sont générales et pédagogiques. Elles ne constituent ni un conseil en investissement, ni un conseil juridique ou
        fiscal, et ne tiennent pas compte de votre situation personnelle. Les résultats des simulateurs dépendent de vos hypothèses et ne sont pas des
        prévisions. Avant toute décision, consultez un professionnel habilité.
      </p>
      <TocH2>Liens commerciaux</TocH2>
      <p>
        Le site ne contient aujourd'hui aucun lien commercial ni publicité. S'il en contient un jour, chacun sera signalé comme tel ; la présence d'une
        rémunération n'influencera pas le contenu des fiches. Voir <Link to="/methodologie">Méthode et sources</Link>.
      </p>
      <TocH2>Propriété intellectuelle</TocH2>
      <p>Les textes, données et code sont originaux. Les sources citées restent la propriété de leurs auteurs ; aucun article n'est reproduit.</p>
    </ProseWithToc>
  );
}
