# CLAUDE.md

- Codex and other reviewers will review your output once you're done.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start          # Start dev server (Expo Go)
npx expo start --ios    # iOS simulator
npx expo start --android # Android emulator
npx tsc --noEmit        # Type-check (run after every change)
npx expo install <pkg>  # Install packages (ensures SDK compatibility)
```

No test framework is configured. No linter is configured.

## Environment

- **Expo SDK 54**, React Native 0.81.5, React 19.1, TypeScript 5.9 (strict)
- **Expo Router v6** (file-based routing), **NativeWind v4** (Tailwind for RN)
- Path alias: `@/*` maps to project root
- Env vars: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

### Auth: Clerk → Supabase bridge

Clerk is the auth provider. Supabase is used purely as the database (no Supabase Auth). The bridge works via the `accessToken` option on the Supabase client:

- `lib/supabase/client.ts` — creates Supabase clients with `accessToken` callback
- `lib/supabase/useSupabase.ts` — **CRITICAL FILE, DO NOT MODIFY** — stabilizes Clerk's `getToken` via `useRef` + `useMemo([])` with empty deps. Adding `getToken` to the dep array reintroduces an infinite re-render loop caused by referential instability in `@clerk/react@5.54.0+`.
- RLS policies use `requesting_user_id()` (a Postgres function that reads `current_setting('request.jwt.claims')::json->>'sub'`)

Auth screens import from `@clerk/expo/legacy` (not `@clerk/expo`):
```ts
// sign-in.tsx / sign-up.tsx — MUST use legacy path
import { useSignIn } from '@clerk/expo/legacy';
import { useSignUp } from '@clerk/expo/legacy';

// useOAuthFlow.ts — MUST use main entry (useSSO only exists there)
import { useSSO } from '@clerk/expo';
```

### Data layer: React Query + Supabase

All data hooks are in `lib/data/` and use `@tanstack/react-query`:

| Hook | Query Key | Purpose |
|------|-----------|---------|
| `useAccountSummary` | `['accountSummary', startDate, endDate]` | Balance + monthly income/expenses |
| `useTransactions` | `['transactions', filter, limit]` | Transaction list |
| `useCategories` | `['categories', userId]` | User categories (auto-seeds defaults for new users) |
| `useCategoryStats` | `['categoryStats', userId]` | Categories with transaction aggregates |
| `useChartData` | `['chartData', startDate, endDate]` | Line/pie/bar chart data |
| `useMerchants` | `['merchants', userId]` | Merchant list for forms |
| `useMerchantStats` | `['merchantStats', userId]` | Merchants with spend totals |
| `useRecurringTransactions` | `['recurringTransactions', userId]` | Recurring transactions |
| `useFeedback` | `['feedback', userId]` | User's feedback submissions |

After mutations, call the corresponding invalidation function from `lib/query/invalidation.ts` (e.g., `invalidateTransactions()` after creating a transaction — this invalidates transactions, accountSummary, chartData, categoryStats, and merchantStats).

Mutations live in `lib/data/mutations.ts`. Every mutation function that modifies user data takes `(db, userId, ...)` and includes `.eq('user_id', userId)` for defence-in-depth alongside RLS.

The shared `useMutationHandler` hook (`lib/hooks/useMutationHandler.ts`) handles the submitting/error/invalidation/navigation pattern. Screens call `execute(mutationFn, invalidationFn, { navigateBack })`.

### Navigation structure

```
app/_layout.tsx              — Root Stack (ClerkProvider → QueryClientProvider → Stack)
├── (auth)/_layout.tsx       — Auth Stack (sign-in, sign-up)
├── (app)/_layout.tsx        — Tab navigator (5 tabs via CustomTabBar)
│   ├── index.tsx            — Dashboard (charts, balance carousel, month selector)
│   ├── transactions.tsx     — Transaction list with search/filter/sort
│   ├── add.tsx              — Dummy placeholder (FAB tab, href: null)
│   ├── categories.tsx       — Categories with KPI carousel
│   └── settings/            — Nested Stack within settings tab
│       ├── _layout.tsx      — Settings Stack
│       ├── index.tsx        — Settings screen
│       ├── merchants.tsx    — Merchant management
│       ├── recurring.tsx    — Recurring transactions
│       └── feedback.tsx     — Bug reports / feature requests
├── add-transaction.tsx      — Modal (presentation: 'modal')
├── edit-transaction.tsx     — Modal
├── add-category.tsx         — Modal
└── edit-category.tsx        — Modal
```

Settings sub-screens (merchants, recurring, feedback) are **nested inside the settings tab** to prevent the double-back navigation bug. Modals are at the root Stack level for proper overlay behavior.

### Design system

All visual tokens live in `constants/theme.ts`: `COLOURS`, `TYPOGRAPHY`, `FONT_SIZES`, `LINE_HEIGHTS`, `SPACING`, `RADIUS`, `SHADOWS`.

- Fonts: Inter (body/UI) + DM Serif Display (display headings only — **never for numbers/currency**)
- Use `style={{ }}` with design tokens for colors, spacing, typography, borders
- `className` is **only** for flex layout: `flex-1`, `flex-row`, `items-center`, `justify-between`, `gap-*`
- Shared components barrel-exported from `components/ui/index.ts`: AppButton, AppCard, AppInput, AppText, AppSelect, AppBadge, AppListRow, AppSectionHeader, AppSkeleton, AppEmptyState, LoadingView, ScreenHeader, ScreenContainer, ModalWrapper, TransactionRow, SocialButton, CustomTabBar

### Database

Supabase PostgreSQL with RLS enabled on all 9 tables. Key patterns:
- `requesting_user_id()` function extracts Clerk user ID from JWT `sub` claim
- All RLS policies use `user_id = requesting_user_id()` (categories SELECT also allows `user_id IS NULL` for global defaults)
- A DB trigger `trg_update_account_balance` auto-recalculates `account_balances.current_balance` after transaction INSERT/UPDATE/DELETE
- Category seeding: `useCategories` auto-seeds 15 default categories for new users (copies from global templates with `is_default = false`)

### MCP servers (configured in .mcp.json)

- **Supabase MCP** — direct DB access for schema inspection, SQL queries, RLS verification
- **Clerk MCP** — SDK snippets and auth patterns
- **Context7** — library documentation lookup (configured in ~/.claude/settings.json)
