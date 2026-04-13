# SinoTicket Admin Dashboard Guide

This document describes the architecture, setup, and technology choices for the SinoTicket Admin Web Portal.

## 1. Project Overview

The Admin Dashboard is a sophisticated web portal intended for SinoTicket administrators to manage the core entities of the platform: Events, Venues, Sections, Seats, and Users.

**Relationship to Backend:**
It connects directly to the Node.js/Express backend running on port `5001`. Operations modifying data rely on the `checkAdmin` middleware on the backend and thus require a valid Admin Bearer token.

## 2. Tech Stack

*   **Framework**: React (Vite) for fast local development and HMR.
*   **Routing**: `react-router-dom` for client-side navigation.
*   **Styling**: TailwindCSS for utility-first styling to maintain a modern, premium look.
*   **Data Fetching**: Native `fetch` API wrapped in custom hooks, mirroring the mobile app's pattern.
*   **Icons**: `lucide-react` for scalable, crisp iconography.

## 3. Directory Structure

```text
admin-dashboard/
├── index.html           # Vite entry point
├── package.json
├── src/
│   ├── main.jsx         # React bootstrapping
│   ├── App.jsx          # Root component & Routing
│   ├── index.css        # Global styles & layout variables
│   ├── components/      # Reusable UI (Buttons, Modals, Sidebar)
│   ├── pages/           # High-level route views
│   │   ├── Dashboard/   # Analytics and overview
│   │   ├── Events/      # Event creation and management
│   │   ├── Venues/      # Venue management
│   │   └── Login/       # Admin authentication screen
│   ├── hooks/           # Custom data fetching hooks
│   └── lib/             # Utilities (API config, auth tokens, etc.)
└── ...
```

## 4. Setup & Running Locally

Because the dashboard runs alongside the mobile app and backend, ensure the backend (`localhost:5001`) is running first.

### Environment Requirements
You need Node.js `v18+` installed.

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

## 5. Implementation Roadmap (Next Steps)

1. **Scaffold Layout**: Build a persistent sidebar navigation system (Desktop first approach).
2. **Authentication**: Link Clerk React SDK (or manual Bearer token input) so the web app can authenticate API calls.
3. **Venues CRUD**: Implement Venues table and "Add Venue" modal.
4. **Events CRUD**: Implement complex Event creation form (including Ticket Categories and Sections).
5. **Analytics**: Hook up a main dashboard with static/dynamic charts of total revenue and ticket sales.
