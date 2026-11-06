const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const files = readdirSync(__dirname).filter(file => file.endsWith('.test.cjs')).sort();
if (!files.length) throw new Error('No regression tests found');
for (const file of files) {
  const result = spawnSync(process.execPath, [join(__dirname, file)], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
