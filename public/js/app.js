// STEP 13 - Main file: page routing, drawing the page, and all clicks.
import { api } from './api.js';
import { S, ui, prod, refresh, onRender } from './state.js';
import { esc, inr, MONTHS } from './utils.js';
import { ic } from './icons.js';
import { toast, confirmBox, initModal, closeModal, modalRoot, isModalOpen } from './modal.js';
import * as F from './forms.js';
import { dashboard } from './views/dashboard.js';
import { products, updateProductsTable } from './views/products.js';
import { stock } from './views/stock.js';
import { sales } from './views/sales.js';
import { expenses } from './views/expenses.js';
import { reports } from './views/reports.js';

// To add a page: add it here, create js/views/<name>.js, and add it to VIEWS below.
const ROUTES = [['dashboard', 'Dashboard'], ['products', 'Products'], ['stock', 'Stock'], ['sales', 'Sales'], ['expenses', 'Expenses'], ['reports', 'Reports']];
const VIEWS = { dashboard, products, stock, sales, expenses, reports };

function render() {
  if (!S) return;
  const name = ROUTES.find((x) => x[0] === ui.route)[1];
  const banner = S.sample ? '<div class="banner"><span>You are viewing sample data for a demo shop.</span><button class="btn ghost sm" data-act="fresh">Clear sample data and start fresh</button></div>' : '';
  document.getElementById('view').innerHTML = banner + VIEWS[ui.route]();
  document.getElementById('crumbPage').textContent = name;
  document.getElementById('crumbShop').textContent = S.shop.name;
  document.getElementById('shopName').textContent = S.shop.name;
  document.getElementById('avatar').textContent = (S.shop.owner || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('nav').innerHTML = ROUTES.map((x) => '<a href="#' + x[0] + '"' + (x[0] === ui.route ? ' aria-current="page"' : '') + '>' + ic(x[0]) + x[1] + '</a>').join('');
  if (ui.route === 'products') updateProductsTable();
}

function route() {
  const h = (location.hash || '').replace('#', '');
  ui.route = VIEWS[h] ? h : 'dashboard'; ui.open = null; if (isModalOpen()) closeModal(); render(); window.scrollTo(0, 0);
}

// Calls the server, then redraws. Errors show as a toast.
async function act(fn, msg) { try { await fn(); await refresh(); if (msg) toast(msg); } catch (e) { toast(e.message); } }

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
  switch (a) {
    case 'close': closeModal(); break;
    case 'sale': if (isModalOpen()) closeModal(); F.saleModal(); break;
    case 'stock': F.stockModal(); break;
    case 'addprod': if (isModalOpen()) closeModal(); F.addProd(); break;
    case 'editprod': F.editProd(id); break;
    case 'delprod': { const p = prod(id); confirmBox('Delete product', 'Delete <b>' + esc(p.name) + '</b>? Past sales and stock history keep its name.', 'Delete', () => act(() => api.deleteProduct(id), 'Product deleted')); break; }
    case 'addexp': F.expModal(); break;
    case 'delexp': { const x = S.expenses.find((v) => v.id === id); confirmBox('Delete expense', 'Delete <b>' + esc(x.title) + '</b> (' + inr(x.amount) + ')?', 'Delete', () => act(() => api.deleteExpense(id), 'Expense deleted')); break; }
    case 'toggle': ui.open = ui.open === id ? null : id; render(); break;
    case 'void': { const s = S.sales.find((v) => v.id === id); confirmBox('Void sale', 'Void <b>' + s.id + '</b> (' + inr(s.total) + ')? The items go back into stock.', 'Void sale', () => act(() => api.voidSale(id), 'Sale voided')); break; }
    case 'more': ui.lim[t.getAttribute('data-key')] += 15; render(); break;
    case 'addline': F.addLine(); break;
    case 'rmline': F.removeLine(t); break;
    case 'export': F.exportModal(); break;
    case 'copycsv': F.copyCsv(); break;
    case 'settings': F.settingsModal(); break;
    case 'fresh': confirmBox('Clear sample data', 'This removes the demo products, sales and expenses so you can enter your own.', 'Clear sample data', () => act(() => api.reset('blank'), 'Sample data cleared')); break;
    case 'loadsample': confirmBox('Load sample data', 'This replaces everything with the demo shop.', 'Load sample data', () => act(() => api.reset('sample'), 'Sample data loaded')); break;
    case 'wipe': confirmBox('Erase all data', 'This permanently deletes every product, sale, stock movement and expense.', 'Erase everything', () => act(() => api.reset('blank'), 'All data erased')); break;
    case 'lowfilter': ui.stat = 'low'; ui.q = ''; ui.cat = ''; break;
  }
});
document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('tr.click')) { e.preventDefault(); e.target.click(); } });
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'pq') { ui.q = t.value; updateProductsTable(); }
  else if (t.closest && t.closest('.line')) F.lineChanged(t);
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'pcat') { ui.cat = t.value; updateProductsTable(); }
  else if (t.id === 'pstat') { ui.stat = t.value; updateProductsTable(); }
  else if (t.id === 'rmonth') { ui.rmonth = t.value; render(); }
});
window.addEventListener('hashchange', route);

// ---- start
async function boot() {
  initModal();
  onRender(render);
  const d = new Date();
  document.getElementById('today').textContent = MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  try { await refresh(); }
  catch (e) { document.getElementById('view').innerHTML = '<div class="banner"><span>Could not reach the server. Start it with <b>npm start</b> and open <b>http://localhost:3000</b>.</span></div>'; return; }
  route();
}
boot();
