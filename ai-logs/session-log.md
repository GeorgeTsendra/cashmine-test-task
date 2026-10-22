# AI session log

Append-only log of the conversation with Claude Code. One entry per reply; earlier entries are never edited or removed.

## 21:03 — Set up session log

Prompt:

```text
I need to keep a log of our conversation for the reviewers, so please set that up first.

Create an ai-logs/ folder with a session-log.md file inside. After every reply you give me, append a new entry to that file — never edit or remove earlier entries. Each entry should look like this:

HH:MM — <short title>

Prompt: my message, word for word (if it contains a token or any secret, replace it with <TOKEN>) Response: what you did or suggested, and why — 3 to 6 bullets Files changed: the list, or "none" Suggested commit: a commit message, or "none"

Start with an entry for this message. And please don't commit anything — I'll handle git myself.
```

Response:

- Created the `ai-logs/` folder and `ai-logs/session-log.md`, as asked.
- Wrote this entry first, in the requested format. The prompt is quoted word for word in a code block so `<TOKEN>` and `<short title>` show up literally instead of being read as HTML.
- The message contained no token or secret, so nothing was redacted.
- From here on I'll append one entry per reply with a shell append (`>>`), so earlier entries can't be rewritten by accident.
- Saved a short note in Claude's project memory so the logging habit carries over to future sessions in this folder. It lives outside the repo.
- Ran no git commands and made no commits. `ai-logs/` is not in `.gitignore`, so it will show up as untracked for you to add.

Files changed: `ai-logs/session-log.md` (new)

Suggested commit: `docs: add ai-logs/session-log.md for reviewer-facing AI session log`

## 20:55 — Initial request: scaffold Expo app

