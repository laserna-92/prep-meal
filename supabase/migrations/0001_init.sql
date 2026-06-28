-- PrepMeal — schema (enums, tables, indexes).
-- Mirrors docs/04-data-model.md. Runs on Postgres 16 / Supabase.

-- ── Enums ───────────────────────────────────────────────────────────────────
create type goal_type      as enum ('cut','maintain','bulk');
create type goal_pace      as enum ('slow','moderate','aggressive');
create type sex_type       as enum ('male','female');
create type activity_level as enum ('sedentary','light','moderate','active','athlete');
create type diet_type      as enum ('omnivore','vegetarian','vegan','low_carb','mediterranean');
create type meal_slot      as enum ('breakfast','lunch','dinner','snack');
create type plan_status    as enum ('draft','confirmed','archived');
create type meal_status    as enum ('planned','ready','eaten','skipped');
create type unit_system    as enum ('metric','imperial');
create type energy_unit    as enum ('kcal','kj');
create type measure_unit   as enum ('g','ml','un','tbsp','tsp','cup');
create type aisle_type     as enum ('produce','butcher','fish','dairy','grocery','frozen','bakery','other');

-- ── Profiles ────────────────────────────────────────────────────────────────
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  sex             sex_type       not null,
  birth_date      date           not null,
  height_cm       numeric(5,1)   not null,
  weight_kg       numeric(5,1)   not null,
  body_fat_pct    numeric(4,1),
  activity        activity_level not null,
  workouts_per_wk smallint       not null default 0,
  goal            goal_type      not null,
  goal_pace       goal_pace      not null default 'moderate',
  diet            diet_type      not null default 'omnivore',
  allergies       text[]         not null default '{}',
  avoid           text[]         not null default '{}',
  favorites_tags  text[]         not null default '{}',
  meals_per_day   smallint       not null default 4 check (meals_per_day between 1 and 8),
  prep_days       smallint[]     not null default '{0}',
  prep_minutes    smallint,
  equipment       text[]         not null default '{}',
  skill_level     smallint       not null default 3 check (skill_level between 1 and 5),
  budget_weekly   numeric(7,2),
  unit_system     unit_system    not null default 'metric',
  energy_unit     energy_unit    not null default 'kcal',
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now()
);

-- ── Nutrition targets (active + history) ─────────────────────────────────────
create table nutrition_targets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  calories   integer not null,
  protein_g  integer not null,
  carbs_g    integer not null,
  fat_g      integer not null,
  bmr        integer not null,
  tdee       integer not null,
  is_active  boolean not null default true,
  source     text    not null default 'mifflin_st_jeor',
  created_at timestamptz not null default now()
);
create unique index one_active_target_per_user
  on nutrition_targets(user_id) where is_active;

-- ── Ingredients (per 100 base unit) ──────────────────────────────────────────
create table ingredients (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  aisle           aisle_type not null default 'other',
  base_unit       measure_unit not null default 'g',
  kcal_per_100    numeric(7,2) not null,
  protein_per_100 numeric(6,2) not null,
  carbs_per_100   numeric(6,2) not null,
  fat_per_100     numeric(6,2) not null,
  density_g_ml    numeric(6,3),
  price_per_100   numeric(7,3),
  source_ref      text,
  created_at      timestamptz not null default now()
);
create index idx_ingredients_name on ingredients using gin (to_tsvector('simple', name));

-- ── Recipes (per-serving macros denormalized) ────────────────────────────────
create table recipes (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references profiles(id) on delete set null,
  title            text not null,
  description      text,
  image_url        text,
  servings         smallint not null default 1,
  prep_minutes     smallint not null default 0,
  cook_minutes     smallint not null default 0,
  equipment        text[]  not null default '{}',
  diet             diet_type[] not null default '{omnivore}',
  suitable_slots   meal_slot[] not null default '{breakfast,lunch,dinner,snack}',
  kcal_per_serv    integer not null default 0,
  protein_per_serv integer not null default 0,
  carbs_per_serv   integer not null default 0,
  fat_per_serv     integer not null default 0,
  cost_per_serv    numeric(7,2),
  is_prep_friendly boolean not null default false,
  is_freezable     boolean not null default false,
  fridge_life_days smallint,
  is_published     boolean not null default true,
  created_at       timestamptz not null default now()
);
create index idx_recipes_macros on recipes(protein_per_serv, kcal_per_serv);
create index idx_recipes_prep on recipes(is_prep_friendly) where is_published;

