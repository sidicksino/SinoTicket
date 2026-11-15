/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as lib from "../lib.js";
import type * as notifications from "../notifications.js";
import type * as push from "../push.js";
import type * as reservations from "../reservations.js";
import type * as seats from "../seats.js";
import type * as sections from "../sections.js";
import type * as seed from "../seed.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";
import type * as venues from "../venues.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  dashboard: typeof dashboard;
  events: typeof events;
  files: typeof files;
  lib: typeof lib;
  notifications: typeof notifications;
  push: typeof push;
  reservations: typeof reservations;
  seats: typeof seats;
  sections: typeof sections;
  seed: typeof seed;
  tickets: typeof tickets;
  users: typeof users;
  venues: typeof venues;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
