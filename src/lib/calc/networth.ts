import { num } from './common';

export type NetWorthItem = { id: string; label: string; amount: number; kind: 'actif' | 'dette' };

/** Patrimoine net = total des actifs − total des dettes. */
export function netWorth(items: NetWorthItem[]) {
  const assets = items.filter((i) => i.kind === 'actif').reduce((s, i) => s + Math.max(0, num(i.amount)), 0);
  const debts = items.filter((i) => i.kind === 'dette').reduce((s, i) => s + Math.max(0, num(i.amount)), 0);
  return { assets, debts, net: assets - debts, debtRatio: assets > 0 ? debts / assets : 0 };
}
