const en = {
  dashboard: {
    loading: "Aggregating live data...",
    overview: "Dashboard Overview",
    welcomeMessage: "Welcome back! Here is what's happening with SinoTicket today.",
    stats: {
      totalRevenue: "Total Revenue",
      revenueDesc: "Total earnings historically",
      ticketsSold: "Tickets Sold",
      ticketsDesc: "Active tickets issued",
      activeUsers: "Active Users",
      usersDesc: "Registered profiles",
      totalEvents: "Total Events",
      eventsDesc: "Events orchestrated",
    },
    chart: {
      title: "Recent Trajectory",
      subtitle: "Estimated ticket demand over trailing 6 months.",
    },
    latestEvents: "Latest Events",
    viewAll: "View All",
    noEvents: "No events created yet.",
  },
  admin: {
    nav: {
      dashboard: "Dashboard",
      events: "Events",
      venues: "Venues",
      sections: "Sections",
      seats: "Seats",
      tickets: "Tickets",
      users: "Users",
      system: "System",
      settings: "Settings",
    },
    theme: {
      lightMode: "Switch to Light Mode",
      darkMode: "Switch to Dark Mode",
    },
    defaultUser: "Admin",
    portalTitle: "Admin Portal",
    signOut: "Log Out",
  },
  auth: {
    verifyingAccess: "Verifying Access...",
    accessDenied: "Access Denied",
    yourAccount: "Your account",
    noPrivileges: "does not have Administrator privileges.",
    redirectingToLogin: "Redirecting to login...",
    signOutNow: "Sign out now",
  },
  app: {
    comingSoon: "Coming Soon",
  },
} as const;

export default en;
