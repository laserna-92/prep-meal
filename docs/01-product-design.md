# PrepMeal — Documento de Design de Produto

> Blueprint funcional e de UX/UI da app de meal prep semanal.
> Estado: **proposta inicial** (pré-desenvolvimento). Última atualização: 2026-06-28.

---

## 1. Visão e Problema

### O problema
As pessoas que querem comer melhor (perder gordura, ganhar massa, manter saúde) falham
não por falta de conhecimento, mas por **falta de sistema e de fricção na execução**:
- Não sabem *quanto* comer (calorias/macros) para o seu objetivo.
- Não sabem *o que* cozinhar que encaixe nesses números.
- Perdem tempo a planear refeições, a fazer listas de compras e a repetir decisões.
- Cozinham por impulso, desperdiçam comida e saem do plano ao 3.º dia.

### A proposta de valor
**"Do objetivo ao tupperware em 10 minutos."**
A PrepMeal transforma o objetivo do utilizador (e os seus constrangimentos — tempo,
orçamento, equipamento, restrições alimentares) num **plano semanal de refeições já porcionado**,
com **lista de compras agregada** e **roteiro de confeção em lote (batch cooking)**.

### Princípios de produto
1. **Reduzir decisões, não aumentar opções.** O ecrã principal mostra *o próximo passo*, não um menu infinito.
2. **Nutrição correta por defeito.** Cálculos baseados em fórmulas validadas (Mifflin-St Jeor), não em palpites.
3. **Realismo > perfeição.** Plano adapta-se ao tempo e skill real; um swap rápido é melhor que abandonar o plano.
4. **O prep é o herói.** A app é otimizada para *cozinhar uma vez, comer a semana toda*.

---

## 2. Público-alvo e Personas

| Persona | Objetivo | Dor principal | O que precisa da app |
|---|---|---|---|
| **Gym Bro / Cut & Bulk** (24, treina 5x) | Hipertrofia / definição com macros precisos | Atingir proteína diária, comida monótona | Macros precisos, alto teor proteico, variedade controlada |
| **Profissional ocupado** (34) | Perder 6 kg, comer melhor | Sem tempo para cozinhar todos os dias | Batch cooking domingo → 5 dias prontos |
| **Família / casal** (40) | Refeições saudáveis e económicas | Planear para vários, desperdício | Escalar porções, lista de compras eficiente, orçamento |
| **Iniciante saudável** (28) | "Comer melhor" sem saber por onde começar | Paralisia de decisão | Planos guiados, receitas simples, educação leve |

**Persona primária para o MVP (decidida):** *Gym Bro / Cut & Bulk*.
O MVP é otimizado para quem treina e precisa de **macros precisos, alto teor proteico
e variedade controlada**, com forte intenção de uso semanal. As restantes personas
(profissional ocupado, família, iniciante) são alvo de v1.1+.

**Implicações da escolha no MVP:**
- Precisão de macros é prioridade nº1 (matching apertado, proteína por refeição).
- Receitas seed enviesadas para *high-protein* e *meal-prep friendly*.
- Tracking de macros e recalibração ganham destaque já na v1.
- Tom e copy orientados a objetivos de composição corporal (cut/bulk/maintenance).

---

## 3. O que a App Contém (Módulos / Funcionalidades)

### 3.1 Onboarding & Perfil Nutricional
- Dados antropométricos: sexo, idade, altura, peso, % gordura (opcional).
- Nível de atividade e frequência de treino (sedentário → atleta).
- **Objetivo**: perder gordura / manter / ganhar massa, com ritmo (agressivo/moderado/lento).
- Cálculo automático de **TDEE** e alvo de **calorias + macros** (proteína/HC/gordura).
- Preferências e restrições: dietas (omnívora, vegetariana, vegana, low-carb, mediterrânica),
  alergias/intolerâncias, alimentos a evitar/favoritos.
