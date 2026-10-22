import { newIdempotencyKey } from './uuid';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('newIdempotencyKey', () => {
  it('returns a UUID v4 within the API length limit, different each time', () => {
    const a = newIdempotencyKey();
    const b = newIdempotencyKey();
    expect(a).toMatch(UUID_V4);
    expect(a.length).toBeLessThanOrEqual(100);
    expect(a).not.toBe(b);
  });

  it('still works where crypto.randomUUID is missing (insecure context)', () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { getRandomValues: original.getRandomValues.bind(original) },
    });
    try {
      expect(newIdempotencyKey()).toMatch(UUID_V4);
    } finally {
      Object.defineProperty(globalThis, 'crypto', { configurable: true, value: original });
    }
  });

  it('works even without any crypto object', () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined });
    try {
      expect(newIdempotencyKey()).toMatch(UUID_V4);
    } finally {
      Object.defineProperty(globalThis, 'crypto', { configurable: true, value: original });
    }
  });
});
