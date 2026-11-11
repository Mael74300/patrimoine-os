/**
 * Amorce d'une phrase de rubrique (« Après 8 ans » dans « Après 8 ans : abattement… »),
 * mise en gras dans les listes Frais et Fiscalité des fiches et du comparateur.
 * Renvoie null si la phrase n'a pas d'amorce courte et nette : pas de « : », amorce de plus
 * de 60 caractères, contenant une virgule ou une parenthèse non refermée.
 */
export function sentenceLead(sentence: string): { lead: string; rest: string } | null {
  const m = /\s:\s/.exec(sentence);
  if (!m) return null;
  const lead = sentence.slice(0, m.index);
  if (lead.length < 2 || lead.length > 60) return null;
  if (lead.includes(',') || lead.includes(';')) return null;
  const open = (lead.match(/\(/g) ?? []).length;
  const close = (lead.match(/\)/g) ?? []).length;
  if (open !== close) return null;
  return { lead, rest: sentence.slice(m.index) };
}
