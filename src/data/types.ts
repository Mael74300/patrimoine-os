export type Level = 1 | 2 | 3 | 4 | 5;

export type Source = { label: string; url: string; official?: boolean };

/** Une information datée et dont le statut de vérification est explicite. */
export type Checked = { text: string; verified: boolean; asOf?: string };

export type Category = {
  id: string;
  name: string;
  short: string;
  order: number;
};

export type Investment = {
  slug: string;
  name: string;
  category: string; // Category.id
  summary: string;
  definition: string;
  howItWorks: string;
  howToInvest: string[];
  minCapital: Checked;
  horizon: string;
  horizonYears: number; // horizon minimal conseillé, pour le tri et les filtres
  liquidity: Level; // 5 = disponible immédiatement
  risk: Level; // 5 = risque de perte élevé
  effort: Level; // 5 = temps et compétences élevés
  fees: Checked;
  tax: Checked;
  pros: string[];
  cons: string[];
  timeSkills: string;
  example: string; // exemple chiffré, toujours fictif
  sources: Source[];
  alternatives: string[]; // slugs
  tags: string[];
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  readingMinutes: number;
  sections: { heading: string; body: string[] }[];
  related: string[];
  sources: Source[];
};
