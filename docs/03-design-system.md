# PrepMeal — Design System

> Tokens, componentes e padrões de UI. Pensado para React Native (Expo) com tema claro/escuro.
> Estado: proposta. Última atualização: 2026-06-28.

---

## 1. Princípios visuais

- **Apetitoso mas focado** — comida em destaque (fotos), UI sóbria à volta.
- **Macros como linguagem visual** — proteína/HC/gordura têm sempre a mesma cor em toda a app.
- **Uma decisão por ecrã** — hierarquia clara, 1 CTA primário por vista.
- **Mobile-first, polegar-friendly** — ações principais no terço inferior.
- **Acessível por defeito** — contraste AA, alvos ≥ 44pt, texto escalável.

---

## 2. Design Tokens

### 2.1 Cor — primitivas
```
brand/500   #10B981  (verde "fresh" — primária)
brand/600   #059669
brand/700   #047857
ink/900     #0F172A  (texto principal)
ink/700     #334155
ink/500     #64748B  (texto secundário)
ink/300     #CBD5E1  (bordas)
ink/100     #F1F5F9  (superfícies)
white       #FFFFFF
black       #000000
```

### 2.2 Cor — macros (semântica fixa em toda a app)
```
macro/protein   #6366F1  (índigo)   P
macro/carbs     #F59E0B  (âmbar)    C
macro/fat       #EF4444  (vermelho) G
macro/calories  #0F172A  (ink)      kcal
```

### 2.3 Cor — feedback
```
success  #16A34A      warning  #D97706
error    #DC2626      info     #2563EB
```

### 2.4 Cor — temas (semantic tokens)
```
                       Light            Dark
bg/canvas              #FFFFFF          #0B1220
bg/surface             #F8FAFC          #131C2B
bg/elevated            #FFFFFF          #1B2638
text/primary           ink/900          #E2E8F0
text/secondary         ink/500          #94A3B8
border/default         ink/300          #2A3850
brand/primary          brand/600        brand/500
```

### 2.5 Tipografia
```
Família: Inter (UI) · número tabular para macros/calorias.
Escala (pt / line-height):
  display   32 / 40   bold      — alvo de calorias, números-herói
  h1        24 / 32   semibold  — títulos de ecrã
  h2        20 / 28   semibold  — secções
  h3        17 / 24   semibold  — cards
  body      15 / 22   regular   — texto
  label     13 / 18   medium    — etiquetas, chips
  caption   12 / 16   regular   — meta (tempo, custo)
```

### 2.6 Espaçamento (escala base 4)
```
space-1 4 · space-2 8 · space-3 12 · space-4 16 · space-5 20
space-6 24 · space-8 32 · space-10 40 · space-12 48
Gutter de ecrã: 16. Gap entre cards: 12.
```

### 2.7 Raio, sombra, borda
```
radius: sm 8 · md 12 · lg 16 · xl 24 · pill 999
shadow/card:     y2 blur8  rgba(15,23,42,.06)
shadow/elevated: y8 blur24 rgba(15,23,42,.12)
border width: 1 (hairline)
```

### 2.8 Movimento
```
duration: fast 120ms · base 200ms · slow 320ms
easing: standard cubic-bezier(.2,.0,0,1)
Uso: bottom sheets (slow), feedback de toque (fast), transições de tab (base).
```

### 2.9 Ícones
```
Set: Lucide (stroke 1.75). Tamanhos: 16 · 20 · 24. Cor herda de text/*.
```

---

## 3. Componentes (biblioteca)

> Cada componente lista props chave e estados. Construir como componentes RN tipados.

### 3.1 Button
- Variantes: `primary` (brand), `secondary` (surface+border), `ghost`, `destructive`.
- Tamanhos: `sm 36`, `md 44`, `lg 52`. Pill ou radius md.
- Estados: default · pressed · loading (spinner) · disabled.
- Largura total no CTA primário de cada ecrã.

