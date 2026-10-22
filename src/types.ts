// Types for https://task-api.cashmine.io, based on the API docs.

/** Decimal string in the asset's own unit, e.g. "0.0005". Never a JSON number. */
export type DecimalString = string;

/** ISO 8601 timestamp in UTC. */
export type IsoDateString = string;

/** Asset symbol such as "USDT", "ETH" or "BTC". */
export type AssetSymbol = string; // TODO: verify the full list of assets; the docs only show examples

// --- GET /v1/balances ---

export interface BalanceItem {
  asset: AssetSymbol;
  /** Max decimal places allowed for this asset's amounts. */
  decimals: number;
  /** Can be claimed now. */
  available: DecimalString;
  /** Accrued but not yet confirmed; becomes available once confirmed. */
  pending: DecimalString;
  /** Amount in claims that have not completed yet. */
  claiming: DecimalString;
  /** Price of one unit in USD. */
  usdPrice: DecimalString;
}

export interface BalancesResponse {
  /** Time of the snapshot. Snapshots are recomputed every 15 seconds. */
  asOf: IsoDateString;
  items: BalanceItem[];
}

// --- GET /v1/activity ---

export enum ClaimStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export enum AccrualStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
}

export enum ReversalStatus {
  Confirmed = 'confirmed',
}

export enum ActivityType {
  Accrual = 'accrual',
  Reversal = 'reversal',
  Claim = 'claim',
}

interface ActivityBase {
  id: string;
  asset: AssetSymbol;
  /** Signed: negative for reversals and claims. */
  amount: DecimalString; // TODO: verify the exact format of negative amounts (leading "-" only?)
  createdAt: IsoDateString;
}

export interface AccrualActivity extends ActivityBase {
  type: ActivityType.Accrual;
  status: AccrualStatus;
  /** Where the payback came from. */
  exchange: string;
  relatedId: string | null; // TODO: verify; the docs only show null for accruals
}

export interface ReversalActivity extends ActivityBase {
  type: ActivityType.Reversal;
  status: ReversalStatus;
  exchange: string; // TODO: verify; the docs only say exchange is null for claims
  /** Id of the accrual that was taken back. */
  relatedId: string;
}

export interface ClaimActivity extends ActivityBase {
  type: ActivityType.Claim;
  status: ClaimStatus;
  exchange: null;
  /** Claim id for claims created through this API; null for older claims. */
  relatedId: string | null;
}

export type ActivityItem = AccrualActivity | ReversalActivity | ClaimActivity;

export interface ActivityResponse {
  /** Newest first. */
  items: ActivityItem[];
  /** Pass as `cursor` for the next page; null on the last page. */
  nextCursor: string | null;
}

export interface ActivityQuery {
  /** 1 to 20, default 20. */
  limit?: number; // TODO: verify what the server returns for a value outside 1..20
  cursor?: string | null;
}

// --- GET /v1/claim-options ---

export interface Destination {
  id: string;
  label: string;
}

export interface ClaimOptions {
  asset: AssetSymbol;
  minAmount: DecimalString;
  /** Taken from the claimed amount: the user receives amount minus fee. */
  fee: DecimalString; // TODO: verify the fee is flat per claim and does not depend on the amount
  destinations: Destination[]; // TODO: verify this is never empty
}

// --- POST /v1/claims, GET /v1/claims/{id} ---

export interface CreateClaimBody {
  asset: AssetSymbol;
  amount: DecimalString;
  destinationId: string; // TODO: verify it is required when there is only one destination
}

export interface Claim extends CreateClaimBody {
  id: string;
  fee: DecimalString;
  receiveAmount: DecimalString;
  status: ClaimStatus;
  /** Why the claim failed; null unless status is "failed". */
  failureReason: string | null; // TODO: verify: free text or a machine-readable code?
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

/** A claim request that may have reached the server. Replaying the same key and body never creates a second claim. */
export interface ClaimAttempt {
  key: string;
  body: CreateClaimBody;
}

export interface CreateClaimResult {
  claim: Claim;
  /** True when the server returned the original claim for a repeated Idempotency-Key (header `Idempotent-Replayed: true`). */
  replayed: boolean;
}

// --- Errors ---

export enum ApiErrorCode {
  Validation = 'VALIDATION',
  Unauthorized = 'UNAUTHORIZED',
  NotFound = 'NOT_FOUND',
  IdempotencyMismatch = 'IDEMPOTENCY_MISMATCH',
  RateLimited = 'RATE_LIMITED',
  Server = 'SERVER',
  Timeout = 'TIMEOUT',
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    /** Names the invalid field when there is one (VALIDATION). */
    field?: string;
    /** Only on RATE_LIMITED; the Retry-After header carries the same wait in seconds. */
    retryAfterMs?: number;
  };
}
