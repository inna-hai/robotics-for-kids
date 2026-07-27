import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const homepageHtml = readFileSync(join(root, 'index.html'), 'utf8');
const subscriptionHtml = readFileSync(join(root, 'summer-subscription.html'), 'utf8');
const configJs = readFileSync(join(root, 'js', 'summer-subscription-config.js'), 'utf8');
const behaviorJs = readFileSync(join(root, 'js', 'summer-subscription.js'), 'utf8');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertIncludes(source, needle, message = `Missing: ${needle}`) { assert.ok(source.includes(needle), message); }

test('homepage promotes the summer subscription without removing the free first lesson', () => {
  assertIncludes(homepageHtml, 'href="summer-subscription.html"');
  assertIncludes(homepageHtml, 'מנוי קיץ לילדים');
  assertIncludes(homepageHtml, 'שיעור ראשון חינם');
  assertIncludes(homepageHtml, 'href="sensi-city.html?lesson=1"');
});

test('summer subscription page has clear offer, cancellation copy, and Morning placeholder', () => {
  assertIncludes(subscriptionHtml, '<title>מנוי לומדות קיץ לילדים | hai.tech</title>');
  assertIncludes(subscriptionHtml, '49 ₪');
  assertIncludes(subscriptionHtml, 'הצטרפות במורנינג');
  assertIncludes(subscriptionHtml, 'data-payment-placeholder="morning-recurring-payment-link"');
  assertIncludes(subscriptionHtml, 'אפשר לבטל בכל עת בהודעת WhatsApp או מייל אלינו');
  assertIncludes(subscriptionHtml, 'sensi-city.html?lesson=1');
  assertIncludes(subscriptionHtml, 'js/summer-subscription-config.js');
  assertIncludes(subscriptionHtml, 'js/summer-subscription.js');
});

test('payment config is deliberately empty until Morning link is provided', () => {
  assertIncludes(configJs, "paymentUrl: ''");
  assertIncludes(configJs, 'Morning recurring payment link');
  assertIncludes(behaviorJs, 'HAI_TECH_SUMMER_SUBSCRIPTION');
  assertIncludes(behaviorJs, 'js-payment-link');
});

test('subscription page local html/script links point to existing files', () => {
  const refs = [
    ...subscriptionHtml.matchAll(/(?:href|src)="([^"]+)"/g),
  ].map((match) => match[1]);

  for (const ref of refs) {
    if (/^(https?:|#)/.test(ref)) continue;
    const clean = ref.replace(/^\.\//, '').split('?')[0].split('#')[0];
    if (!clean || !/\.(html|js)$/.test(clean)) continue;
    assert.ok(existsSync(join(root, clean)), `Missing subscription target: ${ref}`);
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
