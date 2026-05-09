# Activity Log - DailyLog Project

**Project:** DailyLog (iOS Journal App)  
**Started:** May 7, 2026  
**Status:** In Progress  
**Last Updated:** May 9, 2026

---

## Validation Snapshot (May 9, 2026)

This status is based on code inspection plus `npm run lint` and `npm run type-check`.

- Core scaffolding exists for Phase 1A and 1B.
- Firebase/auth services and auth screens are implemented at code level.
- Build quality gates are green (`npm run lint`, `npm run type-check` both pass).
- Phase 1C journal management is now functionally implemented end-to-end.

---

## Phase 1A: Project Setup & Firebase

| Task | Status | Evidence |
|------|--------|----------|
| Initialize Expo React Native project | 🟢 Done | `app.json`, `package.json`, Expo scripts |
| Set up TypeScript, ESLint, Prettier | 🟢 Done | Config fixed and validated with passing lint/type-check |
| Create project directory structure | 🟢 Done | `src/` structure present |
| Initialize Firebase project | 🟡 Partial | Firebase config present in code/env, console-side setup not fully verified here |
| Configure Firebase credentials | 🟢 Done | `.env.local`, `.env.staging`, `.env.production` exist |
| Set up environment variables (.env files) | 🟢 Done | Env files plus runtime validation in `firebaseConfig.ts` |
| Create Firebase service wrapper | 🟢 Done | Auth, journal, entry, notification services implemented |
| Set up Zustand for global state | 🟢 Done | `authStore.ts`, `journalStore.ts` |

## Phase 1B: Authentication

| Task | Status | Evidence |
|------|--------|----------|
| Build Firebase Auth service | 🟢 Done | `src/services/authService.ts` |
| Create Sign-Up screen | 🟢 Done | `src/screens/AuthStack/SignUpScreen.tsx` |
| Create Login screen | 🟢 Done | `src/screens/AuthStack/LoginScreen.tsx` |
| Create Profile Setup screen | 🟢 Done | `src/screens/AuthStack/ProfileSetupScreen.tsx` |
| Implement persistent session | 🟢 Done | Firebase auth state listener in `AuthContext` |
| Create Protected Navigation | 🟢 Done | `RootNavigator` conditional auth/app stacks |

## Phase 1C: Journal Management

| Task | Status | Evidence |
|------|--------|----------|
| Build "My Journals" list screen | 🟢 Done | One-time fetch, loading/empty/error states, create CTA |
| Create "New Journal" screen | 🟢 Done | Validation + custom field builder + submit flow |
| Implement custom field builder | 🟢 Done | Add/remove fields, required toggle, multi-choice options |
| Save journal to Firestore | 🟢 Done | `journalService.createJournal` integrated with user scoping |
| Create Journal Detail screen | 🟢 Done | Detail view shows metadata + field schema |
| Implement journal archive/delete | 🟢 Done | Archive flow from list/detail with confirm dialog |

## Phase 1D-1F

- Phase 1D Entry Logging: 🔴 Not Started
- Phase 1E Reminders & Push Notifications: 🔴 Not Started (notification service exists, flow not integrated)
- Phase 1F Testing & Polish: 🔴 Not Started

---

## Objective Checks (May 9, 2026)

- `npm run lint`: ✅ Passing
- `npm run type-check`: ✅ Passing
- `npm test -- --runInBand`: ✅ Passing (2 suites, 9 tests)

Fixed in this cycle:
- TypeScript path aliases and imports (`@config`, `@navigation`, `@context`, `@app-types`)
- ESLint rule mismatch and unresolved import lint blockers
- NativeWind typing setup for `className` support
- Strict TS issues (`any` usage, invalid navigator options, missing package/types)
- Phase 1C implementation completed (list/create/detail/archive)
- Added focused tests: journal validation + journal service happy paths

---

## Current Priorities

1. Start Phase 1D Entry Logging implementation.
2. Build dynamic field input components for all journal field types.
3. Implement entry save/history flows and date-based retrieval.
