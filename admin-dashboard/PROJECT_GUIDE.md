# SinoTicket Admin Dashboard Guide

This document describes the architecture, setup, and technology choices for the SinoTicket Admin Web Portal.

## 1. Project Overview

The Admin Dashboard is a sophisticated web portal intended for SinoTicket administrators to manage the core entities of the platform: Events, Venues, Sections, Seats, and Users.

**Relationship to Backend:**
It talks to the Convex backend in `/convex` (URL in `VITE_CONVEX_URL`). Operations modifying data are checked by `requireAdmin` on the backend, so they require a signed-in Clerk user with the Admin role.

## 2. Tech Stack

*   **Framework**: React (Vite) for fast local development and HMR.
*   **Routing**: `react-router-dom` for client-side navigation.
*   **Styling**: TailwindCSS for utility-first styling to maintain a modern, premium look.
*   **Data Fetching**: Convex client (`src/lib/api.ts`): `call(convex.query(api.x.y, args))` returns `{ success, ...data }` or `{ success: false, message }`.
*   **Icons**: `lucide-react` for scalable, crisp iconography.

## 3. Directory Structure

```text
admin-dashboard/
├── index.html           # Vite entry point
├── package.json
├── src/
│   ├── main.tsx         # Providers: Theme, Clerk, ConvexProviderWithClerk
│   ├── App.tsx          # Routing + admin gate (syncs the user, waits for the Admin role)
│   ├── index.css        # Global styles & layout variables
│   ├── components/      # Layout, auth visuals, UI primitives
│   ├── pages/           # Dashboard, Events, Venues, Sections, Seats, Tickets, Users, Settings
│   ├── i18n/            # English / French strings
│   └── lib/
│       ├── api.ts       # Convex client, `api` references, `call()` helper
│       └── utils.ts
└── ...
```

## 4. Setup & Running Locally

The dashboard talks to the Convex backend in `/convex`; there is no separate server to start. Make sure `npx convex dev` is running at the repo root (or that the deployment is already up).

### Environment Requirements
You need Node.js `v18+` installed.

Create `admin-dashboard/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud   # same value as EXPO_PUBLIC_CONVEX_URL in the root .env.local
```

On Vercel, add the same two variables in the project settings.

### Commands

**1. Install Dependencies**
```bash
cd admin-dashboard
npm install
```

**2. Start the Development Server**
```bash
npm run dev
```
The dashboard typically opens on `http://localhost:5173`.

### Who can sign in
Only Clerk users whose `publicMetadata.role` is `Admin`. The dashboard waits until Convex confirms the role before showing any page.

## 5. Data Access Pattern

```ts
import { api, call, convex } from "../lib/api";

const data = await call(convex.query(api.venues.list, {}));
if (data.success) setVenues(data.venues);

const saved = await call(convex.mutation(api.venues.add, { name, location, capacity }));
if (!saved.success) setError(saved.message);
```

Event images: `files.generateUploadUrl` → `POST` the file to that URL → `files.getUrl` returns the public image URL. The full list of backend functions is in [ARCHITECTURE.md §5.3](../ARCHITECTURE.md#53-functions).
