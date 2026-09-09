# nuxt-ssr-hello-world-app

Nuxt 4 SSR app (Nitro node preset) connected to PostgreSQL on Zerops nodejs@24, with a pre-bundled migration script.

## Zerops service facts

- HTTP port: `3000`
- Siblings: `db` (PostgreSQL) — env: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Runtime base: `nodejs@24`

## Zerops dev

`setup: dev` idles on `zsc noop --silent`; the agent starts the dev server.

- Dev command: `npm run dev`
- In-container rebuild without deploy: `npm run build`

**All platform operations (start/stop/status/logs of the dev server, deploy, env / scaling / storage / domains) go through the Zerops development workflow via `zcp` MCP tools. Don't shell out to `zcli`.**

## Notes

- Build uses `npm install` (not `npm ci`) — Nuxt 4 transitive deps have peer conflicts that `npm ci` rejects.
- Nitro bundles all runtime deps into `.output/` — no `node_modules` at prod runtime.
- `migrate.cjs` is pre-bundled with `pg` via `scripts/bundle-migrate.mjs` because Nitro inlines `pg` into `.output/`, leaving none for a plain `migrate.js`.
- Favicon lives in `public/favicon.ico`.
