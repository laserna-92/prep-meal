# PrepMeal — Modelo de Dados (PostgreSQL / Supabase)

> Schema relacional, relações, índices e regras (RLS). Alinhado com persona Gym e stack Supabase.
> Convenções: `snake_case`, PKs `uuid` (default `gen_random_uuid()`), timestamps `timestamptz`.
> Estado: proposta. Última atualização: 2026-06-28.

---

## 1. Diagrama de entidades (ER)

```
auth.users (Supabase)
   │ 1:1
profiles ───1:1─── nutrition_targets
   │
   ├─1:N─ meal_plans ──1:N─ planned_meals ──N:1─ recipes
   │           │                                  │
   │           └─1:1─ shopping_lists ─1:N─ shopping_items
   │                                              ▲
   ├─1:N─ progress_entries                        │ (agregado de)
   ├─1:N─ meal_logs ──N:1─ recipes        recipe_ingredients ─N:1─ ingredients
   └─1:N─ pantry_items ─N:1─ ingredients          ▲
                                          recipes ─1:N─ recipe_steps
recipes ─N:N(recipe_tags)─ tags
favorites (user ⇄ recipe)
```

---

## 2. Enums

```sql
create type goal_type        as enum ('cut','maintain','bulk');
create type goal_pace        as enum ('slow','moderate','aggressive');
create type sex_type         as enum ('male','female');
create type activity_level   as enum ('sedentary','light','moderate','active','athlete');
create type diet_type        as enum ('omnivore','vegetarian','vegan','low_carb','mediterranean');
create type meal_slot        as enum ('breakfast','lunch','dinner','snack');
create type plan_status      as enum ('draft','confirmed','archived');
create type meal_status      as enum ('planned','ready','eaten','skipped');
create type unit_system      as enum ('metric','imperial');
create type energy_unit      as enum ('kcal','kj');
create type measure_unit     as enum ('g','ml','un','tbsp','tsp','cup');
create type aisle_type       as enum ('produce','butcher','fish','dairy','grocery','frozen','bakery','other');
```

---

## 3. Tabelas

### 3.1 profiles
```sql
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  sex             sex_type      not null,
  birth_date      date          not null,
  height_cm       numeric(5,1)  not null,
  weight_kg       numeric(5,1)  not null,
  body_fat_pct    numeric(4,1),
  activity        activity_level not null,
  workouts_per_wk smallint      not null default 0,
  goal            goal_type     not null,
  goal_pace       goal_pace     not null default 'moderate',
  diet            diet_type     not null default 'omnivore',
  allergies       text[]        not null default '{}',
  avoid           text[]        not null default '{}',
  favorites_tags  text[]        not null default '{}',
  meals_per_day   smallint      not null default 4 check (meals_per_day between 1 and 8),
  prep_days       smallint[]    not null default '{0}',     -- 0=Dom..6=Sáb
  prep_minutes    smallint,
  equipment       text[]        not null default '{}',       -- oven,airfryer,stove,microwave
  skill_level     smallint      not null default 3 check (skill_level between 1 and 5),
  budget_weekly   numeric(7,2),
  unit_system     unit_system   not null default 'metric',
  energy_unit     energy_unit   not null default 'kcal',
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);
```

### 3.2 nutrition_targets (alvo atual + histórico via versões)
```sql
create table nutrition_targets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  calories    integer not null,
  protein_g   integer not null,
  carbs_g     integer not null,
  fat_g       integer not null,
  bmr         integer not null,
  tdee        integer not null,
  is_active   boolean not null default true,
  source      text    not null default 'mifflin_st_jeor',
  created_at  timestamptz not null default now()
);
create unique index one_active_target_per_user
  on nutrition_targets(user_id) where is_active;
```

