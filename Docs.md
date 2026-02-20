# Macros — Codebase Documentation

A React Native / Expo app for AI-powered macro tracking. Users describe a meal in natural language, the app calls the Gemini API to estimate its macros, and stores them in a local SQLite database.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Database](#database)
5. [Theming](#theming)
6. [App Entry & Root Layout — `app/_layout.tsx`](#app-entry--root-layout)
7. [Tab Layout — `app/(tabs)/_layout.tsx`](#tab-layout)
8. [Screens](#screens)
   - [Home — `app/(tabs)/index.tsx`](#home-screen)
   - [Gains — `app/(tabs)/gains.tsx`](#gains-screen)
9. [Context — `context/MacrosContext.tsx`](#context)
10. [Libs — `libs/gemini.ts`](#libs)
11. [Components](#components)
    - [`CircularProgress`](#circularprogress)
    - [`Dialog` (AI result)](#dialog)
    - [`MealDetailDialog`](#mealdetaildialog)

---

## Tech Stack

| Library                                                                  | Purpose                             |
| ------------------------------------------------------------------------ | ----------------------------------- |
| [Expo](https://expo.dev) (SDK 54)                                        | Build toolchain & native modules    |
| [Expo Router](https://expo.github.io/router)                             | File-based navigation               |
| [React Native Paper](https://callstack.github.io/react-native-paper/)    | Material Design 3 UI components     |
| [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)         | Local SQLite database               |
| [react-native-svg](https://github.com/software-mansion/react-native-svg) | SVG rendering for circular progress |
| [axios](https://axios-http.com)                                          | HTTP client for Gemini API calls    |
| [Google Gemini REST API](https://ai.google.dev/gemini-api/docs)          | AI meal analysis                    |

---

## Project Structure

```
Macros/
├── app/
│   ├── _layout.tsx          # Root layout: theming, SQLite init, Stack navigator
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar layout, wraps screens in MacrosProvider
│       ├── index.tsx        # Home screen: progress rings + today's meal list
│       └── gains.tsx        # Gains screen: AI meal logging
├── components/
│   ├── CircularProgress.tsx # Reusable SVG circular progress ring
│   ├── Dialog.tsx           # AI analysis result dialog (with Add Meal action)
│   └── MealDetailDialog.tsx # Read-only meal detail dialog (from meal list)
├── context/
│   └── MacrosContext.tsx    # Shared state: today's totals + meal list
├── libs/
│   └── gemini.ts            # Gemini REST API call
├── assets/
│   └── images/
├── .env                     # EXPO_PUBLIC_GEMINI_API_KEY
├── app.json
├── tsconfig.json
└── package.json
```

---

## Environment Variables

Stored in `.env` at the project root. Must use the `EXPO_PUBLIC_` prefix to be accessible in the client bundle.

```
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

> ⚠️ This key is bundled into the client app. For production, proxy API calls through a backend server instead.

After changing `.env`, restart the Expo dev server with `--clear`:

```bash
npx expo start --clear
```

---

## Database

Managed by `expo-sqlite`. The database file is `macros.db`, created and initialised in `app/_layout.tsx`.

### Schema

```sql
CREATE TABLE IF NOT EXISTS meals (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT    NOT NULL,
  calories  INTEGER NOT NULL,
  protein   INTEGER NOT NULL,
  carbs     INTEGER NOT NULL,
  fats      INTEGER NOT NULL,
  date      TEXT    DEFAULT CURRENT_DATE
);
```

`PRAGMA journal_mode = WAL` is enabled for better concurrent read performance.

### Access pattern

- `SQLiteProvider` wraps the entire app (in `AppStack` inside `_layout.tsx`)
- Screens and context access the DB via `useSQLiteContext()` from `expo-sqlite`
- `MacrosContext` is the only place that runs read queries
- `gains.tsx` runs the only write query (`INSERT`)

---

## Theming

Defined in `app/_layout.tsx`. The app has full **light and dark** Material Design 3 themes that switch automatically based on the device's system setting (`useColorScheme()`).

### Light theme key colors

| Role         | Color     | Notes                         |
| ------------ | --------- | ----------------------------- |
| `primary`    | `#2E7D32` | Deep green — health, energy   |
| `secondary`  | `#F57F17` | Warm amber — calories, energy |
| `tertiary`   | `#0277BD` | Blue — hydration              |
| `background` | `#F9FBF9` | Off-white with green tint     |
| `surface`    | `#FFFFFF` | Cards, dialogs, tab bar       |
| `error`      | `#B00020` | Over-goal indicator           |

### Dark theme key colors

| Role         | Color     | Notes                        |
| ------------ | --------- | ---------------------------- |
| `primary`    | `#81C784` | Soft green, readable on dark |
| `secondary`  | `#FFB74D` | Muted amber                  |
| `background` | `#121712` | Near-black with green tint   |
| `surface`    | `#1E2620` | Dark green-grey              |
| `error`      | `#CF6679` | Muted rose                   |

The theme flows into all `react-native-paper` components automatically. The tab bar and Stack navigator headers are also themed via `useTheme()` inside their respective layout components.

---

## App Entry & Root Layout

**`app/_layout.tsx`**

The root of the app. Responsibilities:

1. **Defines `lightTheme` and `darkTheme`** — full MD3 color overrides
2. **`RootLayout`** — picks the correct theme based on `useColorScheme()` and wraps everything in `<PaperProvider>`
3. **`AppStack`** — inner component (needed so `useTheme()` can be called inside `PaperProvider`). Wraps the Stack navigator with `<SQLiteProvider>`, which initialises the SQLite database on first launch via `initializeDatabase`
4. **`initializeDatabase`** — runs `PRAGMA journal_mode = WAL` and creates the `meals` table if it doesn't exist

```
PaperProvider (theme)
  └── SQLiteProvider (macros.db)
        └── Stack
              └── (tabs) [headerShown: false]
```

---

## Tab Layout

**`app/(tabs)/_layout.tsx`**

Wraps both tab screens with `<MacrosProvider>` so they share macro state. Configures the bottom tab bar colors from `useTheme()`.

```
MacrosProvider
  └── Tabs
        ├── index  (Home, house icon)
        └── gains  (Gains, trending-up icon)
```

---

## Screens

### Home Screen

**`app/(tabs)/index.tsx`**

Displays today's nutritional summary and logged meals.

**State**

- `selectedMeal: Meal | null` — the meal currently shown in `MealDetailDialog`

**Data**

- `todayTotals` and `todayMeals` from `useMacros()` context
- `fetchTodayProgress()` called on mount via `useEffect`

**Layout (ScrollView)**

1. Large `CircularProgress` for total calories (goal: 2000 kcal)
2. Row of three smaller `CircularProgress` rings:
   - Protein (goal: 150 g, red `#E53935`)
   - Carbs (goal: 250 g, orange `#FB8C00`)
   - Fat (goal: 65 g, purple `#8E24AA`)
3. `Today's Meals` list — one `List.Item` per logged meal showing name and macro summary. Tapping opens `MealDetailDialog`
4. Empty state message if no meals logged yet

---

### Gains Screen

**`app/(tabs)/gains.tsx`**

The meal logging screen. Users describe a meal in natural language and the app uses Gemini to estimate its macros.

**State**

- `prompt: string` — text input value
- `result: string` — raw JSON string from Gemini
- `dialogVisible: boolean` — controls the analysis dialog

**Flow**

1. User types a meal description and taps **Gimme Macros!**
2. `handleSend()` calls `fetchGains(prompt)` from `libs/gemini.ts`
3. Raw JSON response is stored in `result` and `DialogBox` is shown
4. User reviews the analysis and taps **Add Meal**
5. `logMeal()` inserts the parsed data into SQLite, then calls `fetchTodayProgress()` to refresh the home screen's state
6. Dialog closes

**Error handling**

- Axios errors are caught and logged to the console with the full Gemini error body

---

## Context

**`context/MacrosContext.tsx`**

Provides shared macro data to both tab screens, avoiding prop drilling and preventing duplicate DB queries.

### Types

```ts
type Meal = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};
```

> `Meal` is defined and exported from `components/MealDetailDialog.tsx` and imported here.

### Exported API

| Export           | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| `MacrosProvider` | Wrap around components that need macro data (used in tabs `_layout.tsx`) |
| `useMacros()`    | Hook to access `{ todayTotals, todayMeals, fetchTodayProgress }`         |

### `fetchTodayProgress()`

Runs two queries in parallel via `Promise.all`:

1. Aggregates `SUM` of all macros for `CURRENT_DATE`
2. Fetches all individual meal rows for `CURRENT_DATE` ordered by `id DESC`

Both results update their respective state slices, triggering re-renders in any component using `useMacros()`.

---

## Libs

**`libs/gemini.ts`**

> ⚠️ This file must **not** be placed inside `app/` — Expo Router treats all files in `app/` as routes.

Handles communication with the Google Gemini REST API.

### `fetchGains(prompt: string): Promise<string>`

Makes a `POST` to:

```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

Sends a system instruction that forces the model to return a strict JSON object:

```json
{
  "name": "Grilled Chicken Salad",
  "calories": 450,
  "protein": 42,
  "carbs": 18,
  "fats": 22,
  "evaluation": "High protein, moderate fat..."
}
```

Returns the raw text string from the first response candidate. JSON parsing is handled by the caller (`Dialog.tsx`).

---

## Components

### CircularProgress

**`components/CircularProgress.tsx`**

A reusable SVG-based circular arc progress indicator.

**Props**

| Prop          | Type      | Default      | Description                             |
| ------------- | --------- | ------------ | --------------------------------------- |
| `current`     | `number`  | —            | Current value                           |
| `goal`        | `number`  | —            | Target value                            |
| `size`        | `number`  | `180`        | Diameter in dp                          |
| `strokeWidth` | `number`  | `14`         | Arc thickness                           |
| `label`       | `string`  | `"Calories"` | Label below the number                  |
| `unit`        | `string`  | `"kcal"`     | Unit shown next to goal                 |
| `color`       | `string?` | `undefined`  | Fixed arc color (overrides theme logic) |

**Color logic**

| Condition                   | Color                                    |
| --------------------------- | ---------------------------------------- |
| `progress >= 1` (over goal) | `theme.colors.error` (always)            |
| `color` prop provided       | Uses that color                          |
| `progress >= 0.85`          | `theme.colors.secondary` (amber warning) |
| Otherwise                   | `theme.colors.primary` (green)           |

**Implementation**

- Uses `react-native-svg` `<Circle>` with `strokeDasharray` / `strokeDashoffset` to draw the arc
- Arc starts at the top via `<G rotation="-90">`
- Center text is absolutely positioned over the SVG

---

### Dialog

**`components/Dialog.tsx`**

Shown after `fetchGains()` returns. Displays the AI meal analysis and lets the user confirm or cancel logging.

**Props**

| Prop        | Type                               | Description                                          |
| ----------- | ---------------------------------- | ---------------------------------------------------- |
| `text`      | `string`                           | Raw JSON string from Gemini                          |
| `visible`   | `boolean`                          | Controls dialog visibility                           |
| `onDismiss` | `() => void`                       | Called on cancel or dismiss                          |
| `logMeal`   | `(mealData: any) => Promise<void>` | Called with parsed meal data when user taps Add Meal |

**Behaviour**

- Parses `text` with `JSON.parse` inside a `try/catch`. If parsing fails, shows the raw text instead of crashing
- **Add Meal** button is `disabled` when `mealData` is `null` (parse failed)
- `await logMeal(mealData)` is called before `onDismiss()` to ensure the DB write and progress refresh complete before the dialog closes

---

### MealDetailDialog

**`components/MealDetailDialog.tsx`**

A read-only dialog for viewing a previously logged meal's macros. Opened from the meal list on the Home screen.

**Exports**

- `Meal` type (also used by `MacrosContext`)
- `default MealDetailDialog` component

**Props**

| Prop        | Type           | Description                                         |
| ----------- | -------------- | --------------------------------------------------- |
| `meal`      | `Meal \| null` | The meal to display. Dialog renders empty if `null` |
| `visible`   | `boolean`      | Controls dialog visibility                          |
| `onDismiss` | `() => void`   | Called when the user taps Close                     |

No write operations — purely for display.