- Constrangimentos de prep: nº refeições/dia, dias que faz prep, tempo disponível,
  equipamento (forno, air fryer, fogão), skill culinário, orçamento semanal.

### 3.2 Gerador de Plano Semanal (core)
- Algoritmo que monta a grelha **7 dias × N refeições** respeitando macros + constrangimentos.
- **Modo Batch Cooking**: agrupa receitas que partilham ingredientes e técnicas para cozinhar em lote.
- Variedade configurável (repetir refeições para simplicidade vs. variar).
- Distribuição de macros por refeição (ex.: mais HC à volta do treino).
- Regenerar plano inteiro, ou só um dia, ou só uma refeição (**swap**).

### 3.3 Biblioteca de Receitas
- Receitas com macros por porção, tempo, custo estimado, equipamento, tags (alto proteína, meal-prep friendly, congelável).
- Filtros e pesquisa; favoritos.
- Indicador de **"prep-friendly"** (aguenta 3–5 dias no frigorífico / congela bem).
- Receita do utilizador (criar/importar) — fase posterior.

### 3.4 Lista de Compras Inteligente
- Agrega ingredientes de todo o plano, **soma quantidades** e **deduplica**.
- Organiza por **corredor de supermercado** (hortícolas, talho, laticínios, mercearia…).
- Ajusta a porções/nº de pessoas; marca o que já se tem em casa (despensa).
- Custo estimado total e por refeição; exportar/partilhar.

### 3.5 Modo Cozinha / Batch Cooking
- **Roteiro de confeção otimizado**: ordem de tarefas paralelas ("enquanto o frango assa, corta os legumes").
- Timeline com timers, agrupamento por técnica (tudo o que vai ao forno junto).
- Checklist de porcionamento por tupperware com etiqueta (refeição + dia + macros).

### 3.6 Tracking & Aderência
- Marcar refeições como comidas; barra de progresso de macros do dia.
- Aderência semanal (% do plano cumprido), streaks.
- Peso/medidas ao longo do tempo e ajuste automático do alvo calórico (a app sugere recalibrar a cada 2–3 semanas).

### 3.7 Despensa (Pantry) — fase 2
- Inventário do que se tem; gerar plano "usa o que já tens"; reduzir desperdício.

### 3.8 Definições & Conta
- Perfil, objetivos, unidades (kg/lb, kcal/kJ), notificações, subscrição, privacidade/GDPR.

---

## 4. Arquitetura de Informação (IA)

### 4.1 Navegação principal (Tab Bar — 5 separadores)

```
┌──────────────────────────────────────────────────────────────┐
│   Hoje        Plano        [ + Prep ]      Receitas    Perfil   │
│  (Today)     (Plan)        (ação core)     (Recipes)  (Profile) │
└──────────────────────────────────────────────────────────────┘
```

1. **Hoje** — o que comer agora, próxima refeição, progresso de macros do dia, atalho para cozinhar.
2. **Plano** — grelha da semana (7 dias), editar/swap, regenerar, ver lista de compras.
3. **+ Prep** (botão central destacado) — inicia o fluxo de gerar/planear ou o Modo Cozinha.
4. **Receitas** — biblioteca, pesquisa, filtros, favoritos.
5. **Perfil** — objetivos, métricas, progresso, definições, subscrição.

### 4.2 Mapa do site (hierarquia)

