import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const homepageHtml = readFileSync(join(root, 'index.html'), 'utf8');
const subscriptionHtml = readFileSync(join(root, 'summer-subscription.html'), 'utf8');
const registerHtml = readFileSync(join(root, 'register.html'), 'utf8');
const loginHtml = readFileSync(join(root, 'login.html'), 'utf8');
const accountHtml = readFileSync(join(root, 'account.html'), 'utf8');
const legacyAccountHtml = readFileSync(join(root, 'summer-account.html'), 'utf8');
const configJs = readFileSync(join(root, 'js', 'summer-subscription-config.js'), 'utf8');
const behaviorJs = readFileSync(join(root, 'js', 'summer-subscription.js'), 'utf8');
const accountJs = readFileSync(join(root, 'js', 'summer-account.js'), 'utf8');
const userBadgeJs = readFileSync(join(root, 'js', 'user-badge.js'), 'utf8');
const serverJs = readFileSync(join(root, 'server.js'), 'utf8');
const faviconSvg = readFileSync(join(root, 'favicon.svg'), 'utf8');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }
function assertNotIncludes(source, needle, message = `Unexpected: ${needle}`) { assert.ok(!source.includes(needle), message); }

test('homepage promotes the subscription and shows the one free Sisi lesson', () => {
  assertIncludes(homepageHtml, 'href="summer-subscription.html"');
  assertIncludes(homepageHtml, 'מנוי קיץ לילדים');
  assertIncludes(homepageHtml, 'נסו את סיסי בחינם');
  assertIncludes(homepageHtml, 'סיסי היא סדרת משחקי חשיבה לילדים');
  assertIncludes(homepageHtml, 'href="space.html"');
  assertIncludes(homepageHtml, 'פתוח: שיעור 1 · השאר נעול');
});

test('subscription page routes to real registration and keeps marketing copy clean', () => {
  assertIncludes(subscriptionHtml, '<title>מנוי לומדות קיץ לילדים | hai.tech</title>');
  assertIncludes(subscriptionHtml, '49 ₪');
  assertIncludes(subscriptionHtml, 'href="register.html"');
  assertIncludes(subscriptionHtml, 'הרשמה');
  assertIncludes(subscriptionHtml, 'מתחילים עם סיסי בחינם');
  assertIncludes(subscriptionHtml, 'נסו את סיסי בחינם');
  assertNotIncludes(subscriptionHtml, 'נסו את סיסי שיעור 1 בחינם');
  assertIncludes(subscriptionHtml, 'אפשר לבטל בכל עת בהודעת WhatsApp או מייל אלינו');
  assertIncludes(subscriptionHtml, 'space.html');
  assertNotIncludes(subscriptionHtml, 'summer-account.html');
  assertNotIncludes(subscriptionHtml, 'webhook');
});

test('registration, login, and account pages are separate product screens', () => {
  assertIncludes(registerHtml, '<title>הרשמה ללומדות hai.tech</title>');
  assertIncludes(registerHtml, 'id="register-form"');
  assertIncludes(registerHtml, 'name="confirmPassword"');
  assertIncludes(registerHtml, 'אימות סיסמה');
  assertNotIncludes(registerHtml, 'id="login-form"');
  assertIncludes(registerHtml, 'כדי להתחיל ללמוד צריך להירשם');
  assertIncludes(registerHtml, 'להירשם ולהתחיל ללמוד');
  assertIncludes(registerHtml, 'השיעור הראשון בסדרת סיסי');
  assertIncludes(registerHtml, 'login.html');

  assertIncludes(loginHtml, '<title>כניסה ללומדות hai.tech</title>');
  assertIncludes(loginHtml, 'id="login-form"');
  assertNotIncludes(loginHtml, 'id="register-form"');
  assertIncludes(loginHtml, 'ברוכים השבים');
  assertIncludes(loginHtml, 'account.html');
  assertIncludes(loginHtml, 'מעבר לאזור שלי');
  assertIncludes(loginHtml, 'register.html');

  assertIncludes(accountHtml, '<title>האזור שלי | hai.tech</title>');
  assertIncludes(accountHtml, 'נרשמים כדי להתחיל ללמוד');
  assertIncludes(accountHtml, 'הרשמה חדשה');
  assertIncludes(accountHtml, 'כניסה לחשבון קיים');
  assertIncludes(accountHtml, 'סיסי · שיעור 1');
  assertNotIncludes(accountHtml, 'Morning');
  assertNotIncludes(accountHtml, 'webhook');
});

