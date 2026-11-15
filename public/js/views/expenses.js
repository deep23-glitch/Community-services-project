// STEP 11f - Expenses page.
import { S, ui } from '../state.js';
import { esc, inr, inrK, dayLabel, dateOnly, mkey, sum } from '../utils.js';
import { ic } from '../icons.js';
import { kpi, head, empty, more } from './shared.js';

export function expenses() {
  const mk = mkey(Date.now()), mine = S.expenses.filter((e) => mkey(e.ts) === mk), tot = sum(mine, (e) => e.amount);
  const byc = {}; mine.forEach((e) => { byc[e.cat] = (byc[e.cat] || 0) + e.amount; });
  const topc = Object.keys(byc).sort((a, b) => byc[b] - byc[a])[0];
  const list = S.expenses.slice().sort((a, b) => b.ts - a.ts), shown = list.slice(0, ui.lim.exp), last = list[0];
  return head('Expenses', 'Keep shop costs together for a clear monthly picture.', '<button class="btn" data-act="addexp">' + ic('plus') + 'Add expense</button>')
    + '<section class="kpis">' + kpi('Expenses this month', inrK(tot), 'Total recorded', '₹')
    + kpi('Expense entries', mine.length, 'For this month', '▢')
    + kpi('Largest category', topc ? esc(topc) : 'None', topc ? inr(byc[topc]) + ' recorded' : 'No entries yet', '▢')
    + kpi('Last entry', last ? inr(last.amount) : 'None', last ? esc(last.title) + ' · ' + dayLabel(last.ts).toLowerCase() : 'Nothing recorded', '₹') + '</section>'
    + '<section class="card"><div class="card-head"><div><h2>Recent expenses</h2><p class="sub">Costs recorded for your shop</p></div></div>'
    + (list.length
      ? '<div class="tbl-wrap"><table><thead><tr><th>Expense</th><th>Category</th><th>Date</th><th>Payment method</th><th class="r">Amount</th><th class="r">Actions</th></tr></thead><tbody>'
        + shown.map((e) => '<tr><td class="strong">' + esc(e.title) + '</td><td>' + esc(e.cat) + '</td><td>' + dateOnly(e.ts) + '</td><td>' + esc(e.method) + '</td><td class="r num">' + inr(e.amount) + '</td><td class="r"><button class="btn ghost icon" data-act="delexp" data-id="' + e.id + '" aria-label="Delete ' + esc(e.title) + '">' + ic('trash') + '</button></td></tr>').join('')
        + '</tbody></table></div>' + more('exp', list.length)
      : empty('No expenses recorded yet.', '<button class="btn" data-act="addexp">' + ic('plus') + 'Add expense</button>'))
    + '</section>';
}
