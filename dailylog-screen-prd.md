# DailyLog — Screen-by-Screen PRD

This product requirements document translates the current DailyLog roadmap into a developer-ready screen specification set covering the signed-in MVP flow, Phase 1E reminder work, and immediate Phase 1F polish preparation. The visual direction follows a minimalist, premium, restrained product UI approach that aligns with the user’s stated preference for sophisticated, Apple-like polish and code-first implementation workflow. [cite:2][cite:3]

## Product intent

DailyLog is a calm journaling app for iOS that lets a user create structured journals, log entries daily, review history, maintain streaks, and receive reminders. The product should feel emotionally safe and quiet, with habit motivation present but secondary to reflection. [code_file:2]

## Information architecture

### Primary navigation

- Bottom tab 1: Journals.
- Bottom tab 2: Settings.
- Journals stack: My Journals, New Journal, Journal Detail, Log Entry, Entry History.
- Settings stack: Profile, Reminder Settings.
- Notification tap path: resolves into Journal Detail or Log Entry depending on payload completeness. [code_file:2]

### Global UX rules

- One primary CTA per screen.
- Use inline status for save, sync, error, permission, and draft states.
- Use sheets for field creation, date selection, archive/delete confirmation, and destructive actions.
- Avoid loud gamification; streaks should motivate without dominating the interface. [code_file:2]

## Design system

### Core tokens

| Token area | Spec |
|---|---|
| Display font | Instrument Serif for hero moments and large summary statements. [code_file:2] |
| Body font | Inter for all UI labels, body text, buttons, inputs, and metadata. [code_file:2] |
| Accent | Calm teal as the only primary action color. [code_file:2] |
| Surfaces | Warm off-white layered cards with slightly darker secondary surfaces. [code_file:2] |
| Radius | 12, 18, 24, and 32px hierarchy by component size. [code_file:2] |
| Shadows | Soft layered elevation, never harsh floating-glass or neon effects. [code_file:2] |

### Component primitives

- `PrimaryButton`: filled teal CTA, 14px semibold label, 18px radius.
- `SecondaryButton`: quiet filled neutral action.
- `GhostButton`: low-emphasis tertiary action.
- `FieldInput`: label, helper/error slot, input container, and optional accessory icon.
- `JournalCard`: icon, title, description, metadata chips, optional due state.
- `InlineBanner`: draft saved, permission issue, error, or route context banner.
- `MetricPill`: compact metric like streak, entries, or best streak.
- `SegmentedControl`: Active / Archived, All / This Week / Streak. [code_file:2]

## Screen specifications

### 1. My Journals

**Purpose**

Acts as the signed-in home screen and should orient the user around today’s journaling state, active journals, and recent activity. [code_file:2]

**Primary user goal**

Quickly decide what to log today and enter the relevant journal in one tap. [code_file:2]

**Key content**

- Top app bar with title, search or utility icon, and add-journal action.
- Today hero card showing due journals and streak state.
- Segmented control for Active vs Archived journals.
- Journal list with title, description, field count, reminder time, and draft status.
- Recent activity summary. [code_file:2]

**Primary CTA**

- Add journal via top-right plus button, or tap a journal card to enter detail. [code_file:2]

**Secondary actions**

- Switch Active/Archived.
- Search journals.
- Pull to refresh. [code_file:2]

**States**

- Empty state: “Create your first journal” with illustration and primary CTA.
- Loaded state: default list with today card.
- Archived state: segmented control switched with archived cards only.
- Error state: inline retry banner above list.
- Loading state: skeleton hero card and skeleton journal rows. [code_file:2]

**Data requirements**

- `journals[]`
- active/archived status
- latest entry timestamp
- streak summary per visible journal where available
- draft existence per journal [code_file:2]

**Engineering notes**

- Optimize with `FlatList`.
- Journal card should be extracted as a reusable component in Phase 1F.
- Keep row touch targets at least 44px high. [cite:1][code_file:2]

### 2. New Journal

**Purpose**

Allows the user to create a new journal with custom field schema. [code_file:2]

**Primary user goal**

Define a structured journal without feeling overwhelmed by configuration. [code_file:2]

**Key content**

- Journal name input.
- Description input.
- Field builder list.
- Add field action.
- Save draft and Create actions. [code_file:2]

**Primary CTA**

- Create. [code_file:2]

