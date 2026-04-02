# US-004: PocketBase Client and Auth Service

## Story
As the Insight platform user, I want a configured PocketBase client and authentication service so that I can log in and all data operations are properly scoped.

## Dependencies
- US-001: Project Scaffolding (must be completed first)

## Requirements
- Create `src/services/pb.ts`: Initialize and export a PocketBase client instance
  - PocketBase URL should be configurable via environment variable (`VITE_POCKETBASE_URL`)
  - Default to `http://127.0.0.1:8090` for local development
- Create `src/services/auth.ts`: Authentication service with functions:
  - `login(email: string, password: string)`: Authenticate via PocketBase email/password auth
  - `logout()`: Clear auth state
  - `isAuthenticated()`: Check if current session is valid
  - `getCurrentUser()`: Get the current authenticated user record
  - `onAuthChange(callback)`: Subscribe to auth state changes
- Session persistence: Use PocketBase SDK's built-in token handling (localStorage)
- Single user model — no roles or permissions needed (PRD §2.2)
- All subsequent service modules will use the exported PocketBase instance

## Shared Components Used
N/A — backend service story

## UI Specification
N/A

## Acceptance Criteria
- [ ] PocketBase client connects to the configured URL
- [ ] `login()` authenticates with email/password and persists session
- [ ] `logout()` clears the session
- [ ] `isAuthenticated()` returns true after successful login, false after logout
- [ ] Session survives page reload (token persisted in localStorage)
- [ ] Auth state changes trigger registered callbacks
- [ ] PRD §2.2, §14 criterion 44: Authentication via PocketBase works

## Technical Notes
- Files to create: `src/services/pb.ts`, `src/services/auth.ts`
- Create `.env` with `VITE_POCKETBASE_URL=http://127.0.0.1:8090`
- Add `.env` to `.gitignore`
- The PocketBase SDK handles token refresh automatically
- Error handling: throw meaningful errors for invalid credentials, network failures