create table recipe_ingredients (
  id            uuid primary key default gen_random_uuid(),
  recipe_id     uuid not null references recipes(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  quantity      numeric(8,2) not null,
  unit          measure_unit not null,
  note          text,
  sort_order    smallint not null default 0
);
create index idx_ri_recipe on recipe_ingredients(recipe_id);

create table recipe_steps (
  id           uuid primary key default gen_random_uuid(),
  recipe_id    uuid not null references recipes(id) on delete cascade,
  step_no      smallint not null,
  instruction  text not null,
  duration_min smallint,
  technique    text,
  unique (recipe_id, step_no)
);

create table tags (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,
  label text not null
);
create table recipe_tags (
  recipe_id uuid references recipes(id) on delete cascade,
  tag_id    uuid references tags(id)    on delete cascade,
  primary key (recipe_id, tag_id)
);

-- ── Plans ────────────────────────────────────────────────────────────────────
create table meal_plans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  week_start      date not null,
  status          plan_status not null default 'draft',
  target_snapshot jsonb not null,
  created_at      timestamptz not null default now(),
  unique (user_id, week_start)
);

create table planned_meals (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references meal_plans(id) on delete cascade,
  recipe_id   uuid not null references recipes(id) on delete restrict,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  slot        meal_slot not null,
  servings    numeric(4,2) not null default 1,
  status      meal_status not null default 'planned',
  kcal        integer not null default 0,
  protein_g   integer not null default 0,
  carbs_g     integer not null default 0,
  fat_g       integer not null default 0,
  sort_order  smallint not null default 0,
  -- sort_order (not slot) is the per-day key, so a day can hold multiple snacks.
  unique (plan_id, day_of_week, sort_order)
);
create index idx_pm_plan on planned_meals(plan_id);

-- ── Shopping ─────────────────────────────────────────────────────────────────
create table shopping_lists (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null unique references meal_plans(id) on delete cascade,
  people     smallint not null default 1,
  est_total  numeric(8,2),
  created_at timestamptz not null default now()
);
create table shopping_items (
  id            uuid primary key default gen_random_uuid(),
  list_id       uuid not null references shopping_lists(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  aisle         aisle_type not null,
  quantity      numeric(9,2) not null,
  unit          measure_unit not null,
  est_price     numeric(8,2),
  have_at_home  boolean not null default false,
  checked       boolean not null default false
);
create index idx_si_list on shopping_items(list_id);

-- ── Tracking & progress ──────────────────────────────────────────────────────
create table meal_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  planned_meal_id uuid references planned_meals(id) on delete set null,
  recipe_id       uuid references recipes(id) on delete set null,
  eaten_at        timestamptz not null default now(),
  kcal            integer not null,
  protein_g       integer not null,
  carbs_g         integer not null,
  fat_g           integer not null,
  is_off_plan     boolean not null default false
);
create index idx_logs_user_day on meal_logs(user_id, eaten_at);

create table progress_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  logged_on    date not null,
  weight_kg    numeric(5,1),
  body_fat_pct numeric(4,1),
  waist_cm     numeric(5,1),
  note         text,
  unique (user_id, logged_on)
);

create table pantry_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  quantity      numeric(9,2),
  unit          measure_unit,
  updated_at    timestamptz not null default now(),
  unique (user_id, ingredient_id)
);

create table favorites (
  user_id    uuid references profiles(id) on delete cascade,
  recipe_id  uuid references recipes(id)  on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);
