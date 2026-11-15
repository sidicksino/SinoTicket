import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { fail, stamp } from "./lib";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { notifications: [] };
    const all = [
      ...(await ctx.db
        .query("notifications")
        .withIndex("by_user_read", (q) => q.eq("user_id", identity.subject))
        .collect()),
    ];
    all.sort((a, b) => b._creationTime - a._creationTime);
    return { notifications: all.slice(0, 50).map(stamp) };
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { count: 0 };
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("user_id", identity.subject).eq("is_read", false))
      .collect();
    return { count: unread.length };
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) fail("Unauthorized");
    const notification = await ctx.db.get(id);
    if (!notification || notification.user_id !== identity.subject) {
      fail("Notification not found");
    }
    await ctx.db.patch(id, { is_read: true });
    return { notification: stamp({ ...notification, is_read: true }) };
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) fail("Unauthorized");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("user_id", identity.subject).eq("is_read", false))
      .collect();
    for (const n of unread) await ctx.db.patch(n._id, { is_read: true });
    return { message: "All notifications marked as read" };
  },
});
