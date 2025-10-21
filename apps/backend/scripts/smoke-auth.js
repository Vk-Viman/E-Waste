/*
  Simple smoke test to seed admin, login, and call /api/users.
  Run: npm run smoke (from apps/backend)
*/

const BASE = process.env.BASE_URL || 'http://localhost:5000';

async function json(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// Simple cookie jar: store name=value strings
const cookies = [];
function setCookiesFromResponse(res) {
  // Node's fetch may expose a single 'set-cookie' header string
  const sc = res.headers.get('set-cookie');
  if (!sc) return;
  // There may be multiple cookies in one header separated by ', ' — split conservatively
  const parts = sc.split(/, (?=[^ ;]+=)/g);
  for (const p of parts) {
    const nv = p.split(';')[0].trim();
    const name = nv.split('=')[0];
    // replace existing
    const idx = cookies.findIndex(c => c.split('=')[0] === name);
    if (idx >= 0) cookies[idx] = nv; else cookies.push(nv);
  }
}

function cookieHeader() {
  return cookies.join('; ');
}

async function fetchWithCookies(url, opts = {}) {
  opts.headers = opts.headers || {};
  if (cookieHeader()) opts.headers['Cookie'] = cookieHeader();
  const res = await fetch(url, opts);
  setCookiesFromResponse(res);
  return res;
}

(async () => {
  try {
    // Seed admin (GET convenience)
    let r = await fetch(`${BASE}/api/auth/seed-admin`);
    let body = await json(r);
    console.log('seed-admin:', r.status, body);

    // Login
    // Fetch CSRF token and include it in the login request
    let csrfToken = null;
    try {
      const cr = await fetchWithCookies(`${BASE}/api/csrf-token`);
      const cb = await json(cr);
      csrfToken = cb?.csrfToken;
    } catch (e) {
      // continue
    }

    r = await fetchWithCookies(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      body: JSON.stringify({ email: 'admin@ecocollect.local', password: 'admin123' }),
    });
    console.log('login response headers:');
    for (const h of r.headers.entries()) {
      console.log(' ', h[0], h[1]);
    }
    console.log('cookie jar after login:', cookieHeader());
    body = await json(r);
    if (!r.ok) throw new Error('login failed: ' + JSON.stringify(body));
    console.log('login:', r.status, body.user);

  // Debug: check server sees cookies
  console.log('Calling /api/debug-cookie to see server-side cookies');
  let dbg = await fetchWithCookies(`${BASE}/api/debug-cookie`);
  console.log('debug-cookie status:', dbg.status, await json(dbg));

  // Users (use cookie-based auth)
  console.log('Sending Cookie header to /api/users:', cookieHeader());
  r = await fetchWithCookies(`${BASE}/api/users`);
    body = await json(r);
    console.log('users:', r.status, Array.isArray(body) ? body.length + ' users' : body);

    process.exit(0);
  } catch (e) {
    console.error('Smoke test error:', e.message || e);
    process.exit(1);
  }
})();
