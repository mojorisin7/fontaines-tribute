# Tribute band website (starter)

Astro static site with a Leaflet gig map. This is the Tier 1 (static) build.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Where things live

| Path | What it is |
| --- | --- |
| `src/config.ts` | Band name, tagline, booking email, social links, nav tabs, home slider slides. Set these first. |
| `src/components/HeroSlider.astro` | Home page 4-slide slider |
| `src/data/gigs.json` | Gig list. Edit this to add gigs (Tier 1). Sample data for now. `status` is `live`, `sold-out` or `cancelled`. |
| `src/data/music.json` | Music page: the set, grouped by album (sample for now), plus optional `listen` links to recordings. |
| `src/data/videos.json` | Videos page: `{ "url": "<any YouTube link>", "title": "..." }` per video. Empty shows placeholders. |
| `src/data/testimonials.json` | Testimonials page, plus two on Home and Book The Band. Placeholder quotes for now. |
| `src/data/photos.json` | Photos added with `add-photos`. Not shown anywhere yet: the Gallery page was dropped from the client's page list (restore it from git if they take the gallery extra). |
| `src/lib/gigs.ts` | Gig type, sorting, upcoming/past split, date formatting. Swap `loadGigs()` for Supabase in Tier 2. |
| `src/components/GigMap.astro` | Leaflet map, one flag per gig |
| `src/components/GigList.astro` | Gig rows used on Home and Gigs |
| `src/layouts/Base.astro` | Header, nav, footer, page shell |
| `src/styles/global.css` | Colour and font tokens at the top. Swap these for the client's palette. |
| `src/pages/` | Home, Live, Music, Videos, Testimonials, Book The Band, 404 |
| `scripts/` | `add-gig` and `add-photos` helpers (see below) |

## Adding a gig (Tier 1)

```bash
npm run add-gig -- --date 2026-12-05 --venue "Brudenell Social Club" --postcode "LS6 1JB"
```

Looks up the map position from the postcode (postcodes.io) and saves the gig to `src/data/gigs.json`.
Optional: `--city Leeds` (defaults to the postcode's town), `--tickets https://...`,
`--status sold-out|cancelled`, `--dry-run` to check without saving.

To cancel or edit a gig, change its entry in `src/data/gigs.json` (set `"status": "cancelled"` to cancel).

Rebuild and deploy after each change. Upcoming vs past is worked out at build time, so rebuild after each gig too.

## Adding photos to the gallery (Tier 1)

```bash
npm run add-photos -- ~/Downloads/leeds-photos "Leeds, Nov 2026"
```

Takes every JPEG, PNG, HEIC (iPhone) or WebP in the folder, resizes it to 1600px on the long side
into `public/photos/gallery/`, and adds it to the top of `src/data/photos.json` with the caption.
Uses macOS's built-in `sips`, so it needs a Mac. Add `--dry-run` to check first.
Edit `alt` in `photos.json` if you want a more specific description for screen readers.

## Next steps (Tier 2)

1. Create a Supabase project with `gigs` and `photos` tables.
2. Fetch gigs at page load instead of importing the JSON.
3. Add a login page and an admin form that geocodes the postcode (postcodes.io) before saving.
4. Add photo uploads to Supabase Storage.

## Notes

- Layout and feel follow the Fontaines D.C. site
- All gig data in the repo is sample data. Replace before launch.