**Secondary actions**

- Save Draft.
- Add field.
- Edit or remove a field row. [code_file:2]

**Interaction model**

- Field creation opens a bottom sheet.
- Sheet includes type chooser, field label, helper text, required toggle, and type-specific settings.
- Multi-choice field includes option list builder with add/remove affordance. [code_file:2]

**Validation**

- Journal name required.
- At least one field required.
- Multi-choice must contain at least one option.
- Field labels must be unique within a journal. [code_file:2]

**States**

- Blank state.
- Draft restored state.
- Validation error state.
- Successful creation state routes to Journal Detail with success banner. [code_file:2]

**Engineering notes**

- Strong candidate for local reducer or Zustand slice scoped to create flow.
- Sheet pattern should be reused later for edit field and destructive confirmation. [code_file:2]

### 3. Journal Detail

**Purpose**

Serves as the control center for one journal. [code_file:2]

**Primary user goal**

Understand journal status and move to logging or history quickly. [code_file:2]

**Key content**

- Journal summary hero with streak and last entry time.
- Primary CTA to log today.
- Secondary CTA to view history.
- Schema list showing fields and types.
- Reminder summary.
- Overflow action menu for archive/delete. [code_file:2]

**Primary CTA**

- Log Today. [code_file:2]

**Secondary actions**

- History.
- Edit journal metadata or schema in later phase.
- Archive / delete in overflow menu. [code_file:2]

**States**

- Default state.
- No entries yet state with “Log first entry.”
- Archived journal state with muted editing and restore/archive messaging if supported later.
- Deleted confirmation via action sheet. [code_file:2]

**Data requirements**

- journal metadata
- entry count
- last entry timestamp
- reminder enabled/time
- streak count
- field schema [code_file:2]

### 4. Log Entry

**Purpose**

Allows the user to fill a dynamically generated form for the selected journal. [code_file:2]

**Primary user goal**

Complete a journal entry quickly and with confidence that progress is not lost. [code_file:2]

**Key content**

- Dynamic field renderer.
- Inline draft autosave banner.
- Save Entry CTA.
- Cancel tertiary action. [code_file:2]

**Field support**

- Text.
- Date.
- Rating.
- Multi-choice. [code_file:2]

**Interaction rules**

- Autosave after 1 second debounce.
- Banner text updates with last saved timestamp.
- Validation occurs on submit and optionally per-field on blur. [code_file:2]

**States**

- Blank first-entry state.
- Draft restored state.
- Validation error state with inline errors under field.
- Save success state routes back to Journal Detail or History based on product decision.
- Offline or sync-delayed state if Firestore write fails. [code_file:2]

**Engineering notes**

- Extract per-type controls behind a common `FieldInputRenderer` wrapper.
- Reserve layout space for error text to reduce jumpiness.
- Input sizes should remain 16px+ for comfortable mobile use and to avoid awkward mobile zoom patterns in web-based previews. [cite:1][code_file:2]

### 5. Entry History

**Purpose**

Displays prior journal entries in a scanable chronological view. [code_file:2]

**Primary user goal**

Review previous entries, spot patterns, and open entry details. [code_file:2]

**Key content**

- Filter segmented control.
- Streak summary card.
- Entry rows with date, key labels, rating/theme preview, and preview snippet.
- Detail view entry point. [code_file:2]

**Primary CTA**

- Tap an entry row to view details. [code_file:2]

**Secondary actions**

- Filter by time window.
- Search in future phase.
- Share/export in future phase. [code_file:2]

**States**

- Populated chronology.
- No entries state.
- Filter returns zero results state.
- Loading skeleton list.
- Pagination or infinite-scroll state if history grows. [code_file:2]

**Engineering notes**

- Keep row summaries concise; do not render full rich content in list.
- Entry detail should show field labels explicitly rather than raw stored values. [code_file:2]

### 6. Profile

**Purpose**

Lets the user manage identity metadata and account actions. [code_file:2]

**Primary user goal**

Update personal details and access reminder settings safely. [code_file:2]

**Key content**

- Read-only email.
- Editable display name.
- Editable timezone.
- Save Changes CTA.
- Reminder settings row.
- Log out row.
- Delete account row marked as future/server-dependent. [code_file:2]

**Primary CTA**

- Save Changes. [code_file:2]

**Secondary actions**

