// Lightweight pre-deploy checks for a single-file, no-build-step PWA.
// No test framework exists yet — this just catches syntax errors and
// invalid JSON before they ship to GitHub Pages.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const root = path.join(__dirname, '..');
let failed = false;

function checkJson(file) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    console.log(`OK   ${file} is valid JSON`);
  } catch (e) {
    console.error(`FAIL ${file}: ${e.message}`);
    failed = true;
  }
}

function checkJsSyntax(label, code) {
  const tmp = path.join(os.tmpdir(), `check-${Date.now()}-${Math.random().toString(36).slice(2)}.js`);
  fs.writeFileSync(tmp, code);
  try {
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
    console.log(`OK   ${label} has valid JS syntax`);
  } catch (e) {
    console.error(`FAIL ${label}:\n${e.stderr ? e.stderr.toString() : e.message}`);
    failed = true;
  } finally {
    fs.unlinkSync(tmp);
  }
}

function checkInlineScripts(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => m[1])
    .filter(s => s.trim().length > 0);
  if (blocks.length === 0) {
    console.error(`FAIL ${file}: no inline <script> blocks found (expected at least one)`);
    failed = true;
    return;
  }
  blocks.forEach((code, i) => checkJsSyntax(`${file} inline <script> #${i + 1}`, code));
}

function checkExternalRef(htmlFile, assetFile) {
  const html = fs.readFileSync(path.join(root, htmlFile), 'utf8');
  if (!html.includes(assetFile)) {
    console.error(`FAIL ${htmlFile}: does not reference ${assetFile}`);
    failed = true;
    return;
  }
  if (!fs.existsSync(path.join(root, assetFile))) {
    console.error(`FAIL ${htmlFile} references ${assetFile}, but that file doesn't exist`);
    failed = true;
    return;
  }
  console.log(`OK   ${htmlFile} references existing ${assetFile}`);
}

function checkSwCaches(assetFile) {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  if (!sw.includes(assetFile)) {
    console.error(`FAIL sw.js does not precache ${assetFile} — offline users would get a broken shell`);
    failed = true;
    return;
  }
  console.log(`OK   sw.js precaches ${assetFile}`);
}

checkJson('manifest.json');
checkJson('firebase.json');
checkExternalRef('index.html', 'app.js');
checkExternalRef('index.html', 'styles.css');
checkJsSyntax('app.js', fs.readFileSync(path.join(root, 'app.js'), 'utf8'));
checkSwCaches('app.js');
checkSwCaches('styles.css');
checkInlineScripts('auth.html');
checkJsSyntax('sw.js', fs.readFileSync(path.join(root, 'sw.js'), 'utf8'));

if (failed) {
  console.error('\nValidation failed.');
  process.exit(1);
} else {
  console.log('\nAll checks passed.');
}
