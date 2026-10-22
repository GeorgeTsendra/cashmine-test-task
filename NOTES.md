# Notes

## Decisions

**1. Amounts.** The API sends amounts as decimal strings, so I never turn them into JS numbers. A string is parsed into a `bigint` count of units plus a scale (`src/lib/money.ts`). The parser follows the docs exactly: no sign, no leading zeros, and at most `decimals` places as written. Totals are exact, and USD is rounded once, at display, to cents with ties away from zero, so a row can differ from the total by a cent. The USD total is available + pending + claiming, so submitting a claim only moves value from Available to Claiming. The receive amount is amount minus fee, and it must stay above zero. *Alternatives:* JS numbers lose digits above 2^53, and the sandbox has an ETH balance with 18 decimals; decimal.js or big.js would work but add a dependency for a handful of operations. 75 unit tests cover parsing, validation, fee and totals, with expected values from an independent Python `decimal` calculation.

**2. Balance after a claim: approach A, the server snapshot as is.** After Confirm the app opens a claim screen that says "Claim in progress" and that the balance catches up within about 15 seconds. It follows the claim until it completes or fails, and balances are fetched again after the submit and after settlement. I considered four approaches (A snapshot only plus a notice, B optimistic cache update, C an overlay reconciled by server timestamps, D a settling hold) and wrote them up in `ai-logs/balance-after-claim.md`. I recommended C and did not build it: it depends on two things the docs do not state (a snapshot includes every claim created before its `asOf`, and `updatedAt` is the settle time). My attempt to check them with one real claim never produced a result, and time ran out. B causes the second complaint ("dropped, then jumped back up"), so I avoided it. A leaves the first complaint possible for up to 15 s ("it didn't change, so I claimed again"). What limits the damage: the server checks `available` live and rejects an over-claim with a message, the same claim cannot be sent twice (decision 3), and the claim screen sets the expectation.

**3. Unknown result of a claim request.** After a timeout, a network error, a 5xx or a 429 the claim may exist. The app never sends it with a new key. It replays the same Idempotency-Key and body, twice automatically (honoring `retryAfterMs`), then shows "We couldn't confirm whether your claim went through" with "Check again", which sends the same request again; the server then returns the original claim. If the user closes the dialog, a banner on Home and on the claim screen offers "Check status". The attempt is stored, so a reload can resume it. It is cleared on success, on a definite 400, 404 or 409, and whenever the token changes, because replaying it under another token would create a new claim. *Alternatives:* show "failed" and let the user retry (risks a double claim); search the history for a matching claim (no id, racy); block the screen until known. Tested with a mock API that loses a response and goes down, not against failures on the real API.

**Smaller choices.** React Query for server state. The token is in AsyncStorage (it works on web and native, and on web it is `localStorage`, readable by page scripts). The API rate-limits tightly (about 0.6 requests per second caused 429s), so balances refresh every 15 s, a pending claim every 4 s, claim options are cached for 60 s, and 429s are honored. `web.output` is `single` with a Netlify `_redirects` file. Closed sets are enums, and all display text is in `src/strings.ts`.

## Working with AI

Local times in `ai-logs/session-log.md` headings are UTC+2.

- **A prompt that did not get what I wanted.** I asked to verify the balance assumptions "with one smallest claim and a couple of balance refetches". The AI pushed back (the boundary is inside one 15 s cycle, so it needs about a poll a second for a minute and a half) and wrote a script. My first run did not create a claim: step 2 was a fill-in-the-blanks line, and I skipped it, then ran its placeholder. The AI admitted the template was the mistake and rewrote the check as one block with real values and a guard against an unknown asset. See `ai-logs/session-log.md`, entries 22:08 and 22:17, and the follow-up sections of `ai-logs/balance-after-claim.md`.
- **AI output that was wrong or risky.** (a) The AI's claim form fetched its options inside a form keyed by asset, so switching assets cancelled in-flight requests. I saw "canceled" in the Network tab; the AI found the cause in React Query's source and moved the queries up (entry 22:25). (b) The first check script polled once a second and hit the API's rate limit; I found out from the 429s in my own output (entry 22:17). (c) `tsc` failed after Jest was added because TypeScript 6 no longer loads `@types` automatically (entry "Commit 3").
- **Disagreeing with the AI.** The AI proposed a `localStorage` wrapper for the token. I rejected it because it only exists on the web, and we chose AsyncStorage (entry 21:32). The AI recommended approach C for the balance; I chose to ship A given the time and the unverified assumptions (`ai-logs/balance-after-claim.md`).

## Not done / known issues

- **Balance after a claim** can show the old Available for up to 15 s (approach A). The overlay (C) is the first next step.
- **Claim flow against the real API** is covered by mock-based browser tests and manual checks, not automated tests. The `// TODO: verify` markers in `src/types.ts` are still open: asset list, negative amount format, `relatedId` on accruals, `exchange` on reversals, `limit` outside 1 to 20, whether the fee is flat, whether `destinations` can be empty, whether `destinationId` is required, the format of `failureReason`, the 15 s client timeout, `Retry-After` format, and whether a 500 or 503 can leave a claim created.
- **Freshness** compares the device clock with the server's `asOf`, so a wrong device clock shows a wrong age.
- **Token** sits in browser storage and is not checked when it is entered; a bad token is found on the first request.
- **Not verified:** the on-screen keyboard on a real phone, a real page reload with a stored claim attempt (only the stored value was checked), and the "rejected" dialog in the browser.
- **No Activity screen.** API responses are typed but not validated at runtime, so an unexpected status from the server is not caught.

## Next steps

- Balance overlay (approach C): show the snapshot plus what our own claims have done since it was taken, reconciled by `asOf`, `createdAt` and `updatedAt`. First verify the two assumptions in decision 2, using `ai-logs/balance-after-claim.md`.
- Design update: a visual refresh on top of the small `src/theme.ts`, for example dark mode, icons (`@expo/vector-icons` is in the stack but unused), skeleton loaders instead of spinners, and motion on claim status changes.
- Activity: paginated history of accruals, reversals and claims (infinite scroll, filters by type/asset).
- Localization: i18n for copy (all text is already in `src/strings.ts`), plus locale-aware number, currency and date formatting.
- Multiple accounts: switch between saved tokens, with the query cache and pending claims kept per account.
- Cross-device claims: reconcile the balance overlay with server-side pending claims, not only claims made in this browser.
- Claim flow tests: mock-fetch tests for timeout, unknown result, retry with the same idempotency key, and failed claims.
- Offline handling: detect offline state, block Claim, and show cached balances with a clear "offline" label.
- Pull-to-refresh on native (react-native-web has none, so web uses a Refresh button); auto-refresh already runs every 15 s, matching the snapshot interval.
- Accessibility pass: screen reader labels on amounts, focus order, dynamic font sizes.
- Security: on native, keep the token in SecureStore; on web, an httpOnly cookie via a backend proxy instead of localStorage.
- Error monitoring (e.g. Sentry) and analytics on claim success/failure rates.
- Native builds: run and polish on iOS/Android (haptics, biometric confirmation before a claim).
- E2E tests (Playwright for web, Maestro for native) for the full claim journey.
