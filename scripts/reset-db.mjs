import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
copyFileSync(resolve(root, 'data/seed.json'), resolve(root, 'db.json'));
console.log('Database restored from data/seed.json. Restart the API if it was running.');
