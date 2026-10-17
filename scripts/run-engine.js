const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const targetName = isWindows ? 'allocator.exe' : 'allocator';
const targetPath = path.resolve(__dirname, '../dsa/build', targetName);

if (!fs.existsSync(targetPath)) {
  console.error(`[MedAlloc Engine] Binary not found at: ${targetPath}`);
  console.log('[MedAlloc Engine] Running build first...');
  require('./build-engine');
}

console.log(`[MedAlloc Engine] Executing binary: ${targetPath}`);
const proc = spawn(targetPath, [], { stdio: 'inherit' });

proc.on('close', (code) => {
  console.log(`[MedAlloc Engine] Process exited with code ${code}`);
  process.exit(code);
});
