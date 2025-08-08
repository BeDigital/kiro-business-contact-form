const assert = require('assert');
const { validateFormData } = require('../app');

// Test that validateFormData trims whitespace and accepts valid emails with spaces
const data = { name: 'John Doe', email: 'test@example.com ', message: 'Hello' };
const result = validateFormData(data);

assert.strictEqual(result.isValid, true, 'Expected validation to pass');
assert.deepStrictEqual(result.errors, {}, 'Expected no validation errors');
assert.strictEqual(data.email, 'test@example.com', 'Expected email to be trimmed');

// Test that user input is sanitized
const malicious = {
  name: '<b>Jane</b>',
  email: 'evil@example.com',
  phone: '<script>alert(1)</script>',
  company: 'ACME>',
  message: 'Hello & welcome'
};

validateFormData(malicious);

assert.strictEqual(malicious.name, 'Jane');
assert.strictEqual(malicious.phone, 'alert(1)');
assert.strictEqual(malicious.company, 'ACME&gt;');
assert.strictEqual(malicious.message, 'Hello &amp; welcome');

console.log('All tests passed');
