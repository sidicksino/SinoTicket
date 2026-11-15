import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { fail, getCurrentUser, iso, requireUser, stamp } from "./lib";

const HOLD_MS = 15 * 60 * 1000;

/**
 * Hold a seat for 15 minutes. Convex mutations are serializable transactions,
 * so two people can never end up holding (or buying) the same seat.
 */
export const reserve = mutation({
  args: { event_id: v.id("events"), seat_id: v.id("seats") },
  handler: async (ctx, { event_id, seat_id }) => {
    const user = await requireUser(ctx);

    const event = await ctx.db.get(event_id);
    if (!event) fail("Event not found");
    const seat = await ctx.db.get(seat_id);
    if (!seat) fail("Seat not found");

    const now = Date.now();
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_event_seat", (q) => q.eq("event_id", event_id).eq("seat_id", seat_id))
      .first();
    const hold = (
      await ctx.db
        .query("reservations")
        .withIndex("by_event_seat", (q) => q.eq("event_id", event_id).eq("seat_id", seat_id))
        .collect()
    ).find((r) => r.status === "Active" && r.expires_at > now);

    if (ticket || (hold && hold.user_id !== user._id)) {
      fail("Seat is currently not available (already booked or reserved)");
    }

    const section = await ctx.db.get(seat.section_id);
    if (!section || section.venue_id !== event.venue_id) {
      fail("Seat does not belong to the Event's venue");
    }

    const expires_at = now + HOLD_MS;
    let reservationId = hold?._id;
    if (reservationId) {
      await ctx.db.patch(reservationId, { expires_at });
    } else {
      reservationId = await ctx.db.insert("reservations", {
        user_id: user._id,
        event_id,
        seat_id,
        expires_at,
        status: "Active",
      });
    }
    // Release the seat automatically when the hold runs out.
    await ctx.scheduler.runAt(expires_at, internal.reservations.expire, { id: reservationId });

    const reservation = (await ctx.db.get(reservationId))!;
    return {
      message: "Seat strictly reserved for 15 minutes",
      reservation: { ...stamp(reservation), expires_at: iso(reservation.expires_at) },
    };
  },
});

export const cancel = mutation({
  args: { reservation_ids: v.array(v.id("reservations")) },
  handler: async (ctx, { reservation_ids }) => {
    if (reservation_ids.length === 0) fail("No reservation_ids provided");
    const user = await requireUser(ctx);
    let released = 0;
    for (const id of reservation_ids) {
      const reservation = await ctx.db.get(id);
      if (!reservation || reservation.user_id !== user._id) continue;
      if (reservation.status === "Active") await ctx.db.patch(id, { status: "Expired" });
      released++;
    }
    if (released === 0) fail("No reservations found to cancel");
    return { message: "Reservations released successfully" };
  },
});

/** The signed-in user's live holds (their "cart"). */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { count: 0, reservations: [] };
    const now = Date.now();
    const active = (
      await ctx.db
        .query("reservations")
        .withIndex("by_user_status", (q) => q.eq("user_id", user._id).eq("status", "Active"))
        .order("desc")
        .collect()
    ).filter((r) => r.expires_at > now);

    const reservations = await Promise.all(
      active.map(async (r) => {
        const event = await ctx.db.get(r.event_id);
        const seat = await ctx.db.get(r.seat_id);
        return {
          ...stamp(r),
          expires_at: iso(r.expires_at),
          event_id: event
            ? { _id: event._id, title: event.title, date: iso(event.date), venue_id: event.venue_id }
            : null,
          seat_id: seat
            ? { _id: seat._id, number: seat.number, section_id: seat.section_id, status: seat.status }
            : null,
        };
      }),
    );
    return { count: reservations.length, reservations };
  },
});

export const expire = internalMutation({
  args: { id: v.id("reservations") },
  handler: async (ctx, { id }) => {
    const reservation = await ctx.db.get(id);
    // A re-reserve extends expires_at; only expire if the hold really ran out.
    if (reservation?.status === "Active" && reservation.expires_at <= Date.now()) {
      await ctx.db.patch(id, { status: "Expired" });
    }
  },
});
