-- PrepMeal — seed data: tags, ingredient catalogue (per 100 g) and a starter
-- set of high-protein, prep-friendly recipes for the Gym persona.
-- Recipe macros/cost are computed by the recalc triggers on insert.

-- ── Tags ─────────────────────────────────────────────────────────────────────
insert into tags(slug, label) values
  ('high_protein','Alto proteína'),
  ('quick','Rápido'),
  ('budget','Económico'),
  ('freezable','Congelável'),
  ('low_carb','Low-carb'),
  ('one_pan','Um tacho');

-- ── Ingredients (kcal, protein, carbs, fat per 100 g; price € per 100 g) ──────
insert into ingredients(name, aisle, base_unit, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100, density_g_ml, price_per_100) values
  ('Frango (peito)',      'butcher', 'g', 165, 31.0, 0.0,  3.6, null, 0.90),
  ('Peru (peito picado)', 'butcher', 'g', 150, 29.0, 0.0,  2.0, null, 1.10),
  ('Salmão',              'fish',    'g', 208, 20.0, 0.0, 13.0, null, 2.20),
  ('Atum (lata, água)',   'grocery', 'g', 116, 26.0, 0.0,  1.0, null, 1.30),
  ('Ovos',                'dairy',   'g', 143, 13.0, 1.1,  9.5, null, 0.45),
  ('Iogurte grego',       'dairy',   'g',  97, 9.0,  3.9,  5.0, null, 0.55),
  ('Whey (proteína)',     'grocery', 'g', 380, 80.0, 8.0,  6.0, null, 2.50),
  ('Aveia',               'grocery', 'g', 389, 16.9, 66.3, 6.9, null, 0.30),
  ('Arroz (cru)',         'grocery', 'g', 360, 7.0,  79.0, 0.6, null, 0.20),
  ('Massa (crua)',        'grocery', 'g', 371, 13.0, 75.0, 1.5, null, 0.25),
  ('Batata-doce',         'produce', 'g',  86, 1.6,  20.0, 0.1, null, 0.18),
  ('Brócolos',            'produce', 'g',  34, 2.8,  7.0,  0.4, null, 0.30),
  ('Legumes mistos',      'produce', 'g',  45, 2.5,  8.0,  0.5, null, 0.25),
  ('Banana',              'produce', 'g',  89, 1.1,  23.0, 0.3, null, 0.20),
  ('Azeite',              'grocery', 'ml', 884, 0.0,  0.0, 100.0, 0.92, 0.80),
  ('Molho teriyaki',      'grocery', 'ml', 89,  5.0, 16.0, 0.0, 1.15, 1.00);

-- ── Recipes + ingredients + steps ────────────────────────────────────────────
-- Helper note: ingredient ids are resolved by name in each recipe block.

-- 1) Frango teriyaki + arroz (lunch)
with r as (
  insert into recipes(title, prep_minutes, cook_minutes, equipment, suitable_slots, is_prep_friendly, is_freezable, fridge_life_days)
  values ('Frango teriyaki + arroz', 10, 15, '{stove,oven}', '{lunch,dinner}', true, true, 4) returning id)
insert into recipe_ingredients(recipe_id, ingredient_id, quantity, unit, sort_order)
select r.id, i.id, q.quantity, q.unit, q.sort_order from r
join (values
  ('Frango (peito)', 180::numeric, 'g'::measure_unit, 1::smallint),
  ('Arroz (cru)',    70,  'g', 2),
  ('Molho teriyaki', 30,  'ml', 3)
) as q(name, quantity, unit, sort_order) on true
join ingredients i on i.name = q.name;

-- 2) Peru + batata-doce (lunch)
with r as (
  insert into recipes(title, prep_minutes, cook_minutes, equipment, suitable_slots, is_prep_friendly, is_freezable, fridge_life_days)
  values ('Peru + batata-doce assada', 10, 25, '{oven}', '{lunch,dinner}', true, true, 4) returning id)
insert into recipe_ingredients(recipe_id, ingredient_id, quantity, unit, sort_order)
select r.id, i.id, q.quantity, q.unit, q.sort_order from r
join (values
  ('Peru (peito picado)', 180::numeric, 'g'::measure_unit, 1::smallint),
  ('Batata-doce',         200, 'g', 2),
  ('Azeite',              10,  'ml', 3)
) as q(name, quantity, unit, sort_order) on true
join ingredients i on i.name = q.name;

