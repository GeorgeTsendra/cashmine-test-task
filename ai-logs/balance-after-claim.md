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

## Follow-up: what if C's two assumptions are wrong, and can we check them now?

### Prompt

```text
Before we commit to C: you said it rests on two assumptions you can't confirm from the docs. What exactly breaks for the user if each one is wrong? And can we verify both right now with one smallest claim and a couple of balance refetches? Give me the exact steps
```

### What breaks for the user

The overlay is display-only and the server checks `available` live, so a wrong assumption never moves money wrongly. It shows a wrong number for at most one snapshot cycle (15 s) per claim.

| Assumption | If it is wrong like this | The user sees | Worst case |
|---|---|---|---|
| 1. A snapshot includes every claim created before its `asOf` | The snapshot lags: its `asOf` is past `createdAt`, but the claim is not in the numbers yet. | The overlay is dropped too early. Available jumps back up and Claiming drops back, then both change again at the next snapshot. | Complaint 2 returns, and the old Available invites a second claim. The server rejects an over-claim with a 400. |
| 1, other direction: a snapshot includes claims created just after its `asOf` | The snapshot is stamped early. | The claim is counted twice for a moment: Available too low (even negative), Claiming too high. | Max is too small, and a negative balance looks broken. |
| 2. `updatedAt` is when the claim settled. Wrong if it is later than the real settle time | A snapshot that already includes the settlement is treated as not including it. | A failed claim shows x too much in Available and a negative Claiming. A completed claim shows Claiming x too low. | Phantom money in Available. |
| 2, other direction: `updatedAt` is earlier than the real settle time, or never changes | A snapshot that does not include the settlement is treated as including it. | At settlement the overlay is dropped too early. A failed claim's amount is missing from Available, and a completed claim stays in Claiming until the next snapshot. | Behaves like approach A, at settlement only. |

### Can one claim verify both?

One smallest claim: yes. "A couple of balance refetches": no. The boundary is a moment inside one 15 s cycle, so we poll balances about once a second for about 1.5 minutes. The script prints only the lines that change, which is about 10 lines.

A single run gives bounds, not proof.

- Assumption 1: the run shows the snapshot's lag is at most the gap between the claim's `createdAt` and the first snapshot that includes it. The script waits for a new snapshot and sends the claim about 12 s later, so that gap is about 1 to 3 s. The "snapshot includes later claims" direction is only bounded loosely (about 12 s) by one claim.
- Assumption 2: the settle time cannot be timed, so the bound is whatever the margins turn out to be. If both margins are large (5 s or more), the check is weak and should be repeated once.

### Steps (run in your own terminal; the token is read silently and never printed)

Tested against a local mock of the API in interactive zsh, with valid snapshots and with a deliberately lagging one (the lagging mock produced the FAIL pattern below). Not yet run against the real API.

Step 0, once per terminal:

```bash
read -rs "CM_TOKEN?Token (hidden): "; echo; export CM_TOKEN
B=https://task-api.cashmine.io
api() { curl -sS -m 15 -H "Authorization: Bearer $CM_TOKEN" "$@"; }
```

Step 1, list assets and pick the cheapest one where `available >= min` and `min > fee`:

```bash
api "$B/v1/balances" | jq -r '.items[] | [.asset, .available, .usdPrice] | @tsv' | while IFS=$'\t' read -r a av p; do
  api "$B/v1/claim-options?asset=$a" | jq -r --arg a "$a" --arg av "$av" --arg p "$p" \
    '[$a, "available=" + $av, "min=" + .minAmount, "fee=" + .fee, "minUSD~" + (((.minAmount|tonumber) * ($p|tonumber) * 100 | round / 100) | tostring), "dest=" + .destinations[0].id] | join("  ")'
done
```

Step 2, fill in the chosen asset, its `min` as the amount, and its `dest`:

```bash
ASSET=XXX; AMOUNT=0.00; DEST=dest_xxx
```

Step 3, the experiment (about 1.5 minutes; it creates ONE claim of the minimum amount):

