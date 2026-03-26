import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";

const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001";

export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch API Error:", error);
    throw error;
  }
};

// Hook for authenticated requests - automatically attaches Clerk JWT
export const useAuthFetch = () => {
  const { getToken } = useAuth();

  const authFetch = useCallback(async (url: string, options?: RequestInit) => {
    const token = await getToken();
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
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let headers: Record<string, string> = {};
      if (authenticated) {
        const token = await getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const result = await fetchAPI(url, { headers });
      setData(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [url, authenticated, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};
