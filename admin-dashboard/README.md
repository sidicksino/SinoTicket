# SinoTicket Admin Dashboard

Web portal for SinoTicket administrators: events, venues, sections, seats, tickets and users. Built with React + Vite, signs in with Clerk and reads/writes data through the Convex backend in [`/convex`](../convex).

## Run it

```bash
cd admin-dashboard
npm install
npm run dev
```

Needs `admin-dashboard/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud
```

Only users with the Clerk role `Admin` can get past the login screen.

See [PROJECT_GUIDE.md](PROJECT_GUIDE.md) for structure and conventions.
