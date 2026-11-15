import { query } from "./_generated/server";
import { iso, requireAdmin } from "./lib";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Admin dashboard numbers. Revenue chart is built from real successful payments. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const events = await ctx.db.query("events").order("desc").collect();
    const activeTickets = await ctx.db
      .query("tickets")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .collect();
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "Success"))
      .collect();
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    const latestEvents = await Promise.all(
      events.slice(0, 3).map(async (event) => {
        const venue = event.venue_id ? await ctx.db.get(event.venue_id) : null;
        const quantity = event.ticket_categories.reduce((n, c) => n + c.quantity, 0);
        const sold = event.ticket_categories.reduce((n, c) => n + c.sold, 0);
        return {
          _id: event._id,
          title: event.title,
          date: iso(event.date),
          venue_name: venue?.name ?? "Unknown Venue",
          image: event.imageUrl ?? null,
          soldPercentage: quantity > 0 ? Math.round((sold / quantity) * 100) : 0,
        };
      }),
    );

    // Trailing six months of sales (revenue) and tickets sold.
    const now = new Date();
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1);
      const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1);
      const inMonth = payments.filter((p) => p._creationTime >= start && p._creationTime < end);
      chartData.push({
        name: MONTHS[new Date(start).getUTCMonth()],
        sales: inMonth.reduce((sum, p) => sum + p.amount, 0),
        visitors: inMonth.length,
      });
    }

    return {
      stats: {
        totalRevenue,
        totalTickets: activeTickets.length,
        totalUsers: users.length,
        totalEvents: events.length,
        latestEvents,
        chartData,
      },
    };
  },
});
