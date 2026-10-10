import { useState } from 'react';
import { AS_OF, investments } from '../data/investments';
import { clearAll } from '../lib/storage';
import { PageHead } from '../components/ui';

export default function Methodologie() {
  const [cleared, setCleared] = useState(false);
  const unverified = investments.filter((i) => !i.tax.verified || !i.fees.verified).length;
  return (
    <div className="prose">
      <PageHead eyebrow="Transparence" title="Méthode, sources et confidentialité" />

      <h2>Indépendance et limites</h2>
      <p>
        Patrimoine OS fournit des informations générales et des outils de calcul. Il ne délivre aucun conseil en investissement personnalisé
        et ne remplace pas un conseiller agréé. Aucune statistique de fréquentation ou de performance n'est inventée.
      </p>

      <h2>Vérification des informations</h2>
      <p>
        Les informations fiscales et réglementaires portent une date de référence (actuellement le {AS_OF}). Chaque fiche distingue les éléments
        vérifiés auprès de sources consultées et ceux marqués « à vérifier ». À ce jour, {unverified} fiche{unverified > 1 ? 's comportent' : ' comporte'} au
        moins un élément de frais ou de fiscalité marqué « à vérifier ». Les échelles de risque, liquidité et effort (1 à 5) sont des appréciations éditoriales.
      </p>

      <h2>Formules de calcul</h2>
      <ul>
        <li><strong>Rendement net de frais</strong> : (1 + r) × (1 − f) − 1.</li>
        <li><strong>Capitalisation</strong> : taux mensuel actuariel (1 + r)^(1/12) − 1, versements en début de mois.</li>
        <li><strong>Valeur réelle</strong> : valeur nominale / (1 + inflation)^années.</li>
        <li><strong>Mensualité de crédit</strong> : C × t / (1 − (1 + t)^−n), avec t = taux annuel / 12 (convention bancaire française).</li>
        <li><strong>Rendement locatif brut</strong> : loyers annuels / prix. <strong>Net de charges</strong> : (loyers encaissés − charges) / coût total de l'opération.</li>
        <li><strong>Fiscalité à la sortie</strong> : simplification par un taux unique appliqué aux gains ; abattements et cas particuliers non modélisés.</li>
      </ul>
      <p>Ces formules sont couvertes par des tests automatisés exécutés avant chaque mise en ligne.</p>

      <h2>Confidentialité et données locales</h2>
      <p>
        Aucun compte, aucun cookie, aucun outil de suivi. Vos saisies et simulations enregistrées sont conservées dans le stockage local de votre
        navigateur, sur cet appareil uniquement. Elles ne sont ni transmises ni synchronisées entre vos appareils, et disparaissent si vous effacez
        les données du site.
      </p>
      <button className="btn secondary" onClick={() => { clearAll(); setCleared(true); }}>Effacer mes données locales</button>
      {cleared && <p role="status" className="small" style={{ marginTop: 8 }}>Données locales effacées. Rechargez la page pour revenir aux valeurs par défaut.</p>}

      <h2>Publicité et liens partenaires</h2>
      <p>
        Le site ne contient actuellement ni publicité ni lien affilié. S'il en contient un jour, ils seront clairement signalés et n'influenceront pas
        le contenu des fiches.
      </p>
    </div>
  );
}
