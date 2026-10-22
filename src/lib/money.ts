// Exact decimal math for money. Amounts and prices arrive as decimal strings and are never
// converted to JS numbers: a Decimal is an integer count of 10^-scale units (a bigint), so
// 0.1 + 0.2 is exactly 0.3 and 18-decimal assets do not lose digits.

import type { BalanceItem } from '@/types';

export interface Decimal {
  /** The value is units / 10^scale. */
  readonly units: bigint;
  readonly scale: number;
}

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);

// The API's amount format: digits with an optional dot and more digits, no leading zeros.
const AMOUNT_PATTERN = /^(0|[1-9][0-9]*)(\.[0-9]+)?$/;
// The same with an optional minus sign: activity amounts are signed.
const SIGNED_PATTERN = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;

function pow10(exponent: number): bigint {
  return BigInt('1' + '0'.repeat(exponent));
}

function toDecimal(text: string): Decimal {
  const negative = text.startsWith('-');
  const unsigned = negative ? text.slice(1) : text;
  const dot = unsigned.indexOf('.');
  const scale = dot === -1 ? 0 : unsigned.length - dot - 1;
  const units = BigInt(unsigned.replace('.', ''));
  return { units: negative ? -units : units, scale };
}

/** Parses a decimal string from the API (optionally negative); null if it is malformed. */
export function parseDecimal(text: string): Decimal | null {
  return SIGNED_PATTERN.test(text) ? toDecimal(text) : null;
}

export type ParseAmountError = 'EMPTY' | 'FORMAT' | 'TOO_MANY_DECIMALS';

export type ParseAmountResult =
  | { ok: true; value: Decimal }
  | { ok: false; error: ParseAmountError };

/**
 * Parses an amount typed by the user using the API's rules: digits with an optional dot and
 * more digits, no sign, no leading zeros, at most `decimals` decimal places as written
 * ("0.50" has two). Surrounding whitespace is ignored.
 */
export function parseAmount(input: string, decimals: number): ParseAmountResult {
  const text = input.trim();
  if (text === '') return { ok: false, error: 'EMPTY' };
  if (!AMOUNT_PATTERN.test(text)) return { ok: false, error: 'FORMAT' };
  const value = toDecimal(text);
  if (value.scale > decimals) return { ok: false, error: 'TOO_MANY_DECIMALS' };
  return { ok: true, value };
}

function align(a: Decimal, b: Decimal): { a: bigint; b: bigint; scale: number } {
  const scale = Math.max(a.scale, b.scale);
  return { a: a.units * pow10(scale - a.scale), b: b.units * pow10(scale - b.scale), scale };
}

export function add(a: Decimal, b: Decimal): Decimal {
  const x = align(a, b);
  return { units: x.a + x.b, scale: x.scale };
}

export function subtract(a: Decimal, b: Decimal): Decimal {
  const x = align(a, b);
  return { units: x.a - x.b, scale: x.scale };
}

export function multiply(a: Decimal, b: Decimal): Decimal {
  return { units: a.units * b.units, scale: a.scale + b.scale };
}

export function compare(a: Decimal, b: Decimal): -1 | 0 | 1 {
  const x = align(a, b);
  if (x.a < x.b) return -1;
  return x.a > x.b ? 1 : 0;
}

export function sum(values: readonly Decimal[]): Decimal {
  return values.reduce(add, { units: ZERO, scale: 0 });
}

