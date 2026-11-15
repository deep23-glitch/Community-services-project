// STEP 4b - Products: POST /api/products, PUT /api/products/:id, DELETE /api/products/:id
import { Router } from 'express';
import { getState, commit } from '../db.js';
import { bad, pad } from '../utils.js';

const r = Router();

// Validate the form data. Returns { error } or { value }.
function clean(body, S, existingId) {
  const name = String(body.name || '').trim();
  const cat = String(body.cat || '').trim();
  const price = parseFloat(body.price), stock = parseInt(body.stock, 10), reorder = parseInt(body.reorder, 10);
  const cost = parseFloat(body.cost) || 0;
  if (!name) return { error: 'Enter a product name.' };
  if (!cat) return { error: 'Enter a category.' };
  if (isNaN(price) || price < 0) return { error: 'Enter a selling price of 0 or more.' };
  if (isNaN(stock) || stock < 0) return { error: 'Stock must be 0 or more.' };
  if (isNaN(reorder) || reorder < 0) return { error: 'Enter a reorder level of 0 or more.' };
  const dup = S.products.find((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== existingId);
  if (dup) return { error: `A product named "${dup.name}" already exists.` };
  const sku = String(body.sku || '').trim() || `${cat.slice(0, 2).toUpperCase()}-${pad(S.seq.prod, 3)}`;
  return { value: { name, cat, sku, price, cost, stock, reorder } };
}

r.post('/', (req, res) => {
  const S = getState();
  const { error, value } = clean(req.body || {}, S);
  if (error) return bad(res, error);
  const product = { id: 'p' + S.seq.prod++, ...value };
  S.products.push(product);
  commit();
  res.status(201).json(product);
});

r.put('/:id', (req, res) => {
  const S = getState();
  const p = S.products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found.' });
  const { error, value } = clean(req.body || {}, S, p.id);
  if (error) return bad(res, error);
  Object.assign(p, value);
  commit();
  res.json(p);
});

r.delete('/:id', (req, res) => {
  const S = getState();
  const before = S.products.length;
  S.products = S.products.filter((x) => x.id !== req.params.id);   // old sales keep the product name
  if (S.products.length === before) return res.status(404).json({ error: 'Product not found.' });
  commit();
  res.json({ ok: true });
});

export default r;
