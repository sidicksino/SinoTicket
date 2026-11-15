# 🎟️ SinoTicket

**SinoTicket** is a cross-platform mobile ticketing app for events in Chad (and beyond). Users can browse events, pick seats, check out, and hold a digital ticket with a QR code — right from their phone.

This repo is a monorepo with three parts:

| Layer | Directory | Tech |
|---|---|---|
| Mobile App | `/` (root) | Expo / React Native / Expo Router |
| Backend | [`/convex`](convex) | Convex (database, server functions, file storage) |
| Admin Dashboard | [`/admin-dashboard`](admin-dashboard) | React / Vite |

> For a deep dive into the architecture, data models, API routes, and conventions, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Features

- Browse and search events by title, date, and category
- Event details with rich media, description, and venue info
- Seat map selection and ticket category picker
- Live seat map and checkout flow with 15-minute seat holds
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
   ```

3. Start the backend (see [Backend](#getting-started-backend) below). It writes `EXPO_PUBLIC_CONVEX_URL` to `.env.local` for you.

4. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Getting started (Backend)

The backend runs on [Convex](https://convex.dev). There is no server to host.

```bash
npx convex dev
```

The first run asks you to log in and create a project, then keeps your functions in sync as you edit `convex/`. One-time setup:

1. In the Clerk dashboard, enable the **Convex** integration (or create a JWT template named `convex`) and copy the **Frontend API URL**.
2. Tell Convex about Clerk:

   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-app>.clerk.accounts.dev
   npx convex env set CLERK_SECRET_KEY sk_test_...
   ```

3. Optional demo data (3 venues, 9 sections, 360 seats, 5 events):

   ```bash
   npx convex run seed:run
   ```

Admins are users whose Clerk `publicMetadata.role` is `Admin`. Deploy to production with `npx convex deploy`.

## Getting started (Admin Dashboard)

Create `admin-dashboard/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud
```

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
├── lib/                # Convex client helpers, Clerk token cache
├── i18n/ languages/     # Localization (en/fr)
├── convex/             # Backend: schema + server functions
└── admin-dashboard/    # React/Vite admin panel
```

## Learn more

- [ARCHITECTURE.md](ARCHITECTURE.md) — full architecture, data models, API reference, and conventions
- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
