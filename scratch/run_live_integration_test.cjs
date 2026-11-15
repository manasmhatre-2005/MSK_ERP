const { spawn } = require('child_process');
const http = require('http');

async function waitForServer(port, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error('Status ' + res.statusCode));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      console.log(`Server is ready on port ${port}!`);
      return;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('Server did not start in time');
}

async function main() {
  const TEST_PORT = 5005;
  console.log(`Starting LogiBill server on port ${TEST_PORT}...`);
  const serverProcess = spawn(process.execPath, ['server/dist/server.js'], {
    env: { ...process.env, PORT: String(TEST_PORT), NODE_ENV: 'production', ELECTRON_RUN_AS_NODE: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (d) => console.log('[SERVER]', d.toString().trim()));
  serverProcess.stderr.on('data', (d) => console.error('[SERVER ERR]', d.toString().trim()));

  try {
    await waitForServer(TEST_PORT);

    console.log('\n--- 1. Testing /api/health endpoint ---');
    const healthRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/health`);
    const healthJson = await healthRes.json();
    console.log('Health check response:', healthJson);

    console.log('\n--- 2. Running Three Roles & Permissions Test Suite ---');
    // Run test_three_roles.cjs targeting TEST_PORT
    const testCode = require('fs').readFileSync('scratch/test_three_roles.cjs', 'utf8')
      .replace(/const BASE = 'http:\/\/localhost:5000';/, `const BASE = 'http://127.0.0.1:${TEST_PORT}';`);
    require('fs').writeFileSync('scratch/test_three_roles_runner.cjs', testCode);

    const testChild = spawn(process.execPath, ['scratch/test_three_roles_runner.cjs'], {
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
      stdio: 'inherit',
    });

    const exitCode = await new Promise((resolve) => testChild.on('close', resolve));
    if (exitCode !== 0) throw new Error('test_three_roles failed with exit code ' + exitCode);

    console.log('\n--- 2b. Running Dedicated Account Role Security Test Suite ---');
    const acctCode = require('fs').readFileSync('scratch/test_account_role.cjs', 'utf8');
    require('fs').writeFileSync('scratch/test_account_role_runner.cjs', acctCode);
    const acctChild = spawn(process.execPath, ['scratch/test_account_role_runner.cjs'], {
      env: { ...process.env },
      stdio: 'inherit',
    });
    const acctExitCode = await new Promise((resolve) => acctChild.on('close', resolve));
    if (acctExitCode !== 0) throw new Error('test_account_role failed with exit code ' + acctExitCode);

    console.log('\n--- 3. Testing Frontend Static Assets Serving ---');
    const clientIndexRes = await fetch(`http://127.0.0.1:${TEST_PORT}/`);
    const clientHtml = await clientIndexRes.text();
    console.log('Frontend index.html status:', clientIndexRes.status, 'Content length:', clientHtml.length, 'Contains LogiBill:', clientHtml.includes('MSK') || clientHtml.includes('LogiBill') || clientHtml.includes('root'));

    console.log('\n✅ ALL LIVE BACKEND AND ROLE-BASED ACCESS CONTROL TESTS PASSED!');
  } finally {
    console.log('Stopping test server...');
    serverProcess.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
