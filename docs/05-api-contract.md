# PrepMeal — Contrato de API

> Superfície de API da app. Base: Supabase (Postgres + Auth + PostgREST + Edge Functions).
> Convenções REST para recursos CRUD; **Edge Functions** (RPC) para lógica de negócio
> (cálculos nutricionais, geração de plano, agregação de lista). JSON em camelCase no transporte.
> Auth: Bearer JWT do Supabase em todos os endpoints (exceto signup/login). Estado: proposta.

---

## 1. Estratégia

| Tipo de operação | Mecanismo |
|---|---|
| CRUD simples (profile, favorites, progress, logs) | PostgREST (tabelas + RLS) ou wrapper REST abaixo |
| Lógica/negócio (macros, gerar plano, lista, swap) | **Edge Functions** (`/functions/v1/*`) |
| Realtime (estado do plano/cozinha) | Supabase Realtime (opcional, fase 2) |

> Os endpoints REST abaixo são a **fachada lógica**; podem mapear para PostgREST quando triviais
> e para Edge Functions quando há computação. Códigos: `200/201` ok, `400` validação,
> `401` não autenticado, `403` RLS, `404`, `409` conflito, `422` solver sem solução.

---

## 2. Auth
```
POST /auth/v1/signup           { email, password }            → { user, session }
POST /auth/v1/token?grant_type=password { email, password }   → { access_token, refresh_token }
POST /auth/v1/logout
```
(Geridos pelo Supabase Auth; social login Google/Apple via OAuth.)

---

## 3. Perfil & Nutrição

### Criar/atualizar perfil (onboarding)
```
PUT /me/profile
Body:
{
  "sex": "male", "birthDate": "2002-03-10", "heightCm": 178, "weightKg": 80,
  "bodyFatPct": 14, "activity": "moderate", "workoutsPerWeek": 5,
  "goal": "bulk", "goalPace": "moderate", "diet": "omnivore",
  "allergies": ["lactose"], "avoid": ["liver"], "favoritesTags": ["chicken","rice"],
  "mealsPerDay": 4, "prepDays": [0,3], "prepMinutes": 120,
  "equipment": ["oven","airfryer","stove"], "skillLevel": 3, "budgetWeekly": 60,
  "unitSystem": "metric", "energyUnit": "kcal"
}
→ 200 { "profile": { ... } }
```

### Calcular alvo de macros (preview, não persiste)
```
POST /nutrition/calculate
Body: { ... mesmos campos antropométricos + goal/goalPace }
→ 200
{
  "bmr": 1810, "tdee": 2360,
  "target": { "calories": 2650, "proteinG": 185, "carbsG": 320, "fatG": 70 },
  "rationale": "bulk moderado (+12%); proteína 2.0 g/kg; gordura 0.8 g/kg; HC restante",
  "source": "mifflin_st_jeor"
}
```

### Confirmar/ativar alvo
```
POST /nutrition/targets        { "calories":2650,"proteinG":185,"carbsG":320,"fatG":70 }
→ 201 { "target": { "id": "...", "isActive": true } }
GET  /nutrition/targets/active → 200 { "target": {...} }
GET  /nutrition/targets        → 200 { "history": [ ... ] }    // recalibrações
```

### Sugestão de recalibração
```
GET /nutrition/recalibration
→ 200
{
  "suggested": true,
  "reason": "peso estável há 18 dias em bulk",
  "delta": { "calories": +150 },
  "proposedTarget": { "calories":2800, "proteinG":185, "carbsG":355, "fatG":72 }
}
```

---

## 4. Receitas

