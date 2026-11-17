// Build the site as a private preview and upload it to Cloudflare Pages.
//
//   npm run preview:deploy
//
// Preview builds show a "Preview, not the live site" strip and tell search engines to stay away
// (robots meta tag, X-Robots-Tag header and robots.txt). Uploads go to the "preview" branch of the
// Cloudflare Pages project, so they land on the preview address, which the project's Access policy
// keeps behind an email login. Needs `npx wrangler login` once.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const PROJECT = process.env.CF_PAGES_PROJECT || 'fontaines-tribute';
const run = (cmd, args, env = {}) => execFileSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });

run('npx', ['astro', 'build'], { PUBLIC_PREVIEW: 'true' });
writeFileSync('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
writeFileSync('dist/_headers', '/*\n  X-Robots-Tag: noindex, nofollow\n');
run('npx', ['--yes', 'wrangler', 'pages', 'deploy', 'dist', '--project-name', PROJECT, '--branch', 'preview', '--commit-dirty=true']);
