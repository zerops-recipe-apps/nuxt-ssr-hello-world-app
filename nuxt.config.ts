import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./node_modules/nuxt/package.json', 'utf-8'))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',

  // Disable file-based pages routing - health check is
  // served exclusively from the Nitro server route.
  pages: false,

  // Build-time constants embedded into the Nitro bundle.
  // Access via useRuntimeConfig() in server routes.
  // Note: nitro.define does NOT work for runtime replacement -
  // runtimeConfig is the correct Nuxt/Nitro mechanism.
  runtimeConfig: {
    buildTime: new Date().toISOString(),
    nuxtVersion: pkg.version,
  },
})
