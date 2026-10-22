import { formatAge } from './time';

describe('formatAge', () => {
  it('says "just now" under 5 seconds', () => {
    expect(formatAge(0)).toBe('just now');
    expect(formatAge(4999)).toBe('just now');
  });

  it('counts seconds, minutes and hours', () => {
    expect(formatAge(5000)).toBe('5 s ago');
    expect(formatAge(59_999)).toBe('59 s ago');
    expect(formatAge(60_000)).toBe('1 min ago');
    expect(formatAge(59 * 60_000 + 59_000)).toBe('59 min ago');
    expect(formatAge(2 * 3_600_000)).toBe('2 h ago');
  });

  it('treats a negative age (device clock behind the server) as just now', () => {
    expect(formatAge(-30_000)).toBe('just now');
  });
});
