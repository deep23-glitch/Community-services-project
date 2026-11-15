// STEP 3 - Demo data. Generates a sample shop (products, ~2 months of sales, purchases, expenses).
// Change the product list below to match your own shop, or choose "Clear sample data" in the app.
import { DAY, HOUR, pad, sum, startOfDay } from './utils.js';

function mulberry(a) {   // small seeded random generator so the demo is repeatable
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// name, category, SKU, selling price, cost price, stock, reorder level
const PRODUCTS = [
  ['Basmati Rice · 5 kg', 'Grains', 'GR-001', 540, 470, 4, 10],
  ['Sunflower Oil · 1 L', 'Cooking', 'CK-014', 145, 125, 7, 12],
  ['Sugar · 1 kg', 'Essentials', 'ES-008', 48, 41, 32, 15],
  ['Tea · 250 g', 'Beverages', 'BV-003', 120, 98, 2, 6],
  ['Toor Dal · 1 kg', 'Pulses', 'PL-005', 138, 115, 3, 8],
  ['Wheat Flour · 5 kg', 'Grains', 'GR-013', 265, 232, 21, 10],
  ['Bath Soap · 100 g', 'Personal care', 'PC-021', 38, 30, 17, 10],
  ['Milk · 500 ml', 'Dairy', 'DA-009', 32, 28, 14, 10],
  ['Salt · 1 kg', 'Essentials', 'ES-002', 24, 19, 40, 15],
  ['Biscuits · 200 g', 'Snacks', 'SN-004', 30, 24, 26, 12],
  ['Detergent · 1 kg', 'Household', 'HH-011', 110, 90, 12, 6],
  ['Eggs · 12 pcs', 'Dairy', 'DA-015', 84, 72, 8, 6],
  ['Ghee · 500 ml', 'Cooking', 'CK-020', 320, 280, 6, 4],
];
const WEIGHTS = [1, 3, 5, 2, 3, 2, 4, 6, 3, 5, 2, 3, 1];   // how often each product sells

export function makeBlank(shop = { name: 'My Shop', owner: 'Owner' }) {
  return { v: 1, sample: false, shop, products: [], sales: [], moves: [], expenses: [],
    seq: { sale: 101, pu: 101, prod: 1, exp: 1, mv: 1 } };
}

export function makeSeed(shop = { name: 'Green Corner Store', owner: 'Deep Saha' }) {
  const now = Date.now(), t0 = startOfDay(now), R = mulberry(20261101);
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const owner = shop.owner;

  const P = PRODUCTS.map((r, i) => ({ id: 'p' + (i + 1), name: r[0], cat: r[1], sku: r[2], price: r[3], cost: r[4], stock: r[5], reorder: r[6] }));
  const wsum = sum(WEIGHTS, (x) => x);
  const pick = () => { let x = R() * wsum, i = 0; while (x >= WEIGHTS[i]) { x -= WEIGHTS[i]; i++; } return P[i]; };

  // --- sales: from the 1st of two months ago until now
  const n0 = new Date(now);
  const startD = Math.round((t0 - new Date(n0.getFullYear(), n0.getMonth() - 2, 1).getTime()) / DAY);
  const sales = [];
  for (let d = startD; d >= 0; d--) {
    let n = d === 0 ? 3 + ri(0, 3) : 7 + ri(0, 4);
    const dow = new Date(t0 - d * DAY).getDay(); if (dow === 0 || dow === 6) n += 2;
    for (let k = 0; k < n; k++) {
      const ts = d === 0 ? t0 + R() * Math.max(now - t0, 60000) : t0 - d * DAY + (8 + R() * 13) * HOUR;
      const seen = {}, items = [];
      for (let j = 0, cnt = ri(1, 4); j < cnt; j++) {
        const p = pick(); if (seen[p.id]) continue; seen[p.id] = 1;
        items.push({ pid: p.id, name: p.name, qty: R() < .12 ? ri(4, 5) : ri(1, 3), price: p.price });
      }
      const payment = R() < .45 ? 'UPI' : (R() < .9 ? 'Cash' : 'Card');
      sales.push({ ts, items, payment, total: sum(items, (x) => x.qty * x.price), void: false });
    }
  }
  sales.sort((a, b) => a.ts - b.ts);
  sales.forEach((s, i) => { s.id = 'SL-' + pad(101 + i); });

  // --- stock movements (purchases = stock-in with a cost)
  const moves = []; let mv = 0, pu = 100;
  for (let dd = startD - 1; dd >= 2; dd -= 4) {
    for (let q = 0; q < 2; q++) {
      const pp = P[ri(0, P.length - 1)], qty = ri(30, 80); pu++; mv++;
      moves.push({ id: 'm' + mv, ts: t0 - (dd - q) * DAY + 10 * HOUR, pid: pp.id, name: pp.name, type: 'in', qty, cost: qty * pp.cost, ref: 'PU-' + pad(pu), by: owner, note: '' });
    }
  }
  const recent = (minAgo) => Math.max(t0 + 60000, now - minAgo * 60000);
  const add = (ts, pi, type, qty, cost, note) => {
    const p = P[pi]; mv++;
    const m = { id: 'm' + mv, ts, pid: p.id, name: p.name, type, qty, by: owner, note: note || '' };
    if (cost) { pu++; m.cost = cost; m.ref = 'PU-' + pad(pu); }
    moves.push(m);
  };
  add(recent(60), 0, 'in', 20, 4800);
  add(recent(120), 1, 'out', 3, 0, 'Sold loose');
  add(t0 - DAY + 15 * HOUR + 10 * 60000, 2, 'in', 15, 0);
  add(t0 - DAY + 13 * HOUR + 26 * 60000, 3, 'out', 2, 0, 'Damaged pack');
  add(t0 - 2 * DAY + 14 * HOUR + 45 * 60000, 4, 'in', 10, 0);
  add(t0 - 3 * DAY + 13 * HOUR + 20 * 60000, 5, 'out', 4, 0, 'Used in shop');

  // --- expenses: title, category, amount, payment method, day of month
  const tpl = [['Shop rent', 'Rent', 8000, 'Bank transfer', 2], ['Electricity bill', 'Utilities', 2100, 'UPI', 9],
    ['Mobile recharge', 'Utilities', 499, 'UPI', 12], ['Packaging supplies', 'Supplies', 1250, 'Cash', 16],
    ['Cleaning supplies', 'Supplies', 560, 'Cash', 20], ['Delivery transport', 'Transport', 850, 'Cash', 24],
    ['Shelf repair', 'Maintenance', 1500, 'Cash', 26]];
  const expenses = []; let en = 0;
  for (let mo = 0; mo < 3; mo++) {
    const base = new Date(n0.getFullYear(), n0.getMonth() - mo, 1);
    tpl.forEach((t) => {
      const dt = new Date(base.getFullYear(), base.getMonth(), t[4], 12); if (dt.getTime() > now) return;
      en++; expenses.push({ id: 'e' + en, ts: dt.getTime(), title: t[0], cat: t[1], amount: t[2] + (mo ? ri(-120, 160) : 0), method: t[3] });
    });
  }
  en++; expenses.push({ id: 'e' + en, ts: t0 - DAY + 16.5 * HOUR, title: 'Electricity bill', cat: 'Utilities', amount: 2100, method: 'UPI' });
  expenses.sort((a, b) => a.ts - b.ts);

  return { v: 1, sample: true, shop, products: P, sales, moves, expenses,
    seq: { sale: 101 + sales.length, pu: pu + 1, prod: P.length + 1, exp: en + 1, mv: mv + 1 } };
}
