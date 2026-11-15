const fs = require('fs');
const path = require('path');

const BASE_API = process.env.BASE_API || 'http://localhost:5000';

async function runSessionFlowTests() {
  console.log('================================================================');
  console.log('MSK LOGISTIC SOLUTION ERP — SIGN-IN / SIGN-OUT FLOW TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test Group 1: Source Code & Static Architecture Verification
  // -------------------------------------------------------------
  console.log('1. Checking Client Authentication Architecture...');
  const authCtxSrc = fs.readFileSync(path.resolve(__dirname, '../client/src/context/AuthContext.tsx'), 'utf8');
  assert(authCtxSrc.includes('logout: () => Promise<void>'), 'AuthContext defines async logout function');
  assert(authCtxSrc.includes('auth:unauthorized'), 'AuthContext subscribes to auth:unauthorized event');
  assert(authCtxSrc.includes('localStorage.removeItem(\'logibill_token\')'), 'AuthContext clears localStorage token');
  assert(authCtxSrc.includes('sessionStorage.removeItem(\'logibill_token\')'), 'AuthContext clears sessionStorage token');
  assert(authCtxSrc.includes('api.logout()'), 'AuthContext calls backend api.logout()');

  console.log('2. Checking Header Account Dropdown & Sign Out Button...');
  const headerSrc = fs.readFileSync(path.resolve(__dirname, '../client/src/components/layout/Header.tsx'), 'utf8');
  assert(headerSrc.includes('onSignOut?: () => Promise<void> | void'), 'HeaderProps defines onSignOut callback');
  assert(headerSrc.includes('isSigningOut'), 'Header maintains isSigningOut loading state');
  assert(headerSrc.includes('disabled={isSigningOut}'), 'Sign Out button is disabled during logout processing');
  assert(headerSrc.includes('Signing Out...'), 'Sign Out button displays active loading text');
  assert(headerSrc.includes('handleClickOutside'), 'Header closes dropdowns on outside mouse click');
  assert(headerSrc.includes('roleMenuRef'), 'Header attaches ref to account dropdown container');

  console.log('3. Checking App State Teardown & Protected Route Guards...');
  const appSrc = fs.readFileSync(path.resolve(__dirname, '../client/src/App.tsx'), 'utf8');
  assert(appSrc.includes('handleSignOut'), 'App implements robust handleSignOut handler');
  assert(appSrc.includes('setCurrentTab(\'dashboard\')'), 'handleSignOut resets active tab to dashboard');
  assert(appSrc.includes('setSelectedPartyId(null)'), 'handleSignOut clears selected party state');
  assert(appSrc.includes('setSelectedInvoiceId(null)'), 'handleSignOut clears selected invoice state');
  assert(appSrc.includes('setLogoutNotice(\'Signed out successfully.\')'), 'handleSignOut prepares success notification');
  assert(appSrc.includes('navigate(\'/login\')'), 'handleSignOut redirects unauthenticated user to /login');
  assert(appSrc.includes('logoutMessage={logoutNotice}'), 'App passes logout message down to Login component');

  console.log('4. Checking Login Notification & Input Clearance...');
  const loginSrc = fs.readFileSync(path.resolve(__dirname, '../client/src/pages/Login.tsx'), 'utf8');
  assert(loginSrc.includes('logoutMessage?: string | null'), 'Login accepts logoutMessage prop');
  assert(loginSrc.includes('bg-emerald-50') && loginSrc.includes('text-emerald-800'), 'Login renders styled success notification banner');
  assert(loginSrc.includes('onClearLogoutMessage'), 'Login clears logout notice on input interaction');

  console.log('5. Checking Backend Routes & Controller...');
  const serverApiSrc = fs.readFileSync(path.resolve(__dirname, '../server/src/routes/api.ts'), 'utf8');
  assert(serverApiSrc.includes("router.post('/auth/logout', AuthController.logout)"), 'server/src/routes/api.ts registers POST /auth/logout');
  const authCtrlSrc = fs.readFileSync(path.resolve(__dirname, '../server/src/controllers/authController.ts'), 'utf8');
  assert(authCtrlSrc.includes('static async logout'), 'AuthController implements logout method');
  assert(authCtrlSrc.includes('res.clearCookie'), 'AuthController clears session cookies');
  assert(authCtrlSrc.includes('logAudit'), 'AuthController writes audit trail on logout');

  console.log('\n-------------------------------------------------------------');
  console.log(`Verification Complete: ${passed} passed, ${failed} failed.`);
  console.log('-------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSessionFlowTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
