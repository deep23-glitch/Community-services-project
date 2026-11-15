// STEP 11b - Dashboard page.
import { S, ui, lowItems, monthTotals, salesIn, txList, sod, DAY } from '../state.js';
import { esc, inr, inrK, when, mkey, sum } from '../utils.js';
import { ic } from '../icons.js';
import { kpi, head, empty } from './shared.js';

// Bar chart: this week vs previous week, drawn as SVG
function weekChart() {
  const t0 = sod(Date.now()), dow = (new Date(t0).getDay() + 6) % 7, ws = t0 - dow * DAY;
  const cur = [], prev = [];
  for (let i = 0; i < 7; i++) {
    const a = ws + i * DAY; cur.push(a > t0 ? null : sum(salesIn(a, a + DAY), (s) => s.total));
    const b = ws - 7 * DAY + i * DAY; prev.push(sum(salesIn(b, b + DAY), (s) => s.total));
  }
  let mx = Math.max(...cur.concat(prev).map((v) => v || 0)); if (mx <= 0) mx = 1000;
  const raw = mx / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * mag).find((s) => s >= raw), top = step * 4;
  const W = 640, Ht = 250, L = 46, B = 26, T = 10, iw = W - L - 8, ih = Ht - B - T, gw = iw / 7, bw = Math.min(16, gw / 4);
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let out = '<svg class="chart" viewBox="0 0 ' + W + ' ' + Ht + '" role="img" aria-label="Daily sales this week compared with previous week">';
  for (let g = 0; g <= 4; g++) {
    const y = T + ih - ih * g / 4, v = step * g;
    out += '<line x1="' + L + '" x2="' + (W - 8) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)"/><text x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + (v >= 1000 ? (v / 1000) + 'k' : v) + '</text>';
  }
  for (let d = 0; d < 7; d++) {
    const cx = L + gw * d + gw / 2, hp = ih * prev[d] / top, hc = cur[d] == null ? 0 : ih * cur[d] / top;
    out += '<rect x="' + (cx - bw - 2) + '" y="' + (T + ih - hc) + '" width="' + bw + '" height="' + hc + '" rx="3" fill="var(--accent)"><title>' + names[d] + ' this week: ' + inr(cur[d] || 0) + '</title></rect>';
    out += '<rect x="' + (cx + 2) + '" y="' + (T + ih - hp) + '" width="' + bw + '" height="' + hp + '" rx="3" fill="var(--chart-prev)"><title>' + names[d] + ' previous week: ' + inr(prev[d]) + '</title></rect>';
    out += '<text x="' + cx + '" y="' + (Ht - 8) + '" text-anchor="middle">' + names[d] + '</text>';
  }
  return out + '</svg>';
}

export function dashboard() {
  const now = Date.now(), t0 = sod(now);
  const ts = sum(salesIn(t0, t0 + DAY), (s) => s.total), ys = sum(salesIn(t0 - DAY, t0), (s) => s.total);
  const delta = ys > 0 ? (ts - ys) / ys * 100 : null;
  const mt = monthTotals(mkey(now)), low = lowItems(), units = sum(S.products, (p) => p.stock);
  const h = new Date().getHours(), greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const tx = txList();
  const rows = tx.slice(0, ui.lim.tx).map((t) => '<tr><td class="strong">' + esc(t.name) + '</td><td>' + t.type + '</td><td>' + when(t.ts) + '</td><td class="num">' + inr(t.amt) + '</td><td><span class="' + (t.st === 'Voided' ? 't-bad' : 't-good') + '">' + t.st + '</span></td></tr>').join('');
  const dtxt = delta == null ? 'No sales yesterday' : (delta >= 0 ? '↑ ' : '↓ ') + Math.abs(delta).toFixed(1) + '% vs. yesterday';

  return head(greet + ', ' + esc((S.shop.owner || 'there').split(' ')[0]), 'Here’s what’s happening at your shop today.', '<button class="btn" data-act="sale">' + ic('plus') + 'Record sale</button>')
    + '<section class="kpis">'
    + kpi('Today’s sales', inrK(ts), dtxt, '₹', delta == null ? '' : delta >= 0 ? 'up' : 'down')
    + kpi('Inventory items', units.toLocaleString('en-IN'), 'Units across ' + S.products.length + ' products', '▢')
    + kpi('Low stock', low.length, low.length ? 'Items need restocking' : 'Everything is stocked', '!', low.length ? '' : 'up', 'warn')
    + kpi('Net this month', inrK(mt.net), 'Sales less purchases and expenses', '₹')
    + '</section>'
    + '<section class="grid-2"><div class="card"><div class="card-head"><div><h2>Sales overview</h2><p class="sub">Daily sales for this week</p></div>'
    + '<div class="legend"><span><i style="background:var(--accent)"></i>This week</span><span><i style="background:var(--chart-prev)"></i>Previous week</span></div></div>' + weekChart() + '</div>'
    + '<div class="card"><div class="card-head"><div><h2>Low stock alerts</h2><p class="sub">Items at or below reorder level</p></div></div>'
    + (low.length
      ? '<div class="alert-list">' + low.slice(0, 5).map((p) => '<div class="alert"><div><b>' + esc(p.name) + '</b><small>Reorder at ' + p.reorder + ' units</small></div>' + (p.stock <= 0 ? '<span class="pill bad">Out</span>' : '<span class="pill warn">' + p.stock + ' left</span>') + '</div>').join('') + '</div>'
        + (low.length > 5 ? '<div class="more"><a class="btn ghost sm" href="#products" data-act="lowfilter">View all ' + low.length + '</a></div>' : '')
      : empty('No items are below their reorder level.'))
    + '</div></section>'
    + '<section class="card"><div class="card-head"><div><h2>Recent transactions</h2><p class="sub">Latest activity recorded in your shop</p></div></div>'
    + (tx.length ? '<div class="tbl-wrap"><table><thead><tr><th>Transaction</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      : empty('No transactions yet. Record your first sale to see it here.', '<button class="btn" data-act="sale">' + ic('plus') + 'Record sale</button>'))
    + '</section>';
}
