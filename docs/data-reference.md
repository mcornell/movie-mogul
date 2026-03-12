# Data Reference: Actors and Movie Roles

This document explains what each numeric field in the actor and movie role data
actually means, inferred by cross-referencing the C64 BASIC source
(`c64/movie mogul formatted.prg`) with the data files
(`c64/actor data.seq`, `c64/movie data.seq`).

---

## Actor Stats (`stats[0..6]`)

Each actor has 7 stats. All values are in the range **1–9** except where noted.

| Index | Name | Used in | Notes |
|-------|------|---------|-------|
| `stats[0]` | *(unused)* | — | Always 2 for males, 4 or 6 for females. Never read by game logic; likely a legacy field from original data encoding. |
| `stats[1]` | **Star Power** | Pay formula, Oscar threshold, Best Picture | The most important stat. Halved and combined with `stats[2]` to set salary. Also the threshold for winning acting Oscars and contributing to Best Picture. |
| `stats[2]` | **Pay Additive** | Pay formula | Added directly to `stats[1]/2`. High value = expensive actor. |
| `stats[3]` | **Dramatic Range** | Box office penalty (`bq`) | Compared against `role.requirements[4]`. If below requirement, reduces master quality score. |
| `stats[4]` | **Comedic Ability** | Box office penalty (`bq`) | Compared against `role.requirements[5]`. |
| `stats[5]` | **Charm / Sex Appeal** | Box office penalty (`bq`), Oscar eligibility | Compared against `role.requirements[6]`. Also checked in `isMovieEligibleForOscar` (BASIC line 7020). |
| `stats[6]` | **Action / Physicality** | Box office penalty (`bq`) | Compared against `role.requirements[7]`. High for action stars, low for comedic or dramatic specialists. |

### Notable Examples

| Actor | Star Power | Pay Add | Dramatic | Comedic | Charm | Action | Interpretation |
|-------|-----------|---------|----------|---------|-------|--------|----------------|
| Meryl Streep | 9 | 9 | 9 | 3 | 6 | 6 | Elite dramatic actress; top-tier salary |
| Dustin Hoffman | 9 | 9 | 9 | 8 | 1 | 6 | Outstanding range; almost no charm |
| Eddie Murphy | 9 | 9 | 5 | 9 | 7 | 7 | Comedy powerhouse with physicality |
| Arnold Schwarzenegger | 3 | 7 | 3 | 5 | 1 | 9 | Low star power but maxed-out action; cheap for action roles |
| Jack Nicholson | 9 | 8 | 8 | 8 | 2 | 4 | Versatile dramatic/comedic, low charm |
| Pia Zadora | 2 | 1 | 1 | 2 | 2 | 4 | Weakest actor in the pool on almost every axis |
| Katharine Hepburn | 9 | 8 | 9 | 7 | 2 | 3 | Elite prestige actress; low charm/action |

---

## Pay Formula

```
x   = int(random() * 300) + 31          // multiplier: 31–330
pay = int(stats[1] / 2 + stats[2]) * x  // INT truncates BEFORE multiply
if pay < 100: pay += 100                 // floor of $100K
```

> **Important:** `INT()` truncates the base value before multiplying by `x`.
> This means an odd `stats[1]` (e.g., 7) gives a lower base than you might expect:
> `int(7/2 + 5) = int(8.5) = 8`, not `8.5`.

**Pay ranges at multiplier extremes (x=31 and x=330):**

| Actor | stats[1] | stats[2] | Base | Min pay | Max pay |
|-------|---------|---------|------|---------|---------|
| Pia Zadora | 2 | 1 | 2 | $162K | $760K |
| Arnold Schwarzenegger | 3 | 7 | 8 | $248K | $2,640K |
| Tom Hanks | 5 | 7 | 9 | $279K | $2,970K |
| Marlon Brando | 7 | 5 | 8 | $248K | $2,640K |
| Jack Nicholson | 9 | 8 | 12 | $372K | $3,960K |
| Meryl Streep | 9 | 9 | 13 | $403K | $4,290K |

---

## Role Requirements (`requirements[0..7]`)

Each movie has 3 roles; each role has 8 requirements.

| Index | Name | Used in | Notes |
|-------|------|---------|-------|
| `requirements[0]` | **Gender Restriction** | Casting validation | `1` = male only, `5` = either, `9` = female only. Enforced at casting time. |
| `requirements[1]` | *(unused)* | — | Populated from seq file but never read by game logic. |
| `requirements[2]` | **Role Prestige** | `aq` score, Oscar threshold | Contributes to the compounding role quality score (`aq`). Also used as the Oscar win threshold: `starPower + prestige > random(6..35)`. |
| `requirements[3]` | **Role Quality** | `aq` score | Also contributes to `aq`. Together, prestige and quality compound at 1.10× per role. |
| `requirements[4]` | **Dramatic Range Needed** | `bq` penalty | Compared against `actor.stats[3]`. |
| `requirements[5]` | **Comedic Ability Needed** | `bq` penalty | Compared against `actor.stats[4]`. |
| `requirements[6]` | **Charm Needed** | `bq` penalty | Compared against `actor.stats[5]`. Almost always `1` in practice — rarely a binding constraint. |
| `requirements[7]` | **Action Needed** | `bq` penalty | Compared against `actor.stats[6]`. High for action films, near 1 for dramas. |

### Box Office Quality Formula

```
// aq: compounding prestige/quality score across all 3 roles
aq = 0
for each role:
    aq = int((aq + role.prestige + role.quality) * 1.10)

// bq: penalty when actor stats fall below role requirements
bq = 0
for each stat index si in [2..7]:           // requirements indices
    for each cast member:
        if actor.stats[si-1] < role.requirements[si]:
            bq += actor.stats[si-1] - role.requirements[si]  // negative

// cq: critic review contribution
cq = clampedReviewScore * 90 + 50

// dq: budget contribution
dq = int(budget / 100)

// mq: master quality score driving weekly box office
mq = 38 * (aq + bq) + cq + dq
```

A well-cast movie with actors whose stats meet or exceed all role requirements will have `bq = 0`, maximising `mq`. Every point of mismatch subtracts directly from `bq`.

---

## Known C64 Bug: Oscar Award Check

BASIC lines 3420–3430 and 3560–3570 use `ao(3)` (cast member 1's star power) for
all three casting threshold checks instead of `tw(3)` and `tr(3)` for cast members 2
and 3. This means Oscar eligibility is always based on the **first cast member's star
power**, regardless of which actor is up for the award.

The TypeScript implementation (`src/game/gameEngine.ts`) faithfully replicates this bug.

---

## Sources

- `c64/movie mogul formatted.prg` — annotated BASIC source; lines 3800 (pay), 1980–2080 (quality/bq), 3390–3660 (Oscars)
- `c64/actor data.seq` / `src/data/actors.ts` — 140 actors
- `c64/movie data.seq` / `src/data/movies.ts` — 12 movies × 3 roles
- `src/types/index.ts` — TypeScript type definitions with stat annotations
- `src/game/gameEngine.ts` — all formulas implemented
