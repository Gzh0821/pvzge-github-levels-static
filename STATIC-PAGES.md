# Pure static GitHub level distribution

This public fork tracks `NanGarden31415926/PvZ2-Gardendless-GitHubLevels`.
The existing `levels.pvzge.com` client paths are generated as static JSON files.

Cloudflare Pages configuration:

- Production branch: `main`
- Build command: `node scripts/build-static-pages.mjs`
- Output directory: `public-pages`
- Node.js: `24`
- No Functions, Workers, R2, KV, Durable Objects or paid upgrades.

The builder reuses the upstream level validator, verifies each Git blob and
SHA-256, excludes invalid levels, and stops above 4,000 levels, 10 MB per level
or 64 MB total. A top-level 404 file prevents SPA fallback for missing JSON.

The fork checks upstream every two hours on a standard free public Linux runner.
It does not upload workflow artifacts or use Actions cache. Only upstream changes
are merged; merge conflicts stop the job rather than overwriting fork changes.
Pages deploys pushes to `main`. Free build limits must not be bypassed by upgrading.

The old R2 bucket and VPS sync remain deleted/disabled. Never restore them.
