import { formatAmountString, type ClaimAmountError } from '@/lib/money';

interface AmountErrorContext {
  asset: string;
  decimals: number;
  minAmount: string;
  available: string;
}

/** User-facing text for an amount that failed validation. */
export function describeAmountError(error: ClaimAmountError, ctx: AmountErrorContext): string {
  switch (error) {
    case 'EMPTY':
      return 'Enter an amount.';
    case 'FORMAT':
      return 'Use digits and a dot, for example 0.5. No commas, signs or leading zeros.';
    case 'TOO_MANY_DECIMALS':
      return `${ctx.asset} allows at most ${ctx.decimals} decimal places.`;
    case 'BELOW_MIN':
      return `The minimum is ${formatAmountString(ctx.minAmount)} ${ctx.asset}.`;
    case 'ABOVE_AVAILABLE':
      return `You can claim at most ${formatAmountString(ctx.available)} ${ctx.asset}.`;
    case 'RECEIVE_NOT_POSITIVE':
      return 'The amount must be larger than the fee.';
    case 'RULES_UNAVAILABLE':
      return "Can't read the claim limits right now. Try again.";
  }
}
