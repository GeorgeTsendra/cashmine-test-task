# CashMine payback

A slice of the CashMine app: see payback balances and claim them. Built with Expo (React Native), TypeScript and Expo Router, and shipped as a web app for phones.

**Live link:** https://georgets66-cashmine-test-task.expo.app (open it on a phone, about 390 px wide)

On first open the app asks for your API token, keeps it in the browser, and lets you change it from the Home screen. The token is never in the code, the repository or the build.

## Run it locally

```bash
npm install
npx expo start --web      # http://localhost:8081
```

Other commands:

```bash
npm test                  # unit tests (amount logic, time, idempotency key)
npx tsc --noEmit          # type check
npx expo export -p web    # production web build in dist/
```

The API base URL is a single constant, `API_BASE_URL` in `src/lib/api.ts`.

## Deploy

The live build is hosted on EAS Hosting (Expo): https://georgets66-cashmine-test-task.expo.app. `npx expo export -p web` produces `dist/`, a static single-page app, so any static host works. `public/_redirects` sends every path to `index.html` for Netlify, for example `netlify deploy --dir dist`.

## What works

- **Token gate:** asked on first open, kept in the browser, changeable, and a rejected token returns you to it with a message.
- **Balances (Home):** each asset's available, pending and claiming amounts, the USD total, how fresh the data is, loading, error with Retry, and refresh (a button and every 15 s).
- **Claim:** pick an asset, enter an amount or tap Max, see the fee and what you receive, validate against the API rules, confirm, submit, and follow the claim until it completes or fails.
- **Safe retries:** every claim has one Idempotency-Key, and an unknown result is replayed with the same key, so a claim cannot be created twice.
- **Tests:** 75 unit tests for parsing, validation, fee and totals.

## What does not work yet

- No Activity screen.
- After a claim the balance can show the old Available for up to 15 seconds.

See `NOTES.md` for the decisions, how AI was used, known issues and next steps, and `ai-logs/` for the AI conversations.