### 3.3 ingredients (catálogo nutricional — por 100 g/ml)
```sql
create table ingredients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  aisle         aisle_type not null default 'other',
  base_unit     measure_unit not null default 'g',  -- base de referência (100 base_unit)
  kcal_per_100  numeric(7,2) not null,
  protein_per_100 numeric(6,2) not null,
  carbs_per_100   numeric(6,2) not null,
  fat_per_100     numeric(6,2) not null,
  density_g_ml  numeric(6,3),                        -- conversão ml→g quando aplicável
  price_per_100 numeric(7,3),                        -- custo estimado
  source_ref    text,                                -- USDA fdc_id / OFF barcode
  created_at    timestamptz not null default now()
);
create index idx_ingredients_name on ingredients using gin (to_tsvector('simple', name));
```

### 3.4 recipes
```sql
create table recipes (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references profiles(id) on delete set null, -- null = receita do sistema
  title          text not null,
  description    text,
  image_url      text,
  servings       smallint not null default 1,
  prep_minutes   smallint not null default 0,
  cook_minutes   smallint not null default 0,
  equipment      text[]  not null default '{}',
  diet           diet_type[] not null default '{omnivore}',
  suitable_slots meal_slot[] not null default '{breakfast,lunch,dinner,snack}', -- slots onde encaixa (usado pelo solver)
  -- macros por porção (desnormalizado p/ performance; recalculado on write)
  kcal_per_serv  integer not null,
  protein_per_serv integer not null,
  carbs_per_serv   integer not null,
  fat_per_serv     integer not null,
  cost_per_serv  numeric(7,2),
  is_prep_friendly boolean not null default false,   -- aguenta 3-5 dias
  is_freezable     boolean not null default false,
  fridge_life_days smallint,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now()
);
create index idx_recipes_macros on recipes(protein_per_serv, kcal_per_serv);
create index idx_recipes_prep on recipes(is_prep_friendly) where is_published;
```

### 3.5 recipe_ingredients
```sql
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
```

### 3.6 recipe_steps
```sql
create table recipe_steps (
  id          uuid primary key default gen_random_uuid(),
  recipe_id   uuid not null references recipes(id) on delete cascade,
  step_no     smallint not null,
  instruction text not null,
  duration_min smallint,                 -- p/ timers no Modo Cozinha
  technique   text,                      -- oven|stove|prep|rest — p/ otimizar roteiro
  unique (recipe_id, step_no)
);
```

### 3.7 tags + recipe_tags
```sql
create table tags (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,            -- high_protein, quick, budget, freezable
  label text not null
);
create table recipe_tags (
  recipe_id uuid references recipes(id) on delete cascade,
  tag_id    uuid references tags(id)    on delete cascade,
  primary key (recipe_id, tag_id)
);
```

### 3.8 meal_plans
```sql
create table meal_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  week_start  date not null,                     -- segunda/domingo da semana
  status      plan_status not null default 'draft',
  target_snapshot jsonb not null,                -- macros usados na geração
  created_at  timestamptz not null default now(),
  unique (user_id, week_start)
);
```

### 3.9 planned_meals
```sql
create table planned_meals (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references meal_plans(id) on delete cascade,
  recipe_id   uuid not null references recipes(id) on delete restrict,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  slot        meal_slot not null,
  servings    numeric(4,2) not null default 1,
  status      meal_status not null default 'planned',
  -- macros efetivos = recipe (por porção) × servings (desnormalizado)
  kcal        integer not null,
  protein_g   integer not null,
  carbs_g     integer not null,
  fat_g       integer not null,
  sort_order  smallint not null default 0,
  -- sort_order (não slot) é a chave por dia, para permitir várias refeições do mesmo slot (ex.: 2 snacks)
  unique (plan_id, day_of_week, sort_order)
);
create index idx_pm_plan on planned_meals(plan_id);
```

### 3.10 shopping_lists + shopping_items
```sql
create table shopping_lists (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null unique references meal_plans(id) on delete cascade,
  people      smallint not null default 1,
  est_total   numeric(8,2),
  created_at  timestamptz not null default now()
);
create table shopping_items (
  id            uuid primary key default gen_random_uuid(),
  list_id       uuid not null references shopping_lists(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  aisle         aisle_type not null,
  quantity      numeric(9,2) not null,         -- somado/deduplicado
  unit          measure_unit not null,
  est_price     numeric(8,2),
  have_at_home  boolean not null default false,
  checked       boolean not null default false
);
create index idx_si_list on shopping_items(list_id);
```

