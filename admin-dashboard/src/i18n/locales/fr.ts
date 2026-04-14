const fr = {
  dashboard: {
    loading: "Aggregation des donnees en direct...",
    overview: "Apercu du tableau de bord",
    welcomeMessage: "Bon retour ! Voici ce qui se passe aujourd'hui sur SinoTicket.",
    stats: {
      totalRevenue: "Revenu total",
      revenueDesc: "Total des gains historiques",
      ticketsSold: "Billets vendus",
      ticketsDesc: "Billets actifs emis",
      activeUsers: "Utilisateurs actifs",
      usersDesc: "Profils enregistres",
      totalEvents: "Evenements totaux",
      eventsDesc: "Evenements orchestras",
    },
    chart: {
      title: "Tendance recente",
      subtitle: "Demande estimee de billets sur les 6 derniers mois.",
    },
    latestEvents: "Derniers evenements",
    viewAll: "Tout voir",
    noEvents: "Aucun evenement cree pour le moment.",
  },
  admin: {
    nav: {
      dashboard: "Tableau de bord",
      events: "Evenements",
      venues: "Lieux",
      sections: "Sections",
      seats: "Places",
      tickets: "Billets",
      users: "Utilisateurs",
      system: "Systeme",
      settings: "Parametres",
    },
    theme: {
      lightMode: "Passer au mode clair",
      darkMode: "Passer au mode sombre",
    },
    defaultUser: "Admin",
    portalTitle: "Portail administrateur",
    signOut: "Se deconnecter",
  },
  auth: {
    verifyingAccess: "Verification de l'acces...",
    accessDenied: "Acces refuse",
    yourAccount: "Votre compte",
    noPrivileges: "n'a pas les privileges administrateur.",
    redirectingToLogin: "Redirection vers la connexion...",
    signOutNow: "Se deconnecter maintenant",
  },
  app: {
    comingSoon: "Bientot disponible",
  },
} as const;

export default fr;
