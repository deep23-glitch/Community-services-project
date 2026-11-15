// STEP 11g - Reports page. Net = sales - purchases - expenses.
import { S, ui, liveSales, monthTotals, allMonthKeys } from '../state.js';
import { esc, inr, inrK, mkey, mlabel } from '../utils.js';
import { kpi, head, empty } from './shared.js';

export function reports() {
  const keys = allMonthKeys(); if (!ui.rmonth || keys.indexOf(ui.rmonth) < 0) ui.rmonth = keys[0];
  const k = ui.rmonth, mt = monthTotals(k);
  const opts = keys.map((x) => '<option value="' + x + '"' + (x === k ? ' selected' : '') + '>' + mlabel(x) + '</option>').join('');
  const rows = keys.slice(0, 6).map((x) => { const t = monthTotals(x); return '<tr><td class="strong">' + mlabel(x) + '</td><td class="num">' + inr(t.sales) + '</td><td class="num">' + inr(t.purch) + '</td><td class="num">' + inr(t.exp) + '</td><td class="num ' + (t.net < 0 ? 't-bad' : '') + '">' + inr(t.net) + '</td></tr>'; }).join('');

  const sold = {};
  liveSales().filter((s) => mkey(s.ts) === k).forEach((s) => s.items.forEach((i) => { sold[i.name] = (sold[i.name] || 0) + i.qty * i.price; }));
  const top = Object.keys(sold).sort((a, b) => sold[b] - sold[a]).slice(0, 5), tmax = top.length ? sold[top[0]] : 1;
  const byc = {}; S.expenses.filter((e) => mkey(e.ts) === k).forEach((e) => { byc[e.cat] = (byc[e.cat] || 0) + e.amount; });
  const cl = Object.keys(byc).sort((a, b) => byc[b] - byc[a]), cmax = cl.length ? byc[cl[0]] : 1;
  const bars = (list, map, max) => list.length
    ? '<div class="bars">' + list.map((n) => '<div class="bar-row"><span>' + esc(n) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.max(3, map[n] / max * 100) + '%"></div></div><span class="num">' + inr(map[n]) + '</span></div>').join('') + '</div>'
    : empty('Nothing recorded for this month.');

  return head('Reports', 'A clear summary of sales, purchases and shop expenses.', '<select id="rmonth" aria-label="Report month">' + opts + '</select><button class="btn" data-act="export">Export summary</button>')
    + '<section class="kpis">' + kpi('Sales this month', inrK(mt.sales), mlabel(k), '₹') + kpi('Purchases this month', inrK(mt.purch), 'Stock purchases', 'P')
    + kpi('Expenses this month', inrK(mt.exp), 'Recorded costs', 'E') + kpi('Net after expenses', inrK(mt.net), 'Sales less purchases and expenses', '₹') + '</section>'
    + '<section class="card"><div class="card-head"><div><h2>Monthly summary</h2><p class="sub">Calculated from your recorded sales, stock purchases and expenses</p></div></div>'
    + '<div class="tbl-wrap"><table><thead><tr><th>Period</th><th>Sales</th><th>Purchases</th><th>Expenses</th><th>Net</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
    + '<p class="foot" style="margin-top:12px">Monthly net = sales − purchases − recorded expenses. Voided sales are excluded.</p></section>'
    + '<section class="grid-2e"><div class="card"><div class="card-head"><div><h2>Top selling products</h2><p class="sub">By sales value in ' + mlabel(k) + '</p></div></div>' + bars(top, sold, tmax) + '</div>'
    + '<div class="card"><div class="card-head"><div><h2>Expenses by category</h2><p class="sub">' + mlabel(k) + '</p></div></div>' + bars(cl, byc, cmax) + '</div></section>';
}
