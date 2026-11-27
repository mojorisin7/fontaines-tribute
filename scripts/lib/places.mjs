// Map positions for gigs outside the UK, where there is no postcode to look up.
// Uses OpenStreetMap's free search (Nominatim): venue + city + country first, then just the city.
// Nominatim allows one request a second, so lookups are spaced out.

const UK = ['', 'uk', 'united kingdom', 'gb', 'great britain', 'england', 'scotland', 'wales', 'northern ireland'];
export const isUk = (country) => UK.includes((country || '').trim().toLowerCase());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'tribute-band-site gig import' } });
  if (!res.ok) throw new Error(`place lookup failed (HTTP ${res.status}). Try again in a minute.`);
  const [hit] = await res.json();
  await sleep(1100);
  return hit && { lat: Number(Number(hit.lat).toFixed(4)), lng: Number(Number(hit.lon).toFixed(4)) };
}

// Returns { lat, lng, exact } or null. `exact` is false when only the city was found.
export async function lookupPlace({ venue, city, country }) {
  const venueHit = await search([venue, city, country].filter(Boolean).join(', '));
  if (venueHit) return { ...venueHit, exact: true };
  const cityHit = await search([city, country].filter(Boolean).join(', '));
  return cityHit && { ...cityHit, exact: false };
}
