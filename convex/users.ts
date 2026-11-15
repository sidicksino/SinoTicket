import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  fail,
  getCurrentUser,
  isAdminRole,
  paginate,
  requireAdmin,
  requireUser,
  roleOf,
  stamp,
  upsertUser,
} from "./lib";

/** Current user's profile ({ user: null } while signed out or not yet synced). */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { user: null };
    const user = await getCurrentUser(ctx);
    if (!user) return { user: null };
    return { user: { ...stamp(user), role: roleOf(identity, user) } };
  },
});

/** Called by the apps after sign-in: creates/refreshes the user row. */
export const store = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    profile_photo: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) fail("Unauthorized");
    const user = await upsertUser(ctx, identity, args);
    // Mirror the Clerk role so admin checks work without custom JWT claims.
    if (process.env.CLERK_SECRET_KEY) {
      await ctx.scheduler.runAfter(0, internal.users.syncRoleFromClerk, {
        user_id: identity.subject,
      });
    }
    return { user: { ...stamp(user), role: roleOf(identity, user) } };
  },
});

export const checkExists = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const found = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
      .first();
    return { exists: !!found };
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    phone_number: v.optional(v.string()),
    profile_photo: v.optional(v.string()),
    preferences: v.optional(v.any()),
    push_token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const patch: Record<string, unknown> = {};

    if (args.name !== undefined && args.name.trim()) patch.name = args.name.trim();
    if (args.profile_photo !== undefined) {
      // Photos live in Clerk; we only keep the URL (documents are capped at 1MB).
      if (args.profile_photo.startsWith("data:")) fail("profile_photo must be a URL");
      patch.profile_photo = args.profile_photo;
    }
    if (args.phone_number !== undefined) patch.phone_number = args.phone_number.trim() || null;
    if (args.preferences !== undefined) {
      if (
        typeof args.preferences !== "object" ||
        args.preferences === null ||
        Array.isArray(args.preferences)
      ) {
        fail("preferences must be an object");
      }
      patch.preferences = { ...(user.preferences ?? {}), ...args.preferences };
    }
    if (args.push_token && !user.push_tokens.includes(args.push_token)) {
      patch.push_tokens = [...user.push_tokens, args.push_token];
    }

    if (Object.keys(patch).length === 0 && !args.push_token) fail("No fields to update");
    await ctx.db.patch(user._id, patch);
    return { user: stamp((await ctx.db.get(user._id))!) };
  },
});

/** Admin: paginated user list with name/email search. */
export const list = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let users = await ctx.db.query("users").order("desc").collect();
    const term = args.search?.trim().toLowerCase();
    if (term) {
      users = users.filter(
        (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
      );
    }
    const { items, ...meta } = paginate(users, args.page, args.limit);
    return { ...meta, users: items.map(stamp) };
  },
});

// ── Internal ────────────────────────────────────────────────────────────────

/** Used by actions, which can't read the database directly. */
export const adminCheck = internalQuery({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx);
    return admin._id;
  },
});

export const applyRole = internalMutation({
  args: { user_id: v.string(), role: v.string() },
  handler: async (ctx, { user_id, role }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("user_id", user_id))
      .unique();
    if (user && user.role !== role) await ctx.db.patch(user._id, { role });
  },
});

export const syncRoleFromClerk = internalAction({
  args: { user_id: v.string() },
  handler: async (ctx, { user_id }) => {
    const secret = process.env.CLERK_SECRET_KEY;
    if (!secret) return;
    const res = await fetch(`https://api.clerk.com/v1/users/${user_id}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!res.ok) {
      console.error("Clerk role sync failed:", res.status);
      return;
    }
    const clerkUser = await res.json();
    const role = clerkUser?.public_metadata?.role;
    await ctx.runMutation(internal.users.applyRole, {
      user_id,
      role: typeof role === "string" && role ? role : "member",
    });
  },
});

/**
 * Grant or revoke admin from the CLI / Convex dashboard:
 *   npx convex run users:setRole '{"email":"you@example.com","role":"admin"}'
 * (If CLERK_SECRET_KEY is set, Clerk's publicMetadata.role wins on next sign-in.)
 */
export const setRole = internalMutation({
  args: { email: v.string(), role: v.string() },
  handler: async (ctx, { email, role }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
      .first();
    if (!user) fail(`No user with email ${email}. They must sign in once first.`);
    await ctx.db.patch(user._id, { role });
    return { email: user.email, role, isAdmin: isAdminRole(role) };
  },
});
