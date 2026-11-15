import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { fail, requireAdmin, stamp } from "./lib";

const venueFields = {
  name: v.string(),
  location: v.string(),
  capacity: v.number(),
  map_data: v.optional(v.any()),
};

function validate(args: { name?: string; location?: string; capacity?: number }) {
  if (args.name !== undefined && args.name.trim().length < 2)
    fail("Name must be at least 2 characters");
  if (args.location !== undefined && args.location.trim().length < 5)
    fail("Location must be at least 5 characters");
  if (args.capacity !== undefined && (!Number.isInteger(args.capacity) || args.capacity <= 0))
    fail("Capacity must be a positive number");
}

export const list = query({
  args: { admin_id: v.optional(v.id("users")), id: v.optional(v.id("venues")) },
  handler: async (ctx, args) => {
    let venues = args.id
      ? [await ctx.db.get(args.id)].filter((x) => x !== null)
      : await ctx.db.query("venues").collect();
    if (args.admin_id) venues = venues.filter((x) => x.admin_id === args.admin_id);
    return {
      venues: await Promise.all(
        venues.map(async (venue) => {
          const admin = await ctx.db.get(venue.admin_id);
          return {
            ...stamp(venue),
            admin_id: admin ? { _id: admin._id, name: admin.name, email: admin.email } : null,
          };
        }),
      ),
    };
  },
});

export const add = mutation({
  args: venueFields,
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    validate(args);
    const id = await ctx.db.insert("venues", { ...args, admin_id: admin._id });
    return { venue: stamp((await ctx.db.get(id))!) };
  },
});

export const update = mutation({
  args: {
    id: v.id("venues"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    capacity: v.optional(v.number()),
    map_data: v.optional(v.any()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireAdmin(ctx);
    validate(fields);
    if (!(await ctx.db.get(id))) fail("Venue not found");
    await ctx.db.patch(id, fields);
    return { venue: stamp((await ctx.db.get(id))!) };
  },
});

export const remove = mutation({
  args: { id: v.id("venues") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    if (!(await ctx.db.get(id))) fail("Venue not found");
    await ctx.db.delete(id);
    return { message: "Venue deleted successfully" };
  },
});
