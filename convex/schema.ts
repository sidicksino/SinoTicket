import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const eventStatus = v.union(
  v.literal("Upcoming"),
  v.literal("Ongoing"),
  v.literal("Ended"),
);

export const eventCategory = v.union(
  v.literal("Music"),
  v.literal("Sports"),
  v.literal("Cultural"),
  v.literal("Business"),
  v.literal("Fashion"),
);

export const seatStatus = v.union(
  v.literal("available"),
  v.literal("reserved"),
  v.literal("booked"),
);

export const paymentMethod = v.union(
  v.literal("MobileMoney"),
  v.literal("Card"),
);

export default defineSchema({
  users: defineTable({
    user_id: v.string(), // Clerk user id
    email: v.string(),
    name: v.string(),
    profile_photo: v.optional(v.union(v.string(), v.null())),
    phone_number: v.optional(v.union(v.string(), v.null())),
    preferences: v.optional(v.any()),
    is_verified: v.boolean(),
    push_tokens: v.array(v.string()),
    last_login: v.optional(v.number()),
    // Mirror of Clerk publicMetadata.role, refreshed on every sign-in.
    role: v.optional(v.string()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_email", ["email"]),

  venues: defineTable({
    name: v.string(),
    location: v.string(),
    capacity: v.number(),
    admin_id: v.id("users"),
    map_data: v.optional(v.any()),
  }).index("by_admin", ["admin_id"]),

  sections: defineTable({
    venue_id: v.id("venues"),
    name: v.string(),
    description: v.optional(v.string()),
    parent_section_id: v.optional(v.union(v.id("sections"), v.null())),
    seat_count: v.optional(v.number()),
  })
    .index("by_venue_name", ["venue_id", "name"])
    .index("by_parent", ["parent_section_id"]),

  seats: defineTable({
    section_id: v.id("sections"),
    number: v.number(),
    status: seatStatus,
  }).index("by_section_number", ["section_id", "number"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.union(v.string(), v.null())),
    date: v.number(), // ms since epoch
    venue_id: v.optional(v.id("venues")),
    admin_id: v.id("users"),
    status: eventStatus,
    category: eventCategory,
    artist_lineup: v.array(v.object({ name: v.string(), time: v.string() })),
    ticket_categories: v.array(
      v.object({
        category_id: v.string(),
        name: v.string(),
        price: v.number(),
        section_id: v.optional(v.id("sections")),
        quantity: v.number(),
        sold: v.number(),
      }),
    ),
  })
    .index("by_date", ["date"])
    .index("by_venue", ["venue_id"]),

  reservations: defineTable({
    user_id: v.id("users"),
    event_id: v.id("events"),
    seat_id: v.id("seats"),
    expires_at: v.number(),
    status: v.union(
      v.literal("Active"),
      v.literal("Expired"),
      v.literal("Completed"),
    ),
  })
    .index("by_event_seat", ["event_id", "seat_id"])
    .index("by_user_status", ["user_id", "status"]),

  tickets: defineTable({
    event_id: v.id("events"),
    category_id: v.optional(v.string()),
    attendee_id: v.id("users"),
    seat_id: v.id("seats"),
    qr_code: v.string(),
    status: v.union(
      v.literal("Active"),
      v.literal("Used"),
      v.literal("Refunded"),
    ),
  })
    .index("by_event_seat", ["event_id", "seat_id"])
    .index("by_attendee", ["attendee_id"])
    .index("by_qr", ["qr_code"])
    .index("by_status", ["status"]),

  payments: defineTable({
    user_id: v.id("users"),
    event_id: v.id("events"),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Success"),
      v.literal("Failed"),
    ),
    payment_method: paymentMethod,
    transaction_id: v.string(),
  }).index("by_status", ["status"]),

  notifications: defineTable({
    user_id: v.string(), // Clerk user id
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("SYSTEM"), v.literal("BOOKING"), v.literal("PROMO")),
    is_read: v.boolean(),
    link: v.optional(v.union(v.string(), v.null())),
  }).index("by_user_read", ["user_id", "is_read"]),
});
