/**
 * scripts/build.js
 * Copies game web assets into www/ for Capacitor to pick up.
 * Run: node scripts/build.js   OR   npm run build
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEST = path.join(ROOT, 'www');

// Folders and files to include in the web build
const INCLUDE = ['src', 'styles', 'assets', 'index.html'];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      // Skip node_modules anywhere inside src
      if (child === 'node_modules') continue;
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Clean www/
if (fs.existsSync(DEST)) fs.rmSync(DEST, { recursive: true });
fs.mkdirSync(DEST);

for (const item of INCLUDE) {
  const src  = path.join(ROOT, item);
  const dest = path.join(DEST, item);
  if (fs.existsSync(src)) {
    copyRecursive(src, dest);
    console.log(`✓  ${item}`);
  }
}

console.log(`\n✅  Build complete → www/`);
