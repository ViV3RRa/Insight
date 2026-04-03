# US-001: Project Scaffolding

## Story
As the Insight platform user, I want a properly configured React + TypeScript project so that all subsequent development has a solid foundation.

## Dependencies
None

## Requirements
- Initialize a Vite project with React and TypeScript template
- Install core dependencies: react, react-dom, react-router-dom, typescript
- Install styling dependencies: tailwindcss, @tailwindcss/vite (v4) or postcss + autoprefixer (v3)
- Install data fetching: @tanstack/react-query (server state, caching, background refetch)
- Install state management: zustand (client/UI state)
- Install chart library: recharts
- Install icon library: lucide-react
- Install PocketBase JS SDK: pocketbase
- Install schema/validation: zod
- Install form handling: react-hook-form, @hookform/resolvers (Zod resolver for form validation — ADR-1)
- Install date utilities: date-fns (v3+ — tree-shakeable, ESM, locale support — ADR-2)
- Install toast notifications: sonner (ADR-3)
- Install visual testing: @playwright/test (visual regression screenshots — decision §13.5)
- Install testing: vitest, @vitest/coverage-v8, @vitest/ui, jsdom
- Install testing-library: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- Install API mocking: msw
- Configure TypeScript with strict mode enabled
- Set up the `src/` directory structure per PRD §11:
  - `src/components/layout/`
  - `src/components/shared/`
  - `src/components/shared/charts/`
  - `src/components/home/`
  - `src/components/home/dialogs/`
  - `src/components/portfolio/`
  - `src/components/portfolio/dialogs/`
  - `src/components/vehicles/`
  - `src/components/vehicles/dialogs/`
  - `src/services/`
  - `src/stores/`
  - `src/utils/`
  - `src/types/`
- Set up `src/App.tsx` as the root component (placeholder) — wrap with `QueryClientProvider` (TanStack Query)
- Set up `src/main.tsx` as the entry point

## Shared Components Used
N/A

## UI Specification
N/A — backend/tooling story

## Acceptance Criteria
- [ ] `npm run dev` starts the development server without errors
- [ ] `npm test` runs the test suite (Vitest) without errors
- [ ] TypeScript compilation succeeds with strict mode
- [ ] All listed dependencies are installed and importable (including react-hook-form, date-fns, sonner, @playwright/test)
- [ ] Directory structure matches PRD §11 file structure
- [ ] A blank page renders in the browser at localhost
- [ ] Testing infrastructure is importable: vitest, @testing-library/react, msw

## Technical Notes
- Use Vite (not CRA) for fast HMR and modern tooling
- Use `npm` as package manager
- Files to create: `package.json` (via vite init), `tsconfig.json`, `vite.config.ts`, directory structure, `src/App.tsx`, `src/main.tsx`
- `QueryClientProvider` from `@tanstack/react-query` wraps the app in `App.tsx`; create a `QueryClient` with sensible defaults (staleTime, retry)
- Zustand stores live in `src/stores/` — one file per domain (e.g. `themeStore.ts`, `settingsStore.ts`, `portfolioStore.ts`)
- Do NOT install Tailwind forms or typography plugins — the design system uses custom styling throughout
- Testing dependencies are installed at scaffolding time so the test infrastructure (US-148) can be set up immediately after. The `src/test/` directory structure is created by US-148, not this story.
- Add scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`, `"test:ui": "vitest --ui"`
