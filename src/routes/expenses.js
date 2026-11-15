// STEP 4e - Expenses: POST /api/expenses, DELETE /api/expenses/:id
import { Router } from 'express';
import { getState, commit } from '../db.js';
import { bad, isoToday } from '../utils.js';

const r = Router();

r.post('/', (req, res) => {
  const S = getState();
  const b = req.body || {};
  const title = String(b.title || '').trim(), cat = String(b.cat || '').trim(), amount = parseFloat(b.amount);
  if (!title) return bad(res, 'Enter what the expense was for.');
  if (!cat) return bad(res, 'Enter a category.');
  if (!(amount > 0)) return bad(res, 'Enter an amount above 0.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) return bad(res, 'Choose a date.');
  if (b.date > isoToday()) return bad(res, 'The date cannot be in the future.');
  const ts = b.date === isoToday() ? Date.now() : new Date(b.date + 'T12:00:00').getTime();
  const e = { id: 'e' + S.seq.exp++, ts, title, cat, amount, method: String(b.method || 'Cash') };
  S.expenses.push(e);
  commit();
  res.status(201).json(e);
});

r.delete('/:id', (req, res) => {
  const S = getState();
  const before = S.expenses.length;
  S.expenses = S.expenses.filter((x) => x.id !== req.params.id);
  if (S.expenses.length === before) return res.status(404).json({ error: 'Expense not found.' });
  commit();
  res.json({ ok: true });
});

export default r;
