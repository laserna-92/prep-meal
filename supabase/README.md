# PrepMeal — Backend (Supabase)

Postgres schema, business logic and seed for the app. Validated locally against
Postgres 16 (migrations + seed + Flow A integration test all pass).

## Layout

```
migrations/
  0001_init.sql               enums, tables, indexes (docs/04)
  0002_functions_triggers.sql macro recompute (recipe + planned_meal), shopping aggregation
  0003_rls.sql                Row-Level Security: per-user isolation + public catalogue
  0004_plan_generate.sql      weekly plan solver (RPC: generate_meal_plan)
seed.sql                      tags, ingredient catalogue, starter high-protein recipes
_test/                        LOCAL-ONLY: auth schema shim + Flow A test (not for prod)
```

## Architecture note: RPC vs Edge Functions

The design doc (docs/05) sketched Edge Functions for `nutrition-calculate` and
`plan-generate`. In implementation:

- **Nutrition math** runs **client-side** (`src/lib/nutrition.ts`, Mifflin-St Jeor)
  for instant onboarding preview — no network round-trip. The result is persisted
  to `nutrition_targets`.
- **Plan generation** is a **Postgres RPC** (`generate_meal_plan`), not an Edge
  Function. It runs inside the database with `security invoker`, so RLS applies
  automatically and it is fully testable in CI. Call it via `supabase.rpc(...)`.

Heavier/async work (PDF export, push notifications, RevenueCat webhooks) is where
Edge Functions earn their place later.

## Key RPCs

| Function | Purpose |
|---|---|
| `generate_meal_plan(p_week_start date, p_variety text)` | Build the week's plan for the caller; returns the plan id. |
| `meal_alternatives(p_meal uuid, p_limit int)` | Swap candidates for a meal: same slot, closest calories. |
| `swap_meal(p_meal uuid, p_recipe uuid)` | Replace a meal's recipe, rescaling servings to its calorie share. |
| `confirm_plan(p_plan uuid, p_people smallint)` | Mark a plan confirmed and build its shopping list; returns list id. |
| `generate_shopping_list(p_plan uuid, p_people smallint)` | Aggregate + dedupe ingredients into a shopping list; returns list id. |
| `cook_plan(p_plan uuid, p_meal_ids uuid[])` | Batch-cooking router: merged/ordered timeline + tupperware labels (JSON). |
| `cook_plan_complete(p_meal_ids uuid[])` | Mark prepared meals `ready`; returns count updated. |
| `recalc_recipe(p_recipe uuid)` | Recompute a recipe's per-serving macros from its ingredients. |

## Running locally

With the Supabase CLI:

```bash
supabase start
supabase db reset      # applies migrations/ then seed.sql
```

The macro columns on `recipes` and `planned_meals` are recomputed by triggers —
never write them from the client.

## Reproducing the local validation (no Supabase CLI)

`_test/00_auth_shim.sql` emulates the `auth` schema + roles; the `_test/N*.sql`
files create a user/profile/target and exercise plan generation, swap/confirm,
shopping-list aggregation and the cook-mode router, asserting RLS hides data from
a second user. The whole sequence is wrapped by `scripts/db-test.sh` and run in CI:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/prepmeal ./scripts/db-test.sh
```
