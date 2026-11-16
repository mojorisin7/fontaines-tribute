// UK postcode lookups via postcodes.io, shared by add-gig and import-gigs.

// Official district names read oddly on a gig list ("Bristol, City of", "City of Edinburgh").
export const townName = (result) =>
  (result.admin_district || result.parish || '').replace(/, City of$/, '').replace(/^City of /, '');

export const normalisePostcode = (pc) => pc.toUpperCase().replace(/\s+/g, ' ').trim();

// Look up many postcodes in one request (postcodes.io allows 100 per call).
// Returns a Map of normalised postcode -> { postcode, lat, lng, town } or null if not found.
export async function lookupPostcodes(postcodes) {
  const unique = [...new Set(postcodes.map(normalisePostcode))];
  const found = new Map();
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    const res = await fetch('https://api.postcodes.io/postcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcodes: batch }),
    });
    if (!res.ok) throw new Error(`postcode lookup failed (HTTP ${res.status}). Try again in a minute.`);
    const { result } = await res.json();
    for (const { query, result: r } of result) {
      found.set(
        normalisePostcode(query),
        r && { postcode: r.postcode, lat: Number(r.latitude.toFixed(4)), lng: Number(r.longitude.toFixed(4)), town: townName(r) },
      );
    }
  }
  return found;
}
