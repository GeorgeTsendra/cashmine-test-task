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
