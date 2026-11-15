import { ConvexReactClient } from "convex/react";
import { anyApi } from "convex/server";
import { ConvexError } from "convex/values";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error("Missing VITE_CONVEX_URL in environment variables");
}

/** Shared Convex client. Auth is attached by ConvexProviderWithClerk in main.tsx. */
export const convex = new ConvexReactClient(convexUrl);

/**
 * References to the backend functions in /convex (e.g. api.events.list).
 * Untyped on purpose so the dashboard builds on its own, without the
 * repo-root node_modules that the generated types depend on.
 */
export const api = anyApi;

/** Human-readable message from a Convex error (strips the transport noise). */
export function errorMessage(err: unknown): string {
  if (err instanceof ConvexError) {
    return typeof err.data === "string" ? err.data : JSON.stringify(err.data);
  }
  const message = err instanceof Error ? err.message : String(err);
  const match = message.match(/Uncaught (?:Convex)?Error: (.*?)(?:\n|$)/);
  return match ? match[1] : message;
}

/**
 * Awaits a Convex call and reports the outcome as a value instead of throwing:
 *   const data = await call(convex.mutation(api.venues.add, {...}));
 *   if (data.success) { ... } else { setError(data.message); }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function call(request: Promise<any>): Promise<any> {
  try {
    return { success: true, ...(await request) };
  } catch (err) {
    return { success: false, message: errorMessage(err) };
  }
}