```
PrepMeal
├── Onboarding
│   ├── Objetivo
│   ├── Dados corporais & atividade
│   ├── Restrições & preferências
│   ├── Constrangimentos de prep (tempo, equipamento, orçamento)
│   └── Resumo de macros calculados → CTA "Gerar 1.º plano"
│
├── Hoje
│   ├── Card refeição atual + próximas
│   ├── Anel de macros/calorias do dia
│   ├── Ações rápidas: marcar comido · swap · ver receita
│   └── Atalho "Iniciar prep"
│
├── Plano (Semana)
│   ├── Grelha 7 dias × refeições
│   ├── Detalhe da refeição → Receita
│   ├── Swap / Regenerar (dia | refeição | semana)
│   ├── Resumo nutricional semanal
│   └── → Lista de Compras
│         ├── Agrupada por corredor
│         ├── Marcar "tenho em casa"
│         ├── Ajustar pessoas/porções
│         └── Exportar / Partilhar / Custo
│
├── Modo Cozinha (Batch)
│   ├── Selecionar receitas/dia a preparar
│   ├── Roteiro otimizado + timeline + timers
│   └── Porcionamento + etiquetas tupperware
│
├── Receitas
│   ├── Pesquisa & filtros (macro, tempo, dieta, equipamento, prep-friendly)
│   ├── Detalhe (ingredientes, passos, macros, custo)
│   └── Favoritos · Criar receita (fase 2)
│
└── Perfil
    ├── Objetivos & macros (editar/recalcular)
    ├── Progresso (peso, aderência, streaks, gráficos)
    ├── Despensa (fase 2)
    ├── Definições (unidades, notificações, conta, GDPR)
    └── Subscrição / Plano premium
```

### 4.3 Modelo de dados (entidades centrais)

```
User ─1:1─ Profile ─1:1─ NutritionTargets (kcal, protein, carbs, fat)
User ─1:N─ MealPlan (week) ─1:N─ PlannedMeal ─N:1─ Recipe
Recipe ─1:N─ RecipeIngredient ─N:1─ Ingredient (com dados nutricionais)
MealPlan ─1:1─ ShoppingList ─1:N─ ShoppingItem (agrega RecipeIngredient)
User ─1:N─ ProgressEntry (peso/medidas/data)
User ─1:N─ MealLog (refeição comida + timestamp)
User ─1:N─ PantryItem (fase 2)
```

---

## 5. User Flows (fluxos do utilizador)

### Flow A — Primeira utilização (Onboarding → 1.º plano)
```
[Abrir app]
   → Welcome (proposta de valor, 3 slides)
   → Escolher objetivo (perder / manter / ganhar)
   → Inserir dados (sexo, idade, altura, peso, atividade, treino)
   → [Cálculo] TDEE + macros  ── mostra "O teu alvo: 2 100 kcal · 180P/210C/60G"
   → Restrições/preferências (dieta, alergias, alimentos a evitar)
   → Constrangimentos (nº refeições, dias de prep, tempo, equipamento, orçamento)
   → Resumo do perfil → [CTA: Gerar o meu plano]
   → Plano semanal gerado → tour rápido → Hoje
```
**Métrica de sucesso:** % de utilizadores que chegam a um plano gerado (ativação).

### Flow B — Ciclo semanal recorrente (o coração do produto)
```
[Domingo de manhã, notificação "Hora de planear a semana"]
   → Plano → Rever semana sugerida
   → Ajustar (swap refeições que não apetecem, fixar favoritas)
   → Confirmar plano
   → Lista de compras (auto-gerada) → marcar despensa → ir às compras / exportar
   → [Sessão de prep] Modo Cozinha → roteiro → cozinhar em lote → porcionar tuppers
   → Durante a semana: Hoje → comer → marcar como feito → tracking de macros
```

### Flow C — Swap rápido de refeição (reduzir abandono)
```
[Hoje / Plano] → Refeição que não apetece → "Trocar"
   → App sugere 3 alternativas com macros equivalentes (±5%) e mesmo perfil
   → Selecionar → Plano e Lista de Compras atualizam automaticamente
```

### Flow D — Recalibração de objetivo (progresso)
```
[Perfil → Progresso] registar peso
   → A cada 2–3 semanas: app deteta estagnação/desvio
   → Sugere ajuste de calorias (+/- 150 kcal) com explicação
   → Aceitar → próximos planos usam o novo alvo
```

