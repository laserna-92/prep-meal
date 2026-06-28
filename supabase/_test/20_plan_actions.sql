-- LOCAL TEST — swap + confirm flow as the authenticated user (continues 10_flow_a state).
\set ON_ERROR_STOP on
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

-- Pick the user's plan and a lunch meal on day 1.
select id from meal_plans where user_id='11111111-1111-1111-1111-111111111111'
  order by week_start desc limit 1 \gset
\set plan_id :id
select id as meal_id, recipe_id as old_recipe from planned_meals
  where plan_id=:'plan_id' and day_of_week=1 and slot='lunch' \gset

\echo '--- alternatives for that lunch ---'
select title, kcal_per_serv, protein_per_serv from meal_alternatives(:'meal_id', 3);

-- Swap to the first alternative.
select id as new_recipe from meal_alternatives(:'meal_id', 1) \gset
select swap_meal(:'meal_id', :'new_recipe');
\echo '--- meal after swap (recipe + recomputed macros) ---'
select r.title, pm.servings, pm.kcal, pm.protein_g
from planned_meals pm join recipes r on r.id=pm.recipe_id where pm.id=:'meal_id';
\echo '--- changed? old vs new recipe id (must differ) ---'
select (:'old_recipe' <> :'new_recipe') as recipe_changed;

-- Confirm the plan → builds shopping list.
select confirm_plan(:'plan_id', 1::smallint) as list_id \gset
\echo '--- plan status + shopping list total ---'
select status from meal_plans where id=:'plan_id';
select round(est_total,2) as total_eur, (select count(*) from shopping_items where list_id=:'list_id') as items
from shopping_lists where id=:'list_id';

reset role;
