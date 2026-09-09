# Nuxt SSR Hello World Recipe App

<!-- #ZEROPS_EXTRACT_START:intro# -->
A server-rendered [Nuxt](https://nuxt.com) application powered by Nitro, connected to a PostgreSQL database. Demonstrates idempotent migrations, real database connectivity checks, and SSR health reporting — all deployed on [Zerops](https://zerops.io).
<!-- #ZEROPS_EXTRACT_END:intro# -->

Used within [Nuxt SSR Hello World recipe](https://app.zerops.io/recipes/nuxt-ssr-hello-world) for [Zerops](https://zerops.io) platform.

⬇️ **Full recipe page and deploy with one-click**

[![Deploy on Zerops](https://github.com/zeropsio/recipe-shared-assets/blob/main/deploy-button/light/deploy-button.svg)](https://app.zerops.io/recipes/nuxt-ssr-hello-world?environment=small-production)

![nuxt cover](https://github.com/zeropsio/recipe-shared-assets/blob/main/covers/svg/cover-nuxt.svg)

## Integration Guide

### 1. Adding `zerops.yaml`
The main application configuration file you place at the root of your repository, it tells Zerops how to build, deploy and run your application.

```yaml
zerops:
  # Production setup: Nitro bundles all deps into .output/ —
  # no node_modules needed at runtime. Full optimized SSR.
  - setup: prod
    build:
      base: nodejs@24
      buildCommands:
        # npm install (not npm ci): Nuxt 3.x peer deps cause
        # npm ci to fail with peer conflict errors.
        - npm install
        # Bundle pg into migrate.cjs before Nuxt build —
        # Nitro inlines pg, leaving none for migrate.js.
        - node scripts/bundle-migrate.mjs
        - npx nuxi build

      deployFiles:
        # Nitro bundles all runtime deps into .output/ —
        # no node_modules needed at runtime.
        - .output
        # Bundled migration script (pg included, self-contained)
        - migrate.cjs

      cache:
        # node_modules: avoids re-downloading on every build.
        # .nuxt: caches Nuxt's TypeScript analysis + Vite metadata.
        - node_modules
        - .nuxt

    # readinessCheck: verifies each new runtime container is
    # healthy before the project balancer routes traffic to it.
    deploy:
      readinessCheck:
        httpGet:
          port: 3000
          path: /

    run:
      base: nodejs@24
      # initCommands run before start on every container
      # creation — deploy, restart, or scale-up event.
      # zsc execOnce ensures migration runs exactly once
      # per version across all containers, preventing race
      # conditions when minContainers > 1.
      initCommands:
        - zsc execOnce ${appVersionId} -- node migrate.cjs
      ports:
        - port: 3000
          httpSupport: true
      envVariables:
        NODE_ENV: production
        # DB_NAME is static — no hostname substitution needed.
        DB_NAME: db
        # Referencing pattern: ${hostname_key} resolves to
        # the generated credential for service 'db'.
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
      start: node .output/server/index.mjs

  # Dev setup: deploys full source for SSH-based development.
  # Developer SSHs in and drives the framework dev server.
  - setup: dev
    build:
      base: nodejs@24
      os: ubuntu
      buildCommands:
        # npm install (not npm ci) — dev may lack a lock file.
        - npm install
      # Deploy entire working directory including node_modules.
      deployFiles: ./
      cache:
        - node_modules

    run:
      base: nodejs@24
      os: ubuntu
      # Migration runs even in dev so the DB schema is ready
      # when the developer SSHs in. Uses migrate.js directly
      # (node_modules are deployed via deployFiles: ./).
      initCommands:
        - zsc execOnce ${appVersionId} -- node migrate.js
      ports:
        - port: 3000
          httpSupport: true
      envVariables:
        NODE_ENV: development
        DB_NAME: db
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
      # zsc noop: keeps the container idle. Developer starts
      # the dev server manually via SSH: npm run dev
      start: zsc noop --silent
```
