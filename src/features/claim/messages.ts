import { AmountError, formatAmountString } from '@/lib/money';
import { strings } from '@/strings';

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
      return strings.amountErrors.empty;
    case AmountError.Format:
      return strings.amountErrors.format;
    case AmountError.TooManyDecimals:
      return strings.amountErrors.tooManyDecimals(ctx.asset, ctx.decimals);
    case AmountError.BelowMin:
      return strings.amountErrors.belowMin(`${formatAmountString(ctx.minAmount)} ${ctx.asset}`);
    case AmountError.AboveAvailable:
      return strings.amountErrors.aboveAvailable(`${formatAmountString(ctx.available)} ${ctx.asset}`);
    case AmountError.ReceiveNotPositive:
      return strings.amountErrors.receiveNotPositive;
    case AmountError.RulesUnavailable:
      return strings.amountErrors.rulesUnavailable;
  }
}
