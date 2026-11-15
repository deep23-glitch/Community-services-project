// STEP 12 - All pop-up forms (add product, record sale, record stock, add expense, export, settings).
// Each form collects the values, sends them to the server through api.js, then refresh() redraws the page.
// If the server says "no" (e.g. not enough stock) the message shows inside the form.
import { api } from './api.js';
import { S, prod, refresh, monthTotals, allMonthKeys } from './state.js';
import { esc, inr, isoToday, mlabel, csvCell } from './utils.js';
import { ic } from './icons.js';
import { openModal, modalRoot, fld, toast } from './modal.js';

// Runs an API call; returns the error text for the form, or undefined on success.
async function run(fn, okMsg) {
  try { await fn(); await refresh(); if (okMsg) toast(okMsg); } catch (e) { return e.message; }
}

/* ---------- products ---------- */
function prodForm(p) {
  p = p || { name: '', cat: '', sku: '', price: '', cost: '', stock: 0, reorder: 5 };
  const cats = {}; S.products.forEach((x) => { cats[x.cat] = 1; });
  return '<datalist id="catlist">' + Object.keys(cats).map((c) => '<option value="' + esc(c) + '">').join('') + '</datalist>'
    + fld('f-name', 'Product name', '<input id="f-name" name="name" required value="' + esc(p.name) + '" placeholder="e.g. Rice · 5 kg">')
    + '<div class="row2">' + fld('f-cat', 'Category', '<input id="f-cat" name="cat" list="catlist" required value="' + esc(p.cat) + '" placeholder="e.g. Grains">')
    + fld('f-sku', 'SKU (optional)', '<input id="f-sku" name="sku" value="' + esc(p.sku) + '" placeholder="Auto-generated">') + '</div>'
    + '<div class="row2">' + fld('f-price', 'Selling price (₹)', '<input id="f-price" name="price" type="number" min="0" step="0.01" required value="' + esc(p.price) + '">')
    + fld('f-cost', 'Cost price (₹)', '<input id="f-cost" name="cost" type="number" min="0" step="0.01" value="' + esc(p.cost) + '">') + '</div>'
    + '<div class="row2">' + fld('f-stock', 'In stock', '<input id="f-stock" name="stock" type="number" min="0" step="1" required value="' + esc(p.stock) + '">')
    + fld('f-re', 'Reorder level', '<input id="f-re" name="reorder" type="number" min="0" step="1" required value="' + esc(p.reorder) + '">') + '</div>';
}
export const addProd = () => openModal({ title: 'Add product', submit: 'Add product', body: prodForm(), onSubmit: (fd) => run(() => api.addProduct(fd), 'Product added') });
export const editProd = (id) => openModal({ title: 'Edit product', submit: 'Save changes', body: prodForm(prod(id)), onSubmit: (fd) => run(() => api.updateProduct(id, fd), 'Product updated') });

function needProducts() {
  if (S.products.length) return false;
  openModal({ title: 'Add a product first', form: false, body: '<p>You need at least one product before recording stock or sales.</p><div class="modal-foot"><button class="btn" data-act="addprod">Add product</button></div>' });
  return true;
}
const prodOptions = () => S.products.map((p) => '<option value="' + p.id + '">' + esc(p.name) + ' (' + p.stock + ' in stock)</option>').join('');

/* ---------- sale (several item rows) ---------- */
const lineHtml = () => '<div class="line"><select name="pid" aria-label="Product">' + prodOptions() + '</select>'
  + '<input name="qty" type="number" min="1" step="1" value="1" aria-label="Quantity"><input name="price" type="number" min="0" step="0.01" aria-label="Unit price">'
  + '<button type="button" class="btn ghost icon" data-act="rmline" aria-label="Remove item">' + ic('x') + '</button></div>';
function fillPrice(line) { const p = prod(line.querySelector('[name=pid]').value); if (p) line.querySelector('[name=price]').value = p.price; }
function saleTotal() {
  let t = 0;
  modalRoot().querySelectorAll('.line').forEach((l) => { t += (parseFloat(l.querySelector('[name=qty]').value) || 0) * (parseFloat(l.querySelector('[name=price]').value) || 0); });
  const el = document.getElementById('stotal'); if (el) el.textContent = inr(t);
}
export function addLine() { const ls = document.getElementById('lines'); ls.insertAdjacentHTML('beforeend', lineHtml()); fillPrice(ls.lastElementChild); saleTotal(); }
export function removeLine(btn) { if (modalRoot().querySelectorAll('.line').length > 1) { btn.closest('.line').remove(); saleTotal(); } }
export function lineChanged(target) { const line = target.closest('.line'); if (target.name === 'pid') fillPrice(line); saleTotal(); }

