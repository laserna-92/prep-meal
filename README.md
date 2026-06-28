# PrepMeal 🍱

App de **meal prep semanal**: do objetivo (cut/bulk/manter) ao tupperware porcionado,
com plano semanal, lista de compras inteligente e roteiro de batch cooking.

## Documentação de design (pré-desenvolvimento)

| Doc | Conteúdo |
|---|---|
| [01 — Product Design](docs/01-product-design.md) | Visão, personas, módulos, IA, user/task flows, nutrição, roadmap |
| [02 — Wireframes](docs/02-wireframes.md) | Esboços de baixa fidelidade dos ecrãs principais |
| [03 — Design System](docs/03-design-system.md) | Tokens, tipografia, componentes, acessibilidade |
| [04 — Data Model](docs/04-data-model.md) | Schema PostgreSQL/Supabase, relações, RLS |
| [05 — API Contract](docs/05-api-contract.md) | Endpoints REST + Edge Functions, schemas, erros |

## Decisões de produto
- **Persona primária (MVP):** Gym (cut & bulk) — foco em precisão de macros e high-protein.
- **Stack:** Expo (React Native) + Supabase + RevenueCat; dados nutricionais via USDA / Open Food Facts.

## Arrancar o projeto (app Expo)

```bash
npm install                 # ou: npx expo install (reconcilia versões do SDK)
cp .env.example .env        # preencher EXPO_PUBLIC_SUPABASE_URL / ANON_KEY
npm start                   # abre o Expo dev server (i = iOS, a = Android, w = web)
npm run typecheck           # tsc --noEmit
```

> A app corre com **dados mock** (`src/lib/mock.ts`) até o Supabase estar ligado,
> por isso podes ver todos os ecrãs sem backend. O onboarding já calcula macros a sério.

## Estrutura do projeto

```
app/                      # rotas (expo-router)
  (onboarding)/           # wizard: welcome → goal → body → preferences → constraints → summary
  (tabs)/                 # Hoje · Plano · Prep · Receitas · Perfil
src/
  theme/                  # design tokens + ThemeProvider/useTheme (doc 03)
  components/ui/          # átomos: Text, Button, Card, MacroRing, MacroBar, Field, SelectRow
  components/             # compostos: MealCard
  lib/                    # nutrition (Mifflin-St Jeor), supabase, mock
  state/                  # onboarding store
  types/                  # tipos de domínio (doc 04/05)
```

## Backend (Supabase)

```
supabase/
  migrations/   schema, triggers (macro recompute), RLS, plan-generate RPC
  seed.sql      ingredient catalogue + starter high-protein recipes
  _test/        local Postgres validation (auth shim + Flow A integration test)
```

Ver `supabase/README.md`. Decisão: nutrição calcula-se no cliente
(`src/lib/nutrition.ts`) e a geração de plano é um **RPC Postgres**
(`generate_meal_plan`) protegido por RLS — testável em CI, sem Edge Function.

**Flow A ligado:** no fim do onboarding, se o Supabase estiver configurado, a app
faz sign-in anónimo, persiste perfil + alvo de macros e gera o plano da semana;
o separador **Hoje** lê o plano real. Sem env configurado, corre tudo em mock.

A camada de acesso vive em `src/api/` (`auth`, `profile`, `plan`, `shopping`, `cook`).

**Modo Cozinha:** o separador Prep seleciona refeições, gera um roteiro de batch
cooking otimizado (passos fundidos/ordenados por técnica + etiquetas de tupperware
via RPC `cook_plan`) e marca as refeições como prontas.

## CI

`.github/workflows/ci.yml` corre em cada push/PR:
- **database** — sobe Postgres 16, aplica migrations + seed e corre os testes SQL
  (`scripts/db-test.sh`): geração de plano, swap/confirmar, lista de compras,
  roteiro de cozinha e isolamento RLS.
- **app** — `npm ci`, `tsc --noEmit` e `expo export` (web).

## Stack
Expo (React Native) + expo-router · TypeScript · Supabase (auth/dados/RLS/RPC) ·
react-native-svg (anéis de macros) · lucide-react-native (ícones).

> Estado atual: **scaffold funcional + backend validado**. Flow A (onboarding →
> macros → plano) ligado ao Supabase, com fallback para mock.
