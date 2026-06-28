-- PrepMeal — batch-cooking router (Modo Cozinha). Merges the steps of the
-- selected meals' recipes into one optimized timeline + tupperware labels.
-- Mirrors docs/02 §5 and docs/05 §7. Returns JSON; RLS governs which meals are visible.

create or replace function cook_plan(p_plan uuid, p_meal_ids uuid[])
returns jsonb language plpgsql security invoker as $$
declare
  v_timeline   jsonb;
  v_labels     jsonb;
  v_estimate   integer;
  v_containers integer;
begin
  -- Selected meals owned by the caller (RLS filters planned_meals).
  create temp table _sel on commit drop as
    select pm.id meal_id, pm.recipe_id, pm.day_of_week, pm.slot,
           pm.kcal, pm.protein_g, pm.carbs_g, pm.fat_g,
           r.title, r.fridge_life_days
    from planned_meals pm
    join recipes r on r.id = pm.recipe_id
    where pm.plan_id = p_plan and pm.id = any(p_meal_ids);

  -- Steps of the distinct recipes, ordered by technique so oven setup comes
  -- first, then prep, then the cooking that runs in parallel, then rest.
  create temp table _steps on commit drop as
    select rs.recipe_id, rs.step_no, rs.instruction, rs.duration_min, rs.technique,
           case rs.technique
             when 'oven' then 1 when 'prep' then 2 when 'stove' then 3
             when 'rest' then 4 else 5 end as prio
    from recipe_steps rs
    where rs.recipe_id in (select distinct recipe_id from _sel);

  select jsonb_agg(jsonb_build_object(
           'order', ord,
           'instruction', instruction,
           'durationMin', coalesce(duration_min, 0),
           'technique', technique,
           'parallel', technique in ('oven','stove')) order by ord)
  into v_timeline
  from (
    select row_number() over (order by prio, duration_min desc nulls last, recipe_id, step_no) as ord,
           instruction, duration_min, technique
    from _steps
  ) x;

  select jsonb_agg(jsonb_build_object(
           'meal', title, 'day', day_of_week, 'slot', slot,
           'macros', jsonb_build_object('calories', kcal, 'proteinG', protein_g,
                                        'carbsG', carbs_g, 'fatG', fat_g),
           'useByDate', (current_date + coalesce(fridge_life_days, 3))::text))
  into v_labels from _sel;

  select count(*) into v_containers from _sel;

  -- prep + rest are sequential; cooking overlaps, so take the longest cook + portioning.
  select coalesce(sum(duration_min) filter (where technique in ('prep','rest','assemble')), 0)
       + coalesce(max(duration_min) filter (where technique in ('oven','stove')), 0)
       + 10
  into v_estimate from _steps;

  return jsonb_build_object(
    'estimateMinutes', coalesce(v_estimate, 0),
    'containers', v_containers,
    'timeline', coalesce(v_timeline, '[]'::jsonb),
    'labels', coalesce(v_labels, '[]'::jsonb));
end;
$$;

-- Mark prepared meals as ready (shows as "pronto" in Today).
create or replace function cook_plan_complete(p_meal_ids uuid[])
returns integer language plpgsql security invoker as $$
declare n integer;
begin
  update planned_meals set status = 'ready' where id = any(p_meal_ids);
  get diagnostics n = row_count;
  return n;
end;
$$;
