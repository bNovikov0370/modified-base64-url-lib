import test from 'node:test';
import assert from 'node:assert/strict';

import { encode, encodeBytes, hex, alphabet } from '../src/index.js';

test('exports the URL-safe alphabet', () => {
  assert.equal(alphabet, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_');
});

test('encodes a known RFC 4648 section 5 vector', () => {
  const bytes = Uint8Array.from([0xfb, 0xff]);
  assert.equal(encode(bytes), '-_8=');
  assert.equal(encode(bytes, { omitPadding: true }), '-_8');
});

test('encodes the RFC 4648 section 10 vector with URL-safe alphabet', () => {
  const bytes = Uint8Array.from([0xfb, 0xf0]);
  assert.equal(encode(bytes), '-_A=');
  assert.equal(encode(bytes, { omitPadding: true }), '-_A');
});

test('pads one and two byte remainders', () => {
  assert.equal(encode(Uint8Array.from([0x66])), 'Zg==');
  assert.equal(encode(Uint8Array.from([0x66, 0x6f])), 'Zm8=');
  assert.equal(encode(Uint8Array.from([0x66, 0x6f, 0x6f])), 'Zm9v');
});

test('omits padding when requested', () => {
  assert.equal(encode(Uint8Array.from([0x66]), { omitPadding: true }), 'Zg');
  assert.equal(encode(Uint8Array.from([0x66, 0x6f]), { omitPadding: true }), 'Zm8');
  assert.equal(encode(Uint8Array.from([0x66, 0x6f, 0x6f]), { omitPadding: true }), 'Zm9v');
});

test('encodes empty input to empty string', () => {
  assert.equal(encode(new Uint8Array(0)), '');
  assert.equal(encode(new Uint8Array(0), { omitPadding: true }), '');
});

test('accepts ArrayBuffer, typed array views, and byte arrays', () => {
  const arrayBuffer = Uint8Array.from([0x66, 0x6f, 0x6f]).buffer;
  assert.equal(encode(arrayBuffer), 'Zm9v');

  const bytes = Uint8Array.from([0x00, 0x01, 0x02, 0x03]);
  const view = new DataView(bytes.buffer, 1, 2);
  assert.equal(encode(view), 'AQI=');

  assert.equal(encode([0x66, 0x6f, 0x6f]), 'Zm9v');
});

test('rejects non-byte array elements', () => {
  assert.throws(() => encode([256]), TypeError);
  assert.throws(() => encode([-1]), TypeError);
  assert.throws(() => encode([1.5]), TypeError);
});

test('encodeBytes returns ASCII bytes and matches encode', () => {
  const input = Uint8Array.from([0xfb, 0xff, 0x00]);
  const expected = encode(input);
  const bytes = encodeBytes(input);
  assert.ok(bytes instanceof Uint8Array);
  assert.equal(bytes.length, expected.length);
  for (let i = 0; i < expected.length; i += 1) {
    assert.equal(bytes[i], expected.charCodeAt(i));
  }
});

test('hex renders lowercase byte values', () => {
  assert.equal(hex(Uint8Array.from([0x00, 0x0f, 0xa0, 0xff])), '000fa0ff');
  assert.equal(hex(new Uint8Array(0)), '');
});

test('does not mutate the input', () => {
  const input = Uint8Array.from([0xfb, 0xff, 0x00]);
  const before = Array.from(input);
  encode(input);
  assert.deepEqual(Array.from(input), before);
});
