# PrepMeal — Wireframes de Baixa Fidelidade

> Esboços dos ecrãs principais (mobile-first, 1 coluna).
> Notação: `[ ]` botão · `( )` toggle/radio · `▢` checkbox · `›` navega · `⟳` ação · `▮▮▮` barra/anel.
> Estado: proposta. Última atualização: 2026-06-28.

---

## Mapa de ecrãs

```
Onboarding (5 passos) → Hoje ⇆ Plano ⇆ +Prep(Modo Cozinha) ⇆ Receitas ⇆ Perfil
                                  └→ Lista de Compras
```

---

## 1. Onboarding

### 1.1 Welcome
```
┌─────────────────────────────┐
│                             │
│        🍱  PrepMeal          │
│                             │
│   Do objetivo ao tupperware │
│        em 10 minutos.       │
│                             │
│   ● ○ ○   (3 slides)        │
│                             │
│   [   Começar            ]  │
│   já tenho conta · Entrar   │
└─────────────────────────────┘
```

### 1.2 Objetivo
```
┌─────────────────────────────┐
│ ‹ Voltar          Passo 1/5 │
│ ▮▮▯▯▯                        │
│                             │
│ Qual é o teu objetivo?      │
│                             │
│ ( ) Perder gordura  (cut)   │
│ (•) Ganhar massa   (bulk)   │
│ ( ) Manter        (maint.)  │
│                             │
│ Ritmo:                      │
│  ( ) Lento ( •) Moderado    │
│  ( ) Agressivo              │
│                             │
│ [   Continuar            ]  │
└─────────────────────────────┘
```

### 1.3 Dados corporais & atividade
```
┌─────────────────────────────┐
│ ‹ Voltar          Passo 2/5 │
│ ▮▮▮▯▯                        │
│                             │
│ Sobre ti                    │
│  Sexo   ( H )( M )          │
│  Idade  [ 24 ]              │
│  Altura [ 178 ] cm          │
│  Peso   [ 80  ] kg          │
│  % gordura (opcional) [ 14 ]│
│                             │
│ Atividade diária            │
│  ▾ Moderada (treino 3-5x)   │
│ Treinos/semana  [ 5 ]       │
│                             │
│ [   Continuar            ]  │
└─────────────────────────────┘
```

### 1.4 Restrições & preferências
```
┌─────────────────────────────┐
│ ‹ Voltar          Passo 3/5 │
│ ▮▮▮▮▯                        │
│                             │
│ Dieta                       │
│  ▢ Omnívora ▢ Vegetariana   │
│  ▢ Vegana   ▢ Low-carb      │
│  ▢ Mediterrânica            │
│                             │
│ Alergias / evitar           │
│  [ + adicionar ]  #lactose  │
│  #amendoim ✕                │
│                             │
│ Favoritos (opcional)        │
│  #frango #arroz #ovos       │
│                             │
│ [   Continuar            ]  │
└─────────────────────────────┘
```

### 1.5 Constrangimentos de prep
```
┌─────────────────────────────┐
│ ‹ Voltar          Passo 4/5 │
│ ▮▮▮▮▮                        │
│                             │
│ Refeições/dia    [ 4 ]      │
│ Dias de prep  ▢Dom ▢Qua     │
│ Tempo p/ prep    ▾ 2h       │
│ Equipamento                 │
│   ▢ Forno ▢ Air fryer       │
│   ▢ Fogão ▢ Micro-ondas     │
│ Skill culinário ●●●○○        │
│ Orçamento/sem   [ 60 ] €    │
│                             │
│ [   Calcular o meu plano ]  │
└─────────────────────────────┘
```

### 1.6 Resumo de macros (resultado)
```
┌─────────────────────────────┐
│            Passo 5/5         │
│                             │
│   O teu alvo diário         │
│        ╭───────╮            │
│        │ 2 650 │ kcal        │
│        ╰───────╯            │
│   Proteína  ▮▮▮▮▮▮  185 g    │
│   Hidratos  ▮▮▮▮▮   320 g    │
│   Gordura   ▮▮▮     70 g     │
│                             │
│   Bulk moderado · +12%      │
│   ⓘ Como calculámos isto    │
│                             │
│ [   Gerar o meu plano →   ] │
└─────────────────────────────┘
```

---

## 2. Hoje (Tab 1)

