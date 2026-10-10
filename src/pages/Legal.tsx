import { useState } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../config';
import { clearAll } from '../lib/storage';
import { PageHead } from '../components/ui';

export function Confidentialite() {
  const [cleared, setCleared] = useState(false);
  return (
    <div className="prose">
      <PageHead eyebrow="RGPD" title="Politique de confidentialité">Version du 10 octobre 2026, mise à jour pour la mesure d'audience.</PageHead>

      <h2>Ce que le site ne collecte pas</h2>
      <p>
        {config.siteName} ne demande ni compte, ni adresse électronique, ni coordonnées bancaires, ni mot de passe. Il n'utilise aucun cookie
        et aucun traceur publicitaire. Aucun formulaire n'envoie de données à un serveur.
      </p>

      <h2>Les calculs restent sur votre appareil</h2>
      <p>
        Les simulateurs s'exécutent entièrement dans votre navigateur. Les montants que vous saisissez ne sont transmis à personne, y compris à l'éditeur.
      </p>

      <h2>Stockage local</h2>
      <p>
        Pour vous éviter de tout ressaisir, vos dernières saisies et les simulations que vous choisissez d'enregistrer sont conservées dans le
        stockage local de votre navigateur (localStorage). Ce stockage sert uniquement une fonctionnalité que vous utilisez ; il ne sert ni à
        vous suivre ni à mesurer l'audience. Ces données restent sur cet appareil, ne sont pas synchronisées entre vos appareils et ne sont jamais
        envoyées. Vous pouvez les effacer à tout moment :
      </p>
      <button className="btn secondary" onClick={() => { clearAll(); setCleared(true); }}>Effacer mes données locales</button>
      {cleared && <p role="status" className="small" style={{ marginTop: 8 }}>Données locales effacées.</p>}

      {config.analytics.goatcounter && (
        <>
          <h2>Mesure d'audience</h2>
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

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par GitHub Pages. Comme tout hébergeur, GitHub peut enregistrer des données techniques de connexion, notamment
        l'adresse IP, à des fins de sécurité et de fonctionnement, et peut les traiter aux États-Unis. Ce traitement relève de GitHub :
        consultez sa <a href={config.legal.hostPrivacyUrl} target="_blank" rel="noopener noreferrer">déclaration de confidentialité</a>.
      </p>

      <h2>Liens externes</h2>
      <p>Les liens vers des sites officiels ou des partenaires ouvrent des sites tiers, soumis à leurs propres politiques.</p>

      <h2>Vos droits</h2>
      <p>
        L'éditeur ne détenant aucune donnée personnelle vous concernant, il n'en a aucune à vous communiquer ou à effacer. Pour toute question :
        {' '}{config.legal.contact}. Vous pouvez aussi saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>.
      </p>
      <p className="small muted">Si d'autres services tiers (publicité, par exemple) étaient ajoutés, cette page serait mise à jour et un consentement serait demandé lorsque la loi l'exige, avant tout dépôt de traceur.</p>
    </div>
  );
}

export function MentionsLegales() {
  return (
    <div className="prose">
      <PageHead eyebrow="Informations légales" title="Mentions légales" />
      <h2>Éditeur</h2>
      <p>{config.legal.publisher}<br />Directeur ou directrice de la publication : {config.legal.publicationDirector}<br />Contact : {config.legal.contact}</p>
      <h2>Hébergeur</h2>
      <p>{config.legal.host}</p>
      <h2>Nature du contenu</h2>
      <p>
        Les informations publiées sont générales et pédagogiques. Elles ne constituent ni un conseil en investissement, ni un conseil juridique ou
        fiscal, et ne tiennent pas compte de votre situation personnelle. Les résultats des simulateurs dépendent de vos hypothèses et ne sont pas des
        prévisions. Avant toute décision, consultez un professionnel habilité.
      </p>
      <h2>Liens commerciaux</h2>
      <p>
        Le site ne contient aujourd'hui aucun lien commercial ni publicité. S'il en contient un jour, chacun sera signalé comme tel ; la présence d'une
        rémunération n'influencera pas le contenu des fiches. Voir <Link to="/methodologie">Méthode et sources</Link>.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>Les textes, données et code sont originaux. Les sources citées restent la propriété de leurs auteurs ; aucun article n'est reproduit.</p>
    </div>
  );
}
