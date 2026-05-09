# Journal App - Implementation Plan

**Project Name:** DailyLog (iOS Journal App)  
**Status:** Implementation In Progress  
**Last Updated:** May 9, 2026

---

## Current Reality (Verified)

- Phase 1A foundations are mostly implemented.
- Phase 1B authentication is implemented in code.
- Quality gate is green: `lint` and `type-check` both passing.
- Phase 1C journal management is implemented end-to-end.

---

## Phase Status Tracker

### Phase 1A: Project Setup & Firebase
- [x] Initialize Expo React Native project
- [x] Set up TypeScript, ESLint, Prettier
- [x] Create project directory structure
- [~] Initialize Firebase project and configure credentials (code/env present; console verification pending)
- [x] Set up environment variables (.env.local, .env.staging, .env.production)
- [x] Create Firebase service wrapper for auth and database
- [x] Set up Zustand for global state (user, journals, entries)

### Phase 1B: Authentication
- [x] Build Firebase Auth service
- [x] Create Sign-Up screen (email/password validation)
- [x] Create Login screen (email/password; Google OAuth deferred)
- [x] Create Profile Setup screen (name, timezone, reminder time)
- [x] Implement persistent session (Firebase auth listener)
- [x] Create Protected Navigation (AuthContext + RootNavigator)

### Phase 1C: Journal Management
- [x] Build "My Journals" list screen
- [x] Create "New Journal" screen
- [x] Implement custom field builder (add/remove fields)
- [x] Save journal to Firestore from UI
- [x] Create Journal Detail screen (view fields, edit metadata)
- [x] Implement journal archive/delete functionality from UI

### Phase 1D: Entry Logging
- [ ] Build Dynamic Entry Form screen
- [ ] Implement field input components
- [ ] Create entry save logic
- [ ] Build Entry History screen
- [ ] Implement date picker navigation
- [ ] Local draft support

### Phase 1E: Reminders & Push Notifications
- [ ] Set up Firebase Cloud Messaging (FCM) end-to-end
- [~] Implement local notifications service (base service exists)
- [ ] Create Reminder Settings screen
- [ ] Build Cloud Function for daily reminder scheduler
- [ ] Implement notification permission request flow in UX
- [ ] Test notification delivery (background + foreground)

### Phase 1F: Testing & Polish
- [ ] Unit tests for auth, data models, notifications
- [ ] Manual testing on iOS device/simulator
- [ ] Performance optimization
- [ ] Accessibility review
- [ ] Error handling and user feedback polish
- [ ] Prepare TestFlight build

---

## Immediate Plan (Next 2 Days)

1. Start Phase 1D implementation:
- Build Dynamic Entry Form screen from journal `fieldSchema`.
- Implement field input components (`text`, `date`, `rating`, `multiChoice`).
- Implement entry create flow with required-field validation.

2. Entry history and navigation:
- Build Entry History screen with date ordering and empty/error states.
- Add navigation from Journal Detail to entry create/history flows.
- Implement date-based entry retrieval with `entryService.getEntriesByDate`.

3. Maintain quality baseline:
- Keep `npm run lint`, `npm run type-check`, and `npm test -- --runInBand` green.
- Expand focused unit tests for entry validation/service paths.

---

## Risks

- Phase 1D complexity is higher due dynamic form rendering across field types.
- Documentation drift can hide regressions and create planning errors.
