/**
 * Mesure d'audience GoatCounter, sans cookie.
 * Le script est chargé en différé ; on attend qu'il soit prêt (au plus 10 s) puis on compte la page.
 * Hors du site publié (aperçu, pré-rendu, script bloqué par un bloqueur de publicité), rien ne se passe.
 */
type GoatCounter = { count: (vars: { path: string; title?: string }) => void };

export function trackPageview(): void {
  if (typeof window === 'undefined') return;
  let tries = 0;
  const attempt = () => {
    const gc = (window as unknown as { goatcounter?: GoatCounter }).goatcounter;
    if (gc && typeof gc.count === 'function') {
      // Laisse le temps à la page de mettre à jour son titre.
      window.setTimeout(() => {
        try {
          // Barre finale systématique (comme les adresses pré-rendues) ; paramètres d'URL (recherches) jamais transmis.
          gc.count({ path: location.pathname.replace(/\/?$/, '/'), title: document.title });
        } catch {
          /* mesure indisponible : sans conséquence pour le site */
        }
      }, 50);
      return;
    }
    if (++tries < 40) window.setTimeout(attempt, 250);
  };
  attempt();
}
