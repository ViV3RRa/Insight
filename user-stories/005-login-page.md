# US-005: Login Page

## Story
As the Insight platform user, I want a login screen so that I can authenticate before accessing my data.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens (must be completed first)
- US-003: Font Loading (must be completed first)
- US-004: PocketBase Client and Auth Service (must be completed first)

## Requirements
- Create `src/components/layout/Login.tsx`
- The login page is the first screen when not authenticated (PRD §2.2)
- Simple, centered login form with:
  - "Insight" brand text at top
  - Email input field
  - Password input field
  - "Sign In" primary button
  - Form validation: both fields required, show error state on invalid credentials
  - Loading state on submit button while authenticating
- On successful login, redirect to Home section (PRD §2.2: "After authentication, the user lands on the Home section")
- Display error message for failed login attempts (invalid credentials, server unreachable)

## Shared Components Used
None — this is a standalone page built before shared components exist. Uses raw Tailwind classes matching the design system.

## UI Specification
- Centered vertically and horizontally on the page
- Background: `bg-base-100 dark:bg-base-900`
- Card: `bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-8` with `max-w-sm w-full`
- Brand: `text-2xl font-bold tracking-tight text-center mb-8`
- Inputs: `w-full px-3 py-2.5 border border-base-200 dark:border-base-600 rounded-lg bg-white dark:bg-base-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500`
- Button: `w-full px-5 py-2.5 text-sm font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg hover:bg-base-800 dark:hover:bg-accent-700 transition-colors`
- Error: `text-xs text-rose-500` below the form
- Works in both light and dark mode
- Responsive: centered on all screen sizes

## Acceptance Criteria
- [ ] Login page renders when user is not authenticated
- [ ] Email and password fields accept input
- [ ] Form validates that both fields are non-empty before submission
- [ ] Successful login redirects to Home section
- [ ] Failed login shows error message
- [ ] Button shows loading state during authentication
- [ ] Works in both light and dark mode
- [ ] Responsive: works on desktop and mobile

## Technical Notes
- File to create: `src/components/layout/Login.tsx`
- Use React state for form fields and error handling
- Call `auth.login()` from the auth service on form submit
- Use `useNavigate` from react-router-dom for redirect after login