```
┌─────────────────────────────┐
│ Hoje · Dom, 28 Jun      ⚙   │
│                             │
│  Macros do dia              │
│   ╭───────╮  P ▮▮▮▮▯ 120/185│
│   │ 1 480 │  C ▮▮▮▯▯ 180/320│
│   │ /2650 │  G ▮▮▯▯▯ 40/70  │
│   ╰───────╯  kcal           │
│                             │
│  A SEGUIR · 13:00           │
│ ┌─────────────────────────┐ │
│ │ 🍗 Frango teriyaki +    │ │
│ │    arroz                │ │
│ │ 720 kcal · 52P/80C/14G  │ │
│ │ ✅ pronto no frigorífico │ │
│ │ [Marcar comido] [Trocar]│ │
│ └─────────────────────────┘ │
│                             │
│  Mais logo                  │
│  • 16:30 Batido proteico  › │
│  • 20:00 Salmão + legumes › │
│                             │
│  [ + Registar refeição ]    │
│ ───────────────────────────│
│ Hoje  Plano  ⊕  Receitas  Eu│
└─────────────────────────────┘
```

---

## 3. Plano — Semana (Tab 2)

```
┌─────────────────────────────┐
│ Plano · 28 Jun–4 Jul    ⟳   │
│ Seg Ter Qua Qui Sex Sáb [Dom]│
│  ●   ●   ●   ●   ●   ●   ●   │
│                             │
│ Domingo            2 640 kcal│
│ ┌─────────────────────────┐ │
│ │ Peq-almoço  Ovos+aveia  ›│ │
│ │ 480 · 30P/45C/18G       │ │
│ ├─────────────────────────┤ │
│ │ Almoço  Frango teriyaki ›│ │
│ │ 720 · 52P/80C/14G   ⟳   │ │
│ ├─────────────────────────┤ │
│ │ Snack  Batido proteico  ›│ │
│ ├─────────────────────────┤ │
│ │ Jantar  Salmão+legumes  ›│ │
│ └─────────────────────────┘ │
│ Resumo semana ▾  P 96% alvo │
│                             │
│ [ 🛒 Lista de compras ]      │
│ [ ⟳ Regenerar ▾ ] dia|sem   │
│ ───────────────────────────│
│ Hoje  Plano  ⊕  Receitas  Eu│
└─────────────────────────────┘
```

