// STEP 11e - Sales page. Click a row to see its items or void it.
import { S, ui, salesIn, monthTotals, sod, DAY } from '../state.js';
import { esc, inr, inrK, when, mkey, sum } from '../utils.js';
import { ic } from '../icons.js';
import { kpi, head, empty, more } from './shared.js';

export function sales() {
  const now = Date.now(), t0 = sod(now), tod = salesIn(t0, t0 + DAY), ts = sum(tod, (s) => s.total);
  const mt = monthTotals(mkey(now)), list = S.sales.slice().sort((a, b) => b.ts - a.ts), shown = list.slice(0, ui.lim.sales);
  const rows = shown.map((s) => {
    const n = sum(s.items, (i) => i.qty), o = ui.open === s.id;
    let r = '<tr class="click" data-act="toggle" data-id="' + s.id + '" tabindex="0" aria-expanded="' + o + '"><td class="strong">' + s.id + '</td><td>' + when(s.ts) + '</td><td>' + n + (n === 1 ? ' item' : ' items') + '</td><td>' + s.payment + '</td><td class="num">' + inr(s.total) + '</td><td><span class="' + (s.void ? 't-bad' : 't-good') + '">' + (s.void ? 'Voided' : 'Recorded') + '</span></td></tr>';
    if (o) r += '<tr class="detail"><td colspan="6"><ul>' + s.items.map((i) => '<li><span>' + esc(i.name) + ' × ' + i.qty + '</span><span class="num">' + inr(i.qty * i.price) + '</span></li>').join('') + '</ul>'
      + (s.void ? '' : '<div style="margin-top:10px"><button class="btn ghost sm" data-act="void" data-id="' + s.id + '">Void this sale</button></div>') + '</td></tr>';
    return r;
  }).join('');
  return head('Sales', 'Track transactions recorded at your shop.', '<button class="btn" data-act="sale">' + ic('plus') + 'Record sale</button>')
    + '<section class="kpis">' + kpi('Sales today', inrK(ts), tod.length ? 'Recorded today' : 'No sales yet today', '₹')
    + kpi('Transactions today', tod.length, 'All payment types', '▢')
    + kpi('Average sale', inr(tod.length ? ts / tod.length : 0), 'Today’s average', '▢')
    + kpi('This month', inrK(mt.sales), 'Recorded sales', '₹') + '</section>'
    + '<section class="card"><div class="card-head"><div><h2>Sales transactions</h2><p class="sub">Select a row to see items or void a sale</p></div></div>'
    + (list.length ? '<div class="tbl-wrap"><table><thead><tr><th>Receipt</th><th>Date</th><th>Items</th><th>Payment</th><th>Amount</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + more('sales', list.length)
      : empty('No sales recorded yet.', '<button class="btn" data-act="sale">' + ic('plus') + 'Record sale</button>'))
    + '</section>';
}
