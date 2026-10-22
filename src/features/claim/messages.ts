import { AmountError, formatAmountString } from '@/lib/money';

interface AmountErrorContext {
  asset: string;
  decimals: number;
  minAmount: string;
  available: string;
}

/** User-facing text for an amount that failed validation. */
export function describeAmountError(error: AmountError, ctx: AmountErrorContext): string {
  switch (error) {
    case AmountError.Empty:
      return 'Enter an amount.';
    case AmountError.Format:
      return 'Use digits and a dot, for example 0.5. No commas, signs or leading zeros.';
    case AmountError.TooManyDecimals:
      return `${ctx.asset} allows at most ${ctx.decimals} decimal places.`;
    case AmountError.BelowMin:
      return `The minimum is ${formatAmountString(ctx.minAmount)} ${ctx.asset}.`;
    case AmountError.AboveAvailable:
      return `You can claim at most ${formatAmountString(ctx.available)} ${ctx.asset}.`;
    case AmountError.ReceiveNotPositive:
      return 'The amount must be larger than the fee.';
    case AmountError.RulesUnavailable:
      return "Can't read the claim limits right now. Try again.";
  }
}