### 3.1 Swap (bottom sheet)
```
┌─────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ┌─────────────────────────┐ │
│ │ Trocar "Frango teriyaki"│ │
│ │ alvo ~720 · 52P/80C/14G │ │
│ │ ─────────────────────── │ │
│ │ ○ Peru + batata-doce    │ │
│ │   715 · 54P/78C/12G  ✓  │ │
│ │ ○ Carne picada + arroz  │ │
│ │   730 · 50P/82C/15G     │ │
│ │ ○ Atum + massa          │ │
│ │   705 · 55P/75C/13G     │ │
│ │ ─────────────────────── │ │
│ │ [ Confirmar troca ]     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 4. Lista de Compras

```
┌─────────────────────────────┐
│ ‹ Plano    Lista de compras │
│ 28 Jun–4 Jul · ~58 €  · 👥1 ▾│
│                             │
│ 🥦 Hortícolas               │
│  ▢ Brócolos        600 g    │
│  ▢ Cenoura         500 g    │
│ 🥩 Talho                    │
│  ▢ Peito de frango 1.4 kg   │
│  ▢ Salmão          600 g    │
│ 🥛 Laticínios               │
│  ▣ Ovos            18 un  ⌁ │  ← já tenho (riscado)
│ 🌾 Mercearia                │
│  ▢ Arroz           1 kg     │
│  ▢ Aveia           500 g    │
│                             │
│ [ 🛒 Modo compras ] [ ⤴ ]   │
└─────────────────────────────┘
```

---

## 5. +Prep → Modo Cozinha (Tab 3, ação central)

### 5.1 Selecionar o que preparar
```
┌─────────────────────────────┐
│ ‹           Modo Cozinha     │
│ O que vais preparar hoje?    │
│  ▣ Almoços (Seg–Sex) ×5      │
│  ▣ Jantares (Seg–Qua) ×3     │
│  ▢ Snacks                    │
│                             │
│ Estimativa: 1h45 · 8 tuppers│
│ [ Gerar roteiro → ]          │
└─────────────────────────────┘
```

### 5.2 Roteiro otimizado (timeline)
```
┌─────────────────────────────┐
│ ‹  Roteiro · ~1h45     ⏱ on │
│                             │
│ ▣ 0:00 Pré-aquecer forno    │
│ ▣ 0:02 Temperar frango+salm.│
│ ▶ 0:08 Forno: frango+salmão │
│        ⏱ 25:00  [ timer ]   │
│   ┊  (enquanto assa…)        │
│ ○ 0:10 Cozer arroz (2 cháv.)│
│ ○ 0:12 Cortar legumes       │
│ ○ 0:30 Bater batidos        │
│ ○ 0:35 Arrefecer 10 min     │
│ ○ 0:45 Porcionar →           │
│                             │
│ [ Passo seguinte ]           │
└─────────────────────────────┘
```

### 5.3 Porcionamento + etiquetas
```
┌─────────────────────────────┐
│ ‹  Porcionar (8 tuppers)     │
│                             │
│ ┌── Etiqueta ─────────────┐ │
│ │ ALMOÇO · Seg            │ │
│ │ Frango teriyaki + arroz │ │
│ │ 720 kcal 52P/80C/14G    │ │
│ │ Validade: 4 Jul         │ │
│ └─────────────────────────┘ │
│  ‹ tupper 1/8 ›              │
│                             │
│ ▢ Imprimir etiquetas        │
│ [ Concluir prep ✓ ]          │
└─────────────────────────────┘
```

---

## 6. Receitas (Tab 4)

```
┌─────────────────────────────┐
│ Receitas           🔍        │
│ [alto P][<20min][air fryer] +│
│                             │
│ ┌────────┐ ┌────────┐        │
│ │ 🍗 img  │ │ 🐟 img  │       │
│ │ Frango  │ │ Salmão  │       │
│ │ 52P 720 │ │ 48P 540 │       │
│ │ 25min ♥ │ │ 20min ♡ │       │
│ └────────┘ └────────┘        │
│ ┌────────┐ ┌────────┐        │
│ │ 🥩 img  │ │ 🍚 img  │       │
│ │ Peru    │ │ Bowl    │       │
│ └────────┘ └────────┘        │
│ ───────────────────────────│
│ Hoje  Plano  ⊕  Receitas  Eu│
└─────────────────────────────┘
```

### 6.1 Detalhe da receita
```
┌─────────────────────────────┐
│ ‹            Frango teriyaki ♥│
│ ┌─────────────────────────┐ │
│ │        [ imagem ]       │ │
│ └─────────────────────────┘ │
│ ⏱25min · 👥1 ▾ · 💶~2.4€    │
│ 🏷 alto proteína · congelável│
│                             │
│  Macros (porção)            │
│  720 kcal · 52P/80C/14G     │
│                             │
│ Ingredientes  ▾             │
│  • 180 g frango             │
│  • 80 g arroz               │
│  • molho teriyaki …         │
│ Preparação  ▾               │
│  1. …                       │
│                             │
│ [ + Adicionar ao plano ]    │
└─────────────────────────────┘
```

---

## 7. Perfil (Tab 5)

```
┌─────────────────────────────┐
│ Perfil                  ⚙   │
│  Gonçalo · Bulk moderado    │
│                             │
│ Objetivo & macros        ›  │
│  2 650 kcal · 185P/320C/70G │
│  [ Recalcular ]             │
│                             │
│ Progresso                ›  │
│  Peso ▮▮▮▮▮▱ 80→81.2 kg     │
│  Aderência semana  88%      │
│  🔥 Streak: 3 semanas       │
│  ⓘ Sugestão: +150 kcal      │
│                             │
│ Despensa                 ›  │
│ Definições               ›  │
│ Subscrição (Free)  [Upgrade]│
│ ───────────────────────────│
│ Hoje  Plano  ⊕  Receitas  Eu│
└─────────────────────────────┘
```

---

## Estados transversais (a desenhar sempre)

```
VAZIO (sem plano)         LOADING (gerar plano)      ERRO (sem solução)
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   🍽️          │          │  ▱▱▱▱▱ skeleton│          │  ⚠            │
│ Sem plano     │          │  A montar a   │          │ Não consegui  │
│ ainda.        │          │  tua semana…  │          │ encaixar tudo │
│ [Gerar plano] │          │  ▱▱▱▱▱        │          │ [Relaxar      │
│               │          │               │          │  orçamento]   │
└──────────────┘          └──────────────┘          └──────────────┘
```
