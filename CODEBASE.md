# Codebase Documentation - DailyLog

**Project:** DailyLog (iOS Journal App)  
**Last Updated:** May 7, 2026  
**Maintainer:** Engineering Team

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Key Modules](#key-modules)
5. [Data Flow](#data-flow)
6. [Firebase Integration](#firebase-integration)
7. [State Management](#state-management)
8. [Navigation](#navigation)
9. [Component System](#component-system)
10. [Testing Guide](#testing-guide)
11. [Deployment](#deployment)

---

## Project Overview

**DailyLog** is an iOS-first React Native journal application that enables users to:
- Create multiple journals with customizable fields
- Log daily entries with various field types (text, date, rating, multiple-choice)
- Receive configurable daily reminders with push notifications
- Manage their profile and journal settings
- View entry history and basic analytics (Phase 2)

### Tech Stack Summary
| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native + Expo |
| **Language** | TypeScript 5 (strict) |
| **State** | Zustand |
| **Navigation** | React Navigation |
| **Backend** | Firebase (Auth, Firestore, FCM) |
| **UI** | NativeWind (Tailwind for RN) |
| **Storage** | AsyncStorage + Expo SecureStore |

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    iOS Device (User)                        │
├─────────────────────────────────────────────────────────────┤
│  React Native App (Expo)                                    │
│  ├─ Screens (Auth, Journals, Entries, Settings)            │
│  ├─ Components (UI, Forms, FieldInputs)                    │
│  └─ Hooks (useAuth, useJournals, useNotifications)          │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                 │
│  ├─ authStore (user, session state)                        │
│  ├─ journalStore (journals, entries state)                  │
│  └─ notificationStore (notification preferences)            │
├─────────────────────────────────────────────────────────────┤
│  Services & Utilities                                       │
│  ├─ firebaseConfig.ts (Firebase init)                       │
│  ├─ authService.ts (login, signup, session)                 │
│  ├─ journalService.ts (CRUD journals)                       │
│  ├─ entryService.ts (CRUD entries)                          │
│  └─ notificationService.ts (FCM, local notifications)       │
├─────────────────────────────────────────────────────────────┤
│  Local Storage                                              │
│  ├─ AsyncStorage (app state, drafts)                        │
│  ├─ Expo SecureStore (auth tokens, sensitive data)          │
│  └─ iOS UserNotifications (scheduled local notifications)  │
└─────────────────────────────────────────────────────────────┘
                           ↕ (Network)
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                         │
├─────────────────────────────────────────────────────────────┤
│  Authentication (Firebase Auth)                             │
│  ├─ Email/password provider                                 │
│  ├─ Google OAuth provider                                   │
│  └─ Session token management                                │
├─────────────────────────────────────────────────────────────┤
│  Database (Firestore)                                       │
│  ├─ users/{userId} - User profiles                          │
│  ├─ journals/{journalId} - Journal metadata + field schema  │
│  ├─ entries/{entryId} - Daily entries                       │
│  └─ Security Rules (role-based access)                      │
├─────────────────────────────────────────────────────────────┤
│  Cloud Messaging (FCM)                                      │
│  ├─ Send push notifications                                 │
│  └─ Receive device tokens                                   │
├─────────────────────────────────────────────────────────────┤
│  Cloud Functions (Node.js)                                  │
│  ├─ reminderScheduler - Trigger daily reminders             │
│  └─ userCleanup - Delete user data on account removal       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow (Typical User Journey)

```
1. User Starts App
   ↓
2. Check Session (AsyncStorage + Zustand)
   ├─ Session Exists → Navigate to Journals
   └─ No Session → Navigate to Auth
   ↓
3. User Logs In (Firebase Auth)
   ↓
4. Fetch User Profile + Journals (Firestore query)
   ↓
5. Load into Zustand (journalStore.setJournals)
   ↓
6. User Navigates to Journal → Fetch Entries for Today
   ↓
7. User Logs Entry → Save to Firestore (entryService.createEntry)
   ↓
8. Entry Synced → Update Zustand + Show Success Toast
```

---

## Directory Structure

```
journal-app/
│
├── app.json                         # Expo configuration
├── tsconfig.json                    # TypeScript compiler options
├── package.json                     # Dependencies & scripts
├── .env.local                       # Dev Firebase credentials (gitignored)
├── .env.staging                     # Staging Firebase credentials (gitignored)
├── .env.production                  # Prod Firebase credentials (gitignored)
│
├── src/
│   ├── screens/                     # Navigation screens (one file per screen)
│   │   ├── AuthStack/
│   │   │   ├── SignUpScreen.tsx
│   │   │   │   └── Handles user registration
│   │   │   │   ├─ Form validation (email, password strength)
│   │   │   │   ├─ Firebase Auth signup
│   │   │   │   └─ Navigate to ProfileSetup on success
│   │   │   │
│   │   │   ├── LoginScreen.tsx
│   │   │   │   └── Handles user login
│   │   │   │   ├─ Email/password input
│   │   │   │   ├─ Google OAuth button
│   │   │   │   ├─ Session persistence
│   │   │   │   └─ Error handling with toast
│   │   │   │
│   │   │   └── ProfileSetupScreen.tsx
│   │   │       └── First-time user profile creation
│   │   │       ├─ Input: name, timezone, reminder time
│   │   │       ├─ Save to users/{userId} in Firestore
│   │   │       └─ Navigate to JournalList on completion
│   │   │
│   │   ├── JournalStack/
│   │   │   ├── JournalListScreen.tsx
│   │   │   │   └── Displays all journals for user
│   │   │   │   ├─ Real-time listener on journals/{userId}
│   │   │   │   ├─ Shows journal card (title, color, entry count)
│   │   │   │   ├─ Tap journal → navigate to JournalDetail
│   │   │   │   ├─ Long-press → options (edit, archive, delete)
│   │   │   │   └─ FAB → navigate to NewJournal
│   │   │   │
│   │   │   ├── NewJournalScreen.tsx
│   │   │   │   └── Create new journal with custom fields
│   │   │   │   ├─ Input: title, description, color picker
│   │   │   │   ├─ Field builder UI (add/remove fields)
│   │   │   │   ├─ Field types: text, date, rating, multiChoice
│   │   │   │   ├─ Save to journals/{journalId}
│   │   │   │   └─ Navigate back to JournalList on success
│   │   │   │
│   │   │   ├── JournalDetailScreen.tsx
│   │   │   │   └── View journal metadata and latest entries
│   │   │   │   ├─ Show journal title, description, fields
│   │   │   │   ├─ List recent entries (pagination)
│   │   │   │   ├─ Buttons: Edit journal, Log entry, View history
│   │   │   │   └─ Edit mode: rename, change color, modify fields
│   │   │   │
│   │   │   ├── EntryLogScreen.tsx
│   │   │   │   └── Dynamic form to log entry for selected journal
│   │   │   │   ├─ Dynamically renders fields based on fieldSchema
│   │   │   │   ├─ Validates required fields before save
│   │   │   │   ├─ Auto-saves draft to AsyncStorage every 10s
│   │   │   │   ├─ Save entry to entries/{entryId} on submit
│   │   │   │   ├─ Show success toast & navigate back
│   │   │   │   └─ Handle offline: queue entry for sync
│   │   │   │
│   │   │   └── EntryHistoryScreen.tsx
│   │   │       └── View past entries with date navigation
│   │   │       ├─ Calendar picker for date selection
│   │   │       ├─ Query entries by journalId + date
│   │   │       ├─ Display entries in chronological order
│   │   │       ├─ Tap entry → expand/view details
│   │   │       └─ Edit/delete entry options
│   │   │
│   │   └── SettingsStack/
│   │       ├── ProfileScreen.tsx
│   │       │   └── Edit user profile
│   │       │   ├─ Display current user info (name, email, picture)
│   │       │   ├─ Edit name, profile picture upload
│   │       │   ├─ Sync changes to users/{userId}
│   │       │   ├─ Logout button
│   │       │   └─ Delete account option
│   │       │
│   │       └── ReminderSettingsScreen.tsx
│   │           └── Configure daily reminder time & preferences
│   │           ├─ Time picker (24h format)
│   │           ├─ Enable/disable reminders
│   │           ├─ Timezone selector
│   │           ├─ Test reminder button
│   │           ├─ Save to users/{userId}.reminderTime
│   │           └─ Schedule local notifications + FCM
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── FieldInput.tsx            # [KEY] Dynamic field renderer
│   │   │   └── Conditionally renders TextInput, DatePicker, etc.
│   │   │   ├─ Props: field definition, value, onChange
│   │   │   ├─ Handles all field types
│   │   │   └─ Returns consistent UI across app
│   │   │
│   │   ├── Button.tsx                # Reusable button component
│   │   │   ├─ Props: title, onPress, variant, loading
│   │   │   ├─ Variants: primary, secondary, danger
│   │   │   └─ Accessible: proper sizing, contrast
│   │   │
│   │   ├── TextInput.tsx             # Styled text input wrapper
│   │   │   ├─ Props: label, placeholder, error, value, onChange
│   │   │   ├─ Built-in validation feedback
│   │   │   └─ Keyboard type handling
│   │   │
│   │   ├── DatePicker.tsx            # iOS-native date picker
│   │   │   ├─ Props: value, onChange, mode (date/time)
│   │   │   └─ Returns ISO date string
│   │   │
│   │   ├── RatingInput.tsx           # 1-5 star rating input
│   │   │   ├─ Props: value, onChange, max (default 5)
│   │   │   └─ Tap star to set value
│   │   │
│   │   ├── MultiChoiceInput.tsx      # Checkbox/radio picker
│   │   │   ├─ Props: options[], value, onChange, multiSelect
│   │   │   ├─ Radio: single selection
│   │   │   ├─ Checkbox: multiple selection
│   │   │   └─ Scrollable if many options
│   │   │
│   │   ├── Toast.tsx                 # Toast notification component
│   │   │   ├─ Props: message, type (success/error/info)
│   │   │   └─ Auto-dismiss after 3s
│   │   │
│   │   ├── SafeAreaView.tsx          # Wrapper for safe area
│   │   ├── LoadingSpinner.tsx        # Loading indicator
│   │   └── JournalCard.tsx           # Reusable journal card preview
│   │
│   ├── services/                     # [KEY] Firebase & external integrations
│   │   ├── firebaseConfig.ts
│   │   │   └── Firebase app initialization
│   │   │   ├─ initializeApp() with credentials from .env
│   │   │   ├─ Export auth, db, functions, messaging instances
│   │   │   └─ Error handling for init failures
│   │   │
│   │   ├── authService.ts
│   │   │   └── User authentication logic
│   │   │   ├─ signup(email, password) → Firebase Auth
│   │   │   ├─ login(email, password) → Firebase Auth
│   │   │   ├─ loginWithGoogle() → OAuth popup/native picker
│   │   │   ├─ logout() → clear session
│   │   │   ├─ getCurrentUser() → check session from AsyncStorage
│   │   │   ├─ setUserProfile(userId, profileData) → save to Firestore
│   │   │   └─ Error handling (auth/invalid-email, auth/weak-password, etc.)
│   │   │
│   │   ├── journalService.ts
│   │   │   └── Journal CRUD operations
│   │   │   ├─ createJournal(userId, journalData) → add to Firestore
│   │   │   ├─ getJournals(userId) → Firestore query (real-time listener)
│   │   │   ├─ updateJournal(journalId, updates) → Firestore set
│   │   │   ├─ deleteJournal(journalId) → Firestore delete
│   │   │   ├─ archiveJournal(journalId) → set isArchived = true
│   │   │   └─ Error handling (permission denied, not found, etc.)
│   │   │
│   │   ├── entryService.ts
│   │   │   └── Entry CRUD operations
│   │   │   ├─ createEntry(journalId, entryData) → add to Firestore
│   │   │   ├─ getEntriesByDate(journalId, date) → query by entryDate
│   │   │   ├─ getEntryHistory(journalId, limit) → paginated query
│   │   │   ├─ updateEntry(entryId, updates) → Firestore set
│   │   │   ├─ deleteEntry(entryId) → Firestore delete
│   │   │   ├─ saveDraft(journalId, draftData) → AsyncStorage
│   │   │   ├─ getDraft(journalId) → AsyncStorage read
│   │   │   └─ Error handling & retry logic
│   │   │
│   │   └── notificationService.ts
│   │       └── Push notifications & scheduling
│   │       ├─ requestNotificationPermission() → user prompt
│   │       ├─ getFCMToken() → get device token from FCM
│   │       ├─ saveFCMToken(userId, token) → Firestore users/{userId}
│   │       ├─ scheduleLocalNotification(time, message) → iOS UserNotifications
│   │       ├─ handleFCMMessage(message) → process incoming FCM
│   │       ├─ onNotificationTap(notification) → navigate to journal
│   │       └─ Error handling (permission denied, service unavailable, etc.)
│   │
│   ├── store/                        # [KEY] Zustand state management
│   │   ├── authStore.ts
│   │   │   └── Global auth state
│   │   │   ├─ State: { user, isLoading, isAuthenticated, error }
│   │   │   ├─ Actions: setUser, setLoading, setError, logout
│   │   │   ├─ Selectors: selectUser, selectIsAuth, selectError
│   │   │   └─ Persistence: hydrate from AsyncStorage on app start
│   │   │
│   │   ├── journalStore.ts
│   │   │   └── Global journals & entries state
│   │   │   ├─ State: { journals: [], entries: [], selectedJournal, isLoading }
│   │   │   ├─ Actions: setJournals, addJournal, updateJournal, deleteJournal
│   │   │   ├─ Actions: setEntries, addEntry, updateEntry, deleteEntry
│   │   │   ├─ Selectors: selectJournals, selectEntries, selectSelectedJournal
│   │   │   └─ Real-time listeners: Firestore on('snapshot')
│   │   │
│   │   └── notificationStore.ts
│   │       └── Notification preferences state
│   │       ├─ State: { reminderTime, isEnabled, timezone, fcmToken }
│   │       ├─ Actions: setReminderTime, setEnabled, setFCMToken
│   │       └─ Sync: Firestore on user profile updates
│   │
│   ├── utils/                        # Helper functions & utilities
│   │   ├── validation.ts
│   │   │   │ Email regex, password strength checker
│   │   │   ├─ isValidEmail(email) → boolean
│   │   │   ├─ isStrongPassword(password) → { valid, feedback }
│   │   │   ├─ validateField(field, value) → { valid, error }
│   │   │   └─ validateEntryForm(fieldSchema, formValues) → { valid, errors }
│   │   │
│   │   ├── dateHelpers.ts
│   │   │   └── Date formatting & manipulation
│   │   │   ├─ formatDate(date, format) → string (e.g., "May 7, 2026")
│   │   │   ├─ getTodayDateString() → "2026-05-07"
│   │   │   ├─ getDateRange(startDate, endDate) → array of dates
│   │   │   ├─ diffDays(date1, date2) → number
│   │   │   └─ isSameDay(date1, date2) → boolean
│   │   │
│   │   ├── logger.ts
│   │   │   └── Debug logging utility
│   │   │   ├─ log(level, module, message, data?) → formatted console output
│   │   │   ├─ Levels: info, warn, error, debug
│   │   │   ├─ Conditional output (dev vs prod)
│   │   │   └─ Error stack traces included
│   │   │
│   │   ├── uuidGenerator.ts
│   │   │   └── Generate unique IDs for Firestore documents
│   │   │   ├─ generateId() → string (uuid v4)
│   │   │   └─ Ensures uniqueness for field IDs, entry IDs
│   │   │
│   │   └── asyncStorage.ts
│   │       └── AsyncStorage wrapper with encryption
│   │       ├─ getItem(key) → string | null
│   │       ├─ setItem(key, value) → void
│   │       ├─ removeItem(key) → void
│   │       ├─ clear() → void (dev mode only)
│   │       └─ All sensitive data encrypted with Expo SecureStore
│   │
│   ├── types/                        # TypeScript interfaces & types
│   │   └── index.ts
│   │       ├─ User { id, name, email, timezone, reminderTime, ... }
│   │       ├─ Journal { id, userId, title, description, color, fieldSchema, ... }
│   │       ├─ JournalField { id, label, type, required, options?, ... }
│   │       ├─ Entry { id, journalId, userId, entryDate, fieldValues, ... }
│   │       ├─ FieldType = "text" | "date" | "rating" | "multiChoice"
│   │       └─ API responses & error types
│   │
│   ├── navigation/                   # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   │   └── Main navigation router
│   │   │   ├─ Checks isAuthenticated from authStore
│   │   │   ├─ Renders AuthStack (if not authenticated)
│   │   │   ├─ Renders AppStack (if authenticated)
│   │   │   └─ Handles loading state while verifying session
│   │   │
│   │   └── JournalNavigator.tsx
│   │       └── App-level bottom tab navigation
│   │       ├─ Tabs: Journals, Settings
│   │       ├─ Stack navigators within each tab
│   │       └─ Deep linking support (open journal from notification)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   │   └── Hook for auth state & operations
│   │   │   ├─ Returns: { user, isLoading, login, signup, logout }
│   │   │   └─ Automatically hydrates session on mount
│   │   │
│   │   ├── useJournals.ts
│   │   │   └── Hook for journals & entries management
│   │   │   ├─ Returns: { journals, entries, selected, create, update, delete }
│   │   │   └─ Sets up real-time Firestore listeners
│   │   │
│   │   ├── useNotifications.ts
│   │   │   └── Hook for notification management
│   │   │   ├─ Returns: { reminderTime, isEnabled, setReminder, test }
│   │   │   └─ Requests permissions on first use
│   │   │
│   │   └── useAsync.ts
│   │       └── Reusable hook for async operations
│   │       ├─ Manages loading, error, data state
│   │       ├─ Automatic retry logic
│   │       └─ Used by all service calls
│   │
│   └── constants/
│       ├── colors.ts
│       │   └── Design tokens
│       │   ├─ Primary, secondary, accent colors
│       │   ├─ Neutral palette (grays)
│       │   ├─ Status colors (success, error, warning)
│       │   └─ Dark mode variants
│       │
│       ├── strings.ts (optional)
│       │   └── Localized strings (Phase 2)
│       │
│       └── config.ts
│           └── App configuration
│           ├─ API endpoints
│           ├─ Feature flags
│           ├─ Max field limits, notification intervals
│           └─ Build-specific settings
│
├── firebase/                         # Cloud Functions (Node.js)
│   ├── functions/
│   │   ├── reminderScheduler.ts
│   │   │   └── [IMPORTANT] Trigger daily reminders
│   │   │   ├─ Runs every hour (Cloud Tasks scheduler)
│   │   │   ├─ Query all users where currentUTCHour matches reminderTime
│   │   │   ├─ For each matching user, send FCM message
│   │   │   ├─ FCM handler in app opens journal reminder screen
│   │   │   └─ Error logging & retry logic
│   │   │
│   │   ├── userCleanup.ts
│   │   │   └── Delete user data on account deletion
│   │   │   ├─ Triggered by Auth "delete user" event
│   │   │   ├─ Delete user doc + all journals + all entries
│   │   │   └─ Cascading delete via batch operations
│   │   │
│   │   └── index.ts
│   │       └── Cloud Functions entry point
│   │       ├─ Export all functions
│   │       └─ Initialize Firebase Admin SDK
│   │
│   ├── firestore.rules
│   │   └── [SECURITY] Firestore security rules
│   │   ├─ users/{userId} → own user doc only
│   │   ├─ journals/{journalId} → userId ownership check
│   │   ├─ entries/{entryId} → userId owner + journalId check
│   │   └─ Prevent unauthorized access & excessive queries
│   │
│   └── README.md
│       └── Instructions for deploying Cloud Functions
│
└── PLAN.md, ACTIVITY_LOG.md, CODEBASE.md (Documentation)
```

---

## Key Modules

### 1. **services/firebaseConfig.ts** - Firebase Initialization

```typescript
/**
 * Firebase Configuration & Initialization
 * 
 * This module initializes the Firebase App, Auth, Firestore, and Cloud Messaging.
 * All Firebase instances are exported for use throughout the app.
 * 
 * Environment Variables Required:
 * - EXPO_PUBLIC_FIREBASE_API_KEY
 * - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - EXPO_PUBLIC_FIREBASE_PROJECT_ID
 * - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
 * - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - EXPO_PUBLIC_FIREBASE_APP_ID
 * 
 * @example
 * import { auth, db, messaging } from '@/services/firebaseConfig';
 */
```

### 2. **store/authStore.ts** - Authentication State

```typescript
/**
 * Zustand Auth Store
 * 
 * Manages global authentication state with persistence.
 * - User profile data (name, email, ID)
 * - Authentication status (isAuthenticated, loading)
 * - Error state for UI feedback
 * 
 * State Flow:
 * 1. App starts → useEffect calls store.hydrate()
 * 2. hydrate() checks AsyncStorage for cached user
 * 3. If cached user exists → set state immediately (fast load)
 * 4. If no cache → check Firebase session
 * 5. If session exists → fetch full user profile
 * 6. Update AsyncStorage + Zustand state
 * 
 * @actions setUser, setLoading, setError, logout, hydrate
 */
```

### 3. **services/authService.ts** - Authentication Logic

```typescript
/**
 * Authentication Service
 * 
 * Handles user registration, login, and session management.
 * Integrates with Firebase Auth.
 * 
 * Key Functions:
 * - signup(email, password) - Email/password registration
 * - login(email, password) - Email/password login
 * - loginWithGoogle() - Google OAuth flow
 * - logout() - Clear session
 * - getCurrentUser() - Get authenticated user from Firebase
 * 
 * Error Handling:
 * - Firebase Auth errors mapped to user-friendly messages
 * - Network errors trigger retry logic
 * - Invalid credentials return specific error codes
 * 
 * @example
 * const { user, error } = await authService.signup(email, password);
 */
```

### 4. **store/journalStore.ts** - Journals & Entries State

```typescript
/**
 * Zustand Journal Store
 * 
 * Manages journals, entries, and selected journal state.
 * Syncs in real-time with Firestore.
 * 
 * Data Structure:
 * - journals: Journal[] (all user's journals)
 * - entries: Entry[] (all entries for selected journal + date)
 * - selectedJournal: Journal | null
 * - isLoading: boolean
 * 
 * Real-time Listeners:
 * - setUpJournalListener(userId) → subscribes to journals collection
 * - On change → automatically updates state
 * - setUpEntryListener(journalId) → subscribes to entries
 * 
 * @actions setJournals, addJournal, updateJournal, deleteJournal
 * @actions setEntries, addEntry, updateEntry, deleteEntry
 */
```

### 5. **services/entryService.ts** - Entry CRUD

```typescript
/**
 * Entry Service
 * 
 * Handles all entry-related Firestore operations.
 * - Save daily entries with field values
 * - Retrieve entries by date/journal
 * - Draft support (AsyncStorage)
 * 
 * Draft Behavior (Offline-First):
 * 1. User creates entry → auto-save draft to AsyncStorage every 10s
 * 2. If online → save to Firestore
 * 3. If offline → keep in AsyncStorage, show "pending sync" badge
 * 4. When online → auto-sync draft to Firestore
 * 5. After sync → remove draft from AsyncStorage
 * 
 * Validation:
 * - All required fields must be filled
 * - Field values must match field type
 * - Entry date cannot be in future
 * 
 * @example
 * const entry = await entryService.createEntry(journalId, {
 *   entryDate: '2026-05-07',
 *   fieldValues: { 'field1': 'value', 'field2': 4.5 }
 * });
 */
```

### 6. **components/FieldInput.tsx** - Dynamic Field Renderer

```typescript
/**
 * Dynamic Field Input Component
 * 
 * Renders the appropriate input component based on field type.
 * Handles all field type rendering in one component.
 * 
 * Supported Field Types:
 * - "text" → TextInput (multiline for notes)
 * - "date" → iOS DatePickerIOS (date only)
 * - "rating" → StarRating (1-5 stars, customizable)
 * - "multiChoice" → Picker (radio) or Checkbox (multi-select)
 * 
 * Props:
 * - field: JournalField (type, label, required, etc.)
 * - value: any (current value, can be string/number/array)
 * - onChange: (value) => void
 * 
 * Validation:
 * - Shows error message below input if invalid
 * - Prevents non-matching types
 * - Highlights required fields
 * 
 * @example
 * <FieldInput
 *   field={{ id: '1', label: 'Mood', type: 'rating', required: true }}
 *   value={formData.mood}
 *   onChange={(value) => setFormData({ ...formData, mood: value })}
 * />
 */
```

---

## Data Flow

### Entry Creation Flow

```
User Opens EntryLogScreen
  ↓
Load journal's fieldSchema from journalStore
  ↓
Render dynamic form (FieldInput components)
  ↓
User fills form → setState on each change
  ↓
Auto-save draft to AsyncStorage every 10s
  ↓
User taps Submit
  ↓
Validate all fields (required, type match)
  ↓
If invalid → show error toast, stay on screen
  ↓
If valid → Call entryService.createEntry(journalId, formData)
  ↓
entryService:
  1. Generate unique entry ID
  2. Create Firestore document at entries/{entryId}
  3. Include journalId, userId, entryDate, fieldValues, createdAt
  ↓
Firebase:
  1. Apply security rules (check userId, check journalId ownership)
  2. If valid → save to database
  3. If invalid → throw permission error
  ↓
App receives response
  ↓
If success:
  1. Update journalStore (addEntry)
  2. Clear draft from AsyncStorage
  3. Show success toast
  4. Navigate back to JournalDetailScreen
  ↓
If error:
  1. Show error toast with retry
  2. Keep draft in AsyncStorage
  3. Log error to Sentry
```

### Authentication Flow

```
User Taps Sign Up
  ↓
SignUpScreen:
  1. Input: email, password, password confirmation
  2. Validate email format + password strength
  ↓
User taps "Create Account"
  ↓
Call authService.signup(email, password)
  ↓
authService:
  1. Call Firebase Auth createUserWithEmailAndPassword()
  2. Get UID from Firebase Auth response
  ↓
If success:
  1. Create user document in Firestore users/{UID}
  2. Set name, email, timezone, reminder settings
  3. Call authStore.setUser(userProfile)
  4. Save user to AsyncStorage (encrypted)
  5. Navigate to ProfileSetupScreen
  ↓
ProfileSetupScreen:
  1. User enters name, timezone, reminder time
  2. Save to Firestore users/{UID}
  ↓
If everything complete:
  1. Navigate to RootNavigator (shows AppStack)
  2. Load JournalListScreen
  ↓
If error:
  1. Show error toast (email already exists, weak password, etc.)
  2. Stay on SignUpScreen
```

### Reminder Notification Flow

```
User sets reminder time (e.g., 9:00 AM IST)
  ↓
App saves to:
  1. Firestore: users/{userId}.reminderTime
  2. Zustand: notificationStore.reminderTime
  3. Schedule local iOS notification for 9:00 AM
  ↓
Every day at 9:00 AM:
  1. iOS triggers local notification
  2. App receives notification (foreground + background)
  3. Show notification alert (even if app closed)
  ↓
Simultaneously, Cloud Function runs:
  1. Check all users' reminderTime vs current UTC time
  2. For matching users, send FCM message
  3. FCM delivered to device via Firebase Cloud Messaging
  ↓
If user taps notification:
  1. App opens (or comes to foreground)
  2. Notification handler triggered
  3. Navigate to EntryLogScreen (for today's date)
  ↓
If user ignores notification:
  1. Local notification dismissed after 10s
  2. FCM message persists in notification center
```

---

## Firebase Integration

### Authentication Configuration

```typescript
// Firebase Auth supports:
// 1. Email/Password (native Firebase)
// 2. Google OAuth (requires Firebase Google provider setup)
// 3. Apple Sign-In (Phase 2)

// Flow:
authService.signup(email, password)
  → Firebase Auth createUserWithEmailAndPassword()
  → Returns UID + idToken
  → Save idToken to Expo SecureStore
  → Create user document in Firestore
```

### Firestore Collections

```
Firestore Rules (Security):
- /users/{userId}
  ├─ Only userId can read/write own document
  ├─ Prevent other users from seeing emails/tokens
  └─ Auto-delete on Auth User deletion

- /journals/{journalId}
  ├─ userId field must match authenticated user
  ├─ Only owner can read/write
  └─ Prevent non-owner field edits

- /entries/{entryId}
  ├─ userId field must match authenticated user
  ├─ journalId must exist (referential integrity)
  └─ Only owner can read/write/delete
```

### Cloud Functions

```typescript
// 1. Reminder Scheduler (runs every hour)
exports.scheduleDailyReminders = functions
  .pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = new Date();
    const currentUTCHour = now.getUTCHours();
    
    // Query users where reminderTime hour matches
    // For each user, get FCM token
    // Send FCM message: "Time to journal!"
  });

// 2. User Cleanup (on Auth user delete)
exports.deleteUserData = functions.auth
  .user()
  .onDelete(async (user) => {
    // Delete users/{uid}
    // Delete all journals where userId = uid
    // Delete all entries where userId = uid
  });
```

---

## State Management

### Zustand Architecture

```typescript
// Each store is independent and focused
// No global state tree; each slice manages its own concerns

authStore:
  - User profile (name, email, ID)
  - Authentication status
  - Error messages

journalStore:
  - List of journals
  - Selected journal
  - Entries for selected journal
  - Loading state

notificationStore:
  - Reminder time preference
  - Reminder enabled/disabled
  - FCM device token
  - Last notification received

// Stores do NOT depend on each other
// Services handle inter-store communication if needed
```

---

## Navigation

### Navigation Structure

```
RootNavigator (checks isAuthenticated)
  ├─ AuthStack (if not authenticated)
  │   ├─ SignUpScreen
  │   ├─ LoginScreen
  │   └─ ProfileSetupScreen
  │
  └─ AppStack (if authenticated)
      └─ JournalNavigator (bottom tabs)
          ├─ Tab: Journals (JournalStack)
          │   ├─ JournalListScreen
          │   ├─ JournalDetailScreen
          │   ├─ NewJournalScreen
          │   ├─ EntryLogScreen
          │   └─ EntryHistoryScreen
          │
          └─ Tab: Settings (SettingsStack)
              ├─ ProfileScreen
              └─ ReminderSettingsScreen
```

### Deep Linking

```
When user taps notification (reminder):
  1. Firebase route handler receives notification
  2. Extract journal ID from notification payload
  3. Call RootNavigator.navigate('Journal', {
       screen: 'EntryLogScreen',
       params: { journalId }
     })
  4. User lands directly on entry form for that journal
```

---

## Component System

### Design Principles

1. **Reusability** - Components used in multiple screens
2. **Composition** - Build complex screens from simpler components
3. **Accessibility** - Proper labels, touch targets, contrast
4. **Performance** - Memoization, lazy loading where appropriate
5. **Type Safety** - Full TypeScript coverage (no `any`)

### Component Hierarchy

```
Screen Components (top-level)
  ├─ StackNavigator layout
  ├─ SafeAreaView wrapper
  └─ Screen-specific logic
      └─ Presentational Components
          ├─ Button
          ├─ TextInput
          ├─ FieldInput (smart component)
          ├─ JournalCard
          ├─ Toast
          └─ Custom components
```

---

## Testing Guide

### Unit Tests

```
services/authService.test.ts
  - signup() with valid/invalid email & password
  - login() with existing/non-existing user
  - getCurrentUser() returns correct user

services/journalService.test.ts
  - createJournal() saves to Firestore
  - updateJournal() applies changes
  - deleteJournal() removes document

utils/validation.test.ts
  - isValidEmail() accepts valid emails
  - isStrongPassword() rejects weak passwords
  - validateEntryForm() catches missing required fields
```

### Integration Tests

```
flows/authFlow.test.ts
  - User signs up → sees profile setup → navigates to journals

flows/entryFlow.test.ts
  - Create journal → log entry → see entry in history

flows/notificationFlow.test.ts
  - Set reminder → receive notification → navigate to journal
```

### Manual Testing Checklist

See ACTIVITY_LOG.md "Manual Testing Checklist" section.

---

## Deployment

### Release Process

1. **Staging Release**
   - Build EAS TestFlight app
   - Distribute to testers
   - Collect feedback (1 week)

2. **Production Release**
   - Build EAS production app
   - Submit to App Store (review 1-2 days)
   - Monitor Crashlytics + analytics

3. **Post-Release**
   - Monitor error rates, crash reports
   - Respond to user feedback
   - Plan Phase 2 features

### Environment Configuration

```
.env.local (development)
  EXPO_PUBLIC_FIREBASE_API_KEY=...
  EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
  NODE_ENV=development

.env.staging (TestFlight)
  EXPO_PUBLIC_FIREBASE_API_KEY=...
  EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
  NODE_ENV=staging

.env.production (App Store)
  EXPO_PUBLIC_FIREBASE_API_KEY=...
  EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
  NODE_ENV=production
```

---

## Updating This Document

**When to update:**
- After completing any major feature (Phase 1B, 1C, etc.)
- After adding new services or stores
- After refactoring significant modules
- When architecture changes

**Update checklist:**
- [ ] Update directory structure if new files added
- [ ] Update key modules section with new services
- [ ] Update data flow diagrams if flow changed
- [ ] Add examples to module documentation
- [ ] Review for clarity and accuracy

---

**Last Updated:** May 7, 2026  
**Maintainer:** Engineering Team  
**Next Review:** After Phase 1A completion
