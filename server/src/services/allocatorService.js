const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Resolves the path to the compiled C engine executable
 */
function getEnginePath() {
  const isWindows = process.platform === 'win32';
  const binaryName = isWindows ? 'allocator.exe' : 'allocator';
  return path.resolve(__dirname, '../../../dsa/build', binaryName);
}

/**
 * Executes the C allocation engine with a given JSON payload via stdin/stdout
 * @param {Object} inputPayload - JSON serializable data to send to engine
 * @returns {Promise<Object>} - Parsed JSON response from engine or structured error
 */
function runAllocatorEngine(inputPayload = {}) {
  return new Promise((resolve, reject) => {
    const executablePath = getEnginePath();

    if (!fs.existsSync(executablePath)) {
      const errResponse = {
        success: false,
        code: 'ENGINE_NOT_FOUND',
        error: `C allocation engine executable not found at: ${executablePath}. Run 'npm run build:engine' first.`,
      };
      return reject(errResponse);
    }

    const engineProcess = spawn(executablePath, [], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdoutData = '';
    let stderrData = '';

    engineProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    engineProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    engineProcess.on('error', (err) => {
      return reject({
        success: false,
        code: 'ENGINE_SPAWN_ERROR',
        error: `Failed to spawn allocator engine process: ${err.message}`,
        details: err
      });
    });

    engineProcess.on('close', (code) => {
      if (code !== 0) {
        return reject({
          success: false,
          code: 'ENGINE_EXECUTION_FAILURE',
          exitCode: code,
          error: stderrData.trim() || `Engine exited with error code ${code}`,
          rawStderr: stderrData.trim()
        });
      }

      const trimmedStdout = stdoutData.trim();
      try {
        const parsedJson = JSON.parse(trimmedStdout);
        return resolve(parsedJson);
      } catch (parseErr) {
        return reject({
          success: false,
          code: 'INVALID_JSON_OUTPUT',
          error: 'Engine stdout could not be parsed as valid JSON',
          rawStdout: trimmedStdout,
          parseError: parseErr.message
        });
      }
    });

    // Send payload via stdin and close input stream
    try {
      const jsonString = JSON.stringify(inputPayload);
      engineProcess.stdin.write(jsonString);
      engineProcess.stdin.end();
    } catch (writeErr) {
      engineProcess.kill();
      return reject({
        success: false,
        code: 'STDIN_WRITE_ERROR',
        error: `Failed to write JSON payload to engine stdin: ${writeErr.message}`
      });
    }
  });
}

module.exports = {
  getEnginePath,
  runAllocatorEngine
};