- Navigate to Reminder Settings.
- Log out after confirmation.
- Delete account placeholder and explanation. [code_file:2]

**States**

- Clean loaded state.
- Dirty form state.
- Saving state with disabled button.
- Save success toast/banner.
- Error state with inline guidance. [code_file:2]

### 7. Reminder Settings

**Purpose**

Configure daily reminder time, enablement, and delivery expectations. [code_file:2]

**Primary user goal**

Set up a reminder they trust and understand. [code_file:2]

**Key content**

- Enable/disable control.
- Reminder time display and picker entry point.
- Next expected reminder time.
- Test notification action.
- Permission explanation state.
- Save CTA. [code_file:2]

**Primary CTA**

- Save. [code_file:2]

**Secondary actions**

- Send Test Notification.
- Edit time.
- Open system settings when permissions are denied. [code_file:2]

**States**

- Enabled state.
- Disabled state.
- Permission denied state.
- Schedule changed state.
- Test notification sent state.
- Local-only vs FCM-backed explanation state if architecture evolves. [code_file:2]

**Engineering notes**

- Surface whether reminder is currently scheduled.
- On save, cancel old scheduled notification before scheduling new one.
- Show plain-language confirmation like “Daily reminder set for 7:30 PM.” [code_file:2]

### 8. Notification Arrival / Deep Link

**Purpose**

Ensures tapping a reminder notification lands the user in the correct context. [code_file:2]

**Primary user goal**

Resume journaling from the notification without confusion. [code_file:2]

**Expected flow**

1. User taps notification.
2. App enters signed-in shell.
3. Pending route is stored until navigation is ready.
4. App navigates to Journal Detail or Log Entry.
5. Arrival banner clarifies why the user landed there. [code_file:2]

**Required arrival UI**

- Inline banner such as “Opened from reminder for Gratitude.”
- Primary CTA immediately visible, ideally Log Today. [code_file:2]

**States**

- Warm app backgrounded.
- Cold start.
- Missing journal ID fallback routes to My Journals with generic reminder banner.
- Journal archived or unavailable fallback with graceful message. [code_file:2]

### 9. Component / Handoff Screen

**Purpose**

Provides a visual development bridge between design intent and implementation. [code_file:2]

**Use in process**

- Reference for extracting shared components.
- Basis for Storybook or isolated preview screens.
- Guide for token file creation in `src/constants/colors.ts` and future theme context. [code_file:2]

## Cross-screen behavior

### Loading

- Use skeletons matching final structure.
- Avoid spinner-only first loads except for short blocking auth transitions. [cite:1][code_file:2]

### Error handling

- Inline field errors for form validation.
- Inline banners for screen-level failure.
- Action sheets for destructive confirmation. [code_file:2]

### Accessibility

- Every icon button must have `accessibilityLabel`.
- Touch targets should be at least 44x44.
- Text hierarchy should remain readable with Dynamic Type scaling in mind.
- Accent color cannot be the sole indicator of state; pair it with label or icon treatment. [cite:1][code_file:2]

### Dark mode

- Maintain same hierarchy and surfaces with lower-luminance neutrals.
- Do not invert emotional tone into a neon dark theme.
- Preserve card layering and clear separators. [code_file:2]

## Recommended implementation backlog

| Priority | Work item | Why now |
|---|---|---|
| P0 | Extract button, field wrapper, journal card, inline banner | Reduces repetition before Phase 1F expands polish. [code_file:2] |
| P0 | Define theme tokens in constants | Required for dark mode and consistency. [code_file:2] |
| P0 | Add accessibility labels and touch target audit | Already listed in Phase 1F and easiest before UI grows further. [code_file:2] |
| P1 | Build skeleton states for journals, detail, history | Improves production feel immediately. [code_file:2] |
| P1 | Implement notification arrival banner and deep-link fallback rules | Needed for Tasks 7–8 to feel complete. [code_file:2] |
| P2 | Create Storybook-style preview screen or internal design gallery | Speeds future feature additions and regression review. [code_file:2] |

## Acceptance criteria summary

A screen is ready for implementation when it has a clear purpose, one dominant CTA, defined loading/error/empty states, component mapping, and data dependencies. A flow is ready for QA when transitions between My Journals, Journal Detail, Log Entry, Entry History, Profile, Reminder Settings, and notification-driven arrival states are explicit and testable. [code_file:2]
