// Add a folder of photos to the gallery: resizes each one for the web into
// public/photos/gallery/ and lists it in src/data/photos.json.
//
//   npm run add-photos -- ~/Downloads/leeds-photos "Leeds, Nov 2026"
//
// The caption is optional. Handles JPEG, PNG, HEIC (iPhone) and WebP. Uses macOS's
// built-in `sips` to resize, so it runs on a Mac with nothing else installed.
// Add --dry-run to list what would be added without changing anything.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PHOTOS_JSON = join(root, 'src/data/photos.json');
const OUT_DIR = join(root, 'public/photos/gallery');
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.webp']);
const MAX_SIZE = 1600; // longest side in pixels
const QUALITY = 80;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const [folder, caption = ''] = args.filter((a) => a !== '--dry-run');

const fail = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};

if (!folder) fail('give the folder of photos. Example:\n  npm run add-photos -- ~/Downloads/leeds-photos "Leeds, Nov 2026"');
const src = resolve(folder);
if (!existsSync(src) || !statSync(src).isDirectory()) fail(`"${folder}" is not a folder.`);

const files = readdirSync(src)
  .filter((f) => !f.startsWith('.') && EXTS.has(extname(f).toLowerCase()))
  .sort();
if (files.length === 0) fail(`no photos found in "${folder}" (looked for ${[...EXTS].join(', ')}).`);

const slug = (caption || basename(src))
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'photo';

const photos = JSON.parse(readFileSync(PHOTOS_JSON, 'utf8'));
const taken = new Set(photos.map((p) => p.src));
if (!dryRun) mkdirSync(OUT_DIR, { recursive: true });

let n = 1;
const added = [];
for (const file of files) {
  while (taken.has(`/photos/gallery/${slug}-${n}.jpg`)) n++;
  const name = `${slug}-${n}.jpg`;
  taken.add(`/photos/gallery/${name}`);
  if (!dryRun) {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(QUALITY), '-Z', String(MAX_SIZE), join(src, file), '--out', join(OUT_DIR, name)], { stdio: 'ignore' });
  }
  added.push({
    src: `/photos/gallery/${name}`,
    alt: caption ? `The band live: ${caption}` : 'The band live on stage',
    ...(caption && { caption }),
  });
  console.log(`${file}  ->  public/photos/gallery/${name}`);
}

if (dryRun) {
  console.log(`Dry run: ${added.length} photo(s) would be added. Nothing changed.`);
} else {
  // Newest set first, so the latest gig's photos lead the gallery.
  writeFileSync(PHOTOS_JSON, JSON.stringify([...added, ...photos], null, 2) + '\n');
  console.log(`Added ${added.length} photo(s). Rebuild and deploy to put them live.`);
}
