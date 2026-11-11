/**
 * Refresh English sources only (does not overwrite locale JSON placeholders).
 * Used by npm run translate before Gemini jobs.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, '..');
const script = path.join(root, 'generate-i18n-entry.ts');
const run = spawnSync('npx', ['tsx', script, '--en-only'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});
process.exit(run.status ?? 1);
