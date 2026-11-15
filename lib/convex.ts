import { api } from "@/convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ConvexReactClient,
  useAction,
  useConvexAuth,
  useConvexConnectionState,
  useMutation,
  useQueries,
} from "convex/react";
import {
  getFunctionName,
  type FunctionArgs,
  type FunctionReference,
  type FunctionReturnType,
} from "convex/server";
import { ConvexError } from "convex/values";
import { useCallback, useEffect, useMemo, useState } from "react";

export { api };

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.warn(
    "Missing EXPO_PUBLIC_CONVEX_URL. Run `npx convex dev` to create .env.local.",
  );
}

export const convex = new ConvexReactClient(
  convexUrl ?? "https://missing-convex-url.invalid",
  { unsavedChangesWarning: false },
);

const CACHE_PREFIX = "sinoticket_cache_";

/** Human-readable message from a Convex error (strips the transport noise). */
export const errorMessage = (err: unknown): string => {
  if (err instanceof ConvexError) {
    return typeof err.data === "string" ? err.data : JSON.stringify(err.data);
  }
  const message = err instanceof Error ? err.message : String(err);
  const match = message.match(/Uncaught (?:Convex)?Error: (.*?)(?:\n|$)/);
  return match ? match[1] : message;
};

const rethrowClean = (err: unknown): never => {
  throw new Error(errorMessage(err));
};

/** useMutation whose rejections carry a clean, displayable message. */
export const useApiMutation = <M extends FunctionReference<"mutation">>(ref: M) => {
  const run = useMutation(ref);
  return useCallback(
    (args: FunctionArgs<M>): Promise<FunctionReturnType<M>> =>
      (run as any)(args).catch(rethrowClean),
    [run],
  );
};

/** useAction whose rejections carry a clean, displayable message. */
export const useApiAction = <A extends FunctionReference<"action">>(ref: A) => {
  const run = useAction(ref);
  return useCallback(
    (args: FunctionArgs<A>): Promise<FunctionReturnType<A>> =>
      (run as any)(args).catch(rethrowClean),
    [run],
  );
};

interface LiveQueryOptions {
  /** Wait for the Clerk session to reach Convex before subscribing. */
  authenticated?: boolean;
  /** Persist the latest result so the screen can render while offline. */
  cacheKey?: string;
}

/**
 * Live Convex query with an offline cache.
 *
 * `data` updates automatically whenever the underlying data changes, so there
 * is nothing to refetch. Pass "skip" as args to pause the subscription.
 */
export const useLiveQuery = <Q extends FunctionReference<"query">>(
  ref: Q,
  args: FunctionArgs<Q> | "skip",
  options: LiveQueryOptions = {},
) => {
  type Result = FunctionReturnType<Q>;
  const { isAuthenticated } = useConvexAuth();
  const connection = useConvexConnectionState();

  const skip = args === "skip" || (!!options.authenticated && !isAuthenticated);
  const argsKey = args === "skip" ? "skip" : JSON.stringify(args);

  const queries = useMemo(
    () => (skip ? {} : { q: { query: ref, args: JSON.parse(argsKey) } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skip, argsKey],
  );
  const result = (useQueries(queries as any) as Record<string, unknown>).q;
  const failed = result instanceof Error;
  const live = failed ? undefined : (result as Result | undefined);

  const storageKey = options.cacheKey
    ? `${CACHE_PREFIX}${options.cacheKey}`
    : args === "skip"
      ? null
      : `${CACHE_PREFIX}${getFunctionName(ref)}:${argsKey}`;

  const [cached, setCached] = useState<{ key: string; value: Result } | null>(null);

  useEffect(() => {
    if (!storageKey) return;
    let active = true;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (active && raw) setCached({ key: storageKey, value: JSON.parse(raw) });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || live === undefined) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(live)).catch(() => {});
  }, [storageKey, live]);

  const fallback = cached && cached.key === storageKey ? cached.value : null;
  const data: Result | null = live !== undefined ? live : fallback;
  const waiting = live === undefined && !failed;

  const refetch = useCallback(async () => {}, []);

  return {
    data,
    loading: data === null && waiting,
    error: failed && data === null ? errorMessage(result) : null,
    isOffline: waiting && fallback !== null && !connection.isWebSocketConnected,
    isRevalidating: waiting && !skip,
    hasFetched: live !== undefined || failed,
    refetch,
  };
};
