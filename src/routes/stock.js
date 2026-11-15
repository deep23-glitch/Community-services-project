// STEP 4d - Manual stock movements: POST /api/stock  { pid, type: "in"|"out", qty, cost?, note? }
import { Router } from 'express';
import { getState, commit } from '../db.js';
import { bad, pad } from '../utils.js';

const r = Router();

r.post('/', (req, res) => {
  const S = getState();
  const { pid, type, note } = req.body || {};
  const qty = parseInt(req.body.qty, 10), cost = parseFloat(req.body.cost);
  const p = S.products.find((x) => x.id === pid);
  if (!p) return bad(res, 'Choose a product.');
  if (!['in', 'out'].includes(type)) return bad(res, 'Choose stock in or stock out.');
  if (!(qty > 0)) return bad(res, 'Enter a quantity of 1 or more.');
  if (type === 'out' && qty > p.stock) return bad(res, `Only ${p.stock} of ${p.name} in stock.`);

  const m = { id: 'm' + S.seq.mv++, ts: Date.now(), pid: p.id, name: p.name, type, qty, by: S.shop.owner, note: String(note || '').trim() };
  if (type === 'in' && cost > 0) { m.cost = cost; m.ref = 'PU-' + pad(S.seq.pu++); }   // a purchase
  p.stock += type === 'in' ? qty : -qty;
  S.moves.push(m);
  commit();
  res.status(201).json(m);
});

export default r;
