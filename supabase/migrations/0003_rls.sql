-- PrepMeal — Row-Level Security. Each user sees only their own rows; the
-- recipe/ingredient catalogue is world-readable (docs/04 §5).

alter table profiles          enable row level security;
alter table nutrition_targets enable row level security;
alter table meal_plans        enable row level security;
alter table planned_meals     enable row level security;
alter table shopping_lists    enable row level security;
alter table shopping_items    enable row level security;
alter table meal_logs         enable row level security;
alter table progress_entries  enable row level security;
alter table pantry_items      enable row level security;
alter table favorites         enable row level security;
alter table recipes           enable row level security;
alter table recipe_ingredients enable row level security;
alter table recipe_steps      enable row level security;

-- Owned directly by user_id / id.
create policy own_profile on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy own_targets on nutrition_targets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_plans on meal_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_logs on meal_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_progress on progress_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_pantry on pantry_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_favorites on favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Owned via parent plan.
create policy own_planned_meals on planned_meals
  for all using (exists (select 1 from meal_plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from meal_plans p where p.id = plan_id and p.user_id = auth.uid()));

create policy own_shopping_lists on shopping_lists
  for all using (exists (select 1 from meal_plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from meal_plans p where p.id = plan_id and p.user_id = auth.uid()));

create policy own_shopping_items on shopping_items
  for all using (exists (
    select 1 from shopping_lists sl join meal_plans p on p.id = sl.plan_id
    where sl.id = list_id and p.user_id = auth.uid()))
  with check (exists (
    select 1 from shopping_lists sl join meal_plans p on p.id = sl.plan_id
    where sl.id = list_id and p.user_id = auth.uid()));

-- Recipe catalogue: read published or own; write own only.
create policy read_recipes on recipes
  for select using (is_published or owner_id = auth.uid());
create policy insert_own_recipes on recipes
  for insert with check (owner_id = auth.uid());
create policy update_own_recipes on recipes
  for update using (owner_id = auth.uid());
create policy delete_own_recipes on recipes
  for delete using (owner_id = auth.uid());

-- Recipe children readable when parent is; writable for own recipes.
create policy read_recipe_ingredients on recipe_ingredients
  for select using (exists (
    select 1 from recipes r where r.id = recipe_id and (r.is_published or r.owner_id = auth.uid())));
create policy write_recipe_ingredients on recipe_ingredients
  for all using (exists (select 1 from recipes r where r.id = recipe_id and r.owner_id = auth.uid()))
  with check (exists (select 1 from recipes r where r.id = recipe_id and r.owner_id = auth.uid()));

create policy read_recipe_steps on recipe_steps
  for select using (exists (
    select 1 from recipes r where r.id = recipe_id and (r.is_published or r.owner_id = auth.uid())));
create policy write_recipe_steps on recipe_steps
  for all using (exists (select 1 from recipes r where r.id = recipe_id and r.owner_id = auth.uid()))
  with check (exists (select 1 from recipes r where r.id = recipe_id and r.owner_id = auth.uid()));

-- ingredients, tags, recipe_tags: world-readable, writes via service_role only
-- (RLS left disabled → service role / SQL seed manage them).
grant select on ingredients, tags, recipe_tags to anon, authenticated;