```
GET /recipes?diet=omnivore&maxTime=20&minProtein=40&tags=high_protein,quick
            &prepFriendly=true&q=frango&cursor=...&limit=20
→ 200 { "items": [ RecipeSummary ], "nextCursor": "..." }

GET /recipes/{id}
→ 200
{
  "id":"...", "title":"Frango teriyaki + arroz", "imageUrl":"...",
  "servings":1, "prepMinutes":10, "cookMinutes":15,
  "perServing": { "calories":720,"proteinG":52,"carbsG":80,"fatG":14 },
  "costPerServing":2.4, "isPrepFriendly":true, "isFreezable":true, "fridgeLifeDays":4,
  "equipment":["stove","oven"], "tags":["high_protein","quick"],
  "ingredients":[ {"name":"frango","quantity":180,"unit":"g","aisle":"butcher"}, ... ],
  "steps":[ {"stepNo":1,"instruction":"...","durationMin":15,"technique":"oven"}, ... ]
}

POST   /recipes/{id}/favorite        → 201
DELETE /recipes/{id}/favorite        → 204
GET    /me/favorites                 → 200 { "items":[ RecipeSummary ] }
POST   /recipes                       (fase 2: receita do utilizador)
```

`RecipeSummary`: `{ id, title, imageUrl, perServing{calories,proteinG}, prepMinutes, isPrepFriendly, isFavorite }`

---

## 5. Plano semanal (core)

### Gerar plano (solver)
```
POST /plans/generate
Body:
{
  "weekStart": "2026-06-29",
  "variety": "balanced",          // simple | balanced | high
  "overrides": { "mealsPerDay": 4, "budgetWeekly": 60 }   // opcional; default do perfil
}
→ 201
{
  "plan": {
    "id":"...", "weekStart":"2026-06-29", "status":"draft",
    "targetSnapshot": { "calories":2650,"proteinG":185,"carbsG":320,"fatG":70 },
    "days": [
      { "dayOfWeek":1, "totals":{"calories":2640,"proteinG":182,...},
        "meals":[
          {"id":"pm_..","slot":"breakfast","recipe":{RecipeSummary},
           "servings":1,"macros":{"calories":480,"proteinG":30,...},"status":"planned"},
          ...
        ] },
      ...
    ],
    "weekSummary": { "avgCalories":2638, "proteinAdherence":0.97, "estCost":58.2 }
  }
}
→ 422  { "error":"no_solution",
         "relaxSuggestions":["increase_budget","lower_variety","add_equipment"] }
```

### Ler / confirmar / arquivar
```
GET   /plans/current                 → 200 { plan }       // semana ativa
GET   /plans/{id}                     → 200 { plan }
POST  /plans/{id}/confirm             → 200 { plan(status=confirmed), shoppingListId }
POST  /plans/{id}/archive             → 200
```

### Regenerar parcial
```
POST /plans/{id}/regenerate          { "scope":"day", "dayOfWeek":3 }   // day | week
→ 200 { plan }
```

### Swap de uma refeição
```
GET  /plans/{id}/meals/{mealId}/alternatives
→ 200 { "alternatives":[ { "recipe":RecipeSummary, "macros":{...}, "deltaPct":0.7 }, ... ] }

PUT  /plans/{id}/meals/{mealId}      { "recipeId":"...", "servings":1 }
→ 200 { "meal":{...}, "dayTotals":{...}, "shoppingListUpdated":true }
```

---

## 6. Lista de Compras

```
GET /plans/{id}/shopping-list
→ 200
{
  "id":"sl_...", "people":1, "estTotal":58.2,
  "aisles":[
    { "aisle":"produce", "items":[
        {"id":"si_..","name":"Brócolos","quantity":600,"unit":"g",
         "estPrice":1.8,"haveAtHome":false,"checked":false}, ... ] },
    { "aisle":"butcher", "items":[ ... ] }
  ]
}

PATCH /shopping-items/{id}           { "haveAtHome":true }      // ou { "checked":true }
→ 200 { "item":{...}, "estTotal":56.4 }

PUT   /shopping-lists/{id}           { "people":2 }             // re-escala quantidades
→ 200 { shoppingList }

GET   /shopping-lists/{id}/export?format=pdf                   → 200 (ficheiro / signed URL)
```

---

## 7. Modo Cozinha (Batch)

