import type { BalanceItem } from '@/types';

import {
  add,
  AmountError,
  balanceTotalsUsd,
  compare,
  formatAmountString,
  formatDecimal,
  formatUsd,
  isPositive,
  multiply,
  parseAmount,
  parseDecimal,
  subtract,
  sum,
  usdValue,
  validateClaimAmount,
  type ClaimAmountRules,
  type Decimal,
} from './money';

function dec(text: string): Decimal {
  const value = parseDecimal(text);
  if (!value) throw new Error(`Not a decimal in this test: ${text}`);
  return value;
}

function item(asset: string, available: string, pending: string, claiming: string, usdPrice: string): BalanceItem {
  return { asset, decimals: 6, available, pending, claiming, usdPrice };
}

describe('parseAmount', () => {
  it.each(['0', '0.5', '12', '12.345', '0.000001', '1000000'])('accepts "%s"', (input) => {
    const result = parseAmount(input, 6);
    expect(result.ok).toBe(true);
    if (result.ok) expect(formatDecimal(result.value)).toBe(input);
  });

  it.each(['.5', '1.', '05', '00', '00.5', '1e-3', '-1', '+1', '1,5', '1 000', '1.5.2', 'abc', '0x10', '٣'])(
    'rejects "%s" as FORMAT',
    (input) => {
      expect(parseAmount(input, 6)).toEqual({ ok: false, error: AmountError.Format });
    },
  );

  it.each(['', '   '])('rejects blank input %j as EMPTY', (input) => {
    expect(parseAmount(input, 6)).toEqual({ ok: false, error: AmountError.Empty });
  });

  it('ignores surrounding whitespace', () => {
    const result = parseAmount(' 1.5 ', 6);
    expect(result.ok && formatDecimal(result.value)).toBe('1.5');
  });

  it('allows exactly `decimals` decimal places and no more', () => {
    expect(parseAmount('0.123456', 6).ok).toBe(true);
    expect(parseAmount('0.1234567', 6)).toEqual({ ok: false, error: AmountError.TooManyDecimals });
  });

  it('counts decimal places as written, so trailing zeros do not help', () => {
    expect(parseAmount('0.5000000', 6)).toEqual({ ok: false, error: AmountError.TooManyDecimals });
  });

  it('handles assets without decimals', () => {
    expect(parseAmount('5', 0).ok).toBe(true);
    expect(parseAmount('5.0', 0)).toEqual({ ok: false, error: AmountError.TooManyDecimals });
  });

  it('keeps every digit of an 18-decimal amount beyond Number precision', () => {
    const input = '123456789012345678901234.123456789012345678';
    const result = parseAmount(input, 18);
    expect(result.ok && formatDecimal(result.value)).toBe(input);
  });
});

describe('parseDecimal', () => {
  it.each(['0', '12', '820.413207', '-9.81'])('accepts "%s"', (input) => {
    expect(parseDecimal(input)).not.toBeNull();
  });

  it.each(['', '.5', '1.', '05', '1e3', ' 1', 'NaN', '--1', '+1'])('rejects %j', (input) => {
    expect(parseDecimal(input)).toBeNull();
  });
});

describe('formatDecimal', () => {
  it('writes the canonical form', () => {
    expect(formatDecimal(dec('0.50'))).toBe('0.5');
    expect(formatDecimal(dec('12.000'))).toBe('12');
    expect(formatDecimal(dec('0.0'))).toBe('0');
    expect(formatDecimal(dec('820.413207'))).toBe('820.413207');
    expect(formatDecimal(dec('0.000000000000000001'))).toBe('0.000000000000000001');
  });

  it('keeps the sign and never prints negative zero', () => {
    expect(formatDecimal(dec('-9.81'))).toBe('-9.81');
    expect(formatDecimal(dec('-0'))).toBe('0');
  });

  it('groups thousands on request', () => {
    expect(formatDecimal(dec('1234567.89'), true)).toBe('1,234,567.89');
    expect(formatDecimal(dec('999'), true)).toBe('999');
    expect(formatDecimal(dec('1000'), true)).toBe('1,000');
  });
});

describe('isPositive', () => {
  it('is true only for readable amounts above zero', () => {
    expect(isPositive('0.000001')).toBe(true);
    expect(isPositive('12.365678901234591676')).toBe(true);
    expect(isPositive('0')).toBe(false);
    expect(isPositive('0.0')).toBe(false);
    expect(isPositive('-1')).toBe(false);
    expect(isPositive('abc')).toBe(false);
  });
});

