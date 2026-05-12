# DailyLog — Implementation Plan & Roadmap

**Project Name:** DailyLog (iOS Journal App)  
**Status:** Phase 1E Tasks 1-6 Complete / Tasks 7-8 In Progress  
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
   - [Phase 1E: Reminders & Push Notifications](#phase-1e-reminders--push-notifications)
   - [Phase 1F: Testing & Polish](#phase-1f-testing--polish)
   - [Phase 2: Advanced Features](#phase-2-advanced-features)
   - [Phase 3: Production Readiness](#phase-3-production-readiness)
4. [Dependency Map](#dependency-map)
5. [Quality Gates](#quality-gates)
6. [Risks & Mitigations](#risks--mitigations)
7. [Milestone Timeline](#milestone-timeline)

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
- **Phase 1E Foundation (Tasks 1-3)**: Complete
  - Notification Zustand store (`notificationStore.ts`)
  - Enhanced notification service with daily recurring scheduling + FCM token persistence
  - Wired foreground handler and FCM token registration in `App.tsx`
- **Phase 1E Screens (Tasks 4-6)**: Complete
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
| `src/components/` | 🟡 Empty | Directory exists, files not created |
| `src/hooks/` | 🟡 Empty | Directory exists, files not created |
| Google OAuth | 🟡 Partial | Auth service supports it, not integrated into UI |

### What's Missing 🔴

- FCM token refresh flow (onTokenRefresh listener)
- Deep linking from notifications to specific journal
- Cloud Functions (reminder scheduler, user cleanup)
- Reusable component library (FieldInput, Button, Toast, etc.)
- Custom hooks (useAuth, useJournals, useNotifications)
- Comprehensive test coverage
- Dark mode support
- Accessibility labels

---

## Phase Overview & Roadmap

```
Phase 0    Phase 1A-E    Phase 1F    Phase 2       Phase 3
  ┌─┐    ┌──┬──┬──┬──┐    ┌─┐      ┌──┬──┐      ┌──────┐
  │D│→→│A│B│C│D│E│→→│F│→→│2A│2B│→→│Release│
  └─┘    └──┴──┴──┴──┘    └─┘      └──┴──┘      └──────┘
  Docs   Core Features    Polish   Advanced      App Store
```

| Phase | Theme | Est. Effort | Status |
|-------|-------|-------------|--------|
| **0** | Foundation & Documentation | Ongoing | 🔵 Active |
| **1A** | Project Setup & Firebase | Complete | ✅ Done |
| **1B** | Authentication | Complete | ✅ Done |
| **1C** | Journal Management | Complete | ✅ Done |
| **1D** | Entry Logging | Complete | ✅ Done |
| **1E** | Reminders & Notifications | 3-5 days | 🟡 In Progress |
| **1F** | Testing & Polish | 3-5 days | ⏳ Not Started |
| **2** | Advanced Features | TBD | ⏳ Future |
| **3** | Production Readiness | TBD | ⏳ Future |

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

### Phase 1E: Reminders & Push Notifications (🟡 In Progress)

**Goal:** Daily reminder notifications, FCM integration, settings UI.

#### Task Dependency Graph

```
Task 1 (notificationStore)
  │
  ▼
Task 2 (enhance notificationService) ──→ Task 3 (wire in App.tsx)
  │                                          │
  ▼                                          ▼
Task 4 (ReminderSettingsScreen)         Task 7 (FCM token flow)
  │                                          │
  ▼                                          ▼
Task 5 (ProfileScreen)                  Task 8 (deep linking)
  │                                          │
  ▼                                          ▼
Task 6 (bottom tab navigation) ←────────────┘
  │
  ▼
Task 9 (Cloud Functions)
  │
  ▼
Task 10 (testing)
```

#### Task Breakdown

##### Task 1: Create `notificationStore.ts` [🥇 Foundation] ✅

**Files:** CREATE `src/store/notificationStore.ts`

**What:** Zustand store for notification state — reminder time, enabled flag, FCM token, scheduled notification IDs.

**Est. time:** 15 min  
**Status:** ✅ Complete

---

##### Task 2: Enhance `notificationService.ts` [🥇 Foundation] ✅

**Files:** MODIFY `src/services/notificationService.ts`

**What:** Complete the notification service with daily recurring scheduling, cancel all, and FCM token persistence.

**Methods added:**
- `scheduleDailyReminder(hour, minute)` — daily recurring local notification
- `cancelAllScheduledNotifications()` — cancel all pending
- `getAllScheduledNotifications()` — list pending
- `saveFcmTokenToFirestore(userId, token)` — persist FCM token
- `getFcmTokenFromFirestore(userId)` — retrieve FCM token

**Est. time:** 30 min  
**Status:** ✅ Complete

---

##### Task 3: Wire Notification Handlers in `App.tsx` [🥇 Foundation] ✅

**Files:** MODIFY `src/App.tsx`

**What:** Set up foreground handler, notification permission request, and FCM token registration on auth.

**Implementation:**
- `useEffect` on mount → call `notificationService.setupForegroundNotificationHandler()`
- `useEffect` on `user` → request permissions → get token → save to Firestore

**Est. time:** 20 min  
**Status:** ✅ Complete

---

##### Task 4: Create `ReminderSettingsScreen.tsx` [🥈 Screen] ✅

**Files:**
- CREATE `src/screens/SettingsStack/ReminderSettingsScreen.tsx`

**What:** Settings screen with time picker, enable/disable toggle, and test notification button.

**UI elements:**
- Time input (HH:MM format with validation via `validateTime`)
- Enable/disable Switch
- "Send Test Notification" TouchableOpacity
- "Save" button that persists to Firestore + schedules/cancels local notifications

**Theme:** Follow slate/emerald/rose palette from Phase 1D polish  
**Est. time:** 45 min  
**Status:** ✅ Complete

---

##### Task 5: Create `ProfileScreen.tsx` [🥈 Screen] ✅

**Files:**
- CREATE `src/screens/SettingsStack/ProfileScreen.tsx`

**What:** User profile management screen.

**UI elements:**
- Display email (read-only)
- Edit name TextInput
- Edit timezone TextInput
- "Save Changes" button → `authService.updateUserProfile()`
- "Log Out" button → `useAuth().logout()` with Alert confirmation
- "Delete Account" button (placeholder — requires Cloud Function)

**Est. time:** 30 min  
**Status:** ✅ Complete

---

##### Task 6: Restructure Navigation with Bottom Tabs [🥈 Navigation] ✅

**Files:**
- MODIFY `src/navigation/RootNavigator.tsx`
- CREATE `src/navigation/SettingsStack.tsx`

**What:** Add bottom tabs for "Journals" and "Settings" using `@react-navigation/bottom-tabs`.

**Structure:**
```
MainTabs (bottom tabs)
  ├── Tab: "Journals" → JournalStack (existing, headerShown: false)
  └── Tab: "Settings" → SettingsStack (new, headerShown: false)
      ├── Profile
      └── ReminderSettings
```

**Note:** `@react-navigation/bottom-tabs` is already in `package.json`  
**Est. time:** 30 min  
**Status:** ✅ Complete

---

##### Task 7: Implement FCM Token Registration Flow [🥉 Integration]

**Files:** MODIFY `src/services/notificationService.ts` + `src/App.tsx`

**What:** Complete FCM flow — token retrieval, persistence, refresh handling.

**Implementation:**
- On login: get token via `expo-notifications` `getDevicePushTokenAsync()`
- Save to `users/{userId}/fcmToken` in Firestore
- Listen for token refresh with `onTokenRefresh` if using `firebase/messaging`
- On logout: optionally remove token from Firestore

**Est. time:** 20 min  
**Status:** ⏳ Not Started

---

##### Task 8: Implement Deep Linking from Notification Tap [🥉 Integration]

**Files:** MODIFY `src/App.tsx` + `src/navigation/RootNavigator.tsx`

**What:** When user taps a notification, navigate to the relevant journal screen.

**Flow:**
1. `addNotificationResponseReceivedListener` captures tap
2. Extract `journalId` from notification data payload
3. Navigate to `JournalDetail` or `EntryLog` via navigation ref
4. Handle cold start: stored deep link processed after nav is ready

**Notification payload format:** `{ journalId: string, type: 'reminder' }`  
**Est. time:** 25 min  
**Status:** ⏳ Not Started

---

##### Task 9: Build Cloud Functions [🥉 Server]

**Files to create:**
- `firebase/functions/package.json`
- `firebase/functions/tsconfig.json`
- `firebase/functions/src/index.ts`
- `firebase/functions/src/reminderScheduler.ts`
- `firebase/functions/src/userCleanup.ts`
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`

**9a: `reminderScheduler.ts`** — Pub/sub function that runs hourly:
```
1. Query all users where reminderEnabled == true
2. For each user, check if current UTC hour:minute matches reminderTime
3. If match: send FCM message with their fcmToken
4. Payload: { type: 'reminder', journalId: null }
```

**9b: `userCleanup.ts`** — Auth trigger on user delete:
```
1. Delete all journals where userId == deleted UID
2. Delete all entries where userId == deleted UID
3. Delete user document
```

**9c: Firestore Security Rules:**
```
users/{userId}: only owner can read/write
journals/{journalId}: only owner (userId match)
entries/{entryId}: only owner (userId match)
```

**Est. time:** 60 min  
**Status:** ⏳ Not Started

---

##### Task 10: Test Notification Delivery [🧪 Validation]

**Test scenarios to run on iOS simulator + physical device:**

| # | Scenario | Steps | Success Criteria |
|---|----------|-------|-----------------|
| 1 | Foreground notification | App open, reminder fires | Alert shows on screen |
| 2 | Background notification | App in background, reminder fires | Notification in notification center |
| 3 | Tap notification (foreground) | Tap while app open | Navigates to journal |
| 4 | Tap notification (background) | Tap from lock screen | App opens to journal |
| 5 | Permission denied | User denies permission | No crash, graceful fallback |
| 6 | Schedule change | Change reminder time | Old canceled, new scheduled |
| 7 | Disable reminders | Toggle off | All notifications canceled |
| 8 | Cold start deep link | Kill app, tap notification | App launches to journal |

**Est. time:** 45 min  
**Status:** ⏳ Not Started

---

#### Implementation Order Summary

| Priority | Task | Est. Time | Total |
|----------|------|-----------|-------|
| 🥇 T1 | `notificationStore.ts` | 15 min | 15 min | ✅ Done |
| 🥇 T2 | Enhance `notificationService.ts` | 30 min | 45 min | ✅ Done |
| 🥇 T3 | Wire `App.tsx` handlers | 20 min | 65 min | ✅ Done |
| 🥈 T4 | `ReminderSettingsScreen.tsx` | 45 min | 110 min | ✅ Done |
| 🥈 T5 | `ProfileScreen.tsx` | 30 min | 140 min | ✅ Done |
| 🥈 T6 | Bottom tab navigation | 30 min | 170 min | ✅ Done |
| 🥉 T7 | FCM token flow | 20 min | 190 min |
| 🥉 T8 | Deep linking | 25 min | 215 min |
| 🥉 T9 | Cloud Functions | 60 min | 275 min |
| 🧪 T10 | Testing | 45 min | 320 min (~5.3 hrs) |

**Dependencies:** Phase 1D, Firebase Cloud Functions setup  
**Deliverables:** Users receive daily reminders, can configure them, tapping notification opens journal

---

### Phase 1F: Testing & Polish (⏳ Not Started)

**Goal:** Comprehensive testing, UI polish, accessibility, performance.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Unit tests for `authService.ts` | ⏳ | Signup, login, logout, error handling |
| 2 | Unit tests for `entryService.ts` | ⏳ | CRUD, date queries, drafts |
| 3 | Unit tests for remaining `validation.ts` functions | ⏳ | Email, password, name, timezone, time |
| 4 | Integration test: auth flow (signup → profile → journals) | ⏳ | |
| 5 | Integration test: entry flow (create journal → log entry → view history) | ⏳ | |
| 6 | Build reusable components library | ⏳ | `<FieldInput>`, `<Button>`, `<Toast>`, `<LoadingSpinner>`, `<JournalCard>` |
| 7 | Create custom hooks | ⏳ | `useAuth`, `useJournals`, `useNotifications` |
| 8 | Extract color theme to constants (`src/constants/colors.ts`) | ⏳ | Design tokens for consistency |
| 9 | Accessibility audit + add labels | ⏳ | `accessibilityLabel`, touch targets |
| 10 | Performance optimization | ⏳ | Memoization, FlatList optimization |
| 11 | Error handling polish | ⏳ | Toast system, retry logic |
| 12 | Dark mode support | ⏳ | Theme context + color tokens |
| 13 | Manual testing on iOS device/simulator | ⏳ | Full regression pass |

**Dependencies:** Phase 1E  
**Deliverables:** Polished, tested, accessible app ready for TestFlight

---

### Phase 2: Advanced Features (⏳ Future)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 2A | **Journal Templates** | Pre-built templates (Gratitude, Health, Work, etc.) | Medium |
| 2B | **Entry Analytics** | Charts, mood tracking, word clouds, export to PDF/CSV | Medium |
| 2C | **Search & Filter** | Full-text search across entries, date range filtering | Low |
| 2D | **Multi-language Support** | i18n for English + additional languages | Low |
| 2E | **Apple Sign-In** | Native Apple OAuth provider | Low |
| 2F | **Widget (iOS)** | Today widget showing streak + quick entry | Low |
| 2G | **Backup & Restore** | iCloud/export backup of all journal data | Low |

---

### Phase 3: Production Readiness (⏳ Future)

| # | Task | Description |
|---|------|-------------|
| 3A | **EAS Build** | Configure Expo Application Services for build |
| 3B | **TestFlight Distribution** | Internal + external testing |
| 3C | **App Store Submission** | Prepare metadata, screenshots, privacy policy |
| 3D | **Crash Reporting** | Set up Sentry or Firebase Crashlytics |
| 3E | **Analytics** | Set up Firebase Analytics for usage tracking |
| 3F | **Monitoring** | Set up performance monitoring and alerts |

---

## Dependency Map

```
Phase 1A (Setup) ──→ Phase 1B (Auth) ──→ Phase 1C (Journals) ──→ Phase 1D (Entries)
                                                                        │
                                                                        ▼
                                                                  Phase 1E (Notifications)
                                                                        │
                                                                        ▼
                                                                  Phase 1F (Polish)
                                                                        │
                                                                        ▼
                                                            Phase 2 (Advanced) ──→ Phase 3 (Release)
```

- Each phase depends on the previous phase being complete.
- Phase 0 (Documentation) is ongoing throughout.
- Phase 1E can begin as soon as Phase 1D is stable (no hard dependency on 1F).
- Phase 2 can begin in parallel with Phase 1F or after.

---

## Quality Gates

Every phase must pass these gates before being marked complete:

| Gate | Command | Minimum |
|------|---------|---------|
| Lint | `npm run lint` | 0 errors, 0 warnings |
| TypeScript | `npm run type-check` | 0 errors |
| Unit Tests | `npm test -- --runInBand` | 100% pass rate |
| Coverage | `npm test -- --coverage` | 70%+ lines, branches, functions |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Firebase console configuration not verified | Medium | High | Verify Firebase project + Firestore rules before Phase 1E |
| Notification delivery unreliable on iOS simulator | Medium | Medium | Test on physical device; use both local + FCM for redundancy |
| Phase 1D dynamic form rendering complexity | Low | Medium | Already completed — no further risk |
| Documentation drift | Medium | Medium | Update docs in same session as code changes |
| TypeScript strictness causing build issues | Low | Low | Already passing; maintain discipline |
| Firestore composite index requirements | Low | Medium | Query without composite indexes where possible; add indexes as needed |

---

## Milestone Timeline

```
May 7   May 9   May 10   May 12-14   May 15-17   May 20+     June+
│       │       │        │           │           │           │
●───────●───────●────────●───────────●───────────●───────────●───→
│       │       │        │           │           │           │
1A-1B   1C      1D       1E          1F          2A-2B       3A-3F
Done    Done    Done     In Prog     Planned    Future      Future
```

**Phase 1E Target:** Complete by May 12, 2026 (on track)  
**Phase 1F Target:** Complete by May 17, 2026  
**Phase 2 Target:** June 2026  
**Phase 3 Target:** June-July 2026

---

*This plan is a living document. Update it after each session to reflect current reality.*

