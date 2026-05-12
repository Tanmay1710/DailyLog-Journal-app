# DailyLog — Implementation Plan & Roadmap (Merged)

**Project Name:** DailyLog (iOS Journal App)  
**Status:** Phase 1E Groups A-C Complete / Groups D-J ⏳  
**Last Updated:** May 10, 2026

---

## Table of Contents

1. [Current Reality](#current-reality)
2. [Phase Overview & Roadmap](#phase-overview--roadmap)
3. [Phase Details & Task Breakdown](#phase-details--task-breakdown)
   - [Phase 0: Foundation & Documentation](#phase-0-foundation--documentation)
   - [Phase 1A: Project Setup & Firebase](#phase-1a-project-setup--firebase)
   - [Phase 1B: Authentication](#phase-1b-authentication)
   - [Phase 1C: Journal Management](#phase-1c-journal-management)
   - [Phase 1D: Entry Logging](#phase-1d-entry-logging)
   - [Phase 1E: App Completion & Wireframe Alignment](#phase-1e-app-completion--wireframe-alignment)
   - [Phase 1F: Testing, Accessibility & Polish](#phase-1f-testing-accessibility--polish)
   - [Phase 2: Advanced Features](#phase-2-advanced-features)
   - [Phase 3: Production Readiness](#phase-3-production-readiness)
4. [Files Summary](#files-summary)
5. [Dependency Map](#dependency-map)
6. [Quality Gates](#quality-gates)
7. [Risks & Mitigations](#risks--mitigations)
8. [Milestone Timeline](#milestone-timeline)

---

## Current Reality (Verified May 10, 2026)

### What's Working ✅

- **Phase 1A-1C**: Fully implemented and tested
- **Phase 1D Entry Logging**: Complete
  - Entry forms with all field types (text, date, rating, multiChoice)
  - Entry history with detailed field display
  - Daily logging streak calculation and UI (🔥 badges)
  - Auto-save drafts with 1-second debounce
  - Full navigation wiring (JournalDetail → EntryLog → EntryHistory)
- **Phase 1E Group A (Notification Foundation)**: Complete
  - Notification Zustand store (`notificationStore.ts`)
  - Enhanced notification service with daily recurring scheduling + FCM token persistence
  - Wired foreground handler and FCM token registration in `App.tsx`
- **Phase 1E Group B (Settings Screens + Navigation)**: Complete
  - `ReminderSettingsScreen.tsx`: time picker, enable/disable toggle, test notification button
  - `ProfileScreen.tsx`: email display, name/timezone editing, log out, delete account placeholder
  - Bottom tab navigation: Journals + Settings tabs via `@react-navigation/bottom-tabs`
- **UI Theme Polish**: Applied soothing visual theme (slate/emerald/rose palette, rounded-3xl cards, shadows)
- **Quality Gates**: All passing (`lint`, `type-check`, `test` — 2 suites, 9 tests)

### What's Partially Built 🟡

| Item | Status | Notes |
|------|--------|-------|
| Firebase console config | 🟡 Partial | Code present, console-side setup not fully verified |
| Notification service | 🟡 Partial | Core exists (`expo-notifications`), FCM token refresh + deep linking pending |
| `src/hooks/` | 🟡 Empty | Directory exists, **all files need to be created** |
| Google OAuth | 🟡 Partial | Auth service supports it, not integrated into UI |
| Screen UI alignment | 🟡 Partial | Screens exist but don't match wireframe designs — Group D pending |

### What's Missing 🔴

- Screen UI polish to match wireframes (7 screens need updates — Group D)
- Custom hooks (useAuth, useJournals, useEntries, useNotifications — Group E)
- Deep linking from notifications to specific journal (Group F)
- FCM token refresh flow (Group G)
- Cloud Functions (reminder scheduler, user cleanup — Group H)
- Firestore security rules (Group H)
- Comprehensive test coverage (Group I / Phase 1F)
- Dark mode support (Group J)
- Accessibility labels (Phase 1F)

---

## Phase Overview & Roadmap

```
Phase 0    Phase 1A-D   Phase 1E [EXPANDED]          Phase 1F       Phase 2       Phase 3
 ┌─┐      ┌──┬──┬──┬──┐ ┌──────────────────────┐     ┌───┐       ┌──┬──┐      ┌──────┐
 │D│→→→  │A│B│C│D│→→│  │C│D│E│F│G│H│I│J│   →→│F│→→  │2A│2B│→→│Release│
 └─┘      └──┴──┴──┴──┘ └──────────────────────┘     └───┘       └──┴──┘      └──────┘
 Docs     Core Features   Wireframe Alignment +       Polish     Advanced     App Store
                          Notifications + Dark Mode
```

| Phase | Theme | Est. Effort | Status |
|-------|-------|-------------|--------|
| **0** | Foundation & Documentation | Ongoing | 🔵 Active |
| **1A** | Project Setup & Firebase | Complete | ✅ Done |
| **1B** | Authentication | Complete | ✅ Done |
| **1C** | Journal Management | Complete | ✅ Done |
| **1D** | Entry Logging | Complete | ✅ Done |
| **1E** | **App Completion & Wireframe Alignment** | **~25 hours** | 🟡 In Progress |
| **1F** | Testing, Accessibility & Polish | ~6.5 hours | ⏳ Not Started |
| **2** | Advanced Features | TBD | ⏳ Future |
| **3** | Production Readiness | TBD | ⏳ Future |

### What Changed vs Previous Plan

| Aspect | Old Structure | New Merged Structure |
|--------|--------------|---------------------|
| **Phase 1E scope** | Reminders & Notifications only (10 tasks) | **App Completion & Wireframe Alignment** (10 groups, ~50 sub-tasks) |
| **Phase 1F scope** | Mixed: components, hooks, tests, dark mode, colors | **Testing, Accessibility & Polish** only |
| **Component library** | Phase 1F Task 6 | Phase 1E **Group C** (prerequisite for screen work) |
| **Custom hooks** | Phase 1F Task 7 | Phase 1E **Group E** |
| **Design tokens / colors** | Phase 1F Task 8 | Phase 1E **Group C4** |
| **Dark mode** | Phase 1F Task 12 | Phase 1E **Group J** |
| **Deep linking** | Phase 1E Task 8 (minimal) | Phase 1E **Group F** (expanded with landing UI + cold start) |
| **Screen polish** | Not addressed | Phase 1E **Group D** (7 screens aligned to `dailylog-wireframes.html`) |

**Rationale:** Components, hooks, design tokens, and dark mode are prerequisites for wireframe-accurate screens. Moving them into Phase 1E means screens are built with the right foundation from the start, and Phase 1F becomes a true stability/quality phase.

---

## Phase Details & Task Breakdown

### Phase 0: Foundation & Documentation (Ongoing)

**Goal:** Maintain project documentation and agent guidelines as the single source of truth.

- [x] Create `README.md` with project overview, setup, and scripts
- [x] Create `PLAN.md` with implementation roadmap
- [x] Create `CODEBASE.md` with architecture documentation
- [x] Create `ACTIVITY_LOG.md` for session tracking
- [x] Create `AGENTS.md` with agent guidelines
- [ ] Keep all docs in sync as the project evolves
- [ ] Update `README.md` status badges as phases complete

---

### Phase 1A: Project Setup & Firebase (✅ Done)

**Goal:** Initialize the RN/Expo project, tooling, Firebase, and state management.

- [x] Initialize Expo React Native project
- [x] Set up TypeScript, ESLint, Prettier
- [x] Create project directory structure
- [~] Initialize Firebase project and configure credentials (code/env present; console verification pending)
- [x] Set up environment variables (`.env.local`, `.env.staging`, `.env.production`)
- [x] Create Firebase service wrapper for auth and database
- [x] Set up Zustand for global state (user, journals, entries)

**Dependencies:** None  
**Deliverables:** Working dev environment, Firebase connected, stores ready

---

### Phase 1B: Authentication (✅ Done)

**Goal:** Full auth flow — sign up, log in, profile setup, session persistence, navigation gating.

- [x] Build Firebase Auth service (`src/services/authService.ts`)
- [x] Create Sign-Up screen (email/password validation)
- [x] Create Login screen (email/password; Google OAuth deferred)
- [x] Create Profile Setup screen (name, timezone, reminder time)
- [x] Implement persistent session (Firebase auth listener via `AuthContext`)
- [x] Create Protected Navigation (`RootNavigator` + `AuthContext`)

**Dependencies:** Phase 1A  
**Deliverables:** User can sign up, log in, set up profile, session persists across app restarts

---

### Phase 1C: Journal Management (✅ Done)

**Goal:** CRUD for journals — list, create with custom fields, view details, archive.

- [x] Build "My Journals" list screen with FlatList + pull-to-refresh
- [x] Create "New Journal" screen with validation
- [x] Implement custom field builder (add/remove fields, required toggle, multi-choice options)
- [x] Save journal to Firestore from UI
- [x] Create Journal Detail screen (view metadata + field schema)
- [x] Implement journal archive/delete from list and detail views

**Dependencies:** Phase 1B  
**Deliverables:** User can create, view, and archive journals with custom field schemas

---

### Phase 1D: Entry Logging (✅ Done)

**Goal:** Dynamic entry forms, entry history, streak tracking, draft auto-save.

- [x] Build Dynamic Entry Form screen (renders fields from schema)
- [x] Implement field input components (text, date, rating, multiChoice)
- [x] Create entry save logic (Firestore write with field validation)
- [x] Build Entry History screen (list entries with field details)
- [x] Display entry field details with labels (not just raw values)
- [x] Implement daily streak tracking and calculation
- [x] Add streak visualization (🔥 badges for active streaks)
- [x] Local draft auto-save support (debounced, Zustand)
- [x] Complete navigation wiring (JournalDetail → EntryLog → EntryHistory)

**Dependencies:** Phase 1C  
**Deliverables:** Fully functional logging experience with streak motivation

---

### Phase 1E: App Completion & Wireframe Alignment (🟡 In Progress)

**Goal:** Complete the full app by aligning every screen to the wireframe designs (`dailylog-wireframes.html`), building the reusable component library, implementing custom hooks, completing notification integration, and adding dark mode support.

**Total est. time:** ~25 hours  
**Wireframes reference:** `dailylog-wireframes.html` (9 screens: My Journals, New Journal, Journal Detail, Entry Log, Entry History, Profile, Reminder Settings, Notification Deep Link, Component System)

#### Dependency Graph

```
Group A-C (Foundation + Components) [A✅ B✅ C⏳]
  │
  ├──► Group D (Screen Polish) ──► Group F (Deep Linking)
  │                                      │
  ├──► Group E (Hooks) ──────────────────┤
  │                                      │
  ├──► Group G (FCM Refresh) ────────────┤
  │                                      │
  └──► Group H (Cloud Functions) ────────┤
                                         ▼
                                    Group I (Testing)
                                         │
                                         ▼
                                    Group J (Dark Mode)
```

---

#### Group A: Notification Foundation [🥇] ✅ Done

| Task | File | Description | Est. | Status |
|------|------|-------------|------|--------|
| **A1** | `src/store/notificationStore.ts` | Zustand store: reminder time, enabled flag, FCM token, scheduled notification IDs | 15 min | ✅ Done |
| **A2** | `src/services/notificationService.ts` | Daily recurring scheduling, cancel all, FCM token persistence (5 new methods) | 30 min | ✅ Done |
| **A3** | `src/App.tsx` | Foreground handler, notification permission request, FCM token registration | 20 min | ✅ Done |

**Deliverables:** Notification store, service methods for scheduling + FCM, handlers wired in App entry point.

---

#### Group B: Settings Screens + Bottom Tabs [🥈] ✅ Done

| Task | File | Description | Est. | Status |
|------|------|-------------|------|--------|
| **B1** | `src/screens/SettingsStack/ReminderSettingsScreen.tsx` | Time picker, enable/disable toggle, test notification button | 45 min | ✅ Done |
| **B2** | `src/screens/SettingsStack/ProfileScreen.tsx` | Email display, name/timezone editing, log out, delete account | 30 min | ✅ Done |
| **B3** | `src/navigation/RootNavigator.tsx` + `src/navigation/SettingsStack.tsx` | Bottom tabs (Journals + Settings), stack wiring | 30 min | ✅ Done |

**Deliverables:** Reminder settings with time picker/toggle/test, profile with edit/logout/delete, bottom tabs navigation.

---

#### Group C: Reusable Component Library [🥇] ⏳ Not Started

**Goal:** Build all shared UI components referenced in the wireframes. `src/components/` is currently empty. **Must be done before Group D (screen polish).**

| Task | File | Description | Wireframe Ref | Est. |
|------|------|-------------|---------------|------|
| **C1a** | `src/components/Common/Button.tsx` | `PrimaryButton` (emerald filled, rounded-3xl, shadow), `SecondaryButton` (border only, slate), `DangerButton` (rose). Props: `title`, `onPress`, `variant`, `loading`, `disabled`, `accessibilityLabel` | All | 20 min | ✅ Done |
| **C1b** | `src/components/Common/IconButton.tsx` | Header icon button (← back, ＋ add, ✎ edit, ⋯ overflow, ✓ save). Used consistently in nav bars across all wireframes | All | 15 min | ✅ Done |
| **C2a** | `src/components/FieldInputs/TextInput.tsx` | Label, multiline support, error state, placeholder | 2, 4 | 20 min | ✅ Done |
| **C2b** | `src/components/FieldInputs/DateInput.tsx` | Date display + "Calendar" tag. Tap opens `@react-native-community/datetimepicker` | 4 | 20 min | ✅ Done |
| **C2c** | `src/components/FieldInputs/RatingInput.tsx` | 5 interactive rating bubbles (`1 2 3 4 5`), tap to select, active fill style | 4 | 25 min | ✅ Done |
| **C2d** | `src/components/FieldInputs/MultiChoiceInput.tsx` | Segmented button row with active state (e.g., "Calm" \| "Family" \| "Work") | 4 | 20 min | ✅ Done |
| **C3a** | `src/components/Common/JournalCard.tsx` | Emoji icon (🌿), title, description, meta tags row (field count, frequency, reminder time) | 1 | 25 min | ✅ Done |
| **C3b** | `src/components/Common/HeroCard.tsx` | Gradient background (surface → accent-soft), optional metric badge, title, subtitle, children | 1, 3, 6 | 20 min | ✅ Done |
| **C3c** | `src/components/Common/MetricBadge.tsx` | Small card with label + large number/emoji (e.g., "Streak · 12🔥") | 1, 3, 5 | 15 min | ✅ Done |
| **C3d** | `src/components/Common/PillBar.tsx` | Horizontal pill tabs with active state. Props: `pills: { label, key }[]`, `activeKey`, `onChange` | 1, 5 | 15 min | ✅ Done |
| **C3e** | `src/components/Common/Toast.tsx` | Slide-up toast for success/error/info, auto-dismiss after 3s | All | 20 min | ✅ Done |
| **C3f** | `src/components/Common/InlineBanner.tsx` | Static banner (draft status, notification preview, deep-link welcome). Persistent, not auto-dismiss | 4, 7, 8 | 15 min | ✅ Done |
| **C3g** | `src/components/Common/LoadingSkeleton.tsx` | Placeholder shimmer for loading states. Card-shaped and text-line-shaped variants | 9 | 15 min | ✅ Done |
| **C3h** | `src/components/Common/BottomSheet.tsx` | Modal overlay for field type selection with presets, descriptions, examples | 2 | 25 min | ✅ Done |
| **C4a** | `src/constants/colors.ts` | Design tokens matching wireframe palette (light + dark): `bg: #f6f4ef`, `surface: #fcfbf8`, `accent: #0d6b68`, `accent-soft: #d9ebe8`, `success: #437a22`, `warning: #b3741a`, `danger: #a04254`, `text: #26231d`, `muted: #706b63`, `line: #d8d1c6` | All | 20 min | ✅ Done |
| **C4b** | `src/constants/layout.ts` | Spacing, border-radius (`--radius: 24px`, `--radius-sm: 16px`), shadow values | All | 10 min | ✅ Done |
| **C4c** | `src/types/index.ts` | Add `emoji` and `pinned` fields to `Journal` type | 1 | 5 min | ✅ Done |
| **C4d** | `tsconfig.json`, `jest.config.js` | Added `@constants/*` path alias to both configs | All | 5 min | ✅ Done |

**Group C total:** ~4.5 hours ✅ Complete

---

#### Group D: Screen Wireframe Alignment [🥇] ⏳ Not Started

**Goal:** Polish all 7 existing screens to match wireframe fidelity exactly. Depends on Group C (components).

| Task | Screen | Key Changes | Wireframe | Est. |
|------|--------|-------------|-----------|------|
| **D1** | `JournalListScreen.tsx` | Hero card with streak keeper + "2 journals due today"; Active/Archived pill tabs; Pinned journals section; Emoji icons per journal; Meta tags (field count, frequency, time); Recent activity list; Header "＋" button replacing standalone CTA | Wireframe 1 | 2h |
| **D2** | `NewJournalScreen.tsx` | Bottom sheet for field type selection; Multi-line description placeholders; Save Draft + Create dual buttons; Overflow "⋯" menu in header; Progressive disclosure (metadata → fields → sheets) | Wireframe 2 | 1.5h |
| **D3** | `JournalDetailScreen.tsx` | Entry count metric badge (48); Last entry timestamp ("yesterday at 8:12 PM"); Reminder context card ("Daily reminder · 7:30 PM"); Overflow menu (Edit/Archive/Delete); Field schema with inline type badges | Wireframe 3 | 1.5h |
| **D4** | `EntryLogScreen.tsx` | Rating bubble UI (1-5 interactive); Multi-choice as segmented button group; Date picker replacing text input; Draft save banner with live timestamp; Nav bar "←" back + "✓" save | Wireframe 4 | 2h |
| **D5** | `EntryHistoryScreen.tsx` | Filter pill tabs (All, This Week, Streak); Current + Best streak metrics; Entry detail modal/screen on tap; "View" tag on each row; Date grouping with section headers | Wireframe 5 | 2h |
| **D6** | `ProfileScreen.tsx` | Emoji avatar (🙂) in hero card; Reminder Settings nav link with `›`; Edit "✎" button in header; "Safe" tag on Logout; "Cloud fn" tag on Delete | Wireframe 6 | 1h |
| **D7** | `ReminderSettingsScreen.tsx` | Notification preview card ("DailyLog: Time to check in with Gratitude."); Scheduling notes section (permission state, next trigger, local vs cloud); Large bold time display with "Edit" tag; Nav bar save button | Wireframe 7 | 1h |

**Group D total:** ~11 hours

---

#### Group E: Custom Hooks [🥈] ⏳ Not Started

**Goal:** Extract screen logic into reusable hooks. `src/hooks/` is currently empty.

| Task | File | Returns | Est. |
|------|------|---------|------|
| **E1** | `src/hooks/useAuth.ts` | `{ user, isLoading, login, signup, logout, updateProfile }` | 20 min |
| **E2** | `src/hooks/useJournals.ts` | `{ journals, activeJournals, archivedJournals, createJournal, updateJournal, archiveJournal, deleteJournal, togglePin }` | 25 min |
| **E3** | `src/hooks/useEntries.ts` | `{ entries, createEntry, updateEntry, deleteEntry, currentStreak, bestStreak, draft, saveDraft, clearDraft }` | 30 min |
| **E4** | `src/hooks/useNotifications.ts` | `{ reminderTime, isEnabled, requestPermission, scheduleReminder, cancelReminder, sendTestNotification }` | 20 min |

**Group E total:** ~1.5 hours

---

#### Group F: Deep Linking & Notification Landing UI [🥈] ⏳ Not Started

**Goal:** Complete notification deep linking **plus** build the landing UI from Wireframe 8.

| Task | File | Description | Est. |
|------|------|-------------|------|
| **F1** | `src/App.tsx` | Add `addNotificationResponseReceivedListener` to capture tap; Extract `journalId` from payload; Store pending route | 15 min |
| **F2** | `src/navigation/RootNavigator.tsx` | Set up `navigationRef` for navigating from outside components; Process pending deep link after navigator ready | 15 min |
| **F3** | `src/components/Common/DeepLinkBanner.tsx` | **Wireframe 8**: "Welcome back to Gratitude" banner shown when arriving from notification tap | 20 min |
| **F4** | `src/hooks/useDeepLink.ts` | `{ pendingDeepLink, resolveDeepLink, clearDeepLink }`. Handles cold start vs warm start | 15 min |
| **F5** | Navigation flow | Deep link resolution: app opens → auth gate → navigator ready → navigate to JournalDetail/EntryLog with context banner | 10 min |

**Deep link landing behavior (Wireframe 8):**
```
1. App opens into signed-in shell
2. Pending route resolves after navigator is ready
3. User lands in Journal Detail or Entry Log with context banner
4. Banner says: "Welcome back to Gratitude"
```

**Group F total:** ~1.25 hours

---

#### Group G: FCM Token Refresh Flow [🥉] ⏳ Not Started

| Task | File | Description | Est. |
|------|------|-------------|------|
| **G1** | `src/services/notificationService.ts` | Get token via `getDevicePushTokenAsync()` on login | 5 min |
| **G2** | `src/services/notificationService.ts` | Save to `users/{userId}/fcmToken` in Firestore | 5 min |
| **G3** | `src/services/notificationService.ts` + `src/App.tsx` | Listen for token refresh (`onTokenRefresh` if using `firebase/messaging`) | 5 min |
| **G4** | `src/services/notificationService.ts` | On logout: remove token from Firestore | 5 min |

**Group G total:** 20 min

---

#### Group H: Cloud Functions [🥉] ⏳ Not Started

| Task | File | Description | Est. |
|------|------|-------------|------|
| **H1** | `firebase/functions/package.json`, `firebase/functions/tsconfig.json` | Functions project setup + TypeScript config | 10 min |
| **H2** | `firebase/functions/src/reminderScheduler.ts` | Pub/sub function (hourly): query users with `reminderEnabled == true` + matching hour → send FCM `{ type: 'reminder', journalId: null }` | 25 min |
| **H3** | `firebase/functions/src/userCleanup.ts` | Auth trigger on user delete: cascade-delete journals + entries + user doc | 15 min |
| **H4** | `firebase/functions/src/index.ts` | Export both functions from entry point | 5 min |
| **H5** | `firebase/firestore.rules` | Security rules: owner-only access for users, journals, entries | 10 min |
| **H6** | `firebase/firestore.indexes.json` | Composite indexes: entries by journalId+date, userId+date | 5 min |

**Group H total:** ~1 hour 10 min

---

#### Group I: Notification Delivery Testing [🧪] ⏳ Not Started

**Test scenarios on iOS simulator + physical device:**

| # | Scenario | Steps | Success Criteria |
|---|----------|-------|-----------------|
| I1 | Foreground notification | App open, reminder fires | Alert/Toast shows on screen |
| I2 | Background notification | App in background, reminder fires | Notification in notification center |
| I3 | Tap notification (foreground) | Tap while app open | Navigates to journal |
| I4 | Tap notification (background) | Tap from lock screen | App opens to journal |
| I5 | Permission denied | User denies permission | No crash, graceful fallback |
| I6 | Schedule change | Change reminder time | Old canceled, new scheduled |
| I7 | Disable reminders | Toggle off | All notifications canceled |
| I8 | Cold start deep link | Kill app, tap notification | App launches to journal |

**Group I total:** 45 min

---

#### Group J: Dark Mode & Theme Context [🥉] ⏳ Not Started

**Goal:** The wireframe HTML already supports dark mode (toggle exists). Implement in React Native.

| Task | File | Description | Est. |
|------|------|-------------|------|
| **J1** | `src/context/ThemeContext.tsx` | Theme context: `{ theme, colors, isDark, toggleTheme }`. Persist via AsyncStorage. Light + dark token sets | 30 min |
| **J2** | `src/hooks/useColors.ts` | Convenience hook returning current color palette based on active theme | 10 min |
| **J3** | `src/App.tsx` | Wrap in `<ThemeProvider>`. Set `StatusBar` style based on theme | 10 min |
| **J4** | All screens | Update screens to consume `useColors()` instead of hardcoded values. Verify in both modes | 45 min |
| **J5** | Settings screen | Add theme toggle in Profile or dedicated appearance section | 15 min |

**Group J total:** ~1 hour 50 min

---

#### Phase 1E Summary Table

| Group | Theme | Sub-tasks | Est. Time | Status |
|-------|-------|-----------|-----------|--------|
| **A** | Notification Foundation | 3 | 1h 05m | ✅ Done |
| **B** | Settings Screens + Navigation | 3 | 1h 45m | ✅ Done |
| **C** | Reusable Component Library | 16 (C1a-C4c) | ~4h 30m | ✅ Done |
| **D** | Screen Wireframe Alignment | 7 (D1-D7) | ~11h 00m | ⏳ Not Started |
| **E** | Custom Hooks | 4 (E1-E4) | ~1h 35m | ⏳ Not Started |
| **F** | Deep Linking + Landing UI | 5 (F1-F5) | ~1h 15m | ⏳ Not Started |
| **G** | FCM Token Refresh | 4 (G1-G4) | ~0h 20m | ⏳ Not Started |
| **H** | Cloud Functions | 6 (H1-H6) | ~1h 10m | ⏳ Not Started |
| **I** | Notification Testing | 8 scenarios | ~0h 45m | ⏳ Not Started |
| **J** | Dark Mode & Theme Context | 5 (J1-J5) | ~1h 50m | ⏳ Not Started |
| | **Total Phase 1E** | **~50** | **~25 hours** | 🟡 |

---

### Phase 1F: Testing, Accessibility & Polish (⏳ Not Started)

**Goal:** Comprehensive testing, accessibility audit, performance optimization, error handling polish.

**Dependencies:** Phase 1E complete (all screens aligned, components built, hooks extracted, dark mode working)

| # | Task | Description | Est. |
|---|------|-------------|------|
| **1F-1** | Unit tests: `authService.ts` | Signup, login, logout, error handling, profile update | 30 min |
| **1F-2** | Unit tests: `entryService.ts` | CRUD, date queries, draft save/load/clear | 30 min |
| **1F-3** | Unit tests: `validation.ts` | `isValidEmail`, `isStrongPassword`, `validateName`, `validateTimezone`, `validateTime`, `validateHexColor`, `validateJournalTitle` | 20 min |
| **1F-4** | Unit tests: streak calculation | Current streak, best streak, edge cases (gap in dates, single entry, empty) | 15 min |
| **1F-5** | Integration test: auth flow | Signup → profile setup → journals list → logout | 30 min |
| **1F-6** | Integration test: entry flow | Create journal → log entry → view in history → verify streak | 30 min |
| **1F-7** | Integration test: notification flow | Set reminder → verify scheduled → cancel → verify cancelled | 20 min |
| **1F-8** | Accessibility audit | All screens: `accessibilityLabel`, `accessibilityRole`, touch targets ≥44pt, color contrast | 45 min |
| **1F-9** | Accessibility fixes | Add missing labels, fix contrast issues, test with VoiceOver | 30 min |
| **1F-10** | Performance optimization | Memoization (`useMemo`, `useCallback`), FlatList `getItemLayout`, `keyExtractor`, `windowSize`, cleanup on unmount | 30 min |
| **1F-11** | Error handling polish | Toast system consistency across all screens, retry logic, offline state handling | 30 min |
| **1F-12** | Manual testing: iOS simulator | Full regression: all screens, all flows, all states (loading/empty/error/success) | 45 min |
| **1F-13** | Manual testing: physical device | Notification delivery, deep link tap, performance feel | 30 min |

**Est. total:** ~6.5 hours

---

### Phase 2: Advanced Features (⏳ Future)

| # | Feature | Description | Est. | Priority |
|---|---------|-------------|------|----------|
| **2A** | **Journal Templates** | Pre-built templates (Gratitude 🌿, Health 💪, Work 💼, Travel ✈️, Daily Mood 😊). User picks template → auto-fills field schema. Store in Firestore or local JSON | 3-4h | Medium |
| **2B** | **Entry Analytics** | Charts (mood over time, entry frequency heatmap), word cloud from text entries, export to PDF/CSV. Use `react-native-chart-kit` or `victory-native` | 5-6h | Medium |
| **2C** | **Search & Filter** | Full-text search across entries (use Fuse.js locally or Algolia). Date range filtering, tag filtering | 4-5h | Low |
| **2D** | **Multi-language Support** | i18n setup with `expo-localization`. English + 1-2 additional languages | 3-4h | Low |
| **2E** | **Apple Sign-In** | Native Apple OAuth via `expo-apple-authentication`. Required for apps with social login on iOS | 2h | Low |
| **2F** | **iOS Widget** | Today widget: current streak + "Log today" quick action. WidgetKit + React Native bridge | 5-6h | Low |
| **2G** | **Backup & Restore** | iCloud backup of journals + entries JSON. Export/import via file share | 3-4h | Low |

---

### Phase 3: Production Readiness (⏳ Future)

| # | Task | Description | Est. |
|---|------|-------------|------|
| **3A** | **EAS Build Configuration** | Configure `eas.json` for dev/staging/production. Set up iOS certificates + provisioning profiles | 1-2h |
| **3B** | **TestFlight Distribution** | Internal testing (up to 100 testers). Collect feedback, fix critical issues | 3-5 days |
| **3C** | **App Store Submission** | Metadata (name, subtitle, keywords, description). Screenshots for all device sizes. Privacy policy URL. App Review | 4-6h |
| **3D** | **Crash Reporting** | Set up Sentry (`@sentry/react-native`) or Firebase Crashlytics. Source map upload for symbolication | 1-2h |
| **3E** | **Analytics** | Firebase Analytics or Mixpanel. Key events: `sign_up`, `create_journal`, `log_entry`, `set_reminder`, `view_history` | 1-2h |
| **3F** | **Monitoring** | Performance monitoring (Firebase Performance or Sentry). Cloud Function uptime. Alerts for error rate spikes | 1-2h |

---

## Files Summary

### Files to Create (~30 files)

```
src/components/Common/Button.tsx
src/components/Common/IconButton.tsx
src/components/Common/JournalCard.tsx
src/components/Common/HeroCard.tsx
src/components/Common/MetricBadge.tsx
src/components/Common/PillBar.tsx
src/components/Common/Toast.tsx
src/components/Common/InlineBanner.tsx
src/components/Common/LoadingSkeleton.tsx
src/components/Common/BottomSheet.tsx
src/components/Common/DeepLinkBanner.tsx
src/components/FieldInputs/TextInput.tsx
src/components/FieldInputs/DateInput.tsx
src/components/FieldInputs/RatingInput.tsx
src/components/FieldInputs/MultiChoiceInput.tsx
src/constants/colors.ts
src/constants/layout.ts
src/hooks/useAuth.ts
src/hooks/useJournals.ts
src/hooks/useEntries.ts
src/hooks/useNotifications.ts
src/hooks/useDeepLink.ts
src/context/ThemeContext.tsx
src/screens/JournalStack/EntryDetailScreen.tsx    (NEW - entry detail from history tap)
firebase/functions/package.json
firebase/functions/tsconfig.json
firebase/functions/src/index.ts
firebase/functions/src/reminderScheduler.ts
firebase/functions/src/userCleanup.ts
firebase/firestore.rules
firebase/firestore.indexes.json
```

### Files to Modify (~12 files)

```
src/screens/JournalStack/JournalListScreen.tsx      — Major rewrite (hero, pills, pins, activity)
src/screens/JournalStack/JournalDetailScreen.tsx    — Major enhancement (metrics, reminder, overflow)
src/screens/JournalStack/NewJournalScreen.tsx       — Enhancement (bottom sheet, draft save)
src/screens/JournalStack/EntryLogScreen.tsx         — Major rewrite (ratings, multi-choice, date)
src/screens/JournalStack/EntryHistoryScreen.tsx     — Major enhancement (pills, best streak, detail nav)
src/screens/SettingsStack/ProfileScreen.tsx         — Enhancement (avatar, ReminderSettings link)
src/screens/SettingsStack/ReminderSettingsScreen.tsx — Enhancement (preview card, scheduling notes)
src/navigation/SettingsStack.tsx                    — Add EntryDetail route
src/navigation/JournalStack.tsx                     — Add EntryDetail screen to stack
src/navigation/RootNavigator.tsx                    — Deep link + navigation ref
src/App.tsx                                         — Notification listener + theme provider
src/types/index.ts                                  — Add emoji, pinned fields
src/services/notificationService.ts                 — FCM token refresh listener
```

---

## Dependency Map

```
Phase 0 (Documentation — ongoing)
   │
   ▼
Phase 1A (Setup) ──► Phase 1B (Auth) ──► Phase 1C (Journals) ──► Phase 1D (Entries)
                                                                         │
                                                                         ▼
                                                              ┌──────────────────────────────────────────┐
                                                              │          Phase 1E [MERGED]              │
                                                              │                                          │
                                                              │  Group A (Notify Foundation) ✅ Done     │
                                                              │  Group B (Settings Screens) ✅ Done      │
                                                              │         │                               │
                                                              │         ▼                               │
                                                              │  ┌── Group C (Components) ──┐            │
                                                              │  │         │               │            │
                                                              │  │         ▼               ▼            │
                                                              │  │  Group D (Screens)   Group E (Hooks)  │
                                                              │  │         │               │            │
                                                              │  └─────────┼───────────────┘            │
                                                              │            ▼                            │
                                                              │  Group F (Deep Linking + Landing UI)     │
                                                              │            │                            │
                                                              │  ┌─────────┼─────────────┐               │
                                                              │  ▼         ▼             ▼               │
                                                              │  Group G   Group H      Group I          │
                                                              │  (FCM)     (Cloud Fn)   (Testing)        │
                                                              │            │             │               │
                                                              │            └──────┬──────┘               │
                                                              │                   ▼                      │
                                                              │  Group J (Dark Mode & Theme Context)      │
                                                              └──────────────────────────────────────────┘
                                                                         │
                                                                         ▼
                                                              Phase 1F (Testing, Accessibility, Polish)
                                                                         │
                                                              ┌───────────┴───────────┐
                                                              ▼                       ▼
                                                         Phase 2 (Advanced)      Phase 3 (Release)
```

### Execution Priority Order

| Order | Group | Why This Order |
|-------|-------|----------------|
| **1** | **C** (Component Library) | Everything depends on these — screens, hooks, dark mode all use components |
| **2** | **C4** (Design Tokens) | Should be done alongside or right after components — all screens need consistent tokens |
| **3** | **D1** (JournalList) | Most impactful screen; uses components + tokens from C |
| **4** | **D4** (EntryLog) | Core interaction screen; needs RatingInput, DateInput, MultiChoiceInput from C |
| **5** | **E** (Custom Hooks) | Extract logic from screens as they're polished (can be done in parallel with D3, D5, D6, D7) |
| **6** | **D3** (JournalDetail) | Uses HeroCard, MetricBadge from C |
| **7** | **D5** (EntryHistory) | Uses PillBar, MetricBadge from C |
| **8** | **D6** (Profile) | Uses HeroCard from C |
| **9** | **D7** (ReminderSettings) | Uses InlineBanner from C |
| **10** | **D2** (NewJournal) | Uses BottomSheet from C |
| **11** | **F** (Deep Linking) | Needs polished JournalDetail to land on |
| **12** | **G** (FCM Refresh) | Can be done any time after D7 |
| **13** | **H** (Cloud Functions) | Can be done in parallel with D/F |
| **14** | **I** (Testing) | After all code is in place |
| **15** | **J** (Dark Mode) | Last — applies theme context across all polished screens |

---

## Quality Gates (Unchanged)

Every phase must pass these gates before being marked complete:

| Gate | Command | Minimum |
|------|---------|---------|
| Lint | `npm run lint` | 0 errors, 0 warnings |
| TypeScript | `npm run type-check` | 0 errors |
| Unit Tests | `npm test -- --runInBand` | 100% pass rate |
| Coverage | `npm test -- --coverage` | 70%+ lines, branches, functions |

---

## Risks & Mitigations (Updated)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep in Group D (11h of screen polish) | High | Medium | Stick to wireframes strictly; defer nice-to-haves to Phase 2 |
| Firebase console config not verified | Medium | High | Verify Firestore rules + FCM setup before deploying Cloud Functions |
| Notification delivery unreliable on iOS simulator | Medium | Medium | Test on physical device; use local + FCM redundancy |
| Dark mode creating visual inconsistencies | Medium | Medium | Build theme context early (Group J) and test on all screens before 1F |
| Component API changes mid-stream | Medium | Low | Define component props/interfaces before implementing screens |
| `@react-native-community/datetimepicker` compatibility | Low | Medium | Verify Expo SDK 50 compatibility; fallback to TextInput if needed |
| Documentation drift | Medium | Medium | Update docs in same session as code changes |
| TypeScript strictness causing build issues | Low | Low | Already passing; maintain discipline |
| Firestore composite index requirements | Low | Medium | Query without composite indexes where possible; add indexes as needed |

---

## Milestone Timeline (Updated)

```
May 7    May 9    May 10    May 12-14        May 15-18        May 19-21        May 22+         June+
│        │        │         │                │                │                │               │
●────────●────────●─────────●────────────────●────────────────●────────────────●──────────────●───→
│        │        │         │                │                │                │               │
1A-1B    1C       1D        1E: C+F          1E: G+H+J        1F              2A-2B           3A-3F
Done     Done    Done       (Components +    (Cloud Fn +      (Testing +      (Advanced)      (Release)
                              Screens +        Dark Mode)       Acc + Polish)
                              Hooks +
                              Deep Link)

Detailed schedule:
May 10-11:  Group C (Component Library) + C4 (Design Tokens)         ~4.5h
May 12-13:  Group D1-D2-D3 (JournalList, NewJournal, JournalDetail)   ~5h
May 13-14:  Group D4-D5 (EntryLog, EntryHistory) + Group E (Hooks)    ~5.5h
May 14:     Group D6-D7 (Profile, ReminderSettings) + Group F (Deep Link)  ~3.5h
May 15:     Group G (FCM Refresh) + H (Cloud Functions)               ~1.5h
May 15-16:  Group I (Testing) + J (Dark Mode)                         ~2.5h
May 17-18:  Phase 1F (Test, Audit, Polish)                            ~6.5h
May 19-21:  Buffer / Bug fixes
```

**Phase 1E Target:** Complete by **May 16, 2026**  
**Phase 1F Target:** Complete by **May 21, 2026**  
**Phase 2 Target:** June 2026  
**Phase 3 Target:** June-July 2026

---

*This plan is a living document. Update it after each session to reflect current reality.*