test('legacy summer account URL redirects to the product account page', () => {
  assertIncludes(legacyAccountHtml, 'url=account.html');
  assertIncludes(legacyAccountHtml, "location.replace('account.html')");
});

test('summer auth client and server expose account endpoints and protected pages', () => {
  assertIncludes(accountJs, '/api/summer/register');
  assertIncludes(accountJs, 'payload.password !== payload.confirmPassword');
  assertIncludes(accountJs, 'הסיסמאות לא תואמות');
  assertIncludes(accountJs, '/api/summer/login');
  assertIncludes(accountJs, '/api/summer/me');
  assertIncludes(accountJs, '/api/summer/logout');
  assertIncludes(accountJs, '/api/summer/dashboard');
  assertIncludes(accountJs, "location.href = 'account.html'");
  assertIncludes(accountJs, "!location.pathname.endsWith('/account.html')");
  assertIncludes(accountHtml, 'מה הילדים עשו?');
  assertIncludes(serverJs, "action === 'dashboard'");
  assertIncludes(serverJs, "profile.kind !== 'child'");
  assertIncludes(serverJs, 'תצוגת הורה בלבד');
  assertIncludes(accountJs, 'haiTechSummerToken');
  assertIncludes(userBadgeJs, 'התקדמות נשמרת לילד/ה הזה/ו');
  assertIncludes(userBadgeJs, 'תצוגת הורה');
  assertIncludes(serverJs, 'injectUserBadge');
  assertIncludes(serverJs, 'injectHeadAssets');
  assertIncludes(serverJs, '/favicon.svg');
  assertIncludes(serverJs, '/js/user-badge.js');
  assertIncludes(faviconSvg, '<svg');
  assertIncludes(faviconSvg, 'hai.tech robotics favicon');
  assertIncludes(serverJs, 'better-sqlite3');
  assertIncludes(serverJs, 'SUMMER_DB_FILE');
  assertIncludes(serverJs, 'summer_users');
  assertIncludes(serverJs, 'summer_sessions');
  assertIncludes(serverJs, 'summer_subscription_events');
  assertIncludes(serverJs, 'PUBLIC_HTML_PATHS');
  assertIncludes(serverJs, "'/account.html'");
  assertIncludes(serverJs, "'/register.html'");
  assertIncludes(serverJs, "'/login.html'");
  assertIncludes(serverJs, 'requiresPaidAccess');
  assertIncludes(serverJs, 'lockedPage');
  assertIncludes(serverJs, 'כדי לפתוח את כל הלומדות צריך מנוי פעיל');
  assertIncludes(serverJs, "pathname === '/space.html'");
  assertIncludes(serverJs, "pathname === '/space-play.html'");
});

test('payment config is deliberately empty until Morning link is provided', () => {
  assertIncludes(configJs, "paymentUrl: ''");
  assertIncludes(configJs, 'Morning recurring payment link');
  assertIncludes(behaviorJs, 'HAI_TECH_SUMMER_SUBSCRIPTION');
  assertIncludes(behaviorJs, 'js-payment-link');
});

test('local html/script links point to existing files', () => {
  const refs = [subscriptionHtml, registerHtml, loginHtml, accountHtml]
    .flatMap(html => [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]));

  for (const ref of refs) {
    if (/^(https?:|#)/.test(ref)) continue;
    const clean = ref.replace(/^\.\//, '').split('?')[0].split('#')[0];
    if (!clean || !/\.(html|js|css)$/.test(clean)) continue;
    assert.ok(existsSync(join(root, clean)), `Missing target: ${ref}`);
  }
});

let failed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(error);
  }
}

if (failed) process.exit(1);