describe('formatAmountString', () => {
  it('shows API amounts in canonical form with grouped thousands', () => {
    expect(formatAmountString('820.413207')).toBe('820.413207');
    expect(formatAmountString('1234567.5')).toBe('1,234,567.5');
    expect(formatAmountString('100.00')).toBe('100');
    expect(formatAmountString('0')).toBe('0');
  });

  it('returns unreadable text unchanged instead of hiding it', () => {
    expect(formatAmountString('abc')).toBe('abc');
  });
});

describe('arithmetic', () => {
  it('adds without floating point error', () => {
    expect(formatDecimal(add(dec('0.1'), dec('0.2')))).toBe('0.3');
    expect(formatDecimal(add(dec('1.5'), dec('0.0012')))).toBe('1.5012');
  });

  it('subtracts to the fee example from the API docs', () => {
    expect(formatDecimal(subtract(dec('0.5'), dec('0.0012')))).toBe('0.4988');
    expect(formatDecimal(subtract(dec('1'), dec('1.5')))).toBe('-0.5');
  });

  it('multiplies an amount by a price exactly', () => {
    expect(formatDecimal(multiply(dec('820.413207'), dec('1.0002')))).toBe('820.5772896414');
    expect(formatDecimal(multiply(dec('0.000000000000000001'), dec('2')))).toBe('0.000000000000000002');
  });

  it('compares numerically, not as text', () => {
    expect(compare(dec('9.5'), dec('10'))).toBe(-1);
    expect(compare(dec('1.0'), dec('1'))).toBe(0);
    expect(compare(dec('2'), dec('1.999999999999999999'))).toBe(1);
  });

  it('sums many values, and nothing to zero', () => {
    expect(formatDecimal(sum([]))).toBe('0');
    expect(formatDecimal(sum([dec('0.1'), dec('0.2'), dec('0.3')]))).toBe('0.6');
    const big = add(dec('123456789012345678901234.123456789012345678'), dec('0.000000000000000002'));
    expect(formatDecimal(big)).toBe('123456789012345678901234.12345678901234568');
  });
});

describe('formatUsd', () => {
  it('rounds to cents, ties away from zero, where binary floats get it wrong', () => {
    expect(formatUsd(dec('2.675'))).toBe('$2.68');
    expect(formatUsd(dec('1.005'))).toBe('$1.01');
    expect(formatUsd(dec('0.005'))).toBe('$0.01');
    expect(formatUsd(dec('0.0049'))).toBe('$0.00');
    expect(formatUsd(dec('-0.005'))).toBe('-$0.01');
  });

  it('always shows two decimals and groups thousands', () => {
    expect(formatUsd(dec('0'))).toBe('$0.00');
    expect(formatUsd(dec('5'))).toBe('$5.00');
    expect(formatUsd(dec('1234567.891'))).toBe('$1,234,567.89');
    expect(formatUsd(dec('820.5772896414'))).toBe('$820.58');
  });

  it('does not show a minus sign for amounts that round to zero', () => {
    expect(formatUsd(dec('-0.0001'))).toBe('$0.00');
  });
});

describe('usdValue', () => {
  it('multiplies amount by price', () => {
    const value = usdValue('50.12', '1.0002');
    expect(value && formatDecimal(value)).toBe('50.130024');
  });

  it('returns null when either input is malformed', () => {
    expect(usdValue('abc', '1')).toBeNull();
    expect(usdValue('1', '')).toBeNull();
  });
});

