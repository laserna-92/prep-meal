-- LOCAL TEST — exercises Flow A as the authenticated user (RLS on).
\set ON_ERROR_STOP on

-- Create an auth user and act as them.
insert into auth.users(id, email) values ('11111111-1111-1111-1111-111111111111','gym@test.dev')
  on conflict do nothing;
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

-- Profile (bulk, 4 meals/day) + active target (from client Mifflin calc).
insert into profiles(id, sex, birth_date, height_cm, weight_kg, activity, workouts_per_wk, goal, goal_pace, meals_per_day)
values ('11111111-1111-1111-1111-111111111111','male','2000-01-01',178,80,'moderate',5,'bulk','moderate',4);

insert into nutrition_targets(user_id, calories, protein_g, carbs_g, fat_g, bmr, tdee)
values ('11111111-1111-1111-1111-111111111111', 2650, 185, 320, 70, 1810, 2360);

-- Generate the week.
select generate_meal_plan('2026-06-29') as plan_id \gset

\echo '--- daily totals (should track ~2650 kcal / ~185P) ---'
select pm.day_of_week,
       sum(pm.kcal) kcal, sum(pm.protein_g) protein, sum(pm.carbs_g) carbs, sum(pm.fat_g) fat,
       count(*) meals
from planned_meals pm where pm.plan_id = :'plan_id'
group by pm.day_of_week order by pm.day_of_week;

\echo '--- one day in detail ---'
select pm.slot, r.title, pm.servings, pm.kcal, pm.protein_g
from planned_meals pm join recipes r on r.id = pm.recipe_id
where pm.plan_id = :'plan_id' and pm.day_of_week = 1 order by pm.sort_order;

\echo '--- shopping list aggregation ---'
select generate_shopping_list(:'plan_id', 1::smallint) as list_id \gset
select aisle, count(*) items, round(sum(est_price),2) eur
from shopping_items where list_id = :'list_id' group by aisle order by aisle;
select round(est_total,2) as total_eur from shopping_lists where id = :'list_id';

-- RLS check: a different user must see zero of this plan's meals.
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
\echo '--- RLS: other user sees N planned_meals (must be 0) ---'
select count(*) as visible_to_other from planned_meals where plan_id = :'plan_id';

reset role;
