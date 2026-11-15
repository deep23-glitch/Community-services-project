// STEP 10 - Pop-up windows (modals), confirm boxes and toast messages.
import { esc } from './utils.js';
import { ic } from './icons.js';

const el = () => document.getElementById('modal');
let current = null, lastFocus = null;

export function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// opts: { title, body (html), submit, danger, form:false, after(), onSubmit(data, form) -> error text | undefined }
export function openModal(opts) {
  lastFocus = document.activeElement; current = opts;
  el().innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">'
    + '<div class="modal-head"><h2 id="mt">' + esc(opts.title) + '</h2><button class="btn ghost icon" data-act="close" aria-label="Close">' + ic('x') + '</button></div>'
    + (opts.form === false ? '<div class="form">' + opts.body + '</div>'
      : '<form class="form" id="mform" novalidate>' + opts.body + '<div class="err" id="merr" role="alert"></div>'
        + '<div class="modal-foot"><button type="button" class="btn ghost" data-act="close">Cancel</button>'
        + '<button type="submit" class="btn' + (opts.danger ? ' danger' : '') + '">' + esc(opts.submit || 'Save') + '</button></div></form>')
    + '</div>';
  el().hidden = false;
  if (opts.after) opts.after();
  const f = el().querySelector('input:not([type=radio]),select,textarea,button.btn'); if (f) f.focus();
}
export function closeModal() {
  el().hidden = true; el().innerHTML = ''; current = null;
  if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
}
export const isModalOpen = () => !el().hidden;
export const modalRoot = () => el();

export function confirmBox(title, msgHtml, btn, fn) {
  openModal({ title, body: '<p>' + msgHtml + '</p>', submit: btn, danger: true,
    onSubmit: async () => { try { await fn(); } catch (e) { return e.message; } } });
}
export const fld = (id, label, inner) => '<label class="f" for="' + id + '">' + label + inner + '</label>';

export function initModal() {
  el().addEventListener('mousedown', (e) => { if (e.target === el()) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isModalOpen()) closeModal(); });
  el().addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!current || !current.onSubmit) return;
    const form = e.target, data = {};
    Array.from(form.elements).forEach((x) => {
      if (!x.name) return;
      if (x.type === 'radio') { if (x.checked) data[x.name] = x.value; } else data[x.name] = x.value;
    });
    const err = await current.onSubmit(data, form);
    if (err) { const m = document.getElementById('merr'); if (m) m.textContent = err; } else closeModal();
  });
}
