# CLAUDE.md

Working rules for this repo. Follow them for the whole session. Always reply in English.

## Context

- This is a 2-hour take-home task for CashMine.
- The app is built with Expo (React Native) and TypeScript, but it is delivered as a **web app** that reviewers open on their phones. Native builds are not needed.
- Priorities: a working MVP that matches the brief first, polish second, extras last.

## Stack

Don't change it without asking.

- Expo SDK 58, Expo Router (`src/app`), strict TypeScript
- `@tanstack/react-query` for server state; `useState`/Context for local state (zustand only if we really need shared non-API state)
- `react-hook-form` + `zod` if there are forms
- `StyleSheet.create` with a small `src/theme.ts`; `@expo/vector-icons` for icons
- No new dependencies without the user's OK, and only ones that work on web

## Structure

- `src/app` holds screens and layouts only. No data fetching there.
- `src/lib/api.ts` is the only place that calls `fetch`. Reuse it.
- `src/types.ts` holds API types based on the docs. No `any`.
- `src/features/<name>` holds React Query hooks and feature components.
- `src/components` holds shared components. Use `QueryState` for loading/error/empty/data.

Status: `src/lib/api.ts`, `src/components/QueryState`, `src/theme.ts` and `src/types.ts` are not in the repo yet (`reset-project` removed the template's `src/`). Ask before creating them.

## Code

- Every screen with data handles loading, error (with a Retry button), empty and data.
- Query keys live in one place per feature. Invalidate them after mutations.
- Mobile-first: 360–430px width, tap targets at least 44px, safe area, and the keyboard must never cover inputs.
- Keep components small (under ~150 lines). Put `accessibilityRole` on Pressables and `accessibilityLabel` on icon-only buttons.
- No secrets in code, logs or replies. Never open or print `.env*.local`.

## How we work

- Plan and ask first, code second. If something is unclear, ask instead of guessing.
- One task at a time, with minimal changes within that task.
- Run `npx tsc --noEmit` after every change and make sure it passes.
- Finish each reply with the files you changed and how the user can check the result.
- If you're not sure an Expo or library API exists in SDK 58, say so rather than making it up.

## Git

- Never run `git commit`, `git push` or anything else that changes history. The user commits themselves.
- When a feature is done, suggest a commit message in Conventional Commits style (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
