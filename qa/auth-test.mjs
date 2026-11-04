import { chromium, webkit } from 'playwright-core';
const BASE = 'http://127.0.0.1:8931/';
const CLIENT_ID = '1045140412331-30reu9jtrqcvs3pv63e49f6qjuie83cs.apps.googleusercontent.com';
const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64url');
function jwt(payload) { return b64u({alg:'RS256',typ:'JWT'}) + '.' + b64u(payload) + '.fakesig'; }
function codeFor(token, state) { return 'LT1.' + Buffer.from(JSON.stringify({t: token, s: state})).toString('base64url'); }
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const cleanEnv = { ...process.env };
  delete cleanEnv.HTTP_PROXY; delete cleanEnv.HTTPS_PROXY; delete cleanEnv.http_proxy; delete cleanEnv.https_proxy;
  cleanEnv.NO_PROXY = '127.0.0.1,localhost'; cleanEnv.no_proxy = '127.0.0.1,localhost';
  const pu = new URL(process.env.HTTPS_PROXY);
  const proxy = { server: pu.protocol + '//' + pu.hostname + ':' + pu.port, username: decodeURIComponent(pu.username), password: decodeURIComponent(pu.password), bypass: '127.0.0.1,localhost' };
  const browser = await engine.launch({ env: cleanEnv, proxy });
  const ctx = await browser.newContext({ userAgent: IPHONE_UA, viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { Object.defineProperty(window.navigator, 'standalone', { value: true }); });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0,150)));
  const results = [];
  const check = (label, ok, extra='') => { const line = (ok?'PASS':'FAIL') + ' ' + label + (extra?' :: '+extra:''); results.push(line); console.log('  [' + name + '] ' + line); };

  // --- auth.html code page ---
  const tok = jwt({ iss:'https://accounts.google.com', aud: CLIENT_ID, exp: Math.floor(Date.now()/1000)+3000, nonce:'N1' });
  await page.goto(BASE + 'auth.html#id_token=' + tok + '&state=S1', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const codeVal = await page.evaluate(() => document.getElementById('sign-code')?.value || '');
  check('auth.html shows LT1 code', codeVal.startsWith('LT1.'));
  const decoded = codeVal.startsWith('LT1.') ? JSON.parse(Buffer.from(codeVal.slice(4), 'base64url').toString()) : {};
  check('code envelope round-trips token+state', decoded.t === tok && decoded.s === 'S1');
  const btns = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.textContent));
  check('auth.html has Copy + Safari buttons', btns.some(b=>/Copy code/.test(b)) && btns.some(b=>/Safari/.test(b)), btns.join('|'));

  // --- app: standalone paste flow ---
  await page.goto(BASE + 'index.html', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const standalone = await page.evaluate(() => isIosStandalonePwa());
  check('app detects iOS standalone', standalone === true);
  await page.evaluate(() => showView('settings'));
  await page.waitForTimeout(400);
  const pasteVisible = await page.evaluate(() => !!document.getElementById('paste-code-input'));
  check('paste-code field rendered in Settings', pasteVisible);

  const toastText = () => page.evaluate(() => [...document.querySelectorAll('.toast')].map(t=>t.textContent).join(' | '));
  async function paste(code) {
    await page.evaluate(() => { document.querySelectorAll('.toast').forEach(t=>t.remove()); });
    await page.fill('#paste-code-input', code);
    await page.evaluate(() => pasteSignInCode());
    await page.waitForTimeout(700);
    return toastText();
  }
  // seed the nonce/state this device supposedly started
  await page.evaluate(() => { localStorage.setItem('liftTrackerOauthNonce','N1'); localStorage.setItem('liftTrackerOauthState','S1'); });

  let t = await paste('hello world not a code');
  check('garbage code rejected', /does not look like a sign-in code/.test(t), t);
  t = await paste(codeFor(jwt({ iss:'https://accounts.google.com', aud: CLIENT_ID, exp: Math.floor(Date.now()/1000)+3000, nonce:'WRONG' }), 'S1'));
  check('wrong-nonce code rejected', /does not match the sign-in/.test(t), t);
  t = await paste(codeFor(jwt({ iss:'https://accounts.google.com', aud: CLIENT_ID, exp: Math.floor(Date.now()/1000)+3000, nonce:'N1' }), 'OTHER'));
  check('wrong-state code rejected', /does not match the sign-in/.test(t), t);
  t = await paste(codeFor(jwt({ iss:'https://accounts.google.com', aud: CLIENT_ID, exp: Math.floor(Date.now()/1000)-60, nonce:'N1' }), 'S1'));
  check('expired code rejected', /expired/.test(t), t);
  t = await paste(codeFor(jwt({ iss:'https://accounts.google.com', aud:'some-other-client', exp: Math.floor(Date.now()/1000)+3000, nonce:'N1' }), 'S1'));
  check('wrong-audience code rejected', /different app/.test(t), t);
  // correct binding, fake signature -> must get past client checks and be rejected by Firebase itself
  t = await paste(codeFor(tok, 'S1'));
  await page.waitForTimeout(9000);
  t = await toastText();
  check('valid-binding code reaches Firebase (fake sig rejected there)', /Sign in failed/i.test(t) && !/does not match|expired|different app/.test(t), t);

  // --- sign-in button: confirm dialog + OIDC URL params ---
  let oidcUrl = null;
  await ctx.route('https://accounts.google.com/**', route => { oidcUrl = route.request().url(); route.abort(); });
  await page.evaluate(() => { localStorage.removeItem('liftTrackerOauthNonce'); localStorage.removeItem('liftTrackerOauthState'); signInWithGoogle(); });
  await page.waitForTimeout(400);
  const confirmVisible = await page.evaluate(() => document.getElementById('confirm-dialog').classList.contains('open') && document.getElementById('confirm-message').textContent);
  check('sign-in tap shows code instructions first', /sign-in code/.test(confirmVisible || ''), String(confirmVisible).slice(0,90));
  await page.evaluate(() => document.getElementById('confirm-ok-btn').click());
  await page.waitForTimeout(800);
  const u = oidcUrl ? new URL(oidcUrl) : null;
  check('OIDC URL carries state+nonce+auth.html redirect', !!u && !!u.searchParams.get('state') && !!u.searchParams.get('nonce') && (u.searchParams.get('redirect_uri')||'').endsWith('/auth.html'), oidcUrl ? (u.searchParams.get('redirect_uri')||'') : 'no navigation captured');
  // The aborted Google navigation may leave the tab on an error page; go
  // back to the app origin first, where the stored values live.
  await page.goto(BASE + 'index.html', { waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(600);
  const storedMatch = await page.evaluate(() => {
    const s = localStorage.getItem('liftTrackerOauthState'), n = localStorage.getItem('liftTrackerOauthNonce');
    return { s, n };
  }).catch(() => ({}));
  check('stored state/nonce match OIDC URL', !!u && storedMatch.s === u.searchParams.get('state') && storedMatch.n === u.searchParams.get('nonce'));

  console.log('=== ' + name + ' ===');
  results.forEach(r => console.log(r));
  console.log('pageerrors:', errors.slice(0,5));
  await browser.close();
}
