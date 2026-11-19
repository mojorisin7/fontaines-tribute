// Upload the "coming soon" holding page to the live address of the Cloudflare Pages project.
//
//   npm run holding:deploy
//
// Goes to the production branch, so it is what the band's domains show until the real site is
// deployed over it at launch. Kept out of search engines. Needs `npx wrangler login` once.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PROJECT = process.env.CF_PAGES_PROJECT || 'fontaines-tribute';
const out = mkdtempSync(join(tmpdir(), 'holding-'));

cpSync('holding', out, { recursive: true });
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(out, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');
// Every path shows the holding page, so old links don't 404.
writeFileSync(join(out, '_redirects'), '/* /index.html 200\n');
execFileSync('npx', ['--yes', 'wrangler', 'pages', 'deploy', out, '--project-name', PROJECT, '--branch', 'main', '--commit-dirty=true'], { stdio: 'inherit' });
