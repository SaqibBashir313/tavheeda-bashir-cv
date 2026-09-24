/**
 * Browser smoke test — zero dependencies, drives headless Chrome over CDP.
 *
 * Why this exists: a clean `tsc`, `eslint` and `vite build` say nothing about
 * whether React can actually render the app. Two real bugs in this codebase
 * were found only by loading the page (a Radix `Slot`/`Slottable` crash, and
 * focus not returning to the trigger when a controlled dialog closed) — both
 * invisible to the type checker and the linter.
 *
 * It deliberately checks the things that are hard to unit-test and easy to
 * break: animation end-states, focus management, theme persistence, exit
 * animations completing, and reduced-motion behaviour.
 *
 * Usage:
 *   npm run build && npm run preview     # in one shell
 *   npm run smoke                        # in another
 *   npm run smoke -- http://localhost:5173   # or point it at the dev server
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.argv[2] ?? 'http://localhost:4173').replace(/\/$/, '');
const PORT = 9412;
const CHROME =
  process.env.CHROME_PATH ??
  ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profile = mkdtempSync(join(tmpdir(), 'smoke-'));

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function devtools(path, method = 'GET') {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}${path}`, { method });
      return await res.json();
    } catch {
      await sleep(250);
    }
  }
  throw new Error('Chrome did not expose a devtools endpoint. Set CHROME_PATH?');
}

const openSocket = (url) =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener('open', () => resolve(socket));
    socket.addEventListener('error', reject);
  });

class Session {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.errors = [];
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== undefined) {
        this.pending.get(message.id)?.(message);
        this.pending.delete(message.id);
        return;
      }
      if (message.method === 'Runtime.exceptionThrown') {
        this.errors.push(message.params.exceptionDetails.text);
      } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        this.errors.push(
          message.params.args
            .map((arg) => arg.value ?? arg.description ?? arg.type)
            .join(' ')
            .slice(0, 300),
        );
      }
    });
  }

  send(method, params = {}) {
    const id = (this.nextId += 1);
    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    const details = response.result?.exceptionDetails;
    if (details)
      return { evalError: details.exception?.description?.slice(0, 200) ?? details.text };
    return response.result?.result?.value;
  }

  json(expression) {
    return this.evaluate(`JSON.stringify(${expression})`).then((value) =>
      typeof value === 'string' ? JSON.parse(value) : value,
    );
  }

  press(key, code, keyCode) {
    return this.send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key,
      code,
      windowsVirtualKeyCode: keyCode,
    }).then(() =>
      this.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key,
        code,
        windowsVirtualKeyCode: keyCode,
      }),
    );
  }

  movePointer(x, y) {
    return this.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
      buttons: 0,
      pointerType: 'mouse',
    });
  }

  /** A real click: unlike `element.click()`, this also moves focus. */
  async click(x, y) {
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await this.send('Input.dispatchMouseEvent', {
        type,
        x,
        y,
        button: 'left',
        buttons: type === 'mousePressed' ? 1 : 0,
        clickCount: 1,
        pointerType: 'mouse',
      });
      await sleep(60);
    }
  }

  /** Scrolls an element into view (instantly) and returns its centre point. */
  async centreOf(selectorExpression) {
    await this.evaluate(
      `(${selectorExpression})?.scrollIntoView({ block: 'center', behavior: 'instant' })`,
    );
    await sleep(700);
    return this.json(`(() => {
      const el = ${selectorExpression};
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    })()`);
  }
}

/**
 * Text-bearing, laid-out, non-decorative elements that ended up invisible.
 * This is what a reveal animation leaves behind when its reduced-motion or
 * cleanup path is wrong — the highest-value single assertion in the suite.
 */
const INVISIBLE_SCAN = `(() => {
  const bad = [];
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,li,span,a,button,dd,dt')) {
    if (el.closest('[aria-hidden="true"]')) continue;
    if (el.matches('.sr-only') || el.closest('.sr-only')) continue;
    const text = (el.textContent ?? '').trim();
    if (!text) continue;
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') continue;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || Number(style.opacity) < 0.01) {
      bad.push({ tag: el.tagName.toLowerCase(), opacity: style.opacity, text: text.slice(0, 60) });
    }
  }
  const seen = new Set();
  return bad.filter((b) => !seen.has(b.text) && seen.add(b.text)).slice(0, 12);
})()`;

const results = [];
const check = (name, passed, detail) => {
  results.push({ name, passed, detail });
  process.stdout.write(`${passed ? '  ✓' : '  ✗'} ${name}\n`);
  if (!passed && detail !== undefined) {
    process.stdout.write(`      ${JSON.stringify(detail)}\n`);
  }
};

