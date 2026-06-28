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

> Estado atual: fase de design. Sem código de app ainda.
