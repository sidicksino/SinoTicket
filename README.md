# 🎟️ SinoTicket

**SinoTicket** is a cross-platform mobile ticketing app for events in Chad (and beyond). Users can browse events, pick seats, check out, and hold a digital ticket with a QR code — right from their phone.

This repo is a monorepo with three parts:

| Layer | Directory | Tech |
|---|---|---|
| Mobile App | `/` (root) | Expo / React Native / Expo Router |
| REST API | [`/backend`](backend) | Node.js / Express / MongoDB |
| Admin Dashboard | [`/admin-dashboard`](admin-dashboard) | React / Vite |

> For a deep dive into the architecture, data models, API routes, and conventions, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Features

- Browse and search events by title, date, and category
- Event details with rich media, description, and venue info
- Seat map selection and ticket category picker
- Checkout flow with temporary seat holds (TTL-backed reservations)
- Digital ticket wallet with QR code
- Push notifications and in-app notification inbox
- Google OAuth / email sign-in via Clerk
- Dark/light theme, English/French localization

## Getting started (Mobile App)

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables — create a `.env` file in the project root:

   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   EXPO_PUBLIC_API_URL=http://192.168.x.x:5001
   ```

   > `EXPO_PUBLIC_API_URL` must be your dev machine's **LAN IP** (not `localhost`) when testing on a physical device.

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Getting started (Backend API)

```bash
cd backend
npm install
```

Create a `backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_test_...
```

```bash
npm run dev
```

The API listens on `0.0.0.0:PORT` and serves Swagger docs at `/api-docs`. See [backend/DEPLOY_RENDER.md](backend/DEPLOY_RENDER.md) for deployment notes.

## Getting started (Admin Dashboard)

```bash
cd admin-dashboard
npm install
npm run dev
```

## Project structure

```
SinoTicket/
├── app/                # Expo Router screens (file-based routing)
├── components/         # Shared UI components
├── constants/          # Theme color tokens, etc.
├── context/            # ThemeContext and other React contexts
├── hooks/              # Custom hooks (auth, notifications, ...)
├── lib/                # fetch utilities, Clerk token cache
├── i18n/ languages/     # Localization (en/fr)
├── backend/            # Express + MongoDB REST API
└── admin-dashboard/    # React/Vite admin panel
```

## Learn more

- [ARCHITECTURE.md](ARCHITECTURE.md) — full architecture, data models, API reference, and conventions
- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
