# DailyLog — Manual Test Plan

**Project:** DailyLog (iOS Journal App)  
**Target Phase:** Phase 1 (1A–1E)  
**Last Updated:** May 10, 2026  
**Device:** iOS Simulator (preferred) + Physical Device for notification tests

---

## Table of Contents

1. [Test Setup & Prerequisites](#1-test-setup--prerequisites)
2. [Phase 1A: Project Setup & Firebase](#2-phase-1a-project-setup--firebase)
3. [Phase 1B: Authentication](#3-phase-1b-authentication)
4. [Phase 1C: Journal Management](#4-phase-1c-journal-management)
5. [Phase 1D: Entry Logging](#5-phase-1d-entry-logging)
6. [Phase 1E: Reminders & Notifications](#6-phase-1e-reminders--notifications)
7. [Cross-Phase Integration Tests](#7-cross-phase-integration-tests)
8. [Error Handling & Edge Cases](#8-error-handling--edge-cases)
9. [UI/UX Verification](#9-uiux-verification)
10. [Test Run Log](#10-test-run-log)

---

## 1. Test Setup & Prerequisites

### 1.1 Environment
- [ ] App builds successfully with `npx expo run:ios`
- [ ] Quality gates pass before testing: `npm run lint`, `npm run type-check`, `npm test`
- [ ] Firebase emulator is running OR connected to Firestore production
- [ ] Device push notifications enabled in iOS Settings (for notification tests)

### 1.2 Test Data to Prepare
- A test email account (e.g., `test@dailylog.app`)
- A strong test password (e.g., `TestPass123!`)
- A second test account for isolation tests

### 1.3 Navigation Structure (For Reference)
```
App
├── AuthStack (unauthenticated)
│   ├── Login
│   ├── SignUp
│   └── ProfileSetup
└── MainTabs (authenticated via RootNavigator)
    ├── JournalsTab → JournalStack
    │   ├── JournalList (My Journals)
    │   ├── NewJournal
    │   ├── JournalDetail
    │   ├── EntryLog
    │   └── EntryHistory
    └── SettingsTab → SettingsStack
        ├── Profile
        └── ReminderSettings
```

---

## 2. Phase 1A: Project Setup & Firebase

### 2.1 App Launch & Initial Load

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 1.1 | Clean app launch | Kill app, relaunch, wait for loading | Splash/Loading screen appears first, then Login screen | ⬜ | |
| 1.2 | Firebase connectivity | Launch app with network on | No Firebase connection error shown; Login screen renders | ⬜ | |
| 1.3 | Offline launch | Enable airplane mode, launch app | App should show Login screen or graceful error; no crash | ⬜ | |
| 1.4 | Network reconnect | Offline → turn network back on | App recovers; Firebase auth listener picks up state | ⬜ | |

### 2.2 Environment Configuration

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 2.1 | Firebase config validation | Check `src/config/firebaseConfig.ts` | All 6 env vars present: API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID | ⬜ | |
| 2.2 | Console verification | Open Firebase Console → Authentication → Users | Should be empty before test account creation | ⬜ | Requires Firebase project access |

---

## 3. Phase 1B: Authentication

### 3.1 Sign Up

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 3.1 | Sign up with valid credentials | Enter valid email + strong password + confirm password, tap "Sign Up" | Account created; navigated to ProfileSetup screen | ⬜ | |
| 3.2 | Sign up with invalid email | Enter "notanemail", fill rest, tap Sign Up | Alert: "Invalid Email" with descriptive message | ⬜ | |
| 3.3 | Sign up with empty email | Leave email blank, tap Sign Up | Alert: "Email is required" | ⬜ | |
| 3.4 | Sign up with weak password | Enter valid email, password "short", tap Sign Up | Alert: "Password must be at least 8 characters long" | ⬜ | |
| 3.5 | Sign up with no uppercase | Enter valid email, password "lowercase1", tap Sign Up | Alert: "Password must contain at least one uppercase letter" | ⬜ | |
| 3.6 | Sign up with no number | Enter valid email, password "NoNumber!", tap Sign Up | Alert: "Password must contain at least one number" | ⬜ | |
| 3.7 | Sign up with mismatched confirm | Enter correct password, different confirm, tap Sign Up | Alert: "Passwords do not match" | ⬜ | |
| 3.8 | Sign up with existing email | Use already-registered email | Alert: "This email is already registered" | ⬜ | |
| 3.9 | Sign up empty confirm field | Enter password, leave confirm blank, tap Sign Up | Alert: "Please confirm your password" | ⬜ | |
| 3.10 | Loading state during signup | Tap Sign Up with valid data | Button shows "Creating account...", interaction disabled | ⬜ | |

### 3.2 Profile Setup

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 3.11 | Complete profile with valid data | Enter name "Test User", timezone "America/New_York", reminder "09:00", enabled=true, tap Save | Profile saved; navigated to main JournalList screen | ⬜ | |
| 3.12 | Profile with empty name | Leave name blank, tap Save | Alert: "Name is required" | ⬜ | |
| 3.13 | Profile with short name | Enter "A", tap Save | Alert: "Name must be at least 2 characters long" | ⬜ | |
| 3.14 | Profile with invalid timezone | Enter "Invalid/Zone", tap Save | Alert: "Invalid timezone" | ⬜ | |
| 3.15 | Profile with invalid time format | Enter "25:00" as reminder time, tap Save | Alert: "Invalid Time" | ⬜ | |
| 3.16 | Profile with special chars in name | Enter "<script>alert</script>", tap Save | Alert: "Name can only contain letters, spaces, hyphens, and apostrophes" | ⬜ | |
| 3.17 | Default timezone detection | Leave timezone as default | Should show device timezone (e.g., "America/New_York") | ⬜ | |
| 3.18 | Loading state during save | Tap Save with valid data | Button shows "Saving...", interaction disabled | ⬜ | |
| 3.19 | Back navigation prevention | On ProfileSetup, try to swipe back or press back | Should not navigate away; user must complete profile | ⬜ | |

### 3.3 Login

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 3.20 | Login with valid credentials | Enter registered email + correct password, tap Log In | Auth state updated; navigated to JournalList | ⬜ | |
| 3.21 | Login with wrong password | Enter email + incorrect password, tap Log In | Alert: "Incorrect password. Please try again." | ⬜ | |
| 3.22 | Login with unregistered email | Enter unregistered email + any password | Alert: "No account found with this email" | ⬜ | |
| 3.23 | Login with empty email | Leave email blank, tap Log In | Alert: "Email is required" | ⬜ | |
| 3.24 | Login with empty password | Enter email, leave password blank, tap Log In | Alert: "Password is required" | ⬜ | |
| 3.25 | Login with invalid email | Enter "bad@email" (no dot), fill password, tap Log In | Alert: "Please enter a valid email address" | ⬜ | |
| 3.26 | Navigate from Login to SignUp | Tap "Don't have an account? Sign up" | Navigates to SignUp screen | ⬜ | |
| 3.27 | Loading state during login | Tap Log In with valid data | Button shows "Logging in...", interaction disabled | ⬜ | |
| 3.28 | Rapid tap prevention | Tap Log In multiple times quickly | Only one request fires; no duplicate account errors | ⬜ | |

### 3.4 Session Persistence

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 3.29 | Session survives app restart | Log in → kill app → relaunch | App should navigate directly to JournalList (no login screen) | ⬜ | |
| 3.30 | Session survives background/foreground | Log in → send to background → bring to foreground | App remains on JournalList, no re-auth flash | ⬜ | |

### 3.5 Logout

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 3.31 | Logout from Profile screen | Tap Log Out → confirm dialog "Log Out" | Logs out; navigated to Login screen | ⬜ | |
| 3.32 | Cancel logout | Tap Log Out → tap "Cancel" | Remains on Profile screen; no logout | ⬜ | |
| 3.33 | Verify session cleared after logout | Log out → kill app → relaunch | Login screen shown (not auto-login) | ⬜ | |
| 3.34 | Logout with failed network | Enable airplane mode, tap Log Out | Alert: appropriate error or graceful failure | ⬜ | |

### 3.6 Delete Account

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 3.35 | Delete account tap | Tap "Delete Account" | Confirmation dialog appears | ⬜ | |
| 3.36 | Delete account confirmation | Tap "Delete" in dialog | Alert: "Account deletion is not yet available" (placeholder) | ⬜ | |
| 3.37 | Delete account cancel | Tap "Delete" → tap "Cancel" | No action; remains on Profile screen | ⬜ | |

---

## 4. Phase 1C: Journal Management

### 4.1 Journal List (My Journals)

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 4.1 | Empty journal list | New user with no journals | Shows "No journals yet. Create your first journal." message | ⬜ | |
| 4.2 | Journal list loads journals | After creating 3 journals, return to list | All 3 journals visible, sorted by createdAt (newest first) | ⬜ | |
| 4.3 | Pull-to-refresh | Pull down on list | Loading indicator shows; journals reload from Firestore | ⬜ | |
| 4.4 | Journal item displays fields | View a journal card | Shows title, description (if any), field count, status (Active/Archived) | ⬜ | |
| 4.5 | Navigate to New Journal | Tap "Create Journal" button | Navigates to NewJournal screen | ⬜ | |
| 4.6 | Navigate to Journal Detail | Tap a journal card | Navigates to JournalDetail with that journal's data | ⬜ | |
| 4.7 | Archived journals hidden | Archive a journal, return to list | Archived journal no longer appears in list | ⬜ | |
| 4.8 | Loading state | Fresh load with network delay | Spinner or loading indicator visible | ⬜ | |
| 4.9 | Error state | Network error while loading | Error banner: "Failed to load journals. Please try again." | ⬜ | |

### 4.2 New Journal Creation

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 4.10 | Create journal with title only | Enter title "Test Journal", leave all else default, tap Create | Journal created; success alert; returns to list | ⬜ | |
| 4.11 | Create journal with empty title | Leave title blank, tap Create | Alert: "Journal title is required" | ⬜ | |
| 4.12 | Create journal with short title | Enter "A", tap Create | Alert: "Journal title must be at least 2 characters long" | ⬜ | |
| 4.13 | Create journal with very long title | Enter 61+ characters, tap Create | Alert: "Journal title must be less than 60 characters" | ⬜ | |
| 4.14 | Create journal with invalid color | Enter "not-a-color", tap Create | Alert: "Color must be a valid hex code" | ⬜ | |
| 4.15 | Create journal with description | Fill all fields, tap Create | Journal created with description visible | ⬜ | |
| 4.16 | Add custom text field | Tap "+ Add Field", set label="What happened?", type=text, required=false | Field card appears with text type badge | ⬜ | |
| 4.17 | Add custom date field | Add field, label="Date", type=date, required=true | Field card with date type badge | ⬜ | |
| 4.18 | Add custom rating field | Add field, label="Mood", type=rating, required=true | Field card with rating type badge | ⬜ | |
| 4.19 | Add custom multiChoice field | Add field, label="Feeling", type=multiChoice, options="Happy,Sad,Neutral" | Field card with multiChoice badge; saves correctly | ⬜ | |
| 4.20 | Remove custom field | Add field → tap "Remove Field" | Field is removed from the list | ⬜ | |
| 4.21 | Field label required | Add field with no label → tap Create Journal | Alert: "Each custom field must have a label" | ⬜ | |
| 4.22 | multiChoice needs 2+ options | Add multiChoice field, label="Feeling", no options → tap Create | Alert: "Multi-choice fields need at least 2 options." | ⬜ | |
| 4.23 | Multiple fields | Add 5 fields of mixed types, fill all | All fields appear and save correctly | ⬜ | |
| 4.24 | Loading state during creation | Tap Create with valid data | Button shows "Creating...", interaction disabled | ⬜ | |
| 4.25 | Toggle required on field | Add field, toggle Required switch on/off | Switch state persists correctly | ⬜ | |

### 4.3 Journal Detail

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 4.26 | View journal detail | Tap journal from list | Shows title, description, color indicator, custom fields list | ⬜ | |
| 4.27 | Streak display for new journal | Journal with no entries | Streak shows "0 days" with no fire emoji | ⬜ | |
| 4.28 | Streak display with entries | Log entries for 3 consecutive days | Streak shows "3 days" with 🔥 badges | ⬜ | |
| 4.29 | Field schema display | View journal with 4 field types | All fields listed with type, required status, multiChoice options | ⬜ | |
| 4.30 | "Log Daily Entry" button | Tap "Log Daily Entry" | Navigates to EntryLog for this journal | ⬜ | |
| 4.31 | "View Entries" button | Tap "View Entries" | Navigates to EntryHistory for this journal | ⬜ | |
| 4.32 | Archive button → confirm | Tap "Archive Journal" → confirm | Journal archived; success alert; navigates back to list | ⬜ | |
| 4.33 | Archive button → cancel | Tap "Archive Journal" → tap "Cancel" | No action; remains on detail screen | ⬜ | |
| 4.34 | Loading state | Open detail with slow network | Shows "Loading journal..." | ⬜ | |
| 4.35 | Error state | Network error while loading | Shows error message + "Retry" button | ⬜ | |
| 4.36 | Permission check | Load journal belonging to another user | "You do not have permission to view this journal." | ⬜ | Manual Firestore data edit needed |

### 4.4 Journal Archive

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 4.37 | Archive from list | Tap "Archive" on journal card → confirm | Archived; disappears from list | ⬜ | |
| 4.38 | Archive from detail | Tap "Archive Journal" in detail → confirm | Archived; success alert; navigates back | ⬜ | |

---

## 5. Phase 1D: Entry Logging

### 5.1 Entry Form (EntryLog)

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 5.1 | Load entry form | From JournalDetail, tap "Log Daily Entry" | Form renders with journal title, date field, all custom fields from schema | ⬜ | |
| 5.2 | Default date | Open entry form today | EntryDate defaults to current date in YYYY-MM-DD format | ⬜ | |
| 5.3 | Text field input | Type response in text field | Text appears in field | ⬜ | |
| 5.4 | Rating field input | Enter "5" in rating field | Numeric value accepted | ⬜ | |
| 5.5 | Rating field invalid input | Enter "abc" in rating field | Text accepted (stored as string; validation is at save time) | ⬜ | See save validation |
| 5.6 | Date field input | Enter "2026-05-15" in date field | Date string accepted | ⬜ | |
| 5.7 | Multi-choice field selection | Tap an option | Option highlights; other options de-highlight (single select) | ⬜ | |
| 5.8 | Multi-choice change selection | Tap a different option | New option selected, old deselected | ⬜ | |
| 5.9 | Save entry with all fields filled | Fill all fields (including required), tap Save | Entry saved; success alert; navigated back to JournalDetail | ⬜ | |
| 5.10 | Save entry with missing required field | Leave required field empty, tap Save | Alert: "Please answer the required field: [field label]" | ⬜ | |
| 5.11 | Save entry with no optional fields | Fill only required fields, tap Save | Saves successfully | ⬜ | |
| 5.12 | Loading state during save | Tap Save | Button shows "Saving...", interaction disabled | ⬜ | |
| 5.13 | Error state during save | Network error while saving | Alert: "Unable to save entry. Please try again." | ⬜ | |

### 5.2 Draft Auto-Save

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 5.14 | Draft saves automatically | Type in a field, wait 1 second | Green dot indicator appears; "Draft saved" banner shows | ⬜ | |
| 5.15 | Draft persists on navigation away | Fill fields → navigate back to JournalDetail → re-enter EntryLog | Fields pre-filled with draft values; "Draft saved" visible | ⬜ | |
| 5.16 | Draft persists on app background | Fill fields → send app to background → bring back | Draft data preserved | ⬜ | |
| 5.17 | Discard draft | Tap "Discard draft" → confirm | Fields reset to empty; draft cleared | ⬜ | |
| 5.18 | Cancel discard draft | Tap "Discard draft" → tap "Cancel" | Fields remain as-is; draft preserved | ⬜ | |
| 5.19 | Draft cleared after successful save | Save entry → go back → re-enter EntryLog for same journal | Fresh form (no draft data) | ⬜ | |
| 5.20 | Drafts isolated per journal | Fill draft in Journal A → navigate to Journal B | Journal B has its own draft (or empty if none) | ⬜ | |

### 5.3 Entry History

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 5.21 | Empty history | Open EntryHistory for journal with no entries | Shows "No entries yet. Create your first entry." | ⬜ | |
| 5.22 | Entries displayed chronologically | Log 3 entries on different dates | Entries sorted by date descending (newest first) | ⬜ | |
| 5.23 | Field values displayed with labels | View an entry with filled fields | Each field shows its label + value in a bordered card | ⬜ | |
| 5.24 | Field values displayed for empty fields | View an entry with empty fields | Shows "No response" for empty fields | ⬜ | |
| 5.25 | Streak display in EntryHistory | Multiple consecutive days logged | Streak shows correct count with 🔥 badge | ⬜ | |
| 5.26 | Streak = 0 in history | No consecutive entries | Streak section hidden (no streak = no UI) | ⬜ | |
| 5.27 | Created timestamp | View any entry | Shows "Created: [date time]" at bottom of entry card | ⬜ | |
| 5.28 | All field types display | View entry with text, date, rating, multiChoice values | Each type renders correctly (text as string, rating as number, etc.) | ⬜ | |
| 5.29 | Pull-to-refresh | Pull down on history | Entries reload from Firestore | ⬜ | |
| 5.30 | Loading state | Fresh load with delay | Loading indicator visible | ⬜ | |
| 5.31 | Error state | Network error while loading | Error banner: "Failed to load entries. Please try again." | ⬜ | |

### 5.4 Streak Calculation

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 5.32 | Streak = 1 day | Log entry today only | Streak shows "1 day" with 🔥 | ⬜ | |
| 5.33 | Streak = 3 consecutive days | Log entries for today, yesterday, day before | Streak shows "3 days" with 🔥 | ⬜ | |
| 5.34 | Streak = 0 (no entries) | No entries in journal | Streak shows "0 days", no 🔥 | ⬜ | |
| 5.35 | Streak breaks on gap | Log Mon, Tue, Thu (skip Wed) | Streak = 1 (only Thu counts from current date backward) | ⬜ | |
| 5.36 | Streak updates after new entry | Streak = 2, log today's entry | Streak becomes 3 | ⬜ | |
| 5.37 | Streak persists across screens | Check streak in JournalDetail → EntryHistory | Same streak count on both screens | ⬜ | |

---

## 6. Phase 1E: Reminders & Notifications

### 6.1 Notification Permissions

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.1 | Permission requested on login | Log in as new user | System notification permission dialog appears | ⬜ | |
| 6.2 | Permission granted flow | Tap "Allow" on permission dialog | `isEnabled` set to true; FCM token saved to Firestore | ⬜ | |
| 6.3 | Permission denied flow | Tap "Don't Allow" on permission dialog | `isEnabled` set to false; no crash; app continues normally | ⬜ | |
| 6.4 | Permission status persists | Grant → kill app → relaunch | Permission state persists; FCM token still saved | ⬜ | |

### 6.2 Foreground Notification Handler

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.5 | Foreground notification displays | Schedule test notification while app is in foreground | Alert/banner shows on screen (shouldShowAlert = true) | ⬜ | |

### 6.3 Reminder Settings Screen

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.6 | Navigate to Reminder Settings | Open Settings tab → tap "Reminder Settings" | Screen renders with time field, toggle, test button, save button | ⬜ | |
| 6.7 | Pre-populated values | User has saved time 09:00, enabled=true | Fields pre-filled with "09:00", toggle ON | ⬜ | |
| 6.8 | Change reminder time | Change time to "14:30" → toggle stays ON → Save | Settings saved; daily notification rescheduled for 14:30 | ⬜ | |
| 6.9 | Disable reminders | Toggle OFF → Save | All scheduled notifications canceled; `scheduledNotificationId` cleared | ⬜ | |
| 6.10 | Re-enable reminders | Toggle ON → Save | New daily notification scheduled | ⬜ | |
| 6.11 | Invalid time format | Enter "25:00" → tap Save | Alert: "Please use HH:MM format (e.g., 09:00)" | ⬜ | |
| 6.12 | Invalid time format (letters) | Enter "ab:cd" → tap Save | Alert: "Please use HH:MM format (e.g., 09:00)" | ⬜ | |
| 6.13 | Save button disabled when no changes | Open settings → no changes | Save button is grayed out / disabled | ⬜ | |
| 6.14 | Save button active after change | Change any field | Save button becomes active (emerald-700) | ⬜ | |

### 6.4 Test Notification

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.15 | Send test notification (permission granted) | Tap "Send Test Notification" | "Test Sent" alert; notification arrives ~1 minute later | ⬜ | |
| 6.16 | Send test notification (permission denied) | Deny permissions → tap "Send Test Notification" | Alert: "Please enable notifications in your device settings" | ⬜ | |
| 6.17 | Test notification content | Check the delivered notification | Title: "DailyLog Test"; Body: "This is a test notification from DailyLog! 📝" | ⬜ | |

### 6.5 Daily Reminder Scheduling

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.18 | Schedule daily reminder | Set time to 2 minutes ahead → Save → wait | Notification delivered at correct time | ⬜ | Use time close to current for quick testing |
| 6.19 | Reschedule changes old time | Set time 09:00 → Save → change to 14:30 → Save | Only one notification scheduled (14:30); old 09:00 canceled | ⬜ | |
| 6.20 | Repeats daily | Schedule for current time+1min → receive → wait 24h | Should deliver again next day (repeats = true) | ⬜ | Hard to test manually; verify via `getAllScheduledNotifications` |
| 6.21 | Verify scheduled notification exists | Schedule → check via `getAllScheduledNotifications` | Pending notification request found with correct hour/minute | ⬜ | Debug print in code |

### 6.6 Notification Cancelation

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.22 | Cancel all on disable | Schedule → disable reminders → Save | `cancelAllScheduledNotificationsAsync` called; no pending notifications | ⬜ | |
| 6.23 | Cancel all on logout | Schedule → log out | All notifications canceled; notification store reset | ⬜ | |

### 6.7 FCM Token Registration

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.24 | FCM token saved on login | Log in with permission granted | Firestore `users/{userId}/fcmToken` has device token | ⬜ | Check Firebase Console |
| 6.25 | FCM token retrieval | Call `getFcmTokenFromFirestore` after login | Returns non-null token string | ⬜ | Debug print |

### 6.8 Notification from Background/Killed State

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 6.26 | Background notification | Send test notification → background app → receive | Notification appears in notification center | ⬜ | |
| 6.27 | Tap notification (background) | Notification arrives while backgrounded → tap it | App opens to foreground (no crash) | ⬜ | Deep link nav is T8 not yet implemented |
| 6.28 | Cold start notification | Kill app → send notification from external source → tap notification | App launches (no crash) | ⬜ | |

---

## 7. Cross-Phase Integration Tests

### 7.1 Full User Journey (Happy Path)

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 7.1 | Complete signup → profile → journal → entry | 1. Sign up with valid data | Account created, navigated to ProfileSetup | ⬜ | |
| | | 2. Fill profile, Save | Profile saved, navigated to JournalList | ⬜ | |
| | | 3. Create journal with 2 fields | Journal created, appears in list | ⬜ | |
| | | 4. Tap journal → Log Daily Entry | Entry form with 2 field inputs | ⬜ | |
| | | 5. Fill fields, Save Entry | Entry saved, back at JournalDetail | ⬜ | |
| | | 6. View Entries | Entry appears in history with field labels+values | ⬜ | |
| | | 7. Tap Settings → Reminder Settings | Settings screen loads with defaults | ⬜ | |
| | | 8. Set reminder, Save | Settings saved, notification scheduled | ⬜ | |
| | | 9. Profile → Log Out | Logged out, returns to Login | ⬜ | |
| | | 10. Log in again | Session restored, journals & entries still there | ⬜ | |

### 7.2 Multi-Journal Workflow

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 7.2 | Create 3 journals, log entries in each | Create journals A, B, C with different schemas | All visible in JournalList | ⬜ | |
| | | Log 1 entry in A, 2 in B, 3 in C | Each journal's EntryHistory shows correct count | ⬜ | |
| | | Check streaks on each | Streaks independent per journal | ⬜ | |
| | | Archive B | B disappears from list; A and C remain | ⬜ | |

### 7.3 Dark Mode / Theme Consistency

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 7.3 | Visual theme across screens | Navigate through all screens | Consistent slate-50 backgrounds, emerald-700 buttons, rounded-3xl cards | ⬜ | |

---

## 8. Error Handling & Edge Cases

### 8.1 Network Errors

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 8.1 | Signup with no network | Enable airplane mode → attempt signup | Alert with network error message (from Firebase) | ⬜ | |
| 8.2 | Login with no network | Enable airplane mode → attempt login | Alert with network error | ⬜ | |
| 8.3 | Load journals with no network | Enable airplane mode → pull to refresh | Error banner: "Failed to load journals" | ⬜ | |
| 8.4 | Save entry with no network | Fill form → enable airplane mode → Save | Alert: "Unable to save entry" | ⬜ | |
| 8.5 | Save settings with no network | Change reminder → airplane mode → Save | Alert: "Could not save reminder settings" | ⬜ | |
| 8.6 | Recovery after reconnect | Fail → turn network back on → retry action | Operation succeeds | ⬜ | |

### 8.2 Data Edge Cases

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 8.7 | Journal with 0 custom fields | Create journal, don't add any fields | Saves correctly; entry form shows only date field | ⬜ | |
| 8.8 | Journal with 20 custom fields | Create journal, add 20 fields | All fields render; scrollable form | ⬜ | |
| 8.9 | Entry with empty fieldValues | Save entry with no fields filled | Entry saved; fieldValues stores empty strings/null | ⬜ | |
| 8.10 | Entry with special characters | Enter "<test> & 'quotes' " in text field | Saves and displays correctly | ⬜ | |
| 8.11 | Very long field response | Enter 1000 chars in text field | Saves; displays truncated or scrollable in history | ⬜ | |
| 8.12 | Duplicate entry on same date | Log two entries for same date in same journal | Both saved; both appear in history | ⬜ | |
| 8.13 | multiChoice with many options | Create field with 10 multiChoice options | All options render as tappable buttons | ⬜ | |
| 8.14 | multiChoice empty options array | Create field with multiChoice but no options | Saves; entry form shows no options (edge case) | ⬜ | |

### 8.3 Concurrent Actions

| # | Test Case | Steps | Expected Result | Pass/Fail | Notes |
|---|-----------|-------|-----------------|-----------|-------|
| 8.15 | Rapid save button presses | Tap Save Entry multiple times | Only one entry created; loading state prevents duplicates | ⬜ | |
| 8.16 | Navigate away while saving | Tap Save → immediately navigate back | Entry still saves (async completes) | ⬜ | |
| 8.17 | Multiple journals created rapidly | Create journal → back → create another quickly | Both created successfully | ⬜ | |

---

## 9. UI/UX Verification

### 9