### 3.2 MacroRing (anel de calorias/macros)
- Anel central = calorias (consumidas/alvo); 3 segmentos ou 3 barras = P/C/G nas cores fixas.
- Props: `calories {current,target}`, `protein/carbs/fat {current,target}`, `size`.
- Estado "excedido" pinta o excesso a `warning`.

### 3.3 MacroBar
- Barra horizontal individual por macro. `value/target`, cor por tipo, label tabular.

### 3.4 MealCard
- Usado em Hoje/Plano. Slots: imagem/emoji, título, macros (kcal·P/C/G), badge "pronto/por preparar".
- Ações inline: `Marcar comido`, `Trocar (⟳)`, `›` detalhe.
- Estados: planned · ready (verde) · eaten (check, esbatido) · skipped.

### 3.5 IngredientRow
- Checkbox + nome + quantidade + (opcional) corredor. Estado "tenho em casa" risca e desce na lista.

### 3.6 FilterChip
- Toggle pill: `alto P`, `<20min`, `air fryer`, `congelável`, dieta. Estado on = brand fill.

### 3.7 SegmentedControl / Stepper
- Segmented: sexo, ritmo, dia da semana. Stepper: nº refeições, porções, idade.

### 3.8 BottomSheet
- Para Swap, seletor de porções, "adicionar ao plano". Handle no topo, scroll interno, CTA fixo no fundo.

### 3.9 ProgressStepper
- Barra de passos do onboarding (`▮▮▯▯▯` + "Passo 2/5").

### 3.10 RecipeCard
- Grelha 2 colunas. Imagem, título, macro-herói (P + kcal), tempo, ♥ favorito.

### 3.11 Timeline / CookStep
- Lista de passos do Modo Cozinha: estado (○ pendente / ▶ ativo / ▣ feito), timer embebido, indentação para tarefas paralelas.

### 3.12 LabelCard (etiqueta de tupper)
- Refeição · dia · macros · validade. Pré-visualização imprimível.

### 3.13 TabBar
- 5 itens; item central (`⊕ Prep`) elevado/destacado (FAB-style). Ícones Lucide + label.

### 3.14 Estados utilitários
- `EmptyState` (ilustração + texto + CTA), `Skeleton` (loading), `ErrorState` (ícone + ação de recuperação), `Toast/Snackbar` (feedback), `Banner` (sugestão de recalibração).

---

## 4. Padrões de interação

- **Geração de plano**: sempre com skeleton + mensagem; nunca ecrã branco.
- **Swap**: bottom sheet com 3 alternativas a ±5% de macros; confirmação atualiza plano + lista.
- **Sem solução do solver**: ErrorState propõe relaxar 1 constrangimento (orçamento, variedade, equipamento).
- **Marcar comido**: feedback imediato (anel anima) + undo via snackbar.
- **Recalibração**: banner não-intrusivo no Perfil/Hoje, dispensável, com explicação.
- **Unidades**: kg/lb e kcal/kJ respeitam definição global; números sempre tabulares.

---

## 5. Acessibilidade

- Contraste mínimo AA (texto 4.5:1; UI 3:1). Cores de macro testadas em ambos os temas.
- Nunca cor sozinha para informação: macros têm sempre label textual.
- Alvos de toque ≥ 44pt; espaçamento mínimo 8 entre alvos.
- Suporte a Dynamic Type / font scaling; layouts não quebram a 200%.
- Labels de acessibilidade em ícones e VoiceOver/TalkBack em ações.
- Reduz-movimento respeitado nas animações.

---

## 6. Implementação (notas para Expo/RN)

- Tokens centralizados em `theme/` (objeto TS) → consumidos por styled system / `useTheme()`.
- Tema claro/escuro via `useColorScheme()` + tokens semânticos (não cores cruas nos componentes).
- Componentes em `components/ui/` (átomos) e `components/` (compostos: MealCard, MacroRing).
- Tipografia/escala como constantes; `Text` wrapper com variantes (`<Text variant="h1">`).
- Ícones via `lucide-react-native`. Imagens com `expo-image` (cache).
- Recomendado: NativeWind ou Tamagui para tokens + dark mode consistente (decidir no scaffold).