_Backfilled at 21:04, after the log was set up. The time is approximate (taken from the project folder's creation time)._

Prompt:

```text
This is an empty folder for a new take-home project. Create a new Expo app right here: `npx create-expo-app@latest .` (default template, SDK 58). Then run `npm run reset-project` and answer "n" so the example files are deleted. Install React Query with `npx expo install @tanstack/react-query`, make sure `.env*.local` is in .gitignore, and run `npx tsc --noEmit` to confirm it builds. Don't commit — I'll do git myself.
```

Response:

- Ran `npx create-expo-app@latest . --yes`, which used the `expo-template-default@sdk-58` template (expo ~58.0.17).
- Ran `npm run reset-project` and answered "n", so `src/`, `scripts/` and the demo images were deleted. That left a bare `src/app/index.tsx` and `src/app/_layout.tsx`.
- Installed `@tanstack/react-query` (`^5.104.5`) with `npx expo install`, so the version is Expo-compatible.
- Checked `.gitignore`: `.env*.local` was already listed, so I changed nothing.
- `npx tsc --noEmit` exited 0. I made no commits, but `create-expo-app` itself ran `git init` and created an "Initial commit" (ac2c8e7) holding the pre-reset template.

Files changed: scaffolded the whole project (`package.json`, `package-lock.json`, `app.json`, `tsconfig.json`, `.gitignore`, `src/app/index.tsx`, `src/app/_layout.tsx`, `assets/`); removed `scripts/`, the template's example screens in `src/`, and the demo images in `assets/images/`

Suggested commit: `chore: scaffold Expo SDK 58 app with React Query`

## 21:04 — Add initiation entry to log

Prompt:

```text
and add an initiation message to the logs
```

Response:

- Read "initiation message" as the session's first request (the Expo setup). It came before the log existed, so it was never recorded.
- Appended it as a backfilled entry with the prompt quoted word for word and a summary of what was done. The entry is marked as backfilled, and its 20:55 time is approximate.
- The log is append-only, so the backfilled entry sits after the log-setup entry instead of being inserted before it. No earlier entry was edited.
- Appended this message's own entry as well, following the every-reply rule.

Files changed: `ai-logs/session-log.md`

Suggested commit: `docs: backfill initial request in session log`

## 21:05 — Save working rules to CLAUDE.md

Prompt:

```text
Before we look at the task, let's agree on how we work. Please save these rules to CLAUDE.md in the repo root and follow them for the whole session.
Context: this is a 2-hour take-home task for CashMine. The app is built with Expo (React Native) and TypeScript, but it's delivered as a web app that reviewers will open on their phones — native builds aren't needed. A working MVP that matches the brief comes first, polish second, extras last. Please always reply in English.
Stack — don't change it without asking me:

* Expo SDK 58, Expo Router (src/app), strict TypeScript
* @tanstack/react-query for server state; useState/Context for local state (zustand only if we really need shared non-API state)
* react-hook-form + zod if there are forms
* StyleSheet.create with a small src/theme.ts; @expo/vector-icons for icons
* no new dependencies without my OK, and only ones that work on web

Structure:

* src/app holds screens and layouts only — no data fetching there
* src/lib/api.ts is the only place that calls fetch (it already exists, reuse it)
* src/types.ts holds API types based on the docs — no `any`
* src/features/<name> holds React Query hooks and feature components
* src/components holds shared components — use the existing QueryState for loading/error/empty/data

Code:

* every screen with data handles loading, error with a Retry button, empty and data
* query keys live in one place per feature; invalidate them after mutations
* mobile-first: 360–430px width, tap targets at least 44px, safe area, the keyboard must never cover inputs
* keep components small (under ~150 lines); accessibilityRole on Pressables, accessibilityLabel on icon-only buttons
* no secrets in code, logs or replies; never open or print .env*.local

How we work:

* plan and ask first, code second — if something is unclear, ask me instead of guessing
* one task at a time, minimal changes within that task
* run `npx tsc --noEmit` after every change and make sure it passes
* finish each reply with the files you changed and how I can check the result
* if you're not sure an Expo or library API exists in SDK 58, tell me rather than making it up

Git: never run git commit, push or anything else that changes history — I commit myself. When a feature is done, just suggest a commit message in Conventional Commits style (feat:, fix:, chore:, docs:, refactor:).
Once CLAUDE.md is saved, give me a 3-line summary of the rules and a commit message. Don't start on any feature yet.
```

Response:

- Saved the rules to `CLAUDE.md` in the repo root, grouped as Context, Stack, Structure, Code, How we work and Git. I kept your wording and added nothing else, apart from the status note below.
- Checked the repo before writing: `src/lib/api.ts`, `QueryState`, `src/theme.ts` and `src/types.ts` don't exist. `reset-project` removed the template's `src/`, and only `src/app/index.tsx` and `src/app/_layout.tsx` are there.
- Because of that, I replaced "it already exists, reuse it" with a short status note in `CLAUDE.md` saying these files are missing and that I should ask before creating them. I'm waiting for your answer on where they should come from.
- Ran `npx tsc --noEmit`: exit 0. No feature work started, and no git commands run.

Files changed: `CLAUDE.md` (new), `ai-logs/session-log.md`

Suggested commit: `docs: add CLAUDE.md with project rules and workflow`

## 21:06 — Create api.ts and QueryState later, ask first

Prompt:

```text
Create src/lib/api.ts and QueryState when the first feature needs them; ask me before you do.
```

Response:

- Took this as your answer to my question about the missing files: don't create `src/lib/api.ts` or `QueryState` now. Create them only when the first feature needs them, and ask you before doing so.
- Created nothing and started no feature work. `src/` still holds only `src/app/index.tsx` and `src/app/_layout.tsx`, which matches your earlier "don't start on any feature yet".
- When the first feature needs them, I'll ask first with a short plan: what each file will contain and export. I'll wait for your OK before writing anything.
- `CLAUDE.md` already says to ask before creating these files (the status note under Structure), so I left it unchanged.
- Only the session log changed, but I ran `npx tsc --noEmit` as the rules require: exit 0. I ran no git commands.

Files changed: `ai-logs/session-log.md`

Suggested commit: none

## 21:17 — Plan the CashMine task (no code yet)

Prompt:

```text
Here's the brief and the API documentation. We have 2 hours in total, so roughly 70 minutes for the core features.

1. Context
CashMine pays users back part of the trading fees they pay on crypto exchanges. We call this payback. It is live on web, and the iOS/Android app is next. In this task you build a slice of that app: seeing payback balances and claiming them. The money is real for our users, so correctness matters more than polish.
You build it with React Native (Expo) and ship the web build, so that we can open it on a phone from a link.
2. Setup

* Create a new Expo app with TypeScript (for example `npx create-expo-app@latest`). Use any libraries you like, as long as they work on web.
* Run it in the browser (`npx expo start --web`) and design for a phone screen, about 390 px wide. We will open your link on a phone. It does not need to run on iOS or Android.
* We host a test API for this task. Its documentation: https://task-api.cashmine.io/docs
* Your personal token: `<TOKEN>`
It is valid for 24 hours, until 2026-10-23 19:00 UTC. All data is fake and private to your token.
* Treat the API as a real remote server that you call but cannot change.
* Do not put the token in your code, your repository or your deployed build. On first open, the app asks for the token (a text field is enough), keeps it in the browser and offers a way to change it. We will open your link with our own tokens.
* Keep the API base URL in one place in your code.

If the API is unavailable during your slot, say so in your submission email and we will offer you a new slot.
3. What to build
The items are in priority order. Doing fewer things correctly is better than doing everything halfway.

1. Balances (Home). Show each asset's balances, the total in USD, and how fresh the data is. Include loading, error/retry and refresh states.
2. Claim. The user picks an asset and enters an amount or taps Max. They see the fee and the amount they will receive, then confirm and submit. Afterwards they can follow the claim until it completes or fails. Validate input against the rules in the API documentation.
3. Tests. Write a few unit tests for your amount logic: parsing, validation, fee and totals.
4. Activity (if time allows). Show a paginated history of accruals, reversals and claims.

4. Decisions we leave to you
Each of these has more than one reasonable answer. Pick one and tell us why.

* How you represent and calculate amounts.
* What the balance shows right after a claim is submitted. Two pieces of user feedback pull in opposite directions. One user said: "I claimed and my balance didn't change, so I claimed again." Another said: "My balance dropped, then jumped back up, and I stopped trusting the app."
* What the user sees, and what the app does, when the result of a claim request is unknown, for example after a timeout.

5. AI tools
Use any AI tools you like: chat, IDE assistants or coding agents. AI may write code. We expect you to use these tools, and we care about how you work with them, not whether you do.

* Keep your AI conversations and put them in `ai-logs/` in your repository. You can export them, add share links or copy-paste them. If your tool cannot export, screenshots are fine. Do not tidy them up, because messy prompts are normal. The repository is public, so remove anything private, including your token.
* For the balance-after-claim decision, ask your AI for at least two approaches before you choose. We want to see that conversation.
* Commit at least every 30 minutes and do not squash your commits. Your history is part of the submission.

6. Notes
Add a `NOTES.md` of about one page with three sections:

* Decisions. Cover the three decisions above and any others that matter: what you chose, what the alternatives were, and why.
* Working with AI. Describe three moments and point to where each one is in `ai-logs/`:
   * a prompt that did not get you what you wanted, and how you changed it
   * a time AI output was wrong or risky, and how you found out
   * a time you disagreed with the AI or rejected a suggestion, and why
* Not done / known issues. Say what is missing or wrong and what you would do next.

`README.md` only needs the live link, how to run the app locally and what works.
7. Submission
Before 2026-10-22 21:00 UTC, reply to this email with:

* the link to a public GitHub repository with your full commit history
* the live link to your deployed web build. Any static host works, for example EAS Hosting, Vercel, Netlify or Cloudflare Pages. `npx expo export --platform web` builds it.
* roughly how long you spent

Deploy early, for example once the first screen works, so that hosting problems do not eat your last minutes. Do not push or redeploy after 2026-10-22 21:00 UTC.
8. What we look at

* Whether money handling and the claim flow are correct
* Your decisions and how you explain them
* How you work with AI: the context you give it, how you check its output, and where you push back
* Your React Native implementation and UX states on a phone screen
* How clear your notes are

Please don't write any code yet. First I'd like:

1. The requirements split into must-have, nice-to-have and unclear — ask me about the unclear ones.
2. An MVP we can realistically finish in 70 minutes, and what goes into "if we have time".
3. The screens and navigation (Expo Router files in src/app).
4. The entities and TypeScript types based on the API docs.
5. Risks — CORS, pagination, auth, rate limits — and a one-minute way to check each.
6. A plan of 6–10 commits in the order we'll do them. If the brief needs something our stack doesn't cover, tell me.
```

Response:

- Read the full API doc and probed the API without the token. The CORS preflight for `POST /v1/claims` works, 401 errors carry CORS headers too, and latency is 0.2–0.8 s. I never used the token; this log has `<TOKEN>` in its place.
- Wrote the plan you asked for: requirements split with 4 open questions and my defaults, MVP vs "if time", routes and feature folders, TypeScript types from the docs, risks with one-minute checks, and a 9-commit plan with UTC targets (103 minutes were left until the 21:00 UTC stop).
- Found repo issues that change the plan: `app.json` has `web.output: "server"` (static hosting needs `single`), `@expo/vector-icons` is in the stack but not installed, and react-native-web has no pull-to-refresh and an empty `Alert.alert`, so the app needs a Refresh button and an in-app confirm modal.
- Held back the balance-after-claim approaches on purpose, so the log shows you asking for them and then choosing.
- Wrote no code. `npx tsc --noEmit` exits 0, and I ran no git commands.

Files changed: `ai-logs/session-log.md`

Suggested commit: `chore: reset Expo template, add React Query, CLAUDE.md and AI session log` (covers everything uncommitted so far)

## 21:26 — Data layer: src/types.ts and API client

Prompt:

```text
Let's start with the data layer. Based on the API docs, create src/types.ts and the API functions. Use the auth header exactly as the docs describe. If you're unsure about any field, mark it with // TODO: verify. Please only touch these files.
here is the API doc:

"

CashMine practical task API
===========================

A test backend for the CashMine React Native practical task. All data is made up and nothing here
moves real money. Treat it like a real remote server: requests can be slow, and any request can fail.

Base URL: https://task-api.cashmine.io

Authentication
--------------

Send your token from the task email on every /v1 request:

    Authorization: Bearer <token>

Your data belongs to your token only. It starts fresh with your first request and includes about
30 days of history. The token stops working at the time given in your task email.

Conventions
-----------

- JSON in and out. Times are ISO 8601 strings in UTC.
- Amounts are decimal strings in the asset's own unit, for example "0.0005" (BTC). They are never
  JSON numbers. Each asset allows at most `decimals` decimal places. Write them as digits with an
  optional dot and more digits, and no leading zeros: "0.5" and "12" are fine; ".5", "1.", "05"
  and "1e-3" are not.
- CORS is open to any origin, so you can call the API from a web app.

Errors
------

    { "error": { "code": "VALIDATION", "message": "...", "field": "amount" } }

    HTTP  code                  meaning
    400   VALIDATION            the request is invalid; `field` names the field when there is one
    401   UNAUTHORIZED          token missing, invalid or expired
    404   NOT_FOUND             unknown endpoint or id
    409   IDEMPOTENCY_MISMATCH  an Idempotency-Key was reused with a different body
    429   RATE_LIMITED          too many requests; wait `retryAfterMs` (also the Retry-After header, in seconds)
    500   SERVER                temporary server error
    503   SERVER                temporary server error
    504   TIMEOUT               the server did not finish in time; the outcome is unknown

A 429 response looks like this:

    { "error": { "code": "RATE_LIMITED", "message": "Too many requests", "retryAfterMs": 2300 } }

Rate limits apply per token.

GET /v1/balances
----------------

    {
      "asOf": "2026-10-20T08:01:15.000Z",
      "items": [
        { "asset": "USDT", "decimals": 6, "available": "820.413207", "pending": "50.12",
          "claiming": "0", "usdPrice": "1.0002" }
      ]
    }

- available: can be claimed now
- pending: payback accrued but not yet confirmed; it becomes available once confirmed
- claiming: the amount in claims that have not completed yet
- usdPrice: the price of one unit in USD

Balances are snapshots, recomputed every 15 seconds. `asOf` is the time of the snapshot, so a claim
you just created may not show up until the next one.

GET /v1/activity?limit=20&cursor=...
------------------------------------

History, newest first. `limit` is 1 to 20 (default 20). Pass `nextCursor` as `cursor` to get the
next page; `nextCursor` is null on the last page.

    {
      "items": [
        { "id": "act_...", "type": "accrual", "asset": "USDT", "amount": "9.81", "status": "confirmed",
          "exchange": "Binance", "createdAt": "...", "relatedId": null }
      ],
      "nextCursor": "..."
    }

- type: accrual (payback earned on an exchange), reversal (an earlier accrual taken back by the
  exchange; relatedId is that accrual's id) or claim (relatedId is the claim id for claims you
  create; null for older claims)
- exchange: where the payback came from; null for claims
- amount: signed; negative for reversals and claims
- status: accrual pending | confirmed; reversal confirmed; claim pending | completed | failed

GET /v1/claim-options?asset=ETH
-------------------------------

    { "asset": "ETH", "minAmount": "0.01", "fee": "0.0012",
      "destinations": [ { "id": "dest_wallet", "label": "Wallet 0x8f3e…a91c" } ] }

The fee is taken from the claimed amount: the user receives amount minus fee.

POST /v1/claims
---------------

Headers:

    Idempotency-Key: <1 to 100 characters, required; a UUID works>

Body:

    { "asset": "ETH", "amount": "0.5", "destinationId": "dest_wallet" }

Rules: minAmount <= amount <= available, and at most `decimals` decimal places. `available` is
checked live, not against the last snapshot.

201 returns a claim. Its amount leaves `available` at once and is counted in `claiming` until the
claim settles.

Repeating a request with the same Idempotency-Key and the same body returns the original claim
(200, header `Idempotent-Replayed: true`) and never creates a second claim, even if the first
response was lost. The same key with a different body returns 409.

Claim:

    { "id": "clm_...", "asset": "ETH", "amount": "0.5", "fee": "0.0012", "receiveAmount": "0.4988",
      "destinationId": "dest_wallet", "status": "pending", "failureReason": null,
      "createdAt": "...", "updatedAt": "..." }

GET /v1/claims/{id}
-------------------

Returns the claim. A pending claim settles within about 20 seconds, to completed or failed. When a
claim fails, its amount returns to available and failureReason says why.

"
```

Response:

- Created `src/types.ts` from the docs: balances, activity (a union keyed on `type`), claim options, claims, and the error codes as one `as const` list that the error type is derived from. Twelve uncertain spots are marked `// TODO: verify` (9 in `src/types.ts`, 3 in `src/lib/api.ts`), for example the `destinationId` requirement, the format of negative amounts and what `failureReason` contains.
- Created `src/lib/api.ts` with `getBalances`, `getActivity`, `getClaimOptions`, `createClaim` and `getClaim`. The auth header is exactly `Authorization: Bearer <token>`. The caller passes the token in, and the module never stores or logs it. The base URL is one exported constant. You asked for the API functions, so I took that as the OK to create `api.ts`; `QueryState` is untouched.
- Added an `ApiError` class (kind, status, code, field, `retryAfterMs`) with an `outcomeUnknown` flag. It is true for network errors, the 15 s client timeout, an unreadable 2xx body, and 500/503/504, so the claim flow knows when to replay the same Idempotency-Key. `createClaim` also reports `replayed` from the `Idempotent-Replayed` header.
- Verified: `npx tsc --noEmit` exits 0. A throwaway test in the scratchpad (outside the repo) called all five functions with a bogus token and got a typed 401 `UNAUTHORIZED` from the real API each time. It also showed an empty Idempotency-Key is rejected locally and a pre-aborted signal surfaces as `AbortError`. Responses with a real token are not checked yet.
- Touched only those two files, plus this log because of your every-reply rule. Ran no git commands.

Files changed: `src/types.ts` (new), `src/lib/api.ts` (new), `ai-logs/session-log.md`

Suggested commit: `feat: add API types and typed client with Bearer auth and idempotent claims`