```bash
K=$(uuidgen); CLAIM=""; LB=""; LC=""; PREV=""; SENT=0
BODY="{\"asset\":\"$ASSET\",\"amount\":\"$AMOUNT\",\"destinationId\":\"$DEST\"}"
snap() { api "$B/v1/balances" | jq -c --arg a "$ASSET" 'if .items then {asOf, available: (.items[]|select(.asset==$a)|.available), claiming: (.items[]|select(.asset==$a)|.claiming)} else . end'; }
for i in $(seq 1 70); do
  b=$(snap); asof=$(echo "$b" | jq -r '.asOf // empty')
  [ "$b" != "$LB" ] && echo "$(date -u +%T) BAL $b"; LB=$b
  if [ "$SENT" = 0 ] && [ -n "$PREV" ] && [ -n "$asof" ] && [ "$asof" != "$PREV" ]; then
    sleep 12
    out=$(api -X POST "$B/v1/claims" -H "Idempotency-Key: $K" -H 'Content-Type: application/json' -d "$BODY" -w $'\n%{http_code}')
    echo "$(date -u +%T) CLAIM http=${out##*$'\n'} ${out%$'\n'*}"
    CLAIM=$(echo "${out%$'\n'*}" | jq -r '.id // empty'); SENT=1
  fi
  [ -n "$asof" ] && PREV=$asof
  if [ -n "$CLAIM" ]; then
    c=$(api "$B/v1/claims/$CLAIM" | jq -c 'if .id then {status, createdAt, updatedAt, failureReason} else . end')
    [ "$c" != "$LC" ] && echo "$(date -u +%T) CLM $c"; LC=$c
  fi
  sleep 1
done
```

Step 4, the idempotent replay (bonus check; it creates no second claim):

```bash
api -i -X POST "$B/v1/claims" -H "Idempotency-Key: $K" -H 'Content-Type: application/json' -d "$BODY" | grep -iE '^(HTTP|idempotent-replayed)'
```

### How to read the output

Let `c` be the CLAIM line's `createdAt`, and `u` the `updatedAt` on the first CLM line whose status is not `pending`.

- Assumption 1 passes if the last BAL line before the numbers change has `asOf < c`, and the first BAL line with Available down and Claiming up by the amount has `asOf >= c`. It fails if any BAL line with `asOf >= c` still shows the old numbers. The gap `asOf - c` of the first including line is the measured bound on lag.
- Assumption 2 passes if `updatedAt` stays equal to `createdAt` while pending and then holds one value after the flip, and the last BAL line with Claiming still raised has `asOf < u` while the first BAL line with Claiming back at the starting value (or Available restored, for a failed claim) has `asOf >= u`. It fails if a BAL line with `asOf >= u` is still unsettled, one with `asOf < u` is already settled, or `updatedAt` keeps changing.
- Also check that `asOf` never goes backwards between BAL lines, and that step 4 shows HTTP 200 and `idempotent-replayed: true`.

If assumption 1 fails: drop the overlay only when `asOf >= createdAt` plus the measured lag plus 1 s, or fall back to approach A if the lag is erratic. If assumption 2 fails: stop using `updatedAt`, and keep the settlement part of the overlay for a fixed 15 s after we first see the status change.

## Update after the first attempt (the check did not create a claim yet)

### What happened

The user ran steps 0 and 1 and then the experiment. Step 2 (the line that sets `ASSET`, `AMOUNT` and `DEST`) was skipped the first time, and the second time its placeholder line was run as written (`ASSET=XXX; ...`). Either way the asset matched nothing in the balances, so the script never sent a claim. The 400 on the replay came from an empty request body. No claim was created. A template line to fill in was my design mistake, so the next version has the real values in it and refuses an unknown asset.

### New facts from the real API

- There are three assets: USDT (min 10, fee 1.5), BTC (min 0.0005, fee 0.00002) and ETH (min 0.01, fee 0.0012). The destination id is `dest_exchange`, not the docs' `dest_wallet`, so the UI must always use `destinations` from `claim-options`.
- ETH `available` is `12.365678901234591676`, a full 18 decimals. The bigint money math handles it exactly, and a JS number would not.
- The cheapest claim by USD value is USDT with an amount of 10.
- **The rate limit is tight.** Polling balances roughly once a second (about 0.6 requests per second including latency) returned `RATE_LIMITED` every 8 to 10 requests, with `retryAfterMs` between 9 ms and 1.7 s. A short burst at the start did the same.
- About 1 request in 8 returned `SERVER` 503 "Service temporarily unavailable". The user asked to ignore these, and they are expected chaos.

### What this changes in the app

