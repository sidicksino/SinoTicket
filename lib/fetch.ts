import { useAuth } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

// Cache utility helpers
const CACHE_PREFIX = "sinoticket_cache_";

export const fetchAPI = async (url: string, options?: RequestInit) => {
  const fullUrl = `${baseUrl}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;

      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
      } else {
        errorData = { message: errorText };
      }

      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Check if response is actually JSON before parsing
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      console.warn(`[fetchAPI] Expected JSON but got: ${text.slice(0, 50)}... at ${fullUrl}`);
      // If it's the root message, we can handle it or throw a descriptive error
      if (text.startsWith("SinoTicket Backend")) {
        throw new Error("API hit the root server instead of an endpoint. Check your URL paths.");
      }
      throw new Error("Server returned non-JSON response. Check backend logs.");
    }
  } catch (error: any) {
    if (error.name !== "AbortError" && !error.message?.includes("aborted")) {
      console.error(`[fetchAPI] Error fetching ${fullUrl}:`, error);
    }
    throw error;
  }
};

// Hook for authenticated requests - automatically attaches Clerk JWT
export const useAuthFetch = () => {
  const { getToken } = useAuth();

  const authFetch = useCallback(async (url: string, options?: RequestInit) => {
    const token = await getToken();
    if (!token) {
      throw new Error("Session expired. Please sign in again.");
    }
    return fetchAPI(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }, [getToken]);

  return { authFetch };
};

interface FetchOptions {
  authenticated?: boolean;
  cacheKey?: string;
  autoFetch?: boolean;
}

// Generic hook to fetch data from any API endpoint with optional caching
export const useFetch = <T>(url: string, options: FetchOptions | boolean = false) => {
  const { getToken, isLoaded } = useAuth();

  // Normalize options
  const isAuth = typeof options === "boolean" ? options : !!options.authenticated;
  const cacheKey = typeof options === "object" ? options.cacheKey : undefined;
  const autoFetch = typeof options === "object" ? (options.autoFetch ?? true) : true;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  // Persistence Key
  const storageKey = cacheKey ? `${CACHE_PREFIX}${cacheKey}` : null;

  const load = useCallback(async (signal?: AbortSignal) => {
    // If auth is required but Clerk hasn't loaded yet, don't fetch yet
    if (isAuth && !isLoaded) {
      return;
    }

    if (!url) {
      setLoading(false);
      return;
    }

    try {
      if (!data) setLoading(true); // Only show full loading if we have no data at all
      setIsRevalidating(true);
      setError(null);

      // 1. Try to load from cache first for instant UI (if we don't have data yet)
      if (storageKey && !data) {
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setData(parsed);
          } catch (e) {
            console.warn("[useFetch] Cache parse error:", e);
          }
        }
      }

      // 2. Network Fetch
      let headers: Record<string, string> = {};

      if (isAuth) {
        const token = await getToken();
        if (!token) {
          throw new Error("No auth token found");
        }
        headers.Authorization = `Bearer ${token}`;
      }

      const result = await fetchAPI(url, { headers, signal });

      if (!result) {
        throw new Error("Empty response from server");
      }

      // 3. Success -> Update state and persist
      setData(result);
      setIsOffline(false);
      setError(null);

      if (storageKey) {
        AsyncStorage.setItem(storageKey, JSON.stringify(result)).catch(e =>
          console.error("[useFetch] Cache save error:", e)
        );
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        return;
      }

      // 4. On Error -> Use cached data if available, otherwise show error
      if (!data) {
        setError(err.message || "Something went wrong");
      } else {
        // We have cached data but network failed -> Show offline banner
        setIsOffline(true);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setIsRevalidating(false);
      }
    }
  }, [url, isAuth, getToken, isLoaded, storageKey, data]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (autoFetch) {
      if (isAuth && !isLoaded) {
        return;
      }

      const controller = new AbortController();

      // Reset only if we don't have a cacheKey to avoid flickering
      if (!cacheKey) {
        setData(null);
        setLoading(true);
        setError(null);
      }

      load(controller.signal);

      return () => {
        controller.abort();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, isAuth, isLoaded, cacheKey, autoFetch]);

  const refetch = useCallback(() => loadRef.current(), []);

  return { data, loading, error, isOffline, isRevalidating, refetch };
};
