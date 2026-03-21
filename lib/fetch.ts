export const fetchAPI = async (url: string, options?: RequestInit) => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
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
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch API Error:", error);
    throw error;
  }
};
