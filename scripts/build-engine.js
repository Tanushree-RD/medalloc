const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dsaDir = path.resolve(__dirname, '../dsa');
const buildDir = path.join(dsaDir, 'build');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

const isWindows = process.platform === 'win32';
const targetName = isWindows ? 'allocator.exe' : 'allocator';
const targetPath = path.join(buildDir, targetName);

console.log('[MedAlloc Engine] Compiling C Algorithm Engine with Priority Queue, Hash Map, Graph, Dijkstra & Bipartite Matching modules...');

try {
  // Compile allocator.c and all source modules in src/
  const cmd = `gcc -std=c11 -Wall -Wextra -O2 -Iinclude -I. allocator.c src/priority_queue.c src/hashmap.c src/graph.c src/dijkstra.c src/bipartite_matching.c src/allocation_engine.c -o "${targetPath}"`;
  execSync(cmd, { cwd: dsaDir, stdio: 'inherit' });
  console.log(`[MedAlloc Engine] Compilation succeeded: ${targetPath}`);
} catch (err) {
  console.error('[MedAlloc Engine] Direct gcc compilation failed, attempting make...', err.message);
  try {
    const makeCmd = isWindows ? 'mingw32-make -C dsa all' : 'make -C dsa all';
    execSync(makeCmd, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    console.log('[MedAlloc Engine] Make build succeeded.');
  } catch (makeErr) {
    console.error('[MedAlloc Engine] Build failed:', makeErr.message);
    process.exit(1);
  }
}
