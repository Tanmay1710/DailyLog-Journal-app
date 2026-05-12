# Agent Guidelines — DailyLog Project

**Project:** DailyLog (iOS Journal App)  
**Last Updated:** May 10, 2026

---

## 1. Project Introduction

**DailyLog** is an iOS-first React Native journal application built with Expo and Firebase. It allows users to:

- Create multiple journals with fully customizable fields (text, date, rating, multiChoice)
- Log daily entries with dynamic forms
- Track logging streaks with visual badges (🔥)
- Auto-save drafts locally
- Receive configurable daily reminders (push notifications)
- Manage their profile and journal archive

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native + Expo SDK 50 |
| Language | TypeScript 5 (strict mode) |
| State | Zustand |
| Navigation | React Navigation (native-stack) |
| Backend | Firebase (Auth, Firestore, Cloud Messaging) |
| UI | NativeWind (Tailwind CSS for React Native) |
| Testing | Jest + React Native Testing Library |

---

## 2. Agent Rules of Engagement

When working on this project, follow these rules strictly:

### 2.1 Source of Truth

- **`README.md`** — Contains the master project context, setup instructions, and high-level overview. Always read this first when onboarding.
- **`PLAN.md`** — Contains the detailed implementation roadmap, phase breakdown, current status, and all planned work. **This is the primary guide for what to build next.** Always consult PLAN.md before starting any work.
- **`CODEBASE.md`** — Contains detailed architecture documentation, data flow diagrams, and module-level API descriptions. Refer to this for implementation details and design decisions.
- **`AGENTS.md`** (this file) — Contains rules and guidelines for AI agents interacting with the codebase.

### 2.2 Activity Log — MANDATORY

- **Every session MUST append an entry to `ACTIVITY_LOG.md`.**
- Never remove, edit, or overwrite any existing content in `ACTIVITY_LOG.md` — only append.
- Each entry should include:
  - Date of session
  - What was completed (with bullet points)
  - Files modified or created
  - Any blockers or decisions made
  - Current quality gate status (`lint`, `type-check`, `test`)
  - What's ready to work on next

### 2.3 Quality Gates

Before concluding any session, verify:

```bash
npm run lint         # Must pass with 0 errors
npm run type-check   # Must pass with 0 errors
npm test -- --runInBand  # All tests must pass
```

If any quality gate fails, either fix it or document it clearly as a known issue in the activity log.

### 2.4 Workflow

1. **Read** — Start by reading `README.md`, `PLAN.md`, and `ACTIVITY_LOG.md` to understand current state.
2. **Plan** — Determine which phase/task from PLAN.md to work on next.
3. **Implement** — Make changes following the existing architecture patterns.
4. **Verify** — Run quality gates (lint, type-check, test).
5. **Document** — Append to `ACTIVITY_LOG.md` with a summary of what was done.
6. **Update PLAN.md** — Mark tasks as complete, update status, and adjust the roadmap if needed.

### 2.5 Architecture Principles

- **Separation of concerns**: Screens → Services → Stores — keep these layers separate.
- **TypeScript strictness**: No `any` types. Use proper interfaces from `src/types/index.ts`.
- **Reusable components**: Extract repeated UI patterns into `src/components/`.
- **Error handling**: All async operations must have try/catch with user-friendly error messages (use `src/utils/errorHandler.ts`).
- **Accessibility**: All `TouchableOpacity` and interactive elements should have `accessibilityLabel` where appropriate.

### 2.6 File Naming & Structure

- Screens: `src/screens/{StackName}/{ScreenName}Screen.tsx`
- Components: `src/components/{Category}/{ComponentName}.tsx`
- Services: `src/services/{serviceName}.ts`
- Stores: `src/store/{storeName}.ts`
- Types: `src/types/index.ts`
- Hooks: `src/hooks/use{hookName}.ts`
- Tests: `src/**/__tests__/*.test.ts`

### 2.7 Import Aliases

Use these path aliases (configured in `tsconfig.json` and `jest.config.js`):

```
@screens/*       → src/screens/*
@components/*    → src/components/*
@services/*      → src/services/*
@store/*         → src/store/*
@hooks/*         → src/hooks/*
@utils/*         → src/utils/*
@types/*         → src/types/*
@app-types       → src/types/index.ts
@config/*        → src/config/*
@navigation/*    → src/navigation/*
@context/*       → src/context/*
```

---

## 3. Communication Style

- **Be concise**: Provide clear summaries with bullet points.
- **Show diffs**: When suggesting code changes, show the diff or the full file content.
- **Explain rationale**: Always explain why a change is being made.
- **Flag risks**: If a change could break something, flag it clearly.
- **Stay in scope**: Work on the current phase/priority as defined in PLAN.md unless explicitly asked otherwise.

---

## 4. Quick Reference

```
Project Root: ./journal-app/
Main Entry:   src/App.tsx
Types:        src/types/index.ts
Firebase:     src/config/firebaseConfig.ts
Auth Context: src/context/AuthContext.tsx
Navigation:   src/navigation/
Screens:      src/screens/
Services:     src/services/
Stores:       src/store/
Utils:        src/utils/
Components:   src/components/  (to be built)
Hooks:        src/hooks/       (to be built)
```

---

*This file is part of the DailyLog project. Update it when workflows or conventions change.*
