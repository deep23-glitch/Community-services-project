// STEP 4f - Shop settings: PUT /api/settings  { shop, owner }
import { Router } from 'express';
import { getState, commit } from '../db.js';
import { bad } from '../utils.js';

const r = Router();

r.put('/', (req, res) => {
  const S = getState();
  const shop = String((req.body || {}).shop || '').trim(), owner = String((req.body || {}).owner || '').trim();
  if (!shop || !owner) return bad(res, 'Shop and owner names cannot be empty.');
  S.shop = { name: shop, owner };
  commit();
  res.json(S.shop);
});

export default r;