### Flow E — Descoberta de receita
```
[Receitas] → Filtrar (ex.: alto proteína · < 20 min · air fryer)
   → Abrir receita → ver macros/custo → "Adicionar ao plano" (escolher dia/refeição)
   → Lista de compras atualiza
```

---

## 6. Task Flows (passo-a-passo de tarefas críticas)

### Task 1 — Gerar plano semanal
1. Tab **Plano** → botão **Gerar**.
2. Confirmar parâmetros (objetivo, nº refeições, variedade, orçamento) — pré-preenchidos do perfil.
3. App corre o algoritmo (macros + constrangimentos + disponibilidade de receitas).
4. Apresenta grelha 7×N com resumo nutricional e custo estimado.
5. Estados: *loading* (skeleton) → *sucesso* (grelha) → *erro/sem solução* (sugerir relaxar um constrangimento).
6. CTA: **Confirmar plano** → desbloqueia Lista de Compras e Modo Cozinha.

### Task 2 — Gerar e usar a Lista de Compras
1. **Plano → Lista de Compras**.
2. App agrega ingredientes de todas as PlannedMeal, soma quantidades, deduplica, converte unidades.
3. Agrupa por corredor; mostra custo total.
4. Utilizador marca itens "já tenho" (vão para baixo/riscados).
5. Ajustar nº de pessoas → recalcula quantidades.
6. Ações: **Exportar** (PDF/partilhar), **Modo compras** (checklist grande, mãos-livres).

### Task 3 — Sessão de Batch Cooking (Modo Cozinha)
1. **+ Prep → Modo Cozinha** → selecionar dias/refeições a preparar.
2. App gera **roteiro otimizado** (paraleliza tarefas, agrupa por equipamento/técnica).
3. Timeline passo-a-passo com timers integrados.
4. No fim: **porcionamento** — quantos tuppers, etiqueta por refeição (dia + macros).
5. Marcar prep concluído → refeições ficam "prontas" em Hoje.

### Task 4 — Registar refeição e acompanhar macros
1. **Hoje** → card da refeição → **Marcar como comida**.
2. Anel de macros/calorias do dia atualiza.
3. Se comeu fora do plano: **+ Registar refeição** (busca rápida ou foto — fase 2).

### Task 5 — Editar perfil / recalcular macros
1. **Perfil → Objetivos**.
2. Alterar objetivo/peso/atividade → recalcular TDEE + macros (preview do antes/depois).
3. Guardar → escolher aplicar já ao plano atual ou só ao próximo.

---

## 7. Lógica de Nutrição (regras de negócio)

- **BMR**: Mifflin-St Jeor.
  `Homem: 10·peso(kg) + 6.25·altura(cm) − 5·idade + 5`
  `Mulher: 10·peso + 6.25·altura − 5·idade − 161`
- **TDEE** = BMR × fator de atividade (1.2 sedentário → 1.9 atleta).
- **Alvo calórico**: défice/superávite conforme objetivo e ritmo
  (perda moderada ≈ −15–20%; ganho moderado ≈ +10–15%).
- **Macros (default):**
  - Proteína: 1.6–2.2 g/kg de peso (limite superior em défice/treino de força).
  - Gordura: ≥ 0.6–0.8 g/kg (mínimo hormonal).
  - HC: calorias restantes.
- **Distribuição por refeição**: proteína espalhada (~0.4 g/kg por refeição), HC à volta do treino.
- **Tolerância de matching de receitas**: ±5% por macro ao dia; rebalanceia ao longo do dia/semana.
- **Disclaimer**: estimativas educativas, não substituem aconselhamento médico/nutricional.

---

## 8. UX / UI — Diretrizes

- **Mobile-first**, tab bar de 5 (botão central de ação em destaque).
- **Estados sempre desenhados**: vazio (sem plano → CTA gerar), loading (skeletons), erro, sucesso.
- **Progressive disclosure**: onboarding curto; detalhe nutricional escondido atrás de "ver mais".
- **Acessibilidade**: contraste AA, toques ≥ 44px, suporte a leitor de ecrã, unidades configuráveis.
- **Sistema de design**: tokens (cores, tipografia, espaçamento), componentes reutilizáveis
  (Card de refeição, Anel de macros, Linha de ingrediente, Chip de filtro).
