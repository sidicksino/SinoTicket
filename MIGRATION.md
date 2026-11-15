# Backend migration: Express/MongoDB on Render → Convex

**Date:** November 2026
**Branch:** `convex-migration`

## Why

The old backend was an Express REST API with MongoDB, hosted on Render's free plan. A free Render service shuts down after about 15 minutes without traffic, so the first request after a quiet period waited 30–60 seconds while it started again. The goal was to stay on a free plan without that delay.

Convex was chosen because:

- **No startup delay.** There is no server of ours to sleep.
- **Safe seat booking.** Every mutation is a serializable transaction, so two people can't hold or buy the same seat. The old code needed hand-written MongoDB transactions for this.
- **Expiring holds.** A seat hold schedules its own release after 15 minutes.
- **Live data.** Seat maps, the ticket wallet and the notification badge update by themselves.
- **Clerk support.** Clerk has an official Convex integration, so sign-in didn't change.
- **Built-in file storage.** It replaces Cloudinary for event images.

## What changed

| Area | Before | After |
|---|---|---|
| Backend code | `backend/` (Express, 9 controllers, 8 Mongoose models) | `convex/` (schema + query/mutation/action functions) |
| Database | MongoDB Atlas | Convex database |
| Hosting | Render free web service | Convex (cloud deployment) |
| Auth | Clerk JWT checked by Express middleware | Clerk JWT verified by Convex (`convex/auth.config.ts`) |
| Admin check | Clerk API call on every request | Clerk role copied to `users.role` on sign-in (`users.store` → `users.syncRoleFromClerk`) |
| Image upload | Multer + Cloudinary | Convex file storage (`files.ts`) |
| Seat hold expiry | MongoDB TTL index + checks at read time | Scheduled `reservations.expire` |
| Past events | Set to "Ended" during each events request | Hourly cron (`crons.ts`) |
| Push notifications | `expo-server-sdk` | Direct call to Expo's push API from an action (`push.ts`) |
| Mobile data layer | `lib/fetch.ts` (`useFetch`, `useAuthFetch`) | `lib/convex.ts` (`useLiveQuery`, `useApiMutation`) |
| Dashboard data layer | `fetch` + `VITE_API_URL` | Convex client + `VITE_CONVEX_URL` (`src/lib/api.ts`) |
| User creation | Apps POST to `/api/users` after sign-up | `components/UserSync.tsx` calls `users.store` once the session reaches Convex |

**Removed:** `backend/`, `render.yaml`, `lib/fetch.ts`, `admin-dashboard/src/hooks/useApi.ts`, and the `EXPO_PUBLIC_API_URL` / `VITE_API_URL` variables.

## Behaviour changes

- **Scanning a ticket is admin-only.** The old `/api/tickets/verify/:qr` URL was public, so anyone opening a QR link marked the ticket as used. Ticket QR codes now hold only the ticket code, and `tickets.verify` requires an admin.
- **No public "make me admin" route.** The old `GET /api/users/make-me-admin` let any signed-in user become admin. Admin now comes only from the Clerk role.
- **Payments record the real price.** Checkout still simulates payment, but stores the ticket category's price instead of 0. The sold count goes up on the category linked to the seat's section, not always the first category.
- **The dashboard uses real numbers.** Revenue, the six-month sales chart and "sold %" come from real payments and tickets instead of random values.
- **Profile photos are stored in Clerk.** The app uploads the photo to Clerk and Convex keeps only the URL. Before, base64 images were stored in the database.
- **The admin events page shows past events too.** Before, it only showed the next 10 upcoming events.
- **Sections and seats keep the venue-owner rule.** Only the admin who owns a venue can change its sections and seats, as before.

## How it was checked

- Convex functions were tested with two fake users:
  - A seat held or sold by one user can't be reserved by the other.
  - Nobody can check out someone else's reservation, and a reservation can't be checked out twice.
  - Ticket scanning and dashboard stats reject non-admins.
  - A scanned ticket reads "Already used" the second time.
- Mobile app: `npx tsc --noEmit` and `npx expo lint` pass. Admin dashboard: `vite build` passes.
- In the iOS simulator, against the cloud dev deployment:
  - Sign-in with Clerk created the Convex user, and the Admin role came through.
  - Booking worked end to end: event page, seat map, seat hold, simulated Mobile Money checkout, confirmation, then the ticket in the wallet with a notification.

**Not yet checked:** the admin dashboard in a browser, the in-app scanner, push notifications on a physical device, and Google sign-in.

## Data

No data was copied from MongoDB; it held test data only. `npx convex run seed:run` recreates the demo venues, sections, seats and events, with dates in the future.

## Still to do

- [ ] Add `VITE_CONVEX_URL` to `admin-dashboard/.env` and test the dashboard.
- [ ] Deploy to production with `npx convex deploy`, then connect production Clerk to it (see README → Going to production).
- [ ] Set `EXPO_PUBLIC_CONVEX_URL` in EAS and `VITE_CONVEX_URL` in Vercel.
- [ ] Delete the Render service and the MongoDB Atlas database.
- [ ] Delete the old `backend/.env` from your machine once you no longer need the secrets in it. It is not in git.
- [ ] Optional: connect a real payment provider (Mobile Money / card) in `tickets.checkout`.
- [ ] Optional: the share button now sends a `sinoticket://event/<id>` link (the old one pointed at the API server); add a web landing page if people without the app should be able to open it.
