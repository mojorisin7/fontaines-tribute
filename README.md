# Tribute band website (starter)

Astro static site with a Leaflet gig map. This is the Tier 1 (static) build.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Client preview (Cloudflare Pages)

```bash
npm run preview:deploy
```

Builds the site as a preview (yellow "Preview, not the live site" strip, kept out of search engines) and uploads it
to the `fontaines-tribute` Cloudflare Pages project on the `preview` branch:
**https://preview.fontaines-tribute.pages.dev**. The project's Access policy puts an email login in front of it;
add or remove people in Cloudflare Zero Trust > Access > Applications. Needs `npx wrangler login` once.
Nothing is deployed to the main `fontaines-tribute.pages.dev` address.

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

## Importing gigs from the band's Google Sheet

The band keeps their gigs in a Google Sheet (one row per gig) and you pull it into the site when you choose.

Sheet columns, in a header row: **Date**, **Venue**, **Postcode**, **Status** (all required), **City** (optional, filled in from the
postcode), **Ticket link**, Status values `On sale` (or blank), `Sold out` or `Cancelled`, **Country** (optional, defaults to
UK) and **Notes** (ignored). Columns can be in any order. Dates can be typed as `5/12/2026` (day first) or `2026-12-05`.
Past gigs can stay in the sheet: the site moves them to "Past" by itself.

```bash
npm run import-gigs -- --dry-run     # show what would change
npm run import-gigs                  # save it to src/data/gigs.json
```

This reads the sheet at `GIGS_SHEET_URL` in `.env` (copy `.env.example`). For that, the sheet must be shared as
"Anyone with the link: Viewer". Without sharing it, download it with File > Download > CSV and pass the file:
`npm run import-gigs -- ~/Downloads/gigs.csv`. An Excel file saved as CSV works too.

The sheet replaces the whole gig list. Every row is checked first; if any row has a bad date, venue, postcode,
status or ticket link, nothing is saved and each problem is listed with its row number. Postcodes are looked up
once and reused. Rebuild and deploy afterwards.

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

- Layout and feel follow the Fontaines D.C. site, but the band uses its own name, logo, photos and wording. Do not copy their images, text or code.
- All gig data in the repo is sample data. Replace before launch.

## Placeholders: do not launch with these

These are Fontaines D.C.'s own artwork and branding, used only to preview the layout locally.
Together they make the site look like the official band site, so all of them must be replaced
with the tribute band's own material before the site goes live.

- **Slider images:** `public/photos/hero/slide-1.jpg` to `slide-4.jpg`, and the `slide-1-no-text.jpg`
  to `slide-3-no-text.jpg` copies with the words painted out. Set in `slides` in `src/config.ts`.
- **Header logo:** `public/logo/temp-logo.png` (`logo.image` in `src/config.ts`).
- **Favicons:** `public/favicon-32.png`, `favicon-192.png` and `apple-touch-icon.png`, made from the temp logo.
- **Band name:** `bandName` in `src/config.ts` is "Fontaines D.C." for now.
- **Content:** the sample setlist (`src/data/music.json`), placeholder testimonials, sample gigs,
  social links and the booking email.
