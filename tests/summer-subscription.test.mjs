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
const thankyouHtml = readFileSync(join(root, 'thankyou.html'), 'utf8');
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

test('homepage promotes the subscription and routes free Sisi through registration', () => {
  assertIncludes(homepageHtml, 'href="summer-subscription.html"');
  assertIncludes(homepageHtml, 'מנוי קיץ לילדים');
  assertIncludes(homepageHtml, 'נסו 3 שיעורי חשיבה ותכנות בחינם');
  assertIncludes(homepageHtml, 'חשיבה ותכנות לילדים עם סיסי הוא קורס משחקי לילדים צעירים');
  assertIncludes(homepageHtml, 'href="sisi.html"');
  assertNotIncludes(homepageHtml, 'href="register.html">נסו 3 שיעורי חשיבה ותכנות בחינם');
  assertNotIncludes(homepageHtml, 'href="space.html"');
  assertNotIncludes(homepageHtml, 'מפת הלמידה');
});

test('subscription page routes to real registration and keeps marketing copy clean', () => {
  assertIncludes(subscriptionHtml, '<title>מנוי לומדות קיץ לילדים | hai.tech</title>');
  assertIncludes(subscriptionHtml, '49 ₪');
  assertIncludes(subscriptionHtml, 'href="register.html"');
  assertIncludes(subscriptionHtml, 'הרשמה');
  assertIncludes(subscriptionHtml, 'להירשם ולהתחיל בחינם');
  assertIncludes(subscriptionHtml, 'הפעלת מנוי');
  assertNotIncludes(subscriptionHtml, 'הפעלת מנוי ב־Morning');
  assertIncludes(subscriptionHtml, 'מה עושים עכשיו?');
  assertIncludes(subscriptionHtml, 'נרשמים כהורה ומוסיפים ילד/ה');
  assertIncludes(subscriptionHtml, 'גישה מלאה לסיסי, סנסי, Python, Web, משחקים ו־Minecraft');
  assertIncludes(subscriptionHtml, 'כל לומדה חדשה שתיפתח במהלך הקיץ תיכלל במנוי');
  assertIncludes(subscriptionHtml, 'מתחילים עם 3 שיעורי חשיבה ותכנות בחינם');
  assertIncludes(subscriptionHtml, 'חשיבה ותכנות לילדים עם סיסי');
  assertNotIncludes(subscriptionHtml, 'נסו את סיסי שיעור 1 בחינם');
  assertIncludes(subscriptionHtml, 'אפשר לבטל בכל עת בהודעת WhatsApp או מייל אלינו');
  assertNotIncludes(subscriptionHtml, 'href="space.html"');
  assertNotIncludes(subscriptionHtml, 'summer-account.html');
  assertNotIncludes(subscriptionHtml, 'webhook');
});

test('registration, login, and account pages are separate product screens', () => {
  assertIncludes(registerHtml, '<title>הרשמה ללומדות hai.tech</title>');
  assertIncludes(registerHtml, 'id="register-form"');
  assertIncludes(registerHtml, 'name="confirmPassword"');
  assertIncludes(registerHtml, 'אימות סיסמה');
  assertNotIncludes(registerHtml, 'id="login-form"');
  assertIncludes(registerHtml, 'פותחים חשבון למידה לילדים');
  assertIncludes(registerHtml, 'יאללה, להתחיל ללמוד');
  assertIncludes(registerHtml, 'המערכת שומרת את ההתקדמות');
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
  assertIncludes(accountHtml, 'חשיבה ותכנות · 3 שיעורים בחינם');
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
  assertIncludes(userBadgeJs, 'haiTechSummerToken');
  assertIncludes(userBadgeJs, 'התקדמות נשמרת לילד/ה הזה/ו');
  assertIncludes(userBadgeJs, 'תצוגת הורה');
  assertIncludes(serverJs, 'injectUserBadge');
  assertIncludes(serverJs, 'injectHeadAssets');
  assertIncludes(serverJs, '/favicon.svg');
  assertIncludes(serverJs, '/favicon.ico');
  assertIncludes(serverJs, '/favicon-32.png');
  assertIncludes(serverJs, '/js/user-badge.js');
  assert.ok(existsSync(join(root, 'favicon.ico')), 'Missing favicon.ico');
  assert.ok(existsSync(join(root, 'favicon-32.png')), 'Missing favicon-32.png');
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
  assertIncludes(serverJs, "'/thankyou.html'");
  assertIncludes(serverJs, "'/sisi.html'");
  assertIncludes(serverJs, "pathname === '/thankyou'");
  assertIncludes(serverJs, 'requiresPaidAccess');
  assertIncludes(serverJs, 'isFreeTrialLearningHtml');
  assertIncludes(serverJs, 'lockedPage');
  assertIncludes(serverJs, 'כדי לפתוח את כל הלומדות צריך מנוי פעיל');
  assertIncludes(serverJs, 'גם 3 השיעורים החינמיים בסיסי מתחילים אחרי הרשמה קצרה');
  assertIncludes(serverJs, "'/space.html'");
  assertIncludes(serverJs, "'/space-play.html'");
  assertIncludes(serverJs, "'/music.html'");
  assertIncludes(serverJs, "'/music-play.html'");
  assertIncludes(serverJs, "'/ocean.html'");
  assertIncludes(serverJs, "'/ocean-play.html'");
});

test('subscription page uses a plain payment link and thank-you activation', () => {
  assertIncludes(subscriptionHtml, 'href="https://mrng.to/fZiL2SITRp"');
  assertNotIncludes(subscriptionHtml, 'js-payment-link');
  assertNotIncludes(subscriptionHtml, 'target="_blank"');
  assertNotIncludes(subscriptionHtml, 'summer-subscription.js');
  assertIncludes(configJs, "paymentUrl: 'https://mrng.to/fZiL2SITRp'");
  assertIncludes(behaviorJs, 'HAI_TECH_SUMMER_SUBSCRIPTION');
  assertIncludes(thankyouHtml, '<title>תודה! המנוי הופעל | hai.tech</title>');
  assertIncludes(thankyouHtml, '/api/summer/activate-subscription');
  assertIncludes(thankyouHtml, 'המנוי הופעל בהצלחה');
  assertIncludes(serverJs, "action === 'activate-subscription'");
  assertIncludes(serverJs, "subscription_status = ?");
  assertIncludes(serverJs, "'thankyou_return'");
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
