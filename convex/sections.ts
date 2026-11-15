import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { fail, requireVenueOwner, stamp } from "./lib";

export const list = query({
  args: {
    venue_id: v.optional(v.string()),
    parent_section_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const venueId = args.venue_id ? ctx.db.normalizeId("venues", args.venue_id) : null;
    let sections = venueId
      ? await ctx.db
          .query("sections")
          .withIndex("by_venue_name", (q) => q.eq("venue_id", venueId))
          .collect()
      : await ctx.db.query("sections").collect();
    if (args.parent_section_id) {
      sections = sections.filter((s) => s.parent_section_id === args.parent_section_id);
    }
    const populated = await Promise.all(
      sections.map(async (section) => {
        const venue = await ctx.db.get(section.venue_id);
        return {
          ...stamp(section),
          venue_id: venue
            ? { _id: venue._id, name: venue.name, location: venue.location }
            : null,
        };
      }),
    );
    return { count: populated.length, sections: populated };
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const sectionId = ctx.db.normalizeId("sections", id);
    const section = sectionId ? await ctx.db.get(sectionId) : null;
    if (!section) return { section: null };
    const venue = await ctx.db.get(section.venue_id);
    return {
      section: {
        ...stamp(section),
        venue_id: venue ? { _id: venue._id, name: venue.name } : null,
      },
    };
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    venue_id: v.id("venues"),
    parent_section_id: v.optional(v.union(v.id("sections"), v.null())),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) fail("Missing required fields: name, venue_id");
    if (name.length > 100) fail("Section name is too long (max 100 characters)");
    if (!(await ctx.db.get(args.venue_id))) fail("Venue not found");
    await requireVenueOwner(ctx, args.venue_id, "Not your venue: Ownership required");

    const existing = await ctx.db
      .query("sections")
      .withIndex("by_venue_name", (q) => q.eq("venue_id", args.venue_id).eq("name", name))
      .first();
    if (existing) fail("Section already exists in this venue");

    if (args.parent_section_id) {
      const parent = await ctx.db.get(args.parent_section_id);
      if (!parent) fail("Parent Section not found");
      if (parent.venue_id !== args.venue_id) fail("Parent must be in the same venue");
    }

    const id = await ctx.db.insert("sections", {
      name,
      description: args.description,
      venue_id: args.venue_id,
      parent_section_id: args.parent_section_id ?? null,
      seat_count: 0,
    });
    return { section: stamp((await ctx.db.get(id))!) };
  },
});

export const update = mutation({
  args: {
    id: v.id("sections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, description }) => {
    const section = await ctx.db.get(id);
    if (!section) fail("Section not found");
    await requireVenueOwner(ctx, section.venue_id);

    const patch: { name?: string; description?: string } = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) fail("Section name cannot be empty");
      const clash = await ctx.db
        .query("sections")
        .withIndex("by_venue_name", (q) =>
          q.eq("venue_id", section.venue_id).eq("name", trimmed),
        )
        .first();
      if (clash && clash._id !== id) fail("Section already exists in this venue");
      patch.name = trimmed;
    }
    if (description !== undefined) patch.description = description;
    await ctx.db.patch(id, patch);
    return { section: stamp((await ctx.db.get(id))!) };
  },
});

async function deleteTree(ctx: MutationCtx, sectionId: Id<"sections">) {
  const children = await ctx.db
    .query("sections")
    .withIndex("by_parent", (q) => q.eq("parent_section_id", sectionId))
    .collect();
  for (const child of children) await deleteTree(ctx, child._id);
  await ctx.db.delete(sectionId);
  // Seats can number in the tens of thousands, so they are purged in batches.
  await ctx.scheduler.runAfter(0, internal.seats.purgeSection, { section_id: sectionId });
}

/** Deletes a section, its sub-sections, and (in the background) their seats. */
export const remove = mutation({
  args: { id: v.id("sections") },
  handler: async (ctx, { id }) => {
    const section = await ctx.db.get(id);
    if (!section) fail("Section not found");
    await requireVenueOwner(ctx, section.venue_id);
    await deleteTree(ctx, id);
    return { message: "Section and all its sub-elements deleted successfully" };
  },
});
