const assert = require('assert');
const { textToVector } = require('../utils/qdrantClient');

const vec1 = textToVector('hello');
const vec2 = textToVector('hello');

assert.ok(Array.isArray(vec1), 'vector should be array');
assert.strictEqual(vec1.length, 32, 'vector length');
assert.deepStrictEqual(vec1, vec2, 'vectors should be deterministic');
assert.ok(vec1.every(n => n >= 0 && n <= 1), 'values in range');

console.log('Qdrant vector test passed');
