import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import {
  fail,
  getCurrentUser,
  iso,
  paginate,
  randomHex,
  requireAdmin,
  requireUser,
  stamp,
} from "./lib";
import { paymentMethod } from "./schema";

/** Turn an active reservation into a ticket (payment is simulated for now). */
export const checkout = mutation({
  args: { reservation_id: v.id("reservations"), payment_method: paymentMethod },
  handler: async (ctx, { reservation_id, payment_method }) => {
    const user = await requireUser(ctx);

    const reservation = await ctx.db.get(reservation_id);
    if (!reservation) fail("Reservation not found");
    if (reservation.user_id !== user._id) fail("Not your reservation");
    if (reservation.status !== "Active") fail(`Reservation is already ${reservation.status}`);
    if (reservation.expires_at < Date.now()) {
      fail("Reservation has expired. Please select the seat again.");
    }

    const seat = await ctx.db.get(reservation.seat_id);
    if (!seat) fail("Seat not found");

    const duplicate = await ctx.db
      .query("tickets")
      .withIndex("by_event_seat", (q) =>
        q.eq("event_id", reservation.event_id).eq("seat_id", seat._id),
      )
      .first();
    if (duplicate) fail("Ticket already exists for this seat");

    // The ticket category is the one mapped to the seat's section (else the first).
    const event = await ctx.db.get(reservation.event_id);
    const categories = event?.ticket_categories ?? [];
    const index = Math.max(
      0,
      categories.findIndex((c) => c.section_id === seat.section_id),
    );
    const category = categories[index];

    const paymentId = await ctx.db.insert("payments", {
      user_id: user._id,
      event_id: reservation.event_id,
      amount: category?.price ?? 0,
      currency: "XAF",
      status: "Success",
      payment_method,
      transaction_id: `TXN_${randomHex(8).toUpperCase()}`,
    });

    const ticketId = await ctx.db.insert("tickets", {
      event_id: reservation.event_id,
      attendee_id: user._id,
      seat_id: seat._id,
      qr_code: `SINO_TK_${randomHex(64)}`,
      status: "Active",
      ...(category ? { category_id: category.category_id } : {}),
    });

    await ctx.db.patch(reservation_id, { status: "Completed" });
    if (event && category) {
      await ctx.db.patch(event._id, {
        ticket_categories: categories.map((c, i) =>
          i === index ? { ...c, sold: c.sold + 1 } : c,
        ),
      });
    }

    const title = event?.title ?? "the event";
    await ctx.db.insert("notifications", {
      user_id: user.user_id,
      title: "Booking Confirmed!",
      message: `Your ticket for "${title}" is ready. Tap to open your Digital Wallet.`,
      type: "BOOKING",
      is_read: false,
      link: "/(root)/(tabs)/ticket",
    });
    if (user.push_tokens.length > 0) {
      await ctx.scheduler.runAfter(0, internal.push.send, {
        tokens: user.push_tokens,
        title: "Booking Confirmed!",
        body: `Your ticket for "${title}" is ready.`,
        data: { ticketId, screen: "ticket" },
      });
    }

    return {
      message: "Checkout successful! Ticket generated.",
      ticket: stamp((await ctx.db.get(ticketId))!),
      payment: stamp((await ctx.db.get(paymentId))!),
    };
  },
});

/** The signed-in user's tickets, newest first, with event/venue/seat embedded. */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { count: 0, tickets: [] };
    const rows = await ctx.db
      .query("tickets")
      .withIndex("by_attendee", (q) => q.eq("attendee_id", user._id))
      .order("desc")
      .collect();

    const tickets = await Promise.all(
      rows.map(async (ticket) => {
        const event = await ctx.db.get(ticket.event_id);
        const venue = event?.venue_id ? await ctx.db.get(event.venue_id) : null;
        const seat = await ctx.db.get(ticket.seat_id);
        const section = seat ? await ctx.db.get(seat.section_id) : null;
        return {
          ...stamp(ticket),
          event_id: event
            ? {
                _id: event._id,
                title: event.title,
                date: iso(event.date),
                imageUrl: event.imageUrl ?? null,
                ticket_categories: event.ticket_categories,
                venue_id: venue ? { _id: venue._id, name: venue.name } : null,
              }
            : null,
          seat_id: seat
            ? {
                _id: seat._id,
                number: seat.number,
                section_id: section
                  ? { _id: section._id, name: section.name, venue_id: section.venue_id }
                  : null,
              }
            : null,
        };
      }),
    );
    return { count: tickets.length, tickets };
  },
});

/** Door scanner (admins only): validates a QR code and marks the ticket used. */
export const verify = mutation({
  args: { qr: v.string() },
  handler: async (ctx, { qr }) => {
    await requireAdmin(ctx);
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_qr", (q) => q.eq("qr_code", qr.trim()))
      .unique();
    if (!ticket) return { valid: false, message: "Invalid ticket" };
    if (ticket.status === "Used") return { valid: false, message: "Already used" };
    if (ticket.status === "Refunded") return { valid: false, message: "Ticket was refunded" };

    await ctx.db.patch(ticket._id, { status: "Used" });
    const event = await ctx.db.get(ticket.event_id);
    const seat = await ctx.db.get(ticket.seat_id);
    return {
      valid: true,
      message: "Valid ticket ✅",
      ticket: {
        ...stamp(ticket),
        status: "Used" as const,
        event_id: event ? { _id: event._id, title: event.title, date: iso(event.date) } : null,
        seat_id: seat ? { _id: seat._id, number: seat.number } : null,
      },
    };
  },
});

/** Admin: every ticket on the platform, paginated. */
export const listAll = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const status = args.status;
    const rows =
      status === "Active" || status === "Used" || status === "Refunded"
        ? await ctx.db
            .query("tickets")
            .withIndex("by_status", (q) => q.eq("status", status))
            .order("desc")
            .collect()
        : await ctx.db.query("tickets").order("desc").collect();

    const { items, ...meta } = paginate(rows, args.page, args.limit);
    const tickets = await Promise.all(
      items.map(async (ticket) => {
        const event = await ctx.db.get(ticket.event_id);
        const attendee = await ctx.db.get(ticket.attendee_id);
        const seat = await ctx.db.get(ticket.seat_id);
        const section = seat ? await ctx.db.get(seat.section_id) : null;
        return {
          ...stamp(ticket),
          event_id: event
            ? {
                _id: event._id,
                title: event.title,
                date: iso(event.date),
                imageUrl: event.imageUrl ?? null,
                venue_id: event.venue_id,
              }
            : null,
          attendee_id: attendee
            ? {
                _id: attendee._id,
                name: attendee.name,
                email: attendee.email,
                profile_photo: attendee.profile_photo ?? null,
              }
            : null,
          seat_id: seat
            ? {
                _id: seat._id,
                number: seat.number,
                section_id: section ? { _id: section._id, name: section.name } : null,
              }
            : null,
        };
      }),
    );
    return { ...meta, tickets };
  },
});
