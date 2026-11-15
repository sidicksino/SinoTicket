import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { fail, requireAdmin } from "./lib";

/** Admin image upload, step 1: get a one-time URL to POST the file to. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Step 2: exchange the storage id returned by the upload for a public URL. */
export const getUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await requireAdmin(ctx);
    const imageUrl = await ctx.storage.getUrl(storageId);
    if (!imageUrl) fail("Uploaded file not found");
    return { imageUrl, public_id: storageId };
  },
});
