// STEP 11d - Stock page.
import { S, lowItems, sod } from '../state.js';
import { esc, inr, when, mkey, sum } from '../utils.js';
import { ic } from '../icons.js';
import { kpi, head, empty, more } from './shared.js';
import { ui } from '../state.js';

export function stock() {
  const t0 = sod(Date.now()), mk = mkey(Date.now());
  const inToday = S.moves.filter((m) => m.type === 'in' && m.ts >= t0);
  const inT = sum(inToday, (m) => m.qty), inP = new Set(inToday.map((m) => m.pid)).size;
  const outT = sum(S.moves.filter((m) => m.type === 'out' && m.ts >= t0), (m) => m.qty);
  const cnt = S.moves.filter((m) => mkey(m.ts) === mk).length;
  const list = S.moves.slice().sort((a, b) => b.ts - a.ts), shown = list.slice(0, ui.lim.moves);
  return head('Stock management', 'Record stock received and track reorder levels.', '<button class="btn" data-act="stock">' + ic('plus') + 'Record stock</button>')
    + '<section class="kpis">' + kpi('Items to reorder', lowItems().length, 'At or below minimum quantity', '!', '', 'warn')
    + kpi('Stock received today', inT + ' units', 'Across ' + inP + ' products', '▢')
    + kpi('Stock issued today', outT + ' units', 'Sales and manual stock out', '−')
    + kpi('Stock movements', cnt, 'This month', '▢') + '</section>'
    + '<section class="card"><div class="card-head"><div><h2>Stock movements</h2><p class="sub">Recent stock-in and stock-out activity</p></div></div>'
    + (list.length
      ? '<div class="tbl-wrap"><table><thead><tr><th>Product</th><th>Movement</th><th class="r">Quantity</th><th>Date</th><th>Recorded by</th><th>Note</th></tr></thead><tbody>'
        + shown.map((m) => '<tr><td class="strong">' + esc(m.name) + '</td><td>' + (m.type === 'in' ? 'Stock in' : '<span class="t-warn">Stock out</span>') + '</td><td class="r num">' + (m.type === 'in' ? '+' : '−') + m.qty + '</td><td>' + when(m.ts) + '</td><td>' + esc(m.by) + '</td><td>' + esc(m.note || (m.cost ? 'Purchase ' + m.ref + ' · ' + inr(m.cost) : '')) + '</td></tr>').join('')
        + '</tbody></table></div>' + more('moves', list.length)
      : empty('No stock movements yet.', '<button class="btn" data-act="stock">' + ic('plus') + 'Record stock</button>'))
    + '</section>';
}