-- 3) Atum + massa (lunch)
with r as (
  insert into recipes(title, prep_minutes, cook_minutes, equipment, suitable_slots, is_prep_friendly, fridge_life_days)
  values ('Atum + massa', 5, 12, '{stove}', '{lunch,dinner}', true, 3) returning id)
insert into recipe_ingredients(recipe_id, ingredient_id, quantity, unit, sort_order)
select r.id, i.id, q.quantity, q.unit, q.sort_order from r
join (values
  ('Atum (lata, água)', 120::numeric, 'g'::measure_unit, 1::smallint),
  ('Massa (crua)',      80,  'g', 2),
  ('Azeite',            8,   'ml', 3)
) as q(name, quantity, unit, sort_order) on true
join ingredients i on i.name = q.name;

-- 4) Salmão + brócolos (dinner)
with r as (
  insert into recipes(title, prep_minutes, cook_minutes, equipment, suitable_slots, is_prep_friendly, is_freezable, fridge_life_days)
  values ('Salmão + legumes assados', 8, 20, '{oven}', '{lunch,dinner}', true, false, 3) returning id)
insert into recipe_ingredients(recipe_id, ingredient_id, quantity, unit, sort_order)
select r.id, i.id, q.quantity, q.unit, q.sort_order from r
join (values
  ('Salmão',         170::numeric, 'g'::measure_unit, 1::smallint),
  ('Brócolos',       150, 'g', 2),
  ('Legumes mistos', 100, 'g', 3),
  ('Azeite',         10,  'ml', 4)
) as q(name, quantity, unit, sort_order) on true
join ingredients i on i.name = q.name;

-- 5) Bowl de peru (dinner)
with r as (
  insert into recipes(title, prep_minutes, cook_minutes, equipment, suitable_slots, is_prep_friendly, is_freezable, fridge_life_days)
  values ('Bowl de peru + arroz', 10, 15, '{stove}', '{lunch,dinner}', true, true, 4) returning id)
insert into recipe_ingredients(recipe_id, ingredient_id, quantity, unit, sort_order)
select r.id, i.id, q.quantity, q.unit, q.sort_order from r
join (values
  ('Peru (peito picado)', 160::numeric, 'g'::measure_unit, 1::smallint),
  ('Arroz (cru)',         60,  'g', 2),
  ('Legumes mistos',      120, 'g', 3),
  ('Azeite',              8,   'ml', 4)
) as q(name, quantity, unit, sort_order) on true
join ingredients i on i.name = q.name;

-- 6) Ovos mexidos + aveia (breakfast)
with r as (
  insert into recipes(title, prep_minutes, cook_minutes, equipment, suitable_slots, is_prep_friendly, fridge_life_days)
  values ('Ovos mexidos + aveia', 8, 7, '{stove}', '{breakfast}', false, 2) returning id)
insert into recipe_ingredients(recipe_id, ingredient_id, quantity, unit, sort_order)
select r.id, i.id, q.quantity, q.unit, q.sort_order from r
join (values
  ('Ovos',  150::numeric, 'g'::measure_unit, 1::smallint),
  ('Aveia', 60,  'g', 2),
  ('Banana',100, 'g', 3)
) as q(name, quantity, unit, sort_order) on true
join ingredients i on i.name = q.name;

-- 7) Iogurte grego + whey + banana (breakfast)
with r as (
  insert into recipes(title, prep_minutes, cook_minutes, equipment, suitable_slots, is_prep_friendly, fridge_life_days)
  values ('Iogurte grego + whey + banana', 3, 0, '{}', '{breakfast,snack}', true, 3) returning id)
insert into recipe_ingredients(recipe_id, ingredient_id, quantity, unit, sort_order)
select r.id, i.id, q.quantity, q.unit, q.sort_order from r
join (values
  ('Iogurte grego', 200::numeric, 'g'::measure_unit, 1::smallint),
  ('Whey (proteína)', 30, 'g', 2),
  ('Banana',         100, 'g', 3),
  ('Aveia',          30,  'g', 4)
) as q(name, quantity, unit, sort_order) on true
join ingredients i on i.name = q.name;