```
POST /plans/{id}/cook-plan
Body: { "select": [ { "dayOfWeek":1,"slot":"lunch" }, ... ] }   // refeições a preparar
→ 200
{
  "estimateMinutes": 105, "containers": 8,
  "timeline":[
    {"order":1,"instruction":"Pré-aquecer forno 200º","durationMin":0,"technique":"oven"},
    {"order":2,"instruction":"Temperar frango e salmão","durationMin":6,"technique":"prep"},
    {"order":3,"instruction":"Forno: frango + salmão","durationMin":25,"technique":"oven",
     "parallel":true,"thenStartOrder":4},
    ...
  ],
  "labels":[
    {"meal":"Frango teriyaki + arroz","day":"Seg","slot":"lunch",
     "macros":{"calories":720,"proteinG":52,"carbsG":80,"fatG":14},
     "useByDate":"2026-07-03"}, ...
  ]
}

POST /plans/{id}/cook-plan/complete
Body: { "preparedMeals":[ "pm_..","pm_.." ] }    // marca como 'ready'
→ 200 { "updated": 8 }
```

---

## 8. Tracking & Progresso

```
POST /meals/{plannedMealId}/eat        → 200 { "log":{...}, "dayTotals":{...} }
POST /logs                              // refeição fora do plano
Body: { "recipeId":"..." | "manual":{"calories":600,"proteinG":40,"carbsG":50,"fatG":18},
        "eatenAt":"2026-06-28T13:10:00Z" }
→ 201 { "log":{...} }
DELETE /logs/{id}                       → 204   // undo

GET /tracking/today                     → 200
{ "target":{...}, "consumed":{"calories":1480,"proteinG":120,...},
  "remaining":{"calories":1170,...}, "meals":[ ... ] }

GET /tracking/adherence?from=2026-06-22&to=2026-06-28
→ 200 { "planCompletion":0.88, "proteinHitRate":0.91, "streakWeeks":3 }

POST /progress                          { "loggedOn":"2026-06-28","weightKg":81.2,"bodyFatPct":13.8 }
GET  /progress?from=...&to=...          → 200 { "entries":[ ... ], "trend":{"weightDelta":+1.2} }
```

---

## 9. Despensa (fase 2)

```
GET    /pantry                          → 200 { "items":[ {ingredient, quantity, unit} ] }
PUT    /pantry/items                    { "ingredientId":"...","quantity":2,"unit":"un" }
DELETE /pantry/items/{ingredientId}     → 204
POST   /plans/generate  { "useUpPantry": true }   // viés p/ usar stock existente
```

---

## 10. Modelos partilhados (schemas)

```
Macros        = { calories:int, proteinG:int, carbsG:int, fatG:int }
RecipeSummary = { id, title, imageUrl, perServing:{calories,proteinG},
                  prepMinutes, isPrepFriendly, isFavorite }
PlannedMeal   = { id, slot, dayOfWeek, recipe:RecipeSummary, servings, macros:Macros, status }
Plan          = { id, weekStart, status, targetSnapshot:Macros, days:[Day], weekSummary }
Day           = { dayOfWeek, totals:Macros, meals:[PlannedMeal] }
ShoppingItem  = { id, name, quantity, unit, aisle, estPrice, haveAtHome, checked }
```

---

## 11. Erros (formato uniforme)
```json
{ "error": "no_solution",
  "message": "Não foi possível encaixar todas as refeições nos constrangimentos.",
  "details": { "relaxSuggestions": ["increase_budget","lower_variety"] } }
```
Códigos de erro de negócio: `no_solution`, `target_required`, `plan_exists`,
`recipe_not_found`, `meal_locked`, `budget_exceeded`.

---

## 12. Notas de implementação
- **Idempotência**: `POST /plans/generate` com mesma `weekStart` devolve `409 plan_exists`
  (usar `regenerate` para refazer) — evita planos duplicados por toques repetidos.
- **Paginação**: cursor-based em `/recipes`.
- **Cálculos no servidor**: macros e custo nunca aceites do cliente; recomputados sempre.
- **Edge Functions sugeridas**: `nutrition-calculate`, `plan-generate`, `plan-regenerate`,
  `shopping-aggregate`, `cook-plan`, `recalibration-check`.
- **Rate limiting** no solver (`plan-generate`) por utilizador.