async function main() {
  await devtools('/json/version');
  const target = await devtools(`/json/new?${encodeURIComponent('about:blank')}`, 'PUT');
  const page = new Session(await openSocket(target.webSocketDebuggerUrl));

  await page.send('Runtime.enable');
  await page.send('Page.enable');

  const goto = async (path, { reducedMotion = false, width = 1440, height = 900 } = {}) => {
    await page.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 700,
    });
    await page.send('Emulation.setEmulatedMedia', {
      features: reducedMotion ? [{ name: 'prefers-reduced-motion', value: 'reduce' }] : [],
    });
    await page.send('Page.navigate', { url: `${BASE}${path}` });
    await sleep(3800);
  };

  /* ── rendering ─────────────────────────────────────────────────────────── */
  process.stdout.write('\nrendering\n');
  await goto('/');
  const home = await page.json(`{
    root: document.getElementById('root')?.children.length ?? -1,
    header: !!document.querySelector('header'),
    footer: !!document.querySelector('footer'),
    splitUnits: document.querySelectorAll('[data-split]').length,
    masks: document.querySelectorAll('[data-split-mask]').length,
    textLength: document.body.innerText.length,
    hasName: document.body.innerText.includes('Tavheeda Bashir Bara'),
    hasEmail: document.body.innerText.includes('tavheeda@gmail.com'),
  }`);
  check(
    'home renders shell, split text and content',
    home.root === 1 &&
      home.header &&
      home.footer &&
      home.splitUnits > 0 &&
      home.textLength > 800 &&
      home.hasName &&
      home.hasEmail,
    home,
  );

  const invisible = await page.evaluate(INVISIBLE_SCAN);
  check('no content left invisible after reveals settle', invisible.length === 0, invisible);

  /* ── theming ───────────────────────────────────────────────────────────── */
  process.stdout.write('\ntheming\n');
  await page.evaluate(`document.querySelector('input[name="theme-mode"][value="dark"]').click()`);
  await sleep(600);
  const theme = await page.json(`{
    darkClass: document.documentElement.classList.contains('dark'),
    colorScheme: document.documentElement.style.colorScheme,
    stored: localStorage.getItem('tb-theme'),
  }`);
  let envelopeMatches = false;
  try {
    envelopeMatches = JSON.parse(theme.stored)?.state?.mode === 'dark';
  } catch {
    /* handled by the assertion */
  }
  check(
    'dark mode applies class + color-scheme',
    theme.darkClass && theme.colorScheme === 'dark',
    theme,
  );
  check(
    'persisted envelope matches the index.html bootstrap contract',
    envelopeMatches,
    theme.stored,
  );

  await page.send('Page.reload', { ignoreCache: false });
  await sleep(2500);
  check(
    'theme survives reload',
    (await page.evaluate(`document.documentElement.classList.contains('dark')`)) === true,
  );
  await page.evaluate(`document.querySelector('input[name="theme-mode"][value="system"]').click()`);
  await sleep(400);

  /* ── experience page: roles, dialog, tooltip, carousel ────────────────── */
  process.stdout.write('\nexperience\n');
  await goto('/experience');
  const experience = await page.json(`{
    roles: document.querySelectorAll('h3').length,
    slides: document.querySelectorAll('.swiper-slide').length,
    hasCommdex: document.body.innerText.includes('Commdex'),
    hasIQuasar: document.body.innerText.includes('IQuasar, LLC'),
    hasVehicle: document.body.innerText.includes('NASA SEWP VI'),
  }`);
  check(
    'experience page renders roles and contract vehicles from the CV data',
    experience.slides === 10 &&
      experience.hasCommdex &&
      experience.hasIQuasar &&
      experience.hasVehicle,
    experience,
  );

  /* dialog: opens from a role card, traps focus, returns it on close */
  const roleTrigger = await page.centreOf(
    `[...document.querySelectorAll('button')].find((b) => b.textContent.includes('further responsibilit'))`,
  );
  await page.click(roleTrigger.x, roleTrigger.y);
  await sleep(900);
  const open = await page.json(`{
    open: !!document.querySelector('[role=dialog]'),
    focusInside: !!document.querySelector('[role=dialog]')?.contains(document.activeElement),
    labelled: !!document.querySelector('[role=dialog]')?.getAttribute('aria-labelledby'),
  }`);
  check(
    'dialog opens, labelled, focus trapped inside',
    open.open && open.focusInside && open.labelled,
    open,
  );

  await page.press('Escape', 'Escape', 27);
  await sleep(900);
  const closed = await page.json(`{
    open: !!document.querySelector('[role=dialog]'),
    onTrigger: document.activeElement?.textContent?.includes('further responsibilit') ?? false,
  }`);
  check(
    'dialog exit animation completes and focus returns to the trigger',
    closed.open === false && closed.onTrigger,
    closed,
  );

  /* tooltip on a contract-vehicle card */
  const tip = await page.centreOf(
    `document.querySelector('.swiper-slide [data-slot], .swiper-slide > *')`,
  );
  await page.movePointer(tip.x, tip.y);
  await sleep(140);
  await page.movePointer(tip.x + 2, tip.y + 1);
  await sleep(1100);
  const tooltip = await page.json(`{
    present: !!document.querySelector('[role=tooltip]'),
    opacity: document.querySelector('[role=tooltip]') ? getComputedStyle(document.querySelector('[role=tooltip]')).opacity : null,
  }`);
  check(
    'tooltip opens on hover and is visible',
    tooltip.present && Number(tooltip.opacity) > 0.5,
    tooltip,
  );

  for (let i = 0; i < 8; i += 1) {
    await page.movePointer(tip.x + 320 + i * 7, tip.y + 240 + i * 5);
    await sleep(170);
  }
  check(
    'tooltip exit animation completes and the node unmounts',
    (await page.evaluate(`document.querySelectorAll('[role=tooltip]').length`)) === 0,
  );

  /* ── toasts, driven by the contact form's validation path ──────────────── */
  process.stdout.write('\ntoasts\n');
  await goto('/contact');
  await page.evaluate(`(() => {
    const form = document.querySelector('form');
    form.querySelector('[name=name]').focus();
  })()`);
  const submit = await page.centreOf(
    `[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Send message')`,
  );
  await page.click(submit.x, submit.y);
  await sleep(600);
  const validation = await page.json(`{
    alerts: document.querySelectorAll('form [role=alert]').length,
    invalid: document.querySelectorAll('form [aria-invalid="true"]').length,
    focused: document.activeElement?.getAttribute('name'),
  }`);
  check(
    'empty submit blocks, shows field errors and focuses the first offender',
    validation.alerts === 3 && validation.invalid === 3 && validation.focused === 'name',
    validation,
  );

  /* ── navigation ────────────────────────────────────────────────────────── */
  process.stdout.write('\nnavigation\n');
  await goto('/');
  await page.evaluate(
    `[...document.querySelectorAll('nav a')].find((a) => a.textContent.trim() === 'Experience').click()`,
  );
  await sleep(3500);
  const navigated = await page.json(`{
    path: location.pathname,
    slides: document.querySelectorAll('.swiper-slide').length,
    opacity: getComputedStyle(document.querySelector('main > div')).opacity,
  }`);
  check(
    'route transition completes, lazy chunk mounts, page fully opaque',
    navigated.path === '/experience' && navigated.slides === 10 && Number(navigated.opacity) > 0.99,
    navigated,
  );
  check(
    'experience leaves no content invisible',
    (await page.evaluate(INVISIBLE_SCAN)).length === 0,
  );

  /* ── reduced motion ────────────────────────────────────────────────────── */
  process.stdout.write('\nreduced motion\n');
  for (const path of ['/', '/experience', '/contact']) {
    await goto(path, { reducedMotion: true });
    const stuck = await page.evaluate(INVISIBLE_SCAN);
    const length = await page.evaluate(`document.body.innerText.length`);
    check(
      `${path} keeps all content visible with reduced motion`,
      stuck.length === 0 && length > 300,
      {
        stuck,
        length,
      },
    );
  }

  /* ── mobile ────────────────────────────────────────────────────────────── */
  process.stdout.write('\nmobile\n');
  await goto('/experience', { width: 390, height: 844 });
  const rail = await page.json(`(() => {
    const track = document.querySelector('[aria-label="Horizontally scrolling gallery"] [data-track]');
    if (!track) return { found: false };
    return {
      found: true,
      overflowX: getComputedStyle(track).overflowX,
      scrollable: track.scrollWidth > track.clientWidth + 10,
    };
  })()`);
  check(
    'pinned rail degrades to native horizontal scroll on touch widths',
    rail.found && rail.overflowX === 'auto' && rail.scrollable,
    rail,
  );

  await page.evaluate(`document.querySelector('button[aria-controls="mobile-nav"]').click()`);
  await sleep(1000);
  const drawer = await page.json(`{
    open: !!document.getElementById('mobile-nav'),
    focusInside: !!document.getElementById('mobile-nav')?.contains(document.activeElement),
    navLinks: [...(document.getElementById('mobile-nav')?.querySelectorAll('nav > div ul a') ?? [])].length,
  }`);
  check(
    'mobile drawer opens with focus trapped',
    drawer.open && drawer.focusInside && drawer.navLinks === 3,
    drawer,
  );

  /* ── report ────────────────────────────────────────────────────────────── */
  const runtimeErrors = [...new Set(page.errors)];
  check(
    'no uncaught exceptions or console errors during the run',
    runtimeErrors.length === 0,
    runtimeErrors,
  );

  const failed = results.filter((r) => !r.passed);
  process.stdout.write(
    `\n${results.length - failed.length}/${results.length} checks passed\n${failed.length ? '\nFAILED:\n' + failed.map((f) => `  - ${f.name}`).join('\n') + '\n' : ''}`,
  );
  return failed.length;
}

let exitCode = 1;
try {
  exitCode = (await main()) > 0 ? 1 : 0;
} catch (error) {
  process.stderr.write(`\nsmoke test crashed: ${String(error)}\n`);
} finally {
  chrome.kill();
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  } catch {
    /* Chrome may still be flushing its profile; the OS will reap /tmp */
  }
}
process.exit(exitCode);
