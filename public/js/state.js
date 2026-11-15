// STEP 9 - App state + "selectors" (small functions that calculate numbers from the data).
// S is the whole shop loaded from the server. ui holds what the screen is showing (page, filters, row limits).
import { api } from './api.js';
import { sod, mkey, sum, DAY } from './utils.js';

export let S = null;
export const ui = { route: 'dashboard', q: '', cat: '', stat: '', lim: { sales: 15, moves: 15, exp: 15, tx: 6 }, open: null, rmonth: null };

let renderFn = () => {};
export const onRender = (f) => { renderFn = f; };
export async function refresh() { S = await api.state(); renderFn(); }   // reload data from the server, then redraw

export const prod = (id) => S.products.find((p) => p.id === id);
export const liveSales = () => S.sales.filter((s) => !s.void);
export const salesIn = (a, b) => liveSales().filter((s) => s.ts >= a && s.ts < b);
export const status = (p) => (p.stock <= 0 ? 'out' : p.stock <= p.reorder ? 'low' : 'ok');
export const lowItems = () => S.products.filter((p) => status(p) !== 'ok').sort((a, b) => a.stock / a.reorder - b.stock / b.reorder);

// Sales, purchases, expenses and net for one month key like "2026-11"
export function monthTotals(k) {
  const s = sum(liveSales().filter((x) => mkey(x.ts) === k), (x) => x.total);
  const p = sum(S.moves.filter((m) => m.cost && mkey(m.ts) === k), (m) => m.cost);
  const e = sum(S.expenses.filter((x) => mkey(x.ts) === k), (x) => x.amount);
  return { sales: s, purch: p, exp: e, net: s - p - e };
}
export function allMonthKeys() {
  const o = {};
  [...S.sales, ...S.moves, ...S.expenses].forEach((x) => { o[mkey(x.ts)] = 1; });
  o[mkey(Date.now())] = 1;
  return Object.keys(o).sort().reverse();
}
// Sales + purchases + expenses merged, newest first (dashboard "Recent transactions")
export function txList() {
  const tx = [];
  S.sales.forEach((s) => tx.push({ ts: s.ts, name: 'Sale #' + s.id, type: 'Sale', amt: s.total, st: s.void ? 'Voided' : 'Recorded' }));
  S.moves.forEach((m) => { if (m.cost) tx.push({ ts: m.ts, name: 'Purchase #' + m.ref, type: 'Stock purchase', amt: m.cost, st: 'Recorded' }); });
  S.expenses.forEach((e) => tx.push({ ts: e.ts, name: e.title, type: 'Expense', amt: e.amount, st: 'Recorded' }));
  return tx.sort((a, b) => b.ts - a.ts);
}
export { sod, DAY };
