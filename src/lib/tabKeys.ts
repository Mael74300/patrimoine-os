/**
 * Navigation au clavier dans une rangée d'onglets (motif « onglets » de l'ARIA Authoring Practices) :
 * flèches gauche / haut et droite / bas pour l'onglet précédent ou suivant, en boucle ; Début et Fin pour le premier et le dernier.
 * Renvoie l'indice de l'onglet à activer, ou null si la touche ne concerne pas les onglets.
 */
export function nextTabIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
