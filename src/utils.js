// Small helpers shared by the server files.
export const DAY = 864e5;
export const HOUR = 36e5;
export const pad = (n, w = 4) => String(n).padStart(w, '0');
export const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
export const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const bad = (res, msg) => res.status(400).json({ error: msg });
export const isoToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
