// Bundles migrate.js + pg into a self-contained migrate.cjs.
// Required for prod: Nitro inlines pg into its own bundle,
// leaving no pg available for an external migrate.js.
// The .cjs extension lets Node.js resolve require() calls
// even when package.json has "type": "module".
import { build } from 'esbuild'

await build({
  entryPoints: ['migrate.js'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outfile: 'migrate.cjs',
  external: [],
})

console.log('migrate.cjs bundled.')
