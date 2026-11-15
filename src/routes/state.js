// STEP 4a - Read everything / reset the data.
import { Router } from 'express';
import { getState, setState } from '../db.js';
import { makeSeed, makeBlank } from '../seed.js';
import { bad } from '../utils.js';

const r = Router();

// The website loads the whole shop in one request, then calculates the dashboard/reports itself.
r.get('/state', (req, res) => res.json(getState()));

// mode: "sample" = reload the demo shop, "blank" = erase everything (shop name is kept)
r.post('/admin/reset', (req, res) => {
  const mode = (req.body || {}).mode;
  const shop = getState().shop;
  if (mode === 'sample') setState(makeSeed(shop));
  else if (mode === 'blank') setState(makeBlank(shop));
  else return bad(res, 'mode must be "sample" or "blank".');
  res.json(getState());
});

export default r;
