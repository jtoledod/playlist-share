import { build } from 'esbuild';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const external = Object.keys(pkg.dependencies);

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  outdir: 'dist',
  format: 'esm',
  external: external,
});
