# DailyLog - iOS Journal App

A React Native journal application built with Expo and Firebase. Users can create multiple journals with customizable fields, log daily entries, and receive configurable reminders.

## Project Status (May 9, 2026)

- Phase 1A: Mostly complete
- Phase 1B: Implemented in code
- Phase 1C+: Not functionally complete yet
- Quality Gate: `lint` and `type-check` currently failing

## Project Structure

```
journal-app/
├── src/
│   ├── screens/
│   ├── components/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── config/
│   └── App.tsx
├── assets/
├── package.json
├── app.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
├── jest.config.js
└── README.md
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS development environment (Xcode)
- Firebase project

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY="your_api_key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
EXPO_PUBLIC_FIREBASE_APP_ID="your_app_id"
```

Optional:
- `.env.staging`
- `.env.production`

### 3. Start Development Server

```bash
npm start
```

## Available Scripts

- `npm start`
- `npm run ios`
- `npm run android`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run type-check`
- `npm test`

## Tech Stack

- React Native + Expo
- TypeScript
- Zustand
- React Navigation
- Firebase (Auth, Firestore, Notifications)
- Jest + React Native Testing Library

## Near-Term Priorities

1. Fix TypeScript path aliases/imports.
2. Fix ESLint configuration so lint runs cleanly.
3. Complete NativeWind typing/setup for `className`.
4. Implement functional Journal list/create flows (Phase 1C).

## License

MIT