- Poll a pending claim every 4 s at most, and balances every 5 s at most while a claim is not yet in a snapshot (15 s otherwise). Together that stays under about 0.5 requests per second.
- Keep honoring `retryAfterMs`. GET queries already retry twice with that delay.
- Expect 503 on the claim POST. Treat it as "outcome unknown" and replay the same body with the same Idempotency-Key.

### The corrected check

The first attempt's script is replaced by this one: one self-contained block with the real values, a guard that stops if the asset is not in the balances, a poll every 3.5 s, a wait of `retryAfterMs` after a 429, silent skipping of 503s, and a retry of the claim POST with the same key if it fails. It was tested against a local mock that rate-limits and randomly returns 503 (up to 40% in the worst run). It has not run against the real API.

```bash
B=https://task-api.cashmine.io
ASSET=USDT; AMOUNT=10; DEST=dest_exchange
api() { curl -sS -m 15 -H "Authorization: Bearer $CM_TOKEN" "$@"; }
claimcheck() {
  [ -n "$ASSET" ] && [ -n "$AMOUNT" ] && [ -n "$DEST" ] || { echo "Run step 2 first: ASSET, AMOUNT and DEST must be set"; return 1; }
  K=$(uuidgen); CLAIM=""; LB=""; LC=""; PREV=""; SENT=0; N429=0; N5XX=0
  BODY="{\"asset\":\"$ASSET\",\"amount\":\"$AMOUNT\",\"destinationId\":\"$DEST\"}"
  for i in $(seq 1 ${ITER:-40}); do
    r=$(api "$B/v1/balances")
    w=$(echo "$r" | jq -r '.error.retryAfterMs // empty' 2>/dev/null)
    if [ -n "$w" ]; then N429=$((N429+1)); sleep $(awk "BEGIN{print $w/1000+0.3}"); continue; fi
    if [ -z "$r" ] || echo "$r" | jq -e '.error' >/dev/null 2>&1; then N5XX=$((N5XX+1)); sleep ${GAP:-3.5}; continue; fi
    b=$(echo "$r" | jq -c --arg a "$ASSET" '{asOf, available: (.items[]|select(.asset==$a)|.available), claiming: (.items[]|select(.asset==$a)|.claiming)}')
    [ -n "$b" ] || { echo "Asset $ASSET is not in your balances"; return 1; }
    asof=$(echo "$b" | jq -r '.asOf // empty')
    [ "$b" != "$LB" ] && echo "$(date -u +%T) BAL $b"; LB=$b
    if [ "$SENT" = 0 ] && [ -n "$PREV" ] && [ -n "$asof" ] && [ "$asof" != "$PREV" ]; then
      sleep ${ARM:-8}
      out=$(api -X POST "$B/v1/claims" -H "Idempotency-Key: $K" -H 'Content-Type: application/json' -d "$BODY" -w $'\n%{http_code}')
      echo "$(date -u +%T) CLAIM http=${out##*$'\n'} ${out%$'\n'*}"
      CLAIM=$(echo "${out%$'\n'*}" | jq -r '.id // empty'); [ -n "$CLAIM" ] && SENT=1
    fi
    [ -n "$asof" ] && PREV=$asof
    if [ -n "$CLAIM" ] && [ $((i % 3)) = 0 ]; then
      c=$(api "$B/v1/claims/$CLAIM" | jq -c 'if .id then {status, createdAt, updatedAt, failureReason} else empty end')
      [ -n "$c" ] && [ "$c" != "$LC" ] && echo "$(date -u +%T) CLM $c"; [ -n "$c" ] && LC=$c
    fi
    sleep ${GAP:-3.5}
  done
  echo "done: rate-limited responses (429)=$N429, other errors=$N5XX"
}
claimcheck
```

The step 4 replay and the way to read the output are unchanged from the follow-up above.

## Decision

Approach A is shipped: the balance shows the server snapshot as it is, and the claim screen says the claim is in progress and that the balance catches up within about 15 seconds. The AI recommended approach C (the timestamp overlay). It was not built because it rests on two assumptions that were not verified (a snapshot includes every claim created before its `asOf`, and `updatedAt` is the settle time), and there was no time left. Approach C is the first item under "Next steps" in `NOTES.md`. Approach B was avoided because it causes the second user complaint (the balance drops and then jumps back up). Approach A leaves the first complaint possible for up to 15 seconds.
