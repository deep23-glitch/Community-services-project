// STEP 4c - Sales: POST /api/sales (record), POST /api/sales/:id/void
import { Router } from 'express';
import { getState, commit } from '../db.js';
import { bad, pad, sum } from '../utils.js';

const r = Router();

r.post('/', (req, res) => {
  const S = getState();
  const { items, payment } = req.body || {};
  if (!Array.isArray(items) || !items.length) return bad(res, 'Add at least one item.');
  if (!['Cash', 'UPI', 'Card'].includes(payment)) return bad(res, 'Choose a payment type.');

  const need = {}, lines = [];
  for (const it of items) {
    const p = S.products.find((x) => x.id === it.pid);
    const qty = parseInt(it.qty, 10), price = Number(it.price);
    if (!p) return bad(res, 'Choose a product for every row.');
    if (!(qty > 0)) return bad(res, `Enter a quantity of 1 or more for ${p.name}.`);
    if (!(price >= 0)) return bad(res, `Enter a price for ${p.name}.`);
    need[p.id] = (need[p.id] || 0) + qty;
    if (need[p.id] > p.stock) return bad(res, `Only ${p.stock} of ${p.name} in stock.`);
    lines.push({ pid: p.id, name: p.name, qty, price });
  }

  const ts = Date.now(), id = 'SL-' + pad(S.seq.sale++);
  const sale = { id, ts, items: lines, payment, total: sum(lines, (x) => x.qty * x.price), void: false };
  S.sales.push(sale);

  // reduce stock + log a stock-out movement for each line
  for (const l of lines) {
    const p = S.products.find((x) => x.id === l.pid);
    p.stock -= l.qty;
    S.moves.push({ id: 'm' + S.seq.mv++, ts, pid: p.id, name: p.name, type: 'out', qty: l.qty, by: S.shop.owner, note: 'Sale ' + id });
  }
  commit();
  res.status(201).json(sale);
});

r.post('/:id/void', (req, res) => {
  const S = getState();
  const sale = S.sales.find((x) => x.id === req.params.id);
  if (!sale) return res.status(404).json({ error: 'Sale not found.' });
  if (sale.void) return bad(res, 'This sale is already voided.');
  sale.void = true;
  for (const it of sale.items) {                         // put the items back into stock
    const p = S.products.find((x) => x.id === it.pid);
    if (!p) continue;
    p.stock += it.qty;
    S.moves.push({ id: 'm' + S.seq.mv++, ts: Date.now(), pid: p.id, name: p.name, type: 'in', qty: it.qty, by: S.shop.owner, note: 'Void ' + sale.id });
  }
  commit();
  res.json(sale);
});

export default r;
