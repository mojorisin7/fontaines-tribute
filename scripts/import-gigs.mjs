// Replace src/data/gigs.json with the gigs in the band's Google Sheet (or a CSV file).
//
//   npm run import-gigs                 reads the sheet at GIGS_SHEET_URL (set in .env)
//   npm run import-gigs -- gigs.csv     reads a CSV file instead (File > Download > CSV, or Excel saved as CSV)
//   add --dry-run to see the changes without saving
//
// Sheet columns (header row, any order): Date, Venue, City, Postcode, Ticket link, Status, Country, Notes.
// Date, Venue, Postcode and Status columns are required. Status is On sale (or blank), Sold out or Cancelled.
// Gigs outside the UK: fill in Country and City and leave Postcode blank; the map position comes
// from OpenStreetMap (venue + city, or just the city if the venue isn't found).
// Every row is checked first; if any row has a problem nothing is saved and each problem is listed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { lookupPostcodes, normalisePostcode } from './lib/postcodes.mjs';
import { isUk, lookupPlace } from './lib/places.mjs';

const GIGS = new URL('../src/data/gigs.json', import.meta.url);

// Settings (GIGS_SHEET_URL) live in .env, which is optional.
try {
  process.loadEnvFile(new URL('../.env', import.meta.url));
} catch {}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const source = args.find((a) => a !== '--dry-run') || process.env.GIGS_SHEET_URL;

const fail = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};

if (!source) {
  fail('no sheet to read. Set GIGS_SHEET_URL in .env, or pass a CSV file:\n  npm run import-gigs -- ~/Downloads/gigs.csv');
}

// ---- Read the sheet ---------------------------------------------------------------

