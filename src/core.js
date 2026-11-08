const URL_SAFE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const HEX = '0123456789abcdef';

function hexByte(byte) {
  return HEX[(byte >> 4) & 0x0f] + HEX[byte & 0x0f];
}

function bytesFromUint8Array(value) {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (Array.isArray(value)) {
    const out = new Uint8Array(value.length);
    for (let i = 0; i < value.length; i += 1) {
      const byte = value[i];
      if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
        throw new TypeError(`array element at index ${i} is not a byte`);
      }
      out[i] = byte;
    }
    return out;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }

  throw new TypeError('data must be a Uint8Array, ArrayBuffer, ArrayBufferView, or array of bytes');
}

function encodeToArray(bytes, omitPadding) {
  const out = [];
  let i = 0;

  while (i + 2 < bytes.length) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out.push(URL_SAFE_ALPHABET[(chunk >> 18) & 0x3f]);
    out.push(URL_SAFE_ALPHABET[(chunk >> 12) & 0x3f]);
    out.push(URL_SAFE_ALPHABET[(chunk >> 6) & 0x3f]);
    out.push(URL_SAFE_ALPHABET[chunk & 0x3f]);
    i += 3;
  }

  const remaining = bytes.length - i;
  if (remaining === 1) {
    const chunk = bytes[i] << 16;
    out.push(URL_SAFE_ALPHABET[(chunk >> 18) & 0x3f]);
    out.push(URL_SAFE_ALPHABET[(chunk >> 12) & 0x3f]);
    if (!omitPadding) {
      out.push('=');
      out.push('=');
    }
  } else if (remaining === 2) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out.push(URL_SAFE_ALPHABET[(chunk >> 18) & 0x3f]);
    out.push(URL_SAFE_ALPHABET[(chunk >> 12) & 0x3f]);
    out.push(URL_SAFE_ALPHABET[(chunk >> 6) & 0x3f]);
    if (!omitPadding) {
      out.push('=');
    }
  }

  return out;
}

export function encode(data, options = {}) {
  const bytes = bytesFromUint8Array(data);
  const omitPadding = options && options.omitPadding === true;
  return encodeToArray(bytes, omitPadding).join('');
}

export function encodeBytes(data, options = {}) {
  const bytes = bytesFromUint8Array(data);
  const omitPadding = options && options.omitPadding === true;
  const chars = encodeToArray(bytes, omitPadding);
  const out = new Uint8Array(chars.length);
  for (let i = 0; i < chars.length; i += 1) {
    out[i] = chars[i].charCodeAt(0);
  }
  return out;
}

export function hex(data) {
  const bytes = bytesFromUint8Array(data);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += hexByte(bytes[i]);
  }
  return out;
}

export const alphabet = URL_SAFE_ALPHABET;