/** Rounds to `scale` decimal places; ties go away from zero. */
export function roundToScale(value: Decimal, scale: number): Decimal {
  if (value.scale <= scale) return { units: value.units * pow10(scale - value.scale), scale };
  const divisor = pow10(value.scale - scale);
  const negative = value.units < ZERO;
  const abs = negative ? -value.units : value.units;
  let quotient = abs / divisor;
  if ((abs % divisor) * TWO >= divisor) quotient += ONE;
  return { units: negative ? -quotient : quotient, scale };
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Canonical string: no leading zeros, no trailing zeros after the dot, no trailing dot. This is
 * the form to send to the API, so "0.50" and "0.5" produce the same request body.
 */
export function formatDecimal(value: Decimal, group = false): string {
  const negative = value.units < ZERO;
  const abs = negative ? -value.units : value.units;
  const digits = abs.toString().padStart(value.scale + 1, '0');
  const integer = digits.slice(0, digits.length - value.scale);
  const fraction = digits.slice(digits.length - value.scale).replace(/0+$/, '');
  const body = (group ? groupThousands(integer) : integer) + (fraction === '' ? '' : `.${fraction}`);
  return negative ? `-${body}` : body;
}

/** Formats a USD value as "$1,234.57": rounded once, to cents, ties away from zero. */
export function formatUsd(value: Decimal): string {
  const cents = roundToScale(value, 2);
  const negative = cents.units < ZERO;
  const digits = (negative ? -cents.units : cents.units).toString().padStart(3, '0');
  const dollars = groupThousands(digits.slice(0, -2));
  return `${negative ? '-' : ''}$${dollars}.${digits.slice(-2)}`;
}

/** The USD value of `amount` at `usdPrice` (the price of one unit); null if either is malformed. */
export function usdValue(amount: string, usdPrice: string): Decimal | null {
  const parsedAmount = parseDecimal(amount);
  const parsedPrice = parseDecimal(usdPrice);
  return parsedAmount && parsedPrice ? multiply(parsedAmount, parsedPrice) : null;
}

export interface BalanceTotals {
  available: Decimal;
  pending: Decimal;
  claiming: Decimal;
  /** available + pending + claiming. */
  total: Decimal;
}

/**
 * USD totals over all assets, exact and unrounded: round only when displaying. Returns null if any
 * value is malformed, because a total that silently skips an asset would be wrong.
 */
export function balanceTotalsUsd(items: readonly BalanceItem[]): BalanceTotals | null {
  const available: Decimal[] = [];
  const pending: Decimal[] = [];
  const claiming: Decimal[] = [];
  for (const item of items) {
    const a = usdValue(item.available, item.usdPrice);
    const p = usdValue(item.pending, item.usdPrice);
    const c = usdValue(item.claiming, item.usdPrice);
    if (!a || !p || !c) return null;
    available.push(a);
    pending.push(p);
    claiming.push(c);
  }
  const totals = { available: sum(available), pending: sum(pending), claiming: sum(claiming) };
  return { ...totals, total: sum([totals.available, totals.pending, totals.claiming]) };
}

export type ClaimAmountError =
  | ParseAmountError
  | 'BELOW_MIN'
  | 'ABOVE_AVAILABLE'
  | 'RECEIVE_NOT_POSITIVE'
  | 'RULES_UNAVAILABLE';

export type ClaimAmountResult =
  | { ok: true; amount: Decimal; receive: Decimal }
  | { ok: false; error: ClaimAmountError };

export interface ClaimAmountRules {
  /** Max decimal places for the asset. */
  decimals: number;
  minAmount: string;
  available: string;
  fee: string;
}

/**
 * Checks a claim amount against the API rules (format, decimals, minAmount <= amount <= available)
 * and our own: the amount the user receives (amount minus fee) must be positive.
 */
export function validateClaimAmount(input: string, rules: ClaimAmountRules): ClaimAmountResult {
  const parsed = parseAmount(input, rules.decimals);
  if (!parsed.ok) return parsed;

  const min = parseDecimal(rules.minAmount);
  const available = parseDecimal(rules.available);
  const fee = parseDecimal(rules.fee);
  if (!min || !available || !fee) return { ok: false, error: 'RULES_UNAVAILABLE' };

  const amount = parsed.value;
  if (compare(amount, min) < 0) return { ok: false, error: 'BELOW_MIN' };
  if (compare(amount, available) > 0) return { ok: false, error: 'ABOVE_AVAILABLE' };
  const receive = subtract(amount, fee);
  if (receive.units <= ZERO) return { ok: false, error: 'RECEIVE_NOT_POSITIVE' };
  return { ok: true, amount, receive };
}
