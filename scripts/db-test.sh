#!/usr/bin/env bash
# Apply the full schema + seed and run the SQL integration tests in order.
# Requires DATABASE_URL to point at an empty Postgres database.
#   DATABASE_URL=postgres://postgres:postgres@localhost:5432/prepmeal ./scripts/db-test.sh
set -euo pipefail

: "${DATABASE_URL:?set DATABASE_URL to a Postgres connection string}"
PSQL=(psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q)

echo "▸ auth shim (test-only)"
"${PSQL[@]}" -f supabase/_test/00_auth_shim.sql

echo "▸ migrations"
for f in supabase/migrations/*.sql; do
  echo "  - $f"
  "${PSQL[@]}" -f "$f"
done

echo "▸ seed"
"${PSQL[@]}" -f supabase/seed.sql

echo "▸ integration tests"
for f in supabase/_test/10_flow_a.sql supabase/_test/20_plan_actions.sql supabase/_test/30_cook_plan.sql; do
  echo "  - $f"
  "${PSQL[@]}" -f "$f" >/dev/null
done

echo "✓ database tests passed"
