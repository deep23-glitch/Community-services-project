// STEP 7a - Formatting helpers (money in rupees, dates like "Today, 11:42 AM", escaping HTML).
export const DAY = 864e5;
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const sod = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const pad = (n, w = 4) => String(n).padStart(w, '0');
export const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);

// ₹ 1,26,400 (Indian digit grouping)
export function inr(n) { const neg = n < 0; n = Math.abs(Math.round(n)); return (neg ? '−' : '') + '₹ ' + n.toLocaleString('en-IN'); }
// ₹ 1.26L for lakhs, used on the summary tiles
export function inrK(n) {
  const a = Math.abs(n);
  if (a >= 100000) return (n < 0 ? '−' : '') + '₹ ' + (a / 100000).toFixed(2).replace(/\.?0+$/, '') + 'L';
  return inr(n);
}
export const timeStr = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
export function dayLabel(ts) {
  const diff = Math.round((sod(Date.now()) - sod(ts)) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  const d = new Date(ts);
  return MONTHS[d.getMonth()] + ' ' + d.getDate() + (d.getFullYear() !== new Date().getFullYear() ? ', ' + d.getFullYear() : '');
}
export const when = (ts) => dayLabel(ts) + ', ' + timeStr(ts);
export function dateOnly(ts) {
  const diff = Math.round((sod(Date.now()) - sod(ts)) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  const d = new Date(ts);
  return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}
export const mkey = (ts) => { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
export const mlabel = (k) => { const p = k.split('-'); return MONTHS_LONG[+p[1] - 1] + ' ' + p[0]; };
export const isoToday = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
export const csvCell = (v) => { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
