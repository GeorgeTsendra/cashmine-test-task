// CashMine task API client. The only module that calls fetch.
// Every /v1 request sends `Authorization: Bearer <token>`. The caller passes the
// token in; this module never stores or logs it.

import { API_ERROR_CODES } from '@/types';
import type {
  ActivityQuery,
  ActivityResponse,
  ApiErrorCode,
  BalancesResponse,
  Claim,
  ClaimOptions,
  CreateClaimBody,
  CreateClaimResult,
} from '@/types';

export const API_BASE_URL = 'https://task-api.cashmine.io';

// Client-side limit for one request, including reading the body.
const REQUEST_TIMEOUT_MS = 15_000; // TODO: verify against real latency; the docs only say requests can be slow

export interface RequestOptions {
  token: string;
  /** Cancels the request, e.g. the `signal` React Query passes to a query function. */
  signal?: AbortSignal;
}

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'parse';

interface ApiErrorInit {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  code?: ApiErrorCode;
  field?: string;
  retryAfterMs?: number;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly code: ApiErrorCode | null;
  readonly field: string | null;
  readonly retryAfterMs: number | null;

  constructor(init: ApiErrorInit) {
    super(init.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'ApiError';
    this.kind = init.kind;
    this.status = init.status ?? null;
    this.code = init.code ?? null;
    this.field = init.field ?? null;
    this.retryAfterMs = init.retryAfterMs ?? null;
  }

  /** True when the server may have processed the request although we got no usable answer. */
  get outcomeUnknown(): boolean {
    switch (this.kind) {
      case 'network':
      case 'timeout':
      case 'parse':
        return true;
      case 'http':
        // The docs say 504 means the outcome is unknown.
        return this.status === 500 || this.status === 503 || this.status === 504; // TODO: verify that 500/503 can also leave a claim created
    }
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && (API_ERROR_CODES as readonly string[]).includes(value);
}

// Error bodies look like { error: { code, message, field?, retryAfterMs? } }, but a proxy in
// front of the API may answer with something else, so every field is checked.
function httpError(status: number, headers: Headers, json: unknown): ApiError {
  const body = isRecord(json) && isRecord(json.error) ? json.error : null;
  let retryAfterMs = body && typeof body.retryAfterMs === 'number' ? body.retryAfterMs : undefined;
  if (retryAfterMs === undefined && headers.has('Retry-After')) {
    const seconds = Number(headers.get('Retry-After'));
    if (Number.isFinite(seconds)) retryAfterMs = seconds * 1000; // TODO: verify Retry-After is always seconds, never an HTTP date
  }
  return new ApiError({
    kind: 'http',
    status,
    code: body && isApiErrorCode(body.code) ? body.code : undefined,
    message: body && typeof body.message === 'string' ? body.message : `HTTP ${status}`,
    field: body && typeof body.field === 'string' ? body.field : undefined,
    retryAfterMs,
  });
}

interface RequestSpec extends RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
}

async function send(spec: RequestSpec): Promise<{ response: Response; text: string }> {
  const { method, path, token, signal, headers, body } = spec;
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abortFromCaller);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store', // balances are snapshots; never serve one from the HTTP cache
      signal: controller.signal,
    });
    return { response, text: await response.text() };
  } catch (error) {
    if (timedOut) throw new ApiError({ kind: 'timeout', message: 'The request timed out' });
    if (signal?.aborted) throw error; // cancelled by the caller, not a failure
    throw new ApiError({ kind: 'network', message: 'Network request failed' });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

// Response shapes are not validated at runtime (no schema library); the types follow the docs.
async function request<T>(spec: RequestSpec): Promise<{ data: T; headers: Headers }> {
  const { response, text } = await send(spec);

  let json: unknown;
  let readable = true;
  try {
    json = text === '' ? undefined : JSON.parse(text);
  } catch {
    readable = false;
  }

  if (!response.ok) throw httpError(response.status, response.headers, readable ? json : undefined);
  if (!readable || json === undefined) {
    throw new ApiError({ kind: 'parse', status: response.status, message: 'Unreadable response' });
  }
  return { data: json as T, headers: response.headers };
}

export async function getBalances({ token, signal }: RequestOptions): Promise<BalancesResponse> {
  const { data } = await request<BalancesResponse>({ method: 'GET', path: '/v1/balances', token, signal });
  return data;
}

export async function getActivity(
  { token, signal }: RequestOptions,
  { limit, cursor }: ActivityQuery = {},
): Promise<ActivityResponse> {
  const query: string[] = [];
  if (limit !== undefined) query.push(`limit=${limit}`);
  if (cursor) query.push(`cursor=${encodeURIComponent(cursor)}`);
  const path = query.length > 0 ? `/v1/activity?${query.join('&')}` : '/v1/activity';
  const { data } = await request<ActivityResponse>({ method: 'GET', path, token, signal });
  return data;
}

export async function getClaimOptions({ token, signal }: RequestOptions, asset: string): Promise<ClaimOptions> {
  const path = `/v1/claim-options?asset=${encodeURIComponent(asset)}`;
  const { data } = await request<ClaimOptions>({ method: 'GET', path, token, signal });
  return data;
}

/**
 * Creates a claim. Reuse the same `idempotencyKey` and body when retrying: the server then
 * returns the original claim and never creates a second one. Aborting via `signal` does not
 * cancel the claim on the server, so treat it (and any error with `outcomeUnknown`) as unknown.
 */
export async function createClaim(
  { token, signal }: RequestOptions,
  body: CreateClaimBody,
  idempotencyKey: string,
): Promise<CreateClaimResult> {
  if (idempotencyKey.length < 1 || idempotencyKey.length > 100) {
    throw new Error('Idempotency-Key must be 1 to 100 characters');
  }
  const { data, headers } = await request<Claim>({
    method: 'POST',
    path: '/v1/claims',
    token,
    signal,
    headers: { 'Idempotency-Key': idempotencyKey },
    body,
  });
  return { claim: data, replayed: headers.get('Idempotent-Replayed')?.toLowerCase() === 'true' };
}

export async function getClaim({ token, signal }: RequestOptions, id: string): Promise<Claim> {
  const { data } = await request<Claim>({
    method: 'GET',
    path: `/v1/claims/${encodeURIComponent(id)}`,
    token,
    signal,
  });
  return data;
}
