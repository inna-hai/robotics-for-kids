import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../js/classroom-platform.js', import.meta.url), 'utf8');
const adminSource = readFileSync(new URL('../js/classroom-admin.js', import.meta.url), 'utf8');

assert.equal((source.match(/await loadClasses\(\)/g) || []).length, 2,
  'teacher mutations must refresh only through the guarded refresh helper');
assert.equal((adminSource.match(/await loadTeachers\(\)/g) || []).length, 1,
  'administrator teacher mutations must refresh through the guarded helper');
assert.ok(adminSource.includes('await loadInvitations()'), 'invitation mutations must use a guarded refresh');
assert.ok(!readFileSync(new URL('../classroom-admin.html', import.meta.url), 'utf8').includes('name="password"'),
  'administrator teacher-create UI must not send a password field');

assert.ok(source.includes('students-table'), 'teacher student roster should render as a read-only table');
assert.ok(source.includes('שם משתמש Minecraft'), 'teacher roster should label the Minecraft account column clearly');
assert.ok(!source.includes('reset-student-code'), 'teacher roster must not expose password/code reset buttons');
assert.ok(!source.includes('archive-student'), 'teacher roster must not expose archive buttons');
assert.ok(!source.includes('add-student-form'), 'teacher roster must not expose add-student controls');
assert.ok(!source.includes('student-edit-form'), 'teacher roster must not expose inline edit controls');

assert.ok((adminSource.match(/oneTimeCredential\.textContent = ''/g) || []).length >= 2,
  'administrator UI must clear stale one-time credentials before another create attempt and on logout');

console.log('✓ teacher classroom roster is read-only while administrator credential handling stays guarded');