describe('balanceTotalsUsd', () => {
  it('totals the API docs example', () => {
    const totals = balanceTotalsUsd([item('USDT', '820.413207', '50.12', '0', '1.0002')]);
    expect(totals && formatDecimal(totals.available)).toBe('820.5772896414');
    expect(totals && formatDecimal(totals.pending)).toBe('50.130024');
    expect(totals && formatDecimal(totals.claiming)).toBe('0');
    expect(totals && formatUsd(totals.total)).toBe('$870.71');
  });

  it('keeps full precision across several assets', () => {
    const totals = balanceTotalsUsd([
      item('USDT', '820.413207', '50.12', '0', '1.0002'),
      item('ETH', '0.5', '0.25', '0.1', '2500.5'),
    ]);
    expect(totals && formatDecimal(totals.available)).toBe('2070.8272896414');
    expect(totals && formatDecimal(totals.pending)).toBe('675.255024');
    expect(totals && formatDecimal(totals.claiming)).toBe('250.05');
    expect(totals && formatDecimal(totals.total)).toBe('2996.1323136414');
    expect(totals && formatUsd(totals.total)).toBe('$2,996.13');
  });

  it('rounds once, at the end, not per asset', () => {
    const items = ['A', 'B', 'C'].map((asset) => item(asset, '0.004', '0', '0', '1'));
    expect(items.map((i) => formatUsd(dec(i.available)))).toEqual(['$0.00', '$0.00', '$0.00']);
    const totals = balanceTotalsUsd(items);
    expect(totals && formatUsd(totals.total)).toBe('$0.01');
  });

  it('keeps the total unchanged when a claim moves value from available to claiming', () => {
    const before = balanceTotalsUsd([item('ETH', '1', '0', '0', '2500.5')]);
    const after = balanceTotalsUsd([item('ETH', '0.4', '0', '0.6', '2500.5')]);
    expect(before && after && compare(before.total, after.total)).toBe(0);
  });

  it('is zero for no assets', () => {
    const totals = balanceTotalsUsd([]);
    expect(totals && formatUsd(totals.total)).toBe('$0.00');
  });

  it('returns null instead of a wrong total when any value is malformed', () => {
    expect(balanceTotalsUsd([item('USDT', '1', 'oops', '0', '1')])).toBeNull();
    expect(balanceTotalsUsd([item('USDT', '1', '0', '0', '')])).toBeNull();
  });
});

describe('validateClaimAmount', () => {
  // Numbers from the API docs' ETH example; `available` is made up.
  const rules: ClaimAmountRules = { decimals: 18, minAmount: '0.01', available: '1.5', fee: '0.0012' };

  it('accepts a valid amount and returns amount minus fee', () => {
    const result = validateClaimAmount('0.5', rules);
    expect(result.ok && formatDecimal(result.receive)).toBe('0.4988');
    expect(result.ok && formatDecimal(result.amount)).toBe('0.5');
  });

  it('accepts exactly the minimum and exactly the available balance (Max)', () => {
    const min = validateClaimAmount('0.01', rules);
    expect(min.ok && formatDecimal(min.receive)).toBe('0.0088');
    const max = validateClaimAmount('1.5', rules);
    expect(max.ok && formatDecimal(max.receive)).toBe('1.4988');
  });

  it('rejects below the minimum and above the available balance', () => {
    expect(validateClaimAmount('0.009', rules)).toEqual({ ok: false, error: AmountError.BelowMin });
    expect(validateClaimAmount('1.5000001', rules)).toEqual({ ok: false, error: AmountError.AboveAvailable });
  });

  it('compares numbers, not strings', () => {
    expect(validateClaimAmount('10', { ...rules, available: '9.5' })).toEqual({ ok: false, error: AmountError.AboveAvailable });
    expect(validateClaimAmount('9', { ...rules, minAmount: '10', available: '50' })).toEqual({
      ok: false,
      error: AmountError.BelowMin,
    });
  });

  it('requires a positive amount after the fee', () => {
    const free = { ...rules, minAmount: '0' };
    expect(validateClaimAmount('0.0012', free)).toEqual({ ok: false, error: AmountError.ReceiveNotPositive });
    expect(validateClaimAmount('0.0013', free).ok).toBe(true);
    expect(validateClaimAmount('0', free)).toEqual({ ok: false, error: AmountError.ReceiveNotPositive });
  });

  it('passes parsing errors through', () => {
    expect(validateClaimAmount('', rules)).toEqual({ ok: false, error: AmountError.Empty });
    expect(validateClaimAmount('0,5', rules)).toEqual({ ok: false, error: AmountError.Format });
    expect(validateClaimAmount('0.1234567', { ...rules, decimals: 6 })).toEqual({
      ok: false,
      error: AmountError.TooManyDecimals,
    });
  });

  it('refuses to validate against malformed rules', () => {
    expect(validateClaimAmount('0.5', { ...rules, available: 'abc' })).toEqual({
      ok: false,
      error: AmountError.RulesUnavailable,
    });
  });
});
