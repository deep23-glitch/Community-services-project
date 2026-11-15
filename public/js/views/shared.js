// STEP 11a - Small HTML pieces reused by every page.
import { ui } from '../state.js';

// Summary tile: label, big value, small text, tile symbol, optional "up"/"down" colour, optional "warn" tile style
export const kpi = (label, val, sub, tile, cls, tcls) =>
  '<div class="kpi"><div class="top"><span>' + label + '</span><span class="tile ' + (tcls || '') + '">' + tile + '</span></div>'
  + '<div class="val num">' + val + '</div><div class="sub ' + (cls || '') + '">' + sub + '</div></div>';

// Page title row with action buttons on the right
export const head = (title, sub, actions) =>
  '<div class="page-head"><div><h1>' + title + '</h1><p>' + sub + '</p></div><div class="actions">' + actions + '</div></div>';

export const empty = (msg, btn) => '<div class="empty"><span>' + msg + '</span>' + (btn || '') + '</div>';

// "Show more" button for long tables (key = which table, see ui.lim in state.js)
export const more = (key, total) => ui.lim[key] < total
  ? '<div class="more"><button class="btn ghost sm" data-act="more" data-key="' + key + '">Show more (' + (total - ui.lim[key]) + ' left)</button></div>' : '';
