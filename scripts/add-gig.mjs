// Add a gig to src/data/gigs.json, looking up the map position from the postcode.
//
//   npm run add-gig -- --date 2026-12-05 --venue "Brudenell Social Club" --postcode "LS6 1JB"
//
// Optional: --city Leeds (defaults to the postcode's town), --tickets https://...,
// --status live|sold-out|cancelled (defaults to live), --dry-run (print, don't save).
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const GIGS = new URL('../src/data/gigs.json', import.meta.url);
const STATUSES = ['live', 'sold-out', 'cancelled'];

const { values: opts } = parseArgs({
  options: {
    date: { type: 'string' },
    venue: { type: 'string' },
    postcode: { type: 'string' },
    city: { type: 'string' },
    tickets: { type: 'string', default: '' },
    status: { type: 'string', default: 'live' },
    'dry-run': { type: 'boolean', default: false },
  },
});

const fail = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};

if (!opts.date || !opts.venue || !opts.postcode) {
  fail('--date, --venue and --postcode are required. Example:\n  npm run add-gig -- --date 2026-12-05 --venue "Brudenell Social Club" --postcode "LS6 1JB"');
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.date) || Number.isNaN(Date.parse(opts.date))) fail(`date must be YYYY-MM-DD, got "${opts.date}"`);
if (!STATUSES.includes(opts.status)) fail(`status must be one of ${STATUSES.join(', ')}`);
if (opts.tickets && !/^https?:\/\//.test(opts.tickets)) fail('tickets must be a full link starting with https://');

const postcode = opts.postcode.toUpperCase().replace(/\s+/g, ' ').trim();
const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.replace(/ /g, ''))}`);
if (res.status === 404) fail(`postcode "${postcode}" not found. Check it and try again.`);
if (!res.ok) fail(`postcode lookup failed (HTTP ${res.status}). Try again in a minute.`);
const { result } = await res.json();

const gigs = JSON.parse(readFileSync(GIGS, 'utf8'));
const gig = {
  id: Math.max(0, ...gigs.map((g) => g.id)) + 1,
  date: opts.date,
  venue: opts.venue.trim(),
  city: (opts.city || result.admin_district || result.parish || '').trim(),
  postcode: result.postcode,
  lat: Number(result.latitude.toFixed(4)),
  lng: Number(result.longitude.toFixed(4)),
  ticketUrl: opts.tickets,
  status: opts.status,
};

const clash = gigs.find((g) => g.date === gig.date && g.venue.toLowerCase() === gig.venue.toLowerCase());
if (clash) fail(`there is already a gig at ${clash.venue} on ${clash.date} (id ${clash.id}).`);

console.log(`${gig.date}  ${gig.venue}, ${gig.city} (${gig.postcode})  ->  ${gig.lat}, ${gig.lng}  [${gig.status}]`);

if (opts['dry-run']) {
  console.log('Dry run: nothing saved.');
} else {
  gigs.push(gig);
  gigs.sort((a, b) => a.date.localeCompare(b.date));
  writeFileSync(GIGS, JSON.stringify(gigs, null, 2) + '\n');
  console.log(`Saved as gig ${gig.id}. Rebuild and deploy to put it live.`);
}
