-- LOCAL TEST — Modo Cozinha router (continues prior state).
\set ON_ERROR_STOP on
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

select id from meal_plans where user_id='11111111-1111-1111-1111-111111111111'
  order by week_start desc limit 1 \gset
\set plan_id :id

-- Select all of day 1's meals to batch-cook.
select array_agg(id) as meal_ids from planned_meals where plan_id=:'plan_id' and day_of_week=1 \gset

\echo '--- cook_plan summary (estimate, containers) ---'
select (cp->>'estimateMinutes')::int as est_min, (cp->>'containers')::int as containers
from (select cook_plan(:'plan_id', :'meal_ids') cp) x;

\echo '--- timeline (ordered steps) ---'
select (step->>'order')::int ord, step->>'technique' technique, step->>'instruction' instruction, step->>'durationMin' dur
from (select cook_plan(:'plan_id', :'meal_ids') cp) x,
     jsonb_array_elements(cp->'timeline') step
order by ord;

\echo '--- labels (one per meal) ---'
select label->>'meal' meal, label->>'useByDate' use_by
from (select cook_plan(:'plan_id', :'meal_ids') cp) x,
     jsonb_array_elements(cp->'labels') label;

\echo '--- complete → meals become ready ---'
select cook_plan_complete(:'meal_ids') as marked_ready;
select status, count(*) from planned_meals where plan_id=:'plan_id' and day_of_week=1 group by status;

reset role;