export function saleModal() {
  if (needProducts()) return;
  openModal({
    title: 'Record sale', submit: 'Save sale',
    body: '<div id="lines" class="form">' + lineHtml() + '</div><div><button type="button" class="btn ghost sm" data-act="addline">' + ic('plus') + 'Add another item</button></div>'
      + fld('f-pay', 'Payment', '<select id="f-pay" name="payment"><option>Cash</option><option>UPI</option><option>Card</option></select>')
      + '<div class="total-row"><span>Total</span><span class="num" id="stotal">₹ 0</span></div>',
    after: () => { fillPrice(modalRoot().querySelector('.line')); saleTotal(); },
    onSubmit: (fd, form) => {
      const items = Array.from(form.querySelectorAll('.line')).map((l) => ({
        pid: l.querySelector('[name=pid]').value, qty: l.querySelector('[name=qty]').value, price: l.querySelector('[name=price]').value }));
      return run(() => api.addSale({ items, payment: fd.payment }), 'Sale recorded');
    },
  });
}

/* ---------- stock in / out ---------- */
export function stockModal() {
  if (needProducts()) return;
  openModal({
    title: 'Record stock', submit: 'Save movement',
    body: '<div class="seg" role="radiogroup" aria-label="Movement type"><label><input type="radio" name="type" value="in" checked>Stock in</label><label><input type="radio" name="type" value="out">Stock out</label></div>'
      + fld('f-p', 'Product', '<select id="f-p" name="pid">' + prodOptions() + '</select>')
      + '<div class="row2">' + fld('f-q', 'Quantity', '<input id="f-q" name="qty" type="number" min="1" step="1" required value="1">')
      + fld('f-c', 'Total purchase cost (₹, optional)', '<input id="f-c" name="cost" type="number" min="0" step="0.01" placeholder="Stock in only">') + '</div>'
      + fld('f-n', 'Note (optional)', '<input id="f-n" name="note" placeholder="Supplier, damage, own use…">'),
    onSubmit: (fd) => run(() => api.addStock(fd), fd.type === 'in' ? 'Stock received' : 'Stock issued'),
  });
}

/* ---------- expense ---------- */
export function expModal() {
  openModal({
    title: 'Add expense', submit: 'Save expense',
    body: fld('f-t', 'Expense', '<input id="f-t" name="title" required placeholder="e.g. Electricity bill">')
      + '<div class="row2">' + fld('f-ec', 'Category', '<input id="f-ec" name="cat" list="ecats" required placeholder="e.g. Utilities"><datalist id="ecats"><option>Rent</option><option>Utilities</option><option>Supplies</option><option>Transport</option><option>Maintenance</option><option>Salaries</option></datalist>')
      + fld('f-am', 'Amount (₹)', '<input id="f-am" name="amount" type="number" min="0.01" step="0.01" required>') + '</div>'
      + '<div class="row2">' + fld('f-d', 'Date', '<input id="f-d" name="date" type="date" required value="' + isoToday() + '" max="' + isoToday() + '">')
      + fld('f-m', 'Payment method', '<select id="f-m" name="method"><option>Cash</option><option>UPI</option><option>Bank transfer</option><option>Card</option></select>') + '</div>',
    onSubmit: (fd) => run(() => api.addExpense(fd), 'Expense added'),
  });
}

/* ---------- export (CSV text to copy) ---------- */
export function exportModal() {
  const lines = ['Period,Sales,Purchases,Expenses,Net'];
  allMonthKeys().slice(0, 12).forEach((k) => { const t = monthTotals(k); lines.push([csvCell(mlabel(k)), Math.round(t.sales), Math.round(t.purch), Math.round(t.exp), Math.round(t.net)].join(',')); });
  openModal({ title: 'Export summary', form: false,
    body: '<p class="foot">Copy this CSV into Excel or Google Sheets.</p><textarea class="csv" id="csvtext" readonly aria-label="Summary as CSV">' + esc(lines.join('\n')) + '</textarea>'
      + '<div class="modal-foot"><button class="btn ghost" data-act="close">Close</button><button class="btn" data-act="copycsv">Copy CSV</button></div>' });
}
export function copyCsv() {
  const ta = document.getElementById('csvtext'); ta.select();
  const done = () => toast('Copied to clipboard');
  if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(done, () => { document.execCommand('copy'); done(); });
  else { document.execCommand('copy'); done(); }
}

/* ---------- settings ---------- */
export function settingsModal() {
  openModal({
    title: 'Shop settings', submit: 'Save',
    body: fld('f-sn', 'Shop name', '<input id="f-sn" name="shop" required value="' + esc(S.shop.name) + '">')
      + fld('f-on', 'Owner name', '<input id="f-on" name="owner" required value="' + esc(S.shop.owner) + '">')
      + '<div class="foot">Data is saved on the server in data/db.json. Use the options below to reload the demo shop or erase everything.</div>'
      + '<div class="actions"><button type="button" class="btn ghost sm" data-act="loadsample">Load sample data</button><button type="button" class="btn ghost sm" data-act="wipe">Erase all data</button></div>',
    onSubmit: (fd) => run(() => api.saveSettings(fd), 'Settings saved'),
  });
}
