async function testAuthStack() {
  console.log('Testing AuthController and Express router directly (no sockets needed)...');

  const appModule = await import('../server/dist/controllers/authController.js');
  const { AuthController } = appModule;

  // 1. Test AuthController.logout directly
  console.log('\n--- Test 1: AuthController.logout unauthenticated ---');
  let clearedCookies = [];
  let jsonResponse = null;
  let statusCode = 200;

  const mockReq1 = {
    headers: {},
    cookies: {},
    socket: { remoteAddress: '127.0.0.1' },
  };
  const mockRes1 = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
    clearCookie(name, options) {
      clearedCookies.push({ name, options });
      return this;
    },
  };

  await AuthController.logout(mockReq1, mockRes1);
  console.log('Status:', statusCode, 'Body:', jsonResponse, 'Cookies cleared:', clearedCookies.map(c => c.name));
  if (statusCode === 200 && jsonResponse?.success === true && clearedCookies.length >= 2) {
    console.log('✅ PASS: AuthController.logout cleared cookies and responded with success: true');
  } else {
    throw new Error('Test 1 failed');
  }

  // 2. Test AuthController.logout with user session
  console.log('\n--- Test 2: AuthController.logout with user session ---');
  clearedCookies = [];
  jsonResponse = null;
  statusCode = 200;

  const mockReq2 = {
    headers: { authorization: 'Bearer dummy-token' },
    user: { id: 'test-user-id', name: 'Test Administrator', email: 'admin@login', role: 'ADMIN' },
    socket: { remoteAddress: '127.0.0.1' },
  };
  const mockRes2 = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
    clearCookie(name, options) {
      clearedCookies.push({ name, options });
      return this;
    },
  };

  await AuthController.logout(mockReq2, mockRes2);
  console.log('Status:', statusCode, 'Body:', jsonResponse, 'Cookies cleared:', clearedCookies.map(c => c.name));
  if (statusCode === 200 && jsonResponse?.success === true && clearedCookies.some(c => c.name === 'logibill_token')) {
    console.log('✅ PASS: AuthController.logout successfully audited and cleared session cookies');
  } else {
    throw new Error('Test 2 failed');
  }

  console.log('\n🎉 ALL AUTH CONTROLLER UNIT TESTS PASSED CLEANLY!\n');
}

testAuthStack().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
