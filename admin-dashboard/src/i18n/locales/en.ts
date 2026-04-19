const en = {
  dashboard: {
    loading: "Aggregating live data...",
    overview: "Dashboard Overview",
    welcomeMessage:
      "Welcome back! Here is what's happening with SinoTicket today.",
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
  docs: {
    helpCenter: {
      eyebrow: "Support",
      title: "Help Center",
      subtitle:
        "Need help with tickets, access, or your account? Start here and we will point you in the right direction.",
      sections: {
        support: {
          title: "Contact support",
          body: "Send a message to support@sinoticket.com for account, ticket, or event issues.",
        },
        tickets: {
          title: "Ticket assistance",
          body: "Use your app wallet, event details, and QR ticket tools to manage bookings and downloads.",
        },
      },
      footer: "We usually reply within one business day.",
    },
    privacyPolicy: {
      eyebrow: "Legal",
      title: "Privacy Policy",
      subtitle:
        "We keep your data focused on ticketing, account access, and event operations.",
      sections: {
        data: {
          title: "What we collect",
          body: "We store the details required to manage your account, tickets, notifications, and support requests.",
        },
        security: {
          title: "How we protect it",
          body: "Access is restricted to authorized systems and the minimum data needed for each feature.",
        },
      },
      footer: "Update this page whenever your privacy practices change.",
    },
    termsOfService: {
      eyebrow: "Legal",
      title: "Terms of Service",
      subtitle:
        "These terms describe how SinoTicket may be used by customers and administrators.",
      sections: {
        use: {
          title: "Acceptable use",
          body: "Use the platform responsibly, keep your account secure, and follow venue rules when attending events.",
        },
        refunds: {
          title: "Orders and refunds",
          body: "Refund eligibility and booking changes depend on the event policy and the seller's terms.",
        },
      },
      footer:
        "Make sure this reflects your official legal policy before launch.",
    },
    paymentMethods: {
      eyebrow: "Payments",
      title: "Payment Methods",
      subtitle:
        "Here is a quick reference for how payments are handled in SinoTicket.",
      sections: {
        methods: {
          title: "Accepted methods",
          body: "Payment options depend on the event and the market you are selling in. Keep the active methods here.",
        },
        security: {
          title: "Payment safety",
          body: "Always confirm the checkout provider, currency, and receipt details before completing an order.",
        },
      },
      footer:
        "Replace this with your real payment policy and supported providers.",
    },
  },
  app: {
    comingSoon: "Coming Soon",
  },
} as const;

export default en;
