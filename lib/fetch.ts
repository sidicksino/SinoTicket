import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useRef, useState } from "react";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

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

// Generic hook to fetch data from any API endpoint
export const useFetch = <T>(url: string, authenticated = false) => {
  const { getToken, isLoaded } = useAuth();

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    // If auth is required but Clerk hasn't loaded yet, don't fetch yet
    if (authenticated && !isLoaded) {
      return;
    }

    if (!url) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let headers: Record<string, string> = {};

      if (authenticated) {
        const token = await getToken();

        if (!token) {
          throw new Error("No auth token found");
        }

        headers.Authorization = `Bearer ${token}`;
      }

      const result = await fetchAPI(url, { headers, signal });

      // 🔥 SAFE DATA
      if (!result) {
        throw new Error("Empty response from server");
      }

      setData(result);
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        console.log(`[fetchAPI] Request aborted: ${url}`);
        return;
      }
      console.log("USEFETCH ERROR:", err.message);
      setError(err.message || "Something went wrong");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [url, authenticated, getToken, isLoaded]);

  // Keep a ref to the latest load function so refetch is always stable
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (authenticated && !isLoaded) {
      return; // wait until clerk is ready
    }

    const controller = new AbortController();
    load(controller.signal);

    return () => {
      controller.abort();
    };
  }, [url, authenticated, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stable refetch function that never changes identity
  const refetch = useCallback(() => loadRef.current(), []);

  return { data, loading, error, refetch };
};
