-- PrepMeal — weekly plan solver as an RLS-safe RPC (callable via supabase.rpc).
-- Greedy per-slot matcher: protein-dense recipes scaled by servings to hit the
-- daily calorie target, with light per-day variety. Mirrors docs/05 POST /plans/generate.

create or replace function slots_for(p_meals smallint)
returns meal_slot[] language sql immutable as $$
  select case p_meals
    when 1 then array['lunch']::meal_slot[]
    when 2 then array['lunch','dinner']::meal_slot[]
    when 3 then array['breakfast','lunch','dinner']::meal_slot[]
    when 4 then array['breakfast','lunch','snack','dinner']::meal_slot[]
    when 5 then array['breakfast','snack','lunch','snack','dinner']::meal_slot[]
    else        array['breakfast','snack','lunch','snack','dinner','snack']::meal_slot[]
  end;
$$;

create or replace function generate_meal_plan(p_week_start date, p_variety text default 'balanced')
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user    uuid := auth.uid();
  v_profile profiles;
  v_target  nutrition_targets;
  v_plan    uuid;
  v_slots   meal_slot[];
  v_n       int;
  v_day     int;
  v_i       int;
  v_slot    meal_slot;
  v_slot_kcal numeric;
  v_recipe  recipes;
  v_recipe_id uuid;
  v_servings numeric;
  v_recent  uuid[];
  v_density numeric;  -- target protein-per-kcal; steers recipe choice to the goal
begin
  if v_user is null then raise exception 'not_authenticated'; end if;

  select * into v_profile from profiles where id = v_user;
  if not found then raise exception 'profile_required'; end if;

  select * into v_target from nutrition_targets where user_id = v_user and is_active;
  if not found then raise exception 'target_required'; end if;

  v_slots := slots_for(v_profile.meals_per_day);
  v_n := array_length(v_slots, 1);
  v_density := v_target.protein_g::numeric / nullif(v_target.calories, 0);

  -- Idempotent per week: replace any existing plan for this week_start.
  delete from meal_plans where user_id = v_user and week_start = p_week_start;
  insert into meal_plans(user_id, week_start, status, target_snapshot)
  values (v_user, p_week_start, 'draft', jsonb_build_object(
    'calories', v_target.calories, 'proteinG', v_target.protein_g,
    'carbsG', v_target.carbs_g, 'fatG', v_target.fat_g))
  returning id into v_plan;

  for v_day in 0..6 loop
    v_recent := '{}';
    for v_i in 1..v_n loop
      v_slot := v_slots[v_i];
      v_slot_kcal := v_target.calories::numeric / v_n;

      -- Rank eligible recipes by how close their protein density is to the
      -- target's, then rotate across the week among the top few for variety.
      -- 'simple' variety pins the single best fit every day.
      with elig as (
        select r.*,
               abs(r.protein_per_serv::numeric / nullif(r.kcal_per_serv, 0) - v_density) as fit
        from recipes r
        where r.is_published
          and v_slot = any(r.suitable_slots)
          and r.kcal_per_serv > 0
          and not (r.id = any(v_recent))
          and (r.diet && (array['omnivore']::diet_type[] || array[v_profile.diet]))
      ),
      ranked as (
        select *, row_number() over (order by fit asc, id asc) rn, count(*) over () cnt from elig
      )
      select ranked.id into v_recipe_id
      from ranked
      where rn = case when p_variety = 'simple' then 1
                      else (v_day % least(cnt, 3)) + 1 end;

      if v_recipe_id is null then continue; end if;
      select * into v_recipe from recipes where id = v_recipe_id;
      v_recent := v_recent || v_recipe.id;

      -- scale servings to the slot's calorie share, clamped to sane bounds
      v_servings := greatest(0.5, least(3.0, round((v_slot_kcal / v_recipe.kcal_per_serv)::numeric, 1)));

      insert into planned_meals(plan_id, recipe_id, day_of_week, slot, servings, sort_order)
      values (v_plan, v_recipe.id, v_day, v_slot, v_servings, v_i);
    end loop;
  end loop;

  return v_plan;
end;
$$;
