// STEP 11c - Products page (search + filters update only the table, so typing keeps focus).
import { S, ui, status } from '../state.js';
import { esc, inr } from '../utils.js';
import { ic } from '../icons.js';
import { head, empty } from './shared.js';

const pill = (p) => { const s = status(p); return s === 'out' ? '<span class="pill bad">Out of stock</span>' : s === 'low' ? '<span class="pill warn">Low stock</span>' : '<span class="pill good">In stock</span>'; };

function filtered() {
  const q = ui.q.trim().toLowerCase();
  return S.products.filter((p) => {
    if (q && (p.name + ' ' + p.sku + ' ' + p.cat).toLowerCase().indexOf(q) < 0) return false;
    if (ui.cat && p.cat !== ui.cat) return false;
    if (ui.stat === 'low' && status(p) === 'ok') return false;
    if (ui.stat === 'ok' && status(p) !== 'ok') return false;
    return true;
  });
}
function rows() {
  const list = filtered();
  if (!S.products.length) return empty('No products yet. Add your first product to start tracking stock.', '<button class="btn" data-act="addprod">' + ic('plus') + 'Add product</button>');
  if (!list.length) return empty('No products match your filters.');
  return '<div class="tbl-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>SKU</th><th class="r">Price</th><th class="r">In stock</th><th>Status</th><th class="r">Actions</th></tr></thead><tbody>'
    + list.map((p) => '<tr><td class="strong">' + esc(p.name) + '</td><td>' + esc(p.cat) + '</td><td class="num">' + esc(p.sku) + '</td><td class="r num">' + inr(p.price) + '</td><td class="r num">' + p.stock + '</td><td>' + pill(p) + '</td>'
      + '<td class="r"><button class="btn ghost icon" data-act="editprod" data-id="' + p.id + '" aria-label="Edit ' + esc(p.name) + '">' + ic('edit') + '</button> '
      + '<button class="btn ghost icon" data-act="delprod" data-id="' + p.id + '" aria-label="Delete ' + esc(p.name) + '">' + ic('trash') + '</button></td></tr>').join('')
    + '</tbody></table></div>';
}
export function updateProductsTable() {
  const t = document.getElementById('ptable'); if (t) t.innerHTML = rows();
  const c = document.getElementById('pcount');
  if (c) { const n = filtered().length; c.textContent = S.products.length + ' products' + (n !== S.products.length ? ' · ' + n + ' shown' : ''); }
}

export function products() {
  const cats = {}; S.products.forEach((p) => { cats[p.cat] = 1; });
  const opts = '<option value="">All categories</option>' + Object.keys(cats).sort().map((c) => '<option' + (ui.cat === c ? ' selected' : '') + ' value="' + esc(c) + '">' + esc(c) + '</option>').join('');
  return head('Products', 'Keep product names, prices and stock levels organized.', '<button class="btn" data-act="addprod">' + ic('plus') + 'Add product</button>')
    + '<section class="card"><div class="card-head"><div><h2>Product list</h2><p class="sub" id="pcount"></p></div></div>'
    + '<div class="toolbar"><div class="field-search">' + ic('search') + '<input type="search" id="pq" placeholder="Search by name, SKU or category" value="' + esc(ui.q) + '" aria-label="Search products"></div>'
    + '<select id="pcat" aria-label="Category">' + opts + '</select>'
    + '<select id="pstat" aria-label="Stock status"><option value="">All stock levels</option><option value="low"' + (ui.stat === 'low' ? ' selected' : '') + '>Low or out of stock</option><option value="ok"' + (ui.stat === 'ok' ? ' selected' : '') + '>In stock</option></select></div>'
    + '<div id="ptable">' + rows() + '</div></section>';
}
