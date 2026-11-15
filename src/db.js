// STEP 2 - Storage. The whole shop lives in one JSON file: data/db.json.
// To move to a real database later (SQLite, MongoDB...), replace only this file and the routes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeSeed } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '..', 'data', 'db.json');
let state = null;

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    const fresh = makeSeed();          // first run: create the demo shop
    writeFile(fresh);
    return fresh;
  }
}
function writeFile(s) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(s));   // write to a temp file first,
  fs.renameSync(tmp, FILE);                   // then swap, so a crash can't corrupt the data
}

export function getState() { if (!state) state = read(); return state; }
export function setState(s) { state = s; writeFile(state); }
export function commit() { writeFile(getState()); }   // call after changing the state
