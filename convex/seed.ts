import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { randomHex } from "./lib";

const DAY = 24 * 60 * 60 * 1000;
const SEATS_PER_SECTION = 40;

const VENUES = [
  {
    name: "Palais des Arts et de la Culture",
    location: "N'Djamena, Tchad (Quartier Sabangali)",
    capacity: 5000,
    sections: ["VIP Tribune", "Golden Circle", "Pelouse Nord"],
  },
  {
    name: "Stade Idriss Mahamat Ouya",
    location: "N'Djamena, Tchad (Avenue Mobutu)",
    capacity: 20000,
    sections: ["Salle Principale", "Balcon VIP", "Espace Debout"],
  },
  {
    name: "Hôtel Radisson Blu - Grand Ballroom",
    location: "N'Djamena, Tchad (Quartier Sabangali)",
    capacity: 1200,
    sections: ["Tribune Est", "Tribune Ouest", "Fosse Centrale"],
  },
];

const EVENTS = [
  {
    title: "Afrotronix: Nomadic Blues Live",
    description:
      "Une expérience audiovisuelle immersive mêlant rythmes traditionnels tchadiens et sonorités futuristes. Afrotronix revient au pays pour un concert historique au Palais des Arts.",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200",
    inDays: 14,
    hour: 20,
    artist_lineup: [
      { name: "Afrotronix (Main Show)", time: "21:00" },
      { name: "Grosse Machine (Opening)", time: "20:00" },
    ],
    categories: [
      { name: "General Admission", price: 5000, quantity: 200 },
      { name: "VIP Zone", price: 20000, quantity: 50 },
    ],
    category: "Music" as const,
    venueIndex: 0,
  },
  {
    title: "Festival Dari: Terre de Culture",
    description:
      "Le plus grand festival culturel du Tchad. Venez découvrir les danses, l'artisanat et la gastronomie des 23 provinces du pays. Une célébration de notre identité nationale.",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200",
    inDays: 30,
    hour: 10,
    artist_lineup: [
      { name: "Ouverture Officielle", time: "10:00" },
      { name: "Danses Traditionnelles (Kanem/Ouaddaï)", time: "14:00" },
      { name: "Concert de Clôture", time: "18:00" },
    ],
    categories: [
      { name: "Accès Journée", price: 1000, quantity: 500 },
      { name: "Pass Festival (3 jours)", price: 2500, quantity: 100 },
    ],
    category: "Cultural" as const,
    venueIndex: 1,
  },
  {
    title: "Mawndoe: Concert Acoustique",
    description:
      "La voix d'or du Tchad, Mawndoe, vous invite à une soirée intime et acoustique. Un voyage musical chargé d'émotion et de poésie au Radisson Blu.",
    imageUrl: "https://images.unsplash.com/photo-1514525253344-99a30489246a?q=80&w=1200",
    inDays: 45,
    hour: 19,
    artist_lineup: [
      { name: "Mawndoe (Acoustique)", time: "20:30" },
      { name: "Innocent (Solo Piano)", time: "19:30" },
    ],
    categories: [
      { name: "Premium Seats", price: 25000, quantity: 100 },
      { name: "Backstage Access", price: 50000, quantity: 10 },
    ],
    category: "Music" as const,
    venueIndex: 2,
  },
  {
    title: "Les Saos vs Lions Indomptables",
    description:
      "Match de gala entre l'équipe nationale du Tchad et le Cameroun. Venez supporter les Saos dans ce derby d'Afrique Centrale électrisant au Stade Idriss Mahamat Ouya.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200",
    inDays: 60,
    hour: 16,
    artist_lineup: [
      { name: "Kick-off", time: "16:00" },
      { name: "Animations Mi-temps", time: "16:45" },
    ],
    categories: [
      { name: "Tribune Populaire", price: 1000, quantity: 300 },
      { name: "Tribune d'Honneur", price: 10000, quantity: 30 },
    ],
    category: "Sports" as const,
    venueIndex: 1,
  },
  {
    title: "N'Djamena Fashion Week",
    description:
      "La mode tchadienne sous les projecteurs. Découvrez les nouvelles collections des designers locaux et internationaux les plus en vogue du moment.",
    imageUrl: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200",
    inDays: 90,
    hour: 18,
    artist_lineup: [
      { name: "Red Carpet Reception", time: "18:00" },
      { name: "Fashion Show Part 1", time: "19:30" },
      { name: "Gala Dinner", time: "21:30" },
    ],
    categories: [
      { name: "Classic Entrance", price: 15000, quantity: 200 },
      { name: "VVIP Table", price: 100000, quantity: 10 },
    ],
    category: "Fashion" as const,
    venueIndex: 2,
  },
];

/**
 * Demo data: 3 venues, 3 sections each (40 seats per section), 5 upcoming events.
 *
 *   npx convex run seed:run                                   # owned by a placeholder admin
 *   npx convex run seed:run '{"admin_email":"you@example.com"}'  # owned by you (sign in first)
 *
 * Wipes venues, sections, seats, events, reservations, tickets and payments
 * first. Users and notifications are kept.
 */
export const run = internalMutation({
  args: { admin_email: v.optional(v.string()) },
  handler: async (ctx, { admin_email }) => {
    for (const table of [
      "tickets",
      "payments",
      "reservations",
      "events",
      "seats",
      "sections",
      "venues",
    ] as const) {
      for (const doc of await ctx.db.query(table).collect()) await ctx.db.delete(doc._id);
    }

    const email = (admin_email ?? "admin@sinoticket.com").trim().toLowerCase();
    let admin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (!admin) {
      if (admin_email) throw new Error(`No user with email ${admin_email}. Sign in once first.`);
      const id = await ctx.db.insert("users", {
        user_id: "seed_admin_001",
        email,
        name: "Sino Admin",
        is_verified: true,
        push_tokens: [],
        preferences: {},
      });
      admin = (await ctx.db.get(id))!;
    }

    const venues = [];
    for (const { sections: names, ...venue } of VENUES) {
      const venueId = await ctx.db.insert("venues", { ...venue, admin_id: admin._id });
      const sectionIds = [];
      for (const name of names) {
        const sectionId = await ctx.db.insert("sections", {
          venue_id: venueId,
          name,
          parent_section_id: null,
          seat_count: SEATS_PER_SECTION,
        });
        for (let n = 1; n <= SEATS_PER_SECTION; n++) {
          await ctx.db.insert("seats", { section_id: sectionId, number: n, status: "available" });
        }
        sectionIds.push(sectionId);
      }
      venues.push({ venueId, sectionIds });
    }

    const midnight = new Date();
    midnight.setUTCHours(0, 0, 0, 0);
    for (const { categories, venueIndex, inDays, hour, ...event } of EVENTS) {
      const venue = venues[venueIndex];
      await ctx.db.insert("events", {
        ...event,
        date: midnight.getTime() + inDays * DAY + hour * 60 * 60 * 1000,
        status: "Upcoming",
        venue_id: venue.venueId,
        admin_id: admin._id,
        ticket_categories: categories.map((category, i) => ({
          ...category,
          category_id: randomHex(24),
          section_id: venue.sectionIds[i],
          sold: 0,
        })),
      });
    }

    return {
      admin: admin.email,
      venues: VENUES.length,
      sections: VENUES.length * 3,
      seats: VENUES.length * 3 * SEATS_PER_SECTION,
      events: EVENTS.length,
    };
  },
});
