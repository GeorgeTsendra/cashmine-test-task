# Balance after a claim: approaches

This is the conversation the brief asks for: the AI proposes at least two approaches, then the user chooses. The decision is appended at the bottom once made.

## Prompt

```text
Give me at least two approaches for what the balance shows right after a claim is submitted, with pros and cons for each and your recommendation.
```

## Response

### What the API docs tell us

- A claim takes effect on the server at once: its amount leaves `available` and is counted in `claiming`.
- Balances are snapshots recomputed every 15 s, and `asOf` is the snapshot's time. So for up to 15 s after a claim, the snapshot still shows the old numbers.
- A pending claim settles within about 20 s. If it completes, `claiming` drops and the money is gone. If it fails, the amount returns to `available`.
- A claim has `createdAt` and `updatedAt`, and balances have `asOf`. All three are server time, so they can be compared without client clock skew.

### The two complaints are two different failure modes

- "I claimed and my balance didn't change": we show an old snapshot as if it were current.
- "It dropped, then jumped back up": we show a number we computed ourselves, and an older snapshot (or a failed claim) overwrites it.

### Approach A: show the snapshot only, plus an "in progress" notice

Balances stay exactly what the server last said. After submitting, the asset card and the claim screen show "Claim of 0.3 ETH in progress".

- Pros: never shows a number the server did not send. About 20 lines. Nothing to get wrong.
- Cons: this is the first complaint word for word. For up to 15 s Available still shows the old amount, so a user may claim again. Max on the form would offer money that is already claimed, and the server rejects it, so the user meets an error.

### Approach B: optimistic update in the query cache, then refetch

On success, subtract the amount from the cached balance, then refetch.

- Pros: the textbook pattern. About 10 lines. The number moves immediately.
- Cons: this is the second complaint word for word. The refetch right after the claim, and the 15 s poll, can return a snapshot from before the claim. It overwrites our number, so the balance jumps back up and then drops again at the next snapshot. A failed claim needs a rollback. Preventing the overwrite means comparing timestamps, which is approach C.

### Approach C: an overlay on the snapshot, reconciled with server timestamps

Keep a small list of our own claims (id, asset, amount, status, createdAt, updatedAt), saved in storage. Show snapshot + overlay. The overlay is what each claim has done on the server so far, minus what the snapshot already includes. The snapshot includes a claim's creation if `createdAt <= asOf`, and its settlement if `updatedAt <= asOf`.

Overlay per claim of amount x (Available / Claiming):

| Claim is now | Snapshot older than the claim | Snapshot taken between create and settle | Snapshot taken after settle |
|---|---|---|---|
| pending | −x / +x | no change | not possible |
| failed | no change | +x / −x | no change |
| completed | −x / no change | no change / −x | no change |

- Pros:
  - The number moves the moment the claim is created.
  - A stale snapshot cannot undo it, because the overlay stays until a snapshot proves it includes the claim.
  - The total (available + pending + claiming) does not change at submission. Value only moves from Available to Claiming.
  - Max and validation use the adjusted Available, so money that is already claimed cannot be claimed again.
  - Failure and completion also show at once, without waiting up to 15 s.
  - It is a pure function, so it is easy to unit-test with the table above.
- Cons:
  - The most logic: about 60 lines plus a table of tests.
  - It relies on two assumptions I cannot confirm from the docs alone: a snapshot includes every claim created before its `asOf`, and `updatedAt` is the settle time. The first real claim can confirm both.
  - Claims made on another device or tab are not in our list. They appear with the next snapshot, as they do today.
  - The list must be saved. Otherwise a reload within 15 s brings the first complaint back.
  - Balances are polled every 3 s while a claim is not yet in a snapshot, which is a handful of extra requests.

### Approach D: a "settling" hold

Freeze the affected asset's numbers, dim them with "Updating after your claim…", and disable Claim for that asset until a snapshot with `asOf >= createdAt` arrives (at most 15 s).

- Pros: never shows a computed number. Blocks double claims by construction. Simple: one timestamp per asset.
- Cons: the number still does not move for up to 15 s, and we explain instead of showing it. It blocks a legitimate second claim. It gets stuck if the server stops producing snapshots, so it needs a timeout fallback, and that fallback is approach A.

### Comparison

| | A: snapshot + notice | B: naive optimistic | C: timestamp overlay | D: settling hold |
|---|---|---|---|---|
| Balance changes right away | no | yes | yes | no |
| Can jump back after a stale snapshot | no | yes | no | no |
| Max and double-claim safe | no | partly | yes | yes |
| Failure and completion shown at once | no | partly | yes | no |
| Complexity | low | low | medium | low-medium |

### Recommendation: approach C, with a visible "Claim in progress" line

C is the only approach that answers both complaints and still never shows a number the server contradicts. B fails the second complaint and D fails the first. A is the safe fallback.

- Add a "Claim of 0.3 ETH in progress" line on the asset card while a claim is pending. We have the list anyway, and it makes the movement from Available to Claiming explicit.
- If a claim fails, say so where the user is looking, for example "Claim failed: 0.3 ETH is back in Available (reason)". The jump back up is then a real event that is explained, not a glitch.
- Time risk: this is about 10 minutes of the remaining budget with its tests. If we are behind at 20:30 UTC, ship A with the in-progress line and list C under "next steps" in NOTES.md.
- Check with the first real claim (smallest amount): log `asOf`, `createdAt` and `updatedAt` next to the balances, and confirm the two assumptions above.

Decision needed: A, B, C or D. I would choose C.