### 3.11 meal_logs (tracking)
```sql
create table meal_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  planned_meal_id uuid references planned_meals(id) on delete set null,
  recipe_id     uuid references recipes(id) on delete set null,
  eaten_at      timestamptz not null default now(),
  kcal          integer not null,
  protein_g     integer not null,
  carbs_g       integer not null,
  fat_g         integer not null,
  is_off_plan   boolean not null default false
);
create index idx_logs_user_day on meal_logs(user_id, eaten_at);
```

### 3.12 progress_entries
```sql
create table progress_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  logged_on   date not null,
  weight_kg   numeric(5,1),
  body_fat_pct numeric(4,1),
  waist_cm    numeric(5,1),
  note        text,
  unique (user_id, logged_on)
);
```

### 3.13 pantry_items (fase 2)
```sql
create table pantry_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  quantity      numeric(9,2),
  unit          measure_unit,
  updated_at    timestamptz not null default now(),
  unique (user_id, ingredient_id)
);
```

### 3.14 favorites
```sql
create table favorites (
  user_id   uuid references profiles(id) on delete cascade,
  recipe_id uuid references recipes(id)  on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);
```

---

## 4. Regras de integridade & lógica

- **Macros desnormalizados** (`recipes`, `planned_meals`, `shopping_items`) são recalculados
  por triggers/funções no servidor a partir de `recipe_ingredients` × `ingredients`. Nunca
  confiar no cliente para os valores nutricionais.
- **Um alvo ativo por utilizador** garantido por índice parcial; recalibrar cria nova linha
  e desativa a anterior (histórico preservado).
- **Plano único por semana** (`unique(user_id, week_start)`); confirmar muda `status` para `confirmed`.
- **Lista de compras** gerada por função `generate_shopping_list(plan_id)` que agrega
  `recipe_ingredients` de todas as `planned_meals`, converte unidades (via `density_g_ml`),
  soma por `ingredient_id` e estima preço.

---

## 5. Row-Level Security (Supabase)

```sql
alter table profiles            enable row level security;
alter table nutrition_targets   enable row level security;
alter table meal_plans          enable row level security;
alter table planned_meals       enable row level security;
alter table shopping_lists      enable row level security;
alter table shopping_items      enable row level security;
alter table meal_logs           enable row level security;
alter table progress_entries    enable row level security;
alter table pantry_items        enable row level security;
alter table favorites           enable row level security;

-- Padrão: dono acede só aos seus dados
create policy "own_rows" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own_rows" on meal_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- (repetir o padrão user_id = auth.uid() nas tabelas filhas; nas que ligam via plan_id,
--  validar com EXISTS sobre meal_plans do utilizador)

-- Catálogo partilhado: leitura pública, escrita só de receitas próprias
alter table recipes enable row level security;
create policy "read_published" on recipes
  for select using (is_published or owner_id = auth.uid());
create policy "write_own" on recipes
  for insert with check (owner_id = auth.uid());
create policy "update_own" on recipes
  for update using (owner_id = auth.uid());

-- ingredients / tags: leitura pública, escrita só service_role.
```

---

## 6. Índices-chave (resumo)
- `recipes(protein_per_serv, kcal_per_serv)` e parcial `is_prep_friendly` → matching do solver.
- GIN em `ingredients.name` e `recipes` (pesquisa textual).
- `planned_meals(plan_id)`, `shopping_items(list_id)`, `meal_logs(user_id, eaten_at)`.

---

## 7. Seed inicial (MVP)
- ~80–100 receitas **high-protein / prep-friendly** (persona Gym).
- Catálogo de ingredientes via **USDA FoodData Central** (macros) + **Open Food Facts** (códigos/preços).
- Tags: `high_protein`, `quick`, `budget`, `freezable`, `low_carb`, `one_pan`.
