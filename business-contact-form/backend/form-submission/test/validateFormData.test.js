const assert = require('assert');
const { validateFormData } = require('../app');

// Test that validateFormData trims whitespace and accepts valid emails with spaces
const data = { name: 'John Doe', email: 'test@example.com ', message: 'Hello' };
const result = validateFormData(data);

assert.strictEqual(result.isValid, true, 'Expected validation to pass');
assert.deepStrictEqual(result.errors, {}, 'Expected no validation errors');
assert.strictEqual(data.email, 'test@example.com', 'Expected email to be trimmed');

console.log('All tests passed');
