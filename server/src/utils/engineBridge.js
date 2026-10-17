const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Resolves path to the compiled MedAlloc C engine binary
 */
function getEngineExecutablePath() {
  const isWindows = process.platform === 'win32';
  const binaryName = isWindows ? 'allocator.exe' : 'allocator';
  return path.resolve(__dirname, '../../../dsa/build', binaryName);
}

/**
 * Checks if the engine executable exists
 */
function isEngineBuilt() {
  const binaryPath = getEngineExecutablePath();
  return fs.existsSync(binaryPath);
}

/**
 * Executes a communication session with the C engine via stdin/stdout JSON
 * @param {Object} payload Input JSON payload to be sent to engine stdin
 * @returns {Promise<Object>} Response parsed from engine stdout JSON
 */
function executeEngineCommand(payload = {}) {
  return new Promise((resolve, reject) => {
    const binaryPath = getEngineExecutablePath();

    if (!fs.existsSync(binaryPath)) {
      return reject(new Error(`Algorithm engine binary not found at: ${binaryPath}. Build it using 'npm run build:engine'.`));
    }

    const processInstance = spawn(binaryPath, [], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdoutData = '';
    let stderrData = '';

    processInstance.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    processInstance.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    processInstance.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Engine exited with code ${code}: ${stderrData || stdoutData}`));
      }

      // Return raw string output if not JSON yet (placeholder prints "MedAlloc Engine Ready")
      try {
        const parsed = JSON.parse(stdoutData.trim());
        resolve(parsed);
      } catch {
        resolve({ rawOutput: stdoutData.trim() });
      }
    });

    processInstance.on('error', (err) => {
      reject(err);
    });

    // Write input JSON to stdin and close write stream
    processInstance.stdin.write(JSON.stringify(payload));
    processInstance.stdin.end();
  });
}

module.exports = {
  getEngineExecutablePath,
  isEngineBuilt,
  executeEngineCommand
};
