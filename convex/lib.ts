import { ConvexError } from "convex/values";
import type { UserIdentity } from "convex/server";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/** Throw an error whose message reaches the client unchanged. */
export function fail(message: string): never {
  throw new ConvexError(message);
}

export const iso = (ms: number) => new Date(ms).toISOString();

/** Adds the Mongo-style timestamps the UIs still read. */
export function stamp<T extends { _creationTime: number }>(doc: T) {
  return { ...doc, createdAt: iso(doc._creationTime), updatedAt: iso(doc._creationTime) };
}

export function randomHex(length: number) {
  let out = "";
  while (out.length < length) {
    out += Math.floor(Math.random() * 0x100000000)
      .toString(16)
      .padStart(8, "0");
  }
  return out.slice(0, length);
}

function claimedRole(identity: UserIdentity): string | undefined {
  const claims = identity as Record<string, any>;
  const role = claims.role ?? claims.public_metadata?.role;
  return typeof role === "string" && role ? role : undefined;
}

/** Role comes from a Clerk JWT claim when present, else the mirrored copy. */
export function roleOf(identity: UserIdentity, user: Doc<"users"> | null) {
  return claimedRole(identity) ?? user?.role ?? "member";
}

export const isAdminRole = (role: string) => role.toLowerCase() === "admin";

export async function userBySubject(ctx: QueryCtx | MutationCtx, subject: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_user_id", (q) => q.eq("user_id", subject))
    .unique();
}

/** The signed-in user's row, or null (signed out / not synced yet). */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await userBySubject(ctx, identity.subject);
}

/** Upserts the signed-in Clerk user into the users table. */
export async function upsertUser(
  ctx: MutationCtx,
  identity: UserIdentity,
  fallback: { name?: string; email?: string; profile_photo?: string | null } = {},
): Promise<Doc<"users">> {
  const email = (identity.email ?? fallback.email ?? "").trim().toLowerCase();
  const existing =
    (await userBySubject(ctx, identity.subject)) ??
    (email
      ? await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first()
      : null);

  if (existing) {
    await ctx.db.patch(existing._id, {
      user_id: identity.subject,
      last_login: Date.now(),
      ...(email && existing.email !== email ? { email } : {}),
    });
    return (await ctx.db.get(existing._id))!;
  }

  const name =
    identity.name?.trim() ||
    fallback.name?.trim() ||
    identity.givenName ||
    (email ? email.split("@")[0] : "User");

  const id = await ctx.db.insert("users", {
    user_id: identity.subject,
    email,
    name,
    profile_photo: identity.pictureUrl ?? fallback.profile_photo ?? null,
    phone_number: null,
    preferences: {},
    is_verified: identity.emailVerified ?? false,
    push_tokens: [],
    last_login: Date.now(),
  });
  return (await ctx.db.get(id))!;
}

/** For mutations: the signed-in user, created on first use. */
export async function requireUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) fail("Unauthorized");
  return (await userBySubject(ctx, identity.subject)) ?? (await upsertUser(ctx, identity));
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) fail("Unauthorized: Not authenticated");
  const user = await userBySubject(ctx, identity.subject);
  if (!user) fail("User not found in database");
  if (!isAdminRole(roleOf(identity, user))) fail("Forbidden: Admin access required");
  return user;
}

/** Admin who also owns the venue (sections and seats are venue-scoped). */
export async function requireVenueOwner(
  ctx: QueryCtx | MutationCtx,
  venueId: Doc<"venues">["_id"],
  message = "Forbidden: You don't own this venue",
) {
  const admin = await requireAdmin(ctx);
  const venue = await ctx.db.get(venueId);
  if (!venue || venue.admin_id !== admin._id) fail(message);
  return { admin, venue };
}

export function paginate<T>(items: T[], page?: number, limit?: number, defaultLimit = 20) {
  const p = Math.max(1, Math.floor(page ?? 1));
  const l = Math.max(1, Math.floor(limit ?? defaultLimit));
  return { page: p, limit: l, total: items.length, items: items.slice((p - 1) * l, p * l) };
}
