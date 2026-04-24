# Neon Curator - AI Agent Instructions

## Project Overview
Neon Curator is an Ionic/Vue.js app for managing manga/anime/novel collections with user tracking, discovery, and mobile support via Capacitor.

## Build & Test Commands
- `npm run dev`: Start dev server (Vite, port 5173)
- `npm run build`: Production build with type-check
- `npm run test:unit`: Run Vitest unit tests
- `npm run test:e2e`: Run Cypress E2E tests
- `npm run lint`: ESLint check
- `npm run format`: Prettier format

## Architecture Decisions
- **Framework**: Vue 3.3 + TypeScript, Ionic Vue 8.0
- **State**: Reactive stores (auth in localStorage)
- **Services**: Stateless objects with async methods returning typed responses
- **Routing**: @ionic/vue-router with `requiresAuth` meta guard
- **Styling**: Tailwind CSS with custom neon theme variables
- **Mobile**: Capacitor for Android deployment

## Key Conventions
- Use Options API (`defineComponent()`) over Composition API
- Services export objects with methods, not classes
- API responses auto-unwrapped by interceptor (access `.data` directly)
- Status enums always paired with LABELS and COLORS maps for UI
- 4 spaces indentation, single quotes, semicolons, trailing commas
- Environment variables: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`

## Common Pitfalls
- Token storage in localStorage is vulnerable to XSS
- 401 errors cause hard redirects, losing form state
- No error boundaries; component errors can crash the app
- Minimal test coverage; focus on adding tests for new features
- Android builds require Android Studio + SDK + Java 17

## Key Files/Directories
- `src/services/`: API integration patterns
- `src/store/`: State management examples
- `src/components/`: Reusable UI components
- `src/views/`: Page components with data fetching
- `android/`: Capacitor Android build configuration

## Development Setup
1. `npm install`
2. Create `.env` with required variables
3. `npm run dev` for development
4. Test Google OAuth login
5. For Android: Install Android Studio and build via Capacitor

## Links to Documentation
- [API Schema](docs/api.md) (create if missing)
- [Architecture Guide](ARCHITECTURE.md) (create if missing)
- [Contributing Guidelines](CONTRIBUTING.md) (create if missing)