- **Tom**: encorajador e prático, sem culpa. "Falhaste um dia? Faz swap e continua."
- **Notificações**: planear semana (domingo), lembrete de prep, lembrete de refeição, recalibração.

---

## 9. Stack Técnica Proposta (a confirmar)

| Camada | Opção recomendada | Alternativa |
|---|---|---|
| **App** | React Native + Expo (iOS+Android+web num só código) | Flutter |
| **Estado/dados** | TypeScript, Zustand/Redux, React Query | — |
| **Backend** | Node (NestJS) ou Supabase (Postgres + Auth + Storage) | Firebase |
| **BD** | PostgreSQL | — |
| **Dados nutricionais** | API externa (ex.: USDA FoodData Central / Open Food Facts) | seed próprio |
| **Auth** | Supabase Auth / Clerk (email + social) | — |
| **Pagamentos** | RevenueCat (subscrições in-app) | Stripe |

> **Stack decidida (recomendação técnica aceite): Expo (React Native) + Supabase + RevenueCat.**
> Justificação: um só código para iOS/Android/web acelera o MVP; Supabase entrega
> Postgres + Auth + Storage sem montar backend de raiz; RevenueCat trata das subscrições
> in-app. Dados nutricionais via USDA FoodData Central / Open Food Facts, com seed próprio
> de receitas high-protein curadas para a persona Gym.

---

## 10. Roadmap de Releases

### MVP (v1) — validar o ciclo core
- Onboarding + cálculo de macros.
- Gerador de plano semanal (biblioteca de receitas curada, ~50–100 receitas).
- Lista de compras agregada por corredor.
- Modo Cozinha básico (lista de passos + porcionamento).
- Tracking simples (marcar comido + anel de macros).

### v1.1 — Aderência
- Swap inteligente, regenerar parcial, favoritos, notificações.
- Progresso (peso, aderência, recalibração sugerida).

### v2 — Personalização & escala
- Despensa/inventário e "usa o que tens".
- Receitas do utilizador / importação.
- Escalar para família, partilha de plano.
- Foto-logging com estimativa (IA), integração wearables (passos/calorias).

### v3 — Comunidade & monetização
- Planos de treinadores/criadores, marketplace de receitas, premium.

---

## 11. Métricas de Sucesso (North Star)

- **North Star:** nº de **sessões de prep concluídas por utilizador/semana**.
- Ativação: % que gera o 1.º plano no onboarding.
- Retenção: utilizadores que planeiam ≥ 2 semanas seguidas.
- Aderência: % do plano cumprido por semana.
- Eficiência: tempo médio "objetivo → plano confirmado" (alvo < 10 min).

---

## 12. Riscos & Mitigação

| Risco | Mitigação |
|---|---|
| Variedade insuficiente de receitas → monotonia | Biblioteca curada + algoritmo de variedade + swaps |
| Cálculos nutricionais errados / responsabilidade | Fórmulas validadas + disclaimers + dados de fonte fiável |
| Abandono ao fim de 1–2 semanas | Swap fácil, notificações, streaks, recalibração que mostra progresso |
| Solver de plano sem solução (constrangimentos rígidos) | Relaxamento progressivo + mensagens claras |
| Dados de ingredientes/preços imprecisos | Fonte externa + permitir correção do utilizador |

---

## Próximo passo proposto
1. **Validar este blueprint contigo** (ajustar personas, MVP, stack).
2. Definir o **design system** e os **wireframes de baixa fidelidade** dos 5 ecrãs principais.
3. Modelar a **base de dados** e o **contrato de API**.
4. Arrancar o **scaffold do projeto** (Expo + Supabase) e implementar o Flow A (onboarding + macros).
```
