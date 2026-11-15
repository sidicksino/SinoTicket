import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalMutation, mutation, query, type QueryCtx } from "./_generated/server";
import { fail, iso, paginate, randomHex, requireAdmin, stamp } from "./lib";
import { eventCategory, eventStatus } from "./schema";

const lineup = v.array(v.object({ name: v.string(), time: v.string() }));

const ticketCategoryInput = v.object({
  category_id: v.optional(v.union(v.string(), v.null())),
  name: v.string(),
  price: v.number(),
  section_id: v.optional(v.union(v.id("sections"), v.null())),
  quantity: v.number(),
  sold: v.optional(v.number()), // ignored: sold counts are server-owned
});

type CategoryInput = typeof ticketCategoryInput.type;

function parseDate(date: string) {
  const ms = Date.parse(date);
  if (Number.isNaN(ms)) fail("Invalid datetime format");
  return ms;
}

function buildCategories(
  input: CategoryInput[],
  existing: Doc<"events">["ticket_categories"] = [],
) {
  return input.map((cat) => {
    if (cat.price < 0) fail("Invalid ticket data");
    if (!Number.isInteger(cat.quantity) || cat.quantity <= 0) fail("Invalid ticket data");
    const previous = existing.find(
      (e) => (cat.category_id && e.category_id === cat.category_id) || e.name === cat.name,
    );
    return {
      category_id: previous?.category_id ?? cat.category_id ?? randomHex(24),
      name: cat.name,
      price: cat.price,
      quantity: cat.quantity,
      sold: previous?.sold ?? 0, // clients can never set this
      ...(cat.section_id ? { section_id: cat.section_id } : {}),
    };
  });
}

/** Event as the UIs expect it: ISO date, live status, venue/admin embedded. */
async function shape(ctx: QueryCtx, event: Doc<"events">) {
  const venue = event.venue_id ? await ctx.db.get(event.venue_id) : null;
  const admin = await ctx.db.get(event.admin_id);
  return {
    ...stamp(event),
    date: iso(event.date),
    status: event.date < Date.now() ? ("Ended" as const) : event.status,
    venue_id: venue
      ? { _id: venue._id, name: venue.name, location: venue.location, capacity: venue.capacity }
      : null,
    admin_id: admin ? { _id: admin._id, name: admin.name, email: admin.email } : null,
  };
}

/**
 * Events sorted by date. Shows only upcoming events unless `all` is true or a
 * status filter is given (same rule as the old REST endpoint).
 */
export const list = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(eventStatus),
    venue_id: v.optional(v.string()),
    upcoming: v.optional(v.boolean()),
    all: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const upcomingOnly = args.upcoming === true || (!args.status && args.all !== true);
    let events = upcomingOnly
      ? await ctx.db
          .query("events")
          .withIndex("by_date", (q) => q.gte("date", now))
          .collect()
      : await ctx.db.query("events").withIndex("by_date").collect();

    const liveStatus = (e: Doc<"events">) => (e.date < now ? "Ended" : e.status);
    if (args.venue_id) events = events.filter((e) => e.venue_id === args.venue_id);
    if (args.status) events = events.filter((e) => liveStatus(e) === args.status);
    if (args.category && args.category !== "All")
      events = events.filter((e) => e.category === args.category);
    const term = args.search?.trim().toLowerCase();
    if (term) {
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(term) || e.description.toLowerCase().includes(term),
      );
    }

    const { items, ...meta } = paginate(events, args.page, args.limit, 10);
    return { ...meta, events: await Promise.all(items.map((e) => shape(ctx, e))) };
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const eventId = ctx.db.normalizeId("events", id);
    const event = eventId ? await ctx.db.get(eventId) : null;
    return { event: event ? await shape(ctx, event) : null };
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.string(),
    imageUrl: v.optional(v.union(v.string(), v.null())),
    venue_id: v.id("venues"),
    status: v.optional(eventStatus),
    category: v.optional(eventCategory),
    artist_lineup: v.optional(lineup),
    ticket_categories: v.optional(v.array(ticketCategoryInput)),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (args.title.trim().length < 3) fail("Title must be at least 3 characters long");
    if (args.description.trim().length < 10)
      fail("Description must be at least 10 characters long");
    if (!(await ctx.db.get(args.venue_id))) fail("Venue not found");

    const id = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      date: parseDate(args.date),
      imageUrl: args.imageUrl ?? null,
      venue_id: args.venue_id,
      admin_id: admin._id,
      status: args.status ?? "Upcoming",
      category: args.category ?? "Music",
      artist_lineup: args.artist_lineup ?? [],
      ticket_categories: buildCategories(args.ticket_categories ?? []),
    });
    return { event: await shape(ctx, (await ctx.db.get(id))!) };
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    imageUrl: v.optional(v.union(v.string(), v.null())),
    venue_id: v.optional(v.id("venues")),
    status: v.optional(eventStatus),
    category: v.optional(eventCategory),
    artist_lineup: v.optional(lineup),
    ticket_categories: v.optional(v.array(ticketCategoryInput)),
  },
  handler: async (ctx, { id, date, ticket_categories, ...rest }) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(id);
    if (!event) fail("Event not found");
    if (rest.title !== undefined && rest.title.trim().length < 3)
      fail("Title must be at least 3 characters long");
    if (rest.description !== undefined && rest.description.trim().length < 10)
      fail("Description must be at least 10 characters long");
    if (rest.venue_id && !(await ctx.db.get(rest.venue_id))) fail("Venue not found");

    await ctx.db.patch(id, {
      ...rest,
      ...(date !== undefined ? { date: parseDate(date) } : {}),
      ...(ticket_categories !== undefined
        ? { ticket_categories: buildCategories(ticket_categories, event.ticket_categories) }
        : {}),
    });
    return { event: await shape(ctx, (await ctx.db.get(id))!) };
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    if (!(await ctx.db.get(id))) fail("Event not found");
    await ctx.db.delete(id);
    return { message: "Event deleted successfully" };
  },
});

/** Hourly cron: persist the "Ended" status for events whose date has passed. */
export const markEnded = internalMutation({
  args: {},
  handler: async (ctx) => {
    const past = await ctx.db
      .query("events")
      .withIndex("by_date", (q) => q.lt("date", Date.now()))
      .collect();
    for (const event of past) {
      if (event.status !== "Ended") await ctx.db.patch(event._id, { status: "Ended" });
    }
  },
});
