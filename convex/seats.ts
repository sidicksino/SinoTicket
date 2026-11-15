import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { fail, requireVenueOwner, stamp } from "./lib";
import { seatStatus } from "./schema";

const BATCH = 1000;
const MAX_GENERATE = 50000;

/**
 * Seats of a section, ordered by number. With event_id, each seat's status is
 * computed for that event (booked > reserved > available) and updates live.
 */
export const list = query({
  args: {
    section_id: v.optional(v.string()),
    event_id: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = Math.max(1, Math.floor(args.page ?? 1));
    const limit = Math.min(1000, Math.max(1, Math.floor(args.limit ?? 100)));
    const empty = { total: 0, page, limit, seats: [] };

    const sectionId = args.section_id ? ctx.db.normalizeId("sections", args.section_id) : null;
    if (!sectionId) return empty;
    const section = await ctx.db.get(sectionId);
    if (!section) return empty;

    const upTo = await ctx.db
      .query("seats")
      .withIndex("by_section_number", (q) => q.eq("section_id", sectionId))
      .take(page * limit);
    const seats = upTo.slice((page - 1) * limit);

    const eventId = args.event_id ? ctx.db.normalizeId("events", args.event_id) : null;
    const now = Date.now();

    const shaped = await Promise.all(
      seats.map(async (seat) => {
        let status: "available" | "reserved" | "booked" = "available";
        if (eventId) {
          const ticket = await ctx.db
            .query("tickets")
            .withIndex("by_event_seat", (q) => q.eq("event_id", eventId).eq("seat_id", seat._id))
            .first();
          if (ticket) {
            status = "booked";
          } else {
            const holds = await ctx.db
              .query("reservations")
              .withIndex("by_event_seat", (q) =>
                q.eq("event_id", eventId).eq("seat_id", seat._id),
              )
              .collect();
            if (holds.some((r) => r.status === "Active" && r.expires_at > now)) {
              status = "reserved";
            }
          }
        }
        return { ...stamp(seat), status };
      }),
    );

    return { total: section.seat_count ?? upTo.length, page, limit, seats: shaped };
  },
});

/** Admin: bulk-create seats. Existing seat numbers are skipped. */
export const generate = action({
  args: { section_id: v.id("sections"), start_number: v.number(), count: v.number() },
  handler: async (ctx, { section_id, start_number, count }): Promise<{
    message: string;
    generated_count: number;
  }> => {
    if (!Number.isInteger(start_number) || !Number.isInteger(count) || count < 1) {
      fail("Missing or invalid fields (section_id, start_number, count)");
    }
    if (count > MAX_GENERATE) fail("Cannot generate more than 50,000 seats at once");
    await ctx.runQuery(internal.seats.ownerCheck, { section_id });

    let generated = 0;
    for (let offset = 0; offset < count; offset += BATCH) {
      generated += await ctx.runMutation(internal.seats.insertBatch, {
        section_id,
        start_number: start_number + offset,
        count: Math.min(BATCH, count - offset),
      });
    }
    return { message: `${generated} seats generated`, generated_count: generated };
  },
});

/** Admin: delete every seat in a section. */
export const clearSection = action({
  args: { section_id: v.id("sections") },
  handler: async (ctx, { section_id }): Promise<{ message: string; deleted_count: number }> => {
    await ctx.runQuery(internal.seats.ownerCheck, { section_id });
    let deleted = 0;
    for (;;) {
      const n: number = await ctx.runMutation(internal.seats.deleteBatch, { section_id });
      deleted += n;
      if (n < BATCH) break;
    }
    return { message: `Cleared ${deleted} seats`, deleted_count: deleted };
  },
});

export const update = mutation({
  args: { id: v.id("seats"), status: seatStatus },
  handler: async (ctx, { id, status }) => {
    const seat = await ctx.db.get(id);
    if (!seat) fail("Seat not found");
    const section = await ctx.db.get(seat.section_id);
    if (!section) fail("Section not found");
    await requireVenueOwner(ctx, section.venue_id);
    await ctx.db.patch(id, { status });
    return { seat: stamp((await ctx.db.get(id))!) };
  },
});

export const remove = mutation({
  args: { id: v.id("seats") },
  handler: async (ctx, { id }) => {
    const seat = await ctx.db.get(id);
    if (!seat) fail("Seat not found");
    const section = await ctx.db.get(seat.section_id);
    if (!section) fail("Section not found");
    await requireVenueOwner(ctx, section.venue_id);
    await ctx.db.delete(id);
    await ctx.db.patch(section._id, {
      seat_count: Math.max(0, (section.seat_count ?? 1) - 1),
    });
    return { message: "Seat deleted" };
  },
});

// ── Internal ────────────────────────────────────────────────────────────────

export const ownerCheck = internalQuery({
  args: { section_id: v.id("sections") },
  handler: async (ctx, { section_id }) => {
    const section = await ctx.db.get(section_id);
    if (!section) fail("Section not found");
    await requireVenueOwner(
      ctx,
      section.venue_id,
      "Forbidden: You don't own the venue of this section",
    );
    return null;
  },
});

export const insertBatch = internalMutation({
  args: { section_id: v.id("sections"), start_number: v.number(), count: v.number() },
  handler: async (ctx, { section_id, start_number, count }) => {
    const section = await ctx.db.get(section_id);
    if (!section) return 0;
    const taken = new Set(
      (
        await ctx.db
          .query("seats")
          .withIndex("by_section_number", (q) =>
            q
              .eq("section_id", section_id)
              .gte("number", start_number)
              .lt("number", start_number + count),
          )
          .collect()
      ).map((s) => s.number),
    );
    let inserted = 0;
    for (let i = 0; i < count; i++) {
      const number = start_number + i;
      if (taken.has(number)) continue;
      await ctx.db.insert("seats", { section_id, number, status: "available" });
      inserted++;
    }
    await ctx.db.patch(section_id, { seat_count: (section.seat_count ?? 0) + inserted });
    return inserted;
  },
});

async function deleteSeats(ctx: { db: any }, section_id: Id<"sections">) {
  const seats = await ctx.db
    .query("seats")
    .withIndex("by_section_number", (q: any) => q.eq("section_id", section_id))
    .take(BATCH);
  for (const seat of seats) await ctx.db.delete(seat._id);
  return seats.length as number;
}

export const deleteBatch = internalMutation({
  args: { section_id: v.id("sections") },
  handler: async (ctx, { section_id }) => {
    const deleted = await deleteSeats(ctx, section_id);
    const section = await ctx.db.get(section_id);
    if (section) {
      await ctx.db.patch(section_id, {
        seat_count: Math.max(0, (section.seat_count ?? deleted) - deleted),
      });
    }
    return deleted;
  },
});

/** Background cleanup after a section is deleted; reschedules until done. */
export const purgeSection = internalMutation({
  args: { section_id: v.id("sections") },
  handler: async (ctx, { section_id }) => {
    const deleted = await deleteSeats(ctx, section_id);
    if (deleted === BATCH) {
      await ctx.scheduler.runAfter(0, internal.seats.purgeSection, { section_id });
    }
  },
});