// Turn a normal Google Sheets link into its CSV download link.
const csvUrl = (url) => {
  const id = url.match(/\/spreadsheets\/d\/([\w-]+)/)?.[1];
  if (!id) return url;
  const gid = url.match(/[#&?]gid=(\d+)/)?.[1];
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
};

let text;
if (/^https?:\/\//.test(source)) {
  const res = await fetch(csvUrl(source), { redirect: 'follow' });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || type.includes('text/html')) {
    fail(
      "couldn't download the sheet. In Google Sheets, click Share and set General access to\n" +
        '"Anyone with the link" (Viewer), or download it with File > Download > CSV and run:\n' +
        '  npm run import-gigs -- ~/Downloads/<file>.csv',
    );
  }
  text = await res.text();
} else {
  if (!existsSync(source)) fail(`file "${source}" not found.`);
  text = readFileSync(source, 'utf8');
}

// Minimal CSV parser: quoted fields, doubled quotes, commas and newlines inside quotes.
function parseCsv(input) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quoted) {
      if (c === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && input[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const [header, ...body] = parseCsv(text.replace(/^﻿/, ''));
if (!header) fail('the sheet is empty.');

// Match columns by their header text, so the band can reorder or add columns.
const col = (...names) => header.findIndex((h) => names.some((n) => h.trim().toLowerCase().startsWith(n)));
const C = {
  date: col('date'),
  venue: col('venue'),
  city: col('city', 'town'),
  postcode: col('postcode', 'post code'),
  tickets: col('ticket'),
  status: col('status'),
  country: col('country'),
};
// Status is required too: without it every gig would quietly become "On sale".
for (const key of ['date', 'venue', 'postcode', 'status']) {
  if (C[key] < 0) {
    fail(`the sheet needs a "${key[0].toUpperCase() + key.slice(1)}" column. Check row 1 has these headers:\n  ${['Date', 'Venue', 'City', 'Postcode', 'Ticket link', 'Status', 'Country'].join(', ')}\n  Row 1 currently reads: ${header.join(', ')}`);
  }
}

// ---- Check every row ----------------------------------------------------------------

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Accepts 2026-12-05, 5/12/2026 or 5/12/26 (UK day/month order), and 5 Dec 2026.
function parseDate(raw) {
  const s = raw.trim();
  let y, m, d;
  let match;
  if ((match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) [, y, m, d] = match.map(Number);
  else if ((match = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/))) {
    [, d, m, y] = match.map(Number);
    if (y < 100) y += 2000;
  } else if ((match = s.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\.?\s+(\d{4})$/i))) {
    d = Number(match[1]);
    m = MONTHS.indexOf(match[2].slice(0, 3).toLowerCase()) + 1;
    y = Number(match[3]);
  } else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (!m || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

const STATUS = { '': 'live', 'on sale': 'live', live: 'live', 'sold out': 'sold-out', 'sold-out': 'sold-out', cancelled: 'cancelled', canceled: 'cancelled' };

const problems = [];
const rows = [];
body.forEach((cells, i) => {
  const rowNo = i + 2; // sheet row number (header is row 1)
  const get = (k) => (C[k] >= 0 ? (cells[C[k]] ?? '').trim() : '');
  if (cells.every((c) => !c.trim())) return; // blank row

  const issues = [];
  const date = parseDate(get('date'));
  if (!get('date')) issues.push('no date');
  else if (!date) issues.push(`date "${get('date')}" not understood (use 5/12/2026 or 2026-12-05)`);
  if (!get('venue')) issues.push('no venue');
  // Gigs abroad have no UK postcode; their map position comes from venue + city instead.
  const abroad = !isUk(get('country'));
  if (abroad && !get('city')) issues.push('no city (needed for gigs outside the UK)');
  if (!abroad && !get('postcode')) issues.push('no postcode');
  const status = STATUS[get('status').toLowerCase()];
  if (!status) issues.push(`status "${get('status')}" should be On sale, Sold out or Cancelled`);
  const tickets = get('tickets');
  if (tickets && !/^https?:\/\//.test(tickets)) issues.push(`ticket link "${tickets}" should start with https://`);

  if (issues.length) problems.push(`Row ${rowNo}: ${issues.join('; ')}`);
  rows.push({ rowNo, date, venue: get('venue'), city: get('city'), postcode: get('postcode'), tickets, status, country: get('country'), abroad });
});

// Postcodes: reuse positions already in gigs.json, look up only new ones.
const current = JSON.parse(readFileSync(GIGS, 'utf8'));
const known = new Map(current.map((g) => [normalisePostcode(g.postcode), { postcode: g.postcode, lat: g.lat, lng: g.lng, town: g.city }]));
const ukRows = rows.filter((r) => !r.abroad);
const toLookUp = ukRows.map((r) => r.postcode).filter((pc) => pc && !known.has(normalisePostcode(pc)));
if (toLookUp.length) {
  try {
    for (const [pc, place] of await lookupPostcodes(toLookUp)) known.set(pc, place);
  } catch (e) {
    fail(e.message);
  }
}
for (const r of ukRows) {
  if (r.postcode && !known.get(normalisePostcode(r.postcode))) problems.push(`Row ${r.rowNo}: postcode "${r.postcode}" not found`);
}

// Gigs abroad: reuse the position of the same venue already in gigs.json, otherwise look it up.
const placeKey = (venue, city) => `${venue}|${city}`.toLowerCase();
const knownPlaces = new Map(current.filter((g) => g.country).map((g) => [placeKey(g.venue, g.city), { lat: g.lat, lng: g.lng }]));
const roughPlaces = [];
for (const r of rows.filter((r) => r.abroad && r.venue && r.city)) {
  const key = placeKey(r.venue, r.city);
  if (!knownPlaces.has(key)) {
    let place;
    try {
      place = await lookupPlace(r);
    } catch (e) {
      fail(e.message);
    }
    if (!place) problems.push(`Row ${r.rowNo}: couldn't find "${r.city}, ${r.country}" on the map`);
    else if (!place.exact) roughPlaces.push(`${r.venue}, ${r.city}`);
    knownPlaces.set(key, place);
  }
  r.place = knownPlaces.get(key);
}

// The same venue twice on one date is almost always a copy-paste slip.
const seen = new Map();
for (const r of rows) {
  if (!r.date || !r.venue) continue;
  const key = `${r.date}|${r.venue.toLowerCase()}`;
  if (seen.has(key)) problems.push(`Row ${r.rowNo}: same venue and date as row ${seen.get(key)}`);
  else seen.set(key, r.rowNo);
}

if (problems.length) {
  console.error(`Nothing saved. Fix ${problems.length === 1 ? 'this' : 'these'} in the sheet and run it again:\n`);
  for (const p of problems.sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)))) console.error(`  ${p}`);
  process.exit(1);
}

// ---- Build the new gig list and show what changed ----------------------------------

const keyOf = (g) => `${g.date}|${g.venue.toLowerCase()}`;
const byKey = new Map(current.map((g) => [keyOf(g), g]));
let nextId = Math.max(0, ...current.map((g) => g.id)) + 1;

const gigs = rows
  .map((r) => {
    const place = r.abroad ? { ...r.place, postcode: r.postcode, town: r.city } : known.get(normalisePostcode(r.postcode));
    const existing = byKey.get(`${r.date}|${r.venue.toLowerCase()}`);
    const gig = {
      id: existing?.id ?? nextId++,
      date: r.date,
      venue: r.venue,
      city: r.city || place.town,
      postcode: place.postcode,
      lat: place.lat,
      lng: place.lng,
      ticketUrl: r.tickets,
      status: r.status,
    };
    if (r.abroad) gig.country = r.country;
    return gig;
  })
  .sort((a, b) => a.date.localeCompare(b.date) || a.venue.localeCompare(b.venue));

const FIELDS = ['city', 'postcode', 'ticketUrl', 'status', 'country'];
const label = (g) => `${g.date}  ${g.venue}, ${g.city}`;
const added = [], changed = [], removed = [];
const newKeys = new Set(gigs.map(keyOf));
for (const g of gigs) {
  const old = byKey.get(keyOf(g));
  if (!old) added.push(label(g));
  else {
    const diffs = FIELDS.filter((f) => (old[f] ?? '') !== (g[f] ?? '')).map((f) => `${f}: "${old[f] ?? ''}" -> "${g[f] ?? ''}"`);
    if (diffs.length) changed.push(`${label(g)}  (${diffs.join(', ')})`);
  }
}
for (const g of current) if (!newKeys.has(keyOf(g))) removed.push(label(g));

const section = (title, list) => list.length && console.log(`${title} (${list.length}):\n${list.map((l) => `  ${l}`).join('\n')}\n`);
section('Added', added);
section('Changed', changed);
section('Removed', removed);
section('Placed in the city centre (venue not found on the map)', roughPlaces);
const unchanged = gigs.length - added.length - changed.length;

if (!added.length && !changed.length && !removed.length) {
  console.log(`No changes: the site already matches the sheet (${gigs.length} gigs).`);
} else if (dryRun) {
  console.log(`Dry run: nothing saved. ${gigs.length} gigs in the sheet, ${unchanged} unchanged.`);
} else {
  writeFileSync(GIGS, JSON.stringify(gigs, null, 2) + '\n');
  console.log(`Saved ${gigs.length} gigs (${unchanged} unchanged). Rebuild and deploy to put them live.`);
}
