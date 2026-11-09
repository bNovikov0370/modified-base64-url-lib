# modified-base64-url-lib

Encodes binary data using the URL-safe Base64 alphabet from RFC 4648 Section 5, with optional padding omission.

```js
import { encode, encodeBytes, hex, alphabet } from 'modified-base64-url-lib';

const bytes = Uint8Array.from([0xfb, 0xff]);

encode(bytes);                    // ' -_8=' (without the leading space)
encode(bytes, { omitPadding: true }); // '-_8'
encodeBytes(bytes);               // Uint8Array of ASCII bytes: 0x2d, 0x5f, 0x38, 0x3d
hex(bytes);                       // 'fbff'
alphabet;                         // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
```

## Why this exists

Standard Base64 uses `+` and `/`, which are not URL-safe. RFC 4648 Section 5 replaces them with `-` and `_`. Many URL contexts also dislike `=`, so this library lets you drop it. The trade-off is that unpadded output is shorter and URL-friendlier but cannot be concatenated or decoded without knowing the original length; padding makes the length self-describing. This library defaults to padded output and only omits padding when you explicitly ask.

## Edge cases

- Empty input encodes to an empty string, with or without padding.
- `encode` accepts `Uint8Array`, `ArrayBuffer`, any `ArrayBufferView` (including `DataView`), and plain arrays of byte values. Plain arrays are validated; invalid elements throw `TypeError`.
- `encodeBytes` returns ASCII bytes rather than a string, for callers that need to write into a binary buffer.
- The input is never mutated.