-- 8) Batido proteico + banana (snack)
with r as (
  insert into recipes(title, prep_minutes, cook_minutes, equipment, suitable_slots, is_prep_friendly, fridge_life_days)
  values ('Batido proteico + banana', 3, 0, '{}', '{snack,breakfast}', false, 1) returning id)
insert into recipe_ingredients(recipe_id, ingredient_id, quantity, unit, sort_order)
select r.id, i.id, q.quantity, q.unit, q.sort_order from r
join (values
  ('Whey (proteína)', 35::numeric, 'g'::measure_unit, 1::smallint),
  ('Banana',          120, 'g', 2)
) as q(name, quantity, unit, sort_order) on true
join ingredients i on i.name = q.name;

-- ── Recipe steps (technique + duration drive the Modo Cozinha router) ─────────
insert into recipe_steps(recipe_id, step_no, instruction, duration_min, technique)
select r.id, s.step_no, s.instruction, s.duration_min, s.technique
from recipes r join (values
  -- Frango teriyaki + arroz
  ('Frango teriyaki + arroz', 1, 'Temperar o frango', 5, 'prep'),
  ('Frango teriyaki + arroz', 2, 'Cozer o arroz', 12, 'stove'),
  ('Frango teriyaki + arroz', 3, 'Saltear o frango com molho teriyaki', 10, 'stove'),
  ('Frango teriyaki + arroz', 4, 'Juntar e porcionar', 3, 'assemble'),
  -- Peru + batata-doce assada
  ('Peru + batata-doce assada', 1, 'Pré-aquecer o forno a 200º', 0, 'oven'),
  ('Peru + batata-doce assada', 2, 'Cortar e temperar a batata-doce', 6, 'prep'),
  ('Peru + batata-doce assada', 3, 'Assar peru e batata-doce', 25, 'oven'),
  ('Peru + batata-doce assada', 4, 'Arrefecer e porcionar', 5, 'rest'),
  -- Atum + massa
  ('Atum + massa', 1, 'Cozer a massa', 11, 'stove'),
  ('Atum + massa', 2, 'Escorrer e juntar atum e azeite', 4, 'assemble'),
  -- Salmão + legumes assados
  ('Salmão + legumes assados', 1, 'Pré-aquecer o forno a 200º', 0, 'oven'),
  ('Salmão + legumes assados', 2, 'Cortar e temperar os legumes', 6, 'prep'),
  ('Salmão + legumes assados', 3, 'Assar salmão e legumes', 20, 'oven'),
  ('Salmão + legumes assados', 4, 'Arrefecer e porcionar', 5, 'rest'),
  -- Bowl de peru + arroz
  ('Bowl de peru + arroz', 1, 'Cozer o arroz', 12, 'stove'),
  ('Bowl de peru + arroz', 2, 'Saltear o peru e os legumes', 10, 'stove'),
  ('Bowl de peru + arroz', 3, 'Montar o bowl e porcionar', 3, 'assemble'),
  -- Ovos mexidos + aveia
  ('Ovos mexidos + aveia', 1, 'Preparar a aveia', 4, 'stove'),
  ('Ovos mexidos + aveia', 2, 'Mexer os ovos', 5, 'stove'),
  ('Ovos mexidos + aveia', 3, 'Empratar com banana', 2, 'assemble'),
  -- Iogurte grego + whey + banana
  ('Iogurte grego + whey + banana', 1, 'Misturar iogurte, whey e aveia', 2, 'prep'),
  ('Iogurte grego + whey + banana', 2, 'Juntar banana e porcionar', 2, 'assemble'),
  -- Batido proteico + banana
  ('Batido proteico + banana', 1, 'Bater whey com banana e água', 3, 'prep')
) s(title, step_no, instruction, duration_min, technique) on s.title = r.title;

-- Tag the lot as high_protein; quick ones as quick.
insert into recipe_tags(recipe_id, tag_id)
select r.id, t.id from recipes r cross join tags t where t.slug = 'high_protein';
insert into recipe_tags(recipe_id, tag_id)
select r.id, t.id from recipes r cross join tags t
where t.slug = 'quick' and (r.prep_minutes + r.cook_minutes) <= 20;
