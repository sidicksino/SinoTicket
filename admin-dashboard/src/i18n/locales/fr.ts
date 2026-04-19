const fr = {
  dashboard: {
    loading: "Aggregation des donnees en direct...",
    overview: "Apercu du tableau de bord",
    welcomeMessage:
      "Bon retour ! Voici ce qui se passe aujourd'hui sur SinoTicket.",
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
  docs: {
    helpCenter: {
      eyebrow: "Assistance",
      title: "Centre d'aide",
      subtitle:
        "Besoin d'aide pour les billets, l'acces ou votre compte ? Commencez ici et nous vous orienterons.",
      sections: {
        support: {
          title: "Contacter l'assistance",
          body: "Envoyez un message a support@sinoticket.com pour les problemes de compte, de billets ou d'evenements.",
        },
        tickets: {
          title: "Aide pour les billets",
          body: "Utilisez le portefeuille de l'application, les details de l'evenement et les outils QR pour gerer vos reservations et vos telechargements.",
        },
      },
      footer: "Nous repondons generalement sous un jour ouvrable.",
    },
    privacyPolicy: {
      eyebrow: "Juridique",
      title: "Politique de confidentialite",
      subtitle:
        "Nous limitons les donnees au strict necessaire pour la billetterie, l'acces au compte et les operations d'evenement.",
      sections: {
        data: {
          title: "Ce que nous collectons",
          body: "Nous conservons les informations necessaires pour gerer votre compte, vos billets, vos notifications et vos demandes d'assistance.",
        },
        security: {
          title: "Comment nous les protégeons",
          body: "L'acces est reserve aux systemes autorises et aux donnees minimales requises par chaque fonctionnalite.",
        },
      },
      footer:
        "Mettez cette page a jour si vos pratiques de confidentialite changent.",
    },
    termsOfService: {
      eyebrow: "Juridique",
      title: "Conditions d'utilisation",
      subtitle:
        "Ces conditions expliquent comment SinoTicket peut etre utilise par les clients et les administrateurs.",
      sections: {
        use: {
          title: "Utilisation autorisee",
          body: "Utilisez la plateforme de facon responsable, securisez votre compte et respectez les regles du lieu lors des evenements.",
        },
        refunds: {
          title: "Commandes et remboursements",
          body: "L'admissibilite au remboursement et les modifications de reservation dependent de la politique de l'evenement et des conditions du vendeur.",
        },
      },
      footer:
        "Assurez-vous que cela correspond a votre politique legale officielle avant le lancement.",
    },
    paymentMethods: {
      eyebrow: "Paiements",
      title: "Moyens de paiement",
      subtitle:
        "Voici un rappel rapide de la facon dont les paiements sont geres dans SinoTicket.",
      sections: {
        methods: {
          title: "Moyens acceptes",
          body: "Les options de paiement dependent de l'evenement et du marche. Conservez ici les moyens actifs.",
        },
        security: {
          title: "Securite du paiement",
          body: "Verifiez toujours le fournisseur de paiement, la devise et les details du recu avant de finaliser une commande.",
        },
      },
      footer:
        "Remplacez ceci par votre politique de paiement reelle et vos fournisseurs pris en charge.",
    },
  },
  app: {
    comingSoon: "Bientot disponible",
  },
} as const;

export default fr;
