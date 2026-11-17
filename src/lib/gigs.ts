// Gig helpers shared by every page. In Tier 2, swap loadGigs() for a Supabase
// query and nothing else needs to change.
import data from '../data/gigs.json';

export interface Gig {
  id: number;
  date: string; // YYYY-MM-DD
  venue: string;
  city: string;
  country?: string; // shown after the city; defaults to United Kingdom
  postcode: string;
  lat: number;
  lng: number;
  ticketUrl: string;
  status: 'live' | 'cancelled' | 'sold-out';
  notes?: string;
}

export function loadGigs(): Gig[] {
  return [...(data as Gig[])].sort((a, b) => a.date.localeCompare(b.date));
}

// "Today" at build time. Pages are built with the gigs correct for this date, and
// src/lib/gig-dates.ts re-applies the same rules in the visitor's browser with their date,
// so past gigs move out and the next gig updates without a rebuild.
// GIGS_TODAY=YYYY-MM-DD fakes the build date, for checking how an older build behaves.
export const today = () => process.env.GIGS_TODAY || new Date().toISOString().slice(0, 10);

export const upcomingGigs = (gigs = loadGigs()) => gigs.filter((g) => g.date >= today());
export const pastGigs = (gigs = loadGigs()) => gigs.filter((g) => g.date < today()).reverse();
export const nextGig = (gigs = loadGigs()) => upcomingGigs(gigs).find((g) => g.status !== 'cancelled');

export function formatDate(d: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
}
