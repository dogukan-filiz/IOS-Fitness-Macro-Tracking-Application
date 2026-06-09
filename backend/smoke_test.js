/**
 * Backend smoke test.
 *
 * Exercises the main API flow end to end against a running backend and exits
 * non-zero if any required check fails. Run with:
 *
 *   npm start            # in one terminal
 *   npm run smoke        # in another
 *
 * Override the target with SMOKE_BASE, e.g.
 *   SMOKE_BASE=http://localhost:4000 npm run smoke
 *
 * Requires Node 18+ (uses the global fetch).
 */

const BASE = process.env.SMOKE_BASE || 'http://localhost:4000';

let passed = 0;
let failed = 0;

function check(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function req(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function main() {
  console.log(`Smoke test against ${BASE}\n`);

  // 1. Auth: register a fresh user, then log in.
  const email = `smoke_${Date.now()}@example.com`;
  const password = 'smoke-pass-123';

  const reg = await req('POST', '/api/register', {
    body: { name: 'Smoke Test', email, password },
  });
  check('POST /api/register', reg.status === 201 && !!reg.data?.token, `status ${reg.status}`);

  const login = await req('POST', '/api/login', { body: { email, password } });
  check('POST /api/login', login.status === 200 && !!login.data?.token, `status ${login.status}`);
  const token = login.data?.token || reg.data?.token;

  // 2. Profile.
  const me = await req('GET', '/api/me', { token });
  check('GET /api/me', me.status === 200 && me.data?.user?.email === email, `status ${me.status}`);

  // 3. Foods list (seeded).
  const foods = await req('GET', '/api/foods?limit=5', { token });
  const firstFood = Array.isArray(foods.data?.foods) ? foods.data.foods[0] : null;
  check('GET /api/foods', foods.status === 200 && !!firstFood, `status ${foods.status}`);

  // 4. Add a food entry for today.
  const today = new Date().toISOString().slice(0, 10);
  const entry = await req('POST', '/api/food-entries', {
    token,
    body: { foodId: firstFood?.id, grams: 150, date: today },
  });
  check('POST /api/food-entries', entry.status === 201 && !!entry.data?.entry?.id, `status ${entry.status}`);

  // 5. Daily summary reflects the entry.
  const summary = await req('GET', `/api/daily-summary?date=${today}`, { token });
  check(
    'GET /api/daily-summary',
    summary.status === 200 && Number(summary.data?.summary?.calories ?? summary.data?.calories) > 0,
    `status ${summary.status}`
  );

  // 6. Daily entry list contains the entry.
  const daily = await req('GET', `/api/food-entries/daily?date=${today}`, { token });
  const dailyItems = daily.data?.entries || daily.data?.items || [];
  check('GET /api/food-entries/daily', daily.status === 200 && dailyItems.length >= 1, `status ${daily.status}`);

  // 7. Weights: upsert then read back.
  const wPost = await req('POST', '/api/weights', { token, body: { weight: 80, date: today } });
  check('POST /api/weights', wPost.status === 200 || wPost.status === 201, `status ${wPost.status}`);

  const wList = await req('GET', '/api/weights', { token });
  check(
    'GET /api/weights',
    wList.status === 200 && (wList.data?.entries || []).some((e) => e.date === today),
    `status ${wList.status}`
  );

  // 8. External food search. OpenFoodFacts is rate-limited, so a 502 here is a
  //    soft warning, not a hard failure of our backend.
  const search = await req('GET', '/api/foods/search?q=elma', { token });
  if (search.status === 200 && Array.isArray(search.data?.items)) {
    check('GET /api/foods/search', true);
  } else if (search.status === 502) {
    console.log('  WARN  GET /api/foods/search -> upstream 502 (OpenFoodFacts rate-limited), skipped');
  } else {
    check('GET /api/foods/search', false, `status ${search.status}`);
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('\nSmoke test crashed:', e.message);
  console.error(`Is the backend running at ${BASE}? Start it with "npm start".`);
  process.exit(1);
});
